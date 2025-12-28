
'use client';

import { X, ArrowLeft, Mail, Instagram, Facebook, Twitter, Pencil, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('./FeedbackModal').then(mod => mod.FeedbackModal));

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.437-9.887-9.888-9.888-5.451 0-9.887 4.436-9.888 9.888.001 2.228.651 4.385 1.886 6.245l-1.254 4.585 4.703-1.233zM9.351 8.298c-.144-.346-.3-.356-.44-.362-.14-.006-.3-.008-.46-.008-.16 0-.41.06-.62.311-.21.25-.85.83-.85 2.02.001 1.191.87 2.341 1 2.491.13.15 1.76 2.67 4.25 3.73.59.25 1.05.4 1.41.52.59.21 1.12.18 1.54.11.46-.08.85-.36 1.03-.72.18-.36.18-.68.12-.76-.06-.08-.21-.13-.44-.24-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.24-.59.75-.73.9-.14.15-.28.17-.51.05-.23-.12-.99-.36-1.89-1.16-.7-.6-1.17-1.34-1.3-1.56-.13-.22-.02-.34.09-.44.1-.1.22-.26.33-.39.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.34z" />
  </svg>
);


const SideBarContent = ({ onFeedbackClick }) => (
  <>
    <div className="mt-8 mb-4">
      <div className="flex justify-around items-center">
        <a href="tel:+917909067655" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
          <PhoneIcon className="h-6 w-6" />
          <span className="text-xs">Call us</span>
        </a>
        <a href="mailto:food.biryanicorner@gmail.com" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
          <Mail className="h-6 w-6" />
          <span className="text-xs">Email</span>
        </a>
        <a href="https://wa.me/917909067655?text=Hi" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
          <WhatsAppIcon className="h-6 w-6" />
          <span className="text-xs">WhatsApp</span>
        </a>
      </div>
    </div>

    <div className="bg-muted p-4 rounded-lg">
      <h3 className="text-sm mb-3 font-semibold text-center">Opening Hours</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="w-20">Monday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Tuesday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Wednesday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Thursday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Friday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Saturday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Sunday</span>
          <span>11:00 AM – 10:45 PM</span>
        </div>
      </div>
    </div>
    <div className="px-4 py-3 border-t flex items-center justify-between mt-auto">
      <div>
        <p className="text-sm font-semibold mb-1">Follow us on</p>
        <div className="flex items-center space-x-3">
          <Link href="https://www.instagram.com/mybiryanicorner/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
          <Link href="https://www.facebook.com/profile.php?id=61579388701613" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></Link>
          <Link href="https://x.com/mybiryanicorner" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
          <Link href="https://www.linkedin.com/in/mybiryanicorner" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
        </div>
      </div>
      <button onClick={onFeedbackClick} className="flex items-center space-x-2 text-sm font-semibold px-3 py-2 border rounded-lg hover:bg-accent">
        <Pencil className="h-4 w-4" />
        <span>Feedback</span>
      </button>
    </div>
  </>
)


export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  return (
    <>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      ></div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-background text-foreground shadow-lg z-50 transform transition-transform ease-in-out duration-300 md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex-grow p-4 pt-6 overflow-y-auto flex flex-col">
          <button onClick={onClose} className="absolute top-6 right-6 z-10">
            <X className="h-6 w-6" />
          </button>

          <div className="flex items-start mb-4">
            <a href="/" className="flex items-start">
              <ArrowLeft className="h-8 w-8 mr-4 mt-2" />
              <div className="flex flex-col">
                <span className="font-bold text-2xl">View N Vibe,</span>
                <span className="font-bold text-2xl">McLeod Ganj</span>
              </div>
            </a>
          </div>
          <SideBarContent onFeedbackClick={() => setIsFeedbackModalOpen(true)} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-80 border-r fixed top-0 left-0 h-full bg-background">
        <div className="flex-grow p-6 overflow-y-auto flex flex-col" style={{ paddingTop: '30px' }}>
          <div className="flex items-start mb-4">
            <a href="/" className="flex items-start">
              <ArrowLeft className="h-8 w-8 mr-4 mt-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-2xl">View N Vibe,</span>
                <span className="font-bold text-2xl">McLeod Ganj</span>
              </div>
            </a>
          </div>
          <div className="mt-8 mb-4">
            <div className="flex justify-around items-center">
              <a href="tel:+917909067655" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
                <PhoneIcon className="h-6 w-6" />
                <span className="text-xs">Call us</span>
              </a>
              <a href="mailto:food.biryanicorner@gmail.com" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
                <Mail className="h-6 w-6" />
                <span className="text-xs">Email</span>
              </a>
              <a href="https://wa.me/917909067655?text=Hi" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 text-center p-2 rounded-lg hover:bg-accent transition-colors">
                <WhatsAppIcon className="h-6 w-6" />
                <span className="text-xs">WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm mb-3 font-semibold text-center">Opening Hours</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="w-20">Monday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Tuesday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Wednesday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Thursday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Friday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Saturday</span><span>11:00 AM – 10:45 PM</span></div>
              <div className="flex justify-between"><span className="w-20">Sunday</span><span>11:00 AM – 10:45 PM</span></div>
            </div>
          </div>
        </div>
        <div className="px-6" style={{ paddingBottom: '15px' }}>
          <div className="mb-4">
            <button onClick={() => setIsFeedbackModalOpen(true)} className="flex items-center space-x-2 text-sm font-semibold px-3 py-2 border rounded-lg hover:bg-accent">
              <Pencil className="h-4 w-4" />
              <span>Feedback</span>
            </button>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-1">Follow us on</p>
            <div className="flex items-center space-x-3">
              <Link href="https://www.instagram.com/mybiryanicorner/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
              <Link href="https://www.facebook.com/profile.php?id=61579388701613" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></Link>
              <Link href="https://x.com/mybiryanicorner" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
              <Link href="https://www.linkedin.com/in/mybiryanicorner" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
