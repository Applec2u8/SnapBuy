import { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldCheck, Receipt, Search, Clock, CheckCircle2, AlertCircle, ShoppingBag, User, X, Printer, ChevronDown, ChevronUp, History } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import Logo from '../../../assets/logo.png';

export const GuaranteePayment = () => {
  const { user, shop, profile, fetchProfile } = useAuthStore();
  const formatMoney = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [paidItems, setPaidItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [receiptLabel, setReceiptLabel] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  // Receipt ID (stable within modal open session)
  const [receiptId] = useState(() => `SNB-G-${Date.now().toString().slice(-6)}`);

  const fetchItems = async () => {
    if (!shop) return;
    try {
      setLoading(true);
      // Fetch pending
      const { data: pending, error: pendingErr } = await supabase
        .from('order_items')
        .select(`
          id, quantity, price, created_at,
          orders ( id, profiles (full_name) ),
          products (name, images),
          product_variants (name, value, image_url)
        `)
        .eq('shop_id', shop.id)
        .eq('guarantee_paid', false)
        .order('created_at', { ascending: false });

      if (pendingErr) throw pendingErr;

      // Fetch paid history (last 30)
      const { data: paid, error: paidErr } = await supabase
        .from('order_items')
        .select(`
          id, quantity, price, created_at,
          orders ( id, status, expected_delivery_date, profiles (full_name) ),
          products (name, images),
          product_variants (name, value, image_url)
        `)
        .eq('shop_id', shop.id)
        .eq('guarantee_paid', true)
        .order('created_at', { ascending: false })
        .limit(30);

      if (paidErr) throw paidErr;

      setPendingItems(pending || []);
      setPaidItems(paid || []);
      setSelectedIds((pending || []).map((i: any) => i.id));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load guarantee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [shop]);

  const filteredPending = pendingItems.filter(item =>
    item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orders?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPending = useMemo(() => {
    return filteredPending.reduce((acc: Record<string, any[]>, item: any) => {
      const label = item.product_variants?.name
        ? `${item.products?.name} · ${item.product_variants.name}: ${item.product_variants.value}`
        : item.products?.name || 'Other';
      if (!acc[label]) acc[label] = [];
      acc[label].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredPending]);

  const groupedPaidItems = useMemo(() => {
    return paidItems.reduce((acc: Record<string, any[]>, item: any) => {
      const label = item.product_variants?.name
        ? `${item.products?.name} · ${item.product_variants.name}: ${item.product_variants.value}`
        : item.products?.name || 'Other';
      if (!acc[label]) acc[label] = [];
      acc[label].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [paidItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredPending.length && filteredPending.length > 0
      ? []
      : filteredPending.map(i => i.id)
    );
  };

  const selectedItemsData = useMemo(() =>
    pendingItems.filter(i => selectedIds.includes(i.id)),
    [pendingItems, selectedIds]);

  const groupedReceiptItems = useMemo(() => {
    return receiptItems.reduce((acc: Record<string, any[]>, item: any) => {
      const label = item.product_variants?.name
        ? `${item.products?.name} · ${item.product_variants.name}: ${item.product_variants.value}`
        : item.products?.name || 'Other';
      if (!acc[label]) acc[label] = [];
      acc[label].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [receiptItems]);

  const summary = useMemo(() => {
    const totalCost = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const salesPct = shop?.sales_percentage || 0;
    const expectedBonus = totalCost * (salesPct / 100);
    return { totalCost, salesPct, expectedBonus, expectedReturn: totalCost + expectedBonus };
  }, [selectedItemsData, shop]);

  const receiptSummary = useMemo(() => {
    const totalCost = receiptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const salesPct = shop?.sales_percentage || 0;
    const expectedBonus = totalCost * (salesPct / 100);
    return { totalCost, salesPct, expectedBonus, expectedReturn: totalCost + expectedBonus };
  }, [receiptItems, shop]);

  const handlePayGuarantee = async () => {
    if (!shop || selectedIds.length === 0) return;
    const walletBalance = Number(profile?.wallet_balance || 0);
    if (walletBalance < summary.totalCost) {
      toast.error(`Insufficient balance. You need $${formatMoney(summary.totalCost)} but have $${formatMoney(walletBalance)}`);
      return;
    }
    try {
      setPaying(true);
      const { data, error } = await supabase.rpc('pay_order_guarantee', {
        p_shop_id: shop.id,
        p_item_ids: selectedIds
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      toast.success(`Guarantee paid! $${formatMoney(data.amount_deducted)} deducted.`);
      setPaymentSuccess(true);
      if (user) await fetchProfile(user.id);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process guarantee payment');
    } finally {
      setPaying(false);
    }
  };

  const dispatchChatToggle = (show: boolean) => {
    window.dispatchEvent(new CustomEvent('toggle-global-chat', { detail: show }));
  };

  const openReceiptModal = () => {
    dispatchChatToggle(false);
    setReceiptItems(selectedItemsData);
    setReceiptLabel('Selected Guarantee Items');
    setIsModalOpen(true);
    setPaymentSuccess(false);
  };

  const openReceiptModalForHistory = (category: string, items: any[]) => {
    dispatchChatToggle(false);
    setReceiptItems(items);
    setReceiptLabel(category);
    setIsModalOpen(true);
    setPaymentSuccess(true);
  };

  const closeReceiptModal = () => {
    setIsModalOpen(false);
    dispatchChatToggle(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const walletBalance = Number(profile?.wallet_balance || 0);
  const isInsufficient = selectedIds.length > 0 && walletBalance < summary.totalCost;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* Main Dashboard Content (Hidden when printing) */}
      <div className="space-y-6 print:hidden">
        {/* === HEADER BANNER === */}
        <div className="bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-slate-300/50 dark:bg-slate-800/30 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-slate-300/50 dark:bg-slate-800/30 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-xl">
                  <ShieldCheck size={22} className="text-slate-900 dark:text-white" />
                </div>
                <h1 className="text-slate-900 dark:text-white text-xl sm:text-2xl font-black uppercase tracking-tight">Guarantee Payments</h1>
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-sm max-w-lg">
                Pay the guarantee fee to unlock your orders. You'll receive the full amount back + <span className="font-black text-yellow-500 dark:text-yellow-300">{shop?.sales_percentage || 0}% bonus</span> after delivery.
              </p>
            </div>

            <div className="w-full md:w-auto bg-white/90 dark:bg-slate-800/70 backdrop-blur-md border border-slate-300 dark:border-slate-700 p-4 rounded-2xl flex flex-row md:flex-col gap-4 md:gap-1 justify-between md:justify-start shadow-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-300 font-black">Wallet Balance</p>
                <p className="text-slate-900 dark:text-white text-2xl font-black mt-0.5">${formatMoney(walletBalance)}</p>
              </div>
              {isInsufficient && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1 self-end md:self-auto">
                  <AlertCircle size={12} /> Insufficient
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase font-black tracking-widest">Pending</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingItems.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase font-black tracking-widest">Selected</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedIds.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase font-black tracking-widest">Fee Due</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">${formatMoney(summary.totalCost)}</p>
            </div>
          </div>
        </div>

        {/* === PENDING ITEMS SECTION (2 COLUMNS) === */}
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">

          {/* Left Column (Card 1): Pending Items List */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 w-full border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Pending Guarantee ({filteredPending.length})</h2>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search product or customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2.5 px-4 pl-10 text-xs font-bold outline-none focus:border-violet-500 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Search className="absolute left-3 top-3 text-slate-500" size={16} />
              </div>
            </div>

            {filteredPending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <CheckCircle2 size={48} className="mb-3 text-slate-700" />
                <p className="font-bold">All caught up!</p>
                <p className="text-sm mt-1">No pending guarantee payments.</p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-3 pb-4">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectedIds.length === filteredPending.length && filteredPending.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-[#1E293B] border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-[#0F172A] cursor-pointer"
                  />
                  <label htmlFor="selectAll" className="text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer">
                    Select All ({filteredPending.length})
                  </label>
                </div>

                {/* Items list */}
                <div className="space-y-4">
                  {(Object.entries(groupedPending) as [string, any[]][]).map(([category, items]) => (
                    <div key={category} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Category</p>
                          <p className="font-black text-sm text-slate-900 dark:text-white truncate">{category}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">{items.length} item{items.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-1">
                        {items.map(item => {
                          const isSelected = selectedIds.includes(item.id);
                          const imgUrl = item.product_variants?.image_url || item.products?.images?.[0];
                          const itemTotal = item.price * item.quantity;
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleSelect(item.id)}
                              className={`flex items-center gap-4 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-400 dark:border-emerald-400/40 -mx-2 px-4 rounded-xl shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 -mx-4 px-4 rounded-xl'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(item.id)}
                                className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer flex-shrink-0"
                                onClick={e => e.stopPropagation()}
                              />
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 shadow shadow-black/10 dark:shadow-black/30">
                                {imgUrl ? (
                                  <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <ShoppingBag size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.products?.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {item.product_variants && (
                                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-black tracking-wide">
                                      {item.product_variants.name.toUpperCase()}: {item.product_variants.value.toUpperCase()}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                                    <User size={10} /> {item.orders?.profiles?.full_name || 'Admin'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm">${formatMoney(itemTotal)}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.quantity}×${formatMoney(item.price)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column (Card 2): Summary & Pay CTA */}
          {filteredPending.length > 0 && (
            <div className="w-full xl:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 sticky top-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-5">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Guarantee Fee</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">${formatMoney(summary.totalCost)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Bonus ({summary.salesPct}%)</p>
                    <p className="text-sm font-black text-emerald-500 dark:text-emerald-300">+${formatMoney(summary.expectedBonus)}</p>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Expected Return</p>
                    <p className="text-2xl font-black text-emerald-500 dark:text-emerald-300">${formatMoney(summary.expectedReturn)}</p>
                  </div>
                </div>

                {/* Pay Button */}
                <div className="w-full">
                  <button
                    onClick={openReceiptModal}
                    disabled={selectedIds.length === 0 || isInsufficient}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs whitespace-nowrap"
                  >
                    <Receipt size={16} />
                    Review & Pay ({selectedIds.length})
                  </button>
                  {isInsufficient && (
                    <p className="text-xs text-rose-500 font-bold mt-3 flex items-center justify-center gap-1 text-center">
                      <AlertCircle size={12} /> Need ${(formatMoney(summary.totalCost - walletBalance))} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === PAID HISTORY SECTION (BOTTOM) === */}
        {paidItems.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="w-full px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-900 dark:bg-slate-900">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full sm:flex-1 flex items-center justify-between gap-3 px-4 py-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History size={18} className="text-emerald-500" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Payment History <span className="text-emerald-500">({paidItems.length})</span></h2>
                    <p className="text-xs text-slate-500">Previously paid guarantee fees</p>
                  </div>
                </div>
                {showHistory ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              <div className="hidden sm:inline-flex sm:items-center sm:gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-black uppercase tracking-widest px-4 py-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800">
                {(Object.entries(groupedPaidItems) as [string, any[]][]).map(([category, items]) => (
                  <div key={category} className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900 print:bg-slate-100 print:dark:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Category</p>
                          <p className="font-black text-sm text-slate-900 dark:text-white truncate">{category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">{items.length} item{items.length > 1 ? 's' : ''}</span>
                          <button
                            onClick={() => openReceiptModalForHistory(category, items)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors print:hidden"
                          >
                            <Printer size={12} /> Print Category
                          </button>
                        </div>
                      </div>
                    </div>
                    {items.map(item => {
                      const imgUrl = item.product_variants?.image_url || item.products?.images?.[0];
                      const itemTotal = item.price * item.quantity;
                      const statusColor = item.orders?.status === 'delivered' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
                      return (
                        <div key={item.id} className="flex items-center gap-4 px-5 py-4 opacity-75 hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag size={14} /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate">{item.products?.name}</p>
                            <p className="text-[10px] text-slate-400">{item.quantity}× · {item.orders?.profiles?.full_name}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusColor}`}>
                              {item.orders?.status}
                            </div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">${formatMoney(itemTotal)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* === RECEIPT / INVOICE MODAL === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 print:static print:inset-auto print:block print:p-0 print:bg-transparent">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden"
            onClick={() => !paying && closeReceiptModal()}
          />

          {/* Modal Sheet */}
          <div className="relative bg-white dark:bg-slate-900 w-full sm:w-[90vw] lg:w-auto lg:max-w-4xl flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none print:max-h-none print:!bg-white print:!text-black print:!border-slate-300">

            {/* Drag handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="print:hidden flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 print:border-slate-300 dark:border-slate-800 print:!bg-white print:!text-black sticky top-0 z-10">
              <div className="flex-1">
                <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white print:text-slate-900">INVOICE / RECEIPT</h2>
                <p className="text-[10px] font-bold text-slate-400 print:text-slate-500 uppercase tracking-widest mt-0.5">{receiptId}</p>
                {receiptLabel && (
                  <p className="text-[10px] text-slate-500 print:text-slate-600 mt-1 font-bold uppercase tracking-widest">{receiptLabel}</p>
                )}
              </div>
              <button
                onClick={closeReceiptModal}
                disabled={paying}
                className="print:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable invoice body */}
            <div ref={receiptRef} className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 font-sans text-slate-900 dark:text-slate-300 bg-white dark:bg-slate-900 print:!bg-white print:!text-black space-y-6">

              {/* Company Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-black text-sm sm:text-base print:bg-slate-100 print:text-black">
                    <img src={Logo} alt="Logo" className="w-10 sm:w-12 h-5 sm:h-7" />
                  </div>
                  <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white print:text-slate-900">
                    SnapBuy
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 print:text-slate-500 uppercase tracking-widest">Guarantee Invoice</p>
                </div>
              </div>

              {/* Shop & Date Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black mb-1">{shop?.name || 'Shop'}</p>
                  <div className="text-xs text-slate-500 print:text-slate-600 space-y-1">
                    <p>Email: {shop?.contact_email || 'N/A'}</p>
                    <p>Phone: {shop?.phone || '—'}</p>
                    <p>Shop ID: {shop?.id}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs sm:text-sm font-bold text-slate-500 print:text-slate-600 uppercase tracking-widest mb-2">Invoice #</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black mb-3">{receiptId}</p>
                  <div className="text-xs text-slate-500 print:text-slate-600 space-y-0.5">
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                    <p>Method: My Wallet</p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-700 print:border-slate-300" />

              {/* Guarantee For */}
              <div className='flex'>
                <p className="font-black text-sm text-slate-900 dark:text-white print:text-black">
                  <span className=' font-black uppercase tracking-widest text-slate-400 print:text-slate-500 mb-2'>For: </span>
                  {profile?.full_name || 'Vendor'}
                </p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 print:bg-slate-100">
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 text-[9px] sm:text-[10px]">PRODUCT</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 text-[9px] sm:text-[10px]">CUSTOMER</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 text-[9px] sm:text-[10px]">QTY</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-black uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 text-[9px] sm:text-[10px]">PRICE</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-black uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 text-[9px] sm:text-[10px]">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(groupedReceiptItems) as [string, any[]][]).flatMap(([category, items]) => [
                      <tr key={`${category}-header`} className="bg-slate-100 dark:bg-slate-800 print:bg-slate-50">
                        <td colSpan={5} className="px-2 sm:px-4 py-2 text-left text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-300 print:text-slate-600">
                          {category} ({items.length})
                        </td>
                      </tr>,
                      ...items.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 print:border-slate-200">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 align-top">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white print:text-black line-clamp-1">{item.products?.name}</p>
                            <p className="text-[8px] sm:text-[9px] text-slate-400 print:text-slate-500 mt-0.5">#{item.orders?.id?.substring(0, 8)}</p>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-slate-500 print:text-slate-600">{item.orders?.profiles?.full_name || '—'}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 print:text-black">{item.quantity}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300 print:text-black">${formatMoney(item.price)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-black text-slate-900 dark:text-white print:text-black">${formatMoney(item.price * item.quantity)}</td>
                        </tr>
                      ))
                    ])}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
                {/* QR Code */}
                <div className="text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/shop/${shop?.id}`)}`}
                    width={100}
                    height={100}
                    alt="QR"
                    className="border border-slate-200 dark:border-slate-700 print:border-slate-300 p-1 bg-white rounded-lg mx-auto"
                    onLoad={() => setQrLoaded(true)}
                    onError={() => setQrLoaded(true)}
                  />
                  <p className="text-[9px] text-slate-500 print:text-slate-500 mt-2 font-bold uppercase">VERIFY</p>
                </div>

                {/* Totals */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 print:text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">${formatMoney(receiptSummary.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 print:text-slate-600">Bonus ({receiptSummary.salesPct}%)</span>
                    <span className="font-bold text-emerald-500 dark:text-emerald-400 print:text-black">+${formatMoney(receiptSummary.expectedBonus)}</span>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700 print:border-slate-300" />

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white print:text-black uppercase">TOTAL DUE</p>
                      <p className="text-[10px] text-slate-500 print:text-slate-600">(via Wallet)</p>
                    </div>
                    <p className="text-lg sm:text-xl font-black text-primary-500 dark:text-primary-400 print:text-black">${formatMoney(receiptSummary.totalCost)}</p>
                  </div>

                  {paymentSuccess && (
                    <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 print:text-black">✓ Payment Complete</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 print:hidden flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">{receiptItems.length} Items • ${formatMoney(receiptSummary.totalCost)}</span>
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                {!paymentSuccess ? (
                  <>
                    <button
                      onClick={handlePrint}
                      disabled={!qrLoaded}
                      className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 font-bold text-[11px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Printer size={14} /> Draft
                    </button>
                    <button
                      onClick={handlePayGuarantee}
                      disabled={paying || !qrLoaded}
                      className="py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5"
                    >
                      {paying ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✓'}
                      {paying ? 'Processing' : 'Confirm & Pay'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={closeReceiptModal}
                      className="py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] sm:text-xs uppercase"
                    >
                      Close
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={!qrLoaded}
                      className="py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Printer size={14} /> Receipt
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
