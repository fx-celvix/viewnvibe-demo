

'use client';

import { X } from 'lucide-react';

interface MenuItem {
  name: string;
}
interface Category {
  id: string;
  title: string;
  items: MenuItem[];
}

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export function CategoryMenu({ isOpen, onClose, menuData, activeCategory, setActiveCategory }: CategoryMenuProps) {
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const header = document.querySelector('header');
      const headerOffset = header ? header.offsetHeight : 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
         top: offsetPosition,
         behavior: 'smooth'
      });
    }
  };
  
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    onClose();
    scrollToId(id);
  };
  
  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string, itemName: string) => {
    e.preventDefault();
    setActiveCategory(categoryId);
    onClose();
    const itemId = `item-${itemName.replace(/\s+/g, '-').toLowerCase()}`;
    scrollToId(itemId);
  };


  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-background shadow-lg z-30 transform transition-transform ease-in-out duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Food, Beverages & Desserts</h2>
            <button onClick={onClose}>
                <X className="h-6 w-6" />
            </button>
        </div>
        <div className="flex-grow overflow-y-auto no-scrollbar">
            <div className="py-2">
                <ul className="space-y-0">
                    {menuData.map((category) => (
                    <li key={category.id} className="mb-2">
                        <a
                        href={`#${category.id}`}
                        onClick={(e) => handleCategoryClick(e, category.id)}
                        className={`block px-4 py-2 text-base font-bold transition-colors ${
                            activeCategory === category.id 
                            ? 'bg-muted text-foreground' 
                            : 'text-foreground'
                        }`}
                        >
                        {category.title}
                        </a>
                         {category.items.length > 0 && (
                          <ul className="pl-4">
                            {category.items.map((item, index) => (
                              <li key={item.name}>
                                <a
                                  href={`#item-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                                  onClick={(e) => handleItemClick(e, category.id, item.name)}
                                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b last:border-b-0"
                                >
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                    </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </>
  );
}
