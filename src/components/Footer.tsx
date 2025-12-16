
'use client';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Linkedin, ArrowRight, Utensils } from 'lucide-react';
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
                        <h2 className="text-3xl font-bold font-belleza tracking-wide">BEANS.</h2>
                        <p className="text-senoa-cream/70 font-alegreya text-lg">
                            Ground Floor, Urban Hub <br />
                            Near City Walk Mall, Indiranagar <br />
                            Bengaluru – 560038
                        </p>
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
                            <li><a href="tel:+917979057085" className="hover:text-white transition-colors">+91 79790 57085</a></li>
                            <li><a href="mailto:hello@beanscafe.com" className="hover:text-white transition-colors">hello@beanscafe.com</a></li>
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
                            <li>9:00 AM – 11:00 PM</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-senoa-cream/10 flex flex-col md:flex-row justify-between items-center text-xs opacity-40 font-mono uppercase tracking-widest">
                    <p>&copy; {year} BEANS Cafe. All Rights Reserved.</p>
                    <p className="mt-2 md:mt-0">Design by Antigravity</p>
                </div>
            </div>
        </footer>
    );
};
