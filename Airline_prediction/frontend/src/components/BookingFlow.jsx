import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';

const BookingFlow = ({ flight, price, onCancel, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Payment, 4: Success
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        passengerName: '',
        passengerEmail: '',
        passengerPhone: '',
        upiId: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handlePay = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCookie = Cookies.get('user');
            const userId = userCookie ? JSON.parse(userCookie).id : null;

            await axios.post('http://localhost:4001/api/bookings', {
                userId,
                ...formData,
                flightDetails: flight,
                price
            });

            setStep(4);
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (err) {
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl bg-white border border-gray-100"
            >
                {/* Step Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {step === 1 && "Passenger Details"}
                            {step === 2 && "Review Booking"}
                            {step === 3 && "Secure Payment"}
                            {step === 4 && "Booking Confirmed!"}
                        </h2>
                        <div className="flex gap-1.5 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${step >= i ? 'w-6 bg-brand-500' : 'w-2 bg-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                    {step < 4 && (
                        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                    <input name="passengerName" value={formData.passengerName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Enter guest name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input name="passengerEmail" type="email" value={formData.passengerEmail} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="alex@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                        <input name="passengerPhone" value={formData.passengerPhone} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <button onClick={handleNext} disabled={!formData.passengerName || !formData.passengerEmail} className="w-full py-4 bg-accent-600 text-white rounded-xl font-bold mt-4 shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:bg-accent-700 transition-all">Continue to Review</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-brand-700 uppercase tracking-widest">{flight.airline.replace('_', ' ')}</span>
                                        <span className="text-xs bg-brand-200 text-brand-800 px-2 py-1 rounded-lg font-bold">{flight.class}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-gray-800">
                                        <span className="text-xl">{flight.source_city}</span>
                                        <div className="h-px flex-grow mx-4 bg-brand-200 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-brand-400">NON-STOP</div>
                                        </div>
                                        <span className="text-xl">{flight.destination_city}</span>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-brand-100 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-brand-400 uppercase font-black mb-1">Estimated Fare</p>
                                            <p className="text-3xl font-black text-brand-600">₹{Math.round(price).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Passenger</p>
                                            <p className="font-bold text-gray-700">{formData.passengerName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mx-auto mb-4">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=aeropredict@upi&pn=AeroPredict&am=${Math.round(price)}&cu=INR`)}`}
                                            alt="UPI QR Code"
                                            className="w-40 h-40"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Scan to Pay Now</h3>
                                    <p className="text-sm text-gray-500 mb-6">Fast & Secure UPI Payment</p>

                                    <div className="max-w-xs mx-auto px-4">
                                        <div className="bg-white p-3 rounded-xl border border-dashed border-gray-200">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Or Enter UPI ID</label>
                                            <input 
                                                name="upiId" 
                                                value={formData.upiId} 
                                                onChange={handleChange} 
                                                className="w-full bg-transparent outline-none text-center text-sm font-mono font-bold text-gray-700" 
                                                placeholder="username@bank" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleBack} disabled={loading} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
                                    <button 
                                        onClick={handlePay} 
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-accent-600 text-white rounded-xl font-bold shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:bg-accent-700 transition-all flex justify-center items-center"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirm & Book Ticket"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                                <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-3xl font-black text-gray-800 mb-2">Booking Success!</h2>
                                <p className="text-gray-500">Your ticket has been booked for {formData.passengerName}.</p>
                                <p className="text-xs text-gray-400 mt-8 mb-4 uppercase tracking-widest font-bold">Transaction Confirmed via UPI</p>
                                <div className="text-[10px] text-gray-300 font-mono">ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingFlow;
