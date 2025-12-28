
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Asterisk, ArrowRight, X, Loader2, ArrowUpRight, Copy, Check, Mountain, Leaf, Sun, Wind, Utensils } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

import { TableBookingModal } from '@/components/TableBookingModal';
import { Footer } from '@/components/Footer';

const CouponTicker = () => {
  const coupons = [
    { code: 'VIBE20', desc: '20% OFF' },
    { code: 'FIRST50', desc: 'Flat ₹50 OFF' },
    { code: 'FREESHIP', desc: 'Free Delivery' },
  ];

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full overflow-hidden mb-4 relative max-w-2xl mx-auto">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-senoa-cream to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-senoa-cream to-transparent z-10" />

      <div className="flex animate-marquee whitespace-nowrap">
        {[...coupons, ...coupons, ...coupons, ...coupons].map((coupon, i) => (
          <div key={i} className="flex items-center mx-6 bg-white/50 px-3 py-1 rounded-full border border-senoa-green/5">
            <span className="text-xs font-bold text-senoa-green mr-2 tracking-wide uppercase">{coupon.desc}</span>
            <button
              onClick={() => copyToClipboard(coupon.code)}
              className="flex items-center gap-1 bg-senoa-green text-senoa-cream px-2 py-0.5 rounded-full text-[10px] font-mono hover:bg-senoa-green/90 transition shadow-sm"
            >
              {coupon.code}
              {copied === coupon.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


const DeliveryPopup = ({ isOpen, onClose, onOrder }: { isOpen: boolean; onClose: () => void; onOrder: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-senoa-cream rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-senoa-green/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-black/10 text-senoa-green hover:bg-black/20 transition z-10">
          <X className="h-5 w-5" />
        </button>
        <div className="w-full h-48 relative">
          <Image
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800"
            alt="Delivery"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-senoa-green font-belleza">Hungry? We Deliver.</h2>
          <p className="text-sm text-senoa-green/70 mt-3 mb-8 font-alegreya text-lg leading-relaxed">Get your favorite vegetarian dishes from the mountains delivered to your doorstep.</p>

          <button
            onClick={onOrder}
            className="w-full bg-senoa-green text-senoa-cream font-bold py-4 px-6 rounded-full flex items-center justify-center space-x-2 hover:bg-senoa-green/90 transition transform hover:scale-[1.02] active:scale-95"
          >
            <span>ORDER DELIVERY</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDeliveryPopup(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path: string) => {
    if (path === '/table-booking') {
      setIsBookingModalOpen(true);
      return;
    }
    setLoading(path);
    router.push(path);
  };

  const categories = [
    { id: '01', name: 'Indian', image: '/images/Food 1.jpg', href: '/delivery' },
    { id: '02', name: 'Italian', image: '/images/Food 2.jpg', href: '/delivery' },
    { id: '03', name: 'Tibetan', image: '/images/Food 3.jpg', href: '/delivery' },
    { id: '04', name: 'Chinese', image: '/images/Food 4.jpg', href: '/delivery' },
  ];

  const features = [
    { icon: Mountain, title: 'Mountain Views', desc: 'Panoramic Kangra Valley views' },
    { icon: Leaf, title: 'Pure Vegetarian', desc: '100% vegetarian kitchen' },
    { icon: Sun, title: 'Sunset Spot', desc: 'Popular sunset watching point' },
    { icon: Wind, title: 'Fresh Air', desc: 'Open rooftop ambiance' },
  ];



  return (
    <div className="min-h-screen bg-senoa-cream text-senoa-green font-sans selection:bg-senoa-green selection:text-senoa-cream">
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
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="relative">
            {/* Ticker */}
            <CouponTicker />

            {/* Big Typography */}
            <h1 className="text-[12vw] md:text-[10vw] leading-[0.85] font-black tracking-tighter text-center uppercase text-senoa-green pt-2">
              VIEW N<br />VIBE
            </h1>

            <p className="text-center text-lg md:text-xl font-alegreya text-senoa-green/70 mt-4 mb-8 max-w-xl mx-auto">
              Pure Vegetarian Rooftop Café in McLeod Ganj<br />
              <span className="text-sm opacity-70">Enjoy delicious food with breathtaking mountain views</span>
            </p>

            {/* Hero Image overlapping/below */}
            <div className="mt-8 relative z-10 w-full aspect-[16/9] md:aspect-[2.35/1] rounded-sm overflow-hidden shadow-2xl bg-black/5 group">
              <Image
                src="/images/hero-interior.png"
                alt="View N Vibe Café Rooftop"
                fill
                className="object-cover object-center"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Hero PNG Overlay */}
              <div className="absolute bottom-0 left-8 max-w-[40%] md:max-w-[25%] z-20">
                <Image
                  src="/images/hero.png"
                  alt="Hero Graphics"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>

              <div className="hidden md:flex absolute bottom-8 right-8 flex-col md:flex-row gap-4 z-20">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-senoa-cream text-senoa-green px-6 py-3 rounded-sm font-bold text-sm hover:bg-white transition shadow-lg flex items-center gap-2 justify-center"
                >
                  Book A Table
                </button>
                <a
                  href="tel:+917560090700"
                  className="bg-senoa-green text-senoa-cream px-6 py-3 rounded-sm font-bold text-sm hover:bg-senoa-green/90 transition shadow-lg flex items-center gap-2 justify-center"
                >
                  Call Now
                </a>
                <button
                  onClick={() => handleNavigate('/delivery')}
                  className="bg-white text-senoa-green px-6 py-3 rounded-sm font-bold text-sm hover:bg-gray-100 transition shadow-lg flex items-center gap-2 justify-center"
                >
                  Order Online
                </button>
              </div>

            </div>

            {/* Mobile Buttons (Below Hero) */}
            <div className="flex md:hidden flex-col gap-3 mt-6">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-senoa-cream text-senoa-green py-4 rounded-sm font-bold text-lg hover:bg-white transition shadow-sm border border-senoa-green/10"
              >
                Book A Table
              </button>
              <a
                href="tel:+917560090700"
                className="w-full bg-senoa-green text-senoa-cream py-4 rounded-sm font-bold text-lg hover:bg-senoa-green/90 transition shadow-sm flex items-center justify-center"
              >
                Call Now
              </a>
              <button
                onClick={() => handleNavigate('/delivery')}
                className="w-full bg-white text-senoa-green py-4 rounded-sm font-bold text-lg hover:bg-gray-100 transition shadow-sm border border-senoa-green/10"
              >
                Order Online
              </button>
            </div>


          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white/50 backdrop-blur-sm border border-senoa-green/10 rounded-xl p-6 text-center hover:shadow-lg transition-shadow group">
                <feature.icon className="h-8 w-8 mx-auto mb-3 text-senoa-green group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{feature.title}</h3>
                <p className="text-xs text-senoa-green/60 font-alegreya">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/4">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">About</h3>
            </div>
            <div className="w-full md:w-3/4">
              <div className="flex justify-end mb-8">
                <Asterisk className="h-16 w-16 text-senoa-green animate-spin-slow" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold font-belleza leading-tight mb-20 text-center md:text-left">
                A rooftop escape — <br />
                for <span className="text-senoa-green italic">good vibes</span>
              </h2>

              <div className="grid md:grid-cols-2 md:h-[500px] w-full">
                <div className="bg-senoa-green text-senoa-cream p-12 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Made with love <br />served with soul</h3>
                  </div>
                  <p className="text-sm opacity-80 max-w-xs text-lg font-alegreya">
                    Set atop Lord Krishna Boutique Luxury Stay, View N Vibe Café offers a perfect blend of great food, calm ambiance, and stunning mountain views.
                  </p>

                </div>
                <div className="relative h-64 md:h-full w-full">
                  <Image
                    src="/images/Coffee mug.jpg"
                    alt="Coffee Detail"
                    fill
                    className="object-cover"
                  />
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CUISINES SECTION */}
        <section className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto bg-senoa-cream">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-belleza mb-2">Our Cuisines</h2>
            <h2 className="text-3xl md:text-5xl font-bold font-belleza text-senoa-green">100% Pure Vegetarian</h2>
            <p className="mt-4 text-senoa-green/70 font-alegreya text-lg max-w-2xl mx-auto">
              We serve Indian, Chinese, Italian, Tibetan & Continental dishes — all freshly prepared and full of flavor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat) => (
              <div key={cat.id} className="group relative aspect-square md:aspect-[4/3] overflow-hidden rounded-lg cursor-pointer" onClick={() => handleNavigate(cat.href)}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                <div className="absolute top-6 right-6 text-white text-xs font-mono opacity-80">
                  ({cat.id}) {cat.name}
                </div>

                <div className="absolute bottom-6 left-6 text-white flex items-center gap-2 group-hover:gap-4 transition-all">
                  <span className="text-sm font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all">view more</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR ITEMS - Enhanced Design */}
        <section className="py-20 px-4 md:px-8 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-senoa-green via-senoa-green to-senoa-green-dark" />

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-senoa-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-senoa-highlight/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-senoa-cream/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-senoa-cream/5 rounded-full" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-senoa-accent/20 text-senoa-accent rounded-full text-sm font-semibold mb-4 animate-pulse">
                ⭐ MUST TRY
              </span>
              <h2 className="text-4xl md:text-6xl font-bold font-belleza text-senoa-cream mb-4">Popular Items</h2>
              <p className="font-alegreya text-xl text-senoa-cream/70 max-w-xl mx-auto">
                Discover our guests' all-time favorites, crafted with love and served with mountain views
              </p>
            </div>

            {/* Popular Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {[
                { name: 'Dal Makhani', emoji: '🍲', popular: true },
                { name: 'Shahi Paneer', emoji: '🧀', popular: true },
                { name: 'Momos', emoji: '🥟', popular: true },
                { name: 'Pizza', emoji: '🍕', popular: false },
                { name: 'Pasta', emoji: '🍝', popular: false },
                { name: 'Sandwiches', emoji: '🥪', popular: false },
                { name: 'Burgers', emoji: '🍔', popular: false },
                { name: 'Wraps', emoji: '🌯', popular: false },
                { name: 'Parantha', emoji: '🫓', popular: true },
                { name: 'Noodles', emoji: '🍜', popular: false },
                { name: 'Coffee', emoji: '☕', popular: true },
                { name: 'Shakes', emoji: '🥤', popular: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNavigate('/delivery')}
                  className={`group relative bg-gradient-to-br from-senoa-cream/15 to-senoa-cream/5 backdrop-blur-md border border-senoa-cream/20 rounded-2xl p-6 text-center hover:scale-105 hover:bg-senoa-cream/20 transition-all duration-300 cursor-pointer ${item.popular ? 'ring-2 ring-senoa-accent/50' : ''}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {item.popular && (
                    <span className="absolute -top-2 -right-2 bg-senoa-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                      HOT
                    </span>
                  )}
                  <span className="text-4xl mb-3 block transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                    {item.emoji}
                  </span>
                  <span className="text-senoa-cream font-semibold text-sm">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => handleNavigate('/delivery')}
                className="inline-flex items-center gap-3 bg-senoa-accent hover:bg-senoa-accent/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-senoa-accent/30"
              >
                <Utensils className="h-5 w-5" />
                Explore Full Menu
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/4">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-8 md:mb-0">Gallery</h3>
              <div className="hidden md:block mt-8">
                <Asterisk className="h-12 w-12 text-senoa-green" />
              </div>
            </div>
            <div className="w-full md:w-3/4">
              <p className="text-xl font-alegreya mb-8 max-w-md">
                Enjoy open rooftop seating with fresh air and scenic views of Dharamshala & Kangra Valley.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/images/Gallery 1.jpg"
                    alt="Gallery 1"
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/images/Gallery 2.jpg"
                      alt="Gallery 2"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <div className="relative flex-grow min-h-[200px]">
                    <Image
                      src="/images/Gallery 3.jpg"
                      alt="Gallery 3"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AMENITIES - Enhanced Design */}
        <section className="py-24 px-4 md:px-8 relative overflow-hidden bg-gradient-to-b from-senoa-cream to-white">
          {/* Decorative Background */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-senoa-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-senoa-highlight/10 rounded-full blur-3xl" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-senoa-green/10 text-senoa-green rounded-full text-sm font-semibold mb-4">
                ✨ EXPERIENCE
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-belleza text-senoa-green mb-4">What We Offer</h2>
              <p className="font-alegreya text-lg text-senoa-text/70 max-w-xl mx-auto">
                More than just a café — it's a complete experience
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 - Rooftop */}
              <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-senoa-accent to-senoa-highlight" />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-senoa-accent/20 to-senoa-highlight/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Mountain className="h-8 w-8 text-senoa-accent" />
                  </div>
                  <h3 className="text-xl font-bold font-belleza text-senoa-green mb-3">Outdoor Rooftop Seating</h3>
                  <p className="text-senoa-text/70 font-alegreya leading-relaxed">
                    Dine under the open sky with panoramic views of the majestic Himalayan mountains and the beautiful Kangra Valley.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-senoa-accent text-sm font-semibold">
                    <span>Amazing Views</span>
                    <span className="w-2 h-2 rounded-full bg-senoa-accent" />
                    <span>Fresh Air</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Hookah */}
              <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-senoa-green to-senoa-accent" />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-senoa-green/20 to-senoa-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Wind className="h-8 w-8 text-senoa-green" />
                  </div>
                  <h3 className="text-xl font-bold font-belleza text-senoa-green mb-3">Premium Shisha Lounge</h3>
                  <p className="text-senoa-text/70 font-alegreya leading-relaxed">
                    Unwind with our selection of premium hookah flavors while enjoying the peaceful mountain atmosphere.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-senoa-green text-sm font-semibold">
                    <span>Premium Flavors</span>
                    <span className="w-2 h-2 rounded-full bg-senoa-green" />
                    <span>Cozy Setup</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Vibes */}
              <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-senoa-highlight to-senoa-accent" />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-senoa-highlight/30 to-senoa-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Sun className="h-8 w-8 text-senoa-highlight" />
                  </div>
                  <h3 className="text-xl font-bold font-belleza text-senoa-green mb-3">Peaceful & Relaxed Vibes</h3>
                  <p className="text-senoa-text/70 font-alegreya leading-relaxed">
                    Escape the hustle and find your calm. Perfect for solo travelers, couples, families, and groups of friends.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-senoa-highlight text-sm font-semibold">
                    <span>Sunset Spot</span>
                    <span className="w-2 h-2 rounded-full bg-senoa-highlight" />
                    <span>Zen Space</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-senoa-green/5 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-senoa-accent flex items-center justify-center text-white font-bold text-sm">🌄</div>
                    <div className="w-10 h-10 rounded-full bg-senoa-green flex items-center justify-center text-white font-bold text-sm">☕</div>
                    <div className="w-10 h-10 rounded-full bg-senoa-highlight flex items-center justify-center text-white font-bold text-sm">🍃</div>
                  </div>
                  <span className="text-senoa-green font-alegreya text-lg">Join hundreds of happy visitors</span>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-senoa-green hover:bg-senoa-green-dark text-senoa-cream px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                >
                  Reserve Your Spot
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TableBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
