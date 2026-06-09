import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('http://localhost:4001/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:4001/api/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 rounded-3xl w-full max-w-md shadow-2xl bg-white"
      >
        <div className="text-center mb-10">
          <Logo />
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Recover Password</h1>
          <p className="text-gray-500 mt-2">
            {step === 1 ? "Enter your email to receive a reset code." : "Enter the OTP and your new password."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRequestOtp} 
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  placeholder="alex@example.com"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              {message && <p className="text-emerald-500 text-sm font-medium">{message}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all flex justify-center items-center"
                style={{ backgroundColor: '#f97316', color: '#ffffff' }}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send Reset Code"}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  maxLength="6"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center tracking-widest font-mono text-xl" 
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              {message && <p className="text-emerald-500 text-sm font-medium">{message}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all flex justify-center items-center"
                style={{ backgroundColor: '#f97316', color: '#ffffff' }}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Reset Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="text-center mt-8">
           <Link to="/login" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

const Logo = () => (
    <div className="mb-6 inline-flex items-center justify-center p-3 rounded-2xl bg-orange-50 text-orange-600">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    </div>
);

export default ForgotPassword;
