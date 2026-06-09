import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ))}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, reviewsRes, bookingsRes] = await Promise.all([
            axios.get('http://localhost:4001/api/flights/admin/stats'),
            axios.get('http://localhost:4001/api/flights/admin/users'),
            axios.get('http://localhost:4001/api/reviews'),
            axios.get('http://localhost:4001/api/bookings/admin/all')
        ]);
        setStats(statsRes.data);
        setUsersList(usersRes.data);
        setReviews(reviewsRes.data.reviews);
        setReviewAvg(reviewsRes.data.averageRating);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteSearch = async (id) => {
      if(!window.confirm("Delete this prediction log?")) return;
      try {
          await axios.delete(`http://localhost:4001/api/flights/admin/searches/${id}`);
          setStats(prev => ({
              ...prev,
              recentSearches: prev.recentSearches.filter(s => s._id !== id),
              searches: prev.searches - 1
          }));
      } catch (err) {
          alert('Failed to delete search');
      }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`http://localhost:4001/api/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Failed to delete review');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Cancel and delete this booking?")) return;
    try {
      await axios.delete(`http://localhost:4001/api/bookings/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch {
      alert('Failed to delete booking');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div></div>;

  const modelMetrics = [
      { name: 'R2 Score', value: stats?.mlStats?.r2_score * 100 || 0 },
      { name: 'MAE', value: stats?.mlStats?.mae || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full p-6 flex-grow py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">System Activity Overview</h1>
        <p className="text-gray-500">View real-time machine learning and database statistics.</p>
      </div>

      {stats && (
         <>
         {/* Top KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl border-l-4 border-l-brand-500">
                 <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Users</p>
                 <p className="text-4xl font-black text-gray-800">{stats.users}</p>
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl border-l-4 border-l-orange-400">
                 <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Predictions</p>
                 <p className="text-4xl font-black text-gray-800">{stats.searches}</p>
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500">
                 <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Dataset Size</p>
                 <p className="text-4xl font-black text-gray-800">{(stats.mlStats.total_records || 300000).toLocaleString()}</p>
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500">
                 <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Avg. Rating</p>
                 <div className="flex items-end gap-2">
                   <p className="text-4xl font-black text-gray-800">{reviewAvg || '–'}</p>
                   {reviewAvg > 0 && <p className="text-amber-400 text-2xl mb-1">★</p>}
                 </div>
                 <p className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
             </motion.div>
         </div>

         {/* Middle Layer */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 rounded-3xl">
                 <h2 className="text-xl font-bold text-gray-800 mb-6">ML Model Performance</h2>
                 <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={modelMetrics} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                             <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}}/>
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontWeight: 'bold'}}/>
                             <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                             <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={40} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
                 <p className="text-xs text-gray-500 mt-4 text-center">Random Forest Regressor • Trained on Clean_Dataset.csv</p>
             </motion.div>

             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-8 rounded-3xl flex flex-col h-full">
                 <h2 className="text-xl font-bold text-gray-800 mb-6">Live Prediction Stream</h2>
                 <div className="overflow-y-auto flex-grow pr-2 space-y-4 max-h-[256px]">
                     {stats.recentSearches.map((s) => (
                         <div key={s._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                             <div>
                                 <p className="text-sm font-bold text-gray-800">{s.flightDetails.source_city} &rarr; {s.flightDetails.destination_city}</p>
                                 <p className="text-xs text-gray-500">By {s.user ? s.user.username : 'Guest'} • {new Date(s.createdAt).toLocaleTimeString()}</p>
                             </div>
                             <div className="text-right flex items-center justify-end gap-3">
                                 <p className="text-brand-600 font-black text-lg">₹{Math.round(s.predictedPrice)}</p>
                                 <button onClick={() => handleDeleteSearch(s._id)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Delete record">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             </motion.div>
         </div>

         {/* User Management */}
         <div className="mt-8 glass-panel p-8 rounded-3xl mb-8">
             <h2 className="text-xl font-bold text-gray-800 mb-6">User Management</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-gray-200">
                             <th className="py-3 px-4 font-semibold text-gray-600">Username</th>
                             <th className="py-3 px-4 font-semibold text-gray-600">Email</th>
                             <th className="py-3 px-4 font-semibold text-gray-600">Role</th>
                             <th className="py-3 px-4 font-semibold text-gray-600">Joined Date</th>
                         </tr>
                     </thead>
                     <tbody>
                         {usersList.map(u => (
                             <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                 <td className="py-3 px-4 font-medium">{u.username}</td>
                                 <td className="py-3 px-4 text-gray-500">{u.email}</td>
                                 <td className="py-3 px-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                         {u.role.toUpperCase()}
                                     </span>
                                 </td>
                                 <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>

         {/* Reviews Management */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-8 rounded-3xl">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h2 className="text-xl font-bold text-gray-800">User Reviews</h2>
               <p className="text-sm text-gray-500 mt-0.5">
                 {reviews.length} total{reviewAvg > 0 ? ` • Avg ${reviewAvg} ★` : ''}
               </p>
             </div>
           </div>
           {reviews.length === 0 ? (
             <p className="text-center text-gray-400 py-8">No reviews submitted yet.</p>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-gray-200">
                     <th className="py-3 px-4 font-semibold text-gray-600">User</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Rating</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Review</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Date</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {reviews.map(r => (
                     <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                       <td className="py-3 px-4 font-medium">{r.username || 'Anonymous'}</td>
                       <td className="py-3 px-4">
                         <StarDisplay rating={r.rating} />
                       </td>
                       <td className="py-3 px-4 text-gray-500 max-w-xs">
                         {r.review ? (
                           <span className="text-sm">"{r.review}"</span>
                         ) : (
                           <span className="text-xs text-gray-300 italic">No comment</span>
                         )}
                       </td>
                       <td className="py-3 px-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                       <td className="py-3 px-4">
                         <button
                           onClick={() => handleDeleteReview(r._id)}
                           className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                           title="Delete review"
                         >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </motion.div>

         {/* Bookings Management */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel p-8 rounded-3xl mt-8">
           <h2 className="text-xl font-bold text-gray-800 mb-6">Flight Reservations</h2>
           {bookings.length === 0 ? (
             <p className="text-center text-gray-400 py-8">No bookings found.</p>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-gray-200">
                     <th className="py-3 px-4 font-semibold text-gray-600">Passenger</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Flight</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Payment</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                     <th className="py-3 px-4 font-semibold text-gray-600">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {bookings.map(b => (
                     <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                       <td className="py-3 px-4">
                         <div className="font-medium text-gray-800">{b.passengerName}</div>
                         <div className="text-[10px] text-gray-400">{b.passengerEmail}</div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="text-sm font-bold">{b.flightDetails.source_city} &rarr; {b.flightDetails.destination_city}</div>
                         <div className="text-[10px] text-gray-500">{b.flightDetails.airline.replace('_', ' ')} • {b.flightDetails.class}</div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="text-sm font-black text-gray-900">₹{b.price.toLocaleString()}</div>
                         <div className="text-[10px] font-mono text-gray-400">{b.upiId}</div>
                       </td>
                       <td className="py-3 px-4">
                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${b.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                           {b.status.toUpperCase()}
                         </span>
                       </td>
                       <td className="py-3 px-4">
                         <button onClick={() => handleDeleteBooking(b._id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </motion.div>
         </>
      )}
    </div>
  );
};

export default AdminDashboard;
