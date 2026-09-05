// Modal for exporting database records to JSON backup
import React, { useState, useEffect } from 'react';
import { X, DownloadCloud, AlertTriangle, Layers, Store, Percent } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { useAdminPin } from '../../../../../hooks/useAdminPin';

interface Shop {
  id: string;
  name: string;
  productCount: number;
}

interface ExportJob {
  id: string;
  shopNames: string[];
  percentage: number;
  startedAt: string;
}

interface ExportDataModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onExportStart?: (job: ExportJob) => void;
  onExportSuccess?: (jobId: string) => void;
  onExportError?: (jobId: string, message: string) => void;
}

export type { ExportJob };

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ show, setShow }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [exportPercentage, setExportPercentage] = useState<string>('50');
  const [error, setError] = useState<string | null>(null);
  const [shopSearch, setShopSearch] = useState('');
  
  const [exportProducts, setExportProducts] = useState<boolean>(true);
  const [exportAuditLog, setExportAuditLog] = useState<boolean>(false);
  const [auditLogCount, setAuditLogCount] = useState<number>(0);
  const [auditLogCountLoaded, setAuditLogCountLoaded] = useState<boolean>(false);
  const [purgeAfterExport, setPurgeAfterExport] = useState<boolean>(false);
  const [loadingShops, setLoadingShops] = useState(false);

  const { requirePin, pinModal } = useAdminPin();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Re-fetch shop counts every time the modal is opened
  useEffect(() => {
    if (show) fetchShops();
  }, [show]);

  useEffect(() => {
    if (!show || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  const fetchShops = async () => {
    setLoadingShops(true);
    try {
      const { data: shopsData, error: shopsError } = await supabase.from('shops').select('id, name');
      if (shopsError) throw shopsError;
      
      // Fetch audit log count
      const { data: approxCount, error: rpcErr } = await supabase.rpc('get_audit_log_count_approx');
      if (!rpcErr && approxCount !== null && approxCount > 0) {
        setAuditLogCount(Number(approxCount));
        setAuditLogCountLoaded(true);
      } else {
        // Fall back to exact count
        const { count: exactAuditCount } = await supabase
          .from('system_audit_log')
          .select('*', { count: 'exact', head: true });
        setAuditLogCount(exactAuditCount || 0);
        setAuditLogCountLoaded(true);
      }
      
      // Fetch product counts for all shops in parallel
      const formattedShops = await Promise.all((shopsData || []).map(async (s) => {
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', s.id);
        
        if (countError) console.error(`Error counting products for shop ${s.id}:`, countError);
        
        return {
          id: s.id,
          name: s.name,
          productCount: count || 0
        };
      }));

      setShops(formattedShops);
    } catch (e: any) {
      console.error('Error fetching shops:', e);
    } finally {
      setLoadingShops(false);
    }
  };


  const handleExport = async () => {
    requirePin(() => {
      setError(null);

      let percentage = Number(exportPercentage);
      if (isNaN(percentage) || percentage <= 0) percentage = 1;
      if (percentage > 100) percentage = 100;

      if (exportProducts && selectedShopIds.length === 0) {
        setError('Please select at least one shop for products export.');
        return;
      }

      if (!exportProducts && !exportAuditLog) {
        setError('Please select at least one data type to export.');
        return;
      }

      // Validate shops have products before starting if exporting products
      const totalSelectedCount = shops
        .filter(s => selectedShopIds.includes(s.id))
        .reduce((sum, s) => sum + s.productCount, 0);

      if (exportProducts && totalSelectedCount === 0) {
        setError('Selected shops have no products to export.');
        return;
      }

      // Collect shop names for job metadata
      const selectedShopNames = shops
        .filter(s => selectedShopIds.includes(s.id))
        .map(s => s.name);

      // Create job ID
      const jobId = crypto.randomUUID();

      // Close modal immediately
      setShow(false);

      const productTarget = Math.max(1, Math.floor(totalSelectedCount * (percentage / 100)));
      const auditTarget = (exportAuditLog && auditLogCountLoaded && auditLogCount > 0)
        ? Math.max(1, Math.floor(auditLogCount * (percentage / 100)))
        : 0;
      
      const initialTotalTarget = (exportProducts ? productTarget : 0) + auditTarget;

      const exportState = {
        jobId,
        shopIds: selectedShopIds.slice(),
        shopNames: selectedShopNames,
        percentage,
        totalTarget: initialTotalTarget,
        processedItems: 0,
        currentShopIndex: 0,
        currentOffset: 0,
        exportProducts,
        exportAuditLog,
        auditLogTotalCount: auditLogCountLoaded ? auditLogCount : 0,
        purgeAfterExport,
        startedAt: Date.now(),
        status: 'running'
      };
      
      localStorage.setItem('snapbuy_export_job', JSON.stringify(exportState));
      
      // Trigger custom event so DataExportsList can pick it up immediately
      window.dispatchEvent(new Event('export_job_started'));
    });
  };

  const toggleShop = (shopId: string) => {
    setSelectedShopIds(prev =>
      prev.includes(shopId) ? prev.filter(id => id !== shopId) : [...prev, shopId]
    );
  };

  const filteredShops = shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase()));

  // Calculate UI summary
  const totalSelectedProducts = shops
    .filter(s => selectedShopIds.includes(s.id))
    .reduce((sum, s) => sum + s.productCount, 0);

  const projectedExportCount = shops
    .filter(s => selectedShopIds.includes(s.id))
    .reduce((sum, s) => {
      let perc = Number(exportPercentage);
      if (isNaN(perc) || perc < 1) perc = 1;
      if (perc > 100) perc = 100;
      return sum + (s.productCount > 0 ? Math.max(1, Math.floor(s.productCount * (perc / 100))) : 0);
    }, 0) + (exportAuditLog && auditLogCount > 0 ? Math.max(1, Math.floor(auditLogCount * ((Number(exportPercentage) || 50) / 100))) : 0);

  if (!show || !isBrowser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-500/20">
              <DownloadCloud size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Export Database Data</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Export older records to JSON backup</p>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Table Selection */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <Layers size={14} className="text-primary-500" /> Target Tables
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="checkbox"
                  checked={exportProducts}
                  onChange={() => setExportProducts(!exportProducts)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Products & Variants</span>
                    <span className="text-[10px] font-black uppercase bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Highlight</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ระบบจะทำการ Export ข้อมูล products พร้อมกับ product_variants ที่เกี่ยวข้องเสมอ เพื่อป้องกันปัญหาข้อมูลไม่สมบูรณ์
                  </p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="checkbox"
                  checked={exportAuditLog}
                  onChange={() => setExportAuditLog(!exportAuditLog)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">System Audit Log</span>
                    {auditLogCountLoaded && auditLogCount > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                        {auditLogCount.toLocaleString()} items
                      </span>
                    )}
                    {!auditLogCountLoaded && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md">
                        ⚠ ไม่ทราบจำนวน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ประวัติการทำรายการ (INSERT, UPDATE, DELETE) ทั้งหมดของระบบ
                  </p>
                  {!auditLogCountLoaded && exportAuditLog && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      ไม่สามารถนับจำนวนได้ — ตารางอาจมีข้อมูลจำนวนมาก ระบบจะดึงข้อมูลจนครบโดยอัตโนมัติ
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Shop Selection (Only for Products) */}
          <div className={`flex flex-col flex-1 min-h-[200px] ${!exportProducts ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Store size={14} className="text-primary-500" /> Select Shops (For Products)
                {loadingShops && <span className="inline-block w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin ml-1" />}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchShops}
                  disabled={loadingShops}
                  className="text-[10px] font-bold text-slate-400 hover:text-primary-500 transition-colors disabled:opacity-40"
                  title="Refresh shop counts"
                >
                  ↻ Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShopIds(selectedShopIds.length > 0 ? [] : shops.map(s => s.id))}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {selectedShopIds.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Search shops..."
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="mb-2 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white"
            />
            
            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl max-h-48">
              {loadingShops ? (
                <div className="flex items-center justify-center gap-2 p-6 text-slate-400">
                  <span className="inline-block w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">กำลังโหลดจำนวนสินค้าล่าสุด...</span>
                </div>
              ) : (
                <>
                  {filteredShops.map(shop => (
                    <label key={shop.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedShopIds.includes(shop.id)}
                          onChange={() => toggleShop(shop.id)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{shop.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {shop.productCount.toLocaleString()} items
                      </span>
                    </label>
                  ))}
                  {filteredShops.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-400">No shops found.</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Percentage */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <Percent size={14} className="text-primary-500" /> Export Percentage (per shop)
            </label>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                min="1"
                max="100"
                value={exportPercentage}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val !== '') {
                    let num = Number(val);
                    if (num > 100) num = 100;
                    if (num < 1) num = 1;
                    val = num.toString();
                  }
                  setExportPercentage(val);
                }}
                onBlur={() => {
                  if (exportPercentage === '') setExportPercentage('50');
                }}
                className="w-24 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-sm text-slate-500">% of oldest data</span>
            </div>

            {(selectedShopIds.length > 0 || exportAuditLog) && (
              <div className="p-3 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-900/30 rounded-xl flex flex-col gap-1">
                {exportProducts && selectedShopIds.length > 0 && (
                  <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    เลือกร้านค้าทั้งหมด: <strong className="font-black">{selectedShopIds.length} ร้าน</strong> (สินค้าทั้งหมด {totalSelectedProducts} รายการ)
                  </p>
                )}
                {exportAuditLog && (
                  <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    System Audit Log: <strong className="font-black">{auditLogCountLoaded ? `${auditLogCount.toLocaleString()} รายการ` : 'ไม่ทราบจำนวน (จะดึงจนครบ)'}</strong>
                  </p>
                )}
                {projectedExportCount > 0 && (
                  <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    ระบบจะทำการ Export ข้อมูลรวมทั้งหมดประมาณ: <strong className="font-black text-primary-600 dark:text-primary-300">{projectedExportCount.toLocaleString()} รายการ</strong>
                  </p>
                )}
              </div>
            )}

            {/* Large data warning — only when actually exceeding 50k */}
            {projectedExportCount > 50000 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-start gap-2.5 mt-2">
                <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-0.5">⚠️ ข้อมูลมีขนาดใหญ่ — อาจเกิด Timeout ได้</p>
                  <p className="text-[11px] text-amber-600/90 dark:text-amber-400/80 leading-relaxed">
                    แนะนำให้ Export ไม่เกิน <strong>50,000 รายการต่อครั้ง</strong> เพื่อป้องกัน Statement Timeout
                    {` (ปัจจุบัน: ${projectedExportCount.toLocaleString()} รายการ)`}
                    <br />ลองลดเปอร์เซ็นต์ลง หรือสร้าง Index ใน Supabase SQL Editor ก่อน:
                  </p>
                  <code className="block text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded mt-1 font-mono">
                    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON system_audit_log(created_at);
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Purge Option */}
          <div className="p-3 border border-orange-200 dark:border-orange-800/40 rounded-xl bg-orange-50/50 dark:bg-orange-900/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeAfterExport}
                onChange={() => setPurgeAfterExport(p => !p)}
                className="h-4 w-4 mt-0.5 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
              />
              <div>
                <p className="text-sm font-bold text-orange-700 dark:text-orange-400">ลบข้อมูลออกหลัง Export (Archive Mode)</p>
                <p className="text-xs text-orange-600/80 dark:text-orange-500/80 mt-0.5">
                  หลัง Export สำเร็จ ระบบจะ<strong>ลบข้อมูลที่ Export ออกไปแล้วออกจากฐานข้อมูลทันที</strong> เพื่อเพิ่มพื้นที่ดิสก์
                  คุณสามารถกู้คืนได้ภายหลังด้วยปุ่ม Restore
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/80 px-6 py-4 flex gap-3">
          <button
            onClick={() => setShow(false)}
            className="w-28 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
              purgeAfterExport
                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
                : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25'
            }`}
          >
            {purgeAfterExport ? '📦 Export & ลบออกจาก DB' : 'Export to JSON'}
          </button>
        </div>
      </div>
      {pinModal}
    </div>
  );
};
