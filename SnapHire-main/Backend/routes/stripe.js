const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Endpoint to create a new checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { priceId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Use the priceId passed from the frontend
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { userId, priceId }, // Attach userId and priceId for tracking
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url }); // Return the session URL to the frontend
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});
// Endpoint to verify a checkout session
router.get("/stripe-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({ session });
  } catch (error) {
    console.error("Error retrieving Stripe session:", error.message);
    res.status(500).json({ error: "Failed to retrieve Stripe session" });
  }
});

// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },

  priceId: { 
    type: String, 
    required: true 
  },

  sessionId: { 
    type: String, 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  currency: { 
    type: String, 
    required: true 
  },

  status: { 
    type: String, 
    enum: ["pending", "paid", "failed"],
    default: "pending" 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Payment", paymentSchema);


module.exports = router;