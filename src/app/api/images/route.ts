import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Self-Hosted Image Optimization API
 * Replaces Vercel's paid image optimization with Sharp-based processing.
 * 
 * Features:
 * - Local filesystem reads (fastest)
 * - Remote URL fetching with browser mimicry
 * - WebP conversion with JPEG fallback
 * - SVG placeholder for missing images
 * - Aggressive caching (1 year)
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const width = parseInt(searchParams.get('w') || '800', 10);
        const quality = parseInt(searchParams.get('q') || '75', 10);

        // Validate inputs
        if (!url) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        if (width < 1 || width > 4096) {
            return new NextResponse('Invalid width', { status: 400 });
        }

        let imageBuffer: Buffer;

        // Step 2: Source Fetching
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // Remote image - fetch with browser mimicry
            imageBuffer = await fetchRemoteImage(url);
        } else {
            // Local image - read from filesystem
            imageBuffer = await fetchLocalImage(url);
        }

        // Step 3: Optimization with Sharp
        const acceptHeader = request.headers.get('accept') || '';
        const supportsWebP = acceptHeader.includes('image/webp');

        let optimizedImage: Buffer;
        let contentType: string;

        if (supportsWebP) {
            optimizedImage = await sharp(imageBuffer)
                .resize(width, null, { withoutEnlargement: true })
                .webp({ quality, effort: 3 })
                .toBuffer();
            contentType = 'image/webp';
        } else {
            optimizedImage = await sharp(imageBuffer)
                .resize(width, null, { withoutEnlargement: true })
                .jpeg({ quality, mozjpeg: true })
                .toBuffer();
            contentType = 'image/jpeg';
        }

        // Step 5: Return with aggressive caching
        return new NextResponse(optimizedImage, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Image-Optimization': 'self-hosted',
            },
        });

    } catch (error) {
        console.error('Image optimization error:', error);

        // Check if it's a "not found" error
        if (error instanceof Error && error.message.includes('ENOENT')) {
            // Return SVG placeholder for missing images
            return generatePlaceholder();
        }

        // For other errors, try to redirect to original URL
        const url = new URL(request.url).searchParams.get('url');
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            return NextResponse.redirect(url, 307);
        }

        return generatePlaceholder();
    }
}

/**
 * Fetch remote image with browser-like headers
 */
async function fetchRemoteImage(url: string): Promise<Buffer> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': url,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch remote image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Fetch local image from filesystem
 */
async function fetchLocalImage(url: string): Promise<Buffer> {
    // Remove leading slash and construct path
    const imagePath = url.startsWith('/') ? url.slice(1) : url;
    const fullPath = path.join(process.cwd(), 'public', imagePath);

    try {
        // Try direct filesystem read first (fastest)
        return await fs.promises.readFile(fullPath);
    } catch {
        // Fallback: construct URL and fetch (for serverless environments)
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const fullUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        return fetchRemoteImage(fullUrl);
    }
}

/**
 * Generate SVG placeholder for missing images
 */
function generatePlaceholder(): NextResponse {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#F9F2E9"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#4A4A4A" text-anchor="middle" dominant-baseline="middle">
        Image not available
      </text>
    </svg>
  `;

    return new NextResponse(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=60',
        },
    });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
