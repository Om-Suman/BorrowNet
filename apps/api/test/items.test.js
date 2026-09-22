import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { listItemsQuerySchema } from "../src/modules/items/items.schemas.js";

describe("Items Catalog Schema and Endpoints", () => {
  it("validates list items query defaults", () => {
    const parsed = listItemsQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it("validates query with category and search filter", () => {
    const parsed = listItemsQuerySchema.parse({
      q: "camera",
      category: "video-film",
      condition: "LIKE_NEW",
      page: "2",
      limit: "10",
    });
    expect(parsed.q).toBe("camera");
    expect(parsed.category).toBe("video-film");
    expect(parsed.condition).toBe("LIKE_NEW");
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(10);
  });

  it("serves GET /api/v1/items returning paginated data", async () => {
    const res = await request(app).get("/api/v1/items");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("page");
  });
});
