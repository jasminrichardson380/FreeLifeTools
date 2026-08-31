const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not configured.");
    }

    const cookieHeader =
      event.headers.cookie || event.headers.Cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.trim().split("=");

      if (parts.length >= 2) {
        const name = parts.shift();
        const value = parts.join("=");
        cookies[name] = value;
      }
    });

    const sessionId = cookies.pro_session;

    if (!sessionId) {
      return {
        statusCode: 302,
        headers: {
          Location: "/pro.html"
        },
        body: ""
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      {
        expand: ["subscription"]
      }
    );

    const subscription = session.subscription;

    const hasAccess =
      session.status === "complete" &&
      subscription &&
      (
        subscription.status === "active" ||
        subscription.status === "trialing"
      );

    if (!hasAccess) {
      return {
        statusCode: 302,
        headers: {
          Location: "/pro.html"
        },
        body: ""
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: "/pro-access.html"
      },
      body: ""
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 302,
      headers: {
        Location: "/pro.html"
      },
      body: ""
    };
  }
};
