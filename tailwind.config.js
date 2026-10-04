/** @type {import('tailwindcss').Config} */
// Kaman's look: the theme's preset (colours, type, radii) — and its
// components' own class names, so Tailwind keeps the styles they use.
const kaman = require("@kamanai/ui-theme/tailwind-preset");
module.exports = {
  presets: [kaman.default ?? kaman],
  content: ["./app/**/*.{ts,tsx}", "./node_modules/@kamanai/**/dist/*.js"],
};
