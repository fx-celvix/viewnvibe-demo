'use client';

import { useRouter } from 'next/navigation';
import { TableBookingModal } from '@/components/TableBookingModal';
import { useEffect, useState } from 'react';

export default function TableBookingPage() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-senoa-cream">
            <TableBookingModal isOpen={isOpen} onClose={handleClose} />
        </div>
    );
}
