
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Home, Utensils, Calendar, Phone } from 'lucide-react';

import { usePathname } from 'next/navigation';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/delivery', label: 'Order Online' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <>
            {/* Desktop Sticky Header */}
            <header className="hidden md:block fixed top-0 left-0 right-0 z-30 px-4 pt-6">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between h-16 px-6 md:px-8 bg-senoa-cream/80 backdrop-blur-md rounded-sm shadow-sm border border-senoa-green/10">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold font-belleza text-senoa-green tracking-wide">Beans Cafe</span>
                        </Link>
                        <nav className="flex items-center space-x-8">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className={`text-sm font-bold uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-senoa-green' : 'text-senoa-green/60 hover:text-senoa-green'}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile View Elements */}
            <div className="md:hidden">
                {/* Mobile Top Header */}
                <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center pointer-events-none">
                    <Link href="/" className="pointer-events-auto">
                        <span className="text-xl font-bold font-belleza text-senoa-green tracking-wide drop-shadow-sm">Beans Cafe</span>
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="pointer-events-auto p-2 bg-senoa-cream/80 backdrop-blur-md rounded-full shadow-sm text-senoa-green"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-senoa-cream flex flex-col items-center justify-center animate-in slide-in-from-right duration-300">
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-6 right-6 p-2 text-senoa-green hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <div className="flex flex-col items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-3xl font-bold font-belleza ${pathname === link.href ? 'text-senoa-green' : 'text-senoa-green/60'}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Sticky Dock */}
                <nav className="fixed bottom-6 left-4 right-4 z-50 bg-senoa-cream/95 backdrop-blur-xl border border-senoa-green/10 rounded-2xl shadow-2xl p-4 flex justify-between items-center px-8">
                    <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-senoa-green' : 'text-senoa-green/50'}`}>
                        <Home className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                    </Link>
                    <Link href="/delivery" className={`flex flex-col items-center gap-1 ${pathname === '/delivery' ? 'text-senoa-green' : 'text-senoa-green/50'}`}>
                        <Utensils className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Order</span>
                    </Link>
                    <Link href="/table-booking" className={`flex flex-col items-center gap-1 ${pathname === '/table-booking' ? 'text-senoa-green' : 'text-senoa-green/50'}`}>
                        <Calendar className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Book</span>
                    </Link>
                    <Link href="/contact" className={`flex flex-col items-center gap-1 ${pathname === '/contact' ? 'text-senoa-green' : 'text-senoa-green/50'}`}>
                        <Phone className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
                    </Link>
                </nav>
            </div>
        </>
    );
};
