
'use client';

import { X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
}

export function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    title, 
    message,
    confirmText = 'Confirm', 
    cancelText = 'Cancel' 
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[99] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4">
                    <p className="text-sm">{message}</p>
                </div>
                <div className="p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
                    {cancelText && (
                         <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100">
                            {cancelText}
                         </button>
                    )}
                    <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold rounded-md bg-senoa-green text-white hover:bg-senoa-green-dark">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

    