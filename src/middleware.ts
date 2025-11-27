
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/auth";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, static files, and other assets to pass through
  if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  const session = await getSession();

  // If user is on the login page
  if (pathname.startsWith("/login")) {
    // If user is already logged in, redirect to home
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Otherwise, show the login page
    return NextResponse.next();
  }
  
  // If user is not logged in and not on the login page, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in, handle admin routes
  if (pathname.startsWith('/admin')) {
      // If a non-admin tries to access an admin route, redirect to home
      if (session.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
      }
  }

  // If all checks pass, allow the request
  return NextResponse.next();
}

export const config = {
  // Match all request paths except for specific static files
  matcher: '/((?!_next/static|favicon.ico|icon.svg|sounds).*)',
};
