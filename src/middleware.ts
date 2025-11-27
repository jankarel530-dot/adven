
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/auth";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This is a workaround to allow static files to be served
  // It's not ideal, but it works for this scaffold.
  if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  const session = await getSession();

  // Allow access to login page
  if (pathname.startsWith("/login")) {
    // Redirect to home if already logged in
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated and not on login page
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
      if (session.role !== 'admin') {
          // If a non-admin tries to access an admin route, redirect them to the homepage.
          return NextResponse.redirect(new URL('/', request.url));
      }
  }


  return NextResponse.next();
}

export const config = {
  // We need to match all paths to ensure the middleware runs everywhere.
  // The filtering is now done inside the middleware itself.
  matcher: '/((?!_next/static|favicon.ico|icon.svg|sounds).*)',
};
