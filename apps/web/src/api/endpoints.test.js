import { beforeEach, describe, it, expect, vi } from "vitest";
import { authApi, usersApi, categoriesApi, itemsApi, recommendationsApi, transactionsApi, reviewsApi, adminApi } from "./endpoints.js";
import { apiClient } from "./client.js";

vi.mock("./client.js", () => ({ apiClient: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

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
    expect(usersApi).toHaveProperty("getUserItems");
  });

  it("exposes all categories API methods", () => {
    expect(categoriesApi).toHaveProperty("list");
    expect(categoriesApi).toHaveProperty("getBySlug");
  });

  it("exposes all items API methods", () => {
    expect(itemsApi).toHaveProperty("list");
    expect(itemsApi).toHaveProperty("getById");
    expect(itemsApi).toHaveProperty("getAvailability");
    expect(itemsApi).toHaveProperty("createBorrowRequest");
    expect(itemsApi).toHaveProperty("create");
    expect(itemsApi).toHaveProperty("update");
    expect(itemsApi).toHaveProperty("delete");
  });

  it("calls itemsApi.create with POST and body", () => {
    const payload = { title: "Drill", pricePerDay: 300 };
    itemsApi.create(payload);

    expect(apiClient).toHaveBeenCalledWith("/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("calls itemsApi.update with PATCH and body", () => {
    const payload = { pricePerDay: 400 };
    itemsApi.update("test-item-id", payload);

    expect(apiClient).toHaveBeenCalledWith("/items/test-item-id", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  });

  it("calls itemsApi.delete with DELETE", () => {
    itemsApi.delete("test-item-id");

    expect(apiClient).toHaveBeenCalledWith("/items/test-item-id", {
      method: "DELETE",
    });
  });

  it("requests related listings for a search query", () => {
    recommendationsApi.related({ q: "cordless drill", limit: 6 });

    expect(apiClient).toHaveBeenCalledWith(
      "/recommendations/related?q=cordless+drill&limit=6",
    );
  });

  it("calls transactionsApi.markReturned with PATCH", () => {
    transactionsApi.markReturned("tx-123");
    expect(apiClient).toHaveBeenCalledWith("/transactions/tx-123/return", {
      method: "PATCH",
    });
  });

  it("calls transactionsApi.complete with PATCH", () => {
    transactionsApi.complete("tx-123");
    expect(apiClient).toHaveBeenCalledWith("/transactions/tx-123/complete", {
      method: "PATCH",
    });
  });

  it("calls reviewsApi.create with POST and body", () => {
    const payload = { rating: 5, comment: "Great gear!" };
    reviewsApi.create("tx-123", payload);
    expect(apiClient).toHaveBeenCalledWith("/transactions/tx-123/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("calls usersApi.getUserItems with user id", () => {
    usersApi.getUserItems("u-123");
    expect(apiClient).toHaveBeenCalledWith("/users/u-123/items");
  });

  it("calls adminApi methods with expected paths and bodies", () => {
    adminApi.listReports();
    expect(apiClient).toHaveBeenCalledWith("/admin/reports");

    adminApi.updateReport("rep-1", "RESOLVED");
    expect(apiClient).toHaveBeenCalledWith("/admin/reports/rep-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "RESOLVED" }),
    });

    adminApi.updateUserStatus("u-1", true);
    expect(apiClient).toHaveBeenCalledWith("/admin/users/u-1/status", {
      method: "PATCH",
      body: JSON.stringify({ isSuspended: true }),
    });

    adminApi.updateItemStatus("item-1", "REMOVED");
    expect(apiClient).toHaveBeenCalledWith("/admin/items/item-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "REMOVED" }),
    });
  });
});
