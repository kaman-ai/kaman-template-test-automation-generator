// Signed out → the login screen. Only whether a session cookie exists is
// checked here; whether it is still good is Kaman's to say (an API route
// answers 401 and the screen sends the person back here).
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.cookies.has("kaman_at") || req.cookies.has("kaman_rt")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Every screen except the login and signup screens; never the API routes
  // (they answer 401 themselves) or Next's own files.
  matcher: ["/((?!login|signup|api|_next|favicon.ico).*)"],
};
