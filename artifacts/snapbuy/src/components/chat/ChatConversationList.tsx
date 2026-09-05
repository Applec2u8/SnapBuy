import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Store, MessageCircle, ChevronRight, Loader2, Headphones } from 'lucide-react';
import { format } from 'date-fns';

const SUPPORT_SHOP_ID = '00000000-0000-0000-0000-000000000000';

interface ConversationListProps {
  onSelectConversation: (conv: any) => void;
  onOpenSupport: () => void;
}

export const ChatConversationList = ({ onSelectConversation, onOpenSupport }: ConversationListProps) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const subscription = supabase
      .channel('widget-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .neq('shop_id', SUPPORT_SHOP_ID) // exclude support chat from list (has its own button)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const convs = data || [];
      if (convs.length > 0) {
        const shopIds = [...new Set(convs.map(c => c.shop_id))];
        const { data: shops } = await supabase
          .from('shops')
          .select('id, name, logo_url')
          .in('id', shopIds);

        const shopMap: Record<string, any> = {};
        if (shops) shops.forEach(s => { shopMap[s.id] = s; });

        const { data: unreadData } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convs.map(c => c.id))
          .neq('sender_id', user?.id)
          .eq('is_read', false)
          .eq('is_deleted', false);

        const unreadMap: Record<string, number> = {};
        if (unreadData) {
          unreadData.forEach(m => { unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1; });
        }

        convs.forEach(c => {
          c.shop = shopMap[c.shop_id] || { name: 'Shop' };
          c.unreadCount = unreadMap[c.id] || 0;
        });
      }

      setConversations(convs);
    } catch (err) {
      console.error('Error fetching widget conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Support Chat Shortcut */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onOpenSupport}
          className="w-full flex items-center gap-3 p-3 bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/20 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary-500/30">
            <Headphones size={18} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-black uppercase tracking-tight text-primary-600 dark:text-primary-400">Customer Support</p>
            <p className="text-[10px] text-primary-500/70 font-medium">Chat with our support team</p>
          </div>
          <ChevronRight size={16} className="text-primary-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Divider */}
      {conversations.length > 0 && (
        <div className="mx-4 border-t border-slate-200 dark:border-white/5 mb-1" />
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-3">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 opacity-50">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500">
              <MessageCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">No shop chats</p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Contact a shop to start chatting.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-2">Shop Conversations</p>
            {conversations.map((conv) => {
              const shopData = conv.shop;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group border border-transparent hover:border-slate-200 dark:hover:border-white/5 mb-1"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-500 overflow-hidden flex-shrink-0">
                    {shopData?.logo_url
                      ? <img src={shopData.logo_url} className="w-full h-full object-cover" />
                      : <Store size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-black uppercase tracking-tight truncate text-slate-900 dark:text-white">
                        {shopData?.name || 'Shop'}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {conv.last_message_at && (
                          <span className="text-[9px] font-bold text-slate-400">
                            {format(new Date(conv.last_message_at), 'HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-[10px] truncate ${conv.unreadCount > 0 ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                      {conv.last_message || 'Start chatting...'}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
