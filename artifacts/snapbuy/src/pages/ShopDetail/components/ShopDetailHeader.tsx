import { ChevronLeft, Share2, MapPin, Bell, ShieldCheck, Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/useAuthStore';

interface ShopDetailHeaderProps {
  shop: any;
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
}

export const ShopDetailHeader = ({
  shop,
  isFollowing,
  onFollow,
  onMessage
}: ShopDetailHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isOwner = user?.id === shop?.owner_id;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="relative h-[420px] sm:h-[500px] w-full overflow-hidden text-left bg-slate-900">
      {/* Background Banner with Improved Overlay */}
      <div className="absolute inset-0">
        {shop?.banner_url ? (
          <img src={shop.banner_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 via-slate-900 to-slate-950" />
        )}
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-0" />
      </div>

      {/* Top Navigation - Glassmorphism */}
      <div className="absolute top-4 sm:top-10 left-4 sm:left-10 z-30 flex items-center justify-between right-4 sm:right-10">
        <button 
          onClick={() => navigate(-1)}
          className="group p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-2xl"
        >
          <ChevronLeft size={22} className="transition-transform group-hover:-translate-x-1" />
        </button>
        <button 
          onClick={handleShare}
          className="group p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-2xl"
        >
          <Share2 size={22} className="transition-transform group-hover:scale-110" />
        </button>
      </div>

      {/* Shop Identity Section - Re-balanced */}
      <div className="absolute bottom-0 left-0 w-full z-20 pb-8 sm:pb-12 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            {/* Logo with Signature Border */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-primary-400 rounded-[32px] sm:rounded-[44px] blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-[28px] sm:rounded-[40px] bg-slate-900/40 backdrop-blur-md p-1.5 border border-white/20 shadow-2xl">
                <div className="w-full h-full rounded-[22px] sm:rounded-[34px] overflow-hidden bg-slate-800 flex items-center justify-center border border-white/5">
                  {shop?.logo_url ? (
                    <img src={shop.logo_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                  ) : (
                    <span className="text-4xl sm:text-7xl font-black text-primary-500">{shop?.name?.[0]}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white border-2 sm:border-4 border-slate-950 shadow-xl z-10">
                 <ShieldCheck size={18} className="sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Info Block - Refined Typography */}
            <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
              <div className="space-y-1 sm:space-y-2">
                 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 text-primary-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                      Official Store
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 rounded-md">
                       <Star size={10} className="fill-yellow-500 text-yellow-500" />
                       <span className="text-[9px] font-black text-yellow-500">4.9</span>
                    </div>
                 </div>
                 <h1 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.1] drop-shadow-xl">
                   {shop?.name}
                 </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                 <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={14} className="text-primary-500" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{shop?.location || 'Bangkok, Thailand'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-white/60">
                    <Bell size={14} className="text-primary-500" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest uppercase">Active 2h ago</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Hub - Flex Row for symmetry */}
          <div className="flex items-center gap-3 w-full sm:w-fit sm:min-w-[400px]">
             {!isOwner && (
               <button 
                 onClick={onMessage}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] sm:text-xs hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-xl"
               >
                 <MessageCircle size={18} />
                 <span className="hidden sm:inline">Message</span>
               </button>
             )}
             <button 
               onClick={onFollow}
               className={`flex-1 sm:min-w-[160px] flex items-center justify-center px-6 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] sm:text-xs transition-all active:scale-95 shadow-xl border-2 ${
                 isFollowing 
                 ? 'bg-transparent border-white/20 text-white hover:bg-white/10' 
                 : 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 hover:border-primary-600 shadow-primary-500/30'
               }`}
             >
               {isFollowing ? 'Following' : 'Follow Shop'}
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
