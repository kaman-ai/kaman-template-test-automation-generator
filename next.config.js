/** @type {import('next').NextConfig} */
// A Kaman preview serves the app under /preview/<id>/; Next's base path is
// a config value, so it is read here. Unset (a real deploy) = root.
const base = (process.env.KAMAN_PREVIEW_BASE || "").replace(/\/$/, "");
module.exports = {
  ...(base ? { basePath: base, assetPrefix: base } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: base },
};
