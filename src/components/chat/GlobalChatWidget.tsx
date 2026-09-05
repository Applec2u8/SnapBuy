import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Headphones, Inbox } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ChatConversationList } from './ChatConversationList';
import { ChatWindow } from '../../pages/Chat/components/ChatWindow';

const SUPPORT_SHOP_ID = '00000000-0000-0000-0000-000000000000';

type DrawerView = 'list' | 'support' | 'chat';

export const GlobalChatWidget = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isVendorPage = location.pathname.startsWith('/vendor');

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [view, setView] = useState<DrawerView>('list');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isHiddenByEvent, setIsHiddenByEvent] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: any) => setIsHiddenByEvent(!e.detail);
    const openSupportHandler = () => openDrawer('support');
    window.addEventListener('toggle-global-chat', handler);
    window.addEventListener('open-support-chat', openSupportHandler);
    
    return () => {
      setMounted(false);
      window.removeEventListener('toggle-global-chat', handler);
      window.removeEventListener('open-support-chat', openSupportHandler);
    };
  }, []);

  const openDrawer = (v: DrawerView) => {
    setView(v);
    setIsOpen(true);
    setSpeedDialOpen(false);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setView('list');
      setSelectedConversation(null);
    }, 300); // wait for close animation
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    setView('chat');
  };

  const handleOpenSupport = () => {
    setSelectedConversation(null);
    setView('support');
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setView('list');
  };

  if (!mounted || isAdminPage || isVendorPage) return null;

  const drawerTitle =
    view === 'support' ? 'Customer Support'
    : view === 'chat' ? (selectedConversation?.shop?.name || 'Chat')
    : 'Messages';

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/30 backdrop-blur-[2px]"
          onClick={closeDrawer}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-[86] flex flex-col bg-white dark:bg-[#0A0C10] shadow-2xl border-l border-slate-200 dark:border-white/5
          transition-transform duration-300 ease-in-out
          w-[85vw] sm:w-[400px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F1116] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg ${view === 'support' ? 'bg-primary-500 shadow-primary-500/30' : 'bg-slate-700 dark:bg-slate-600'}`}>
              {view === 'support' ? <Headphones size={16} /> : <MessageCircle size={16} />}
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{drawerTitle}</h2>
              {view === 'support' && (
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live Support</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'list' && (
            <ChatConversationList
              onSelectConversation={handleSelectConversation}
              onOpenSupport={handleOpenSupport}
            />
          )}
          {view === 'support' && (
            <ChatWindow
              shopId={SUPPORT_SHOP_ID}
              shopName="Customer Support"
              onClose={closeDrawer}
              onBack={user ? handleBackToList : undefined}
            />
          )}
          {view === 'chat' && selectedConversation && (
            <ChatWindow
              conversationId={selectedConversation.id}
              shopId={selectedConversation.shop_id}
              shopName={selectedConversation.shop?.name}
              onClose={closeDrawer}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>

      {/* Speed Dial FAB */}
      <div className={`fixed bottom-6 right-6 z-[87] flex flex-col items-end gap-3 transition-all duration-300 ${isOpen || isHiddenByEvent ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}>
        {/* Speed dial options */}
        <div className={`flex flex-col items-end gap-2 transition-all duration-200 ${speedDialOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={() => openDrawer('support')}
            className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 group"
          >
            <Headphones size={15} className="text-primary-500 group-hover:text-white transition-colors" />
            Customer Support
          </button>
          <button
            onClick={() => openDrawer('list')}
            className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 group"
          >
            <Inbox size={15} className="text-primary-500 group-hover:text-white transition-colors" />
            Messages
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setSpeedDialOpen(prev => !prev)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
            ${speedDialOpen
              ? 'bg-slate-700 dark:bg-slate-600 rotate-45 shadow-slate-500/30'
              : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/40'
            }
          `}
        >
          {speedDialOpen
            ? <X size={24} className="text-white" />
            : <MessageCircle size={24} className="text-white" />
          }
        </button>
      </div>
    </>,
    document.body
  );
};
