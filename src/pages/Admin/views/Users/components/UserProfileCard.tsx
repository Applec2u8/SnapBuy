import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Calendar, Shield, LayoutGrid, ChevronDown, Mail, User } from 'lucide-react';
import type { UserProfile, ShopRecord } from './types';

interface UserProfileCardProps {
  user: UserProfile;
  userShops: ShopRecord[];
  selectedShopId?: string;
  onSelectShop?: (shopId: string) => void;
  isShopDropdownOpen?: boolean;
  setIsShopDropdownOpen?: (open: boolean) => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  userShops,
  selectedShopId = 'all',
  onSelectShop,
  isShopDropdownOpen = false,
  setIsShopDropdownOpen,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-[5rem]" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-4">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {user.full_name}
        </h3>

        {/* Role badges */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
            user.role === 'admin'
              ? 'bg-purple-500/10 text-purple-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            {user.role || 'user'}
          </span>
          {(user.role === 'vendor' || userShops.length > 0) && (
            <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
              <Store size={8} /> {t('shop')}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {t('admin_joined')}
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {new Date(user.updated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <Mail size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {t('admin_email')}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 truncate break-all">
                {user.email || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <User size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {t('admin_role')}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
                {user.role || 'customer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <Shield size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                User ID
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 font-mono break-all">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Shop Selector Dropdown */}
        {userShops.length > 0 && (
          <div className="w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-left">
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <Store size={16} className="text-primary-500" />
              {t('shop')}
            </h4>
            <div className="relative z-40">
              <button
                onClick={(e) => { e.stopPropagation(); setIsShopDropdownOpen?.(!isShopDropdownOpen); }}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 flex items-center justify-between hover:border-primary-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedShopId === 'all' ? (
                    <LayoutGrid size={16} className="text-primary-500" />
                  ) : (
                    userShops.find(s => s.id === selectedShopId)?.logo_url || userShops.find(s => s.id === selectedShopId)?.image_url ? (
                      <img src={userShops.find(s => s.id === selectedShopId)?.logo_url || userShops.find(s => s.id === selectedShopId)?.image_url} alt="" className="w-6 h-6 rounded-lg object-cover" />
                    ) : (
                      <Store size={16} className="text-primary-500" />
                    )
                  )}
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {selectedShopId === 'all' ? t('admin_all_shops') : (userShops.find(s => s.id === selectedShopId)?.name || 'Unnamed Shop')}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              
                {isShopDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[60] overflow-hidden max-h-60 overflow-y-auto no-scrollbar">
                    <button
                      onClick={() => { onSelectShop?.('all'); setIsShopDropdownOpen?.(false); }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedShopId === 'all' ? 'bg-primary-500/5 text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <LayoutGrid size={16} className={selectedShopId === 'all' ? 'text-primary-500' : 'text-slate-400'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('admin_all_shops')}</span>
                    </button>
                    {userShops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => { onSelectShop?.(shop.id); setIsShopDropdownOpen?.(false); }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-50 dark:border-slate-800/50 ${selectedShopId === shop.id ? 'bg-primary-500/5 text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {shop.logo_url || shop.image_url ? (
                          <img src={shop.logo_url || shop.image_url} alt="" className="w-6 h-6 rounded-lg object-cover bg-white" />
                        ) : (
                          <Store size={16} className={selectedShopId === shop.id ? 'text-primary-500' : 'text-slate-400'} />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{shop.name || 'Unnamed Shop'}</span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
