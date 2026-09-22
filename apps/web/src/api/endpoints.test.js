import { describe, it, expect } from "vitest";
import { authApi, usersApi, categoriesApi, itemsApi } from "./endpoints.js";

describe("Endpoints mapping", () => {
  it("exposes all auth API methods", () => {
    expect(authApi).toHaveProperty("register");
    expect(authApi).toHaveProperty("login");
    expect(authApi).toHaveProperty("refresh");
    expect(authApi).toHaveProperty("logout");
  });

  it("exposes all users API methods", () => {
    expect(usersApi).toHaveProperty("getMe");
    expect(usersApi).toHaveProperty("updateMe");
    expect(usersApi).toHaveProperty("getPublicProfile");
    expect(usersApi).toHaveProperty("getMyItems");
  });

  it("exposes all categories API methods", () => {
    expect(categoriesApi).toHaveProperty("list");
    expect(categoriesApi).toHaveProperty("getBySlug");
  });

  it("exposes all items API methods", () => {
    expect(itemsApi).toHaveProperty("list");
    expect(itemsApi).toHaveProperty("getById");
  });
});
