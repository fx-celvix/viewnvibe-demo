'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Instagram, MapPin, Camera, Sparkles, Sun, Mountain, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

// Static imports to preserve aspect ratio and orientation
import featuredHeroImg from '../../../public/images/vibe/20858E33-520D-4E4E-A0D7-1314CB673382.jpeg';
import img1 from '../../../public/images/gallery.jpg';
import img2 from '../../../public/images/vibe/2DD191AD-19E3-49B3-A442-5596AA833599.jpeg';
import img3 from '../../../public/images/vibe/37767AFA-1DEC-4802-9176-D20F7C5D56EC.jpeg';
import img4 from '../../../public/images/vibe/408B9EFD-73DB-43E2-B2F3-2C8C09EB1486.jpeg';
import img5 from '../../../public/images/vibe/4C6ACB8D-35A3-4C9C-B27B-87AA20304B7B.jpeg';
import img6 from '../../../public/images/vibe/538C4BA8-E6C9-4E46-B9B2-0C0C7A2EC35E.jpeg';
import img7 from '../../../public/images/vibe/5D1794C4-FD19-4079-8170-9D5CCD6E3729.jpeg';
import img8 from '../../../public/images/vibe/607AD8FD-E26E-4F3B-BFCC-275B4E6217B9.jpeg';
import img9 from '../../../public/images/vibe/647E6906-C141-451B-B762-65BCBB7F9049.jpeg';
import img10 from '../../../public/images/vibe/7C0FC4BF-CA2A-4ED8-AFA4-1E4742E5F836.jpeg';
import img11 from '../../../public/images/vibe/7C32E0B2-F4BC-469F-B8AB-8E9541379CA7.jpeg';
import img12 from '../../../public/images/vibe/8AAE3FD3-1C2A-48D0-B35B-9D2E4A2FC7E4.jpeg';
import img13 from '../../../public/images/vibe/8B4E4C60-0E15-471F-8593-64D2CAC4891B.jpeg';
import img14 from '../../../public/images/vibe/9C042051-BFB6-40F4-BF59-BD6FCB2F1251.jpeg';
import img15 from '../../../public/images/vibe/AF810570-B990-4C59-B4CF-11FDF730843E.jpeg';
import img16 from '../../../public/images/vibe/B4E7FE73-CBD1-488F-8F0B-2A7B5815B53F.jpeg';
import img17 from '../../../public/images/vibe/C22E1202-B928-45AE-B23C-A79EFDCCBE20.jpeg';
import img18 from '../../../public/images/vibe/E4FD447A-B8E6-41B1-B87D-872143930769.jpeg';
import img19 from '../../../public/images/vibe/F0459837-0937-4A95-A908-4AFAA20BE975.jpeg';
import img20 from '../../../public/images/vibe/FA9A6170-99B2-4490-A2B7-7D116D555202.jpeg';
import img21 from '../../../public/images/vibe/IMG_4773.jpg';
import img22 from '../../../public/images/vibe/IMG_4778.jpg';
import img23 from '../../../public/images/vibe/IMG_4780.jpg';
import img24 from '../../../public/images/vibe/IMG_4782.jpg';
import img25 from '../../../public/images/vibe/IMG_4783.jpg';
import img27 from '../../../public/images/vibe/IMG_4787.jpg';

const vibeImages = [
    img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
    img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
    img21, img22, img23, img24, img25, img27
];

// Gallery images (all except the first featured one)
const galleryImages = vibeImages.slice(1);

