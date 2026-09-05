import { useState } from 'react';
import { useShopDetail } from './hooks/useShopDetail';
import { ShopDetailHeader } from './components/ShopDetailHeader';
import { ShopStats } from './components/ShopStats';
import { ShopProductsGrid } from './components/ShopProductsGrid';
import { ShopContactSection } from './components/ShopContactSection';
import { ChatModal } from '../Chat/components/ChatModal';

const ShopDetail = () => {
  const {
    shop,
    products,
    loading,
    loadingMore,
    isFollowing,
    followersCount,
    totalItems,
    hasMore,
    observerTarget,
    handleFollow
  } = useShopDetail();

  const [isChatOpen, setIsChatOpen] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-500/10 rounded-full blur-sm" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Entering Storefront</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative -mt-2 -mx-4 pb-32 animate-fade-in overflow-x-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] -right-64 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] -left-64 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <ShopDetailHeader 
        shop={shop}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onMessage={() => setIsChatOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10 mt-12 sm:mt-16 space-y-16 sm:space-y-32">
        <ShopStats 
          followersCount={followersCount}
          viewCount={shop?.view_count || 0}
          productsCount={totalItems}
        />

        <ShopContactSection />

        <ShopProductsGrid 
          products={products}
          loadingMore={loadingMore}
          hasMore={hasMore}
          observerTarget={observerTarget}
        />
      </div>

      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        shopId={shop?.id}
        shopName={shop?.name}
      />
    </div>
  );
};

export default ShopDetail;
