import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../core/prisma.js';
import config from '../../config/index.js';
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  ServiceUnavailableException,
} from '../../core/errors.js';

const googleOAuthClient = new OAuth2Client();

// In-memory session store replacing Redis for local/standalone operation
const sessionStore = new Map();

// Periodic cleanup of expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of sessionStore.entries()) {
    if (record.expiresAt && now > record.expiresAt) {
      sessionStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

function saveSession(key, data, ttlSeconds) {
  sessionStore.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getSession(key) {
  const record = sessionStore.get(key);
  if (!record) return null;
  if (record.expiresAt && Date.now() > record.expiresAt) {
    sessionStore.delete(key);
    return null;
  }
  return record.data;
}

function deleteSession(key) {
  sessionStore.delete(key);
}

function stripUser(user) {
  const { passwordHash, googleId, ...rest } = user;
  return rest;
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createSession(user) {
  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(
    { sessionId, userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiryDays + 'd' }
  );
  const sessionData = JSON.stringify({ userId: user.id, tokenHash: hashToken(refreshToken) });
  saveSession(`session:${sessionId}`, sessionData, config.jwt.refreshExpiryDays * 86400);

  return { user: stripUser(user), accessToken, refreshToken };
}

export async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictException('A user with this email already exists.', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
    }
  });

  return createSession(user);
}

export async function login(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new UnauthorizedException('Invalid email or password.');
  }

  if (user.isSuspended) {
    throw new ForbiddenException('Your account has been suspended.');
  }

  return createSession(user);
}

export async function refreshSession(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw new UnauthorizedException('Invalid refresh token.');
  }

  const sessionKey = `session:${payload.sessionId}`;
  let sessionStr = getSession(sessionKey);
  
  if (!sessionStr) {
    const graceKey = `session:grace:${payload.sessionId}`;
    sessionStr = getSession(graceKey);
    if (!sessionStr) {
      throw new UnauthorizedException('Session expired.');
    }
  }

  const session = JSON.parse(sessionStr);
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.isSuspended) {
    throw new UnauthorizedException('Session expired.');
  }

  const newSessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const newRefreshToken = jwt.sign(
    { sessionId: newSessionId, userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiryDays + 'd' }
  );

  saveSession(`session:${newSessionId}`, JSON.stringify({ userId: user.id, tokenHash: hashToken(newRefreshToken) }), config.jwt.refreshExpiryDays * 86400);
  saveSession(`session:grace:${payload.sessionId}`, sessionStr, 15);
  deleteSession(sessionKey);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    deleteSession(`session:${payload.sessionId}`);
    deleteSession(`session:grace:${payload.sessionId}`);
  } catch (err) {
    // Ignore invalid tokens on logout
  }
}

/** Verifies signature, expiry, issuer, and configured OAuth audience with Google's verifier. */
async function verifyGoogleToken(rawToken) {
  const clientId = config.google.clientId;
  if (!clientId || clientId.startsWith('your-')) {
    throw new ServiceUnavailableException('Google sign-in is not configured on this server.');
  }

  let payload;
  try {
    const ticket = await googleOAuthClient.verifyIdToken({ idToken: rawToken, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedException('Invalid or expired Google credential.');
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new UnauthorizedException('Google did not return a verified account identity.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name?.trim() || payload.email.split('@')[0],
    avatarUrl: payload.picture || null,
  };
}

function isUniqueConstraintError(error) {
  return error?.code === 'P2002';
}

export async function googleAuth({ credential }) {
  const identity = await verifyGoogleToken(credential);

  let user = await prisma.user.findUnique({ where: { googleId: identity.googleId } });
  if (user?.isSuspended) {
    throw new ForbiddenException('Your account has been suspended.');
  }

  if (!user) {
    user = await prisma.user.findUnique({ where: { email: identity.email } });
  }

  if (user) {
    if (user.isSuspended) {
      throw new ForbiddenException('Your account has been suspended.');
    }
    if (user.googleId && user.googleId !== identity.googleId) {
      throw new ConflictException('This email is already linked to another Google account.', 'GOOGLE_ACCOUNT_CONFLICT');
    }

    if (user.googleId !== identity.googleId || !user.isVerified || (!user.avatarUrl && identity.avatarUrl)) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: identity.googleId,
            isVerified: true,
            avatarUrl: user.avatarUrl || identity.avatarUrl,
          },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
        throw new ConflictException('This Google account is already linked to another user.', 'GOOGLE_ACCOUNT_CONFLICT');
      }
    }
  } else {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);
    try {
      user = await prisma.user.create({
        data: {
          googleId: identity.googleId,
          email: identity.email,
          name: identity.name,
          avatarUrl: identity.avatarUrl,
          passwordHash,
          isVerified: true,
          reputationScore: 50,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      // A concurrent first sign-in may have created or linked this identity.
      user = await prisma.user.findUnique({ where: { googleId: identity.googleId } });
      if (!user || user.isSuspended) {
        if (user?.isSuspended) throw new ForbiddenException('Your account has been suspended.');
        throw new ConflictException('This email is already linked to another account.', 'GOOGLE_ACCOUNT_CONFLICT');
      }
    }
  }

  return createSession(user);
}
