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
        bg: {
          DEFAULT: "#0a0a0a",
          soft: "#111114",
          elev: "#15151a",
        },
        ink: {
          DEFAULT: "#f5f5f7",
          muted: "#a1a1aa",
          dim: "#6b6b75",
        },
        neon: {
          pink: "#ff2d92",
          green: "#00ffae",
          cyan: "#00e5ff",
          violet: "#8b5cf6",
          amber: "#ffb020",
        },
        aura: {
          calm: "#00ffae",
          flow: "#00e5ff",
          spark: "#ff2d92",
          burn: "#ff5470",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        "glow-green": "0 0 24px rgba(0, 255, 174, 0.45), 0 0 48px rgba(0, 255, 174, 0.18)",
        "glow-pink":  "0 0 24px rgba(255, 45, 146, 0.45), 0 0 48px rgba(255, 45, 146, 0.18)",
        "glow-cyan":  "0 0 24px rgba(0, 229, 255, 0.45), 0 0 48px rgba(0, 229, 255, 0.18)",
        "glow-soft":  "0 8px 40px rgba(0, 255, 174, 0.10)",
        "glass":      "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "aura-gradient":   "linear-gradient(135deg, #00ffae 0%, #00e5ff 50%, #ff2d92 100%)",
        "aura-radial":     "radial-gradient(ellipse at top, rgba(0,255,174,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,45,146,0.15), transparent 60%)",
        "aura-mesh":       "radial-gradient(at 20% 10%, rgba(0,229,255,0.18) 0, transparent 45%), radial-gradient(at 80% 0%, rgba(255,45,146,0.15) 0, transparent 50%), radial-gradient(at 60% 100%, rgba(0,255,174,0.15) 0, transparent 55%)",
        "neon-line":       "linear-gradient(90deg, transparent, #00ffae, transparent)",
      },
      keyframes: {
        "aura-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%":      { transform: "scale(1.04)", opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "aura-pulse": "aura-pulse 2.6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
