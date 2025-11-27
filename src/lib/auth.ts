
import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './definitions'

export async function getSession(): Promise<Omit<User, 'password'> | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null;

  try {
    // Just parse the cookie, don't re-validate with the database here.
    // This makes the middleware faster and more reliable.
    const session = JSON.parse(sessionCookie) as Omit<User, 'password'>;
    return session;
  } catch (error) {
    console.error("Error parsing session cookie:", error);
    // If cookie is malformed, treat as logged out.
    return null;
  }
}
