import Stripe from 'stripe'
import { admin, getUser, refreshSession, verifyRequestOrigin, AuthError } from '@netlify/identity'
import { grantProRole, hasProRole } from '../lib/pro-role.mjs'

const MAX_USER_PAGES = 10
const USERS_PER_PAGE = 100

// A checkout may only ever be redeemed by one account. Sessions started while
// signed in carry the account id in their metadata, so this scan is only a
// fallback for checkouts that began before the visitor had an account.
async function findAccountHoldingSession(sessionId) {
  for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
    const users = await admin.listUsers({ page, perPage: USERS_PER_PAGE })

    const match = users.find(
      (user) => (user.appMetadata || {}).pro_stripe_session_id === sessionId,
    )

    if (match) {
      return match.id
    }

    if (users.length < USERS_PER_PAGE) {
      break
    }
  }

  return null
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    verifyRequestOrigin(req)
  } catch (error) {
    return Response.json({ granted: false, reason: 'blocked' }, { status: 403 })
  }

  const sessionId = new URL(req.url).searchParams.get('session_id')

  if (!sessionId) {
    return Response.json(
      { granted: false, reason: 'missing-session', error: 'Missing checkout session.' },
      { status: 400 },
    )
  }

  const user = await getUser()

  if (!user) {
    // Success.html turns this into a "log in to attach your Pro access" prompt.
    return Response.json(
      { granted: false, reason: 'not-logged-in' },
      { status: 401 },
    )
  }

  if (hasProRole(user)) {
    return Response.json({ granted: true, alreadyPro: true })
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured.')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const subscription = session.subscription

    const subscriptionActive =
      subscription && (subscription.status === 'active' || subscription.status === 'trialing')

    const paid =
      session.status === 'complete' && session.payment_status === 'paid' && subscriptionActive

    if (!paid) {
      return Response.json(
        { granted: false, reason: 'not-paid' },
        { status: 403 },
      )
    }

    const boundAccountId = session.metadata?.identity_user_id || session.client_reference_id

    if (boundAccountId) {
      if (boundAccountId !== user.id) {
        return Response.json(
          { granted: false, reason: 'other-account' },
          { status: 403 },
        )
      }
    } else {
      let holder

      try {
        holder = await findAccountHoldingSession(sessionId)
      } catch (error) {
        console.error('grant-pro could not verify session uniqueness', error)

        return Response.json(
          { granted: false, reason: 'retry' },
          { status: 503 },
        )
      }

      if (holder && holder !== user.id) {
        return Response.json(
          { granted: false, reason: 'other-account' },
          { status: 403 },
        )
      }
    }

    await grantProRole(user.id, {
      pro_stripe_session_id: sessionId,
      pro_stripe_customer_id:
        typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
      pro_granted_at: new Date().toISOString(),
    })

    // A new role is only visible to the CDN once it is inside a fresh JWT.
    try {
      await refreshSession()
    } catch (error) {
      console.error('grant-pro could not refresh the session', error)
    }

    return Response.json({ granted: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json(
        { granted: false, reason: 'error', error: error.message },
        { status: error.status || 500 },
      )
    }

    console.error('grant-pro failed', error)

    return Response.json(
      { granted: false, reason: 'error', error: 'Could not add Pro access to your account.' },
      { status: 500 },
    )
  }
}
