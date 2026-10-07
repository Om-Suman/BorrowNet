import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { createRequestSchema, listRequestsQuerySchema } from "../src/modules/requests/requests.schemas.js";
import { listTransactionsQuerySchema } from "../src/modules/transactions/transactions.schemas.js";
import { createReviewSchema } from "../src/modules/reviews/reviews.schemas.js";
import { createReportSchema } from "../src/modules/reports/reports.schemas.js";
import { relatedItemsQuerySchema } from "../src/modules/recommendations/recommendations.schemas.js";

describe("Core backend module contracts", () => {
  it("validates borrow dates and request filters", () => {
    expect(createRequestSchema.safeParse({
      startDate: "2026-10-15T00:00:00.000Z",
      endDate: "2026-10-18T00:00:00.000Z",
      note: "Weekend project",
    }).success).toBe(true);
    expect(createRequestSchema.safeParse({
      startDate: "2026-10-18T00:00:00.000Z",
      endDate: "2026-10-15T00:00:00.000Z",
    }).success).toBe(false);
    expect(listRequestsQuerySchema.parse({}).role).toBe("borrower");
    expect(listRequestsQuerySchema.safeParse({ role: "admin" }).success).toBe(false);
  });

  it("validates transaction, review, and report inputs", () => {
    expect(listTransactionsQuerySchema.safeParse({ status: "ACTIVE" }).success).toBe(true);
    expect(createReviewSchema.safeParse({ rating: 5, comment: "Returned in good condition." }).success).toBe(true);
    expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(createReportSchema.safeParse({ targetType: "ITEM", targetId: "8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e", reason: "Misleading listing" }).success).toBe(true);
    expect(createReportSchema.safeParse({ targetType: "TRANSACTION", targetId: "not-a-uuid", reason: "Bad" }).success).toBe(false);
    expect(relatedItemsQuerySchema.parse({ q: "PlayStation" }).limit).toBe(6);
    expect(relatedItemsQuerySchema.safeParse({ limit: 6 }).success).toBe(false);
  });

  it("requires authentication for private module endpoints", async () => {
    const paths = [
      ["get", "/api/v1/requests"],
      ["post", "/api/v1/items/8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e/requests"],
      ["get", "/api/v1/transactions"],
      ["post", "/api/v1/transactions/8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e/reviews"],
      ["post", "/api/v1/reports"],
      ["get", "/api/v1/admin/reports"],
    ];
    for (const [method, path] of paths) {
      const response = await request(app)[method](path).send({});
      expect(response.status, `${method.toUpperCase()} ${path}`).toBe(401);
    }
  });
});
