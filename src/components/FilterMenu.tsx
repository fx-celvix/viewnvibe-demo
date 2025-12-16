
'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterState {
  popular: boolean;
  mustTry: boolean;
  veg: boolean;
  nonVeg: boolean;
}

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  applyFilters: (filters: FilterState) => void;
  initialFilters: FilterState;
}

const FilterOption = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="flex items-center space-x-3 p-3 border-b">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
    />
    <span className="text-base">{label}</span>
  </label>
);


export function FilterMenu({ isOpen, onClose, applyFilters, initialFilters }: FilterMenuProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    // When the filter menu is opened, sync its local state with the initialFilters from the parent page
    if (isOpen) {
      setLocalFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleFilterChange = (filterName: keyof FilterState, value: boolean) => {
    setLocalFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const handleApply = () => {
    localStorage.setItem('menuFilters', JSON.stringify(localFilters));
    applyFilters(localFilters);
    onClose();
  };
  
  const handleClearAll = () => {
    const clearedFilters = {
        popular: false,
        mustTry: false,
        veg: false,
        nonVeg: false,
    };
    localStorage.removeItem('menuFilters');
    setLocalFilters(clearedFilters);
    applyFilters(clearedFilters);
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed inset-x-4 top-24 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-background shadow-lg z-30 transform transition-all ease-in-out duration-300 flex flex-col w-auto sm:w-full sm:max-w-md rounded-xl ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Filter</h2>
            <button onClick={onClose}>
                <X className="h-6 w-6" />
            </button>
        </div>
        <div className="flex-grow">
            <FilterOption 
                label="Popular" 
                checked={localFilters.popular} 
                onChange={(value) => handleFilterChange('popular', value)}
            />
            <FilterOption 
                label="Must Try" 
                checked={localFilters.mustTry} 
                onChange={(value) => handleFilterChange('mustTry', value)}
            />
            <FilterOption 
                label="Veg" 
                checked={localFilters.veg} 
                onChange={(value) => handleFilterChange('veg', value)}
            />
            <FilterOption 
                label="Non-Veg" 
                checked={localFilters.nonVeg}
                onChange={(value) => handleFilterChange('nonVeg', value)}
            />
        </div>
        <div className="p-4 border-t flex items-center justify-between space-x-2">
            <button 
                onClick={handleClearAll}
                className="w-1/2 px-4 py-3 border border-foreground rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition"
            >
                Clear All
            </button>
            <button
                onClick={handleApply}
                className="w-1/2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
            >
                Apply
            </button>
        </div>
      </div>
    </>
  );
}
