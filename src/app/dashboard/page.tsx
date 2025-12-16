
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Clock, List, LogOut, Package, RefreshCw, TrendingUp, Users, IndianRupee, Bike, ShoppingBag, X, Phone, Send, Calendar, PlusCircle, Database, User, ClipboardList, Book, DollarSign, Search, Plus, Minus, CalendarPlus, Menu, ClipboardEdit, Info, Tag, Bell, MapPin, Navigation, Edit, Save, Music, Loader2, XCircle, MessageSquare, Eye, EyeOff, LifeBuoy, ShieldAlert, BarChart3, Megaphone, ChefHat, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, generateReadableOrderId } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs, where, writeBatch } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));


const flattenedMenuItems = []; // This will be populated from Firestore

// Define the Order type
interface Order {
    docId: string;
    id: string;
    customer: { name: string; phone: string; };
    type: 'Delivery' | 'Take-away';
    address: string;
    items: string;
    total: number;
    status: 'Accept Order' | 'On its way' | 'Delivered' | 'Declined';
    timestamp: Timestamp;
    seen: boolean;
    showNotification: 'new' | 'preparing' | 'on a way' | 'delivered' | 'declined' | 'none';
    location?: { latitude: number; longitude: number };
    appliedCoupon?: { code: string; discount: number };
    cart?: { name: string, quantity: number, price: number, gst_percent?: number }[];
}

