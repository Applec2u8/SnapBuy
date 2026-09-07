import { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldCheck, Receipt, Search, Clock, CheckCircle2, AlertCircle, ShoppingBag, User, X, Printer, ChevronDown, ChevronUp, History } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import Logo from '../../../../assets/logo.png';

export const GuaranteePayment = () => {
  const { user, shop, profile, fetchProfile } = useAuthStore();
  const formatMoney = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [paidItems, setPaidItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [receiptLabel, setReceiptLabel] = useState('');
  const [isDraftOnly, setIsDraftOnly] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Receipt ID (stable within modal open session)
  const [receiptId] = useState(() => `SNB-G-${Date.now().toString().slice(-6)}`);

  const fetchItems = async () => {
    if (!shop) return;
    try {
      setIsRefreshing(true);
      // Fetch pending
      const { data: pending, error: pendingErr } = await supabase
        .from('order_items')
        .select(`
          id, quantity, price, created_at,
          orders ( id, user_id, shipping_address_id, profiles (full_name), user_addresses!orders_shipping_address_id_fkey (full_name, phone, address_line, district, city, province, postal_code) ),
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
          id, quantity, price, created_at, guarantee_paid_at,
          orders ( id, user_id, status, expected_delivery_date, shipping_address_id, profiles (full_name), user_addresses!orders_shipping_address_id_fkey (full_name, phone, address_line, district, city, province, postal_code) ),
          products (name, images),
          product_variants (name, value, image_url)
        `)
        .eq('shop_id', shop.id)
        .eq('guarantee_paid', true)
        .order('guarantee_paid_at', { ascending: false })
        .limit(50);

      if (paidErr) throw paidErr;

      // Collect shipping_address_ids AND user_ids
      const allItems = [...(pending || []), ...(paid || [])];


      // Map address from FK join result (user_addresses joined via orders FK)
      allItems.forEach((i: any) => {
        const ordersObj = Array.isArray(i.orders) ? i.orders[0] : i.orders;
        if (ordersObj) {
          // PostgREST returns the FK-joined address as 'user_addresses'
          const fkAddr = Array.isArray(ordersObj.user_addresses)
            ? ordersObj.user_addresses[0]
            : ordersObj.user_addresses;
          ordersObj.address = fkAddr || null;
          if (Array.isArray(i.orders) && i.orders[0]) {
            i.orders[0].address = fkAddr || null;
          }
        }
      });

      setPendingItems(pending || []);
      setPaidItems(paid || []);
      setSelectedIds((pending || []).map((i: any) => i.id));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load guarantee data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchItems(); }, [shop]);

  const filteredPending = pendingItems.filter(item =>
    item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orders?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPending = useMemo(() => {
    return filteredPending.reduce((acc: Record<string, any[]>, item: any) => {
      const label = item.orders?.profiles?.full_name || 'Unknown Customer';
      if (!acc[label]) acc[label] = [];
      acc[label].push(item);
      return acc;
    }, {});
  }, [filteredPending]);

  // Group paid items into batches by guarantee_paid_at (rounded to nearest minute)
  const paidBatches = useMemo(() => {
    const map = new Map<string, { batchKey: string; paidAt: Date; items: any[] }>();
    paidItems.forEach((item: any) => {
      const rawDate = item.guarantee_paid_at || item.created_at;
      const d = new Date(rawDate);
      // Round down to minute for grouping
      d.setSeconds(0, 0);
      const key = d.toISOString();
      if (!map.has(key)) map.set(key, { batchKey: key, paidAt: d, items: [] });
      map.get(key)!.items.push(item);
    });
    // Sort newest first, assign batch numbers
    const sorted = Array.from(map.values()).sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
    return sorted.map((b, idx) => ({ ...b, batchNo: sorted.length - idx }));
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

  const ITEMS_PER_MASTER_PAGE = 8;

  const masterReceiptChunks = useMemo(() => {
    const chunks: any[][] = [];
    for (let i = 0; i < receiptItems.length; i += ITEMS_PER_MASTER_PAGE) {
      chunks.push(receiptItems.slice(i, i + ITEMS_PER_MASTER_PAGE));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [receiptItems]);

  const customerReceiptGroups = useMemo(() => {
    const map = new Map<string, { customerName: string; profile: any; address: any; items: any[] }>();
    receiptItems.forEach(item => {
      const custId = item.orders?.profiles?.full_name || 'Unknown Customer';
      if (!map.has(custId)) {
        map.set(custId, {
          customerName: custId,
          profile: item.orders?.profiles,
          address: item.orders?.address,
          items: []
        });
      }
      map.get(custId)!.items.push(item);
    });
    return Array.from(map.values());
  }, [receiptItems]);

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
      // Auto-open print after short delay for UI to update
      setTimeout(() => window.print(), 800);
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
    setIsDraftOnly(false);
  };

  const openReceiptModalForHistory = (customer: string, items: any[]) => {
    dispatchChatToggle(false);
    setReceiptItems(items);
    setReceiptLabel(customer);
    setIsModalOpen(true);
    setPaymentSuccess(true);
    setIsDraftOnly(false);
  };

  const openInvoiceModalForCustomer = (customer: string, items: any[]) => {
    dispatchChatToggle(false);
    setReceiptItems(items);
    setReceiptLabel(`Customer: ${customer}`);
    setIsModalOpen(true);
    setPaymentSuccess(false);
    setIsDraftOnly(true);
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
                <button
                  onClick={() => fetchItems()}
                  disabled={loading || isRefreshing}
                  className={`p-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm`}
                  title="Refresh Data"
                >
                  <svg className={isRefreshing ? 'animate-spin text-primary-500' : ''} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
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
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
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
                  {(Object.entries(groupedPending) as [string, any[]][]).map(([customer, items]) => (
                    <div key={customer} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Customer</p>
                          <p className="font-black text-sm text-slate-900 dark:text-white truncate">{customer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">{items.length} item{items.length > 1 ? 's' : ''}</span>
                          <button
                            onClick={() => openInvoiceModalForCustomer(customer, items)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                          >
                            <Printer size={12} /> Invoice
                          </button>
                        </div>
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
                                  {item.created_at && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                                      <Clock size={10} /> {formatDateTime(item.created_at)}
                                    </span>
                                  )}
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
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 p-4">
                {paidBatches.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-6">No payment batches yet.</p>
                ) : paidBatches.map((batch) => {
                  const batchTotal = batch.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
                  const batchDate = batch.paidAt.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={batch.batchKey} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      {/* Batch Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 dark:from-violet-900/30 dark:to-indigo-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black text-xs">#{String(batch.batchNo).padStart(3, '0')}</span>
                          </div>
                          <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white">Batch #{String(batch.batchNo).padStart(3, '0')}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock size={9} /> {batchDate} · {batch.items.length} item{batch.items.length > 1 ? 's' : ''} · <span className="text-emerald-500 font-black">${formatMoney(batchTotal)}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openReceiptModalForHistory(`Batch #${String(batch.batchNo).padStart(3, '0')}`, batch.items)}
                          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 transition-colors flex-shrink-0"
                        >
                          <Printer size={12} /> Reprint
                        </button>
                      </div>
                      {/* Batch Items */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {batch.items.map((item: any) => {
                          const imgUrl = item.product_variants?.image_url || item.products?.images?.[0];
                          const itemTotal = item.price * item.quantity;
                          const statusColor = item.orders?.status === 'delivered' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
                          return (
                            <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag size={13} /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{item.products?.name}</p>
                                <p className="text-[10px] text-slate-400">{item.quantity}× · {item.orders?.profiles?.full_name || '—'}</p>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* === RECEIPT / INVOICE MODAL === */}
      {isModalOpen && (
        <div className="receipt-print-portal fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 print:static print:inset-auto print:block print:p-0 print:bg-transparent">
          {/* Backdrop */}
          <div
            className="receipt-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden"
            onClick={() => !paying && closeReceiptModal()}
          />

          {/* Modal Sheet */}
          <div className="receipt-modal-container relative bg-white dark:bg-slate-900 w-full sm:w-[90vw] lg:w-auto lg:max-w-4xl flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden print:overflow-visible print:block print:h-auto print:w-full print:max-w-none print:shadow-none print:rounded-none print:max-h-none print:!bg-white print:!text-black print:border-none print:m-0">

            {/* Drag handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="receipt-modal-header print:hidden flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 print:border-slate-800 dark:border-slate-800 print:!bg-white print:!text-black sticky top-0 z-10">
              <div className="flex-1">
                <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white print:text-slate-900">INVOICE / RECEIPT</h2>
                <p className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest mt-0.5">{receiptId}</p>
                {receiptLabel && (
                  <p className="text-[10px] text-slate-500 print:text-black mt-1 font-bold uppercase tracking-widest">{receiptLabel}</p>
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
            <div ref={receiptRef} className="receipt-scroll-body p-4 sm:p-6 lg:p-8 overflow-y-auto print:overflow-visible flex-1 print:flex-none print:block font-sans text-slate-900 dark:text-slate-300 bg-white dark:bg-slate-900 print:!bg-white print:!text-black space-y-8 print:p-0 print:pt-4">

              {/* ------------------------------------------------------------- */}
              {/* 1. MASTER GUARANTEE INVOICE (PAGINATED CHUNKS)                */}
              {/* ------------------------------------------------------------- */}
              {masterReceiptChunks.map((chunk, chunkIdx) => (
                <div
                  key={`master-page-${chunkIdx}`}
                  className={`space-y-6 ${chunkIdx > 0 ? 'print:break-before-page pt-8 border-t border-slate-200 dark:border-slate-800 print:border-none' : ''}`}
                  style={chunkIdx > 0 ? { pageBreakBefore: 'always', breakBefore: 'page' } : {}}
                >
                  {/* Company Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:border-slate-800">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-black text-sm sm:text-base print:bg-slate-100 print:text-black">
                        <img src={Logo} alt="Logo" className="w-10 h-7" />
                      </div>
                      <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white print:text-slate-900">
                        SnapBuy
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest">
                        MASTER GUARANTEE FEE INVOICE
                        {masterReceiptChunks.length > 1 && ` (PAGE ${chunkIdx + 1}/${masterReceiptChunks.length})`}
                      </p>
                    </div>
                  </div>

                  {/* Shop & Date Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black mb-1">{shop?.name || 'Shop'}</p>
                      <div className="text-xs text-slate-500 print:text-black space-y-1">
                        <p>Email: {shop?.contact_email || 'N/A'}</p>
                        <p>Phone: {shop?.phone || '—'}</p>
                        <p>Shop ID: {shop?.id}</p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs sm:text-sm font-bold text-slate-500 print:text-black uppercase tracking-widest mb-2">Invoice #</p>
                      <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black mb-3">
                        {receiptId}{masterReceiptChunks.length > 1 ? `-P${chunkIdx + 1}` : ''}
                      </p>
                      <div className="text-xs text-slate-500 print:text-black space-y-0.5">
                        <p>Date: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>Time: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        <p>Method: My Wallet</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700 print:border-slate-800" />

                  {/* Guarantee For */}
                  <div className='flex justify-between items-center'>
                    <p className="font-black text-sm text-slate-900 dark:text-white print:text-black">
                      <span className='font-black uppercase tracking-widest text-slate-400 print:text-black mb-2'>For: </span>
                      {profile?.full_name || 'Vendor'}
                    </p>
                    <p className="text-xs text-slate-400 font-bold">
                      {receiptItems.length} Total Items Selected
                    </p>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 print:bg-slate-100">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black uppercase tracking-widest text-slate-400 print:text-black border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-[9px] sm:text-[10px]">PRODUCT</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black uppercase tracking-widest text-slate-400 print:text-black border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-[9px] sm:text-[10px]">CUSTOMER</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black uppercase tracking-widest text-slate-400 print:text-black border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-[9px] sm:text-[10px]">QTY</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-black uppercase tracking-widest text-slate-400 print:text-black border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-[9px] sm:text-[10px]">PRICE</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-black uppercase tracking-widest text-slate-400 print:text-black border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-[9px] sm:text-[10px]">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chunk.map(item => (
                          <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 print:border-slate-800">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 align-top">
                              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white print:text-black line-clamp-1">{item.products?.name}</p>
                              {item.product_variants && (
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{item.product_variants.name}: {item.product_variants.value}</p>
                              )}
                              <p className="text-[8px] sm:text-[9px] text-slate-400 print:text-black mt-0.5">#{item.orders?.id?.substring(0, 8)}</p>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-slate-500 print:text-black align-top">{item.orders?.profiles?.full_name || '—'}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 print:text-black align-top">{item.quantity}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300 print:text-black align-top">${formatMoney(item.price)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-black text-slate-900 dark:text-white print:text-black align-top">${formatMoney(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Section (Rendered on the LAST master page chunk) */}
                  {chunkIdx === masterReceiptChunks.length - 1 && (
                    <div className="flex gap-4 sm:gap-6 items-start sm:items-end pt-4">
                      {/* QR Code */}
                      <div className="text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/shop/${shop?.id}`)}`}
                          width={100}
                          height={100}
                          alt="QR"
                          className="border border-slate-200 dark:border-slate-700 print:border-slate-800 p-1 bg-white rounded-lg mx-auto"
                          onLoad={() => setQrLoaded(true)}
                          onError={() => setQrLoaded(true)}
                        />
                        <p className="text-[9px] text-slate-500 print:text-black mt-2 font-bold uppercase">VERIFY</p>
                      </div>

                      {/* Totals */}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-slate-500 print:text-black">Subtotal</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">${formatMoney(receiptSummary.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-slate-500 print:text-black">Bonus ({receiptSummary.salesPct}%)</span>
                          <span className="font-bold text-emerald-500 dark:text-emerald-400 print:text-black">+${formatMoney(receiptSummary.expectedBonus)}</span>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-700 print:border-slate-800" />

                        <div className="flex justify-between items-center pt-1">
                          <div>
                            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white print:text-black uppercase">TOTAL DUE</p>
                            <p className="text-[10px] text-slate-500 print:text-black">(via Wallet)</p>
                          </div>
                          <p className="text-lg sm:text-xl font-black text-primary-500 dark:text-primary-400 dark:print:text-primary-400 print:text-primary-500">${formatMoney(receiptSummary.totalCost)}</p>
                        </div>

                        {paymentSuccess && (
                          <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 print:text-black">✓ Payment Complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* ------------------------------------------------------------- */}
              {/* 2. INDIVIDUAL CUSTOMER DELIVERY INVOICES (ใบแจ้งหนี้รายลูกค้า) */}
              {/* ------------------------------------------------------------- */}
              {customerReceiptGroups.map((group, groupIdx) => {
                const groupTotal = group.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                const orderId = group.items[0]?.orders?.id?.substring(0, 8) || 'N/A';
                const addr = group.address;
                const fullAddr = addr
                  ? `${addr.address_line || ''}, ${addr.district || ''}, ${addr.city || ''}, ${addr.province || ''} ${addr.postal_code || ''}`.replace(/^, |, $/g, '')
                  : null;

                return (
                  <div
                    key={`customer-inv-${group.customerName}-${groupIdx}`}
                    className="print:break-before-page pt-8 border-t-2 border-dashed border-slate-200 dark:border-slate-700/60 print:border-none space-y-6"
                    style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
                  >
                    {/* Invoice Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <img src={Logo} alt="Logo" className="w-12 h-10" />
                        <div>
                          <span className="font-black text-base tracking-tight text-slate-900 dark:text-white block">SnapBuy</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">{shop?.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">DELIVERY INVOICE</p>
                        <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">ใบส่งสินค้า / ใบแจ้งหนี้ลูกค้า</p>
                      </div>
                    </div>

                    {/* Recipient & Order Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 dark:border-slate-700 rounded-xl overflow-hidden">
                      {/* Customer Block */}
                      <div className="p-4 sm:p-5 border-b sm:border-b-0 border-slate-200 dark:border-slate-700">
                        <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">CUSTOMER / ผู้รับสินค้า</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-2">{group.customerName}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-emerald-500">📱</span>
                            <span className="font-medium">{addr?.phone || group.profile?.phone || '—'}</span>
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5 leading-snug">
                            <span className="text-emerald-500 mt-px">📍</span>
                            <span>{fullAddr || '—'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Order Info Block */}
                      <div className="p-4 sm:p-5 sm:text-right">
                        <p className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">ORDER DETAILS</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-2">Order #{orderId}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            📅 {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                            🏪 {shop?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Product Table */}
                    <div className="overflow-hidden border-slate-200 dark:border-slate-700 rounded-xl">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[9px]">PRODUCT DESCRIPTION</th>
                            <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[9px]">QTY</th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[9px]">UNIT PRICE</th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[9px]">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item) => (
                            <tr key={item.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                              <td className="px-4 py-3">
                                <p className="font-bold text-xs text-slate-900 dark:text-white">{item.products?.name}</p>
                                {item.product_variants && (
                                  <p className="text-[9px] text-violet-600 dark:text-violet-400 font-bold uppercase mt-0.5">{item.product_variants.name}: {item.product_variants.value}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-xs text-slate-700 dark:text-slate-300">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-xs text-slate-600 dark:text-slate-400">${formatMoney(item.price)}</td>
                              <td className="px-4 py-3 text-right font-black text-xs text-emerald-600 dark:text-emerald-400">${formatMoney(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom: Signatures + Total */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-5 pt-2">
                      {/* Signature Boxes */}
                      <div className="grid grid-cols-2 gap-3 justify-center sm:mx-0 mx-auto">
                        {[{ label: 'ผู้ส่งสินค้า', sub: 'Courier Signature' }, { label: 'ผู้รับสินค้า', sub: 'Customer Signature' }].map(sig => (
                          <div key={sig.sub} className="border border-dashed border-slate-300 dark:border-slate-600 print:rounded-xl rounded-xl p-3 text-center w-36 sm:w-44 space-y-3">
                            <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 leading-tight">{sig.label}<br />{sig.sub}</p>
                            <div className="h-8 border-b-2 border-dashed border-slate-300 dark:border-slate-600" />
                            <p className="text-[8px] text-slate-400 dark:text-slate-500">วันที่ ........../........../..........</p>
                          </div>
                        ))}
                      </div>

                      {/* Total Box */}
                      <div className="w-full sm:w-56 rounded-xl overflow-hidden border-slate-200 dark:border-slate-700">
                        <div className="px-4 py-2.5 flex justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                          <span>Total Items</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{group.items.reduce((s, i) => s + i.quantity, 0)} pcs</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center bg-emerald-500 dark:bg-emerald-600">
                          <span className="text-xs font-black text-white uppercase tracking-widest">TOTAL DUE</span>
                          <span className="text-base font-black text-white">${formatMoney(groupTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Sticky Footer */}
            <div className="receipt-modal-footer px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 print:hidden flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">{receiptItems.length} Items • ${formatMoney(receiptSummary.totalCost)}</span>
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                {isDraftOnly ? (
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
                      <Printer size={14} /> Print Invoice
                    </button>
                  </>
                ) : !paymentSuccess ? (
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
