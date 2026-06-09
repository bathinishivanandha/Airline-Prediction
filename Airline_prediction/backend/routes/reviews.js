const express = require('express');
const Review = require('../models/Review.js');

const router = express.Router();

// POST /api/reviews — Submit a new review
router.post('/', async (req, res) => {
  try {
    const { userId, username, rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newReview = new Review({
      user: userId || null,
      username: username || 'Anonymous',
      rating: Number(rating),
      review: review || ''
    });

    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET /api/reviews — Fetch all reviews (most recent first)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    const totalCount = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      totalCount,
      averageRating: avgRating.length > 0 ? parseFloat(avgRating[0].avg.toFixed(1)) : 0
    });
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// DELETE /api/reviews/:id — Admin: delete a review
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
