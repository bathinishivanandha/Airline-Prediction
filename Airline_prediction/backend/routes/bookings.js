const express = require('express');
const Booking = require('../models/Booking.js');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { userId, passengerName, passengerEmail, passengerPhone, flightDetails, price, upiId } = req.body;

    if (!userId || !passengerName || !upiId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transactionId = 'TXN' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const newBooking = new Booking({
      user: userId,
      passengerName,
      passengerEmail,
      passengerPhone,
      flightDetails,
      price,
      upiId,
      transactionId,
      status: 'Success' // Simulating successful payment immediately for this demo
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (err) {
    console.error('Booking Error:', err.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all bookings (Admin)
router.get('/admin/all', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
});

// Cancel a booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ error: 'Ticket is already cancelled' });
    }

    const now = new Date();
    const createdAt = new Date(booking.createdAt);
    // Hardcoded travel date for demo if not in schema, but we should use days_left
    // Let's assume travelDate is bookingDate + days_left
    const travelDate = new Date(createdAt);
    travelDate.setDate(travelDate.getDate() + booking.flightDetails.days_left);

    const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);
    const hoursToTravel = (travelDate - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    let cancellationPolicy = "No Refund";

    if (hoursSinceBooking <= 24) {
      refundAmount = booking.price;
      cancellationPolicy = "Full Refund (Cancelled within 24hrs)";
    } else if (hoursToTravel > 48) {
      refundAmount = booking.price * 0.5;
      cancellationPolicy = "Partial Refund (50%)";
    }

    booking.status = 'Cancelled';
    booking.cancellationDate = now;
    booking.refundAmount = refundAmount;

    await booking.save();

    // Send email notification
    if (emailService && emailService.sendCancellationEmail) {
      await emailService.sendCancellationEmail(booking, refundAmount);
    }

    res.json({ 
      message: 'Ticket cancelled successfully', 
      refundAmount, 
      policy: cancellationPolicy 
    });
  } catch (err) {
    console.error('Cancellation Error:', err.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Delete booking (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
