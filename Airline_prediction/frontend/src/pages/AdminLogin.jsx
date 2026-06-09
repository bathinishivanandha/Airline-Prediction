import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:4001/api/auth/login', { email, password });
      if (res.data.user.role !== 'admin') {
          throw new Error('Unauthorized Access. Admin credentials required.');
      }
      Cookies.set('token', res.data.token, { expires: 1 });
      Cookies.set('user', JSON.stringify(res.data.user), { expires: 1 });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-2xl w-full max-w-md relative overflow-hidden"
        style={{ backgroundColor: '#1e1b4b', color: 'white' }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-400"></div>
        <h2 className="text-3xl font-bold mb-2">Admin Portal</h2>
        <p className="text-gray-300 text-sm mb-6">Restricted System Access</p>
        
        {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-4 text-sm border border-red-500/50">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Administrator Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 text-white placeholder-gray-400 transition-all"
              placeholder="admin@aeropredict.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Secure Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 text-white placeholder-gray-400 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-red-600 text-white rounded-xl font-medium shadow-lg hover:bg-red-500 transition-all disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
