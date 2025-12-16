
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const VegIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#4CAF50"/>
        <circle cx="6" cy="6" r="3" fill="#4CAF50"/>
    </svg>
);

const NonVegIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#E53935"/>
        <circle cx="6" cy="6" r="3" fill="#E53935"/>
    </svg>
);

interface Price {
    label?: string;
    price: number;
}
interface FoodItem {
  name: string;
  description: string;
  prices: Price[];
  imageUrl: string;
  imageHint: string;
  isVeg: boolean;
  popular?: boolean;
  mustTry?: boolean;
}

interface FoodItemDetailProps {
  isOpen: boolean;
  onClose: () => void;
  items: FoodItem[];
  initialIndex: number;
}

export function FoodItemDetail({ isOpen, onClose, items, initialIndex }: FoodItemDetailProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    }
  }, [items.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);


  if (!isOpen || !items.length) return null;

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      handleNext();
    }

    if (touchStartX.current - touchEndX.current < -75) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const priceString = currentItem.prices.map(p => `${p.label ? p.label + ': ' : ''}₹${p.price}`).join(' / ');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-lg shadow-xl w-full max-w-sm m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black bg-opacity-40 rounded-full p-1 z-20">
          <X className="h-6 w-6" />
        </button>

        <div className="relative w-full aspect-square">
          <Image
            src={currentItem.imageUrl.replace(/150x150/g, '400x400')}
            alt={currentItem.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out"
            data-ai-hint={currentItem.imageHint}
            key={currentIndex}
          />
        </div>

        <div className="p-4">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold mb-2 pr-4">{currentItem.name}</h2>
                {currentItem.isVeg ? <VegIcon className="flex-shrink-0 mt-2" /> : <NonVegIcon className="flex-shrink-0 mt-2" />}
            </div>
          <p className="text-muted-foreground mb-4 text-sm">{currentItem.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">{priceString}</span>
            <div className="flex items-center space-x-2">
                {currentItem.mustTry && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">MUST TRY</span>}
                {currentItem.name === "Korean Bun" && <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">NEW!</span>}
            </div>
          </div>
        </div>
        
        {items.length > 1 && (
            <>
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev();}}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext();}}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </>
        )}
      </div>
    </div>
  );
}

    