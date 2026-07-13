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
