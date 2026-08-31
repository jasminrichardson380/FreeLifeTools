const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not configured.");
    }

    const sessionId =
      event.queryStringParameters?.session_id;

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          verified: false,
          error: "Missing checkout session."
        })
      };
    }

    const stripe =
      new Stripe(process.env.STRIPE_SECRET_KEY);

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: ["subscription"]
        }
      );

    const subscription =
      session.subscription;

    const subscriptionActive =
      subscription &&
      (
        subscription.status === "active" ||
        subscription.status === "trialing"
      );

    const verified =
      session.status === "complete" &&
      session.payment_status === "paid" &&
      subscriptionActive;

    if (!verified) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          verified: false
        })
      };
    }

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",

        "Set-Cookie":
          `pro_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      },

      body: JSON.stringify({
        verified: true
      })
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        verified: false,
        error: "Unable to activate Pro access."
      })
    };
  }
};
