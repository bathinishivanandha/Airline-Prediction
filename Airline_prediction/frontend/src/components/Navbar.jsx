import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass-panel border-b border-gray-200/50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full rounded-[10px] flex items-center justify-center overflow-hidden">
               <img src={logo} alt="AeroPredict Logo" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </div>
          <span className="text-2xl font-black text-brand-900 tracking-tight">
            AeroPredict
          </span>
        </Link>
        <div className="flex gap-6 items-center font-bold text-gray-800">
          
          {token ? (
            <>
              <Link to="/search" className="hover:text-brand-600 transition-colors">Predict Prices</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-brand-600 transition-colors">Admin Stats</Link>
              )}
              <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-gray-100/50 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2 rounded-xl shadow-lg shadow-orange-500/40 hover:-translate-y-0.5 transition-all font-bold"
              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
