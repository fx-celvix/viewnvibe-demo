
'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackOptions = [
  { stars: 1, message: "I'm not happy with the service.", color: 'text-red-500', hoverColor: 'hover:text-red-600' },
  { stars: 2, message: 'The service could be better.', color: 'text-orange-500', hoverColor: 'hover:text-orange-600' },
  { stars: 3, message: 'The service was okay.', color: 'text-yellow-500', hoverColor: 'hover:text-yellow-600' },
  { stars: 4, message: 'I liked the service.', color: 'text-lime-500', hoverColor: 'hover:text-lime-600' },
  { stars: 5, message: 'I loved the service!', color: 'text-senoa-green', hoverColor: 'hover:text-senoa-green' },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [hoveredStars, setHoveredStars] = useState(0);

  const handleRatingClick = (stars: number, message: string) => {
    if (stars >= 4) {
      const googleMapsUrl = 'https://www.google.com/search?sca_esv=952fdb03796c5895&sxsrf=AE3TifN1SqXNkq6RG8CLB0YmZR9XEV1A5A:1755198576975&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-EyDxS6Ngbj2aYcY2qgsf3M6twpFPdwjvdk5aUQqZp3poSH3zqvZ8Pvj9bGhoo7fl1aWcxsClP1qTn7yokaHWOe-L_tEf&q=Biryani+Corner+Reviews&sa=X&ved=2ahUKEwiFpcOdgIuPAxXnR2wGHb_xMwUQ0bkNegQIIhAD&cshid=1755198597250767&biw=1600&bih=773&dpr=1.8#lrd=0x39ed572c337033d1:0xd009840ec8339a3,3,,,,';
      window.open(googleMapsUrl, '_blank');
    } else {
      const phoneNumber = '917909067655'; 
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(url, '_blank');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-sm text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-2">Rate your experience</h2>
        <p className="text-sm text-muted-foreground mb-6">Let us know how we did!</p>

        <div className="flex justify-center items-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => {
            const rating = feedbackOptions[star - 1];
            return (
              <a
                key={star}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleRatingClick(rating.stars, rating.message);
                }}
                onMouseEnter={() => setHoveredStars(star)}
                onMouseLeave={() => setHoveredStars(0)}
                className="transform transition-transform duration-200 hover:scale-125"
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    star <= hoveredStars
                      ? rating.color
                      : 'text-gray-300'
                  }`}
                  fill={star <= hoveredStars ? 'currentColor' : 'none'}
                />
              </a>
            );
          })}
        </div>
        
        <div className="text-sm font-semibold h-5">
            {hoveredStars > 0 && (
                <span className={feedbackOptions[hoveredStars - 1].color}>
                    {feedbackOptions[hoveredStars - 1].message}
                </span>
            )}
        </div>
      </div>
    </div>
  );
}
