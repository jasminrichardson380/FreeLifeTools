Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not configured.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1UAAu3B3mpO2cUXP47SAfb8z",
          quantity: 1
        }
      ],
      success_url:
  "https://elaborate-maamoul-1fad9f.netlify.app/success.html",
      cancel_url:
        "https://elaborate-maamoul-1fad9f.netlify.app/pro.html?payment=cancelled"
    });

    return {
      statusCode: 303,
      headers: {
        Location: checkout.url
      },
      body: ""
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};


