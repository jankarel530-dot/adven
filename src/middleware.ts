
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/lib/definitions';

// This middleware is now simplified as auth state is handled on the client.
// It can be used for other purposes later if needed.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic protection for admin routes, but relies on client-side checks for real security.
  // A malicious user could bypass this. True security is in Firestore rules.
  if (pathname.startsWith('/admin')) {
    // In a real app, you'd verify a token here. For now, we can't do much
    // without a server-side session, so we rely on client-side redirects
    // and Firestore rules.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sounds|icon.svg).*)'],
};
