'use client';

import type { ImageLoaderProps } from 'next/image';

/**
 * Custom Image Loader
 * Routes all image requests through our custom /api/images endpoint
 * to bypass Vercel's paid image optimization limits.
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
    // If the src is already an absolute URL (starts with http), encode it
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return `/api/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
    }

    // For local images (starting with /), pass them directly
    return `/api/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
