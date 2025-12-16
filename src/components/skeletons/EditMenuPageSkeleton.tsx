'use client';

import { Menu, LogOut, PlusCircle, Save } from 'lucide-react';

const SkeletonCategory = () => (
    <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
        </div>
        <div className="p-4 border-t space-y-4">
            <div className="p-4 border rounded-lg flex space-x-4 items-start bg-gray-50/50">
                <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="flex-grow space-y-3 w-full">
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
             <div className="p-4 border rounded-lg flex space-x-4 items-start bg-gray-50/50">
                <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="flex-grow space-y-3 w-full">
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    </div>
);


export const EditMenuPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                     <div className="flex items-center justify-between h-16">
                         <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-gray-200 h-8 w-8"></div>
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                             <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="h-8 bg-gray-300 rounded w-48"></div>
                    <div className="flex space-x-2 w-full sm:w-auto">
                        <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
                        <div className="h-10 bg-gray-300 rounded-lg w-24"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    <SkeletonCategory />
                    <SkeletonCategory />
                </div>
            </main>
        </div>
    );
};
