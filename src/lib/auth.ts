
import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './definitions'
import { get } from '@vercel/edge-config';

export async function getSession(): Promise<Omit<User, 'password'> | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null;

  try {
    const users = await get<User[]>('users');
    if (!users) {
        console.warn("User data not found in Edge Config during session check.");
        return null;
    }
    const user = users.find(u => u.username === sessionCookie);

    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user as User;
    return userWithoutPassword
  } catch (error) {
    console.error("Error fetching session from Edge Config:", error);
    return null;
  }
}
