
import type { Metadata } from "next";
import { Belleza, Alegreya } from "next/font/google";

import "./globals.css";
import { MenuProvider } from '@/context/MenuContext';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const OrderStatusNotifier = dynamic(() => import('@/components/OrderStatusNotifier').then(mod => mod.OrderStatusNotifier));

const belleza = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-belleza",
  display: 'swap',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "View N Vibe Café | Pure Vegetarian Rooftop Café in McLeod Ganj",
  description: "View N Vibe Café is a pure vegetarian rooftop restaurant in McLeod Ganj, Dharamshala offering delicious food, peaceful ambiance, and stunning mountain views.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth no-scrollbar">
      <body className={`${belleza.variable} ${alegreya.variable}`}>
        <MenuProvider>
          {children}
          <OrderStatusNotifier />
        </MenuProvider>

      </body>
    </html>
  );
}
