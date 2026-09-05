import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, User, MessageCircle, ImagePlus, ChevronLeft, ChevronRight, Trash2, Pencil, CheckSquare, Square, Check, Ban, MoreVertical, ArrowLeft, MessageSquarePlus, ClipboardCopy } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuthStore } from '../../../store/useAuthStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const SUPPORT_SHOP_ID = '00000000-0000-0000-0000-000000000000';

interface ChatWindowProps {
  conversationId?: string;
  shopId?: string;
  shopName?: string;
  customerUserId?: string; // The buyer's user ID — used to align bubbles correctly regardless of which admin is viewing
  onClose: () => void;
  onBack?: () => void;
}

export const ChatWindow = ({ conversationId, shopId, shopName, customerUserId, onClose, onBack }: ChatWindowProps) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Input & Upload state
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: any } | null>(null);

  // Quick replies state
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<any>(null);

  const { messages, loading, sendMessage, deleteMessages, editMessage, uploadImage, getOrCreateConversation } = useChat(conversationId, shopId);

  useEffect(() => {
    if (shopId && !conversationId) {
      getOrCreateConversation(shopId);
    }
  }, [shopId, conversationId, getOrCreateConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Auto-show quick replies for support shop if no messages exist yet
    if (shopId === SUPPORT_SHOP_ID && messages.length === 0 && !loading) {
      setShowQuickReplies(true);
    } else if (shopId === SUPPORT_SHOP_ID && messages.length > 0 && showQuickReplies) {
      // Auto-hide when a message is sent or loaded
      setShowQuickReplies(false);
    }
  }, [messages, shopId, loading]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // ─── Image Handlers ────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (selectedImages.length + files.length > 10) {
      toast.error('You can only upload up to 10 images at a time.');
      return;
    }
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB.`);
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePreviewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
  };

  // ─── Send Handler ──────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImages.length === 0) return;
    setUploading(true);
    let finalImageUrl: string | undefined;
    if (selectedImages.length > 0) {
      const urls = await Promise.all(selectedImages.map(f => uploadImage(f)));
      const valid = urls.filter(Boolean) as string[];
      if (valid.length > 0) finalImageUrl = valid.join(',');
    }
    const content = inputValue;
    setInputValue('');
    setSelectedImages([]);
    setImagePreviews([]);
    await sendMessage(content, finalImageUrl);
    setUploading(false);
  };

  // ─── Lightbox Handlers ─────────────────────────────────────────
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };
  const closeLightbox = () => { setLightboxImages([]); setLightboxIndex(0); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % lightboxImages.length); };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex(p => p === 0 ? lightboxImages.length - 1 : p - 1); };

  // ─── Selection Handlers ────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Only count non-deleted own messages for selection
  const myMsgCount = messages.filter(m => m.sender_id === user?.id && !m.is_deleted).length;

  const toggleSelectAll = () => {
    const myMsgIds = messages.filter(m => m.sender_id === user?.id && !m.is_deleted).map(m => m.id);
    if (selectedIds.size === myMsgIds.length && myMsgIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(myMsgIds));
    }
  };

  const exitSelectionMode = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      await deleteMessages(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openMenuAt = (clientX: number, clientY: number, msg: any) => {
    const menuWidth = 180;
    const menuHeight = 150;
    const x = Math.max(16, Math.min(clientX, window.innerWidth - menuWidth - 16));
    const y = Math.max(16, Math.min(clientY, window.innerHeight - menuHeight - 16));
    setContextMenu({ x, y, msg });
  };

  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault();
    if (selectionMode) return;
    if (msg.sender_id !== user?.id) return;
    openMenuAt(e.clientX, e.clientY, msg);
  };

  const handleTouchStart = (e: React.TouchEvent, msg: any) => {
    if (selectionMode || msg.is_deleted || msg.sender_id !== user?.id) return;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    touchTimerRef.current = setTimeout(() => {
      openMenuAt(clientX, clientY, msg);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const startEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditValue(msg.content || '');
    setContextMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editValue.trim()) return;
    try {
      await editMessage(editingId, editValue);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteMessages([id]);
      setContextMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const copyMessageText = async (text: string, msgId: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 1800);
      toast.success('Copied message');
    } catch (err) {
      console.error('Copy failed', err);
      toast.error('Unable to copy message');
    }
  };

  const handleDoubleCopy = async (text: string, msgId: string) => {
    await copyMessageText(text, msgId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0C10] shadow-2xl overflow-hidden rounded-t-[32px] sm:rounded-3xl border border-slate-200 dark:border-white/5">
      
      {/* Header */}
      <div className="px-6 py-5 bg-white dark:bg-[#0F1116] border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
        {selectionMode ? (
          <>
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                {selectedIds.size === myMsgCount && myMsgCount > 0
                  ? <CheckSquare size={20} className="text-primary-500" />
                  : <Square size={20} className="text-slate-400" />}
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select messages'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                  Delete ({selectedIds.size})
                </button>
              )}
              <button onClick={exitSelectionMode} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors -ml-1">
                  <ArrowLeft size={20} className="text-slate-400" />
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{shopName || 'Chat'}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Messenger</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.some(m => m.sender_id === user?.id) && (
                <button
                  onClick={() => setSelectionMode(true)}
                  title="Select messages"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <CheckSquare size={18} className="text-slate-400" />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-black/20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 px-10">
            <div className="p-4 bg-primary-500/10 rounded-3xl">
              <MessageCircle size={32} className="text-primary-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start a conversation with {shopName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = customerUserId
              ? msg.sender_id !== customerUserId   // shop/admin side → right bubble
              : msg.sender_id === user?.id;          // fallback for non-admin usage
            const isSelected = selectedIds.has(msg.id);
            const isEditing = editingId === msg.id;
            const isDeleted = msg.is_deleted;

            // Deleted message placeholder — no interactions
            if (isDeleted) {
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%] space-y-1">
                    <div className={`px-4 py-3 rounded-2xl flex items-center gap-2 ${
                      isMe
                        ? 'bg-primary-500/20 text-primary-300 rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-tl-none border border-slate-200 dark:border-white/5'
                    }`}>
                      <Ban size={13} className="flex-shrink-0 opacity-60" />
                      <span className="text-xs italic opacity-70">ข้อความนี้ถูกลบแล้ว</span>
                    </div>
                    <p className={`text-[8px] font-bold uppercase tracking-widest text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300 group`}
                onContextMenu={(e) => !msg.is_deleted && handleContextMenu(e, msg)}
              >
                {/* Selection checkbox — skip deleted messages */}
                {selectionMode && isMe && !isDeleted && (
                  <button onClick={() => toggleSelect(msg.id)} className="flex-shrink-0 mb-4 transition-transform hover:scale-110">
                    {isSelected
                      ? <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>
                      : <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500" />
                    }
                  </button>
                )}

                {/* Desktop/Mobile Options Icon next to bubble (only for our own messages) */}
                {isMe && !isDeleted && !selectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      openMenuAt(rect.left, rect.bottom + 4, msg);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 active:opacity-100 transition-opacity duration-200"
                    title="Options"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}

                <div
                  className={`max-w-[80%] space-y-1 ${isSelected ? 'opacity-70 scale-[0.98]' : ''} transition-all`}
                  onClick={() => selectionMode && isMe && toggleSelect(msg.id)}
                  onTouchStart={(e) => handleTouchStart(e, msg)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                >
                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${
                    isMe
                      ? `bg-primary-500 text-white rounded-tr-none shadow-lg shadow-primary-500/20 ${selectionMode ? 'cursor-pointer' : ''}`
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-white/5'
                  } ${isSelected ? 'ring-2 ring-primary-400' : ''}`}>

                    {/* Images grid */}
                    {msg.image_url && (
                      <div className={`grid gap-2 mb-2 ${msg.image_url.split(',').length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                        {msg.image_url.split(',').map((url: string, idx: number, arr: string[]) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`attachment-${idx}`}
                            onClick={(e) => { if (!selectionMode) { e.stopPropagation(); openLightbox(arr, idx); } }}
                            className={`max-w-full rounded-lg object-cover w-full h-auto ${!selectionMode ? 'cursor-pointer hover:opacity-90' : ''} transition-opacity`}
                            style={{ maxHeight: arr.length > 1 ? '120px' : '200px' }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Text content or edit input */}
                    {isEditing ? (
                      <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Escape' && setEditingId(null)}
                          className="flex-1 bg-white/20 text-white placeholder-white/60 px-3 py-1.5 rounded-lg outline-none border border-white/30 focus:border-white text-sm"
                        />
                        <button type="submit" className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          <Check size={14} className="text-white" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                          <X size={14} className="text-white" />
                        </button>
                      </form>
                    ) : (
                      msg.content && (
                        <div
                          className={`flex items-start gap-2 transition-all ${copiedMessageId === msg.id ? 'bg-slate-200 dark:bg-slate-800 rounded-2xl p-2' : ''}`}
                          onDoubleClick={() => handleDoubleCopy(msg.content, msg.id)}
                        >
                          <span className="break-words flex-1">{msg.content}</span>
                          <button
                            type="button"
                            onClick={() => copyMessageText(msg.content, msg.id)}
                            className={`p-1 rounded-full transition-colors ${copiedMessageId === msg.id ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                            title="Copy message"
                          >
                            <ClipboardCopy size={14} />
                          </button>
                        </div>
                      )
                    )}

                  </div>

                  {/* Timestamp + edited badge */}
                  <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {msg.is_edited && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 italic">edited</span>
                    )}
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Replies for Support */}
      {shopId === SUPPORT_SHOP_ID && (
        <div className={`bg-slate-50/50 dark:bg-black/20 px-6 flex gap-2 overflow-x-auto no-scrollbar transition-all duration-300 ease-in-out ${showQuickReplies ? 'py-4 opacity-100 max-h-20 translate-y-0' : 'py-0 opacity-0 max-h-0 translate-y-4 pointer-events-none'}`}>
          {['chat_topic_products', 'chat_topic_promotions', 'chat_topic_credit'].map((topicKey) => (
            <button
              key={topicKey}
              onClick={async () => {
                setUploading(true);
                setShowQuickReplies(false);
                await sendMessage(t(topicKey), undefined);
                setUploading(false);
                if (scrollRef.current) {
                  setTimeout(() => {
                    scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
                  }, 100);
                }
              }}
              disabled={uploading}
              className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 text-primary-500 text-xs font-bold rounded-full border border-primary-500/20 shadow-sm hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors disabled:opacity-50"
            >
              {t(topicKey)}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-[#0F1116] border-t border-slate-200 dark:border-white/5 flex flex-col">
        {imagePreviews.length > 0 && (
          <div className="p-4 pb-0 flex gap-2 overflow-x-auto no-scrollbar">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative inline-block flex-shrink-0">
                <img src={preview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={() => handleRemovePreviewImage(index)}
                  className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-sm hover:bg-slate-700 z-10"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="p-4">
          <div className="relative flex items-center gap-2">
            {shopId === SUPPORT_SHOP_ID && (
              <button
                type="button"
                onClick={() => setShowQuickReplies(p => !p)}
                className={`p-3 rounded-xl transition-colors ${showQuickReplies ? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                title="Quick Replies"
              >
                <MessageSquarePlus size={20} />
              </button>
            )}
            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <ImagePlus size={20} />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                disabled={uploading}
                className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 pr-14 rounded-2xl border border-slate-200 dark:border-white/5 focus:border-primary-500 outline-none transition-all text-sm font-medium dark:text-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={(!inputValue.trim() && selectedImages.length === 0) || uploading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[200] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => startEdit(contextMenu.msg)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <Pencil size={15} className="text-primary-500" />
            Edit message
          </button>
          <button
            onClick={() => { setSelectionMode(true); toggleSelect(contextMenu.msg.id); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <CheckSquare size={15} className="text-blue-500" />
            Select messages
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-white/5" />
          <button
            onClick={() => handleDeleteOne(contextMenu.msg.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} />
            Delete message
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200 cursor-pointer"
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeLightbox();
          }}
          tabIndex={0}
          ref={el => el?.focus()}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <X size={24} />
          </button>
          {lightboxImages.length > 1 && (
            <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <ChevronLeft size={32} />
            </button>
          )}
          <img
            src={lightboxImages[lightboxIndex]}
            alt="Preview fullscreen"
            className="max-h-[90vh] max-w-[90vw] object-contain select-none cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImages.length > 1 && (
            <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <ChevronRight size={32} />
            </button>
          )}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
