

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MapPin, Sparkles, Mail, Rss, Loader2, Phone, CheckCircle, ChefHat, Bike, XCircle, X, Star, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, query, collection, where, getDocs, limit, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('@/components/FeedbackModal').then(mod => mod.FeedbackModal));

const AnimatedCheckmark = () => (
    <div className="w-24 h-24 mx-auto mb-4">
        <svg className="w-full h-full" viewBox="0 0 52 52">
            <circle 
                className="stroke-current text-green-100" 
                cx="26" 
                cy="26" 
                r="25" 
                fill="none" 
                strokeWidth="2" 
            />
            <path 
                className="stroke-current text-senoa-green" 
                fill="none" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                style={{
                    strokeDasharray: 50,
                    strokeDashoffset: 50,
                    animation: 'draw 0.5s ease-out forwards 0.3s',
                }}
            />
        </svg>
    </div>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.437-9.887-9.888-9.888-5.451 0-9.887 4.436-9.888 9.888.001 2.228.651 4.385 1.886 6.245l-1.254 4.585 4.703-1.233zM9.351 8.298c-.144-.346-.3-.356-.44-.362-.14-.006-.3-.008-.46-.008-.16 0-.41.06-.62.311-.21.25-.85.83-.85 2.02.001 1.191.87 2.341 1 2.491.13.15 1.76 2.67 4.25 3.73.59.25 1.05.4 1.41.52.59.21 1.12.18 1.54.11.46-.08.85-.36 1.03-.72.18-.36.18-.68.12-.76-.06-.08-.21-.13-.44-.24-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.24-.59.75-.73.9-.14.15-.28.17-.51.05-.23-.12-.99-.36-1.89-1.16-.7-.6-1.17-1.34-1.3-1.56-.13-.22-.02-.34.09-.44.1-.1.22-.26.33-.39.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.34z"/>
    </svg>
);

const OrderStatusPopup = () => {
    const [notification, setNotification] = useState<{ message: string, icon: React.ReactNode, type: 'success' | 'error' | 'info', status: string } | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [orderDocId, setOrderDocId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser);
        });

        // Function to find the correct order document to listen to
        const findOrderAndListen = () => {
            const storedDetails = JSON.parse(localStorage.getItem('orderDetails') || '{}');
            const docId = storedDetails.guestDocId;

            if (docId) {
                setOrderDocId(docId);
            } else if (user && storedDetails.orderId) {
                // Fallback for logged-in users if guestDocId is not present for some reason
                 const q = query(collection(db, "orders"), where("id", "==", storedDetails.orderId), where("customer.uid", "==", user.uid), limit(1));
                 getDocs(q).then(snapshot => {
                     if (!snapshot.empty) {
                         setOrderDocId(snapshot.docs[0].id);
                     }
                 });
            }
        };

        // Initial check
        findOrderAndListen();
        
        // Listen for storage changes in case the doc ID is set after initial load
        const handleStorageChange = (event: StorageEvent) => {
             if (event.key === 'orderDetails') {
                findOrderAndListen();
             }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            unsubscribeAuth();
            window.removeEventListener('storage', handleStorageChange);
        }

    }, [user]);

    useEffect(() => {
        if (!orderDocId) return;

        const orderDocRef = doc(db, 'orders', orderDocId);
        const unsubscribeFirestore = onSnapshot(orderDocRef, async (doc) => {
            if (doc.exists()) {
                const orderData = doc.data();
                let message = '';
                let icon: React.ReactNode = null;
                let type: 'success' | 'error' | 'info' = 'info';
                let status = orderData.showNotification;

                if (status === 'none' || status === 'new') return;

                switch (status) {
                    case 'preparing':
                        message = 'Your order is being prepared!';
                        icon = <ChefHat className="h-5 w-5 mr-2" />;
                        type = 'info';
                        break;
                    case 'on a way':
                        message = 'Your rider is on the way!';
                        icon = <Bike className="h-5 w-5 mr-2" />;
                        type = 'info';
                        break;
                    case 'delivered':
                        message = 'Your order has been delivered. Enjoy!';
                        icon = <CheckCircle className="h-6 w-6 mr-3" />;
                        type = 'success';
                        break;
                    case 'declined':
                        message = 'Your order has been declined.';
                        icon = <XCircle className="h-5 w-5 mr-2" />;
                        type = 'error';
                        break;
                    default:
                        return;
                }
                
                if (message) {
                    setNotification({ message, icon, type, status });
                    setIsVisible(true);
                    if (status === 'declined') {
                        setTimeout(async () => {
                            await updateDoc(orderDocRef, { showNotification: 'none' });
                            setIsVisible(false);
                        }, 10000);
                    }
                }
            }
        });
        
        return () => unsubscribeFirestore();
    }, [orderDocId]);


    const handleClose = async () => {
        setIsVisible(false);
        if(orderDocId) {
            await updateDoc(doc(db, 'orders', orderDocId), { showNotification: 'none' });
        }
    };
    
    if (!notification || !isVisible) return null;

    const bgColor = notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-senoa-green' : 'bg-blue-600';

    return (
        <>
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
        <div className={`fixed inset-x-0 bottom-6 mx-auto w-[90%] max-w-sm text-white py-3 px-4 rounded-lg shadow-2xl flex items-center justify-between transition-all duration-300 z-50 ${bgColor}`}>
            <div className="flex items-center">
                <div className="animate-icon-pulse">{notification.icon}</div>
                <p className="font-semibold text-sm">{notification.message}</p>
            </div>
            <div className="flex items-center space-x-2">
                {notification.status === 'delivered' ? (
                    <button onClick={() => setIsFeedbackModalOpen(true)} className="text-xs font-bold flex items-center bg-white/25 hover:bg-white/40 px-3 py-2 rounded-md space-x-1.5">
                        <Star className="h-4 w-4" fill="white" />
                        <div className="flex flex-col items-center leading-none"><span>Rate</span><span>Us</span></div>
                    </button>
                ) : (
                    <a href="tel:+917909067655" className="p-1.5 rounded-full hover:bg-white/20"><Phone className="h-4 w-4" /></a>
                )}
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/20"><X className="h-5 w-5" /></button>
            </div>
        </div>
        </>
    );
};

