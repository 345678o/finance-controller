/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      screens: {
        xs: "420px",
      },
      colors: {
        // ── Theme palette (driven by CSS vars in src/styles/themes.css) ──
        theme: {
          bg:        "var(--t-bg)",
          "bg-soft": "var(--t-bg-soft)",
          card:      "var(--t-card)",
          "card-soft": "var(--t-card-soft)",
          ink:       "var(--t-ink)",
          "ink-muted": "var(--t-ink-muted)",
          "ink-dim": "var(--t-ink-dim)",
          "ink-faint": "var(--t-ink-faint)",
          line:      "var(--t-line)",
          "line-soft": "var(--t-line-soft)",
          primary:   "var(--t-primary)",
          secondary: "var(--t-secondary)",
          accent:    "var(--t-accent)",
          lilac:     "var(--t-lilac)",
          success:   "var(--t-success)",
          danger:    "var(--t-danger)",
        },
        // ── Legacy tokens (kept for already-styled pages) ────────────────
        bg: {
          DEFAULT: "#F8FAFC",
          card:    "#FFFFFF",
          elev:    "#F1F5F9",
          inset:   "#E2E8F0",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted:   "#475569",
          dim:     "#64748B",
          faint:   "#94A3B8",
        },
        line: {
          DEFAULT: "#E2E8F0",
          soft:    "#EEF2F7",
        },
        primary: {
          DEFAULT: "#22C55E",
          ink:     "#15803D",
          soft:    "#DCFCE7",
        },
        accent: {
          DEFAULT: "#6366F1",
          ink:     "#4338CA",
          soft:    "#E0E7FF",
        },
        warn: {
          DEFAULT: "#F59E0B",
          ink:     "#B45309",
          soft:    "#FEF3C7",
        },
        danger: {
          DEFAULT: "#EF4444",
          ink:     "#B91C1C",
          soft:    "#FEE2E2",
        },
      },
      borderRadius: {
        xl2:   "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        card:   "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        soft:   "0 1px 0 rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)",
        stamp:  "0 4px 0 rgba(15,23,42,0.08)",
        ringed: "0 0 0 4px rgba(34,197,94,0.10)",
        // Bold neo-brutalist offset stamps used across the app
        "stamp-lg": "5px 5px 0 #0F172A",
        "stamp-md": "3px 3px 0 #0F172A",
        "stamp-sm": "2px 2px 0 #0F172A",
        "stamp-xl": "7px 7px 0 #0F172A",
        glow:      "0 0 0 4px rgba(var(--t-glow), 0.18)",
      },
      maxWidth: {
        app: "1400px",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        float:     "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
