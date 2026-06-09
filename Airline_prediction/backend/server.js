const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const flightRoutes = require('./routes/flights.js');
const reviewRoutes = require('./routes/reviews.js');
const bookingRoutes = require('./routes/bookings.js');
const User = require('./models/User.js');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airline-prediction';

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Start Server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Seed default admin if missing
    try {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('admin123', salt);
        await User.create({
          username: 'SystemAdmin',
          email: 'admin@aeropredict.com',
          password: password,
          role: 'admin'
        });
        console.log('Default Admin Account Created: admin@aeropredict.com / admin123');
      }
    } catch (err) {
      console.error('Failed to run admin seeder', err);
    }

    app.listen(PORT, () => {
      console.log(`Backend Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
