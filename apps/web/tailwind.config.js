/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Shopifi Two-Canvas Foundations
        "canvas-night": "#000000",
        "canvas-night-elevated": "#0a0a0a",
        "surface-elevated-dark": "#1e2c31",
        "canvas-light": "#ffffff",
        "canvas-cream": "#fbfbf5",
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
        accent: "#c1fbd4",
        accentHover: "#aef7c5",
        trust: "#0066ff",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        display: [
          '"Neue Haas Grotesk Display"',
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: ["Inter", "system-ui", "sans-serif"],
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
