import { logout, verifyRequestOrigin, AuthError } from '@netlify/identity'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    verifyRequestOrigin(req)

    // Clears both auth cookies, even if the Identity call itself fails.
    await logout()

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof AuthError && error.status === 403) {
      return Response.json({ error: 'Request blocked.' }, { status: 403 })
    }

    console.error('auth-logout failed', error)

    // The session cookies are gone either way, so let the page move on.
    return Response.json({ ok: true })
  }
}
