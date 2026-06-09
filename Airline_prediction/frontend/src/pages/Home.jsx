import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SparklesIcon, ChartBarIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import ReviewSection from '../components/ReviewSection';
import heroBg from '../assets/hero_bg.jpg';

const Home = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-white/40 to-white"></div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-brand-700">
              Smart Airfare
            </span>
            <br />
            <span className="text-gray-900">Prediction System</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            Leverage the power of machine learning to predict flight prices before you book. 
            Save money, track trends, and receive smart alerts for the best time to purchase tickets.
          </p>

          <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
          >
              <Link 
              to="/search" 
              className="px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all flex items-center gap-2"
              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
              >
              <SparklesIcon className="w-5 h-5 text-yellow-200" />
              Start Predicting Now
              </Link>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full px-4">
            {[
                { 
                    icon: ChartBarIcon, 
                    title: 'AI-Powered Insights', 
                    desc: 'Our models analyze millions of historical data points to estimate future prices.',
                    color: 'text-orange-600',
                    bg: 'bg-orange-50'
                },
                { 
                    icon: SparklesIcon, 
                    title: 'Instant Predictions', 
                    desc: 'Input your travel parameters and get an instant cost estimation in Rupees.',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50'
                },
                { 
                    icon: BellAlertIcon, 
                    title: 'Smart Tracking', 
                    desc: 'View your prediction history and learn when it is the optimal time to book.',
                    color: 'text-orange-500',
                    bg: 'bg-orange-50'
                }
            ].map((feature, idx) => (
               <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                  className="glass-panel p-8 rounded-3xl text-left relative overflow-hidden group"
               >
                   <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
                   <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <feature.icon className="w-7 h-7" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                   <p className="text-gray-700 leading-relaxed font-medium">{feature.desc}</p>
               </motion.div> 
            ))}
        </div>

        {/* Admin Portal Section */}
        <div className="mt-24 max-w-4xl w-full px-4 mb-20">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="glass-panel p-10 rounded-3xl relative overflow-hidden bg-brand-900 text-white shadow-2xl"
               style={{ backgroundColor: '#134e4a' }}
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full z-0 blur-2xl"></div>
               <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="text-left md:text-left text-center">
                     <h2 className="text-3xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3">
                        <svg className="w-8 h-8 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Admin Portal Access
                     </h2>
                     <p className="text-brand-50 max-w-md text-lg mx-auto md:mx-0">
                        Authorized personnel can login here to access system activity, view live predictions, and manage users.
                     </p>
                  </div>
                  <div>
                     <Link 
                        to="/login"
                        className="whitespace-nowrap px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all inline-block border-2 border-teal-800/20"
                        style={{ backgroundColor: '#ffffff', color: '#042f2e' }}
                     >
                        Admin Sign In
                     </Link>
                  </div>
               </div>
            </motion.div>
        </div>

        {/* Reviews Section */}
        <ReviewSection />
      </div>
    </div>
  );
};

export default Home;
