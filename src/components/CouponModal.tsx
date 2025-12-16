
'use client';

import { X, Tag } from 'lucide-react';
import { useState } from 'react';
import { coupons as hardcodedCoupons } from '@/data/coupons';


// Hardcoded coupon data
const localCoupons = [
    {
      code: 'TREAT500',
      description: 'Order above ₹500 & get 10% OFF.',
      type: 'Percentage',
      value: 10,
      minOrder: 500,
    },
    {
      code: 'MEAL100',
      description: 'Flat ₹100 OFF on orders above ₹799.',
      type: 'Flat',
      value: 100,
      minOrder: 799,
    },
    {
      code: 'HUNGRY15',
      description: 'Get 15% OFF on your first 3 orders.',
      type: 'Percentage',
      value: 15,
      minOrder: 0,
      isFirstOrderOnly: true, // Simplified to first order
    },
    {
      code: 'FREEDRINK',
      description: 'Free drink on orders above ₹399.',
      type: 'Freebie',
      value: 'Free Soft Drink',
      minOrder: 399,
    },
    {
      code: 'BINGE250',
      description: 'Get ₹250 OFF on orders above ₹1499.',
      type: 'Flat',
      value: 250,
      minOrder: 1499,
    },
    {
      code: 'LUNCHLOVER',
      description: 'Flat 20% OFF on lunch orders placed between 12 PM – 3 PM.',
      type: 'Percentage',
      value: 20,
      minOrder: 0,
      isLunchOnly: true,
    },
    {
      code: 'WEEKENDWOW',
      description: 'Flat ₹200 OFF on weekend orders above ₹999.',
      type: 'Flat',
      value: 200,
      minOrder: 999,
      isWeekendOnly: true,
    },
];

const calculateDiscount = (coupon, subTotal, isFirstOrder = false, isLunch = false, isWeekend = false) => {
    // Custom logic checks
    if (coupon.isFirstOrderOnly && !isFirstOrder) return 0;
    if (coupon.isLunchOnly && !isLunch) return 0;
    if (coupon.isWeekendOnly && !isWeekend) return 0;

    // General checks
    if (coupon.minOrder && subTotal < coupon.minOrder) return 0;

    // Discount calculation
    if (coupon.type === 'Flat') {
        return Number(coupon.value);
    }
    if (coupon.type === 'Percentage') {
        return subTotal * (Number(coupon.value) / 100);
    }
    return 0; // For freebies or other types
};


interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (coupon: any) => void;
    subTotal: number;
}

export function CouponModal({ isOpen, onClose, onApply, subTotal }: CouponModalProps) {
    const [couponCode, setCouponCode] = useState('');
    const [error, setError] = useState('');

    const handleApplyClick = (coupon) => {
        if (!coupon) {
            setError('Invalid coupon code.');
            return;
        }

        // These flags would typically come from user data or system state
        const isFirstOrder = true; // Placeholder
        const now = new Date();
        const isLunch = now.getHours() >= 12 && now.getHours() < 15;
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;

        const calculatedDiscount = calculateDiscount(coupon, subTotal, isFirstOrder, isLunch, isWeekend);
        
        const isApplicable = calculatedDiscount > 0 || coupon.type === 'Freebie';
        
        if (isApplicable && (!coupon.minOrder || subTotal >= coupon.minOrder)) {
            const appliedCoupon = {
                code: coupon.code,
                description: coupon.description,
                discount: (subTotal) => calculateDiscount(coupon, subTotal, isFirstOrder, isLunch, isWeekend),
                minOrder: coupon.minOrder,
                freebie: coupon.type === 'Freebie' ? coupon.value : undefined,
            };
            onApply(appliedCoupon);
            setError('');
        } else {
            setError(`This coupon is only valid for orders above ₹${coupon.minOrder}.`);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const coupon = localCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        handleApplyClick(coupon);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col md:items-center md:justify-center justify-end">
            <div className="bg-gray-100 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 bg-white rounded-t-2xl sticky top-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Apply Coupon</h2>
                        <button onClick={onClose}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleFormSubmit} className="flex space-x-2">
                        <input 
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="flex-grow border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-xs"
                            autoCapitalize="characters"
                        />
                        <button type="submit" className="px-4 py-1.5 text-senoa-green font-bold rounded-lg border-2 border-senoa-green hover:bg-green-50 transition text-xs">
                            APPLY
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </header>
                <div className="p-4 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-3">AVAILABLE COUPONS</h3>
                    <div className="space-y-3">
                        {localCoupons.map((coupon) => {
                            const isApplicable = !coupon.minOrder || subTotal >= coupon.minOrder;
                            const needed = (coupon.minOrder || 0) - subTotal;
                            return (
                                <div key={coupon.code} className={`bg-white rounded-lg p-3 border ${isApplicable ? '' : 'opacity-60'}`}>
                                    <div className="flex items-center mb-1">
                                        <Tag className="h-4 w-4 mr-2 text-senoa-green" />
                                        <span className="font-bold text-senoa-green text-sm">{coupon.code}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 mb-3 ml-6">{coupon.description}</p>
                                    <div className="border-t pt-2 flex justify-end">
                                    <button 
                                        onClick={() => handleApplyClick(coupon)} 
                                        disabled={!isApplicable}
                                        className="text-xs font-bold text-senoa-green disabled:text-gray-400"
                                    >
                                        {isApplicable ? 'APPLY' : `ADD ₹${needed.toFixed(0)} MORE`}
                                    </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
