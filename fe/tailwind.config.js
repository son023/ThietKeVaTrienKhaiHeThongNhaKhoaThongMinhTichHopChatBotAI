/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#99D9FF",
          DEFAULT: "#3FB5FF",
          strong: "#0090CC",
        },
        neutral: {
          background: "#FCFEFF",
          surface: "#FFFFFF",
          muted: "#ECF8FF",
          tint: "#D8F0FF",
          border: "#AFE0FF",
          text: "#333333",          // Body text
          heading: "#01304E",       // NEW: Darker for headers/titles
          subtle: "#63BFF5",
          info: "#3295D0",
          link: "#1882C3",
          gray: {                   // NEW: Better gray scale
            50: "#F8FAFB",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        },
        secondary: {
          beige: "#F5F5DC",
          cyan: "#3FFFE9",
          deep: "#006992",
        },
        accent: {
          pink: "#FF3FB5",
          lime: "#B5FF3F",
          orange: "#FF893F",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
