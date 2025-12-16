
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChefHat, Leaf, Sprout, Heart, Flame, Users, Instagram, Facebook, Asterisk } from 'lucide-react';

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
                        "More than just coffee, it's a daily ritual of connection."
                    </p>
                </section>

                {/* Content Section */}
                <section ref={addToRefs} className="scroll-animate slide-up py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="prose lg:prose-lg text-senoa-green font-alegreya">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-belleza">From Beans to Cup</h2>
                                <p className="text-lg leading-relaxed opacity-80 mb-6">
                                    Beans Cafe was born from a simple yet powerful idea: to create a space that celebrates the quiet joy of a perfect cup of coffee. Our journey began with a passion for sourcing the finest beans and mastering the art of brewing.
                                </p>
                                <p className="text-lg leading-relaxed opacity-80">
                                    We believe that every sip should be an experience. Whether you're here for a quick morning pick-me-up or a leisurely afternoon with friends, our goal is to make you feel at home with flavors that warm the soul.
                                </p>
                            </div>
                            <div className="relative w-full h-[500px] rounded-sm overflow-hidden shadow-2xl bg-black/5 group">
                                <Image
                                    src="/images/About.jpg"
                                    alt="Cafe Interior"

                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section ref={addToRefs} className="scroll-animate slide-up py-24 md:py-32 bg-senoa-green text-senoa-cream">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold font-belleza mb-4">The Beans Philosophy</h2>
                            <p className="text-senoa-cream/70 font-alegreya text-lg max-w-2xl mx-auto">Guided by simplistic principles to deliver excellence in every cup.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Leaf className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Ethical Sourcing</h3>
                                <p className="text-senoa-cream/70 font-alegreya">We partner with sustainable farms to bring you the highest quality beans while respecting the earth.</p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Flame className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Masterful Roasting</h3>
                                <p className="text-senoa-cream/70 font-alegreya">Our beans are roasted in small batches to unlock their full potential and complex flavor profiles.</p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-senoa-cream/10 rounded-full mb-2">
                                    <Users className="h-8 w-8 text-senoa-cream" />
                                </div>
                                <h3 className="text-2xl font-bold font-belleza">Community First</h3>
                                <p className="text-senoa-cream/70 font-alegreya">We aren't just a cafe; we are a gathering place. A spot for conversations, ideas, and friendships.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section ref={addToRefs} className="scroll-animate slide-up py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="bg-senoa-cream border border-senoa-green/10 rounded-2xl p-8 md:p-16 text-center shadow-sm">
                            <h2 className="text-3xl md:text-5xl font-bold font-belleza mb-6">Join the Family</h2>
                            <p className="font-alegreya text-xl opacity-80 mb-8 max-w-2xl mx-auto">
                                Follow our journey on social media to see behind-the-scenes moments and be the first to know about our seasonal specials.
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
