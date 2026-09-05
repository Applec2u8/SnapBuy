import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { ChatWindow } from '../Chat/components/ChatWindow';
import { Store, MessageCircle, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserMessages = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Dispatch event to hide GlobalChatWidget FAB when a chat is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-global-chat', { detail: !selectedConversation }));
    return () => {
      // When leaving this page, ensure FAB is shown again
      window.dispatchEvent(new CustomEvent('toggle-global-chat', { detail: true }));
    };
  }, [selectedConversation]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConversations(true);

    const subscription = supabase
      .channel('sidebar-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchConversations = async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      const convs = data || [];
      if (convs.length > 0) {
        const shopIds = [...new Set(convs.map(c => c.shop_id))];
        const { data: shops } = await supabase
          .from('shops')
          .select('*')
          .in('id', shopIds);
          
        const shopMap: Record<string, any> = {};
        if (shops) {
          shops.forEach(s => { shopMap[s.id] = s; });
        }

        // Fetch unread messages for these conversations
        const { data: unreadData } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convs.map(c => c.id))
          .neq('sender_id', user?.id)
          .eq('is_read', false)
          .eq('is_deleted', false);

        const unreadMap: Record<string, number> = {};
        if (unreadData) {
          unreadData.forEach(m => {
            unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
          });
        }
        
        convs.forEach(c => {
          c.shop = shopMap[c.shop_id] || { name: 'Unknown Shop' };
          c.unreadCount = unreadMap[c.id] || 0;
        });
      }
      
      setConversations(convs);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('messages_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] sm:h-[calc(100vh-120px)] sm:max-w-7xl sm:mx-auto sm:my-6 sm:rounded-[32px] sm:shadow-2xl sm:border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A0C10] overflow-hidden flex relative">
      
      {/* Sidebar: Conversation List */}
      <div className={`
        ${isMobileView && selectedConversation ? 'hidden' : 'flex'} 
        w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/5 flex-col flex-shrink-0 bg-white dark:bg-[#0A0C10] z-10
      `}>
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {isMobileView && (
              <Link to="/" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
              </Link>
            )}
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{t('messages_title')}</h2>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-0.5">
                {conversations.length} {conversations.length === 1 ? 'Shop' : 'Shops'}
              </p>
            </div>
          </div>
          
          {useAuthStore.getState().shop && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <div className="flex-1 py-1.5 text-xs font-bold rounded-lg text-center bg-white dark:bg-[#0A0C10] shadow-sm text-primary-500 cursor-default">
                {t('messages_buying')}
              </div>
              <Link 
                to="/vendor/dashboard#messages"
                className="flex-1 py-1.5 text-xs font-bold rounded-lg text-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {t('messages_selling')}
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4 opacity-50">
               <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500 mb-2">
                 <MessageCircle size={32} />
               </div>
               <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('messages_no_messages')}</p>
               <p className="text-xs font-medium text-slate-500">{t('messages_no_messages_desc')}</p>
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => {
                const isActive = selectedConversation?.id === conv.id;
                const shopData = conv.shop;
                const displayName = shopData?.name || 'Shop';
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 mx-2 rounded-2xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group ${isActive && !isMobileView ? 'bg-primary-500/5 dark:bg-primary-500/10 shadow-sm border border-primary-500/10' : 'border border-transparent'}`}
                    style={{ width: 'calc(100% - 16px)' }}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors overflow-hidden ${isActive ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-500 border border-primary-500/20 group-hover:bg-primary-500/20'}`}>
                        {shopData?.logo_url ? <img src={shopData.logo_url} className="w-full h-full object-cover" /> : <Store size={20} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                         <p className={`text-sm font-black uppercase tracking-tight truncate ${isActive && !isMobileView ? 'text-primary-500' : 'text-slate-900 dark:text-white'}`}>{displayName}</p>
                         <div className="flex items-center gap-1.5">
                           {conv.unreadCount > 0 && (
                             <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                           )}
                           <span className="text-[10px] font-bold text-slate-400">{format(new Date(conv.last_message_at), 'HH:mm')}</span>
                         </div>
                      </div>
                      <p className={`text-xs font-medium truncate ${conv.unreadCount > 0 ? 'text-slate-950 dark:text-white font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.last_message || t('messages_start_chat')}
                      </p>
                    </div>
                    <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-primary-500 translate-x-1' : 'text-slate-300 group-hover:translate-x-1'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Chat Window */}
      <div className={`
        ${isMobileView && !selectedConversation ? 'hidden' : 'flex'} 
        flex-1 flex-col bg-slate-50/50 dark:bg-black/10 absolute md:relative inset-0 md:inset-auto h-full w-full z-20
      `}>
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {isMobileView && (
              <div className="px-4 py-3 bg-white dark:bg-[#0F1116] border-b border-slate-200 dark:border-white/5 flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 overflow-hidden">
                    {selectedConversation.shop?.logo_url ? <img src={selectedConversation.shop.logo_url} className="w-full h-full object-cover" /> : <Store size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                      {selectedConversation.shop?.name || 'Shop'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ChatWindow 
                conversationId={selectedConversation.id}
                shopId={selectedConversation.shop_id} 
                shopName={selectedConversation.shop?.name}
                onClose={() => setSelectedConversation(null)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-32 h-32 bg-primary-500/5 rounded-[40px] flex items-center justify-center text-primary-500 border border-primary-500/10 shadow-inner"
             >
                <MessageCircle size={64} className="opacity-80" />
             </motion.div>
             <div className="max-w-sm space-y-3">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">{t('messages_select_conv')}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{t('messages_select_conv_desc')}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessages;
