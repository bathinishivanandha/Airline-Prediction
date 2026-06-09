import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? (hovered || rating) : rating);
        return (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onRate(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            style={{ background: 'none', border: 'none', padding: '2px' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={interactive ? "36" : "20"}
              height={interactive ? "36" : "20"}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
              className={`transition-colors duration-150 ${
                filled
                  ? 'text-amber-400'
                  : 'text-gray-300'
              } ${interactive ? 'w-9 h-9' : 'w-5 h-5'}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const ReviewSection = () => {
  const userCookie = Cookies.get('user');
  const isLoggedIn = !!userCookie;

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchReviews = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get('http://localhost:4001/api/reviews');
      setReviews(res.data.reviews);
      setAvgRating(res.data.averageRating);
      setTotalCount(res.data.totalCount);
    } catch {
      setFetchError('Could not load reviews.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchReviews();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      await axios.post('http://localhost:4001/api/reviews', {
        userId: user?.id || null,
        username: user?.username || 'Anonymous',
        rating,
        review: reviewText.trim()
      });

      setSubmitted(true);
      setRating(0);
      setReviewText('');
      await fetchReviews();
    } catch {
      setError('Failed to submit your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0 };
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 pb-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
          What Our Users Say
        </h2>
        <p className="text-gray-500 text-lg">
          Share your experience with AeroPredict
        </p>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        
        {/* Left: Submit Review Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 glass-panel rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-1">Rate Your Experience</h3>
          <p className="text-sm text-gray-500 mb-6">Your feedback helps us improve.</p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">Thank you!</h4>
                <p className="text-gray-500 text-sm mb-5">Your review has been submitted.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-brand-600 font-semibold text-sm hover:underline"
                >
                  Submit another review
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Star Picker */}
                <div className="flex flex-col items-center gap-2 py-4 bg-gray-50/70 rounded-2xl">
                  <StarRating rating={rating} onRate={setRating} interactive={true} />
                  <span className={`text-sm font-semibold transition-colors ${rating > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {rating > 0 ? LABELS[rating] : 'Tap a star to rate'}
                  </span>
                </div>

                {/* Optional Review Text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Review <span className="normal-case text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with AeroPredict..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{reviewText.length}/500</div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Review
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Reviews List + Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-3 flex flex-col gap-6"
        >
          {/* Summary Card */}
          <div className="glass-panel rounded-3xl p-6 flex gap-6 items-center">
            <div className="text-center shrink-0">
              <p className="text-6xl font-extrabold text-gray-900 leading-none">{avgRating || '–'}</p>
              <div className="flex justify-center mt-2">
                <StarRating rating={Math.round(avgRating)} interactive={false} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{totalCount} review{totalCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Distribution Bars */}
            <div className="flex-grow space-y-1.5">
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-gray-600 font-semibold">{star}</span>
                  <svg className="w-4 h-4 text-amber-400 shrink-0" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="w-6 text-right text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Feed */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 custom-scroll">
            {fetchError && <p className="text-red-400 text-sm text-center">{fetchError}</p>}
            {!fetchError && reviews.length === 0 && (
              <div className="glass-panel rounded-2xl p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">⭐</p>
                <p className="font-medium">No reviews yet. Be the first!</p>
              </div>
            )}
            {reviews.map((r, idx) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {r.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{r.username || 'Anonymous'}</p>
                      <StarRating rating={r.rating} interactive={false} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 pt-1">{formatDate(r.createdAt)}</span>
                </div>
                {r.review && (
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    "{r.review}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewSection;
