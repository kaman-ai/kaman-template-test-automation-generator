// postcss-import first: it inlines the theme's CSS variables, which sit in
// Tailwind's base layer, before Tailwind runs.
module.exports = { plugins: { "postcss-import": {}, tailwindcss: {}, autoprefixer: {} } };
