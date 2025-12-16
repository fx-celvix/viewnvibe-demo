
'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface MenuCategoryProps {
  title: string;
  id: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function MenuCategory({ title, id, children, defaultOpen = false }: MenuCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border-b pb-4 mb-4 scroll-mt-24">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold">{title}</h2>
        {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </button>
      {isOpen && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
          </div>
      )}
    </div>
  );
}
