import { DomainException } from '../core/errors.js';
import logger from '../core/logger.js';
import { ZodError } from 'zod';

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  if (err instanceof DomainException) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
        ...(err.details && { details: err.details })
      }
    });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        requestId: req.requestId,
        details: err.errors
      }
    });
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack, requestId: req.requestId });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      requestId: req.requestId
    }
  });
}
