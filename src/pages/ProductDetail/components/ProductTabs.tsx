import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Calendar, Star, Check, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductTabsProps {
  activeTab: 'description' | 'reviews';
  setActiveTab: (tab: 'description' | 'reviews') => void;
  product: any;
  reviews: any[];
  isDescriptionExpanded: boolean;
  setIsDescriptionExpanded: (expanded: boolean) => void;
  setShowReviewModal: (show: boolean) => void;
  setSelectedReviewImages: (images: string[]) => void;
  setActiveReviewImageIndex: (index: number) => void;
}

export const ProductTabs = ({
  activeTab,
  setActiveTab,
  product,
  reviews,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  setShowReviewModal,
  setSelectedReviewImages,
  setActiveReviewImageIndex
}: ProductTabsProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-6 sm:mt-16 space-y-8 sm:space-y-10">
      <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'description' ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          {t('product_description')}
          {activeTab === 'description' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-600" 
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'reviews' ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          {t('reviews')} ({reviews.length})
          {activeTab === 'reviews' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-600" 
            />
          )}
        </button>
      </div>

      {activeTab === 'description' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full" />
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Detailed Intel</h2>
            </div>

            <div className={`relative bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-700 overflow-hidden ${!isDescriptionExpanded ? 'max-h-[300px]' : 'max-h-[5000px] shadow-xl'}`}>
              <div className={`p-5 sm:p-12 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium text-xs sm:text-base ${!isDescriptionExpanded ? 'pb-20' : 'pb-16'}`}>
                {product.description || "No tactical data available for this asset."}
              </div>

              {product.description?.length > 500 && (
                <div className={`absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end transition-all duration-500 ${!isDescriptionExpanded ? 'h-48 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent' : 'h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent'}`}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDescriptionExpanded(!isDescriptionExpanded);
                    }}
                    className="mb-6 px-8 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
                  >
                    {isDescriptionExpanded ? (
                      <>Retract <ChevronUp size={14} className="group-hover:-translate-y-1 transition-transform" /></>
                    ) : (
                      <>Expand <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 sm:space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Rating Summary */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-8">
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sm:space-y-6">
                <div className="space-y-1">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500">Asset Rating</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{product.average_rating || '5.0'}</span>
                    <div className="pb-1">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} Commends</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4 group">
                      <span className="text-[11px] font-black w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{star}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: star === 5 ? '95%' : '0%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 w-8">{star === 5 ? '95%' : '0%'}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg"><Check size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Verified Asset</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-0.5">Guaranteed Secure</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-0.98 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <MessageSquare size={16} /> Submit Commendation
              </button>
            </div>

            {/* Review List */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              {reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <motion.div 
                      layout
                      key={review.id} 
                      className="p-6 sm:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden border border-white dark:border-slate-700 shadow-lg">
                            {review.profiles?.avatar_url ? (
                              <img src={review.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-sm font-black text-primary-500">{(review.profiles?.full_name || 'U')[0]}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-sm dark:text-white uppercase tracking-tight">{review.profiles?.full_name || 'Anonymous'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={10} className="text-primary-500" /> {new Date(review.created_at).toLocaleDateString()}
                              </p>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">"{review.comment}"</p>

                      {review.images?.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {review.images.map((img: string, idx: number) => {
                            const isVideo = img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || img.includes('video');
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedReviewImages(review.images);
                                  setActiveReviewImageIndex(idx);
                                }}
                                className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 group/img relative cursor-pointer shadow-md hover:shadow-xl transition-all"
                              >
                                {isVideo ? (
                                  <div className="w-full h-full relative">
                                    <video src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <div className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                                        <Play size={12} fill="currentColor" className="ml-0.5" />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-125" alt="" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-6 bg-white dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-xl relative">
                    <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-10 animate-pulse" />
                    <MessageSquare size={40} className="text-slate-200 relative z-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">Radio Silence</p>
                    <p className="text-[10px] font-bold text-slate-500">Be the first to provide tactical feedback on this asset.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
