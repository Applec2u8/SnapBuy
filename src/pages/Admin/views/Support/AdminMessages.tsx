import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { ChatWindow } from '../../../Chat/components/ChatWindow';
import { Store, MessageCircle, ChevronRight, Loader2, ArrowLeft, Headphones } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const SUPPORT_SHOP_ID = '00000000-0000-0000-0000-000000000000';

export const AdminMessages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConversations(true);

    const subscription = supabase
      .channel('admin-support-messages')
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
      
      // Fetch all conversations where shop_id is the Support Shop
      const { data: convsData, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('shop_id', SUPPORT_SHOP_ID)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      const convs = convsData || [];
      if (convs.length > 0) {
        // Fetch profiles separately to avoid relation errors
        const userIds = [...new Set(convs.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        const profileMap: Record<string, any> = {};
        if (profiles) {
          profiles.forEach(p => { profileMap[p.id] = p; });
        }
        // Fetch unread messages for these conversations
        // An unread message for Admin is when sender is NOT the admin (sender_id != current user.id)
        // Actually, since Admin replies using their own user_id, unread means sender_id != user.id
        const { data: unreadData, error: unreadError } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convs.map(c => c.id))
          .neq('sender_id', user?.id)
          .eq('is_read', false)
          .eq('is_deleted', false);

        if (unreadError) {
           console.error('Error fetching unread:', unreadError);
        }

        const unreadMap: Record<string, number> = {};
        if (unreadData) {
          unreadData.forEach(m => {
            unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
          });
        }
        
        convs.forEach(c => {
          c.unreadCount = unreadMap[c.id] || 0;
          // Format profile name
          c.userProfile = profileMap[c.user_id] || { full_name: 'Customer' };
        });
      }
      
      setConversations(convs);
    } catch (error: any) {
      console.error('Error fetching support conversations:', error);
      import('sonner').then(m => m.toast.error('Error fetching chats: ' + error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Support Chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A0C10] overflow-hidden flex relative">
      
      {/* Sidebar: Conversation List */}
      <div className={`
        ${isMobileView && selectedConversation ? 'hidden' : 'flex'} 
        w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/5 flex-col flex-shrink-0 bg-white dark:bg-[#0A0C10] z-10
      `}>
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Support Chats</h2>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-0.5">
                {conversations.length} Active {conversations.length === 1 ? 'Chat' : 'Chats'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4 opacity-50">
               <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500 mb-2">
                 <MessageCircle size={32} />
               </div>
               <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">No pending chats</p>
               <p className="text-xs font-medium text-slate-500">When users contact support, their messages will appear here.</p>
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => {
                const isActive = selectedConversation?.id === conv.id;
                const profileData = conv.userProfile;
                const displayName = profileData?.full_name || 'Customer';
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 mx-2 rounded-2xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group ${isActive && !isMobileView ? 'bg-primary-500/5 dark:bg-primary-500/10 shadow-sm border border-primary-500/10' : 'border border-transparent'}`}
                    style={{ width: 'calc(100% - 16px)' }}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors overflow-hidden ${isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                        {profileData?.avatar_url ? <img src={profileData.avatar_url} className="w-full h-full object-cover" /> : <Store size={20} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                         <p className={`text-sm font-black uppercase tracking-tight truncate ${isActive && !isMobileView ? 'text-primary-500' : 'text-slate-900 dark:text-white'}`}>{displayName}</p>
                         <div className="flex items-center gap-1.5">
                           {conv.unreadCount > 0 && (
                             <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                           )}
                           <span className="text-[10px] font-bold text-slate-400">{conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}</span>
                         </div>
                      </div>
                      <p className={`text-xs font-medium truncate ${conv.unreadCount > 0 ? 'text-slate-950 dark:text-white font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.last_message || 'No messages...'}
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
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                    {selectedConversation.userProfile?.avatar_url ? <img src={selectedConversation.userProfile.avatar_url} className="w-full h-full object-cover" /> : <Store size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                      {selectedConversation.userProfile?.full_name || 'Customer'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ChatWindow 
                conversationId={selectedConversation.id}
                shopId={SUPPORT_SHOP_ID} 
                shopName={selectedConversation.userProfile?.full_name || 'Customer'}
                customerUserId={selectedConversation.user_id}
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
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">Support Inbox</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Select a conversation to reply to customer inquiries.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
