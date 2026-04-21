/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#111111",
        card: "#161616",
        border: "#222222",
        accent: "#C8A96E",
        "accent-dim": "#8B6F3E",
        "text-primary": "#F0EDE8",
        "text-muted": "#666666",
        "text-sub": "#999999",
      },
      fontFamily: {
        sans: ["DM Sans", "Helvetica Neue", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
