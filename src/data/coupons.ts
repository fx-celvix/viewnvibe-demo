// src/data/coupons.ts

import { Bike, Tag, Utensils } from 'lucide-react';

export const coupons = [
    {
      code: 'FIRSTBIRYANI',
      description: 'On Your First Order',
      value: '15% OFF',
      icon: Tag,
    },
    {
      code: 'FREEDEL',
      description: 'On Orders Above ₹399',
      value: 'FREE DELIVERY',
      icon: Bike,
    },
    {
      code: 'COMBO250',
      description: 'Biryani + Kebab @ ₹250',
      value: 'COMBO DEAL',
      icon: Utensils,
    },
    {
      code: 'TREAT500',
      description: 'On Orders Above ₹500',
      value: '10% OFF',
      icon: Tag,
    },
    {
      code: 'MEAL100',
      description: 'On Orders Above ₹799',
      value: 'FLAT ₹100 OFF',
      icon: Tag,
    },
     {
      code: 'LUNCHLOVER',
      description: 'Between 12 PM – 3 PM',
      value: '20% OFF LUNCH',
      icon: Tag,
    },
    {
      code: 'WEEKENDWOW',
      description: 'On Weekend Orders Above ₹999',
      value: 'FLAT ₹200 OFF',
      icon: Tag,
    },
];
