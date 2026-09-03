import { signup, verifyRequestOrigin, AuthError, MissingIdentityError } from '@netlify/identity'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    // Blocks cross-site form posts against this endpoint.
    verifyRequestOrigin(req)

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json(
        { error: 'Enter both an email address and a password.' },
        { status: 400 },
      )
    }

    const user = await signup(email, password, name ? { full_name: name } : undefined)

    // When autoconfirm is on, signup logs the visitor straight in. When it is
    // off (the Netlify default) they must click the link in their email first.
    return Response.json({ ok: true, confirmed: Boolean(user.confirmedAt) })
  } catch (error) {
    if (error instanceof MissingIdentityError) {
      return Response.json(
        { error: 'Accounts are not available on this site yet. Please try again later.' },
        { status: 503 },
      )
    }

    if (error instanceof AuthError) {
      if (error.status === 403) {
        return Response.json(
          { error: 'New signups are currently closed.' },
          { status: 403 },
        )
      }

      if (error.status === 422) {
        return Response.json(
          { error: 'Check your email address and choose a longer password.' },
          { status: 422 },
        )
      }

      if (error.status === 400) {
        return Response.json({ error: error.message }, { status: 400 })
      }

      return Response.json(
        { error: 'Could not create your account right now. Please try again shortly.' },
        { status: 503 },
      )
    }

    console.error('auth-signup failed', error)

    return Response.json({ error: 'Could not create your account right now.' }, { status: 500 })
  }
}
