import { describe, it, expect, beforeEach } from "vitest";
import { setAccessToken, getAccessToken } from "./client.js";

describe("API Client Auth State", () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it("initializes with null access token", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("updates in-memory access token correctly", () => {
    setAccessToken("mock-token-xyz");
    expect(getAccessToken()).toBe("mock-token-xyz");
  });

  it("clears token when set to null", () => {
    setAccessToken("temp-token");
    expect(getAccessToken()).toBe("temp-token");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
