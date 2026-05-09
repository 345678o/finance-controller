/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // ── Surfaces ─────────────────────────────────────────────
        bg: {
          DEFAULT: "#F8FAFC",   // page (off-white)
          card:    "#FFFFFF",   // primary card surface
          elev:    "#F1F5F9",   // soft secondary surface (slate-100)
          inset:   "#E2E8F0",   // muted inset (slate-200)
        },
        // ── Text ────────────────────────────────────────────────
        ink: {
          DEFAULT: "#0F172A",   // primary text (slate-900)
          muted:   "#475569",   // secondary text (slate-600)
          dim:     "#64748B",   // tertiary text (slate-500)
          faint:   "#94A3B8",   // captions (slate-400)
        },
        // ── Strokes ─────────────────────────────────────────────
        line: {
          DEFAULT: "#E2E8F0",   // default border (slate-200)
          soft:    "#EEF2F7",
        },
        // ── Brand ───────────────────────────────────────────────
        primary: {
          DEFAULT: "#22C55E",   // money / positive
          ink:     "#15803D",   // text on light primary tints
          soft:    "#DCFCE7",   // light tint surface
        },
        accent: {
          DEFAULT: "#6366F1",   // insight / AI
          ink:     "#4338CA",
          soft:    "#E0E7FF",
        },
        warn: {
          DEFAULT: "#F59E0B",   // caution
          ink:     "#B45309",
          soft:    "#FEF3C7",
        },
        danger: {
          DEFAULT: "#EF4444",   // alert
          ink:     "#B91C1C",
          soft:    "#FEE2E2",
        },
      },
      borderRadius: {
        xl2:   "1.25rem",   // 20px
        "3xl": "1.75rem",   // 28px
        "4xl": "2.25rem",   // 36px
      },
      boxShadow: {
        card:   "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        soft:   "0 1px 0 rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)",
        stamp:  "0 4px 0 rgba(15,23,42,0.08)",
        ringed: "0 0 0 4px rgba(34,197,94,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
