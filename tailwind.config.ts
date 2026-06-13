import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0F0F14",
        canvas: "#FAFAF8",
        surface: "#F3F3F0",
        "border-col": "#E8E8E2",
        sage: {
          DEFAULT: "#3EC9A7",
          light: "#E8FBF5",
          dark: "#2FB896",
        },
        violet: {
          DEFAULT: "#7B61FF",
          light: "#EEF0FF",
        },
        amber: {
          DEFAULT: "#F5A623",
          light: "#FFF8ED",
        },
        coral: {
          DEFAULT: "#F0634A",
          light: "#FEF0ED",
        },
        sky: {
          DEFAULT: "#3B9EFF",
          light: "#EAF4FF",
        },
        ink: "#1A1A2E",
        muted: "#6B7080",
        ghost: "#9EA5B3",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
}

export default config
