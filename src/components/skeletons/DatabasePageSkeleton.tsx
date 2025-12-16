'use client';

import { Menu, LogOut, Search, Download } from 'lucide-react';
import Image from 'next/image';

const SkeletonRow = () => (
    <tr className="bg-white border-b">
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="px-6 py-4 text-center">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </td>
        <td className="px-6 py-4 text-right">
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
        </td>
    </tr>
);

export const DatabasePageSkeleton = () => {
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

            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                             <div className="h-10 bg-gray-200 rounded-md w-full"></div>
                        </div>
                         <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3"><div className="h-4 bg-gray-300 rounded w-24"></div></th>
                                    <th scope="col" className="px-6 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></th>
                                    <th scope="col" className="px-6 py-3"><div className="h-4 bg-gray-300 rounded w-16"></div></th>
                                    <th scope="col" className="px-6 py-3 text-center"><div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div></th>
                                    <th scope="col" className="px-6 py-3 text-right"><div className="h-4 bg-gray-300 rounded w-16 ml-auto"></div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
