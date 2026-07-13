const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoute = require('./routes/payment');
const stripeRoutes = require("./routes/stripe");

const app = express();

// Connect to MongoDB
connectToDb();

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", stripeRoutes)

app.use('/api/payment', paymentRoute);
// Health check
app.get('/', (req, res) => res.send('🚀 Server is running!'));

// Routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/bookings', bookingRoutes);

// Start server

module.exports = app;
