
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  ClipboardEdit,
  Megaphone,
  BarChart3,
  Calendar,
  Database,
  LifeBuoy,
  LogOut,
  PlusCircle,
  X,
  MessageSquare,
  Phone
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardSidebarProps {
  onCreateOrder: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  const supportNumber = '7560090700';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Contact Support</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            For any questions or issues with your order, please reach out to us.
          </p>
          <div className="flex space-x-3">
            <a
              href={`https://wa.me/${supportNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 text-sm font-semibold p-2.5 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${supportNumber}`}
              className="w-full flex items-center justify-center space-x-2 text-sm font-semibold p-2.5 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSidebar = ({ onCreateOrder, isOpen, onClose }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    router.push('/dashboard/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Edit Menu', path: '/dashboard/edit-menu', icon: ClipboardEdit },
    { name: 'Marketing', path: '/dashboard/marketing', icon: Megaphone },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Reservations', path: '/dashboard/reservations', icon: Calendar },
    { name: 'Database', path: '/dashboard/database', icon: Database },
  ];

  return (
    <>
      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`w-56 h-screen fixed left-0 top-0 bg-white border-r z-50 flex flex-col justify-between font-sans transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute right-2 top-3 p-2 md:hidden text-gray-500 hover:text-gray-700 z-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center justify-center py-4 border-b space-y-2">
            <div className="relative w-12 h-12">
              <Image
                src="/images/hero.webp"
                alt="View N Vibe Café"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-senoa-green to-senoa-accent">
              View N Vibe
            </h1>
          </div>

          <div className="p-3">
            <button
              onClick={onCreateOrder}
              className="w-full flex items-center justify-center space-x-2 bg-senoa-green text-white px-3 py-2 rounded-lg hover:bg-senoa-green-dark transition-colors shadow-sm mb-4 text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Order</span>
            </button>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${isActive
                      ? 'bg-senoa-cream text-senoa-green font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-senoa-green' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 border-t space-y-1">
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
          >
            <LifeBuoy className="h-4 w-4 text-gray-400" />
            <span>Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
