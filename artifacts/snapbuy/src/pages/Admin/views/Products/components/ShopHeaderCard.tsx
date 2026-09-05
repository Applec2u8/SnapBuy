import React from 'react';
import { ArrowLeft, MapPin, Star, Package } from 'lucide-react';

interface ShopHeaderCardProps {
  shop: {
    id: string;
    name?: string;
    logo_url?: string;
    image_url?: string;
    description?: string;
    address?: string;
    rating?: number;
  };
  onBack: () => void;
}

export const ShopHeaderCard: React.FC<ShopHeaderCardProps> = ({ shop, onBack }) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-md">
          <img 
            src={shop.logo_url || shop.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name || 'Shop')}&background=random`} 
            alt={shop.name} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{shop.name || 'Unnamed Shop'}</h2>
            {shop.rating && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Star size={12} className="text-amber-500" fill="currentColor" />
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400">{shop.rating}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
            {shop.description || 'No description provided for this shop.'}
          </p>

          <div className="flex flex-wrap gap-4 text-[10px]">
            {shop.address && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin size={12} />
                <span>{shop.address}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-primary-500">
              <Package size={12} />
              <span className="font-black">ร้านค้า ID: {shop.id}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 hover:border-primary-500/30 transition-all flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
};
