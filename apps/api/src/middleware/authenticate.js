import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedException } from '../core/errors.js';

export default function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header.');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  } catch (error) {
    next(error);
  }
}