const WhatsAppChoiceModal = ({ isOpen, onClose, onChoiceSelect }) => {
    if (!isOpen) return null;

    const updateMessages = [
        { type: 'instruction', text: 'Send Cooking Instructions' },
        { type: 'update', text: 'Ask for order updates' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Chat with us</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4 space-y-3">
                   {updateMessages.map((msg) => (
                       <div key={msg.type} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                           <p className="text-sm flex-1">{msg.text}</p>
                           <button onClick={() => onChoiceSelect(msg.type)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 transition-colors ml-2">
                               <Send className="h-4 w-4" />
                           </button>
                       </div>
                   ))}
                </div>
            </div>
        </div>
    );
};


const OrderConfirmationPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState('Awaiting Confirmation');
  const [showStatus, setShowStatus] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const getInitialOrderDetails = () => {
             if (typeof window !== 'undefined') {
                const storedDetails = localStorage.getItem('orderDetails');
                if (storedDetails) {
                    const details = JSON.parse(storedDetails);
                    setOrderDetails(details);
                     if (details.orderId || details.guestDocId) {
                        setShowStatus(true);
                    }
                }
            }
        };
        getInitialOrderDetails();
    }, []);

    useEffect(() => {
        if (!orderDetails) return;

        let unsubscribe: () => void = () => {};
        
        const setupListener = async () => {
            let orderDocRef;
            // Use guestDocId for guests, which is the unique firestore doc ID
            if (orderDetails.guestDocId) {
                orderDocRef = doc(db, "orders", orderDetails.guestDocId);
            } else if (user && orderDetails.orderId) { 
                // Fallback for logged-in users: query by readable ID and UID
                const q = query(collection(db, "orders"), where("id", "==", orderDetails.orderId), where("customer.uid", "==", user.uid), limit(1));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    orderDocRef = querySnapshot.docs[0].ref;
                }
            }

            if (!orderDocRef) {
                console.log("Could not establish listener: No valid order reference found.");
                return;
            }
            
            unsubscribe = onSnapshot(orderDocRef, (doc) => {
                if (doc.exists()) {
                    const orderData = doc.data();
                    
                    // Ensure local state has the final readable ID if it was missing
                    if (!orderDetails.orderId && orderData.id) {
                        setOrderDetails(prev => ({...prev, orderId: orderData.id}));
                    }

                    const getDisplayStatus = (status: string, seen: boolean) => {
                        switch(status) {
                            case 'Accept Order': return seen === false ? 'Awaiting Confirmation' : 'Preparing Your food';
                            case 'On its way': return 'Your order is out for delivery';
                            case 'Delivered': return 'Delivered';
                            case 'Declined': return 'Order was Declined';
                            default: return 'Order Placed';
                        }
                    };
                    setStatus(getDisplayStatus(orderData.status, orderData.seen));
                }
            });
        };

        // Only try to set up listener if we have a way to identify the order
        if(orderDetails.guestDocId || (user && orderDetails.orderId)) {
             setupListener();
        }
       
        return () => {
            unsubscribe();
        };
    }, [orderDetails, user]);

  const handleWhatsAppChoice = (choice: 'instruction' | 'update') => {
    if (!orderDetails) return;
    
    const { orderId, cart, toPay, selectedAddress } = orderDetails;
    const phoneNumber = '917909067655'; // Restaurant's WhatsApp number

    const itemsSummary = cart.map(item => `${item.quantity} x ${item.name}`).join(', ');

    let message = '';
    if (choice === 'update') {
        message = `Hi, I'd like to get an update on my order.\n\nOrder ID: #${orderId || 'Processing...'}\nItems: ${itemsSummary}\nTotal: ₹${Math.round(toPay)}\n\nDelivery Address: ${selectedAddress.address}\nCustomer Name: ${selectedAddress.name}\n\nThank you!`;
    } else { // instruction
        message = `Hi, regarding my order #${orderId || 'Processing...'}\n\nI'd like to add the following cooking instructions: [Your instructions here]\n\nOrder Details:\nItems: ${itemsSummary}\nCustomer Name: ${selectedAddress.name}\n\nThank you!`;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
  };
  
   const handleTrackOrderClick = () => {
        setIsLoadingStatus(true);
        setShowStatus(true);
        // Simulate a network delay for better UX
        setTimeout(() => setIsLoadingStatus(false), 500);
    };

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className='mt-2 text-muted-foreground'>Finalizing order...</p>
        </div>
      </div>
    );
  }

  const { cart, toPay, selectedAddress, orderId, appliedCoupon, discount, error } = orderDetails;
  
  if (error) {
     return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-grow p-4 md:p-6 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6 text-center">
                     <h1 className="text-2xl font-bold text-red-600">Order Failed</h1>
                     <p className="text-muted-foreground mt-1">{error}</p>
                      <a href="/delivery" className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md text-center block text-sm">
                        Go back to Menu
                    </a>
                </div>
            </main>
        </div>
     )
  }

  return (
    <>
    <WhatsAppChoiceModal 
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onChoiceSelect={handleWhatsAppChoice}
    />
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow p-4 md:p-6 flex justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <AnimatedCheckmark />
            <h1 className="text-2xl font-bold text-senoa-green">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mt-1 flex items-center justify-center">
                Order ID: {orderId ? `#${orderId}` : <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
             {showStatus ? (
                isLoadingStatus ? (
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-green-800" />
                ) : (
                    <>
                        <p className="text-sm text-green-800">Current Status</p>
                        <p className="text-xl font-bold text-green-800">{status}</p>
                    </>
                )
             ) : (
                 <>
                    <p className="text-sm text-green-800">Your order will be delivered in</p>
                    <p className="text-2xl font-bold text-green-800">30-45 minutes</p>
                </>
             )}
          </div>
          
           <div className="flex space-x-3 w-full">
              <button 
                  onClick={handleTrackOrderClick} 
                  className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-md text-center text-sm flex items-center justify-center space-x-2"
                >
                  <Rss className="h-5 w-5" />
                  <span>Track Order</span>
              </button>
              <button 
                  onClick={() => setIsWhatsAppModalOpen(true)} 
                  className="bg-blue-600 text-white font-bold py-3 px-4 rounded-md text-center text-sm flex items-center justify-center"
                >
                  <WhatsAppIcon className="h-5 w-5" />
              </button>
           </div>


          <div className="border-t border-b py-4 space-y-4">
             <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="font-bold text-sm">{selectedAddress.type} ({selectedAddress.name})</p>
                    <p className="text-xs text-muted-foreground">{selectedAddress.address}</p>
                     {selectedAddress.phone && <p className="text-xs text-muted-foreground">Phone: {selectedAddress.phone}</p>}
                </div>
            </div>
            <a 
              href="tel:+917909067655" 
              className="flex items-center space-x-2 text-sm font-semibold p-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-blue-600"
            >
                <Phone className="h-4 w-4" />
                <span>Call the restaurant</span>
            </a>
          </div>
          

          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
             <div className="space-y-3">
                {cart.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <span className='font-medium'>{item.name} <span className="text-muted-foreground font-normal">x {item.quantity}</span></span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
          </div>

            {appliedCoupon && (
                <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-3 text-senoa-green" />
                            <div>
                                <p className="font-bold text-senoa-green text-sm">{appliedCoupon.code}</p>
                                <p className="text-xs text-senoa-green">You saved ₹{discount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}


          <div className="bg-gray-50 p-4 flex justify-between items-center rounded-lg">
            <span className="font-bold text-base">To Pay</span>
            <span className="font-bold text-base">₹{Math.round(toPay)}</span>
          </div>

           <div className="pt-4 space-y-3">
            <a href="/delivery" className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md text-center block text-sm">
                Back to Menu
            </a>
          </div>
        </div>
      </main>
      <OrderStatusPopup />
    </div>
    </>
  );
};

export default OrderConfirmationPage;
