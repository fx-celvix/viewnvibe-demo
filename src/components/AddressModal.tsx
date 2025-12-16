
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Home, Briefcase, LocateFixed, Loader2, Mail, User, Phone } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';


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

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: Address) => void;
  onAddressSave?: (address: Address) => void;
  addressToEdit?: Address | null;
}

export function AddressModal({ isOpen, onClose, onAddressSelect, onAddressSave, addressToEdit = null }: AddressModalProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [view, setView] = useState('select'); // 'select' or 'add'
    const [newAddress, setNewAddress] = useState({ name: '', line1: '', line2: '', landmark: '', type: 'Home', phone: '' });
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const locationFetchedRef = useRef(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().addresses) {
                    setSavedAddresses(userDoc.data().addresses);
                } else {
                    setSavedAddresses([]);
                }
            } else {
                setUser(null);
                const localAddress = localStorage.getItem('guestAddress');
                if(localAddress) {
                    setSavedAddresses([JSON.parse(localAddress)]);
                } else {
                    setSavedAddresses([]);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleUseCurrentLocation = () => {
        setIsFetchingLocation(true);
        setCurrentLocation(null);
        locationFetchedRef.current = true; // Mark as fetched/attempted
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const addr = data.address;
                            let line1 = [addr.house_number, addr.road, addr.neighbourhood].filter(Boolean).join(', ');
                             if (!line1 && addr.suburb) line1 = addr.suburb;
                            
                            let line2 = [addr.city, addr.county, addr.state, addr.postcode].filter(Boolean).join(', ');
                            
                            setNewAddress(prev => ({
                                ...prev,
                                line1: line1,
                                line2: line2,
                                landmark: addr.landmark || ''
                            }));
                        } else {
                            alert('Could not determine address from your location. Please enter it manually.');
                        }
                    } catch (error) {
                        console.error('Error fetching address: ', error);
                        alert('Could not fetch address. Please enter it manually.');
                    } finally {
                        setIsFetchingLocation(false);
                    }
                },
                (error) => {
                     if (error.code === error.PERMISSION_DENIED) {
                        alert("Location access denied. Please enable location services in your browser settings or enter your address manually.");
                    } else {
                        alert(`Geolocation error: ${error.message}`);
                    }
                    setIsFetchingLocation(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please enter your address manually.');
            setIsFetchingLocation(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (addressToEdit) {
                // Deconstruct the full address string back into parts for the form
                const parts = addressToEdit.address.split(', ');
                const line1 = parts.slice(0, 2).join(', ');
                const line2 = parts.length > 2 ? parts.slice(2).join(', ').replace(/, near .*$/, '') : '';
                const landmarkMatch = addressToEdit.address.match(/, near (.*)$/);
                const landmark = landmarkMatch ? landmarkMatch[1] : '';

                setNewAddress({
                    name: addressToEdit.name || '',
                    phone: addressToEdit.phone?.replace(/^91/, '') || '',
                    type: addressToEdit.type || 'Home',
                    line1: line1,
                    line2: line2,
                    landmark: landmark
                });
                setCurrentLocation(addressToEdit.location || null);
                setView('add');
            } else {
                // Determine the initial view based on whether there are saved addresses
                const hasAddresses = savedAddresses.length > 0;
                const initialView = hasAddresses ? 'select' : 'add';
                setView(initialView);

                 if (user) {
                     const userDocRef = doc(db, 'users', user.uid);
                     getDoc(userDocRef).then(userDoc => {
                         if(userDoc.exists()){
                             const userData = userDoc.data();
                             setNewAddress(prev => ({
                                 ...prev,
                                 name: userData?.name || user.displayName || '',
                                 phone: userData?.phone?.replace(/^91/, '') || user.phoneNumber || ''
                             }));
                         }
                     });
                 }
                // Auto-fetch location only if opening to add view and it hasn't been fetched yet
                if(initialView === 'add' && !locationFetchedRef.current) {
                    handleUseCurrentLocation();
                }
            }
        } else {
            // Reset form and ref when modal closes
            setView('select');
            setNewAddress({ name: '', line1: '', line2: '', landmark: '', type: 'Home', phone: '' });
            setCurrentLocation(null);
            locationFetchedRef.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, addressToEdit, user, savedAddresses]);

    useEffect(() => {
        if (view === 'add') {
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [view]);
    
    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!/^\d{10}$/.test(newAddress.phone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        const fullAddress = `${newAddress.line1}, ${newAddress.line2}${newAddress.landmark ? `, near ${newAddress.landmark}` : ''}`;
        const finalAddressObject: Address = { 
            type: newAddress.type, 
            address: fullAddress, 
            phone: `91${newAddress.phone}`, 
            name: newAddress.name,
            location: currentLocation
        };
        
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            
            if (onAddressSave) {
                // This is called from ProfileMenu (for editing)
                onAddressSave(finalAddressObject);
            } else {
                 // This is called from Checkout (for adding a new one)
                 // Use setDoc with merge to create the doc if it doesn't exist, or update it if it does.
                await setDoc(userDocRef, { addresses: arrayUnion(finalAddressObject) }, { merge: true });
                onAddressSelect(finalAddressObject);
            }
        } else {
            // Guest user logic
            localStorage.setItem('guestAddress', JSON.stringify(finalAddressObject));
            setSavedAddresses([finalAddressObject]); // Update local state for the modal
            onAddressSelect(finalAddressObject);
        }
        
        // Don't auto-close if onAddressSave is provided from Profile, let parent handle it.
        if(!onAddressSave){
            onClose(); 
        }

        // Reset form state after save
        setView('select');
        setNewAddress({ name: user?.displayName || '', line1: '', line2: '', landmark: '', type: 'Home', phone: '' });
        setCurrentLocation(null);
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex flex-col md:items-center md:justify-center justify-end">
        <div className="bg-gray-100 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 bg-white rounded-t-2xl sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">{view === 'select' ? 'Select Delivery Address' : (addressToEdit ? 'Edit Address' : 'Add New Address')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
            </header>

            <div className="p-4 overflow-y-auto">
                {view === 'select' ? (
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border">
                            <h3 className="px-4 py-2 font-semibold text-[10px] text-muted-foreground border-b tracking-wider">SAVED ADDRESSES</h3>
                            {savedAddresses.length > 0 ? savedAddresses.map((addr, index) => (
                                <div key={index} onClick={() => onAddressSelect(addr)} className="flex items-start p-4 border-b cursor-pointer hover:bg-gray-50 last:border-b-0">
                                    {addr.type === 'Home' ? <Home className="h-4 w-4 mr-4 mt-1 text-muted-foreground" /> : <Briefcase className="h-4 w-4 mr-4 mt-1 text-muted-foreground" />}
                                    <div>
                                        <p className="font-semibold text-sm">{addr.type} ({addr.name})</p>
                                        <p className="text-xs text-muted-foreground">{addr.address}</p>
                                        {addr.phone && <p className="text-xs text-muted-foreground">Phone: {addr.phone}</p>}
                                    </div>
                                </div>
                            )) : (
                                <p className="p-4 text-sm text-muted-foreground text-center">No saved addresses found.</p>
                            )}
                        </div>
                        
                        <div className="mt-4 border-t pt-4">
                            <button onClick={() => { setView('add'); handleUseCurrentLocation(); }} className="text-senoa-green font-bold w-full text-left py-2 text-sm">
                                + ADD NEW ADDRESS
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveAddress} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                         <button type="button" onClick={handleUseCurrentLocation} disabled={isFetchingLocation} className="w-full flex items-center justify-center border-2 border-dashed border-green-500 text-senoa-green font-semibold py-2 px-4 rounded-md text-sm hover:bg-green-50 transition disabled:opacity-50">
                            {isFetchingLocation ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    Fetching...
                                </>
                            ) : (
                                <>
                                    <LocateFixed className="h-4 w-4 mr-2" />
                                    Use current location
                                </>
                            )}
                        </button>
                        <input
                            ref={nameInputRef}
                            type="text"
                            placeholder="Full Name"
                            value={newAddress.name}
                            onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                            required
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                         <div className="relative flex items-center">
                            <span className="pl-3 pr-2 py-2 text-sm text-gray-500 border-y border-l rounded-l-md bg-gray-50">+91</span>
                            <input
                                type="tel"
                                placeholder="10-digit Phone Number"
                                value={newAddress.phone}
                                onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                                required
                                pattern="\d{10}"
                                title="Please enter a 10-digit phone number"
                                className="w-full border-y border-r rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Address Line 1"
                            value={newAddress.line1}
                            onChange={e => setNewAddress({...newAddress, line1: e.target.value})}
                            required
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                         <input
                            type="text"
                            placeholder="Address Line 2 (Optional)"
                            value={newAddress.line2}
                            onChange={e => setNewAddress({...newAddress, line2: e.target.value})}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                         <input
                            type="text"
                            placeholder="Landmark (Optional)"
                             value={newAddress.landmark}
                            onChange={e => setNewAddress({...newAddress, landmark: e.target.value})}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => setNewAddress({...newAddress, type: 'Home'})} className={`px-4 py-1.5 rounded-full text-xs ${newAddress.type === 'Home' ? 'bg-senoa-green text-white' : 'bg-gray-200'}`}>Home</button>
                            <button type="button" onClick={() => setNewAddress({...newAddress, type: 'Work'})} className={`px-4 py-1.5 rounded-full text-xs ${newAddress.type === 'Work' ? 'bg-senoa-green text-white' : 'bg-gray-200'}`}>Work</button>
                            <button type="button" onClick={() => setNewAddress({...newAddress, type: 'Other'})} className={`px-4 py-1.5 rounded-full text-xs ${newAddress.type === 'Other' ? 'bg-senoa-green text-white' : 'bg-gray-200'}`}>Other</button>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            {(view === 'add' && (user || savedAddresses.length > 0)) &&
                                <button type="button" onClick={() => setView('select')} className="w-1/2 bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-md text-sm">
                                    Cancel
                                </button>
                            }
                             <button type="submit" className="w-full bg-senoa-green text-white font-bold py-2.5 px-4 rounded-md text-sm">
                                Save Address
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
}