export default function VibePage() {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // Navigation functions
    const goToNext = useCallback(() => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) =>
                prev !== null ? (prev + 1) % vibeImages.length : 0
            );
        }
    }, [selectedImageIndex]);

    const goToPrev = useCallback(() => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) =>
                prev !== null ? (prev - 1 + vibeImages.length) % vibeImages.length : 0
            );
        }
    }, [selectedImageIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;

            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'Escape') {
                setSelectedImageIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, goToNext, goToPrev]);

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
    };

    // Intersection observer for scroll animations
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        setVisibleImages((prev) => new Set(prev).add(index));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach((el) => observerRef.current?.observe(el));
    }, []);

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const parallaxItems = document.querySelectorAll('.parallax-item');

            parallaxItems.forEach((item) => {
                const element = item as HTMLElement;
                const speed = parseFloat(element.getAttribute('data-parallax') || '0.05');
                const rect = element.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;
                const viewportCenter = window.innerHeight / 2;
                const distance = elementCenter - viewportCenter;
                const translateY = distance * speed;

                element.style.transform = `translateY(${translateY}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0D0D0D] overflow-hidden">
            <Header />

            {/* Floating Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-600/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tl from-rose-500/10 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-tr from-amber-400/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            {/* Hero Section - Immersive */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-32 overflow-hidden">
                {/* Creative Scattered Photo Background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Floating scattered images with varied sizes and rotations */}
                    {vibeImages.slice(0, 16).map((image, index) => {
                        // Create varied positions, sizes, and rotations
                        const positions = [
                            { top: '-5%', left: '-5%', size: 'w-48 h-48 md:w-64 md:h-64', rotate: '-12deg', blur: 'blur-[2px]' },
                            { top: '10%', left: '20%', size: 'w-32 h-32 md:w-44 md:h-44', rotate: '8deg', blur: 'blur-[1px]' },
                            { top: '-10%', left: '45%', size: 'w-40 h-40 md:w-56 md:h-56', rotate: '-5deg', blur: 'blur-[2px]' },
                            { top: '5%', left: '70%', size: 'w-36 h-36 md:w-48 md:h-48', rotate: '15deg', blur: 'blur-[1px]' },
                            { top: '15%', left: '88%', size: 'w-44 h-44 md:w-60 md:h-60', rotate: '-8deg', blur: 'blur-[2px]' },
                            { top: '35%', left: '-8%', size: 'w-52 h-52 md:w-72 md:h-72', rotate: '6deg', blur: 'blur-[1px]' },
                            { top: '40%', left: '15%', size: 'w-28 h-28 md:w-36 md:h-36', rotate: '-18deg', blur: 'blur-[3px]' },
                            { top: '50%', left: '75%', size: 'w-40 h-40 md:w-52 md:h-52', rotate: '10deg', blur: 'blur-[1px]' },
                            { top: '45%', left: '92%', size: 'w-36 h-36 md:w-48 md:h-48', rotate: '-6deg', blur: 'blur-[2px]' },
                            { top: '65%', left: '-3%', size: 'w-36 h-36 md:w-44 md:h-44', rotate: '12deg', blur: 'blur-[2px]' },
                            { top: '70%', left: '25%', size: 'w-44 h-44 md:w-56 md:h-56', rotate: '-10deg', blur: 'blur-[1px]' },
                            { top: '75%', left: '50%', size: 'w-32 h-32 md:w-40 md:h-40', rotate: '20deg', blur: 'blur-[2px]' },
                            { top: '80%', left: '80%', size: 'w-48 h-48 md:w-64 md:h-64', rotate: '-15deg', blur: 'blur-[1px]' },
                            { top: '90%', left: '10%', size: 'w-40 h-40 md:w-52 md:h-52', rotate: '5deg', blur: 'blur-[2px]' },
                            { top: '85%', left: '60%', size: 'w-36 h-36 md:w-48 md:h-48', rotate: '-8deg', blur: 'blur-[3px]' },
                            { top: '55%', left: '40%', size: 'w-28 h-28 md:w-36 md:h-36', rotate: '15deg', blur: 'blur-[2px]' },
                        ];
                        const pos = positions[index];
                        const animDelay = (index * 0.5) % 5;

                        return (
                            <div
                                key={index}
                                className={`absolute ${pos.size} rounded-2xl overflow-hidden opacity-40 floating-image`}
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: `rotate(${pos.rotate})`,
                                    animationDelay: `${animDelay}s`,
                                }}
                            >
                                <Image
                                    src={image}
                                    alt=""
                                    fill
                                    className={`object-cover ${pos.blur}`}
                                    sizes="300px"
                                />
                            </div>
                        );
                    })}

                    {/* Extremely Dark Overlay with Radial Vignette */}
                    <div className="absolute inset-0 bg-black/85" />
                    <div className="absolute inset-0 bg-radial-vignette" />
                </div>

                {/* Gradient Overlays for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-transparent to-[#0D0D0D] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/50 via-transparent to-[#0D0D0D]/50 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Floating Badge */}
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 px-6 py-3 rounded-full mb-8 animate-float">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        <span className="text-sm font-medium bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent tracking-wider uppercase">
                            Rooftop Moments
                        </span>
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    </div>

                    {/* Main Title with Gradient */}
                    <h1 className="relative">
                        <span className="block text-7xl md:text-8xl lg:text-9xl font-belleza tracking-tight">
                            <span className="bg-gradient-to-br from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
                                The
                            </span>
                        </span>
                        <span className="block text-8xl md:text-9xl lg:text-[12rem] font-belleza tracking-tight -mt-4 md:-mt-8">
                            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                                Vibe
                            </span>
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-8 text-xl md:text-2xl font-alegreya text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Where the <span className="text-amber-400">Himalayas</span> meet your coffee cup. <br />
                        Sunsets, stories, and soulful moments.
                    </p>

                    {/* Scroll Indicator */}
                    <div className="mt-16 flex flex-col items-center gap-2 animate-bounce">
                        <span className="text-white/40 text-xs uppercase tracking-widest">Scroll to explore</span>
                        <div className="w-px h-12 bg-gradient-to-b from-amber-400/50 to-transparent" />
                    </div>
                </div>

                {/* Side Decorative Lines */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-10">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
                    <Sun className="h-5 w-5 text-amber-500/50 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
                </div>

                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-10">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-rose-500/50 to-transparent" />
                    <Mountain className="h-5 w-5 text-rose-500/50" />
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-rose-500/50 to-transparent" />
                </div>
            </section>

            {/* Featured Image - Single Hero */}
            <section className="relative px-4 md:px-8 py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <h2 className="text-2xl md:text-3xl font-belleza text-white/80 tracking-wide">Featured Moment</h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent" />
                    </div>

                    {/* Single Featured Image */}
                    <div className="relative group overflow-hidden rounded-3xl cursor-default">
                        <div className="aspect-[16/9] md:aspect-[21/9]">
                            <Image
                                src={featuredHeroImg}
                                alt="Featured moment"
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-105"
                                placeholder="blur"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="inline-block px-4 py-1.5 bg-amber-500/20 backdrop-blur-sm rounded-full text-amber-300 text-xs uppercase tracking-wider mb-4">
                                    Featured
                                </span>
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-belleza text-white">Golden Hour Magic</h3>
                                <p className="mt-2 text-white/60 font-alegreya text-lg md:text-xl max-w-xl">
                                    Where Himalayan sunsets paint the sky in shades of gold
                                </p>
                            </div>
                        </div>
                        {/* Removed Click/Lightbox Icon as requested to delink */}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/10 to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="text-6xl md:text-8xl font-serif text-amber-500/20 leading-none">"</div>
                    <blockquote className="text-2xl md:text-4xl font-alegreya text-white/80 italic leading-relaxed -mt-8">
                        Every sunset here tells a different story. Every coffee cup holds a new conversation.
                    </blockquote>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-amber-500/50" />
                        <span className="text-amber-400 font-medium tracking-wider uppercase text-sm">View N Vibe</span>
                        <div className="w-12 h-px bg-amber-500/50" />
                    </div>
                </div>
            </section>

            {/* Gallery Section - Masonry with Parallax */}
            <section className="px-4 md:px-8 py-16 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-12">
                        <Coffee className="h-5 w-5 text-amber-500" />
                        <h2 className="text-2xl md:text-3xl font-belleza text-white/80 tracking-wide">Gallery</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                    </div>

                    {/* Masonry Grid - Preserves Original Aspect Ratios */}
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                        {galleryImages.map((image, index) => {
                            // Parallax speed variation for visual depth
                            const parallaxSpeed = [0.03, 0.05, 0.02, 0.04, 0.035][index % 5];

                            // Varied scale on hover for visual interest
                            const scaleVariation = ['group-hover:scale-105', 'group-hover:scale-110', 'group-hover:scale-[1.08]'][index % 3];

                            return (
                                <div
                                    key={index}
                                    data-animate
                                    data-index={index}
                                    data-parallax={parallaxSpeed}
                                    className={`mb-4 break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl transition-all duration-700 parallax-item ${visibleImages.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                        }`}
                                    style={{
                                        transitionDelay: `${(index % 5) * 100}ms`,
                                    }}
                                    onClick={() => setSelectedImageIndex(index + 1)}
                                >
                                    <Image
                                        src={image}
                                        alt={`View N Vibe moment ${index + 2}`}
                                        className={`w-full h-auto object-cover transition-all duration-700 ${scaleVariation}`}
                                        unoptimized={true}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Shine Effect on Hover */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </div>

                                    {/* Hover Content */}
                                    <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                                <Camera className="h-4 w-4" />
                                            </div>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity delay-100">View</span>
                                        </div>
                                    </div>

                                    {/* Border Glow on Hover */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/0 group-hover:border-amber-500/40 transition-colors duration-500" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative py-8">
                                <div className="text-4xl md:text-6xl font-belleza bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                    500+
                                </div>
                                <div className="mt-2 text-white/50 text-sm uppercase tracking-wider">Sunsets Witnessed</div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative py-8">
                                <div className="text-4xl md:text-6xl font-belleza bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                                    ∞
                                </div>
                                <div className="mt-2 text-white/50 text-sm uppercase tracking-wider">Stories Shared</div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative py-8">
                                <div className="text-4xl md:text-6xl font-belleza bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                                    1
                                </div>
                                <div className="mt-2 text-white/50 text-sm uppercase tracking-wider">Perfect View</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/20 to-[#0D0D0D]" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 mb-8">
                        <Camera className="h-7 w-7 text-amber-400" />
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-belleza text-white mb-6">
                        Create Your <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Moment</span>
                    </h2>

                    <p className="text-white/60 font-alegreya text-xl mb-10 max-w-xl mx-auto">
                        Visit us and become part of our story. Your perfect Himalayan sunset awaits.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://instagram.com/viewnvibe"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 font-bold uppercase tracking-wider text-sm overflow-hidden rounded-full"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Instagram className="h-4 w-4" />
                                Follow on Instagram
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </a>

                        <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 border border-white/20 text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-full backdrop-blur-sm"
                        >
                            <MapPin className="h-4 w-4" />
                            Get Directions
                        </a>
                    </div>
                </div>
            </section>

            {/* Bottom Spacer */}
            <div className="h-32 md:h-48 w-full bg-[#0D0D0D]" />

            {/* Lightbox Modal with Navigation */}
            {selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-lg flex items-center justify-center"
                    onClick={() => setSelectedImageIndex(null)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(null);
                        }}
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white p-3 z-20 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Previous Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-20 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group"
                    >
                        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-20 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group"
                    >
                        <ChevronRight className="h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Image Container */}
                    <div
                        className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center px-16 md:px-24"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            key={selectedImageIndex}
                            src={vibeImages[selectedImageIndex]}
                            alt={`View N Vibe - Image ${selectedImageIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in"
                            unoptimized={true}
                        />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-sm font-medium">
                        {selectedImageIndex + 1} / {vibeImages.length}
                    </div>

                    {/* Navigation Hints */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4 text-white/40 text-sm">
                            <span className="hidden md:flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">←</kbd>
                                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">→</kbd>
                                to navigate
                            </span>
                            <span className="md:hidden">Swipe to navigate</span>
                        </div>
                        <span className="text-white/30 text-xs">Click outside or press ESC to close</span>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes zoom-in {
                    from { transform: scale(0.95); }
                    to { transform: scale(1); }
                }

                .animate-in {
                    animation: fade-in 0.3s ease-out, zoom-in 0.3s ease-out;
                }

                .parallax-item {
                    will-change: transform;
                    transition: opacity 0.7s ease-out, box-shadow 0.5s ease;
                }

                .parallax-item:hover {
                    box-shadow: 0 25px 50px -12px rgba(251, 191, 36, 0.15);
                }

                @keyframes shine {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
