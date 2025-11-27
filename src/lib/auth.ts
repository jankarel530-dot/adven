
import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './definitions'
// Since actions will now use the GitHub API, we need to read from the local file for session verification,
// as this runs on every request and hitting the API would be too slow and rate-limit heavy.
import users from './data/users.json'

export async function getSession(): Promise<Omit<User, 'password'> | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null

  // We read from the local `users.json` file which is up-to-date on every build.
  // This is fast and avoids hitting the GitHub API on every page load.
  const user = users.find(u => u.username === sessionCookie);

  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user as User;
  return userWithoutPassword
}
