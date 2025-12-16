

'use client';

import { X, ChevronRight, Home, Briefcase, Pencil, LogOut, ShieldCheck, Edit, Mail, Lock, Save, User as UserIcon, Loader2, Package, History, XCircle, Repeat, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db, googleProvider, signInWithPopup } from '@/lib/firebase';
import { onAuthStateChanged, User, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, Timestamp, updateDoc, onSnapshot, arrayRemove, arrayUnion } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const AddressModal = dynamic(() => import('./AddressModal').then(mod => mod.AddressModal));

const GoogleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.631,44,29.5,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


interface CartItem {
  name: string;
  quantity: number;
  price: number;
}
interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

interface Order {
    id: string;
    docId: string;
    items: string;
    total: number;
    status: string;
    timestamp: Timestamp;
    cart?: any[]; 
    seen?: boolean;
}

interface Address {
    type: string;
    address: string;
    phone?: string;
    name?: string;
    location?: {
        latitude: number;
        longitude: number;
    }
}


interface UserData {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: Address[];
}

const OrderHistoryCard = ({ orderId, date, items, total, onRepeat, status, order }) => {

    const getDisplayStatus = (status) => {
        switch(status) {
            case 'Accept Order':
                return order.seen === false ? 'Awaiting Confirmation' : 'Preparing Your food';
            case 'On its way':
                return 'Your order is out for delivery';
            case 'Declined':
                return 'Order Declined';
            case 'Delivered':
                return 'Delivered';
            default:
                return status;
        }
    };
    
    const displayStatus = getDisplayStatus(status);
    const statusColor = status === 'Delivered' ? 'text-senoa-green' : status === 'Declined' ? 'text-red-600' : 'text-blue-600';

    return (
        <div className="bg-white rounded-lg p-3 border mb-3">
            <div className="flex justify-between items-start border-b pb-2 mb-2">
                <div>
                    <p className="font-bold text-xs">Order #{orderId}</p>
                    <p className="text-[10px] text-muted-foreground">{date}</p>
                </div>
                <div className="text-right">
                    {status === 'Delivered' ? (
                         <button 
                            onClick={onRepeat}
                            className="text-xs font-semibold text-senoa-green mt-1 flex items-center"
                        >
                           Repeat Order
                        </button>
                    ) : (
                         <p className={`text-xs font-semibold ${statusColor}`}>{displayStatus}</p>
                    )}
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1 truncate">{items}</p>
            <p className="text-xs font-semibold">Total: ₹{total.toFixed(2)}</p>
        </div>
    );
};

const InlineAuthForm = ({ onClose }) => {
    const [authActionLoading, setAuthActionLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

     const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setSuccessMessage('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (err) {
            setError('Invalid email or password.');
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };

     const handleGoogleSignIn = async () => {
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const newUserData: UserData = {
                    uid: user.uid,
                    name: user.displayName || 'Google User',
                    email: user.email || '',
                    addresses: [],
                };
                await setDoc(userDocRef, newUserData);
            }
            onClose();
        } catch (error) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(error);
        } finally {
            setAuthActionLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setAuthActionLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            const newUserData: UserData = {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                addresses: [],
            };
            
            await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
            onClose();
        } catch (err) {
            if ((err as any).code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else {
                setError('Failed to create an account. Please try again.');
            }
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };

     const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            setError('Could not send password reset email. Please check the address.');
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };


    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            {authView === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Login</h3>
                            <p className="text-xs text-muted-foreground">Welcome back!</p>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div className="text-right mt-1">
                                <button type="button" onClick={() => { setAuthView('forgotPassword'); resetForm(); }} className="text-xs font-semibold text-senoa-green hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'LOGIN'}
                        </button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-2 text-xs text-gray-400">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        <button type="button" onClick={handleGoogleSignIn} disabled={authActionLoading} className="w-full bg-white text-gray-700 font-semibold py-2 px-4 rounded-md border hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center space-x-2">
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => { setAuthView('signup'); resetForm(); }} className="font-semibold text-senoa-green">Sign Up</button>
                        </p>
                    </form>
                )}
                {authView === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Sign Up</h3>
                            <p className="text-xs text-muted-foreground">Create your account.</p>
                        </div>
                        <div>
                            <label className="sr-only">Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'SIGN UP'}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Already have an account?{' '}
                            <button type="button" onClick={() => { setAuthView('login'); resetForm(); }} className="font-semibold text-senoa-green">Login</button>
                        </p>
                    </form>
                )}
                {authView === 'forgotPassword' && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Reset Password</h3>
                            <p className="text-xs text-muted-foreground">Enter your email to get a reset link.</p>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        {successMessage && <p className="text-senoa-green text-xs text-center">{successMessage}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'SEND RESET LINK'}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Remembered your password?{' '}
                            <button type="button" onClick={() => { setAuthView('login'); resetForm(); }} className="font-semibold text-senoa-green">Login</button>
                        </p>
                    </form>
                )}
        </div>
    );
};

