'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, generateReadableOrderId } from '@/lib/firebase';
import { collection, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { X, Phone, User, MapPin, ClipboardList, Search, XCircle, Minus, Plus, Book, IndianRupee, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));

interface CustomerData {
    name: string;
    phone: string;
    address: string;
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddOrder: (order: any) => void;
}

export const CreateOrderModal = ({ isOpen, onClose, onAddOrder }: CreateOrderModalProps) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [orderType, setOrderType] = useState('Delivery');
    const [orderedItems, setOrderedItems] = useState<{ name: string, quantity: number, price: number, gst_percent?: number }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [customerSuggestions, setCustomerSuggestions] = useState<CustomerData[]>([]);
    const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({ title: '', message: '' });

    useEffect(() => {
        const fetchMenu = async () => {
            const querySnapshot = await getDocs(collection(db, "menu"));
            const fetchedItems: any[] = [];
            querySnapshot.forEach((doc) => {
                const category = doc.data();
                category.items.forEach((item: any) => {
                    item.prices.forEach((price: any) => {
                        fetchedItems.push({
                            name: `${item.name}${price.label ? ` (${price.label})` : ''}`,
                            price: price.price,
                            gst_percent: item.gst_percent
                        });
                    });
                });
            });
            setMenuItems(fetchedItems);
        };

        const fetchCustomers = async () => {
            const querySnapshot = await getDocs(collection(db, "orders"));
            const customers: Record<string, CustomerData> = {};
            querySnapshot.forEach(doc => {
                const order = doc.data();
                if (order.customer && order.customer.name && order.customer.phone) {
                    const customerId = order.customer.phone;
                    customers[customerId] = {
                        name: order.customer.name,
                        phone: order.customer.phone,
                        address: order.address || 'N/A',
                    };
                }
            });
            setAllCustomers(Object.values(customers));
        };

        if (isOpen) {
            fetchMenu();
            fetchCustomers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (customerPhone.length > 2 && showSuggestions) {
            const suggestions = allCustomers.filter(customer =>
                customer.phone.replace(/^91/, '').includes(customerPhone)
            );
            setCustomerSuggestions(suggestions);
        } else {
            setCustomerSuggestions([]);
        }
    }, [customerPhone, allCustomers, showSuggestions]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerPhone(e.target.value);
        setShowSuggestions(true); // Show suggestions when user is typing
    };

    const handleSuggestionClick = (customer: CustomerData) => {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone.replace(/^91/, ''));
        setAddress(customer.address !== 'N/A' && customer.address !== 'Take-away' ? customer.address : '');
        setShowSuggestions(false); // Hide suggestions after selection
        setCustomerSuggestions([]);
    };


    const total = useMemo(() => {
        return orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [orderedItems]);

    const filteredMenuItems = useMemo(() => {
        if (!searchQuery) return [];
        return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, menuItems]);

    const handleItemQuantityChange = (item: any, quantity: number) => {
        setOrderedItems(currentItems => {
            const existingItemIndex = currentItems.findIndex(i => i.name === item.name);

            if (existingItemIndex > -1) {
                const updatedItems = [...currentItems];
                if (quantity > 0) {
                    updatedItems[existingItemIndex].quantity = quantity;
                } else {
                    updatedItems.splice(existingItemIndex, 1);
                }
                return updatedItems;
            } else if (quantity > 0) {
                return [...currentItems, { ...item, quantity }];
            }
            return currentItems;
        });
    };

    const resetForm = () => {
        setCustomerName('');
        setCustomerPhone('');
        setAddress('');
        setOrderType('Delivery');
        setOrderedItems([]);
        setSearchQuery('');
        setCustomerSuggestions([]);
        setIsProcessing(false);
    };

    const showAlert = (title: string, message: string) => {
        setConfirmationModalProps({ title, message });
        setIsConfirmationModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^\d{10}$/.test(customerPhone)) {
            showAlert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
            return;
        }

        if (orderType === 'Delivery' && !address.trim()) {
            showAlert('Missing Address', 'Please enter a delivery address for delivery orders.');
            return;
        }

        if (orderedItems.length === 0) {
            showAlert('Empty Order', 'Please add at least one item to the order.');
            return;
        }

        setIsProcessing(true);
        const readableId = await generateReadableOrderId();

        const newOrder = {
            id: readableId,
            customer: { name: customerName, phone: `91${customerPhone}` },
            type: orderType,
            address: orderType === 'Delivery' ? address : 'Take-away',
            items: orderedItems.map(item => `${item.quantity}x ${item.name}`).join(', '),
            total: total,
            status: 'Accept Order',
            timestamp: serverTimestamp(),
            seen: true, // Mark as seen initially
            showNotification: 'preparing',
            cart: orderedItems
        };
        onAddOrder(newOrder);
        onClose();
        resetForm();
    };

    if (!isOpen) return null;

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
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-bold">Create New Order</h2>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label htmlFor="customerPhone" className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><Phone className="h-3 w-3 mr-1" />Customer Phone</label>
                                <div className="relative flex items-center">
                                    <span className="pl-3 pr-2 py-2 text-sm text-gray-500 border-y border-l rounded-l-md bg-gray-50">+91</span>
                                    <input id="customerPhone" type="tel" value={customerPhone} onChange={handlePhoneChange} required className="w-full border-y border-r rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                {customerSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        {customerSuggestions.map(customer => (
                                            <button
                                                type="button"
                                                key={customer.phone}
                                                onClick={() => handleSuggestionClick(customer)}
                                                className="w-full text-left p-2 text-sm hover:bg-gray-100"
                                            >
                                                <p className="font-semibold">{customer.name}</p>
                                                <p className="text-xs text-gray-500">{customer.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="customerName" className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><User className="h-3 w-3 mr-1" />Customer Name</label>
                                <input id="customerName" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>

                        {orderType === 'Delivery' && (
                            <div>
                                <label htmlFor="address" className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><MapPin className="h-3 w-3 mr-1" />Delivery Address</label>
                                <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required={orderType === 'Delivery'} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none h-20" />
                            </div>
                        )}


                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><ClipboardList className="h-3 w-3 mr-1" />Order Items</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for food items..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full border rounded-md py-2 pl-10 pr-10 text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                {searchQuery && (
                                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <XCircle size={16} />
                                    </button>
                                )}
                            </div>

                            {searchQuery && (
                                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                                    {filteredMenuItems.length > 0 ? filteredMenuItems.map(item => {
                                        const orderedItem = orderedItems.find(i => i.name === item.name);
                                        const quantity = orderedItem ? orderedItem.quantity : 0;
                                        return (
                                            <div key={item.name} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                                <div>
                                                    <p className="text-sm font-semibold">{item.name}</p>
                                                    <p className="text-xs text-gray-500">₹{item.price}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button type="button" onClick={() => handleItemQuantityChange(item, quantity - 1)} className="p-1 rounded-full border"><Minus size={14} /></button>
                                                    <span>{quantity}</span>
                                                    <button type="button" onClick={() => handleItemQuantityChange(item, quantity + 1)} className="p-1 rounded-full border"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        )
                                    }) : (
                                        <p className="p-2 text-sm text-gray-500">No items found.</p>
                                    )}
                                </div>
                            )}

                            {orderedItems.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {orderedItems.map(item => (
                                        <div key={item.name} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <p className="text-sm">{item.quantity} x {item.name}</p>
                                            <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><Book className="h-3 w-3 mr-1" />Order Type</label>
                                <select value={orderType} onChange={e => setOrderType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
                                    <option>Delivery</option>
                                    <option>Take-away</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="total" className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><IndianRupee className="h-3 w-3 mr-1" />Total Amount</label>
                                <input id="total" type="number" value={total} readOnly className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-100" />
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100">Cancel</button>
                            <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm font-semibold rounded-md bg-senoa-green text-white hover:bg-senoa-green-dark flex items-center justify-center w-36 disabled:opacity-50">
                                {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
