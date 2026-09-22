import { Router } from 'express';
import * as authService from '../modules/auth/auth.service.js';
import { registerSchema, loginSchema } from '../modules/auth/auth.schemas.js';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { success, created } from '../core/response.js';
import config from '../config/index.js';

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: config.jwt.refreshExpiryDays * 24 * 60 * 60 * 1000
};

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    created(res, { user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    success(res, { user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing refresh token.' } });
    }
    const result = await authService.refreshSession(refreshToken);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    success(res, { accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await authService.logout(refreshToken);
    res.clearCookie('refreshToken', cookieOptions);
    success(res, { message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
