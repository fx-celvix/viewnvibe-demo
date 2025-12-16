
'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, Search, SlidersHorizontal, Instagram, Facebook, Mail, Twitter, X, Info, Linkedin } from 'lucide-react';
import dynamicImport from 'next/dynamic';

import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/components/MenuItem';
import { MenuCategory } from '@/components/MenuCategory';

const SideMenu = dynamicImport(() => import('@/components/SideMenu').then(mod => mod.SideMenu));
const CategoryMenu = dynamicImport(() => import('@/components/CategoryMenu').then(mod => mod.CategoryMenu));
const FilterMenu = dynamicImport(() => import('@/components/FilterMenu').then(mod => mod.FilterMenu));
const FoodItemDetail = dynamicImport(() => import('@/components/FoodItemDetail').then(mod => mod.FoodItemDetail));
const MenuItemSkeleton = dynamicImport(() => import('@/components/MenuItemSkeleton').then(mod => mod.MenuItemSkeleton));


export default function FoodMenu() {
    const {
        menuData,
        isLoading,
        searchQuery,
        setSearchQuery,
        appliedFilters,
        setAppliedFilters,
        filteredMenuData
    } = useMenu();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('biryani');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [detailViewItems, setDetailViewItems] = useState([]);
    const [initialDetailIndex, setInitialDetailIndex] = useState(0);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleItemClick = (categoryItems: any[], itemIndex: number) => {
        setDetailViewItems(categoryItems);
        setInitialDetailIndex(itemIndex);
        setIsDetailViewOpen(true);
    };

    const handleSearchToggle = () => {
        if (isSearchOpen) {
            setSearchQuery('');
        } else {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
        setIsSearchOpen(!isSearchOpen);
    };

    const isFilterActive = Object.values(appliedFilters).some(value => value === true);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <div className="flex-1 flex flex-col md:pl-80">
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

                <FoodItemDetail
                    isOpen={isDetailViewOpen}
                    onClose={() => setIsDetailViewOpen(false)}
                    items={detailViewItems}
                    initialIndex={initialDetailIndex}
                />

                <header className="p-4 border-b sticky top-0 bg-background z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsMenuOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="ml-4 text-xl font-bold">
                                Dine-in Menu
                            </div>
                        </div>
                        <div className="hidden md:block text-2xl font-bold mx-auto">
                            Dine-in Menu
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link href="https://www.instagram.com/mybiryanicorner/" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></Link>
                            <Link href="https://www.facebook.com/profile.php?id=61579388701613" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></Link>
                            <Link href="https://x.com/mybiryanicorner" target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5" /></Link>
                            <Link href="https://www.linkedin.com/in/mybiryanicorner" target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /></Link>
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
                                {category.items.map((item, index) => (
                                    <MenuItem
                                        key={item.name}
                                        {...item}
                                        pageType="dine-in"
                                        onClick={() => handleItemClick(category.items, index)}
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
                            <li>All prices are inclusive of GST.</li>
                            <li>Extra charges for additional items like raita, salad, or any special requests will apply.</li>
                            <li>If you have any food allergies, please inform us before ordering.</li>
                            <li>Please inform the staff about any allergies or dietary restrictions.</li>
                            <li>Hot & fresh food is our priority—please consume immediately for best taste.</li>
                        </ul>
                    </div>
                    <div className="pb-24"></div>
                </main>
            </div>
        </div>
    );
}
