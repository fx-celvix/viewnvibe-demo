'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp = () => {
    const pathname = usePathname();

    // Only show on Landing (/), About, and Contact pages
    const allowedPaths = ['/', '/about', '/contact'];
    const shouldShow = allowedPaths.includes(pathname);

    if (!shouldShow) return null;

    return (
        <div className="fixed bottom-32 right-4 md:bottom-8 md:right-8 z-40 flex flex-col items-end pointer-events-none group">
            {/* Floating Message */}
            <div className="mb-4 bg-white text-senoa-green px-4 py-3 rounded-xl shadow-xl border border-senoa-green/10 text-xs font-bold max-w-[180px] text-center relative pointer-events-auto animate-pulse">
                This is a demo site. Contact us to get yours.
                {/* Arrow */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-senoa-green/10"></div>
            </div>

            <a
                href="https://wa.me/917979057085?text=Hi%2C%20I'm%20interested%20to%20work%20together."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center hover:bg-[#20ba5a] pointer-events-auto"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="h-7 w-7" />
            </a>
        </div>
    );
};
