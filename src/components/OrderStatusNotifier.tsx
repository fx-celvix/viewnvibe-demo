
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { ChefHat, Bike, CheckCircle, XCircle, Phone, X, MessageSquare, Star } from 'lucide-react';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('./FeedbackModal').then(mod => mod.FeedbackModal));

export function OrderStatusNotifier() {
  const [notification, setNotification] = useState<{ message: string, icon: React.ReactNode, type: 'success' | 'error' | 'info', status: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [guestOrderId, setGuestOrderId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [hasCartItems, setHasCartItems] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    const storedGuestId = typeof window !== 'undefined' ? localStorage.getItem('guestOrderId') : null;
    setGuestOrderId(storedGuestId);

    const storedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : '[]';
    setHasCartItems(JSON.parse(storedCart || '[]').length > 0);
    
    const handleStorageChange = () => {
        const updatedCart = localStorage.getItem('cart');
        setHasCartItems(JSON.parse(updatedCart || '[]').length > 0);
    };

    window.addEventListener('storage', handleStorageChange);


    return () => {
        unsubscribeAuth();
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  useEffect(() => {
    // Hide notifier on specific paths
    if (pathname.startsWith('/dashboard') || pathname.includes('/confirmation')) {
        setIsVisible(false);
        return;
    }

    let unsubscribeFirestore: () => void = () => {};

    const setupListener = () => {
      let q;
      if (user) {
        q = query(collection(db, 'orders'), where('customer.uid', '==', user.uid));
      } else if (guestOrderId) {
        q = query(collection(db, 'orders'), where('__name__', '==', guestOrderId));
      } else {
        return;
      }
      
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
           if (change.type === "modified" || change.type === "added") { // Also check for added for guest users
                const orderData = change.doc.data();
                let message = '';
                let iconType = 'info';
                let icon: React.ReactNode = null;
                let type: 'success' | 'error' | 'info' = 'info';
                let status = orderData.showNotification;

                // Do not show for already dismissed or initial state for confirmed users
                if(status === 'none' || (user && status === 'new')) return;

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
                             if (change.doc.exists()) {
                                const orderRef = doc(db, 'orders', change.doc.id);
                                await updateDoc(orderRef, { showNotification: 'none' });
                            }
                            setIsVisible(false);
                        }, 10000);
                    }
                }
            }
        });
      });
    };

    if (!pathname.startsWith('/dashboard') && !pathname.includes('/confirmation')) {
        setupListener();
    }
    
    return () => unsubscribeFirestore();

  }, [user, guestOrderId, pathname]);

  const handleClose = async () => {
      setIsVisible(false);
      // Also update in DB so it doesn't reappear on reload
      let orderIdToUpdate = guestOrderId;
      if (user) {
        const q = query(collection(db, 'orders'), where('customer.uid', '==', user.uid), where('showNotification', '!=', 'none'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            orderIdToUpdate = querySnapshot.docs[0].id;
        }
      }
      if (orderIdToUpdate) {
         const orderRef = doc(db, 'orders', orderIdToUpdate);
         await updateDoc(orderRef, { showNotification: 'none' });
      }
  }

  if (!notification || !isVisible) {
    return null;
  }
  
  const bgColor = notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-senoa-green' : 'bg-blue-600';
  const bottomPosition = hasCartItems ? 'bottom-32 md:bottom-6' : 'bottom-6';

  return (
    <>
    <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
     <div className={`fixed inset-x-0 mx-auto w-[90%] max-w-sm text-white py-3 px-4 rounded-lg shadow-2xl flex items-center justify-between transition-all duration-300 z-50 ${bgColor} ${bottomPosition}`}>
          <div className="flex items-center">
            <div className="animate-icon-pulse">{notification.icon}</div>
            <p className="font-semibold text-sm">{notification.message}</p>
          </div>
          <div className="flex items-center space-x-2">
             {notification.status === 'delivered' ? (
                 <button 
                    onClick={() => setIsFeedbackModalOpen(true)} 
                    className="text-xs font-bold flex items-center bg-white/25 hover:bg-white/40 px-3 py-2 rounded-md space-x-1.5"
                 >
                    <Star className="h-4 w-4" fill="white" />
                    <div className="flex flex-col items-center leading-none">
                        <span>Rate</span>
                        <span>Us</span>
                    </div>
                 </button>
             ) : (
                <a href="tel:+917909067655" className="p-1.5 rounded-full hover:bg-white/20">
                    <Phone className="h-4 w-4" />
                </a>
             )}
             <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/20">
                <X className="h-5 w-5" />
             </button>
          </div>
        </div>
    </>
  );
}
