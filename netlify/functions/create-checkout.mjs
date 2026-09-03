import Stripe from 'stripe'
import { getUser } from '@netlify/identity'

const PRICE_ID = 'price_1UAAu3B3mpO2cUXP47SAfb8z'
const FALLBACK_SITE_URL = 'https://elaborate-maamoul-1fad9f.netlify.app'

function siteUrl(req) {
  try {
    return new URL(req.url).origin
  } catch (error) {
    return FALLBACK_SITE_URL
  }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured.')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = siteUrl(req)

    // Stamping the Identity account onto the checkout is what lets grant-pro
    // hand the Pro role to the right account, and only that account, later on.
    const user = await getUser()

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro.html?payment=cancelled`,
      ...(user
        ? {
            client_reference_id: user.id,
            customer_email: user.email,
            metadata: { identity_user_id: user.id },
          }
        : {}),
    })

    return new Response(null, {
      status: 303,
      headers: { Location: checkout.url },
    })
  } catch (error) {
    console.error(error)

    return Response.json({ error: error.message }, { status: 500 })
  }
}
