
'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Loader2, Mountain, Leaf } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import dynamic from 'next/dynamic';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ContactMap = dynamic(() => import('@/components/ContactMap').then(mod => mod.ContactMap), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full bg-gray-100"><Loader2 className="h-8 w-8 animate-spin" /></div>
});


const ContactPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
    const addToRefs = useScrollAnimation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        // Simulate a form submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="flex flex-col min-h-screen bg-senoa-cream text-senoa-green font-sans selection:bg-senoa-green selection:text-senoa-cream">
            <Header />
            <main className="flex-grow pt-32 pb-20">
                {/* Hero Section */}
                <section className="relative px-4 md:px-8 max-w-[1400px] mx-auto text-center mb-16">
                    <h1 className="text-[15vw] md:text-[12vw] leading-[0.8] font-black tracking-tighter uppercase text-senoa-green opacity-90">
                        CONTACT
                    </h1>
                    <p className="mt-8 text-xl md:text-2xl font-alegreya italic max-w-2xl mx-auto text-senoa-green/80">
                        "We'd love to hear from you. Come visit us for good vibes and great views."
                    </p>
                </section>

                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Info Section */}
                        <div ref={addToRefs} className="scroll-animate slide-up space-y-12">
                            <div>
                                <h2 className="text-4xl font-bold font-belleza mb-8">Get in Touch</h2>
                                <p className="font-alegreya text-lg opacity-80 mb-8">
                                    Whether you have a question about our menu, need to book a table for a large group, or just want to say hello, we're here to help.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start group">
                                    <div className="p-4 bg-senoa-green/5 rounded-full mr-6 group-hover:bg-senoa-green group-hover:text-senoa-cream transition-colors duration-300">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-belleza mb-1">Visit Us</h3>
                                        <p className="font-alegreya opacity-80 text-lg">
                                            Top Floor, Lord Krishna Boutique Luxury Stay<br />
                                            Temple Road, McLeod Ganj<br />
                                            Dharamshala, HP – 176219
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start group">
                                    <div className="p-4 bg-senoa-green/5 rounded-full mr-6 group-hover:bg-senoa-green group-hover:text-senoa-cream transition-colors duration-300">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-belleza mb-1">Call Us</h3>
                                        <a href="tel:+917560090700" className="font-alegreya opacity-80 text-lg hover:underline decoration-senoa-green underline-offset-4 pointer-events-auto block transition-all">+91 75600 90700</a>
                                    </div>
                                </div>
                                <div className="flex items-start group">
                                    <div className="p-4 bg-senoa-green/5 rounded-full mr-6 group-hover:bg-senoa-green group-hover:text-senoa-cream transition-colors duration-300">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-belleza mb-1">Email Us</h3>
                                        <a href="mailto:hello@viewnvibecafe.com" className="font-alegreya opacity-80 text-lg hover:underline decoration-senoa-green underline-offset-4 pointer-events-auto block transition-all">hello@viewnvibecafe.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start group">
                                    <div className="p-4 bg-senoa-green/5 rounded-full mr-6 group-hover:bg-senoa-green group-hover:text-senoa-cream transition-colors duration-300">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-belleza mb-1">Opening Hours</h3>
                                        <p className="font-alegreya opacity-80 text-lg">Mon – Sun: 8:00 AM – 10:00 PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start group">
                                    <div className="p-4 bg-senoa-green/5 rounded-full mr-6 group-hover:bg-senoa-green group-hover:text-senoa-cream transition-colors duration-300">
                                        <Leaf className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-belleza mb-1">Pure Vegetarian</h3>
                                        <p className="font-alegreya opacity-80 text-lg">100% Vegetarian Kitchen</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Section */}
                        <div ref={addToRefs} className="scroll-animate slide-up bg-white p-8 md:p-12 rounded-sm shadow-xl border border-senoa-green/10" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-2xl font-bold font-belleza mb-8">Send us a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="sr-only">Name</label>
                                    <input type="text" id="name" placeholder="Your Name" required className="w-full bg-senoa-cream/30 border border-senoa-green/20 rounded-sm px-6 py-4 text-senoa-green placeholder:text-senoa-green/40 focus:outline-none focus:border-senoa-green transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <input type="email" id="email" placeholder="Your Email" required className="w-full bg-senoa-cream/30 border border-senoa-green/20 rounded-sm px-6 py-4 text-senoa-green placeholder:text-senoa-green/40 focus:outline-none focus:border-senoa-green transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="sr-only">Message</label>
                                    <textarea id="message" placeholder="Your Message..." required rows={5} className="w-full bg-senoa-cream/30 border border-senoa-green/20 rounded-sm px-6 py-4 text-senoa-green placeholder:text-senoa-green/40 focus:outline-none focus:border-senoa-green transition-colors resize-none"></textarea>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-senoa-green text-senoa-cream font-bold py-4 px-6 rounded-sm hover:bg-senoa-green/90 transition-transform transform active:scale-95 duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <> <Send className="h-5 w-5 mr-2" /> Send Message </>}
                                </button>
                                {submitStatus === 'success' && <p className="text-sm text-center font-bold text-senoa-green bg-green-100 p-3 rounded-sm">Thank you! Your message has been sent.</p>}
                                {submitStatus === 'error' && <p className="text-sm text-center font-bold text-red-600 bg-red-100 p-3 rounded-sm">Something went wrong. Please try again.</p>}
                            </form>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div ref={addToRefs} className="scroll-animate fade-in mt-20 h-96 w-full rounded-sm overflow-hidden shadow-2xl border border-senoa-green/10" style={{ animationDelay: '0.4s' }}>
                        <ContactMap />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
