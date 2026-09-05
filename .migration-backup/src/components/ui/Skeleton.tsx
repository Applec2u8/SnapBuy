import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md shimmer-container ${className}`} />
  );
};

export const SkeletonProductCard = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[4/5] rounded-2xl" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonProductDetail = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fade-in">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-4 w-20" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-4">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Skeleton className="h-12 w-32 mr-8" />
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
);

export const SkeletonVendorDashboard = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-black/20 flex text-left">
    <Skeleton className="w-64 h-screen hidden lg:block" />
    <div className="flex-1 flex flex-col min-w-0">
      <Skeleton className="h-16 w-full" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    </div>
  </div>
);

export const SkeletonHome = () => (
  <div className="space-y-10 pb-20 px-4 sm:px-0">
    <Skeleton className="h-[400px] sm:h-[600px] w-full rounded-3xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <SkeletonGrid count={6} />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-black/20 p-4 space-y-6">
    <div className="flex items-center gap-4 pt-8">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-2xl" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    ))}
  </div>
);
