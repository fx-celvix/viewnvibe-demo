
'use client';

export const MarketingPageSkeleton = () => {
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl animate-pulse">
            <div className="relative w-full h-64 rounded-xl bg-gray-200 mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                    <div className="border-b pb-4">
                        <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
                        </div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-48 bg-gray-200 rounded-md w-full"></div>
                        </div>
                         <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-24 bg-gray-200 rounded-md w-full"></div>
                        </div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full mt-4"></div>
                </div>

                 <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                    <div className="h-48 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="space-y-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};
