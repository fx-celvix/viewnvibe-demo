
'use client';

const SkeletonCard = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
);

const SkeletonChart = ({ className = 'h-[400px]' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-full bg-gray-200 rounded"></div>
    </div>
);

export const AnalyticsPageSkeleton = () => {
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <SkeletonChart />
                <SkeletonChart />
                 <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border h-[188px]">
                         <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                         <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm border h-[188px]">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                         <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <SkeletonChart />
                <SkeletonChart />
                <SkeletonChart />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SkeletonChart />
                <SkeletonChart />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border h-[500px]">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-full bg-gray-200 rounded"></div>
            </div>
        </main>
    );
};
