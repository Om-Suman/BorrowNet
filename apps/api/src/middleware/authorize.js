import { ForbiddenException } from '../core/errors.js';

export default function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenException('You do not have permission to perform this action.'));
    }
    next();
  };
}
