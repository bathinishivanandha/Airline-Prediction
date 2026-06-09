const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  flightDetails: {
    airline: String,
    source_city: String,
    departure_time: String,
    stops: String,
    arrival_time: String,
    destination_city: String,
    class: String,
    duration: Number,
    days_left: Number,
  },
  predictedPrice: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);
