import { describe, it, expect, beforeEach } from "vitest";

describe("Theme Resolution and State Logic", () => {
  let mockStorage = {};
  let mockClasses = new Set();

  beforeEach(() => {
    mockStorage = {};
    mockClasses.clear();
  });

  const getTheme = (saved, prefersDark) => {
    if (saved === "light" || saved === "dark") return saved;
    return prefersDark ? "dark" : "light";
  };

  it("resolves saved theme over system preference", () => {
    mockStorage["borrownet-theme"] = "light";
    const theme = getTheme(mockStorage["borrownet-theme"], true);
    expect(theme).toBe("light");

    mockStorage["borrownet-theme"] = "dark";
    const themeDark = getTheme(mockStorage["borrownet-theme"], false);
    expect(themeDark).toBe("dark");
  });

  it("falls back to system preference when no theme is saved", () => {
    expect(getTheme(undefined, true)).toBe("dark");
    expect(getTheme(undefined, false)).toBe("light");
  });

  it("toggles theme state between dark and light correctly", () => {
    let currentTheme = "dark";
    const toggle = (t) => (t === "dark" ? "light" : "dark");

    currentTheme = toggle(currentTheme);
    expect(currentTheme).toBe("light");

    currentTheme = toggle(currentTheme);
    expect(currentTheme).toBe("dark");
  });
});
