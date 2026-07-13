const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');

// ✅ Create a new booking (User -> Captain)
const createBooking = async (req, res) => {
  try {
    const io = req.app.get('io'); // get io from app
    const { captainId, userId, shootType, location } = req.body;

    if (!captainId || !userId || !shootType || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = new Booking({
      captainId,
      userId,
      shootType,
      location,
      status: 'Pending' // ✅ Always start as Pending
    });

    await booking.save();

    // Emit notification to user immediately (status = Pending)
    io.to(`user_${userId}`).emit('bookingStatusUpdate', {
      bookingId: booking._id,
      status: booking.status,
      shootType,
    });

    res.status(201).json({ message: 'Booking created!', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get all bookings for a captain
const getBookingsForCaptain = async (req, res) => {
  try {
    const { captainId } = req.params;
    const bookings = await Booking.find({ captainId })
      .populate('userId', 'fullname email')
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("🔴 Fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};

// ✅ Get all bookings for a user
const getBookingsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('captainId', 'fullname email camera skills location socialLinks')
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("🔴 Fetch user bookings error:", error);
    res.status(500).json({ success: false, message: "Error fetching user bookings" });
  }
};

// ✅ Add rating & review
const addRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.rating = rating;
    booking.review = review || "";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "⭐ Rating added successfully!",
      data: booking,
    });
  } catch (error) {
    console.error("⚠️ Rating error:", error);
    res.status(500).json({ success: false, message: "Failed to add rating" });
  }
};

// ✅ Update booking status (Captain)
const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const captain = req.captain;
    if (!captain) return res.status(401).json({ message: "Unauthorized" });

    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.captainId.toString() !== captain._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = status;
    await booking.save();

    // ✅ Get io from app
    const io = req.app.get('io');

    io.to(`user_${booking.userId}`).emit('userNotification', {
      bookingId: booking._id,
      status: booking.status,
      shootType: booking.shootType,
      message: `Your booking for ${booking.shootType} was ${booking.status.toLowerCase()} by the captain.`
    });

    io.to(`captain_${booking.captainId}`).emit('captainNotification', {
      bookingId: booking._id,
      status: booking.status,
      shootType: booking.shootType,
      message: `Booking ${booking._id} status changed to ${booking.status}`
    });

    res.status(200).json({ success: true, message: `Booking ${status.toLowerCase()} successfully`, data: booking });
  } catch (err) {
    console.error("🔴 Update booking error:", err);
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};


// ✅ Fetch available captains by location & skill
const getAvailableCaptains = async (req, res) => {
  try {
    const { location, skill } = req.query;

    if (!location || !skill) {
      return res.status(400).json({ message: "Provide both location and skill" });
    }

    const captains = await Captain.find({
      "location.city": { $regex: location, $options: "i" },
      skills: { $in: [new RegExp(skill, "i")] },
      status: "active",
    }).select('_id fullname skills camera location socialLinks');

    res.status(200).json({ success: true, captains });
  } catch (err) {
    console.error("🔴 Fetch Available Captains Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch captains" });
  }
};

// Export all functions
module.exports = {
  createBooking,
  getBookingsForCaptain,
  getBookingsForUser,
  addRating,
  updateBooking,
  getAvailableCaptains
};
