'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Search, PlusCircle, Calendar, Users, Clock, CheckCircle, XCircle, Trash2, ShieldAlert, Loader2, Phone } from 'lucide-react';
import Image from 'next/image';
import { collection, getDocs, onSnapshot, query, orderBy, Timestamp, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));

interface Reservation {
    id?: string;
    docId?: string;
    name: string;
    phone: string;
    email?: string;
    purpose?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    guests: number;
    status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
    notes?: string;
    timestamp?: Timestamp;
}

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">Please contact the administrator if you believe this is an error.</p>
    </div>
);

const AddReservationModal = ({ isOpen, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState<Partial<Reservation>>({
        name: '',
        phone: '',
        email: '',
        purpose: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
        status: 'Pending',
        notes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold">New Reservation</h2>
                    <button onClick={onClose}><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Phone</label>
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Email (Optional)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Date</label>
                            <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Time</label>
                            <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Guests</label>
                            <input type="number" name="guests" min="1" required value={formData.guests} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Purpose (Optional)</label>
                            <select name="purpose" value={formData.purpose} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="">None</option>
                                <option value="Casual Dining">Casual Dining</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Anniversary">Anniversary</option>
                                <option value="Business Meeting">Business Meeting</option>
                                <option value="Date">Date</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none h-20" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-semibold rounded-md bg-senoa-green text-white hover:bg-senoa-green-dark flex items-center">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Save Reservation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReservationsPage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [dataLoading, setDataLoading] = useState(true);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/dashboard/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const reservationsCollection = collection(db, 'reservations');
            // Assuming we might want to order by date, but simple snapshot is fine for now
            const q = query(reservationsCollection);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedReservations = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Reservation));
                // Sort by date and time locally for now
                fetchedReservations.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateB.getTime() - dateA.getTime();
                });
                setReservations(fetchedReservations);
                setDataLoading(false);
            }, (error) => {
                console.error("Error fetching reservations:", error);
                setDataLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);



    const handleAddReservation = async (data: Reservation) => {
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'reservations'), {
                ...data,
                timestamp: new Date()
            });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error adding reservation:", error);
            alert("Failed to add reservation.");
        } finally {
            setIsSaving(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const reservationRef = doc(db, 'reservations', id);
            await updateDoc(reservationRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteReservation = async (id: string) => {
        if (confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteDoc(doc(db, 'reservations', id));
            } catch (error) {
                console.error("Error deleting reservation:", error);
            }
        }
    };

    const filteredReservations = useMemo(() => {
        return reservations.filter(res =>
            res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.phone.includes(searchQuery)
        );
    }, [reservations, searchQuery]);

    const renderContent = () => {
        if (loading || dataLoading) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="animate-spin h-8 w-8 text-senoa-green" />
                </div>
            );
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {
            // Basic auth check matching other pages
            return <AccessDenied />;
        }
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Reservations</h1>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-senoa-green text-white hover:bg-senoa-green-dark transition-colors">
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Reservation</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Date & Time</th>
                                    <th scope="col" className="px-6 py-3">Guests</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No reservations found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map((res) => (
                                        <tr key={res.docId} className="bg-white border-b hover:bg-gray-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-semibold">{res.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Phone className="h-3 w-3 mr-1" /> {res.phone}
                                                        </span>
                                                        {res.email && (
                                                            <span className="text-xs text-gray-400 border-l pl-2">{res.email}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {res.date}
                                                    <Clock className="h-4 w-4 ml-3 mr-2 text-gray-400" />
                                                    {res.time}
                                                </div>
                                                {res.notes && <div className="text-xs text-gray-500 mt-1 italic">"{res.notes}"</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                                                        {res.guests}
                                                    </div>
                                                    {res.purpose && (
                                                        <span className="text-xs text-senoa-green bg-green-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                                                            {res.purpose}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={res.status}
                                                    onChange={(e) => updateStatus(res.docId!, e.target.value)}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full border outline-none cursor-pointer
                                                        ${res.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                            res.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                res.status === 'Completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => deleteReservation(res.docId!)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AddReservationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddReservation}
                isSaving={isSaving}
            />

            {renderContent()}
        </div>
    );
};

export default ReservationsPage;
