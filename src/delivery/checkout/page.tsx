

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Tag, ChevronRight, X, Sparkles, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { db, auth, generateReadableOrderId } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import dynamic from 'next/dynamic';

const CouponModal = dynamic(() => import('@/components/CouponModal').then(mod => mod.CouponModal));
const AddressModal = dynamic(() => import('@/components/AddressModal').then(mod => mod.AddressModal));
const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));


interface CartItem {
    name: string;
    quantity: number;
    price: number;
}

interface Coupon {
    code: string;
    description: string;
    discount: (subTotal: number, isFirstOrder?: boolean, isLunch?: boolean, isWeekend?: boolean) => number;
    minOrder?: number;
    freebie?: string;
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


const BillDetailsModal = ({ isOpen, onClose, cart, itemSubTotal, deliveryCharge, gstTax, discount, toPay }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Bill Details</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4">
                    <div className="space-y-3">
                        {cart.map(item => (
                            <div key={item.name} className="flex justify-between items-center text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t my-4"></div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Item Sub Total</p>
                            <p>₹{itemSubTotal.toFixed(2)}</p>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-senoa-green">
                                <p>Discount</p>
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
                            <p className="text-muted-foreground border-b border-dashed border-gray-400">GST tax</p>
                            <p>₹{gstTax.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-between items-center rounded-b-lg">
                    <span className="font-bold text-base">To Pay</span>
                    <span className="font-bold text-base">₹{Math.round(toPay)}</span>
                </div>
            </div>
        </div>
    );
};


export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discount, setDiscount] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({ title: '', message: '' });


    const MIN_ORDER_FOR_FREE_DELIVERY = 399;

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        } else {
            // Don't redirect immediately, let other useEffects run
        }
        const unsubscribe = auth.onAuthStateChanged(setUser);

        // Load guest address if it exists
        const guestAddress = localStorage.getItem('guestAddress');
        if (guestAddress) {
            setSelectedAddress(JSON.parse(guestAddress));
        }

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Automatically open address modal if cart exists and no address is selected
        if (cart.length > 0 && !selectedAddress) {
            setIsAddressModalOpen(true);
        }
    }, [cart, selectedAddress]);

    const itemSubTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = itemSubTotal < MIN_ORDER_FOR_FREE_DELIVERY ? 20 : 0;
    const subTotalForGst = itemSubTotal - discount + deliveryCharge;
    const gstTax = subTotalForGst * 0.05;
    const toPay = subTotalForGst + gstTax;


    const updateCartAndLocalStorage = (updatedCart: CartItem[]) => {
        const filteredCart = updatedCart.filter(item => item.quantity > 0);
        setCart(filteredCart);
        localStorage.setItem('cart', JSON.stringify(filteredCart));
        if (filteredCart.length === 0) {
            router.push('/delivery');
        }
    };

    const handleQuantityChange = (name: string, newQuantity: number) => {
        const updatedCart = cart.map(item =>
            item.name === name ? { ...item, quantity: newQuantity } : item
        );
        updateCartAndLocalStorage(updatedCart);
    };

    const handleApplyCoupon = (coupon: Coupon) => {
        const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const isFirstOrder = true;
        const now = new Date();
        const isLunch = now.getHours() >= 12 && now.getHours() < 15;
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;

        const calculatedDiscount = coupon.discount(subTotal, isFirstOrder, isLunch, isWeekend);

        if (calculatedDiscount > 0 || coupon.freebie) {
            setAppliedCoupon(coupon);
            setDiscount(calculatedDiscount);
        } else {
            console.log("Coupon not applicable");
            setAppliedCoupon(null);
            setDiscount(0);
        }
        setIsCouponModalOpen(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
    }

    const showAlert = (title: string, message: string) => {
        setConfirmationModalProps({ title, message });
        setIsConfirmationModalOpen(true);
    };

    const handleProceed = async () => {
        if (!selectedAddress || !selectedAddress.name || !selectedAddress.address || !selectedAddress.phone) {
            setIsAddressModalOpen(true);
            return;
        }
        if (!/^\d{10}$/.test(selectedAddress.phone.replace(/^91/, ''))) {
            showAlert('Invalid Phone Number', 'Please provide a valid 10-digit phone number in the selected address.');
            setIsAddressModalOpen(true);
            return;
        }

        setIsPlacingOrder(true);

        try {
            const readableId = await generateReadableOrderId();

            const customerData = {
                name: selectedAddress.name || 'New Customer',
                phone: `91${selectedAddress.phone.replace(/^91/, '')}`,
                uid: user ? user.uid : null,
                email: user ? user.email : null,
            };

            const newOrder = {
                id: readableId,
                customer: customerData,
                address: selectedAddress.address,
                location: selectedAddress.location || null,
                type: 'Delivery',
                items: cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
                total: toPay,
                status: 'Accept Order',
                timestamp: serverTimestamp(),
                cart: cart,
                showNotification: 'new',
                seen: false
            };

            const docRef = await addDoc(collection(db, 'orders'), newOrder);

            const finalOrderDetails = {
                cart,
                itemSubTotal,
                deliveryCharge,
                gstTax,
                discount,
                toPay,
                selectedAddress,
                appliedCoupon,
                orderId: readableId,
                customerUid: user ? user.uid : null,
                guestDocId: !user ? docRef.id : null,
            };

            localStorage.setItem('orderDetails', JSON.stringify(finalOrderDetails));
            localStorage.removeItem('cart');
            localStorage.removeItem('guestAddress');

            router.push('/delivery/confirmation');

        } catch (error) {
            console.error("Error writing document: ", error);
            showAlert("Order Failed", "Could not place your order. Please try again or contact support.");
            setIsPlacingOrder(false);
        }
    };

    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address);
        if (!user) {
            localStorage.setItem('guestAddress', JSON.stringify(address));
        }
        setIsAddressModalOpen(false);
    }

    if (cart.length === 0 && !isPlacingOrder) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
                    <button onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                </header>
                <main className="flex-grow p-4 text-center">
                    <p>Your cart is empty.</p>
                    <Link href="/delivery" className="text-blue-600 mt-4 inline-block">
                        Go back to menu
                    </Link>
                </main>
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
                        <div className="flex items-center w-full">
                            <button onClick={() => router.push('/delivery')} className="mr-4">
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-base font-bold">Checkout</h1>
                                <p className="text-xs text-muted-foreground">View N Vibe, McLeod Ganj</p>
                            </div>
                        </div>
                    </header>

                    <main className="flex-grow p-4 space-y-6 pb-40 bg-gray-100 md:bg-white">
                        <div className="space-y-6">

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex justify-between items-start">
                                    {selectedAddress ? (
                                        <>
                                            <div>
                                                <h2 className="text-xs font-semibold mb-2">Delivering to {selectedAddress.name}</h2>
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 mr-3 mt-1 text-muted-foreground flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-xs">{selectedAddress.type}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedAddress.address}</p>
                                                        {selectedAddress.phone && <p className="text-xs text-muted-foreground">Phone: {selectedAddress.phone}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setIsAddressModalOpen(true)} className="text-senoa-green font-bold text-[10px] flex-shrink-0">
                                                CHANGE
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsAddressModalOpen(true)} className="text-senoa-green font-bold w-full text-left py-2 text-sm">
                                            + SELECT DELIVERY ADDRESS
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h2 className="text-lg font-semibold mb-4">Your Order</h2>
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <p className="font-semibold text-sm flex-1">{item.name}</p>
                                            <div className="flex items-center space-x-3 border rounded-md px-2 py-1 mx-4">
                                                <button
                                                    onClick={() => handleQuantityChange(item.name, item.quantity - 1)}
                                                    disabled={item.quantity <= 0}
                                                    className="text-gray-500 disabled:opacity-50"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.name, item.quantity + 1)}
                                                    className="text-gray-500"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <p className="font-medium text-sm text-right w-20">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm">
                                {!appliedCoupon ? (
                                    <button onClick={() => setIsCouponModalOpen(true)} className="flex items-center justify-between w-full text-left py-4 px-4">
                                        <div className='flex items-center'>
                                            <Tag className="h-5 w-5 mr-3 text-senoa-green" />
                                            <span className="font-semibold text-sm text-senoa-green">APPLY COUPON</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </button>
                                ) : (
                                    <div className="p-4 bg-green-50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <Sparkles className="h-5 w-5 mr-3 text-senoa-green" />
                                                <div>
                                                    <p className="font-bold text-senoa-green">{appliedCoupon.code}</p>
                                                    <p className="text-xs text-senoa-green">You saved ₹{discount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="text-red-500 font-semibold text-sm">REMOVE</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-semibold mb-4">Bill Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <p className="text-muted-foreground">Item Sub Total</p>
                                        <p>₹{itemSubTotal.toFixed(2)}</p>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-senoa-green">
                                            <p>Discount</p>
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
                                        <p className="text-muted-foreground border-b border-dashed border-gray-400">GST tax</p>
                                        <p>₹{gstTax.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between font-bold text-base border-t pt-3 mt-3">
                                        <p>To Pay</p>
                                        <p>₹{Math.round(toPay)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <footer className="fixed bottom-0 left-0 right-0 z-10 flex justify-center">
                    <div className="bg-white border-t p-4 w-full max-w-md">
                        <div className="flex items-center justify-between">
                            <div className='leading-tight'>
                                <p className="font-bold text-lg">₹{Math.round(toPay)}</p>
                                <button onClick={() => setIsBillModalOpen(true)} className="text-blue-600 text-xs font-semibold">
                                    VIEW DETAILS
                                </button>
                            </div>
                            <button onClick={handleProceed} disabled={isPlacingOrder} className="bg-senoa-green text-white font-bold py-3 px-6 rounded-md text-center flex items-center justify-center w-48 disabled:opacity-70">
                                {isPlacingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : (selectedAddress ? 'Proceed to Payment' : 'Add Address to Proceed')}
                            </button>
                        </div>
                    </div>
                </footer>
                <BillDetailsModal
                    isOpen={isBillModalOpen}
                    onClose={() => setIsBillModalOpen(false)}
                    cart={cart}
                    itemSubTotal={itemSubTotal}
                    deliveryCharge={deliveryCharge}
                    gstTax={gstTax}
                    discount={discount}
                    toPay={toPay}
                />
                <CouponModal
                    isOpen={isCouponModalOpen}
                    onClose={() => setIsCouponModalOpen(false)}
                    onApply={handleApplyCoupon}
                    subTotal={itemSubTotal}
                />
                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    onAddressSelect={handleAddressSelect}
                />
            </div>
        </>
    );
}
