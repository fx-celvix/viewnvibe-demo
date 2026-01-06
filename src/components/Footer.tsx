'use client';
import Link from 'next/link';
import { Instagram, Facebook, Phone, Mail, MapPin, ArrowUpRight, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Footer = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-[#1a1512] text-[#e8e0d5] relative overflow-hidden pt-24 pb-32 md:pb-12">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-senoa-accent/40 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">

                    {/* Brand Section - Large */}
                    <div className="md:col-span-5 space-y-8">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-belleza text-white mb-4 tracking-tight">View N Vibe</h2>
                            <p className="text-xl font-alegreya text-gray-400 italic">"Where the mountains meet the soul."</p>
                        </div>
                        <p className="text-gray-400 leading-relaxed font-alegreya max-w-sm text-lg">
                            Experience the finest rooftop dining in McLeod Ganj.
                            Pure vegetarian delicacies served with a side of breathtaking Himalayan sunsets.
                        </p>

                        <div className="flex gap-4">
                            <a href="https://instagram.com" target="_blank" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://facebook.com" target="_blank" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-senoa-accent mb-8">Explore</h4>
                        <ul className="space-y-4 font-belleza text-xl text-gray-300">
                            <li><Link href="/" className="hover:text-white hover:translate-x-2 transition-all inline-block">Home</Link></li>
                            <li><Link href="/delivery" className="hover:text-white hover:translate-x-2 transition-all inline-block">Order Online</Link></li>
                            <li><Link href="/table-booking" className="hover:text-white hover:translate-x-2 transition-all inline-block">Book Table</Link></li>
                            <li><Link href="/about" className="hover:text-white hover:translate-x-2 transition-all inline-block">Our Story</Link></li>
                            <li><Link href="/contact" className="hover:text-white hover:translate-x-2 transition-all inline-block">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Hours */}
                    <div className="md:col-span-4">
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-senoa-accent mb-8">Visit Us</h4>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="mt-1 p-2 rounded-full bg-white/5 group-hover:bg-senoa-accent transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-white font-belleza text-lg mb-1">McLeod Ganj, Dharamshala</p>
                                    <p className="text-gray-400 font-alegreya text-sm">Top Floor, Lord Krishna Boutique Stay,<br />Temple Road, HP 176219</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-full bg-white/5">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-white font-belleza text-lg mb-1">+91 75600 90700</p>
                                    <p className="text-gray-400 font-alegreya text-sm">Call for Reservations</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-full bg-white/5">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-white font-belleza text-lg mb-1">Open Daily</p>
                                    <p className="text-gray-400 font-alegreya text-sm">8:00 AM - 10:30 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <p>&copy; {year} View N Vibe Café.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <a href="https://celvix.in" target="_blank" className="text-senoa-accent hover:text-white transition-colors">Designed by Celvix</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
