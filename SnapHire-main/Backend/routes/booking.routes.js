const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const Booking = require('../models/booking.model'); 
// At the top of booking.routes.js
const { authUser, authCaptain } = require('../middlewares/auth.middleware');




// Update booking status (Captain -> Accept / Decline)



// Create a new booking
router.post('/', bookingController.createBooking);

// Get bookings for a captain
router.get('/captain/:captainId', bookingController.getBookingsForCaptain);

// Add review and rating
router.put('/review/:bookingId', bookingController.addRating);

// Update booking status

router.patch('/:bookingId', authCaptain, bookingController.updateBooking);

// Update booking status (Accept/Decline) → only captain
router.patch('/:bookingId', authCaptain, bookingController.updateBooking);

// Get bookings for a captain → only captain
router.get('/captain/:captainId', authCaptain, bookingController.getBookingsForCaptain);


// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('captainId', 'fullname email')
      .sort({ bookedAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings" });
  }
});

// Get available captains
router.get('/available-captains', bookingController.getAvailableCaptains);

module.exports = router;
