import { describe, it, expect, vi } from "vitest";
import {
  success,
  created,
  paginated,
  noContent,
} from "../src/core/response.js";

describe("Response Envelopes", () => {
  it("formats success response with { data } envelope", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    success(res, { item: "Camera" }, 200);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { item: "Camera" } });
  });

  it("formats created response with 201 status", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    created(res, { id: "1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: { id: "1" } });
  });

  it("formats paginated response with data and meta", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const meta = { page: 1, limit: 10, total: 100, totalPages: 10 };
    paginated(res, [{ id: "1" }], meta);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: "1" }],
      meta,
    });
  });

  it("handles noContent response with 204 status", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    noContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
