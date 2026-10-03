// A URL for one of THIS app's API routes. The preview serves the app under
// a path prefix, and Next's basePath does not rewrite a raw fetch("/api/…").
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function apiPath(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