const OrderStatusButton = ({ status, onClick }) => {
    const statuses = ['Accept Order', 'On its way', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    const getNextStatus = () => {
        if (status === 'Accept Order') return "On its way";
        if (status === 'On its way') return "Mark Delivered";
        return status;
    };

    const nextStatusLabel = getNextStatus();

    const colors = {
        'Accept Order': 'bg-blue-500',
        'On its way': 'bg-yellow-500',
        'Mark Delivered': 'bg-senoa-green',
        'Delivered': 'bg-senoa-green',
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        onClick();
    };

    if (status === 'Delivered') {
        return (
            <div className={`text-white text-[10px] font-bold py-1 px-3 rounded-full w-28 text-center transition-colors ${colors[status]}`}>
                Delivered
            </div>
        )
    }

    return (
        <button onClick={handleButtonClick} className={`text-white text-[10px] font-bold py-1 px-3 rounded-full w-28 text-center transition-colors ${colors[status]}`}>
            {nextStatusLabel}
        </button>
    )
}

const UpdateModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const updateMessages = [
        "Your order is confirmed and will be delivered shortly.",
        "Our rider is on the way to your location.",
        "Your order is ready for pickup.",
        "Thank you for your patience. Your order is slightly delayed but will be with you soon."
    ];

    const handleSend = (message) => {
        const whatsappUrl = `https://wa.me/${order.customer.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Share Update with {order.customer.name}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {updateMessages.map((msg, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm flex-1">{msg}</p>
                            <button onClick={() => handleSend(msg)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 transition-colors ml-2">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

interface CustomerData {
    name: string;
    phone: string;
    address: string;
}

// CreateOrderModal has been moved to @/components/CreateOrderModal


const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const displayId = order.id;
    const orderTimestamp = order.timestamp instanceof Timestamp ? order.timestamp.toDate() : new Date();

    const itemSubTotal = useMemo(() => {
        return order.cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    }, [order.cart]);

    const discount = order.appliedCoupon?.discount || 0;

    const MIN_ORDER_FOR_FREE_DELIVERY = 399;
    const deliveryCharge = useMemo(() => {
        if (order.type === 'Take-away') return 0;
        return itemSubTotal < MIN_ORDER_FOR_FREE_DELIVERY ? 20 : 0;
    }, [itemSubTotal, order.type]);

    const gstTax = useMemo(() => {
        if (!order.cart) return 0;
        return order.cart.reduce((totalTax, item) => {
            const itemTotal = item.price * item.quantity;
            const itemGst = (item.gst_percent || 5) / 100; // Default to 5% if not set
            return totalTax + (itemTotal * itemGst);
        }, 0);
    }, [order.cart]);

    const toPay = itemSubTotal - discount + deliveryCharge + gstTax;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Order #{displayId}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">Customer Details</h3>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p className="font-semibold">{order.customer.name}</p>
                            <p>{order.customer.phone}</p>
                            {order.type === 'Delivery' && <p className='mt-1'>{order.address}</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">Bill Details</h3>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                            {order.cart?.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>{item.quantity} x {item.name}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">Item Subtotal</p>
                                <p>₹{itemSubTotal.toFixed(2)}</p>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-senoa-green">
                                    <p>Discount ({order.appliedCoupon.code})</p>
                                    <p>- ₹{discount.toFixed(2)}</p>
                                </div>
                            )}
                            {deliveryCharge > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Delivery Charge</p>
                                    <p>₹{deliveryCharge.toFixed(2)}</p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">GST</p>
                                <p>₹{gstTax.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">Order Info</h3>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                            <p><span className="font-semibold w-20 inline-block">Type:</span> {order.type}</p>
                            <p><span className="font-semibold w-20 inline-block">Status:</span> {order.status}</p>
                            <p><span className="font-semibold w-20 inline-block">Timestamp:</span> {orderTimestamp.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 flex justify-between items-center rounded-b-lg border-t">
                    <span className="font-bold text-base">Grand Total</span>
                    <span className="font-bold text-base">₹{toPay.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

const OrderCard = ({ order, onStatusChange, onCancel, onShareUpdate, onCardClick }) => {
    const handleGetDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (order.location) {
            const { latitude, longitude } = order.location;
            const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            window.open(url, '_blank');
        } else if (order.address && order.address !== 'N/A' && order.address !== 'Take-away') {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
            window.open(url, '_blank');
        }
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const orderTimestamp = order.timestamp instanceof Timestamp ? order.timestamp.toDate() : new Date();

    const displayId = order.id || order.docId.slice(0, 6);
    const isFulfilled = order.status === 'Delivered' || order.status === 'Declined';


    return (
        <div className={`bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col relative cursor-pointer hover:shadow-md transition-shadow ${order.status === 'Declined' ? 'bg-red-50' : ''}`} onClick={() => onCardClick(order)}>
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                {!isFulfilled && (
                    <>
                        <OrderStatusButton status={order.status} onClick={() => onStatusChange(order.docId, order.status)} />
                        <button onClick={(e) => { stopPropagation(e); onCancel(order.docId); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                    <p className="font-bold text-sm">Order #{displayId}</p>
                    {isFulfilled && (
                        <div className="flex items-center">
                            <p className="text-xs text-muted-foreground">({order.type})</p>
                        </div>
                    )}
                </div>
                <p className="text-sm font-semibold mb-2">{order.customer.name}</p>
                <p className="text-xs text-gray-800 pr-24 truncate">{order.items}</p>
                <div className="flex items-center justify-between md:space-x-4 mt-3">
                    <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm">₹{order.total.toFixed(2)}</p>
                        {order.appliedCoupon && (
                            <div className="text-xs font-semibold text-white bg-senoa-green px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Tag size={12} />
                                <span>{order.appliedCoupon.code}</span>
                            </div>
                        )}
                    </div>
                    {isFulfilled && (
                        order.status === 'Delivered' ? (
                            <OrderStatusButton status={order.status} onClick={() => { }} />
                        ) : (
                            <div className={`text-red-600 text-[10px] font-bold py-1 px-3 rounded-full w-28 text-center bg-red-200 flex items-center justify-center space-x-1`}>
                                <XCircle size={12} />
                                <span>Declined</span>
                            </div>
                        )
                    )}
                </div>
            </div>
            {!isFulfilled && <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <a href={`tel:${order.customer.phone}`} onClick={stopPropagation} className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-full hover:bg-blue-100">
                            <Phone className="h-4 w-4" />
                        </a>
                        <button onClick={(e) => { stopPropagation(e); onShareUpdate(order); }} className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-full hover:bg-blue-100">
                            <MessageSquare className="h-4 w-4" />
                        </button>
                    </div>
                    {order.type === 'Delivery' && (
                        <button onClick={handleGetDirections} className="text-sm font-semibold text-senoa-green p-1.5 rounded-full hover:bg-green-100">
                            Get Directions
                        </button>
                    )}
                </div>

            </div>}
        </div>
    );
};


const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">Please contact the administrator if you believe this is an error.</p>
        <button onClick={() => auth.signOut()} className="mt-6 flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
        </button>
    </div>
);


export default function DashboardPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    interface Reservation {
        id?: string;
        docId: string; // Made required since we always fetch it
        name: string;
        phone: string;
        email?: string;
        purpose?: string;
        date: string;
        time: string;
        guests: number;
        status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
        notes?: string;
        timestamp?: Timestamp;
    }

    const [orders, setOrders] = useState<Order[]>([]);
    const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
    const [selectedRange, setSelectedRange] = useState('This Month');
    // Removed duplicate isLoading if it was there, but adding isLoading here as it is used
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Modal & Selection States
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
    const [activePlaylistTab, setActivePlaylistTab] = useState('playlist1');
    const defaultPlaylists = {
        playlist1: 'https://open.spotify.com/embed/playlist/11nSleISOWGLboWVWPDuwB',
        playlist2: 'https://open.spotify.com/embed/playlist/2supAoPJgyanj1EDv7VV6E',
        playlist3: 'https://open.spotify.com/embed/playlist/2JfKYcemASlKFkjqFYwJIf',
        playlist4: 'https://open.spotify.com/embed/playlist/3cXBYazaDFu80FJWoQd9mq',
        playlist5: 'https://open.spotify.com/embed/playlist/3YIyuHDD3DtS91ANe1NbHN',
    };
    const [playlists, setPlaylists] = useState(defaultPlaylists);
    const [tempPlaylists, setTempPlaylists] = useState(playlists);
    const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);
    const [isOrderHistoryVisible, setIsOrderHistoryVisible] = useState(false);


    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    const showConfirmationModal = (props) => {
        setConfirmationModalProps(props);
        setIsConfirmationModalOpen(true);
    };


    useEffect(() => {
        const storedPlaylists = localStorage.getItem('spotifyPlaylists');
        if (storedPlaylists) {
            const parsedPlaylists = JSON.parse(storedPlaylists);
            setPlaylists(parsedPlaylists);
            setTempPlaylists(parsedPlaylists);
        }
    }, []);

    const handleEditPlaylist = () => {
        setTempPlaylists(playlists); // Reset temp URLs to current saved ones
        setIsEditingPlaylist(true);
    };

    const handleSavePlaylists = () => {
        const newPlaylists = { ...tempPlaylists };
        // Basic validation to ensure it's a Spotify URL
        Object.keys(newPlaylists).forEach(key => {
            if (newPlaylists[key].includes('open.spotify.com/playlist/')) {
                newPlaylists[key] = newPlaylists[key].replace("open.spotify.com/playlist/", "open.spotify.com/embed/playlist/");
            } else if (newPlaylists[key].includes('open.spotify.com/embed/playlist/')) {
                // It's already in the correct format
            }
            else {
                // If invalid, revert to the original URL for that tab
                newPlaylists[key] = playlists[key];
            }
        });

        setPlaylists(newPlaylists);
        localStorage.setItem('spotifyPlaylists', JSON.stringify(newPlaylists));
        setIsEditingPlaylist(false);
    };

    const handleTempPlaylistChange = (tab, url) => {
        setTempPlaylists(prev => ({ ...prev, [tab]: url }));
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/dashboard/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));

        const unsubscribeOrders = onSnapshot(q, (snapshot) => {
            const allOrders: Order[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    docId: doc.id,
                    ...data
                } as Order;
            });

            const confirmedOrders = allOrders.filter(o => o.seen === true);
            setOrders(confirmedOrders);
        });

        // Fetch Today's Reservations
        const today = new Date().toISOString().split('T')[0];
        const resQuery = query(collection(db, 'reservations'), where('date', '==', today));

        const unsubscribeReservations = onSnapshot(resQuery, (snapshot) => {
            const fetchedReservations = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            // Sort by time
            fetchedReservations.sort((a, b) => {
                const timeA = parseInt(a.time.replace(':', ''));
                const timeB = parseInt(b.time.replace(':', ''));
                return timeA - timeB;
            });
            setTodayReservations(fetchedReservations);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeReservations();
        }
    }, [user]);


    const handleStatusChange = async (orderDocId, currentStatus) => {
        let nextStatus;
        let updateData: { status: string; showNotification?: string };

        if (currentStatus === 'Accept Order') {
            nextStatus = 'On its way';
            updateData = { status: nextStatus, showNotification: 'on a way' };
        } else if (currentStatus === 'On its way') {
            nextStatus = 'Delivered';
            updateData = { status: nextStatus, showNotification: 'delivered' };
        } else {
            return;
        }

        await updateDoc(doc(db, 'orders', orderDocId), updateData);
    };

    const confirmCancelOrder = (orderDocId: string) => {
        showConfirmationModal({
            title: 'Delete Order',
            message: 'Are you sure you want to delete this order? This action is permanent.',
            onConfirm: () => handleCancelOrder(orderDocId),
            confirmText: 'Delete'
        });
    };

    const handleCancelOrder = async (orderDocId) => {
        await deleteDoc(doc(db, 'orders', orderDocId));
    };

    const handleShareUpdate = (order) => {
        setSelectedOrder(order);
        setIsUpdateModalOpen(true);
    }

    const handleCardClick = (order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const filteredOrdersByDate = useMemo(() => {
        const now = new Date();
        const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return orders.filter(order => {
            if (!order.timestamp) return false;
            // Convert Firestore Timestamp to JS Date object
            const orderDate = order.timestamp.toDate();
            if (isNaN(orderDate.getTime())) return false; // Invalid date check

            switch (selectedRange) {
                case 'Today': {
                    return orderDate.toDateString() === now.toDateString();
                }
                case 'Yesterday': {
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    return orderDate.toDateString() === yesterday.toDateString();
                }
                case 'This Week': {
                    const weekStart = startOfDay(new Date(now.setDate(now.getDate() - now.getDay())));
                    return orderDate >= weekStart;
                }
                case 'Last Week': {
                    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
                    const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 1);
                    return orderDate >= startOfDay(lastWeekStart) && orderDate < startOfDay(lastWeekEnd);
                }
                case 'This Month': {
                    return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth();
                }
                case 'Last Month': {
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return orderDate.getFullYear() === lastMonth.getFullYear() && orderDate.getMonth() === lastMonth.getMonth();
                }
                case 'Previous Month': {
                    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                    return orderDate.getFullYear() === prevMonth.getFullYear() && orderDate.getMonth() === prevMonth.getMonth();
                }
                case 'This Year': {
                    return orderDate.getFullYear() === now.getFullYear();
                }
                default:
                    return true;
            }
        });
    }, [orders, selectedRange]);

    const metrics = useMemo(() => {
        const fulfilledOrders = filteredOrdersByDate.filter(o => o.status === 'Delivered');
        const totalSales = fulfilledOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = fulfilledOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined').length;
        return { totalSales, totalOrders, avgOrderValue, activeOrdersCount };
    }, [filteredOrdersByDate, orders]);

    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined');
    const deliveryOrders = activeOrders.filter(o => o.type === 'Delivery');
    const takeAwayOrders = activeOrders.filter(o => o.type === 'Take-away');

    const groupOrdersByDate = (ordersToGroup: Order[]) => {
        const groups: Record<string, Order[]> = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();

        ordersToGroup.forEach(order => {
            if (!order.timestamp) return;
            const orderDate = order.timestamp.toDate();
            const orderDateStr = orderDate.toDateString();
            let key;
            if (orderDateStr === todayStr) {
                key = 'Today';
            } else if (orderDateStr === yesterdayStr) {
                key = 'Yesterday';
            } else {
                key = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order);
        });
        return groups;
    };

    const [activeOrderTab, setActiveOrderTab] = useState<'Delivery' | 'Take-away'>('Delivery');

    const fulfilledAndDeclinedOrders = filteredOrdersByDate.filter(o => o.status === 'Delivered' || o.status === 'Declined');
    const groupedOrderHistory = groupOrdersByDate(fulfilledAndDeclinedOrders);

    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin h-8 w-8" /></div>;
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {

            return <AccessDenied />;
        }
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="sm:hidden flex space-x-2 mb-6">
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex-1 flex items-center justify-center space-x-2 text-xs font-semibold px-2 py-3 rounded-lg bg-senoa-green text-white hover:bg-senoa-green-dark transition-colors">
                        <PlusCircle className="h-4 w-4" />
                        <span>Create</span>
                    </button>
                    <button onClick={() => router.push('/dashboard/edit-menu')} className="flex-1 flex items-center justify-center space-x-2 text-xs font-semibold px-2 py-3 rounded-lg border text-gray-700 hover:bg-gray-100 transition-colors">
                        <ClipboardEdit className="h-4 w-4" />
                        <span>Menu</span>
                    </button>
                    <button onClick={() => router.push('/dashboard/database')} className="flex-1 flex items-center justify-center space-x-2 text-xs font-semibold px-2 py-3 rounded-lg border text-gray-700 hover:bg-gray-100 transition-colors">
                        <Database className="h-4 w-4" />
                        <span>Data</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className={`space-y-8 ${isPlaylistVisible ? 'lg:col-span-2' : 'lg:col-span-3 w-full max-w-5xl mx-auto'}`}>
                                {/* Analytics Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold flex items-center">
                                            <BarChart className="h-5 w-5 mr-2" /> Key Metrics
                                        </h2>
                                        <select
                                            value={selectedRange}
                                            onChange={(e) => setSelectedRange(e.target.value)}
                                            className="text-sm border rounded-md px-3 py-1 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                        >
                                            <option>Today</option>
                                            <option>Yesterday</option>
                                            <option>This Week</option>
                                            <option>Last Week</option>
                                            <option>This Month</option>
                                            <option>Last Month</option>
                                            <option>Previous Month</option>
                                            <option>This Year</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <h3 className="text-sm text-muted-foreground flex items-center"><IndianRupee className="h-4 w-4 mr-1" />Total Sales</h3>
                                            <p className="text-2xl font-bold">₹<AnimatedCounter endValue={metrics.totalSales} /></p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <h3 className="text-sm text-muted-foreground flex items-center"><Package className="h-4 w-4 mr-1" />Fulfilled Orders</h3>
                                            <p className="text-2xl font-bold"><AnimatedCounter endValue={metrics.totalOrders} /></p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <h3 className="text-sm text-muted-foreground flex items-center"><TrendingUp className="h-4 w-4 mr-1" />Avg. Order Value</h3>
                                            <p className="text-2xl font-bold">₹<AnimatedCounter endValue={metrics.avgOrderValue} /></p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <h3 className="text-sm text-muted-foreground flex items-center"><Users className="h-4 w-4 mr-1" />Active Orders</h3>
                                            <p className="text-2xl font-bold"><AnimatedCounter endValue={metrics.activeOrdersCount} /></p>
                                        </div>
                                    </div>
                                </section>

                                {/* Active Orders Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold flex items-center"><Clock className="h-5 w-5 mr-2" /> Active Orders</h2>
                                        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setActiveOrderTab('Delivery')}
                                                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeOrderTab === 'Delivery' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <Bike className="h-4 w-4 mr-2" /> Delivery
                                            </button>
                                            <button
                                                onClick={() => setActiveOrderTab('Take-away')}
                                                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeOrderTab === 'Take-away' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <ShoppingBag className="h-4 w-4 mr-2" /> Take-Away
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeOrderTab === 'Delivery' ? (
                                            deliveryOrders.length > 0 ? (
                                                deliveryOrders.map(order => <OrderCard key={order.docId} order={order} onStatusChange={handleStatusChange} onCancel={confirmCancelOrder} onShareUpdate={handleShareUpdate} onCardClick={handleCardClick} />)
                                            ) : (
                                                <div className="col-span-full">
                                                    <p className="text-muted-foreground text-center py-8 bg-white rounded-lg shadow-sm border">No active delivery orders.</p>
                                                </div>
                                            )
                                        ) : (
                                            takeAwayOrders.length > 0 ? (
                                                takeAwayOrders.map(order => <OrderCard key={order.docId} order={order} onStatusChange={handleStatusChange} onCancel={confirmCancelOrder} onShareUpdate={handleShareUpdate} onCardClick={handleCardClick} />)
                                            ) : (
                                                <div className="col-span-full">
                                                    <p className="text-muted-foreground text-center py-8 bg-white rounded-lg shadow-sm border">No active take-away orders.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </section>


                                {/* Today's Reservations Section */}
                                <section className="mt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center space-x-2">
                                            <h2 className="text-lg font-semibold flex items-center"><Calendar className="h-5 w-5 mr-2" /> Today's Reservations</h2>
                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">{todayReservations?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {todayReservations && todayReservations.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {todayReservations.map(res => (
                                                    <div key={res.docId} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="bg-green-100 text-green-800 font-bold px-2 py-1 rounded text-sm">{res.time}</div>
                                                                    <h3 className="font-bold">{res.name}</h3>
                                                                </div>
                                                                <span className={`text-xs px-2 py-1 rounded-full border ${res.status === 'Confirmed' ? 'bg-green-50 text-senoa-green border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                                    {res.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 space-y-1 mb-3">
                                                                <p className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-400" /> {res.guests} Guests</p>
                                                                <p className="flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-400" /> {res.phone}</p>
                                                                {res.email && <p className="flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-400" /> {res.email}</p>}
                                                                {res.purpose && <p className="text-xs bg-gray-100 inline-block px-2 py-1 rounded mt-1">{res.purpose}</p>}
                                                                {res.notes && <p className="text-xs italic text-gray-500 mt-1 border-l-2 pl-2">"{res.notes}"</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-4 bg-white rounded-lg shadow-sm border">No reservations for today.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Order History Section */}
                                <section className="mt-20">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold flex items-center"><List className="h-5 w-5 mr-2" /> Order History</h2>
                                        <button onClick={() => setIsOrderHistoryVisible(!isOrderHistoryVisible)} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
                                            {isOrderHistoryVisible ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                            {isOrderHistoryVisible ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {isOrderHistoryVisible && (
                                        <div className="space-y-6">
                                            {Object.entries(groupedOrderHistory).length > 0 ? Object.entries(groupedOrderHistory).map(([date, ordersInGroup]) => {
                                                const dailyTotal = (ordersInGroup as any[]).filter(o => o.status === 'Delivered').reduce((sum, order) => sum + order.total, 0);
                                                return (
                                                    <div key={date}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h3 className="text-md font-semibold flex items-center text-muted-foreground">
                                                                <Calendar className="h-4 w-4 mr-2" /> {date}
                                                            </h3>
                                                            <p className="text-md font-semibold text-muted-foreground">
                                                                Total: ₹{dailyTotal.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {(ordersInGroup as Order[]).map(order => <OrderCard key={order.docId} order={order} onStatusChange={handleStatusChange} onCancel={confirmCancelOrder} onShareUpdate={handleShareUpdate} onCardClick={handleCardClick} />)}
                                                        </div>
                                                    </div>
                                                )
                                            }) : (
                                                <p className="text-muted-foreground text-center py-4 bg-white rounded-lg shadow-sm border">No orders found for the selected period.</p>
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Right Column */}
                            {isPlaylistVisible && (
                                <div className="hidden lg:block lg:col-span-1 space-y-8">
                                    <section>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-sm">Your Playlists</h3>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => setIsPlaylistVisible(false)} className="text-xs font-semibold flex items-center text-gray-500 hover:text-gray-700">
                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                        Hide
                                                    </button>
                                                    <button onClick={isEditingPlaylist ? handleSavePlaylists : handleEditPlaylist} className="text-xs font-semibold flex items-center text-blue-600">
                                                        {isEditingPlaylist ? <Save className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
                                                        {isEditingPlaylist ? 'Save' : 'Edit'}
                                                    </button>
                                                </div>
                                            </div>
                                            {isEditingPlaylist ? (
                                                <div className="space-y-3 mb-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Vibe 1</label>
                                                        <input
                                                            type="text"
                                                            value={tempPlaylists.playlist1}
                                                            onChange={(e) => handleTempPlaylistChange('playlist1', e.target.value)}
                                                            placeholder="Paste Spotify Playlist URL"
                                                            className="w-full border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Vibe 2</label>
                                                        <input
                                                            type="text"
                                                            value={tempPlaylists.playlist2}
                                                            onChange={(e) => handleTempPlaylistChange('playlist2', e.target.value)}
                                                            placeholder="Paste Spotify Playlist URL"
                                                            className="w-full border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Vibe 3</label>
                                                        <input
                                                            type="text"
                                                            value={tempPlaylists.playlist3}
                                                            onChange={(e) => handleTempPlaylistChange('playlist3', e.target.value)}
                                                            placeholder="Paste Spotify Playlist URL"
                                                            className="w-full border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Piano</label>
                                                        <input
                                                            type="text"
                                                            value={tempPlaylists.playlist4}
                                                            onChange={(e) => handleTempPlaylistChange('playlist4', e.target.value)}
                                                            placeholder="Paste Spotify Playlist URL"
                                                            className="w-full border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Instrumental</label>
                                                        <input
                                                            type="text"
                                                            value={tempPlaylists.playlist5}
                                                            onChange={(e) => handleTempPlaylistChange('playlist5', e.target.value)}
                                                            placeholder="Paste Spotify Playlist URL"
                                                            className="w-full border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-1 border-b mb-2">
                                                    <button onClick={() => setActivePlaylistTab('playlist1')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md ${activePlaylistTab === 'playlist1' ? 'bg-gray-100 border-x border-t' : 'text-gray-500'}`}>Vibe 1</button>
                                                    <button onClick={() => setActivePlaylistTab('playlist2')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md ${activePlaylistTab === 'playlist2' ? 'bg-gray-100 border-x border-t' : 'text-gray-500'}`}>Vibe 2</button>
                                                    <button onClick={() => setActivePlaylistTab('playlist3')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md ${activePlaylistTab === 'playlist3' ? 'bg-gray-100 border-x border-t' : 'text-gray-500'}`}>Vibe 3</button>
                                                    <button onClick={() => setActivePlaylistTab('playlist4')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md ${activePlaylistTab === 'playlist4' ? 'bg-gray-100 border-x border-t' : 'text-gray-500'}`}>Piano</button>
                                                    <button onClick={() => setActivePlaylistTab('playlist5')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md ${activePlaylistTab === 'playlist5' ? 'bg-gray-100 border-x border-t' : 'text-gray-500'}`}>Instrumental</button>
                                                </div>
                                            )}
                                            <iframe
                                                key={playlists[activePlaylistTab]}
                                                style={{ borderRadius: "12px", width: "100%", height: "560px" }}
                                                src={playlists[activePlaylistTab]}
                                                frameBorder="0"
                                                allowFullScreen={false}
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy">
                                            </iframe>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                {...confirmationModalProps}
            />

            {renderContent()}

            {!isPlaylistVisible && (
                <button
                    onClick={() => setIsPlaylistVisible(true)}
                    className="hidden lg:flex items-center space-x-3 fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-30"
                >
                    <Music className="h-5 w-5" />
                    <span className="text-sm font-semibold">Show Music</span>
                </button>
            )}
            <UpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                order={selectedOrder}
            />
            <OrderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
}
