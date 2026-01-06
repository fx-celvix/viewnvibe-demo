'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Utensils, Calendar, Phone, Mountain, MapPin, Instagram, Camera } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/delivery', label: 'Order Online' },
        { href: '/vibe', label: 'The Vibe' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    // Desktop Header Classes
    // Standard Sticky: Full width, no rounded corners, no floating margins.
    const headerClasses = isHome && !scrolled
        ? 'bg-transparent border-transparent text-white'
        : 'bg-[#F9F2E9]/90 backdrop-blur-md border-b border-[#3A2E2A]/5 text-[#3A2E2A] shadow-sm';
    // using hex codes directly or tailwind config names: senoa-cream (#F9F2E9), senoa-green (#3A2E2A)

    const logoBg = isHome && !scrolled
        ? 'bg-white/10 text-white'
        : 'bg-gradient-to-br from-[#F9F2E9] to-[#D6B399]/30 text-[#C17E5C]';

    const mobileTextClass = isHome && !scrolled
        ? 'text-white drop-shadow-md'
        : 'text-[#3A2E2A]';

    return (
        <>
            {/* Desktop Sticky Header - refined to be standard sticky */}
            <header className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerClasses}`}>
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${logoBg}`}>
                                <Mountain className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold font-belleza tracking-wide group-hover:opacity-80 transition-opacity">View N Vibe</span>
                        </Link>

                        <nav className="flex items-center space-x-10">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-xs font-bold uppercase tracking-[0.15em] transition-all hover:scale-105 transform ${pathname === link.href ? 'opacity-100 font-extrabold' : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4">
                            <a
                                href="tel:+917560090700"
                                className={`hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isHome && !scrolled ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#3A2E2A] hover:bg-[#2A1F1A] text-white'} px-6 py-3 rounded-full transition-all`}
                            >
                                <Phone className="h-3 w-3" />
                                <span>Call Us</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile View Elements - Top Bar (Absolute positioning as requested) */}
            <div className="md:hidden">
                <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                    <Link href="/" className="pointer-events-auto flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors ${isHome && !scrolled ? 'bg-white/20 text-white' : 'bg-[#F9F2E9] text-[#3A2E2A]'}`}>
                            <Mountain className="h-5 w-5" />
                        </div>
                        <span className={`text-xl font-bold font-belleza tracking-wide drop-shadow-md ${mobileTextClass}`}>View N Vibe</span>
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md shadow-lg transition-colors ${isHome && !scrolled ? 'bg-white/20 text-white' : 'bg-[#F9F2E9] text-[#3A2E2A]'}`}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[60] bg-[#F9F2E9] backdrop-blur-xl flex flex-col items-center justify-center animate-in slide-in-from-right duration-300">
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-6 right-6 p-2 text-[#3A2E2A] hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <div className="flex flex-col items-center gap-8 w-full px-6">

                            {/* Brand Header (Mobile) */}
                            <div className="text-center mb-4">
                                <h2 className="text-3xl font-belleza text-[#3A2E2A] tracking-tighter">VIEW N VIBE</h2>
                                <p className="text-xs font-alegreya text-[#3A2E2A]/60 italic">McLeod Ganj</p>
                            </div>

                            {/* Navigation */}
                            <div className="flex flex-col items-center gap-5">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-3xl font-belleza ${pathname === link.href ? 'text-[#3A2E2A]' : 'text-[#3A2E2A]/50 hover:text-[#3A2E2A]'} transition-colors`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="w-12 h-[1px] bg-[#3A2E2A]/10 my-1" />

                            {/* Veg Badge */}
                            <div className="inline-flex items-center gap-2 bg-[#3A2E2A]/5 px-4 py-1.5 rounded-full border border-[#3A2E2A]/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#3A2E2A]">100% Pure Vegetarian</span>
                            </div>

                            {/* Action Buttons Grid */}
                            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 bg-white border border-[#3A2E2A]/20 text-[#3A2E2A] py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#3A2E2A] hover:text-white transition-colors shadow-sm"
                                >
                                    <MapPin className="h-3 w-3" />
                                    <span>Directions</span>
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 bg-white border border-[#3A2E2A]/20 text-[#3A2E2A] py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#C17E5C] hover:text-white hover:border-[#C17E5C] transition-colors shadow-sm"
                                >
                                    <Instagram className="h-3 w-3" />
                                    <span>Instagram</span>
                                </a>
                            </div>

                            {/* Room Booking Promo */}
                            <div className="w-full max-w-xs bg-white/50 border border-[#3A2E2A]/10 rounded-xl p-4 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C17E5C] mb-1">Stay With Us</p>
                                <h4 className="font-belleza text-lg text-[#3A2E2A] mb-3">Lord Krishna Boutique Stay</h4>
                                <a
                                    href="#"
                                    className="block w-full bg-[#3A2E2A] text-[#F9F2E9] py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#C17E5C] transition-colors"
                                >
                                    Book a Room
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Sticky Dock */}
                <nav className="fixed bottom-6 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full shadow-2xl p-4 flex justify-between items-center px-6">
                    <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-[#3A2E2A]' : 'text-gray-400'}`}>
                        <Home className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                    </Link>
                    <Link href="/delivery" className={`flex flex-col items-center gap-1 ${pathname === '/delivery' ? 'text-[#3A2E2A]' : 'text-gray-400'}`}>
                        <Utensils className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Order</span>
                    </Link>
                    <Link href="/vibe" className={`flex flex-col items-center gap-1 ${pathname === '/vibe' ? 'text-[#3A2E2A]' : 'text-gray-400'}`}>
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Vibe</span>
                    </Link>
                    <Link href="/table-booking" className={`flex flex-col items-center gap-1 ${pathname === '/table-booking' ? 'text-[#3A2E2A]' : 'text-gray-400'}`}>
                        <Calendar className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Book</span>
                    </Link>
                    <Link href="/contact" className={`flex flex-col items-center gap-1 ${pathname === '/contact' ? 'text-[#3A2E2A]' : 'text-gray-400'}`}>
                        <Phone className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Contact</span>
                    </Link>
                </nav>
            </div>
        </>
    );
};
