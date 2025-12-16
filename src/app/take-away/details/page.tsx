

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Smartphone, MessageSquare, Loader2 } from 'lucide-react';
import { db, auth, generateReadableOrderId } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));

export default function DetailsPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState({ title: '', message: '' });

  useEffect(() => {
    setIsClient(true);
    // Load initial data from localStorage immediately
    const storedDetails = localStorage.getItem('orderDetails');
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setOrderDetails(details);
      // Pre-fill form if user data was passed, e.g., from a previous session
      if (details.customer) {
        setName(details.customer.name || '');
        setEmail(details.customer.email || '');
        setPhone(details.customer.phone?.replace(/^91/, '') || '');
      }
    } else {
      router.push('/take-away');
      return; // Early exit if no details
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        // If a user is logged in, use their details as a fallback if the form is empty.
        // This prevents overwriting data from localStorage or user input.
        if (currentUser) {
            if (name === '') setName(currentUser.displayName || '');
            if (email === '') setEmail(currentUser.email || '');
        }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  
  const showAlert = (title, message) => {
    setConfirmationModalProps({ title, message });
    setIsConfirmationModalOpen(true);
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDetails) return;

    if (!name.trim()) {
        showAlert("Name Required", "Please enter your name.");
        return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
        showAlert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
        return;
    }

    setIsPlacingOrder(true);

    try {
        const readableId = await generateReadableOrderId();
        
        const customerData = {
            name: name,
            email: email,
            phone: `91${phone}`,
            uid: user ? user.uid : null,
        };

        const newOrder = {
            id: readableId,
            customer: customerData,
            address: 'Take-away',
            type: 'Take-away',
            items: orderDetails.cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
            total: orderDetails.toPay,
            status: 'Accept Order',
            timestamp: serverTimestamp(),
            cart: orderDetails.cart,
            showNotification: 'new',
            seen: false,
            appliedCoupon: orderDetails.appliedCoupon ? { code: orderDetails.appliedCoupon.code, discount: orderDetails.discount } : null,
        };
        
        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        
        // Store guest order ID for status tracking
        if (!user) {
            localStorage.setItem('guestOrderId', docRef.id);
        }

        const finalOrderDetails = { 
            ...orderDetails,
            customer: customerData,
            instructions,
            orderId: readableId,
            customerUid: user ? user.uid : null,
            guestDocId: !user ? docRef.id : null,
        };

        localStorage.setItem('orderDetails', JSON.stringify(finalOrderDetails));
        localStorage.setItem('cart', '[]'); // Clear cart after order
        
        router.push('/take-away/confirmation');

    } catch (error) {
        console.error("Error writing document: ", error);
        showAlert("Order Failed", "Could not place your order. Please try again or contact support.");
        setIsPlacingOrder(false);
    }
  };

  if (!isClient || !orderDetails) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <>
     <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        title={confirmationModalProps.title}
        message={confirmationModalProps.message}
        onConfirm={() => setIsConfirmationModalOpen(false)}
        confirmText="OK"
        cancelText={null}
      />
    <div className="flex flex-col min-h-screen bg-gray-100 md:items-center">
      <div className="w-full md:max-w-md md:bg-white md:shadow-lg">
        <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
           <div>
              <h1 className="text-lg font-bold">Your Details</h1>
              <p className="text-xs text-muted-foreground">For your take-away order</p>
            </div>
        </header>

        <main className="flex-grow p-4 bg-gray-100 md:bg-white pb-40">
          <form onSubmit={handlePayNow} className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold text-base mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-100"
                      readOnly={!!user && !!user.email}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-500 mb-1">
                    Mobile Number for Order Notifications <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                     <span className="pl-3 pr-2 py-2 text-sm text-gray-500 border-y border-l rounded-l-md bg-gray-50">+91</span>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      pattern="\d{10}"
                      title="Please enter a 10-digit phone number"
                      className="w-full border-y border-r rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-semibold text-base mb-2">Pickup from address</h3>
                 <p className="text-sm text-gray-600 p-3 border rounded-md bg-gray-50">
                    Haroon Nagar, Sec,-2, Zoya Mansion, Phulwari Sharif, Patna-801505
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border pb-8">
                <label htmlFor="instructions" className="block text-xs font-medium text-gray-500 mb-2">Cooking Instructions</label>
                 <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        id="instructions"
                        type="text"
                        placeholder="Add cooking instructions... (e.g. make it extra spicy)"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full border rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                 </div>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 z-10 flex justify-center">
                <div className="bg-white border-t p-4 w-full max-w-md">
                    <div className="flex items-center justify-between">
                        <div className='leading-tight'>
                            <p className="font-bold text-lg">₹{Math.round(orderDetails.toPay)}</p>
                            <p className="text-blue-600 text-xs font-semibold">TOTAL AMOUNT</p>
                        </div>
                        <button type="submit" disabled={isPlacingOrder} className="bg-senoa-green text-white font-bold py-3 rounded-md text-center flex items-center justify-center px-6 disabled:opacity-75">
                          {isPlacingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : 'Place Order' }
                        </button>
                    </div>
                </div>
            </footer>
          </form>
        </main>
      </div>
    </div>
    </>
  );
}


