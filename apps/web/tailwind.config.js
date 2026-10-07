/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // BorrowNet Design System Palette
        "bn-primary": "#006948",
        "bn-primary-hover": "#005137",
        "bn-primary-light": "#059669",
        "bn-primary-container": "#00855d",
        "bn-on-primary": "#ffffff",
        "bn-secondary": "#855300",
        "bn-secondary-container": "#fea619",
        "bn-amber": "#F59E0B",
        "bn-surface": "#faf8ff",
        "bn-surface-dim": "#d2d9f4",
        "bn-surface-low": "#f2f3ff",
        "bn-surface-container": "#eaedff",
        "bn-surface-high": "#e2e7ff",
        "bn-surface-highest": "#dae2fd",
        "bn-on-surface": "#131b2e",
        "bn-on-surface-variant": "#3d4a42",
        "bn-inverse-surface": "#283044",
        "bn-outline": "#6d7a72",
        "bn-outline-variant": "#bccac0",
        "bn-border": "#e2e8f0",

        // Shopifi Two-Canvas Foundations
        "canvas-night": "#000000",
        "canvas-night-elevated": "#0a0a0a",
        "surface-elevated-dark": "#1e2c31",
        "canvas-light": "#ffffff",
        "canvas-cream": "#faf8ff",
        "hairline-light": "#e4e4e7",
        "hairline-dark": "#1e2c31",

        // Accents (Commerce & Growth on Light Track)
        "aloe-10": "#c1fbd4",
        "aloe-20": "#aef7c5",
        "pistachio-10": "#d4f9e0",

        // Shade Ladder
        "shade-30": "#d4d4d8",
        "shade-40": "#a1a1aa",
        "shade-50": "#71717a",
        "shade-60": "#52525b",
        "shade-70": "#3f3f46",
        ink: "#000000",
        "on-primary": "#ffffff",

        // Semantic Context-Aware Mapping
        canvas: "var(--color-surface-base)",
        surface: "var(--color-surface-raised)",
        surfaceElevated: "var(--color-surface-strong)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        borderSubtle: "var(--color-border-subtle)",
        borderStrong: "var(--color-border-strong)",
        accent: "#006948",
        accentHover: "#005137",
        trust: "#0066ff",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ba1a1a",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          '"Plus Jakarta Sans"',
          '"Neue Haas Grotesk Display"',
          "Inter",
          "sans-serif",
        ],
        body: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontWeight: {
        thin: "300",
        editorial: "330",
        normal: "420",
        medium: "500",
        semibold: "550",
        bold: "700",
      },
      boxShadow: {
        "level-1":
          "0 1px 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
        "level-2":
          "0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)",
        "level-3":
          "0 8px 8px rgba(0,0,0,0.04), 0 4px 4px rgba(0,0,0,0.04), 0 2px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)",
        "level-4": "0 25px 50px -12px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        xs: "4px",
        sm: "5px",
        md: "8px",
        lg: "12px",
        xl: "20px",
        pill: "9999px",
      },
      letterSpacing: {
        tightest: "-0.13px",
        display: "2.4px",
        caption: "0.28px",
        eyebrow: "0.72px",
      },
    },
  },
  plugins: [],
};
