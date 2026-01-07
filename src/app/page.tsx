'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  X,
  ArrowUpRight,
  Check,
  Copy,
  Star,
  MapPin,
  Phone,
  Instagram,
  ChevronDown,
  Coffee,
  Utensils,
  Mountain,
  Wind,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { TableBookingModal } from '@/components/TableBookingModal';
import { Footer } from '@/components/Footer';

// Using string path instead of static import for custom loader compatibility

// --- Components ---

const DeliveryPopup = ({ isOpen, onClose, onOrder }: { isOpen: boolean; onClose: () => void; onOrder: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}>
      <div className="relative bg-[#F9F2E9] w-full max-w-sm rounded-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm">
          <X className="h-5 w-5" />
        </button>

        {/* Image Section */}
        <div className="relative w-full h-56">
          <Image
            src="/images/food-delivery.webp"
            alt="Food Delivery"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F2E9] via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-6 text-center -mt-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-800">100% Pure Veg</span>
          </div>

          <h3 className="text-3xl font-belleza text-[#3A2E2A] mb-2">Cravings?</h3>
          <p className="text-sm font-alegreya text-[#3A2E2A]/70 mb-6 leading-relaxed">
            Enjoy the Vibe at home. We deliver hot & fresh across McLeod Ganj.
          </p>

          <button
            onClick={onOrder}
            className="w-full bg-[#3A2E2A] hover:bg-[#C17E5C] text-white py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const router = useRouter();

  const heroImages = [
    '/images/hero/hero1.webp',
    '/images/hero/hero2.webp',
    '/images/hero/hero3.webp',
    '/images/hero/hero4.webp',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if popup has already been shown in this session
    const hasSeenPopup = sessionStorage.getItem('deliveryPopupShown');

    let timer: NodeJS.Timeout | undefined;
    if (!hasSeenPopup) {
      timer = setTimeout(() => {
        setShowDeliveryPopup(true);
        sessionStorage.setItem('deliveryPopupShown', 'true');
      }, 5000); // 5s delay
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavigate = (path: string) => {
    if (path === '/table-booking') {
      setIsBookingModalOpen(true);
      return;
    }
    router.push(path);
  };

  const cuisines = [
    { name: 'North Indian', image: '/images/Food 1.webp', desc: 'Rich & Creamy Curries' },
    { name: 'Italian', image: '/images/Food 2.webp', desc: 'Wood-fired Pizzas' },
    { name: 'Tibetan', image: '/images/Food 3.webp', desc: 'Authentic Himalayan Taste' },
    { name: 'Chinese', image: '/images/Food 4.webp', desc: 'Spicy Stir-fries' },
  ];

  return (
    <div className="min-h-screen bg-white text-senoa-green font-sans selection:bg-senoa-green selection:text-white">
      <DeliveryPopup
        isOpen={showDeliveryPopup}
        onClose={() => setShowDeliveryPopup(false)}
        onOrder={() => handleNavigate('/delivery')}
      />

      <TableBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <Header />

      <main>
        {/* SECTION 1: HERO WITH ANIMATED BACKGROUND */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Animated Background Image with Ken Burns Effect */}
          {/* Animated Background Slideshow */}
          <div className="absolute inset-0">
            {heroImages.map((src, index) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="relative w-full h-full animate-slow-zoom">
                  <Image
                    src={src}
                    alt={`View N Vibe Rooftop ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    unoptimized={true}
                  />
                </div>
              </div>
            ))}
          </div>


          {/* Gradient Overlay - Darker for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

          {/* Main Content - Centered */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-8">

            {/* Pure Veg Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white text-xs font-medium uppercase tracking-widest">Pure Vegetarian</span>
            </div>

            {/* Location */}
            <p className="text-white/60 text-xs md:text-sm tracking-[0.4em] uppercase mb-6">
              McLeod Ganj • Dharamshala
            </p>

            {/* Main Title */}
            <h1 className="font-belleza text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight mb-8 drop-shadow-lg">
              View N Vibe
            </h1>

            {/* Divider Line */}
            <div className="w-16 h-px bg-[#C17E5C] mb-8" />

            {/* Tagline */}
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-alegreya max-w-2xl mb-12 leading-relaxed">
              A rooftop café where Himalayan sunsets meet artisanal cuisine
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-[#C17E5C] text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#a86a4a] transition-colors duration-300 shadow-lg"
              >
                Book a Table
              </button>
              <button
                onClick={() => handleNavigate('/delivery')}
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[#3A2E2A] transition-all duration-300"
              >
                View Menu
              </button>
            </div>
          </div>

          {/* Bottom Stats Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="bg-black/40 backdrop-blur-md border-t border-white/10">
              <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-center gap-10 md:gap-16">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg">4.8</span>
                  <span className="text-white/50 text-xs uppercase tracking-wider hidden sm:inline">Google</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">160+</span>
                  <span className="text-white/50 text-xs uppercase tracking-wider hidden sm:inline">Dishes</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-[#C17E5C]" />
                  <span className="text-white/50 text-xs uppercase tracking-wider hidden sm:inline">Rooftop</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 2: THE EXPERIENCE (Editorial Layout) */}
        <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left: Text */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="w-16 h-[1px] bg-senoa-green/30" />
              <h2 className="text-4xl md:text-6xl font-belleza leading-tight">
                Dining Elevated. <br />
                <span className="text-senoa-accent italic">Literally.</span>
              </h2>
              <p className="text-lg font-alegreya text-gray-600 leading-relaxed max-w-md">
                Perched on the rooftop of Lord Krishna Boutique Stay, we offer more than just food. We offer a pause button. A place to breathe in the fresh mountain air, watch the sun paint the Kangra Valley gold, and savor dishes prepared with passion.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <Mountain className="h-8 w-8 text-senoa-green" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Panoramic Views</h4>
                  <p className="text-sm text-gray-500">Uninterrupted sights of the Dhauladhar range.</p>
                </div>
                <div className="space-y-2">
                  <Coffee className="h-8 w-8 text-senoa-green" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Artisan Coffee</h4>
                  <p className="text-sm text-gray-500">Brewed fresh for the perfect mountain morning.</p>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <Wind className="h-4 w-4" />
                      {/* Using Wind as a placeholder for a Leaf if Leaf isn't imported, but Leaf is better. Let's check imports. Leaf is not imported in the top list but 'Wind' is. I will use 'Leaf' if possible, but safely I will use 'Utensils' or just text if I can't import. Actually I see 'Leaf' is NOT in the import list of line 5-20. I'll use Utensils with green color or just the text '100% Pure Veg' with a custom icon/color. */}
                      {/* Wait, I can just add a simple text block. */}
                    </span>
                  </div>
                  <h4 className="font-bold uppercase text-xs tracking-widest text-green-700">100% Pure Vegetarian</h4>
                  <p className="text-sm text-gray-500">Wholesome, meat-free delicacies for everyone.</p>
                </div>
              </div>
            </div>

            {/* Right: Modern Image Composition */}
            <div className="w-full lg:w-1/2 relative h-[500px] md:h-[600px] group perspective-1000">
              {/* Abstract decorative shape */}
              <div className="absolute top-1/4 right-0 w-3/4 h-3/4 bg-[#C17E5C]/5 rounded-full blur-[100px] -z-10" />

              {/* Main Background Image - Organic Shape */}
              <div className="absolute top-0 right-0 w-[90%] h-[85%] z-10 rounded-tr-[5rem] rounded-bl-[5rem] rounded-tl-3xl rounded-br-3xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:rotate-1">
                <Image
                  src="/images/2nd_image.webp"
                  alt="Rooftop dining ambiance"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Foreground Card */}
              <div className="absolute bottom-12 left-0 w-[45%] aspect-[3/4] z-20 transition-transform duration-500 group-hover:-translate-y-6 group-hover:rotate-[-2deg]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-[6px] border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
                  <Image
                    src="/images/Food 1.webp"
                    alt="Signature Dish"
                    fill
                    className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Decorative Badge */}
                <div className="absolute -right-5 -bottom-5 bg-white p-3.5 rounded-full shadow-lg border border-gray-100 animate-pulse">
                  <Sparkles className="h-5 w-5 text-[#C17E5C] text-senoa-accent" />
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* SECTION 3: CUISINE SHOWCASE (Cinematic Grid) */}
        <section className="py-32 bg-[#3A2E2A] text-[#F9F2E9] relative">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="text-[#C17E5C] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Culinary Art</span>
              <h2 className="text-5xl md:text-7xl font-belleza leading-none">Global Flavors, <br /> Local Soul.</h2>
            </div>
            <p className="max-w-md text-right text-[#F9F2E9]/60 font-alegreya text-lg hidden md:block">
              From the spicy streets of Sichuan to the comforting warmth of Tibet. Every dish tells a story.
            </p>
          </div>

          {/* Cuisine Grid */}
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">

            {/* Item 1 - Indian */}
            <div
              onClick={() => handleNavigate('/delivery')}
              className="md:col-span-1 relative h-[300px] md:h-full group cursor-pointer overflow-hidden rounded-2xl"
            >
              <Image src="/images/cuisine-indian.webp" alt="Indian Cuisine" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-3xl font-belleza text-white mb-2 group-hover:text-[#C17E5C] transition-colors">Indian</h3>
                <p className="text-white/70 font-alegreya text-sm leading-relaxed max-w-[200px]">Rich curries, aromatic biryanis, and authentic spices.</p>
              </div>
            </div>

            {/* Item 2 - Italian */}
            <div
              onClick={() => handleNavigate('/delivery')}
              className="md:col-span-1 relative h-[300px] md:h-full group cursor-pointer overflow-hidden rounded-2xl"
            >
              <Image src="/images/cuisine-italian.webp" alt="Italian Cuisine" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-3xl font-belleza text-white mb-2 group-hover:text-[#C17E5C] transition-colors">Italian</h3>
                <p className="text-white/70 font-alegreya text-sm leading-relaxed max-w-[200px]">Wood-fired pizzas and handmade pastas.</p>
              </div>
            </div>

            {/* Item 3 - Continental */}
            <div
              onClick={() => handleNavigate('/delivery')}
              className="md:col-span-1 relative h-[300px] md:h-full group cursor-pointer overflow-hidden rounded-2xl"
            >
              <Image src="/images/cuisine-continental.webp" alt="Continental Cuisine" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-3xl font-belleza text-white mb-2 group-hover:text-[#C17E5C] transition-colors">Continental</h3>
                <p className="text-white/70 font-alegreya text-sm leading-relaxed max-w-[200px]">Gourmet salads, soups, and European classics.</p>
              </div>
            </div>

            {/* Item 4 - Middle Eastern */}
            <div
              onClick={() => handleNavigate('/delivery')}
              className="md:col-span-1 relative h-[300px] md:h-full group cursor-pointer overflow-hidden rounded-2xl"
            >
              <Image src="/images/cuisine-middle-eastern.webp" alt="Middle Eastern Cuisine" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-3xl font-belleza text-white mb-2 group-hover:text-[#C17E5C] transition-colors">Middle Eastern</h3>
                <p className="text-white/70 font-alegreya text-sm leading-relaxed max-w-[200px]">Creamy hummus, falafel, and mezze platters.</p>
              </div>
            </div>

          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => handleNavigate('/delivery')}
              className="inline-flex items-center gap-2 border border-[#F9F2E9] text-[#F9F2E9] px-8 py-3 rounded-full hover:bg-[#F9F2E9] hover:text-[#3A2E2A] transition-all duration-300 text-xs font-bold uppercase tracking-widest"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>


        {/* SECTION 4: AMBIANCE & GALLERY (Expanded) */}
        <section className="py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <span className="text-senoa-accent font-bold tracking-widest uppercase text-xs mb-2 block">The Vibe</span>
                <h2 className="text-4xl md:text-6xl font-belleza text-senoa-green leading-none">
                  Captured Moments
                </h2>
              </div>
              <div className="flex flex-col items-end gap-4 hidden md:flex">
                <p className="max-w-md text-right text-gray-500 font-alegreya text-lg">
                  A glimpse into the daily magic at View N Vibe. <br />From sunrise coffees to starry nights.
                </p>
                <button
                  onClick={() => handleNavigate('/vibe')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C17E5C] to-[#a86a4a] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Vibe Check</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Desktop: Masonry-style Grid */}
            <div className="hidden md:grid grid-cols-4 gap-4 auto-rows-[300px]">

              {/* Item 1 - Large Tall */}
              <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl">
                <Image
                  src="/images/gallery.webp"
                  alt="Gallery"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ transform: 'rotate(90deg) scale(1.4)' }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
              </div>

              {/* Item 2 */}
              <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl">
                <Image src="/images/Gallery 2.webp" alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Item 3 - Text Card (Visit Us) */}
              <div className="col-span-1 row-span-1 bg-[#F9F2E9] rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-[#3A2E2A]/10">
                <MapPin className="h-8 w-8 text-[#3A2E2A] mb-3" />
                <h3 className="font-belleza text-xl text-[#3A2E2A] mb-1">Come Vibe With Us</h3>
                <p className="font-alegreya text-[#3A2E2A]/70 text-sm mb-4">Temple Road, McLeod Ganj</p>
                <a href="https://maps.google.com" target="_blank" className="text-xs font-bold uppercase tracking-widest border-b border-[#3A2E2A] pb-1 hover:text-[#C17E5C] hover:border-[#C17E5C] transition-colors">
                  Get Directions
                </a>
              </div>

              {/* Item 4 */}
              <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl">
                <Image src="/images/Gallery 3.webp" alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Item 5 */}
              <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl">
                <Image src="/images/Gallery 1.webp" alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Item 6 - Wide */}
              <div className="col-span-2 row-span-1 relative group overflow-hidden rounded-2xl">
                <Image src="/images/hero-interior.webp" alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="text-white font-belleza text-2xl drop-shadow-lg">Interior Vibes</span>
                </div>
              </div>

              {/* Item 7 */}
              <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl">
                <Image src="/images/Food 1.webp" alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Item 8 - Instagram Card */}
              <div className="col-span-1 row-span-1 bg-[#F9F2E9] rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-[#3A2E2A]/10 group hover:border-[#C17E5C]/30 transition-colors cursor-pointer">
                <div className="p-3 bg-white rounded-full mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Instagram className="h-6 w-6 text-[#C17E5C]" />
                </div>
                <h3 className="font-belleza text-xl text-[#3A2E2A] mb-1">@viewnvibe</h3>
                <p className="font-alegreya text-[#3A2E2A]/70 text-sm mb-4">Tag us in your stories!</p>
                <a href="https://instagram.com" target="_blank" className="text-xs font-bold uppercase tracking-widest text-[#C17E5C] border-b border-[#C17E5C] pb-1 hover:text-[#3A2E2A] hover:border-[#3A2E2A] transition-colors">
                  Follow Us
                </a>
              </div>

            </div>

            {/* Mobile: Auto-sliding Carousel + Full Width Image Below */}
            <div className="md:hidden space-y-3">
              {/* Top: Auto-sliding 3 images */}
              <div className="overflow-hidden">
                <div className="flex animate-slide-gallery">
                  {/* First set of 3 items */}
                  <div className="flex-shrink-0 w-full grid grid-cols-3 gap-2">
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 1.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 2.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 3.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                  </div>
                  {/* Second set of 3 items */}
                  <div className="flex-shrink-0 w-full grid grid-cols-3 gap-2">
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Food 1.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/cuisine-indian.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/cuisine-italian.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                  </div>
                  {/* Third set (duplicate first for seamless loop) */}
                  <div className="flex-shrink-0 w-full grid grid-cols-3 gap-2">
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 1.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 2.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                    <div className="relative h-[150px] rounded-xl overflow-hidden">
                      <Image src="/images/Gallery 3.webp" alt="Gallery" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Full Width Image */}
              <div className="relative h-[200px] w-full rounded-xl overflow-hidden">
                <Image src="/images/hero-interior.webp" alt="Interior View" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-white font-belleza text-lg drop-shadow-lg">Interior Vibes</span>
                  <a href="https://instagram.com" target="_blank" className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Instagram className="h-4 w-4 text-white" />
                    <span className="text-white text-xs font-bold">@viewnvibe</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: WHAT WE OFFER */}
        <section className="py-24 bg-gradient-to-b from-[#F9F2E9] to-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <span className="inline-block bg-[#3A2E2A] text-[#F9F2E9] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">Experience</span>
              <h2 className="text-4xl md:text-6xl font-belleza text-[#3A2E2A] mb-4">What We Offer</h2>
              <p className="text-lg font-alegreya text-[#3A2E2A]/60 max-w-xl mx-auto">More than just a café — it's a complete experience</p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Card 1: Outdoor Rooftop Seating */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#3A2E2A]/5 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 rounded-xl bg-[#F9F2E9] flex items-center justify-center mb-6">
                  <Mountain className="h-7 w-7 text-[#C17E5C]" />
                </div>
                <h3 className="text-xl font-belleza text-[#3A2E2A] mb-3">Outdoor Rooftop Seating</h3>
                <p className="font-alegreya text-[#3A2E2A]/70 text-sm leading-relaxed mb-6">
                  Dine under the open sky with panoramic views of the majestic Himalayan mountains and the beautiful Kangra Valley.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C17E5C]">
                  <span>Amazing Views</span>
                  <span className="w-1 h-1 rounded-full bg-[#C17E5C]" />
                  <span>Fresh Air</span>
                </div>
              </div>

              {/* Card 2: Premium Shisha Lounge */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#3A2E2A]/5 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 rounded-xl bg-[#F9F2E9] flex items-center justify-center mb-6">
                  <Wind className="h-7 w-7 text-[#C17E5C]" />
                </div>
                <h3 className="text-xl font-belleza text-[#3A2E2A] mb-3">Premium Shisha Lounge</h3>
                <p className="font-alegreya text-[#3A2E2A]/70 text-sm leading-relaxed mb-6">
                  Unwind with our selection of premium hookah flavors while enjoying the peaceful mountain atmosphere.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C17E5C]">
                  <span>Premium Flavors</span>
                  <span className="w-1 h-1 rounded-full bg-[#C17E5C]" />
                  <span>Cozy Setup</span>
                </div>
              </div>

              {/* Card 3: Peaceful & Relaxed Vibes */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#3A2E2A]/5 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 rounded-xl bg-[#F9F2E9] flex items-center justify-center mb-6">
                  <Star className="h-7 w-7 text-[#C17E5C]" />
                </div>
                <h3 className="text-xl font-belleza text-[#3A2E2A] mb-3">Peaceful & Relaxed Vibes</h3>
                <p className="font-alegreya text-[#3A2E2A]/70 text-sm leading-relaxed mb-6">
                  Escape the hustle and find your calm. Perfect for solo travelers, couples, families, and groups of friends.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C17E5C]">
                  <span>Sunset Spot</span>
                  <span className="w-1 h-1 rounded-full bg-[#C17E5C]" />
                  <span>Zen Space</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: ROOM BOOKING - LORD KRISHNA BOUTIQUE STAY */}
        <section className="py-24 bg-[#F9F2E9] relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: Image */}
              <div className="relative h-[400px] lg:h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/boutique-room.webp"
                  alt="Lord Krishna Boutique Stay"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#C17E5C] flex items-center justify-center text-white text-xs font-bold">⭐</div>
                        <div className="w-8 h-8 rounded-full bg-[#3A2E2A] flex items-center justify-center text-white text-xs font-bold">5.0</div>
                      </div>
                      <p className="text-white text-sm font-alegreya">Rated Excellent on Google</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-8">
                <div>
                  <span className="inline-block bg-[#3A2E2A] text-[#F9F2E9] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">Stay With Us</span>
                  <h2 className="text-4xl md:text-6xl font-belleza text-[#3A2E2A] leading-tight mb-6">
                    Lord Krishna <br />
                    <span className="text-[#C17E5C] italic">Boutique Stay</span>
                  </h2>
                  <p className="text-lg font-alegreya text-[#3A2E2A]/70 leading-relaxed max-w-md">
                    Complete your mountain escape. Our boutique rooms offer stunning views, cozy interiors, and the perfect base for exploring McLeod Ganj. Wake up to the Himalayas and end your day dining at View N Vibe — all under one roof.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-[#3A2E2A]/10">
                    <p className="text-2xl font-belleza text-[#3A2E2A] mb-1">8+</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2A]/50">Premium Rooms</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#3A2E2A]/10">
                    <p className="text-2xl font-belleza text-[#3A2E2A] mb-1">24/7</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2A]/50">Room Service</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#3A2E2A]/10">
                    <p className="text-2xl font-belleza text-[#3A2E2A] mb-1">Free</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2A]/50">WiFi & Breakfast</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#3A2E2A]/10">
                    <p className="text-2xl font-belleza text-[#3A2E2A] mb-1">360°</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2A]/50">Mountain Views</p>
                  </div>
                </div>

                <a
                  href="#"
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-[#3A2E2A] hover:bg-[#C17E5C] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-full"
                >
                  <span>Book Your Room</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: LIVE MUSIC & SPECIAL EVENTS */}
        <section className="py-24 bg-[#3A2E2A] text-[#F9F2E9] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C17E5C]/50 to-transparent" />
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#C17E5C]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#C17E5C]/10 blur-3xl" />

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left: Content */}
              <div className="space-y-8">
                <div>
                  <span className="inline-block bg-[#C17E5C] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">Special Events</span>
                  <h2 className="text-4xl md:text-6xl font-belleza leading-tight mb-6">
                    Live Music <br />
                    <span className="text-[#C17E5C] italic">On Demand</span>
                  </h2>
                  <p className="text-lg font-alegreya text-[#F9F2E9]/70 leading-relaxed max-w-md">
                    Make your special moments unforgettable. Book our rooftop for private parties, anniversary celebrations, corporate gatherings, or intimate musical evenings under the stars.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    🎵 Live Acoustic
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    🎂 Birthday Parties
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    💍 Anniversary
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    🏢 Corporate Events
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+917560090700"
                    className="bg-[#C17E5C] hover:bg-[#D69A7A] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-full text-center"
                  >
                    Book an Event
                  </a>
                  <a
                    href="https://wa.me/917560090700?text=Hi, I would like to enquire about booking a special event at View N Vibe"
                    target="_blank"
                    className="border border-[#F9F2E9]/30 hover:bg-[#F9F2E9]/10 text-[#F9F2E9] px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-full text-center"
                  >
                    WhatsApp Us
                  </a>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <Image
                    src="/images/live-music.webp"
                    alt="Live Music Events"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A2E2A] via-transparent to-transparent opacity-60" />
                </div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <p className="text-sm font-alegreya italic text-white/80">"The sunset acoustic session was magical. Best birthday celebration ever!"</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C17E5C] mt-2">— A Happy Guest</p>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* SECTION: SAVE A SEAT CTA */}
        <section className="py-32 px-4 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-belleza text-senoa-green mb-8">
              Save a seat.
            </h2>
            <p className="text-xl text-gray-500 font-alegreya mb-12 max-w-lg mx-auto">
              We accept reservations for breakfast, lunch, and dinner. Walk-ins are always welcome.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-senoa-green hover:bg-senoa-green-dark text-white px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all"
              >
                Book Now
              </button>
              <a
                href="tel:+917560090700"
                className="border border-senoa-green text-senoa-green px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-senoa-green hover:text-white transition-all"
              >
                +91 75600 90700
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
