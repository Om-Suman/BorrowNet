import { describe, it, expect } from "vitest";
import {
  DomainException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ValidationException,
  BadRequestException,
  RateLimitExceededException,
  ServiceUnavailableException,
} from "../src/core/errors.js";

describe("DomainException Hierarchy", () => {
  it("instantiates UnauthorizedException correctly", () => {
    const err = new UnauthorizedException("Token invalid");
    expect(err).toBeInstanceOf(DomainException);
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Token invalid");
  });

  it("instantiates ForbiddenException correctly", () => {
    const err = new ForbiddenException("Access denied");
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Access denied");
  });

  it("instantiates NotFoundException with resource and identifier", () => {
    const err = new NotFoundException("User", "usr-123");
    expect(err.status).toBe(404);
    expect(err.code).toBe("USER_NOT_FOUND");
    expect(err.message).toBe("User not found");
    expect(err.details).toEqual({ identifier: "usr-123" });
  });

  it("instantiates ConflictException correctly", () => {
    const err = new ConflictException("Email in use", "EMAIL_TAKEN");
    expect(err.status).toBe(409);
    expect(err.code).toBe("EMAIL_TAKEN");
  });

  it("instantiates ValidationException with errors array", () => {
    const details = [{ field: "email", message: "Invalid format" }];
    const err = new ValidationException(details);
    expect(err.status).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Validation failed");
    expect(err.details).toEqual(details);
  });

  it("instantiates BadRequestException correctly", () => {
    const err = new BadRequestException("Bad input");
    expect(err.status).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("instantiates RateLimitExceededException with retry details", () => {
    const err = new RateLimitExceededException(60);
    expect(err.status).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(err.details).toEqual({ retryAfterSeconds: 60 });
  });

  it("instantiates ServiceUnavailableException correctly", () => {
    const err = new ServiceUnavailableException("Service down");
    expect(err.status).toBe(503);
    expect(err.code).toBe("SERVICE_UNAVAILABLE");
  });
});
