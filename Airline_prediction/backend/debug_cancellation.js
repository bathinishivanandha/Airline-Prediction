const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');
dotenv.config();

const testCancellation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airline-prediction');
    console.log('Connected to MongoDB');

    const booking = await Booking.findOne({ status: { $ne: 'Cancelled' } });
    if (!booking) {
      console.log('No active bookings found for testing.');
      return;
    }

    console.log(`Found booking: ${booking._id} (Status: ${booking.status})`);

    // Simulate the API call logic
    const bookingId = booking._id;
    console.log(`Testing cancellation for ID: ${bookingId}`);

    const axios = require('axios');
    try {
      const res = await axios.post(`http://localhost:4000/api/bookings/${bookingId}/cancel`);
      console.log('Success:', res.data);
    } catch (err) {
      console.error('API Error Status:', err.response?.status);
      console.error('API Error Data:', err.response?.data);
      console.error('API Error Message:', err.message);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Test Script Error:', err);
  }
};

testCancellation();
