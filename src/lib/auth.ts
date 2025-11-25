import 'server-only'
import { cookies } from 'next/headers'
import { findUserByUsername } from '@/lib/data'
import type { User } from './definitions'

export async function getSession(): Promise<Omit<User, 'password'> | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null

  // In a real app, you would decrypt and verify the session token.
  // For this scaffold, we're using the username directly.
  const user = await findUserByUsername(sessionCookie)

  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}
