const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");

import Success from "./pages/Success.js";

// Import models as needed. For example, assuming you have a Booking model:
const Booking = require("../models/booking.model");
const User = require("../models/user.model");

// Use JSON middleware where needed.
app.use(express.json());

// Use raw body parser for webhook verification
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Extract metadata (for example, if you store user ID or other details in metadata)
        const userId = session.metadata ? session.metadata.userId : null;
        const shootType = session.metadata ? session.metadata.shootType : "";
        
        try {
          // Create and save a new booking
          const booking = new Booking({
            userId,
            status: "confirmed",
            shootType,
            // add additional fields from session as needed
          });
          await booking.save();
          console.log("Checkout session completed, booking saved:", booking);
        } catch (err) {
          console.error("Error saving booking:", err.message);
        }
        break;
      }
      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object);
        break;
      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));