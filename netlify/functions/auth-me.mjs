import { getUser, refreshSession } from '@netlify/identity'
import { hasProRole, readRoles } from '../lib/pro-role.mjs'

// Read-only view of the current session, used by auth.js to paint the nav and
// by the account page. Never throws for signed-out visitors.
export default async () => {
  // Refreshing first keeps the `nf_jwt` cookie current, which matters because
  // a role added after sign-in only lands in the JWT on the next refresh.
  try {
    await refreshSession()
  } catch (error) {
    console.error('auth-me could not refresh the session', error)
  }

  const user = await getUser()

  if (!user) {
    return Response.json(
      { loggedIn: false },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return Response.json(
    {
      loggedIn: true,
      email: user.email ?? null,
      name: user.name ?? null,
      roles: readRoles(user),
      isPro: hasProRole(user),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
