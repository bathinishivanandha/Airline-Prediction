import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const [histRes, bookRes] = await Promise.all([
          axios.get(`http://localhost:4001/api/flights/history/${user.id}`),
          axios.get(`http://localhost:4001/api/bookings/user/${user.id}`)
        ]);
        setHistory(histRes.data);
        setBookings(bookRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this ticket? \n\nCancellation Policy:\n- Full refund within 24h of booking.\n- 50% refund if >48h before travel.\n- No refund if <48h before travel.")) {
      return;
    }

    try {
      const res = await axios.post(`http://localhost:4001/api/bookings/${bookingId}/cancel`);
      alert(`Ticket cancelled! Refund Amount: ₹${res.data.refundAmount}`);
      // Refresh bookings
      const bookRes = await axios.get(`http://localhost:4001/api/bookings/user/${user.id}`);
      setBookings(bookRes.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel ticket");
    }
  };

  // Format history for chart if available
  const chartData = history.slice(0, 10).reverse().map((h, i) => ({
    name: `Search ${i+1}`,
    price: h.predictedPrice
  }));

  if (loading) return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto w-full p-6 flex-grow py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}</h1>
        <p className="text-gray-500">View your search history and track predicted flight trends.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Chart Area */}
            {history.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass-panel p-6 rounded-3xl"
               >
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                     <ArrowTrendingDownIcon className="w-6 h-6 text-brand-500" />
                     Your Recent Price Trends
                  </h2>
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                 <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                           <Tooltip 
                               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                               labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                           />
                           <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </motion.div>
            )}

            {/* Bookings Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-3xl border-l-4 border-l-orange-500"
            >
               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600 shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  Your Flight Bookings
               </h2>

               {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm italic">You haven't booked any flights yet.</p>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {bookings.map((booking) => (
                        <div key={booking._id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">{booking.status}</span>
                              <span className="text-xs text-gray-400 font-mono">#{booking.transactionId.slice(-6)}</span>
                           </div>
                           <div className="flex items-center gap-2 font-bold text-gray-800 mb-1">
                              <span>{booking.flightDetails.source_city}</span>
                              <svg className="w-4 h-4 text-gray-400 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                              <span>{booking.flightDetails.destination_city}</span>
                              {booking.status !== 'Cancelled' && (
                                 <button 
                                   onClick={() => handleCancel(booking._id)}
                                   className="ml-auto text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-lg uppercase transition-colors"
                                 >Cancel</button>
                               )}
                            </div>
                           <p className="text-xs text-gray-500 mb-3">{booking.flightDetails.airline.replace('_', ' ')} • {booking.flightDetails.class}</p>
                           <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                              <div>
                                 <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Passenger</p>
                                 <p className="text-sm font-semibold text-gray-700">{booking.passengerName}</p>
                              </div>
                               <div className="text-right">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{booking.status === 'Cancelled' ? 'Refunded' : 'Paid'}</p>
                                  <p className={`text-lg font-black ${booking.status === 'Cancelled' ? 'text-red-500' : 'text-gray-900'}`}>
                                    ₹{(booking.status === 'Cancelled' ? booking.refundAmount : booking.price).toLocaleString()}
                                  </p>
                               </div>
                            </div>
                            {booking.status === 'Cancelled' && (
                              <p className="text-[10px] text-gray-400 mt-2 italic text-center border-t border-gray-50 pt-2">
                                Cancelled on {new Date(booking.cancellationDate).toLocaleDateString()}
                              </p>
                            )}
                        </div>
                     ))}
                  </div>
               )}
            </motion.div>

            {/* History List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-3xl"
            >
               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-blue-500" />
                  Search History
               </h2>
               
               {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No searches yet. Go to <a href="/search" className="text-brand-600 underline">Predict Prices</a> to start tracking!</p>
               ) : (
                  <div className="space-y-4">
                     {history.map((log) => (
                        <div key={log._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white transition-colors group">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                               <span className="font-bold text-gray-800">{log.flightDetails.source_city}</span>
                                 <svg className="w-4 h-4 text-gray-400 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                 <span className="font-bold text-gray-800">{log.flightDetails.destination_city}</span>
                              </div>
                              <p className="text-sm text-gray-500">
                                 {log.flightDetails.airline} • {log.flightDetails.class} • {log.flightDetails.days_left} days out
                              </p>
                           </div>
                           <div className="mt-4 sm:mt-0 text-right">
                              <p className="text-sm text-gray-500 uppercase tracking-wider mb-0.5">{log.currency}</p>
                              <p className="text-2xl font-black text-gray-900 group-hover:text-brand-600 transition-colors">
                                 ₹{Math.round(log.predictedPrice).toLocaleString()}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </motion.div>
        </div>

        {/* Notifications Sidebar */}
        <div className="lg:col-span-1 space-y-8">
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-white"
             >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                   Notifications
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100 flex gap-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                       <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Prices Dropping Soon</p>
                          <p className="text-xs text-gray-500 mt-1">Our ML model indicates flights from Delhi to Mumbai drop 15% when booked 20 days in advance.</p>
                       </div>
                   </div>

                   <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100 flex gap-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                       <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Best Time to Book</p>
                          <p className="text-xs text-gray-500 mt-1">Tuesdays generally offer the lowest fares for Vistara business class. Set an alert!</p>
                       </div>
                   </div>
                </div>
             </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
