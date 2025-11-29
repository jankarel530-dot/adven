
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/lib/definitions';

const SESSION_COOKIE_NAME = 'session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // If there's no session, redirect to login page, unless they are already there
  if (!sessionCookie) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If there is a session, parse it
  try {
    const user: User = JSON.parse(sessionCookie);

    // If a logged-in user tries to access the login page, redirect them to home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If a non-admin tries to access an admin route, redirect them to home
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    // If the cookie is malformed, delete it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sounds|icon.svg).*)'],
};
