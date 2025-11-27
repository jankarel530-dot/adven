
import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './definitions'
import { getUsers } from './data';

export async function getSession(): Promise<Omit<User, 'password'> | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null;

  try {
    const users = await getUsers();
    if (!users) {
        console.warn("User data not found.");
        return null;
    }
    const user = users.find(u => u.username === sessionCookie);

    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user as User;
    return userWithoutPassword
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}
