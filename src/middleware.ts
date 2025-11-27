
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // Allow access to login page
  if (request.nextUrl.pathname.startsWith("/login")) {
    // Redirect to home if already logged in
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated
  if (!session) {
    if (request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
    * Match all request paths except for the ones starting with:
    * - api (API routes)
    * - _next/static (static files)
    * - _next/image (image optimization files)
    * - favicon.ico (favicon file)
    * - icon.svg (icon file)
    * - sounds (public sound files)
    */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sounds).*)',
  ],
};
