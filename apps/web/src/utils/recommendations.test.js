import { describe, expect, it } from "vitest";
import { selectUniqueRecommendations } from "./recommendations.js";

describe("selectUniqueRecommendations", () => {
  it("excludes listings already visible in search results", () => {
    const visibleItems = [{ id: "camera-1" }, { id: "camera-2" }];
    const recommendations = [
      { id: "camera-1" },
      { id: "camera-2" },
      { id: "lens-1" },
    ];

    expect(selectUniqueRecommendations(recommendations, visibleItems)).toEqual([
      { id: "lens-1" },
    ]);
  });

  it("fills the requested number of slots from later unique recommendations", () => {
    const visibleItems = [{ id: "camera-1" }];
    const recommendations = [
      { id: "camera-1" },
      { id: "lens-1" },
      { id: "tripod-1" },
      { id: "light-1" },
    ];

    expect(selectUniqueRecommendations(recommendations, visibleItems, 2)).toEqual([
      { id: "lens-1" },
      { id: "tripod-1" },
    ]);
  });
});
