const express = require('express');
const axios = require('axios');
const SearchLog = require('../models/SearchLog.js');
const User = require('../models/User.js');

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

router.post('/predict', async (req, res) => {
  try {
    const flightDetails = req.body.flightDetails;
    const userId = req.body.userId; 
    
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, flightDetails);
    
    if (mlResponse.data.error) {
        return res.status(400).json({ error: mlResponse.data.error });
    }
    
    const price = mlResponse.data.price_predicted;
    
    const newLog = new SearchLog({
      user: userId || null,
      flightDetails,
      predictedPrice: price,
      currency: mlResponse.data.currency || 'INR'
    });
    
    await newLog.save();

    res.json({ price, currency: mlResponse.data.currency || 'INR', logId: newLog._id });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('ML Service Error Response:', error.response.data);
      console.error('ML Service Status:', error.response.status);
      return res.status(error.response.status).json({ 
        error: error.response.data.error || 'ML service returned an error',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('ML Service No Response:', error.message);
      return res.status(503).json({ error: 'ML service is not responding. Ensure it is running on port 5000.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Prediction Error:', error.message);
      return res.status(500).json({ error: 'Internal server error during prediction' });
    }
  }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const logs = await SearchLog.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch(err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.get('/admin/stats', async (req, res) => {
    try {
        const mlStatsResponse = await axios.get(`${ML_SERVICE_URL}/admin/stats`);
        const totalUsers = await User.countDocuments();
        const totalSearches = await SearchLog.countDocuments();
        const recentSearches = await SearchLog.find().sort({createdAt: -1}).limit(10).populate('user', 'username email');
        
        res.json({
            users: totalUsers,
            searches: totalSearches,
            recentSearches,
            mlStats: mlStatsResponse.data
        });
    } catch(err) {
        console.error('Error fetching admin stats:', err.message);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
});

router.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch(err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.delete('/admin/searches/:id', async (req, res) => {
   try {
       await SearchLog.findByIdAndDelete(req.params.id);
       res.json({ message: 'Deleted successfully' });
   } catch(err) {
       res.status(500).json({ error: 'Failed to delete search log' });
   }
});

module.exports = router;
