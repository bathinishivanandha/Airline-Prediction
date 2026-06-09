import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import BookingFlow from '../components/BookingFlow';

const Search = () => {
  // Utility for date formatting
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2 - d1;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const todayStr = formatDate(new Date());

  const [formData, setFormData] = useState({
    airline: '',
    source_city: '',
    destination_city: '',
    departure_time: '',
    arrival_time: '',
    stops: '',
    class: 'Economy',
    duration: 2.5,
    days_left: 15,
    booking_date: todayStr,
    travel_date: formatDate(addDays(new Date(), 15)),
    tripType: 'oneway',
    returnDate: formatDate(addDays(new Date(), 20)),
    passengerType: 'adult',
    college: '',
    idCard: null,
    dob: '',
    couponCode: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [hasBookings, setHasBookings] = useState(false);

  useEffect(() => {
    const checkBookings = async () => {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const userId = JSON.parse(userCookie).id;
        try {
          const res = await axios.get(`http://localhost:4001/api/bookings/user/${userId}`);
          setHasBookings(res.data.length > 0);
        } catch (err) {
          console.error("Failed to fetch bookings", err);
        }
      }
    };
    checkBookings();
  }, []);

  // Available options based on dataset features
  const airlines = ["SpiceJet", "AirAsia", "Vistara", "GO_FIRST", "Indigo", "Air_India"];
  const cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Hyderabad", "Chennai"];
  const times = ["Early_Morning", "Morning", "Afternoon", "Evening", "Night", "Late_Night"];
  const stops_options = ["zero", "one", "two_or_more"];
  const classes = ["Economy", "Business"];
  const passengerTypes = ["adult", "student", "senior"];

  const coupons = {
    "FLYHIGH10": { label: "10% OFF", type: 'pct', value: 0.1, condition: () => true },
    "STUDENT20": { label: "20% OFF", type: 'pct', value: 0.2, condition: (data) => data.passengerType === 'student' },
    "WELCOME50": { label: "50% OFF", type: 'pct', value: 0.5, condition: (data, hasB) => !hasB },
    "EARLYBIRD": { label: "20% OFF", type: 'pct', value: 0.2, condition: (data) => data.days_left >= 20 },
    "LASTMINUTE": { label: "₹300 OFF", type: 'flat', value: 300, condition: (data) => data.days_left <= 2 }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let val = value;
      if (["duration", "days_left"].includes(name)) val = Number(value);
      if (name === 'idCard') val = e.target.files[0];
      
      let newState = { ...prev, [name]: val };

      // Synchronization logic
      if (name === 'booking_date') {
        newState.travel_date = formatDate(addDays(new Date(value), prev.days_left));
      } else if (name === 'days_left') {
        newState.travel_date = formatDate(addDays(new Date(prev.booking_date), Number(value)));
      } else if (name === 'travel_date') {
        newState.days_left = getDaysDiff(prev.booking_date, value);
      }

      if (name === 'couponCode') {
        const config = coupons[value.toUpperCase()];
        if (config && config.condition(newState, hasBookings)) {
          setAppliedCoupon({ code: value.toUpperCase(), ...config });
          setCouponError("");
        } else {
          setAppliedCoupon(null);
        }
      }

      // Auto-validate/reset applied coupon on condition change
      if (['passengerType', 'days_left'].includes(name)) {
        if (appliedCoupon) {
          const config = coupons[appliedCoupon.code];
          if (!config.condition(newState, hasBookings)) {
            setAppliedCoupon(null);
            newState.couponCode = '';
          }
        }
      }

      return newState;
    });
  };

  const handleApplyCoupon = () => {
    const code = formData.couponCode.toUpperCase();
    if (coupons[code]) {
      setAppliedCoupon({ code, discount: coupons[code] });
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code");
    }
  };

  const calculateFinalPrice = (basePrice) => {
    let price = basePrice;
    
    // Student & Senior discount (fixed 15%)
    if (['student', 'senior'].includes(formData.passengerType)) {
      price *= 0.85;
    }

    // Coupon discount
    if (appliedCoupon) {
      if (appliedCoupon.type === 'pct') {
        price *= (1 - appliedCoupon.value);
      } else {
        price -= appliedCoupon.value;
      }
    }

    return Math.max(0, price);
  };

  const validatePassengerDetails = () => {
    if (formData.passengerType === 'student') {
      if (!formData.college) return "Please enter your college name";
      if (!formData.idCard) return "Please upload your student ID card";
    }
    if (formData.passengerType === 'senior') {
      if (!formData.dob) return "Please enter your date of birth";
      
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 60) return "Senior citizen discount valid only for ages 60 and above";
    }
    return null;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    
    const validationError = validatePassengerDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    
    const startTime = Date.now();

    try {
      const userCookie = Cookies.get('user');
      const userId = userCookie ? JSON.parse(userCookie).id : null;

      // Predict primary leg
      let res = await axios.post('http://localhost:4001/api/flights/predict', {
        flightDetails: formData,
        userId
      });

      let results = { outbound: res.data.price, return: null };

      // Predict return leg if roundtrip
      if (formData.tripType === 'roundtrip') {
        const returnDaysLeft = getDaysDiff(formData.booking_date, formData.returnDate);
        const returnData = {
          ...formData,
          source_city: formData.destination_city,
          destination_city: formData.source_city,
          days_left: returnDaysLeft
        };

        const returnRes = await axios.post('http://localhost:4001/api/flights/predict', {
          flightDetails: returnData,
          userId
        });
        results.return = returnRes.data.price;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));
      
      setPrediction({
        price: results.outbound + (results.return || 0),
        outbound: results.outbound,
        return: results.return
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get prediction from server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-6 flex-grow flex flex-col md:flex-row gap-8 items-start py-12">
      
      {/* Search Form Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-8 rounded-3xl w-full md:w-[450px] shrink-0 sticky top-24"
      >
         <h2 className="text-2xl font-black text-gray-900 mb-6 flex justify-between items-center">
            Flight Parameters
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-bold scale-75 origin-right">
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, tripType: 'oneway'}))}
                className={`px-3 py-1.5 rounded-md transition-all ${formData.tripType === 'oneway' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-400'}`}
              >One Way</button>
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, tripType: 'roundtrip'}))}
                className={`px-3 py-1.5 rounded-md transition-all ${formData.tripType === 'roundtrip' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-400'}`}
              >Round Trip</button>
            </div>
         </h2>

         <form onSubmit={handlePredict} className="space-y-5">
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</label>
                <select name="source_city" required value={formData.source_city} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                    <option value="" disabled>Select</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Destination</label>
                <select name="destination_city" required value={formData.destination_city} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                    <option value="" disabled>Select</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Departure</label>
                  <select name="departure_time" required value={formData.departure_time} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      <option value="" disabled>Select</option>
                      {times.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Arrival</label>
                  <select name="arrival_time" required value={formData.arrival_time} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      <option value="" disabled>Select</option>
                      {times.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Travel Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    name="travel_date" 
                    min={formData.booking_date}
                    value={formData.travel_date} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  />
                </div>
              </div>
              <AnimatePresence>
                {formData.tripType === 'roundtrip' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Return Date</label>
                    <input 
                      type="date" 
                      name="returnDate" 
                      min={formData.travel_date}
                      value={formData.returnDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Airline</label>
                  <select name="airline" required value={formData.airline} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      <option value="" disabled>Select Airline</option>
                      {airlines.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Passenger</label>
                  <select name="passengerType" value={formData.passengerType} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      {passengerTypes.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stops</label>
                  <select name="stops" required value={formData.stops} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      <option value="" disabled>Select</option>
                      {stops_options.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Class</label>
                  <select name="class" required value={formData.class} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
           </div>

           <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Coupon</label>
              <select 
                name="couponCode" 
                value={formData.couponCode} 
                onChange={handleChange} 
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              >
                <option value="">No Coupon</option>
                {Object.keys(coupons)
                  .filter(code => coupons[code].condition(formData, hasBookings))
                  .map(code => (
                    <option key={code} value={code}>{code} ({coupons[code].label})</option>
                  ))}
              </select>
              {appliedCoupon && <p className="text-[10px] text-emerald-500 mt-1 ml-1">Coupon {appliedCoupon.code} applied!</p>}
           </div>

            <AnimatePresence>
              {formData.passengerType === 'student' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">College/University</label>
                      <input 
                        type="text" 
                        name="college" 
                        placeholder="Ex: MIT"
                        value={formData.college} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Upload ID Card</label>
                      <input 
                        type="file" 
                        name="idCard" 
                        onChange={handleChange} 
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {formData.passengerType === 'senior' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2"
                >
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Birth (Senior)</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Flight Duration: {formData.duration} hrs</label>
              <input 
                type="range" 
                name="duration" 
                min="1" 
                max="15" 
                step="0.5"
                value={formData.duration} 
                onChange={handleChange} 
                className="w-full accent-brand-500" 
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Days to Flight: {formData.days_left}</label>
               <input 
                 type="range" 
                 name="days_left" 
                 min="0" 
                 max="50" 
                 value={formData.days_left} 
                 onChange={handleChange} 
                 className="w-full accent-brand-500" 
               />
            </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:bg-orange-700 transition-all disabled:opacity-70 flex justify-center items-center"
           >
             {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : 'Predict Ticket Price'}
           </button>
         </form>
      </motion.div>

      {/* Results Area */}
      <div className="flex-grow flex items-center justify-center min-h-[500px]">
         <AnimatePresence mode="wait">
            {!prediction && !loading && !error && (
                <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="text-center text-gray-400 max-w-sm"
                >
                   <div className="w-24 h-24 mx-auto mb-6 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22currentColor%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z%22/></svg>')] bg-no-repeat bg-center bg-contain"></div>
                   <h3 className="text-xl font-medium text-gray-500 mb-2">Awaiting Parameters</h3>
                   <p className="text-sm">Fill out the parameters on the left to compute a highly accurate price prediction.</p>
                </motion.div>
            )}

            {loading && (
                <motion.div
                   key="loading"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   className="glass-panel p-10 rounded-3xl w-full max-w-md text-center"
                >
                   <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-6"></div>
                   <p className="text-lg font-medium text-gray-700 animate-pulse">Analyzing historical datasets...</p>
                </motion.div>
            )}

            {error && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel p-10 rounded-3xl w-full max-w-md text-center border-red-100"
                >
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Prediction Failed</h3>
                    <p className="text-gray-500">{error}</p>
                </motion.div>
            )}

            {prediction && !loading && (
                <motion.div
                   key="success"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="glass-panel p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-amber-500"></div>
                   <div className="text-center">
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">Total Estimated Fare</p>
                    
                    <div className="flex justify-center items-start text-gray-900 mb-8">
                        <span className="text-3xl mt-2 font-medium pr-2">₹</span>
                        <span className="text-7xl font-extrabold tracking-tighter">
                            {Math.round(calculateFinalPrice(prediction.price)).toLocaleString()}
                        </span>
                    </div>
                   </div>

                   <div className="space-y-3">
                    <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wider">Outbound Leg</p>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                            <span>{formData.source_city}</span>
                            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            <span>{formData.destination_city}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 uppercase font-bold">
                            <span>{formData.airline} • {formData.class}</span>
                            <span>₹{Math.round(prediction.outbound).toLocaleString()}</span>
                        </div>
                    </div>

                    {prediction.return && (
                        <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wider">Return Leg</p>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                <span>{formData.destination_city}</span>
                                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                <span>{formData.source_city}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 uppercase font-bold">
                                <span>{formData.airline} • {formData.class}</span>
                                <span>₹{Math.round(prediction.return).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {(['student', 'senior'].includes(formData.passengerType) || appliedCoupon) && (
                        <div className="px-2 pt-2 space-y-1">
                            {['student', 'senior'].includes(formData.passengerType) && (
                                <div className="flex justify-between text-xs font-bold text-emerald-600">
                                    <span>{formData.passengerType === 'student' ? 'Student' : 'Senior Citizen'} Discount (15%)</span>
                                    <span>-₹{Math.round(prediction.price * 0.15).toLocaleString()}</span>
                                </div>
                            )}
                            {appliedCoupon && (
                                <div className="flex justify-between text-xs font-bold text-blue-600">
                                    <span>Coupon {appliedCoupon.code} ({appliedCoupon.label})</span>
                                    <span>
                                        -₹{Math.round(
                                            (prediction.price * (['student', 'senior'].includes(formData.passengerType) ? 0.85 : 1)) 
                                            - calculateFinalPrice(prediction.price)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                   </div>

                   {!isBooked ? (
                      <button 
                         onClick={() => setShowBooking(true)}
                         className="w-full mt-8 py-4 bg-accent-600 text-white rounded-xl font-bold shadow-lg shadow-accent-600/30 hover:shadow-accent-600/50 hover:bg-accent-700 transition-all flex items-center justify-center gap-2 group"
                      >
                         <span>Book Now</span>
                         <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                   ) : (
                      <div className="mt-8 py-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-100">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                         <span>Booking Requested</span>
                      </div>
                   )}
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBooking && (
            <BookingFlow 
               flight={formData} 
               price={prediction.price} 
               onCancel={() => setShowBooking(false)}
               onSuccess={() => {
                  setShowBooking(false);
                  setIsBooked(true);
               }}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
