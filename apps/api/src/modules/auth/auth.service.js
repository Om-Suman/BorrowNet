import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../core/prisma.js';
import { getRedis } from '../../core/redis.js';
import config from '../../config/index.js';
import { ConflictException, UnauthorizedException, ForbiddenException } from '../../core/errors.js';

function stripUser(user) {
  const { passwordHash, ...rest } = user;
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

  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  
  const refreshToken = jwt.sign(
    { sessionId, userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiryDays + 'd' }
  );

  const redis = getRedis();
  if (redis) {
    const sessionData = JSON.stringify({ userId: user.id, tokenHash: hashToken(refreshToken) });
    await redis.setex(`session:${sessionId}`, config.jwt.refreshExpiryDays * 86400, sessionData);
  }

  return { user: stripUser(user), accessToken, refreshToken };
}

export async function login(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new UnauthorizedException('Invalid email or password.');
  }

  if (user.isSuspended) {
    throw new ForbiddenException('Your account has been suspended.');
  }

  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  
  const refreshToken = jwt.sign(
    { sessionId, userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiryDays + 'd' }
  );

  const redis = getRedis();
  if (redis) {
    const sessionData = JSON.stringify({ userId: user.id, tokenHash: hashToken(refreshToken) });
    await redis.setex(`session:${sessionId}`, config.jwt.refreshExpiryDays * 86400, sessionData);
  }

  return { user: stripUser(user), accessToken, refreshToken };
}

export async function refreshSession(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw new UnauthorizedException('Invalid refresh token.');
  }

  const redis = getRedis();
  if (!redis) {
    // Graceful degradation: If Redis is down, we still check the JWT and issue new token,
    // though we can't enforce revocation.
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.isSuspended) throw new UnauthorizedException('Session expired.');
    const accessToken = generateAccessToken(user);
    const newSessionId = crypto.randomUUID();
    const newRefreshToken = jwt.sign({ sessionId: newSessionId, userId: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiryDays + 'd' });
    return { accessToken, refreshToken: newRefreshToken };
  }

  const sessionKey = `session:${payload.sessionId}`;
  let sessionStr = await redis.get(sessionKey);
  
  if (!sessionStr) {
    const graceKey = `session:grace:${payload.sessionId}`;
    sessionStr = await redis.get(graceKey);
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

  await redis.setex(`session:${newSessionId}`, config.jwt.refreshExpiryDays * 86400, JSON.stringify({ userId: user.id, tokenHash: hashToken(newRefreshToken) }));
  await redis.setex(`session:grace:${payload.sessionId}`, 15, sessionStr);
  await redis.del(sessionKey);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const redis = getRedis();
    if (redis) {
      await redis.del(`session:${payload.sessionId}`);
      await redis.del(`session:grace:${payload.sessionId}`);
    }
  } catch (err) {
    // Ignore invalid tokens on logout
  }
}
