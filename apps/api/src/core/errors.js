export class DomainException extends Error {
  constructor(message, code, status = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundException extends DomainException {
  constructor(resource, identifier) {
    super(`${resource} not found`, `${resource.toUpperCase()}_NOT_FOUND`, 404, { identifier });
  }
}

export class ConflictException extends DomainException {
  constructor(message, code = 'RESOURCE_CONFLICT') {
    super(message, code, 409);
  }
}

export class ValidationException extends DomainException {
  constructor(details) {
    super('Validation failed', 'VALIDATION_ERROR', 422, details);
  }
}

export class BadRequestException extends DomainException {
  constructor(message) {
    super(message, 'BAD_REQUEST', 400);
  }
}

export class RateLimitExceededException extends DomainException {
  constructor(retryAfterSeconds) {
    super('Too many requests, please try again later.', 'RATE_LIMIT_EXCEEDED', 429, { retryAfterSeconds });
  }
}

export class ServiceUnavailableException extends DomainException {
  constructor(message = 'Service unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}
