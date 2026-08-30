```javascript
const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "Method not allowed"
        })
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const siteUrl =
      process.env.URL ||
      "https://elaborate-maamoul-1fad9f.netlify.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: "price_1UAAu3B3mpO2cUXP47SAfb8z",
          quantity: 1
        }
      ],

      success_url: `${siteUrl}/pro.html?payment=success`,
      cancel_url: `${siteUrl}/pro.html?payment=cancelled`,

      billing_address_collection: "auto",
      allow_promotion_codes: true
    });

    return {
      statusCode: 303,
      headers: {
        Location: session.url
      },
      body: ""
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to create checkout session."
      })
    };
  }
};
```
