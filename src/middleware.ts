
// The middleware is no longer needed with client-side auth handling.
// Firebase's onAuthStateChanged provides a more robust way to handle redirects.
// You can delete this file. We are keeping it to avoid breaking changes if it was referenced elsewhere.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
