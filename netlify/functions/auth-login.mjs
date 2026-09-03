import { login, verifyRequestOrigin, AuthError, MissingIdentityError } from '@netlify/identity'
import { hasProRole } from '../lib/pro-role.mjs'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    verifyRequestOrigin(req)

    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json(
        { error: 'Enter both your email address and password.' },
        { status: 400 },
      )
    }

    // On the server this sets the `nf_jwt` cookie through the Netlify runtime,
    // which is the cookie the CDN reads for role-based access.
    const user = await login(email, password)

    return Response.json({ ok: true, email: user.email, isPro: hasProRole(user) })
  } catch (error) {
    if (error instanceof MissingIdentityError) {
      return Response.json(
        { error: 'Accounts are not available on this site yet. Please try again later.' },
        { status: 503 },
      )
    }

    if (error instanceof AuthError) {
      if (error.status === 401) {
        // Deliberately vague: never reveal which half was wrong.
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      if (error.status === 400 && /confirm/i.test(error.message)) {
        return Response.json(
          { error: 'Confirm your email address first. Check your inbox for the link.' },
          { status: 400 },
        )
      }

      if (error.status === 400 || error.status === 422) {
        return Response.json({ error: error.message }, { status: error.status })
      }

      return Response.json(
        { error: 'Could not sign you in right now. Please try again shortly.' },
        { status: 503 },
      )
    }

    console.error('auth-login failed', error)

    return Response.json({ error: 'Could not sign you in right now.' }, { status: 500 })
  }
}
