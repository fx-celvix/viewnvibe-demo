
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, SlidersHorizontal, ShoppingCart, User, MapPin, X, Loader2, Info } from 'lucide-react';
import dynamicImport from 'next/dynamic';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/components/MenuItem';
import { MenuCategory } from '@/components/MenuCategory';
import type { CartItem } from '@/types';

const SideMenu = dynamicImport(() => import('../../components/SideMenu').then(mod => mod.SideMenu));
const CategoryMenu = dynamicImport(() => import('@/components/CategoryMenu').then(mod => mod.CategoryMenu));
const FilterMenu = dynamicImport(() => import('@/components/FilterMenu').then(mod => mod.FilterMenu));
const ProfileMenu = dynamicImport(() => import('@/components/ProfileMenu').then(mod => mod.ProfileMenu));
const OrderStatusNotifier = dynamicImport(() => import('@/components/OrderStatusNotifier').then(mod => mod.OrderStatusNotifier));
const MenuItemSkeleton = dynamicImport(() => import('@/components/MenuItemSkeleton').then(mod => mod.MenuItemSkeleton));
const AuthModal = dynamicImport(() => import('@/components/AuthModal').then(mod => mod.AuthModal));


export const dynamic = 'force-dynamic';

export default function DeliveryMenu() {
    const router = useRouter();
    const {
        menuData,
        isLoading,
        searchQuery,
        setSearchQuery,
        appliedFilters,
        setAppliedFilters,
        cart,
        updateCart,
        filteredMenuData
    } = useMenu();
    const [user, authLoading] = useAuthState(auth);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('biryani');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const [location, setLocation] = useState<{ city: string; area: string } | null>(null);
    const [locationStatus, setLocationStatus] = useState('Fetching location...');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Clear cart if returning from a completed order
        if (localStorage.getItem('orderDetails')) {
            updateCart([]);
            localStorage.removeItem('orderDetails');
        }
    }, [updateCart]);

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true);
        }
    }, [user, authLoading]);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setLocationStatus('Fetching address...');
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const area = data.address.suburb || data.address.road || data.address.neighbourhood || data.address.county || '';
                            const city = data.address.city || data.address.town || data.address.village || data.address.state || '';
                            if (area && city) {
                                setLocation({ city, area });
                                setLocationStatus('');
                            } else {
                                setLocationStatus('Detailed address not found.');
                            }
                        } else {
                            setLocationStatus('Could not determine address.');
                        }
                    } catch (error) {
                        console.error('Error fetching address: ', error);
                        setLocationStatus('Could not fetch address.');
                    }
                },
                (error) => {
                    setLocationStatus("Location access denied.");
                    console.error('Geolocation error: ', error);
                }
            );
        } else {
            setLocationStatus('Geolocation not supported.');
        }
    }, []);

    const handleSearchToggle = () => {
        if (isSearchOpen) {
            setSearchQuery('');
        } else {
            // Use timeout to ensure input is visible before focusing
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
        setIsSearchOpen(!isSearchOpen);
    };

    const handleCheckout = () => {
        setIsCheckingOut(true);
        router.push('/delivery/checkout');
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const minOrderForFreeDelivery = 399;
    const isFilterActive = Object.values(appliedFilters).some(value => value === true);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <OrderStatusNotifier />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <CategoryMenu
                isOpen={isCategoryMenuOpen}
                onClose={() => setIsCategoryMenuOpen(false)}
                menuData={menuData}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
            <FilterMenu
                isOpen={isFilterMenuOpen}
                onClose={() => setIsFilterMenuOpen(false)}
                applyFilters={setAppliedFilters}
                initialFilters={appliedFilters}
            />
            <ProfileMenu
                isOpen={isProfileMenuOpen}
                onClose={() => setIsProfileMenuOpen(false)}
                setCart={updateCart}
            />

            <div className={`flex-1 flex flex-col md:pl-80 ${totalItems > 0 ? 'pb-32' : ''}`}>
                <header className="p-4 border-b sticky top-0 bg-background z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="md:hidden mr-2">
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-1 flex-shrink-0 text-muted-foreground" />
                                <div>
                                    {location ? (
                                        <>
                                            <p className="font-bold text-sm leading-tight">{location.area}</p>
                                            <p className="text-xs text-muted-foreground leading-tight">{location.city}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{locationStatus}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block text-2xl font-bold">
                            Doorstep Delivery
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsProfileMenuOpen(true)}>
                                <User className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center h-10">
                        <div className={`transition-all duration-300 flex-shrink-0 ${isSearchOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <button
                                onClick={() => setIsCategoryMenuOpen(true)}
                                className="flex items-center px-4 py-2 bg-senoa-green text-white rounded-full text-sm font-semibold hover:bg-senoa-green/90"
                            >
                                Menu
                            </button>
                        </div>

                        <div className="flex items-center justify-end flex-grow">
                            <div className={`relative flex items-center justify-end w-full`}>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`border rounded-full py-2 pl-10 pr-4 transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
                                />
                                <Search className={`h-5 w-5 absolute left-3 text-muted-foreground transition-opacity duration-300 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

                                <button
                                    onClick={handleSearchToggle}
                                    className={`p-2 border rounded-full transition-all duration-300 ${isSearchOpen ? 'ml-2' : ''}`}
                                >
                                    {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className={`relative transition-all duration-300 ${isSearchOpen ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }}>
                                <button onClick={() => setIsFilterMenuOpen(true)} className="p-2 border rounded-full ml-2 relative">
                                    <SlidersHorizontal className={`h-5 w-5 ${isFilterActive ? 'text-blue-600' : ''}`} />
                                    {isFilterActive && <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-blue-600"></span>}
                                </button>
                            </div>
                            <button className={`relative transition-all duration-300 ml-2 ${isSearchOpen ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }} onClick={handleCheckout}>
                                <ShoppingCart className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i}>
                                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <MenuItemSkeleton />
                                        <MenuItemSkeleton />
                                        <MenuItemSkeleton />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredMenuData.length > 0 ? (
                        filteredMenuData.map(category => (
                            <MenuCategory key={category.id} id={category.id} title={category.title} defaultOpen={true}>
                                {category.items.map((item: any) => (
                                    <MenuItem
                                        key={item.name}
                                        {...item}
                                        cart={cart}
                                        updateCart={updateCart}
                                        pageType="delivery"
                                    />
                                ))}
                            </MenuCategory>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-lg font-semibold">No items found</p>
                            <p className="text-muted-foreground">Try searching for something else or clearing your filters.</p>
                        </div>
                    )}

                    <div className="mt-24 text-muted-foreground text-xs">
                        <h3 className="font-semibold text-sm mb-3 text-foreground">Delivery & Order Guidelines</h3>
                        <ul className="list-disc list-outside pl-4 space-y-1">
                            <li>Minimum order for delivery is ₹100.</li>
                            <li>Delivery charges of ₹20 apply on all orders below ₹399.</li>
                            <li>Orders once confirmed cannot be cancelled.</li>
                            <li>Delivery time may vary based on location and order volume.</li>
                            <li>All prices are inclusive of GST.</li>
                            <li>Extra charges for additional items like raita, salad, or any special requests will apply.</li>
                            <li>If you have any food allergies, please inform us before ordering.</li>
                            <li>Please check your order upon delivery. No returns or exchanges will be accepted afterwards.</li>
                            <li>Hot & fresh food is our priority—please consume immediately for best taste.</li>
                            <li>For any issues, please contact our helpline within 30 minutes of delivery.</li>
                        </ul>
                    </div>
                    <div className="pb-24"></div>
                </main>

                {totalItems > 0 && (
                    <footer className="fixed bottom-0 left-0 right-0 md:left-80 bg-white p-4 border-t shadow-lg z-20">
                        <div className="w-full">
                            {totalPrice < minOrderForFreeDelivery && (
                                <p className="text-xs text-left text-red-500 mb-2">
                                    Add items worth ₹{(minOrderForFreeDelivery - totalPrice).toFixed(0)} to get free delivery
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <ShoppingCart className="h-6 w-6" />
                                        <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold">INR {totalPrice.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Extra charges may apply</p>
                                    </div>
                                </div>
                                <button onClick={handleCheckout} disabled={isCheckingOut} className="bg-senoa-green text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center disabled:opacity-75">
                                    {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Place Order</span>}
                                </button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}
