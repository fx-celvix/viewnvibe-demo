
'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  endValue: number;
  duration?: number;
}

export function AnimatedCounter({ endValue, duration = 1000 }: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0; // Always start from 0 on change

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const nextValue = startValue + (endValue - startValue) * percentage;
      setCurrentValue(nextValue);

      if (progress < duration) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
      }
    };

    // Reset and start animation
    setCurrentValue(0);
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [endValue, duration]);

  // Format to 2 decimal places only if it's not a whole number
  const isFloat = endValue % 1 !== 0;
  const displayValue = isFloat ? currentValue.toFixed(2) : Math.round(currentValue).toLocaleString();

  return <>{displayValue}</>;
};

    