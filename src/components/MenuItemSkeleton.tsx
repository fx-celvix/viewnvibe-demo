
'use client';

import React from 'react';

export function MenuItemSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex animate-pulse space-x-4">
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-3 w-5/6 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
           <div className="h-4 w-1/3 rounded bg-gray-200 pt-2"></div>
        </div>
        <div className="h-24 w-24 rounded-md bg-gray-200"></div>
      </div>
       <div className="shimmer absolute inset-0"></div>
    </div>
  );
};
