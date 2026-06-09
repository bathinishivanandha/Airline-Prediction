const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airline-prediction';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const user = await User.findOne({ email: 'vaishnavipulluri97@gmail.com' });
    const users = await User.find();
    console.log('All registered users:', users.map(u => ({ username: u.username, email: u.email })));
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });
