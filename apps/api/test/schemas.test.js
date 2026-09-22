import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
} from "../src/modules/auth/auth.schemas.js";
import {
  updateProfileSchema,
  paramsIdSchema,
} from "../src/modules/users/users.schemas.js";
import { categorySlugSchema } from "../src/modules/categories/categories.schemas.js";

describe("Validation Schemas", () => {
  describe("Auth Schemas", () => {
    it("validates correct register payload", () => {
      const valid = {
        email: "User@Example.com",
        password: "Password123!",
        name: "John Doe",
      };
      const parsed = registerSchema.parse(valid);
      expect(parsed.email).toBe("user@example.com");
      expect(parsed.name).toBe("John Doe");
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = {
        email: "user@example.com",
        password: "123",
        name: "John Doe",
      };
      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it("validates login payload", () => {
      const valid = { email: "test@example.com", password: "pass" };
      const parsed = loginSchema.parse(valid);
      expect(parsed.email).toBe("test@example.com");
    });
  });

  describe("Users Schemas", () => {
    it("validates partial update profile", () => {
      const valid = { name: "New Name", bio: "Tech enthusiast" };
      const parsed = updateProfileSchema.parse(valid);
      expect(parsed.name).toBe("New Name");
      expect(parsed.bio).toBe("Tech enthusiast");
    });

    it("rejects empty profile update", () => {
      expect(() => updateProfileSchema.parse({})).toThrow();
    });

    it("validates UUID params id", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const parsed = paramsIdSchema.parse({ id: validUuid });
      expect(parsed.id).toBe(validUuid);
    });

    it("rejects invalid UUID in params id", () => {
      expect(() => paramsIdSchema.parse({ id: "invalid-id" })).toThrow();
    });
  });

  describe("Category Schemas", () => {
    it("validates valid category slug", () => {
      const parsed = categorySlugSchema.parse({ slug: "power-tools" });
      expect(parsed.slug).toBe("power-tools");
    });

    it("rejects empty category slug", () => {
      expect(() => categorySlugSchema.parse({ slug: "" })).toThrow();
    });
  });
});
