import { headers } from 'next/headers'
import { auth } from './auth'

/**
 * Get the current authenticated user session
 * Must be called from Server Components or Server Actions only
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  return session?.user ?? null
}

/**
 * Get the current user ID or throw an error if not authenticated
 * Must be called from Server Components or Server Actions only
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user?.id) {
    throw new Error('Unauthorized: User must be logged in')
  }
  
  return user.id
}
