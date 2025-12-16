
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { Loader2, Menu } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { CreateOrderModal } from '@/components/CreateOrderModal';
import dynamic from 'next/dynamic';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));

interface Order {
    docId: string;
    id: string;
    customer: { name: string; phone: string; };
    type: 'Delivery' | 'Take-away';
    items: string;
    total: number;
    timestamp: Timestamp;
    seen?: boolean;
    status?: string;
}

const NewOrderModal = ({ order, onAccept, onDecline }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!order) return null;

    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await onAccept();
        } catch (error) {
            console.error("Failed to accept order:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        try {
            await onDecline();
        } catch (error) {
            console.error("Failed to decline order:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-center text-blue-600">New Order Received!</h2>
                </div>
                <div className="p-4 space-y-3">
                    <div className="text-center">
                        <p className="font-bold text-lg">Order #{order.id}</p>
                        <p className="text-muted-foreground">{order.type} Order</p>
                    </div>
                    <div>
                        <p className="font-semibold">{order.customer.name}</p>
                        <p className="text-sm text-gray-800 truncate">{order.items}</p>
                    </div>
                    <p className="font-bold text-2xl text-center">₹{order.total.toFixed(2)}</p>
                </div>
                <div className="p-4 flex space-x-3">
                    <button onClick={handleDecline} disabled={isProcessing} className="w-1/2 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center">
                        {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Decline'}
                    </button>
                    <button onClick={handleAccept} disabled={isProcessing} className="w-1/2 bg-senoa-green text-white font-bold py-2 rounded-lg hover:bg-senoa-green-dark transition disabled:opacity-50 flex items-center justify-center">
                        {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user] = useAuthState(auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newOrderQueue, setNewOrderQueue] = useState<Order[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Create Order Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({ title: '', message: '', onConfirm: () => { }, confirmText: 'OK', cancelText: null });


    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newUnseenOrders = snapshot.docs
                .map(doc => ({ docId: doc.id, ...doc.data() } as Order))
                .filter(o => o.seen === false && o.status !== 'Declined')
                .sort((a, b) => {
                    const t1 = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
                    const t2 = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
                    return t1 - t2;
                });

            setNewOrderQueue(newUnseenOrders);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const playSound = () => {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        };

        if (newOrderQueue.length > 0) {
            // If an interval is already running, clear it to restart it
            if (soundIntervalRef.current) {
                clearInterval(soundIntervalRef.current);
            }
            playSound(); // Play immediately
            soundIntervalRef.current = setInterval(playSound, 2000);
        } else if (newOrderQueue.length === 0 && soundIntervalRef.current) {
            clearInterval(soundIntervalRef.current);
            soundIntervalRef.current = null;
        }

        return () => {
            if (soundIntervalRef.current) {
                clearInterval(soundIntervalRef.current);
            }
        };
    }, [newOrderQueue]);


    const handleAcceptOrder = async () => {
        if (newOrderQueue.length > 0) {
            const orderToAccept = newOrderQueue[0];
            const orderRef = doc(db, 'orders', orderToAccept.docId);
            await updateDoc(orderRef, { status: 'Accept Order', seen: true, showNotification: 'preparing' });
            // The onSnapshot listener will automatically remove the order from the queue
        }
    };

    const handleDeclineOrder = async () => {
        if (newOrderQueue.length > 0) {
            const orderToDecline = newOrderQueue[0];
            const orderRef = doc(db, 'orders', orderToDecline.docId);
            await updateDoc(orderRef, { status: 'Declined', seen: true, showNotification: 'declined' });
            // The onSnapshot listener will automatically remove the order from the queue
        }
    };

    const handleAddOrder = async (newOrder: any) => {
        try {
            await addDoc(collection(db, 'orders'), newOrder);
        } catch (error) {
            console.error("Error adding order:", error);
            setConfirmationModalProps({
                title: 'Error',
                message: 'Failed to create order. Please check console for details.',
                onConfirm: () => setIsConfirmationModalOpen(false),
                confirmText: 'OK',
                cancelText: null
            });
            setIsConfirmationModalOpen(true);
        }
    };

    return (
        <div className={`flex bg-dashboard-bg min-h-screen ${inter.className}`}>

            <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-gray-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg text-gray-800">Beans Dashboard</span>
                </div>
            </div>

            {/* Sidebar */}
            {user && (
                <DashboardSidebar
                    onCreateOrder={() => setIsCreateModalOpen(true)}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className={`flex-1 transition-all duration-300 ${user ? 'md:ml-56' : ''} pt-14 md:pt-0`}>
                <NewOrderModal
                    order={newOrderQueue[0]}
                    onAccept={handleAcceptOrder}
                    onDecline={handleDeclineOrder}
                />
                <CreateOrderModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onAddOrder={handleAddOrder}
                />
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    {...confirmationModalProps}
                />

                {/* Only check for user to render children, or allow children to handle auth redirects?
                    The DashboardPage handles auth redirect. Here we just strictly layout. 
                    But wait, children (Page) might redirect. If user is null, Sidebar is hidden.
                    If user is null, children are rendered without margin.
                */}
                {children}
            </main>
        </div>
    );
}
