'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Users, User, Phone, Mail, FileText, CheckCircle, ChevronLeft } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface TableBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    { id: 1, title: 'Date & Time' },
    { id: 2, title: 'Guests' },
    { id: 3, title: 'Details' },
    { id: 4, title: 'Special Requests' },
    { id: 5, title: 'Review' },
];

export const TableBookingModal = ({ isOpen, onClose }: TableBookingModalProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
        name: '',
        phone: '',
        email: '',
        purpose: '',
        specialRequest: '',
    });
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const confirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const docRef = await addDoc(collection(db, 'reservations'), {
                ...formData,
                notes: formData.specialRequest, // Map specialRequest to notes for dashboard compatibility
                status: 'Pending',
                timestamp: serverTimestamp(),
            });
            setBookingId(docRef.id);
            setStep(6); // Success screen
        } catch (error) {
            console.error("Error booking table:", error);
            alert("Failed to book table. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Step Content Renderers ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-center">When would you like to come?</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Calendar size={16} /> Date
                    </label>
                    <input
                        type="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateFormData('date', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none bg-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Clock size={16} /> Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'].map(t => (
                            <button
                                key={t}
                                onClick={() => updateFormData('time', t)}
                                className={`py-2 px-1 rounded-md text-sm font-medium transition-colors ${formData.time === t ? 'bg-senoa-green text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={handleNext} className="w-full bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all shadow-lg">
                Continue
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-center">How many people?</h3>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-3 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                            key={num}
                            onClick={() => updateFormData('guests', num)}
                            className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center transition-all ${formData.guests === num ? 'bg-senoa-green text-white scale-110 shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
                {formData.guests > 6 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm text-center">
                        For large groups, we may call you to confirm the booking.
                    </div>
                )}
            </div>
            <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200">Back</button>
                <button onClick={handleNext} className="flex-1 bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 shadow-lg">Continue</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-center">Your Details</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Purpose <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <select
                        value={formData.purpose}
                        onChange={(e) => updateFormData('purpose', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none bg-white"
                    >
                        <option value="">Select Purpose</option>
                        <option value="Casual Dining">Casual Dining</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Business Meeting">Business Meeting</option>
                        <option value="Date">Date</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200">Back</button>
                <button
                    onClick={handleNext}
                    disabled={!formData.name || !formData.phone}
                    className="flex-1 bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-center">Special Requests <span className="text-gray-400 font-normal text-sm block mt-1">(Optional)</span></h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {['Birthday', 'Window Seat', 'High Chair', 'Quiet Corner'].map(req => (
                    <button
                        key={req}
                        onClick={() => {
                            const current = formData.specialRequest;
                            if (current.includes(req)) {
                                updateFormData('specialRequest', current.replace(new RegExp(req + ',? ?'), '').trim());
                            } else {
                                updateFormData('specialRequest', current ? `${current}, ${req}` : req);
                            }
                        }}
                        className={`py-2 px-3 border rounded-lg text-sm transition-colors ${formData.specialRequest.includes(req) ? 'bg-senoa-green/10 border-senoa-green text-senoa-green font-semibold' : 'hover:bg-gray-50'}`}
                    >
                        {req}
                    </button>
                ))}
            </div>

            <div>
                <textarea
                    placeholder="Any other specific requests? (e.g. dietary restrictions)"
                    value={formData.specialRequest}
                    onChange={(e) => updateFormData('specialRequest', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-senoa-green outline-none h-24"
                />
            </div>

            <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200">Back</button>
                <button onClick={handleNext} className="flex-1 bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 shadow-lg">Review</button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-center">Review Booking</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border">
                <div className="flex items-center gap-3">
                    <Calendar className="text-senoa-green" size={20} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Date & Time</p>
                        <p className="font-semibold">{formData.date} at {formData.time}</p>
                    </div>
                </div>
                <div className="h-px bg-gray-200 w-full" />
                <div className="flex items-center gap-3">
                    <Users className="text-senoa-green" size={20} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Guests</p>
                        <p className="font-semibold">{formData.guests} People</p>
                    </div>
                </div>
                <div className="h-px bg-gray-200 w-full" />
                <div className="flex items-center gap-3">
                    <FileText className="text-senoa-green" size={20} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Contact</p>
                        <p className="font-semibold">{formData.name}</p>
                        <p className="text-sm text-gray-600">{formData.phone}</p>
                    </div>
                </div>
                {formData.specialRequest && (
                    <>
                        <div className="h-px bg-gray-200 w-full" />
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-senoa-green mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Requests</p>
                                <p className="text-sm">{formData.specialRequest}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200">Back</button>
                <button
                    onClick={confirmBooking}
                    disabled={isSubmitting}
                    className="flex-1 bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    Confirm
                </button>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6 text-center animate-in zoom-in fade-in duration-500 py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-senoa-green w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-senoa-green">Your Table is Reserved!</h3>
            <p className="text-gray-600">We look forward to hosting you, <span className="font-semibold">{formData.name}</span>.</p>

            <div className="bg-gray-50 p-4 rounded-xl border inline-block w-full max-w-xs mx-auto">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Booking ID</p>
                <p className="font-mono text-lg font-bold tracking-widest">{bookingId}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="font-semibold text-senoa-green">{formData.date} • {formData.time}</p>
                </div>
            </div>

            <p className="text-sm text-gray-500">Need to make changes?</p>
            <a href="tel:+917560090700" className="inline-flex items-center gap-2 text-senoa-green font-bold hover:underline">
                <Phone size={16} /> Call Us: +91 75600 90700
            </a>

            <button onClick={onClose} className="block w-full bg-senoa-green text-white py-3 rounded-lg font-bold hover:brightness-110 shadow-lg mt-4">
                Done
            </button>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-senoa-cream/30">
                    {step < 6 ? (
                        <div className="flex items-center gap-2">
                            {step > 1 && (
                                <button onClick={handleBack} className="p-1 rounded-full hover:bg-gray-100 transition">
                                    <ChevronLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <p className="font-bold text-senoa-green">Step {step} of 5</p>
                        </div>
                    ) : <div />} {/* Spacer for layout balance */}

                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                {step < 6 && (
                    <div className="h-1 bg-gray-100 w-full">
                        <div
                            className="h-full bg-senoa-green transition-all duration-300 ease-out"
                            style={{ width: `${(step / 5) * 100}%` }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                </div>
            </div>
        </div>
    );
};
