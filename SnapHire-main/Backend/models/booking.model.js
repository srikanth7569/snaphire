// models/booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Captain',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shootType: {
    type: String,
    required: true,
    enum: [
      "Wedding Photography",
      "Birthday Photography",
      "Event Photography",
      "Fashion Shoot",
      "Reel Making",
      "Product Shoot",
      "Travel Shoot",
      "Concert Shoot",
      "Corporate Shoot",
    ]
  },
  location: {
    type: String,
    required: true,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
  }
});




module.exports = mongoose.model('Booking', bookingSchema);
