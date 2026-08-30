```javascript
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function () {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1UAAu3B3mpO2cUXPIlcgjVCBj54tBUzNnIWP4g66Ao8AdjXJkNF3uOxl8UrTbEC3WpSx6NLs3jQ7cCY3hfdAieNA001IMmydat",
          quantity: 1
        }
      ],
      success_url: "https://elaborate-maamoul-1fad9f.netlify.app/pro.html?payment=success",
      cancel_url: "https://elaborate-maamoul-1fad9f.netlify.app/pro.html?payment=cancelled"
    });

    return {
      statusCode: 303,
      headers: {
        Location: session.url
      },
      body: ""
    };

  } catch (error) {
    console.error("Stripe checkout error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
```
