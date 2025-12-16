
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Plus, Minus, Image as ImageIcon } from 'lucide-react';
import type { CartItem } from '@/types';

const VegIcon = ({ className }: { className?: string }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#4CAF50"/>
        <circle cx="6" cy="6" r="3" fill="#4CAF50"/>
    </svg>
);

const NonVegIcon = ({ className }: { className?: string }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#E53935"/>
        <circle cx="6" cy="6" r="3" fill="#E53935"/>
    </svg>
);

interface Price {
    label?: string;
    price: number;
}

interface MenuItemProps {
    name: string;
    description: string;
    prices: Price[];
    imageUrl: string;
    imageHint: string;
    isVeg?: boolean;
    popular?: boolean;
    mustTry?: boolean;
    isNew?: boolean;
    gst_percent?: number;
    cart?: CartItem[];
    updateCart?: (cart: CartItem[]) => void;
    onClick?: () => void;
    pageType: 'dine-in' | 'delivery' | 'take-away';
}


export function MenuItem({ name, description, prices, imageUrl, imageHint, isVeg = true, popular = false, mustTry = false, isNew = false, gst_percent = 5, cart, updateCart, onClick, pageType }: MenuItemProps) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const showImage = imageUrl && !imageUrl.includes('placehold.co');

    const handleUpdateCart = (itemName: string, price: number, newQuantity: number) => {
        if (!cart || !updateCart) return;

        let updatedCart;
        const existingItemIndex = cart.findIndex(item => item.name === itemName);

        if (newQuantity > 0) {
            if (existingItemIndex > -1) {
                updatedCart = [...cart];
                updatedCart[existingItemIndex].quantity = newQuantity;
            } else {
                updatedCart = [...cart, { name: itemName, quantity: newQuantity, price, gst_percent }];
            }
        } else {
            updatedCart = cart.filter(item => item.name !== itemName);
        }
        updateCart(updatedCart);
    };
    
    const renderAddToCart = (priceInfo: Price, index: number) => {
        if (priceInfo.price <= 0) return null;
        
        const itemName = `${name}${priceInfo.label ? ` (${priceInfo.label})` : ''}`;
        const cartItem = cart?.find(item => item.name === itemName);
        const quantity = cartItem ? cartItem.quantity : 0;

        return (
             <div key={index} className="flex justify-between items-center mt-2">
                <p className="font-semibold text-sm">{priceInfo.label ? `${priceInfo.label}: ` : ''}₹{priceInfo.price}</p>
                {quantity === 0 ? (
                    <button onClick={() => handleUpdateCart(itemName, priceInfo.price, 1)} className="text-sm font-bold text-senoa-green border border-senoa-green rounded-md px-4 py-1">
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleUpdateCart(itemName, priceInfo.price, quantity - 1)} className="text-senoa-green"><Minus size={16} /></button>
                        <span className="font-bold text-senoa-green">{quantity}</span>
                        <button onClick={() => handleUpdateCart(itemName, priceInfo.price, quantity + 1)} className="text-senoa-green"><Plus size={16} /></button>
                    </div>
                )}
            </div>
        )
    }

    const priceString = prices.filter(p => p.price > 0).map(p => `${p.label ? p.label + ': ' : ''}₹${p.price}`).join(' / ');
    const isClickable = pageType === 'dine-in';

    return (
        <div 
            id={`item-${name.replace(/\s+/g, '-').toLowerCase()}`} 
            className={`flex bg-[#fffdf5] rounded-lg shadow-sm relative scroll-mt-28 transition-shadow ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'hover:shadow-md'}`}
            onClick={isClickable ? onClick : undefined}
        >
            {isVeg ? <VegIcon className="absolute top-2 right-2" /> : <NonVegIcon className="absolute top-2 right-2" />}
            
            <div className="flex w-full">
                {showImage && (
                    <div className="relative w-28 h-28 flex-shrink-0 aspect-square">
                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-l-lg">
                                <ImageIcon className="h-8 w-8 text-gray-400 animate-pulse" />
                            </div>
                        )}
                        <Image
                            src={imageUrl}
                            alt={name}
                            width={150}
                            height={150}
                            className={`object-cover h-full w-full rounded-l-lg transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            data-ai-hint={imageHint}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                        />
                    </div>
                )}
                <div className={`p-3 flex flex-col justify-between flex-grow ${!showImage ? 'rounded-lg' : 'rounded-r-lg'}`}>
                    <div>
                        <h3 className="font-bold text-base pr-4">{name}</h3>
                        <div className="flex items-center space-x-2 my-1">
                            {isNew && <span className="relative overflow-hidden inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shimmer-overlay">NEW</span>}
                            {popular && <span className="relative overflow-hidden inline-block bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shimmer-overlay">POPULAR</span>}
                            {mustTry && <span className="relative overflow-hidden inline-block bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shimmer-overlay">MUST TRY</span>}
                        </div>
                        {description && <p className="text-muted-foreground text-[11px] mt-1">{description}</p>}
                    </div>
                    <div>
                        {pageType === 'dine-in' ? (
                            <p className="font-semibold text-sm mt-2">{priceString}</p>
                        ) : (
                            prices.map(renderAddToCart)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
