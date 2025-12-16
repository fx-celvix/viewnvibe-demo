
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Asterisk, ArrowRight, X, Loader2, ArrowUpRight, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

import { TableBookingModal } from '@/components/TableBookingModal';
import { Footer } from '@/components/Footer';

const CouponTicker = () => {
  const coupons = [
    { code: 'BEANS20', desc: '20% OFF' },
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
            src="https://i.pinimg.com/736x/08/22/e2/0822e2bcba0e2c8d89d4573a7ac5e5b8.jpg"
            alt="Delivery"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-senoa-green font-belleza">Hungry? We Deliver.</h2>
          <p className="text-sm text-senoa-green/70 mt-3 mb-8 font-alegreya text-lg leading-relaxed">Get your favorite coffee and fresh bites delivered right to your doorstep.</p>

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
    { id: '01', name: 'Shakes', image: '/images/Food 1.jpg', href: '/delivery' },
    { id: '02', name: 'Coffee', image: '/images/Food 2.jpg', href: '/delivery' },
    { id: '03', name: 'Croissant', image: '/images/Food 3.jpg', href: '/delivery' },
    { id: '04', name: 'Burgers', image: '/images/Food 4.jpg', href: '/delivery' },
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

      {/* Explicitly keeping existing Header but it might need styling tweaks to match 'Senoa' fully. 
          For now, we rely on the global header but we could hide it or replace it if needed. 
          Let's include it for functionality. */}
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="relative">
            {/* Ticker */}
            <CouponTicker />

            {/* Big Typography */}
            <h1 className="text-[20vw] leading-[0.8] font-black tracking-tighter text-center uppercase text-senoa-green pt-2">
              BEANS
            </h1>



            {/* Hero Image overlapping/below */}
            <div className="mt-8 relative z-10 w-full aspect-[16/9] md:aspect-[2.35/1] rounded-sm overflow-hidden shadow-2xl bg-black/5 group">
              <Image
                src="/images/hero-interior.png"
                alt="Interior"
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
                  href="tel:+917979057085"
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
                href="tel:+917979057085"
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
                A cozy corner — <br />
                for <span className="text-senoa-green italic">good food</span>
              </h2>

              <div className="grid md:grid-cols-2 md:h-[500px] w-full">
                <div className="bg-senoa-green text-senoa-cream p-12 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Made from heart <br /> served with soul</h3>
                  </div>
                  <p className="text-sm opacity-80 max-w-xs text-lg font-alegreya">
                    Every cup of coffee we brew is a quiet invitation: to slow down, savor the aroma, and feel at home.
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

        {/* CATEGORIES SECTION */}
        <section className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto bg-senoa-cream">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-belleza mb-2">Ready to serve</h2>
            <h2 className="text-3xl md:text-5xl font-bold font-belleza text-senoa-green">you something good.</h2>
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
                Every plate tells a story. Here's a look at the mix of scenes and familiar smiles we see every day.
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
      </main>

      <TableBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
