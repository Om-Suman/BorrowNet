import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import {
  createItemSchema,
  listItemsQuerySchema,
  updateItemSchema,
} from "../src/modules/items/items.schemas.js";

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

  it("validates item creation fields and image URLs", () => {
    const parsed = createItemSchema.parse({
      title: "Cordless drill",
      description: "A working drill with charger and two batteries.",
      categoryId: "8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e",
      condition: "GOOD",
      pricePerDay: "150",
      images: ["https://example.com/drill.jpg"],
    });
    expect(parsed.pricePerDay).toBe(150);
    expect(() => createItemSchema.parse({ ...parsed, images: ["not-a-url"] })).toThrow();
  });

  it("requires at least one valid field when updating an item", () => {
    expect(() => updateItemSchema.parse({})).toThrow();
    expect(updateItemSchema.parse({ status: "PAUSED" })).toEqual({ status: "PAUSED" });
    expect(() => updateItemSchema.parse({ status: "REMOVED" })).toThrow();
  });

  it("serves GET /api/v1/items returning paginated data", async () => {
    const res = await request(app).get("/api/v1/items");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("page");
  });

  it("keeps text catalog search available when the recommender is not configured", async () => {
    const res = await request(app).get("/api/v1/items?q=camera");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("meta");
  });

  it("requires authentication for item management routes", async () => {
    const create = await request(app).post("/api/v1/items").send({});
    const update = await request(app).patch("/api/v1/items/8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e").send({ title: "Changed" });
    const remove = await request(app).delete("/api/v1/items/8f2463f8-3e81-4ac7-b3e1-0fb46229bf2e");
    expect(create.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
  });
});
