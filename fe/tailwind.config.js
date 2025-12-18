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
          text: "#333333",
          subtle: "#63BFF5",
          info: "#3295D0",
          link: "#1882C3",
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
