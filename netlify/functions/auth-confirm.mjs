import { confirmEmail, verifyRequestOrigin, AuthError } from '@netlify/identity'

// Netlify's confirmation email sends visitors back to the site with a
// `#confirmation_token=...` hash. The hash never reaches the server, so
// auth-callback.html reads it in the browser and posts it here.
export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    verifyRequestOrigin(req)

    const { token } = await req.json()

    if (!token) {
      return Response.json({ error: 'Missing confirmation token.' }, { status: 400 })
    }

    const user = await confirmEmail(token)

    return Response.json({ ok: true, email: user.email })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.status === 404 || error.status === 401 || error.status === 410 || error.status === 422) {
        return Response.json(
          { error: 'This confirmation link has expired or was already used.' },
          { status: 400 },
        )
      }

      return Response.json(
        { error: 'Could not confirm your email right now. Please try the link again shortly.' },
        { status: 503 },
      )
    }

    console.error('auth-confirm failed', error)

    return Response.json({ error: 'Could not confirm your email right now.' }, { status: 500 })
  }
}
