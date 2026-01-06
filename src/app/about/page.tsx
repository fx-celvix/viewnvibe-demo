
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChefHat, Leaf, Sprout, Heart, Mountain, Users, Instagram, Facebook, Asterisk, Sun, Eye, Utensils } from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AboutPage = () => {
    const addToRefs = useScrollAnimation();
    return (
        <div className="flex flex-col min-h-screen bg-senoa-cream text-senoa-green font-sans selection:bg-senoa-green selection:text-senoa-cream">
            <Header />
            <main className="flex-grow pt-32">
                {/* Hero Section */}
                <section className="relative py-20 px-4 md:px-8 max-w-[1400px] mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <Asterisk className="h-16 w-16 text-senoa-green animate-spin-slow" />
                    </div>
                    <h1 className="text-[15vw] md:text-[12vw] leading-[0.8] font-black tracking-tighter uppercase text-senoa-green opacity-90">
                        OUR STORY
                    </h1>
                    <p className="mt-8 text-xl md:text-2xl font-alegreya italic max-w-2xl mx-auto text-senoa-green/80">
                        "More than just food — it's an experience with a view."
                    </p>
                </section>

                {/* Content Section */}
                <section ref={addToRefs} className="scroll-animate slide-up py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="prose lg:prose-lg text-senoa-green font-alegreya">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-belleza">A Rooftop Retreat</h2>
                                <p className="text-lg leading-relaxed opacity-80 mb-6">
                                    View N Vibe Café is a pure vegetarian rooftop restaurant located in the heart of McLeod Ganj, Dharamshala. Set atop Lord Krishna Boutique Luxury Stay, our café offers a perfect blend of great food, calm ambiance, and stunning mountain views.
                                </p>
                                <p className="text-lg leading-relaxed opacity-80">
                                    Whether you're here to watch the sunset, relax after a long walk exploring the streets of McLeod Ganj, or enjoy a peaceful meal with friends, View N Vibe Café is designed to give you a memorable dining experience you'll cherish forever.
                                </p>
                            </div>
                            <div className="relative w-full h-[500px] rounded-sm overflow-hidden shadow-2xl bg-black/5 group">
                                <Image
                                    src="/images/About.webp"
                                    alt="View N Vibe Café Interior"

                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section ref={addToRefs} className="scroll-animate slide-up py-24 md:py-32 bg-senoa-green text-senoa-cream">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold font-belleza mb-4">Why Choose View N Vibe?</h2>
                            <p className="text-senoa-cream/70 font-alegreya text-lg max-w-2xl mx-auto">Experience the perfect blend of great food, peaceful vibes, and breathtaking views.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Mountain className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Panoramic Views</h3>
                                <p className="text-senoa-cream/70 font-alegreya">Rooftop seating with breathtaking mountain views of Dharamshala and the Kangra Valley.</p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Leaf className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">100% Pure Vegetarian</h3>
                                <p className="text-senoa-cream/70 font-alegreya">Our kitchen is dedicated to pure vegetarian cuisine — fresh, flavorful, and made with love.</p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Sun className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Popular Sunset Spot</h3>
                                <p className="text-senoa-cream/70 font-alegreya">One of the most popular places in McLeod Ganj to watch the sunset over the mountains.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 mt-12">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Heart className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Calm & Cozy Atmosphere</h3>
                                <p className="text-senoa-cream/70 font-alegreya">A relaxed environment perfect for solo travelers, couples, families, and groups.</p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Utensils className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Multi-Cuisine Menu</h3>
                                <p className="text-senoa-cream/70 font-alegreya">Indian, Chinese, Italian, Tibetan & Continental — something for everyone.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location Info */}
                <section ref={addToRefs} className="scroll-animate slide-up py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="bg-senoa-cream border border-senoa-green/10 rounded-2xl p-8 md:p-16 text-center shadow-sm">
                            <h2 className="text-3xl md:text-5xl font-bold font-belleza mb-6">Visit Us</h2>
                            <p className="font-alegreya text-xl opacity-80 mb-4 max-w-2xl mx-auto">
                                Located on Temple Road in McLeod Ganj, we're an easy stop while exploring the town.
                            </p>
                            <p className="font-alegreya text-lg opacity-70 mb-8">
                                <strong>Address:</strong> Top Floor, Lord Krishna Boutique Luxury Stay<br />
                                Temple Road, McLeod Ganj, Dharamshala<br />
                                Himachal Pradesh – 176219
                            </p>
                            <p className="font-bold text-xl mb-8">
                                <a href="tel:+917560090700" className="text-senoa-green hover:underline">+91 75600 90700</a>
                            </p>
                            <div className="flex justify-center space-x-8">
                                <a href="#" className="p-4 bg-senoa-green text-senoa-cream rounded-full hover:bg-senoa-green/90 transition transform hover:-translate-y-1">
                                    <Instagram className="h-6 w-6" />
                                </a>
                                <a href="#" className="p-4 bg-senoa-green text-senoa-cream rounded-full hover:bg-senoa-green/90 transition transform hover:-translate-y-1">
                                    <Facebook className="h-6 w-6" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