export function ProfileMenu({ isOpen, onClose, setCart }: ProfileMenuProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authActionLoading, setAuthActionLoading] = useState(false);
    
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [pastOrders, setPastOrders] = useState<Order[]>([]);
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<{address: Address, index: number} | null>(null);
    const [showAllOrders, setShowAllOrders] = useState(false);


    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                // Reset states when user logs out
                setUserData(null);
                setActiveOrders([]);
                setPastOrders([]);
            }
        });

        // Listen for cart changes in local storage to keep ProfileMenu in sync
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cart') {
                if (typeof window !== 'undefined') {
                    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);


        return () => {
            unsubscribeAuth();
            window.removeEventListener('storage', handleStorageChange);
        }
    }, [setCart]);

    useEffect(() => {
        if (!isOpen) return;

        let unsubscribeUser: () => void = () => {};
        let unsubscribeOrders: () => void = () => {};
        
        if (user) {
            setLoading(true);

            // Listener for user data
            const userDocRef = doc(db, 'users', user.uid);
            unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const fetchedUserData = doc.data() as UserData;
                    setUserData(fetchedUserData);
                    setEditingName(fetchedUserData.name || user.displayName || '');
                } else {
                    setUserData(null);
                }
            }, (err) => {
                console.error("Error fetching user data:", err);
            });

            // Listener for orders
            const ordersQuery = query(collection(db, 'orders'), where("customer.uid", "==", user.uid), orderBy('timestamp', 'desc'));
            unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
                const allOrders: Order[] = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Order));
                const active = allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined');
                const past = allOrders.filter(o => o.status === 'Delivered' || o.status === 'Declined');
                setActiveOrders(active);
                setPastOrders(past);
                setLoading(false); // Set loading to false after orders are fetched
            }, (err) => {
                console.error("Error fetching orders:", err);
                setLoading(false);
            });

        } else {
            // No user, clear all data and stop loading
            setUserData(null);
            setActiveOrders([]);
            setPastOrders([]);
            setLoading(false);
        }

        return () => {
            unsubscribeUser();
            unsubscribeOrders();
        };
    }, [user, isOpen]);
    
    const handleUpdateProfile = async () => {
        if (!user || !editingName.trim()) return;

        try {
            await updateProfile(user, { displayName: editingName });
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { name: editingName });
            setUserData(prev => prev ? { ...prev, name: editingName } : null);
            setIsEditingProfile(false);
        } catch(error) {
            console.error("Error updating profile:", error);
        }
    };
    
    const handleAddressSave = async (newAddress: Address) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);

        if(addressToEdit !== null) { // We are editing an existing address
             const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const currentAddresses = userDoc.data().addresses || [];
                const updatedAddresses = [...currentAddresses];
                updatedAddresses[addressToEdit.index] = newAddress;
                await updateDoc(userDocRef, { addresses: updatedAddresses });
            }
        } else { // We are adding a new address
             await setDoc(userDocRef, {
                addresses: arrayUnion(newAddress)
            }, { merge: true });
        }

        setAddressToEdit(null);
        setIsAddressModalOpen(false);
    };

    const handleEditAddress = (address: Address, index: number) => {
        setAddressToEdit({address, index});
        setIsAddressModalOpen(true);
    };

    const handleLogout = async () => {
        setAuthActionLoading(true);
        await auth.signOut();
        // Also clear cart on logout
        localStorage.removeItem('cart');
        setCart([]);
        setAuthActionLoading(false);
    };

    const handleRepeatOrder = (order: Order) => {
      const cartItems = order.cart || [];
      if (cartItems.length > 0) {
        setCart(cartItems);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        onClose();
        const targetPath = pathname.includes('/take-away') ? '/take-away/checkout' : '/delivery/checkout';
        router.push(targetPath);
      } else {
        alert("Sorry, we couldn't find the items for this order to repeat it.");
      }
    }
    
  return (
    <>
      <AddressModal 
        isOpen={isAddressModalOpen}
        onClose={() => {
            setIsAddressModalOpen(false);
            setAddressToEdit(null); // Reset edit state on close
        }}
        onAddressSelect={(addr) => { /* Not used here */ }}
        onAddressSave={handleAddressSave}
        addressToEdit={addressToEdit?.address}
      />
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-100 text-foreground shadow-lg z-50 transform transition-transform ease-in-out duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b bg-white">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">My Account</h2>
                <button onClick={onClose} className="p-2">
                    <X className="h-6 w-6" />
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                 </div>
            ) : !user ? (
                 <InlineAuthForm onClose={onClose} />
            ) : (
                <div>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                       {isEditingProfile ? (
                           <div className="space-y-3">
                                <input 
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 text-base font-bold focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <div className="flex space-x-2">
                                    <button onClick={() => setIsEditingProfile(false)} className="w-1/2 text-sm font-semibold p-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                                    <button onClick={handleUpdateProfile} className="w-1/2 text-sm font-semibold p-2 rounded-lg bg-senoa-green text-white hover:bg-senoa-green-dark flex items-center justify-center">
                                        <Save className="h-4 w-4 mr-2" /> Save
                                    </button>
                                </div>
                           </div>
                       ) : (
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-base">{userData?.name || 'Valued Customer'}</p>
                                    <p className="text-xs text-muted-foreground">{userData?.email || user.email}</p>
                                </div>
                                <button onClick={() => setIsEditingProfile(true)} className="text-senoa-green text-xs font-semibold flex items-center"><Edit className="h-3 w-3 mr-1" />EDIT</button>
                            </div>
                       )}
                    </div>

                    <div className="mb-4">
                        <h3 className="text-base font-semibold flex items-center mb-2">
                            <Package className="h-4 w-4 mr-2 text-blue-600"/> Active Orders
                        </h3>
                        {activeOrders.length > 0 ? activeOrders.map(order => (
                            <OrderHistoryCard 
                                key={order.docId}
                                order={order}
                                orderId={order.id}
                                date={order.timestamp.toDate().toLocaleString()}
                                items={order.items}
                                total={order.total}
                                onRepeat={() => handleRepeatOrder(order)}
                                status={order.status}
                            />
                        )) : <p className="text-sm text-muted-foreground bg-white p-4 rounded-lg text-center">No active orders.</p>
                        }
                    </div>

                    <div className="mb-4">
                        <h3 className="text-base font-semibold flex items-center mb-2">
                            <History className="h-4 w-4 mr-2 text-purple-600"/> Order History
                        </h3>
                        {pastOrders.length > 0 ? (
                          <>
                            {pastOrders.slice(0, showAllOrders ? pastOrders.length : 2).map(order => (
                                <OrderHistoryCard 
                                    key={order.docId}
                                    order={order}
                                    orderId={order.id}
                                    date={order.timestamp.toDate().toLocaleString()}
                                    items={order.items}
                                    total={order.total}
                                    onRepeat={() => handleRepeatOrder(order)}
                                    status={order.status}
                                />
                            ))}
                            {pastOrders.length > 2 && !showAllOrders && (
                                <button 
                                    onClick={() => setShowAllOrders(true)} 
                                    className="w-full text-center text-sm font-semibold text-senoa-green py-2"
                                >
                                    Show More
                                </button>
                            )}
                          </>
                        ) : <p className="text-sm text-muted-foreground bg-white p-4 rounded-lg text-center">No past orders found.</p>
                        }
                    </div>
                    
                     <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                        <h4 className="font-bold text-sm mb-3">Your Addresses</h4>
                        <div className="space-y-3">
                            {userData?.addresses?.length > 0 ? userData.addresses.map((addr, index) => (
                                <div key={index} className="flex items-start justify-between">
                                    <div className="flex items-start">
                                        {addr.type === 'Home' ? <Home className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" /> : <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />}
                                        <div>
                                            <p className="font-semibold text-sm">{addr.type} ({addr.name})</p>
                                            <p className="text-xs text-muted-foreground">{addr.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditAddress(addr, index)} className="p-1 text-gray-500 hover:text-senoa-green"><Edit size={14}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-xs text-muted-foreground">No saved addresses.</p>}
                        </div>
                        <div className="border-t mt-3 pt-3">
                            <button onClick={() => { setAddressToEdit(null); setIsAddressModalOpen(true); }} className="text-senoa-green font-bold text-xs w-full text-left">
                                + ADD NEW ADDRESS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {user && (
            <div className="p-4 border-t bg-white">
                 <button 
                    onClick={handleLogout}
                    disabled={authActionLoading}
                    className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-md text-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
                 >
                    <LogOut className="h-4 w-4" />
                    <span>{authActionLoading ? 'Logging out...' : 'LOGOUT'}</span>
                </button>
            </div>
        )}

      </div>
    </>
  );
}
