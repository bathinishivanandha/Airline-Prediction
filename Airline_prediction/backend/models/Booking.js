const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passengerName: {
    type: String,
    required: true,
    trim: true
  },
  passengerEmail: {
    type: String,
    required: true,
    trim: true
  },
  passengerPhone: {
    type: String,
    required: true
  },
  flightDetails: {
    airline: String,
    source_city: String,
    destination_city: String,
    departure_time: String,
    arrival_time: String,
    stops: String,
    class: String,
    duration: Number,
    days_left: Number
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  upiId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
