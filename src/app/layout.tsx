
import type { Metadata } from "next";
import { Belleza, Alegreya } from "next/font/google";

import "./globals.css";
import { MenuProvider } from '@/context/MenuContext';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

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
  title: "BEANS Cafe",
  description: "A cozy neighborhood cafe serving great coffee, fresh bites, and relaxed vibes.",
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
          <FloatingWhatsApp />
        </MenuProvider>

      </body>
    </html>
  );
}
