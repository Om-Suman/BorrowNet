import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken(options) {
      return mocks.verifyIdToken(options);
    }
  },
}));

vi.mock("../src/config/index.js", () => ({
  default: {
    google: { clientId: "borrownet-test.apps.googleusercontent.com" },
    jwt: {
      secret: "access-secret-for-google-auth-tests",
      refreshSecret: "refresh-secret-for-google-auth-tests",
      accessExpiry: "15m",
      refreshExpiryDays: 14,
    },
    isTest: false,
  },
}));

vi.mock("../src/core/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
    },
  },
}));

const { googleAuth, login } = await import("../src/modules/auth/auth.service.js");

const identityPayload = {
  sub: "google-sub-123",
  email: "Borrower@Example.com",
  email_verified: true,
  name: "Borrower Example",
  picture: "https://example.com/profile.jpg",
};

function mockVerifiedToken(payload = identityPayload) {
  mocks.verifyIdToken.mockResolvedValue({ getPayload: () => payload });
}

describe("Google authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies the audience, creates a new user from verified claims, and uses the existing session format", async () => {
    mockVerifiedToken();
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockImplementation(({ data }) => ({ id: "new-user-id", role: "USER", ...data }));

    const result = await googleAuth({ credential: "signed-google-token" });

    expect(mocks.verifyIdToken).toHaveBeenCalledWith({
      idToken: "signed-google-token",
      audience: "borrownet-test.apps.googleusercontent.com",
    });
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        googleId: "google-sub-123",
        email: "borrower@example.com",
        name: "Borrower Example",
        avatarUrl: "https://example.com/profile.jpg",
        isVerified: true,
      }),
    });
    expect(result.user).toMatchObject({ id: "new-user-id", email: "borrower@example.com" });
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.user.googleId).toBeUndefined();
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it("links a verified Google identity to the existing email without changing its password", async () => {
    mockVerifiedToken();
    const existingUser = {
      id: "existing-user-id",
      email: "borrower@example.com",
      name: "Local Account Name",
      passwordHash: "existing-password-hash",
      googleId: null,
      avatarUrl: null,
      isVerified: false,
      isSuspended: false,
      role: "USER",
    };
    mocks.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);
    mocks.update.mockImplementation(({ data }) => ({ ...existingUser, ...data }));

    const result = await googleAuth({ credential: "signed-google-token" });

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "existing-user-id" },
      data: expect.objectContaining({ googleId: "google-sub-123", isVerified: true }),
    });
    expect(result.user.id).toBe("existing-user-id");
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.user.googleId).toBeUndefined();
    expect(mocks.update.mock.results[0].value.passwordHash).toBe("existing-password-hash");
  });

  it("keeps existing email/password login on the shared session creation path", async () => {
    const bcrypt = await import("bcryptjs");
    const user = {
      id: "password-user-id",
      email: "password@example.com",
      name: "Password User",
      passwordHash: await bcrypt.hash("Password123!", 4),
      isSuspended: false,
      role: "USER",
      googleId: null,
    };
    mocks.findUnique.mockResolvedValue(user);

    const result = await login({ email: user.email, password: "Password123!" });

    expect(result.user).toMatchObject({ id: user.id, email: user.email });
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it("rejects invalid credentials without looking up or creating a user", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("verification failed"));

    await expect(googleAuth({ credential: "invalid-token" })).rejects.toMatchObject({ status: 401 });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects Google tokens whose email is not verified", async () => {
    mockVerifiedToken({ ...identityPayload, email_verified: false });

    await expect(googleAuth({ credential: "signed-but-unverified-token" })).rejects.toMatchObject({ status: 401 });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects a different Google subject already linked to the same email", async () => {
    mockVerifiedToken();
    mocks.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "existing-user-id",
      email: "borrower@example.com",
      googleId: "different-google-sub",
      isVerified: true,
      isSuspended: false,
    });

    await expect(googleAuth({ credential: "signed-google-token" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
