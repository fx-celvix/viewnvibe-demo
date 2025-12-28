
'use client';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Linkedin, ArrowRight, Utensils, Mountain, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Footer = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="relative bg-senoa-green text-senoa-cream overflow-hidden">
            <div className="container mx-auto px-6 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold font-belleza tracking-wide">View N Vibe</h2>
                        <p className="text-senoa-cream/70 font-alegreya text-lg">
                            Top Floor, Lord Krishna Boutique Luxury Stay <br />
                            Temple Road, McLeod Ganj <br />
                            Dharamshala, HP – 176219
                        </p>
                        <div className="flex items-center gap-2 text-senoa-cream/80">
                            <Leaf className="h-4 w-4" />
                            <span className="text-sm font-semibold">100% Pure Vegetarian</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-6 tracking-widest uppercase opacity-60">Sitemap</h3>
                        <ul className="space-y-4 text-sm font-bold tracking-wide">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/delivery" className="hover:text-white transition-colors">Order</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-6 tracking-widest uppercase opacity-60">Connect</h3>
                        <ul className="space-y-4 text-sm font-bold tracking-wide">
                            <li><a href="tel:+917560090700" className="hover:text-white transition-colors">+91 75600 90700</a></li>
                            <li><a href="mailto:hello@viewnvibecafe.com" className="hover:text-white transition-colors">hello@viewnvibecafe.com</a></li>
                            <li className="flex space-x-4 pt-2">
                                <Link href="#" className="hover:text-white transition-transform hover:scale-110"><Instagram className="h-5 w-5" /></Link>
                                <Link href="#" className="hover:text-white transition-transform hover:scale-110"><Facebook className="h-5 w-5" /></Link>
                                <Link href="#" className="hover:text-white transition-transform hover:scale-110"><Twitter className="h-5 w-5" /></Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-6 tracking-widest uppercase opacity-60">Hours</h3>
                        <ul className="space-y-2 text-sm text-senoa-cream/70 font-alegreya text-lg">
                            <li>Mon – Sun</li>
                            <li>8:00 AM – 10:00 PM</li>
                        </ul>
                        <div className="mt-6 flex items-center gap-2 text-senoa-cream/80">
                            <Mountain className="h-4 w-4" />
                            <span className="text-sm">Rooftop with Mountain Views</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-senoa-cream/10 flex flex-col md:flex-row justify-between items-center text-xs opacity-40 font-mono uppercase tracking-widest">
                    <p>&copy; {year} View N Vibe Café. All Rights Reserved.</p>
                    <p className="mt-2 md:mt-0">Design by Celvix</p>
                </div>
            </div>
        </footer>
    );
};
