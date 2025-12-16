
'use client';

import { createContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { CartItem } from '@/types';

interface FilterState {
    popular: boolean;
    mustTry: boolean;
    veg: boolean;
    nonVeg: boolean;
}

interface MenuCategory {
    id: string;
    title: string;
    items: any[];
}

interface MenuContextType {
    menuData: any[];
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    appliedFilters: FilterState;
    setAppliedFilters: (filters: FilterState) => void;
    cart: CartItem[];
    updateCart: (cart: CartItem[]) => void;
    filteredMenuData: any[];
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [menuData, setMenuData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<FilterState>({
        popular: false,
        mustTry: false,
        veg: false,
        nonVeg: false,
    });
    const [cart, setCart] = useState<CartItem[]>([]);

    // Function to update cart state and persist to localStorage
    const updateCart = useCallback((newCart: CartItem[]) => {
        const filteredCart = newCart.filter(item => item.quantity > 0);
        setCart(filteredCart);
        try {
            // This can fail in private browsing or if storage is full
            localStorage.setItem('cart', JSON.stringify(filteredCart));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, []);

    useEffect(() => {
        // Strategy: Stale-While-Revalidate
        // 1. Immediate: Load from localStorage if available for instant render
        const cachedMenu = localStorage.getItem('menuData');
        let hasCache = false;

        if (cachedMenu) {
            try {
                const parsed = JSON.parse(cachedMenu);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMenuData(parsed);
                    setIsLoading(false);
                    hasCache = true;
                }
            } catch (e) {
                console.error("Failed to parse cached menu:", e);
            }
        }

        // 2. Background: Fetch fresh data from Firestore
        const fetchMenu = async () => {
            if (!hasCache) setIsLoading(true);

            try {
                const menuCollection = collection(db, 'menu');
                const querySnapshot = await getDocs(menuCollection);
                const menuItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory));
                menuItems.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

                // Update state with fresh data
                setMenuData(menuItems);

                // Update Cache
                localStorage.setItem('menuData', JSON.stringify(menuItems));
            } catch (error) {
                console.error("Error fetching menu data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenu();

        // Initial load from localStorage
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
            const savedFilters = localStorage.getItem('menuFilters');
            if (savedFilters) {
                setAppliedFilters(JSON.parse(savedFilters));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage:", error);
        }


        // Listen for changes in localStorage from other tabs/windows
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cart') {
                const newCart = event.newValue ? JSON.parse(event.newValue) : [];
                setCart(newCart); // Directly set the cart without calling updateCart to avoid loops
            }
            if (event.key === 'menuFilters') {
                const newFilters = event.newValue ? JSON.parse(event.newValue) : { popular: false, mustTry: false, veg: false, nonVeg: false };
                setAppliedFilters(newFilters);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const filteredMenuData = useMemo(() => menuData.map(category => ({
        ...category,
        items: category.items.filter(item => {
            const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!searchMatch) return false;

            const { popular, mustTry, veg, nonVeg } = appliedFilters;
            if (popular && !item.popular) return false;
            if (mustTry && !item.mustTry) return false;
            if (veg && !item.isVeg) return false;
            if (nonVeg && item.isVeg) return false;

            return true;
        })
    })).filter(category => category.items.length > 0), [menuData, searchQuery, appliedFilters]);

    const value = {
        menuData,
        isLoading,
        searchQuery,
        setSearchQuery,
        appliedFilters,
        setAppliedFilters,
        cart,
        updateCart,
        filteredMenuData
    };

    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
