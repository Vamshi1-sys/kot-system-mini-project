// Stripe payment integration backend setup
// 1. Install Stripe: npm install stripe
// 2. Add your Stripe secret key to your .env file as STRIPE_SECRET_KEY

const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency = 'inr', metadata = {} } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
