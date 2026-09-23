import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { FileJson, Download, RefreshCw, Trash2, HardDrive, Store, Calendar, Loader2, AlertCircle, CheckCircle2, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { logAdminAction } from '../../../../../lib/auditLog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { ExportJob } from './ExportDataModal';
import { useJobRunners } from './useJobRunners';
import { useAdminPin } from '../../../../../hooks/useAdminPin';

interface DataExport {
  id: string;
  file_name: string;
  file_url: string;
  table_names: string[];
  shop_ids: string[];
  shop_names: string[] | null;
  record_count: number;
  created_at: string;
}

type PendingJob = ExportJob & { status: 'running' | 'done' | 'error'; errorMsg?: string };

interface Props {
  pendingJobs?: PendingJob[];
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff} วินาทีที่แล้ว`;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
};

// ── Micro-component: isolated upload progress bar ──────────────────────────
// Keeps the 500ms setInterval re-renders scoped to this tiny element,
// preventing the entire DataExportsList from re-rendering on every tick.
const UploadProgressBar = React.memo(({ currentUploadPart }: { currentUploadPart: number | undefined }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 85) return prev + Math.floor(Math.random() * 15) + 5;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [currentUploadPart]);

  return (
    <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-700">
      <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500 dark:text-slate-400">
        <span>
          {currentUploadPart ? (
            <>3. กำลังอัปโหลดไฟล์ที่ <span className="text-sky-500">{currentUploadPart}</span></>
          ) : 'กำลังเตรียมไฟล์...'}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-sky-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});
UploadProgressBar.displayName = 'UploadProgressBar';



const getETA = (startedAt?: number, processed: number = 0, total: number = 0) => {
  if (!startedAt || processed === 0 || total === 0) return 'กำลังคำนวณ...';
  const elapsed = (Date.now() - startedAt) / 1000;
  if (elapsed < 1) return 'กำลังคำนวณ...'; // wait 1 sec to get stable rate
  const rate = processed / elapsed;
  if (rate <= 0) return 'กำลังคำนวณ...';
  const remaining = total - processed;
  const etaSeconds = remaining / rate;
  if (!isFinite(etaSeconds) || etaSeconds < 0) return 'กำลังคำนวณ...';
  
  if (etaSeconds < 60) return `ประมาณ ${Math.max(1, Math.ceil(etaSeconds))} วินาที`;
  if (etaSeconds < 3600) return `ประมาณ ${Math.ceil(etaSeconds / 60)} นาที`;
  return `ประมาณ ${Math.ceil(etaSeconds / 3600)} ชั่วโมง`;
};



export const DataExportsList: React.FC<Props> = () => {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const { requirePin, pinModal } = useAdminPin();

  const groupedExports = useMemo(() => {
    const groups: Record<string, DataExport[]> = {};
    exports.forEach((exp: DataExport) => {
      const baseNameMatch = exp.file_name.match(/^(export_\d{8}_\d{6})/);
      const baseName = baseNameMatch ? baseNameMatch[1] : exp.file_name;
      if (!groups[baseName]) groups[baseName] = [];
      groups[baseName].push(exp);
    });
    
    return Object.entries(groups).map(([name, items]: [string, DataExport[]]) => {
      items.sort((a: DataExport, b: DataExport) => a.file_name.localeCompare(b.file_name));
      return {
        id: items[0].id,
        baseName: name,
        items,
        filesCount: items.length,
        createdAt: items[0].created_at,
        totalRecords: items.reduce((sum: number, item: DataExport) => sum + item.record_count, 0),
        shopNames: Array.from(new Set(items.flatMap((i: DataExport) => i.shop_names || []))),
        tableNames: Array.from(new Set(items.flatMap((i: DataExport) => i.table_names || [])))
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [exports]);

  const fetchExports = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('data_exports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') { console.warn('data_exports table not found'); return; }
        throw error;
      }
      setExports(data || []);
    } catch (e) {
      console.error('Failed to fetch data exports', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const { exportJob, restoreJob, clearExport, clearRestore } = useJobRunners(fetchExports);

  useEffect(() => { fetchExports(); }, [fetchExports]);

  // Auto-refresh when export job completes
  useEffect(() => {
    if (exportJob?.status === 'completed') {
      fetchExports();
    }
  }, [exportJob?.status, fetchExports]);

  // NOTE: Upload progress animation has been moved to <UploadProgressBar />
  // to prevent the 500ms setInterval from re-rendering the entire component.

  const handleImport = async (group: typeof groupedExports[0]) => {
    requirePin(async () => {
      if (!window.confirm(`คุณต้องการนำเข้าข้อมูลทั้งหมด ${group.totalRecords.toLocaleString()} รายการ (${group.filesCount} ไฟล์) ใช่หรือไม่?\nข้อมูลที่มีอยู่เดิมในระบบจะถูกแทนที่หากไอดีตรงกัน`)) return;

      setImportingId(group.id);
      try {
        const restoreState = {
          jobId: crypto.randomUUID(),
          files: group.items.map(i => i.file_name),
          totalItems: 0,
          processedItems: 0,
          successCount: 0,
          failedCount: 0,
          status: 'running',
          startedAt: Date.now()
        };
        
        localStorage.setItem('snapbuy_restore_job', JSON.stringify(restoreState));
        window.dispatchEvent(new Event('restore_job_started'));
      } catch (e: any) {
        toast.error('Import ล้มเหลว: ' + e.message);
      } finally {
        setImportingId(null);
      }
    });
  };

  const handleDelete = async (exp: DataExport) => {
    if (!window.confirm(`Delete backup "${exp.file_name}"?\n\nThis will permanently remove the backup file.`)) return;
    try {
      await supabase.storage.from('exports').remove([exp.file_url || exp.file_name]);
      await supabase.from('data_exports').delete().eq('id', exp.id);
      await logAdminAction('delete_database_backup', 'database', exp.id, exp.file_name);
      fetchExports();
    } catch (e) { console.error('Failed to delete export', e); }
  };

  const handleDownloadJson = async (group: typeof groupedExports[0], closeDropdown: () => void) => {
    closeDropdown();
    setDownloadingId(group.id);
    const toastId = `dl-${group.id}`;
    toast.loading(`กำลังดาวน์โหลด JSON...`, { id: toastId });
    try {
      for (const item of group.items) {
        const { data, error } = await supabase.storage.from('exports').download(item.file_name);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (group.items.length > 1) await new Promise(r => setTimeout(r, 400));
      }
      toast.success(
        group.items.length > 1 ? `ดาวน์โหลด ${group.items.length} ไฟล์ JSON สำเร็จ!` : `ดาวน์โหลด "${group.items[0].file_name}" สำเร็จ!`,
        { id: toastId }
      );
    } catch (e: any) {
      toast.error(`ดาวน์โหลดล้มเหลว: ${e.message}`, { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadExcel = async (group: typeof groupedExports[0], closeDropdown: () => void) => {
    closeDropdown();
    setDownloadingId(group.id);
    const toastId = `dlx-${group.id}`;
    toast.loading(`กำลังสร้าง Excel...`, { id: toastId });
    try {
      let allProducts: any[] = [];
      let allVariants: any[] = [];
      let allAuditLogs: any[] = [];

      for (const item of group.items) {
        const { data, error } = await supabase.storage.from('exports').download(item.file_name);
        if (error) throw error;
        const parsed = JSON.parse(await data.text());
        if (Array.isArray(parsed)) {
          allProducts.push(...parsed.map(({ variants: _v, ...rest }: any) => rest));
          allVariants.push(...parsed.flatMap((p: any) => p.variants || []));
        } else {
          allProducts.push(...(parsed.products || []));
          allVariants.push(...(parsed.product_variants || []));
          allAuditLogs.push(...(parsed.system_audit_log || []));
        }
      }

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Products ──────────────────────────────────────────
      if (allProducts.length > 0) {
        const productRows = allProducts.map((p: any) => ({
          'รหัสสินค้า (ID)': p.id,
          'ชื่อสินค้า': p.name,
          'คำอธิบาย': p.description,
          'ราคา (บาท)': p.price,
          'ราคาเดิม (บาท)': p.original_price,
          'สัญลักษณ์ร้าน': p.shop_id,
          'หมวดหมู่ (ID)': p.category_id,
          'สต็อก': p.stock,
          'เผยแพร่ (Published)': p.is_published ? 'ใช่' : 'ไม่',
          'ยอดคงค้าง': p.likes_count ?? 0,
          'ยอดวิว': p.views_count ?? 0,
          'ยอด Boost': p.boost_count ?? 0,
          'สร้างเมื่อ': p.created_at ? new Date(p.created_at).toLocaleString('th-TH') : '',
          'อัปเดตล่าสุด': p.updated_at ? new Date(p.updated_at).toLocaleString('th-TH') : '',
        }));
        const wsProducts = XLSX.utils.json_to_sheet(productRows);
        // Set column widths
        wsProducts['!cols'] = [20,30,40,12,12,36,36,10,14,10,10,10,22,22].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, wsProducts, 'สินค้า (Products)');
      }

      // ── Sheet 2: Product Variants ──────────────────────────────────
      if (allVariants.length > 0) {
        const variantRows = allVariants.map((v: any) => ({
          'รหัส Variant (ID)': v.id,
          'รหัสสินค้า (Product ID)': v.product_id,
          'ชื่อตัวเลือก': v.name,
          'ราคา (บาท)': v.price,
          'สต็อก': v.stock,
          'สี': v.color,
          'ไซส์': v.size,
          'สร้างเมื่อ': v.created_at ? new Date(v.created_at).toLocaleString('th-TH') : '',
        }));
        const wsVariants = XLSX.utils.json_to_sheet(variantRows);
        wsVariants['!cols'] = [36,36,25,12,10,15,10,22].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, wsVariants, 'ตัวเลือก (Variants)');
      }

      // ── Sheet 3 & 4: Audit Logs and Details ────────────────────────
      if (allAuditLogs.length > 0) {
        const detailsSheetName = 'รายละเอียด (Details)';
        const logIdToDetailRow = new Map<string, number>();
        const detailsRows: any[] = [];
        let detailRowIndex = 2; // Row 1 is header

        for (const l of allAuditLogs) {
          if (l.details && typeof l.details === 'object') {
            const row: any = {
              'รหัส Log (ID)': l.id,
              'การกระทำ (Action)': l.action,
            };
            for (const [k, v] of Object.entries(l.details)) {
              row[k] = typeof v === 'object' ? JSON.stringify(v) : v;
            }
            detailsRows.push(row);
            logIdToDetailRow.set(l.id, detailRowIndex);
            detailRowIndex++;
          }
        }

        const auditRows = allAuditLogs.map((l: any) => {
          const dRow = logIdToDetailRow.get(l.id);
          return {
            'รหัส (ID)': l.id,
            'ประเภทการทำรายการ': l.action,
            'ตาราง': l.table_name,
            'รหัสข้อมูล': l.record_id,
            'รายละเอียด': dRow ? 'ดูรายละเอียด ➔' : (l.details ? (typeof l.details === 'object' ? JSON.stringify(l.details) : l.details) : ''),
            'เวลา': l.created_at ? new Date(l.created_at).toLocaleString('th-TH') : '',
          };
        });
        
        const wsAudit = XLSX.utils.json_to_sheet(auditRows);
        
        // Add Hyperlinks for "รายละเอียด" column (Column E, Index 4)
        allAuditLogs.forEach((l, idx) => {
          const dRow = logIdToDetailRow.get(l.id);
          if (dRow) {
            const cellRef = XLSX.utils.encode_cell({ c: 4, r: idx + 1 });
            if (wsAudit[cellRef]) {
              wsAudit[cellRef].l = { Target: `#'${detailsSheetName}'!A${dRow}` };
            }
          }
        });

        wsAudit['!cols'] = [36,20,20,36,20,22].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, wsAudit, 'ประวัติ (Audit Log)');

        if (detailsRows.length > 0) {
          const wsDetails = XLSX.utils.json_to_sheet(detailsRows);
          XLSX.utils.book_append_sheet(wb, wsDetails, detailsSheetName);
        }
      }

      if (wb.SheetNames.length === 0) throw new Error('ไม่พบข้อมูลในไฟล์');

      XLSX.writeFile(wb, `${group.baseName}.xlsx`);
      toast.success(`สร้าง Excel สำเร็จ! (${wb.SheetNames.join(', ')})`, { id: toastId });
    } catch (e: any) {
      toast.error(`สร้าง Excel ล้มเหลว: ${e.message}`, { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm animate-pulse h-40 mb-6" />;
  }

  const hasContent = exportJob !== null || restoreJob !== null || exports.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl">
            <HardDrive size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Exports (Backups)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {exports.length > 0 ? `${exports.length} ไฟล์สำรองข้อมูล` : 'ยังไม่มีไฟล์สำรองข้อมูล'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchExports}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:text-primary-500"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        {!hasContent ? (
          <div className="p-12 text-center">
            <FileJson size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm text-slate-400 font-bold">ยังไม่มีไฟล์สำรองข้อมูล</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">กด Export Data เพื่อสร้าง Backup แรก</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">

            {/* ── Pending / In-Progress Jobs ── */}
            {exportJob && (
              <div className="flex flex-col p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 last:border-0 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      {exportJob.status === 'running' || exportJob.status === 'uploading' ? <Loader2 size={16} className="animate-spin" /> : 
                       exportJob.status === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
                       <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {exportJob.status === 'running' ? 'กำลังดึงข้อมูลจากฐานข้อมูล...' :
                         exportJob.status === 'uploading' ? 'กำลังสร้างและอัปโหลดไฟล์...' :
                         exportJob.status === 'purging' ? 'กำลังลบข้อมูลออกจากระบบ...' :
                         exportJob.status === 'error' ? 'Export ล้มเหลว' : 'Export สำเร็จ'}
                      </p>
                      {(exportJob.status === 'running' || exportJob.status === 'uploading' || exportJob.status === 'purging') && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exportJob.status === 'running' ? (
                            <>
                              <span className="font-black text-indigo-500">{exportJob.processedItems.toLocaleString()}</span>
                              <span className="text-slate-400"> รายการ</span>
                              {exportJob.totalTarget > 0 && (
                                <span className="text-slate-400"> / ทั้งหมด <span className="font-bold text-slate-600 dark:text-slate-300">{exportJob.totalTarget.toLocaleString()}</span> รายการ</span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-black text-sky-500">{exportJob.filesUploaded?.toLocaleString() || 0}</span>
                              <span className="text-slate-400"> ไฟล์</span>
                              {exportJob.totalFiles && exportJob.totalFiles > 0 && (
                                <span className="text-slate-400"> / ทั้งหมด <span className="font-bold text-slate-600 dark:text-slate-300">{exportJob.totalFiles.toLocaleString()}</span> ไฟล์</span>
                              )}
                            </>
                          )}
                        </p>
                      )}
                      {exportJob.status === 'error' && exportJob.errorMsg && (
                        <p className="text-xs text-red-500 mt-0.5">{exportJob.errorMsg}</p>
                      )}
                    </div>
                  </div>
                  
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {exportJob.status === 'running' || exportJob.status === 'uploading' || exportJob.status === 'purging' ? (
                      <div className="flex flex-col items-end">
                        <span className={`text-lg font-black tabular-nums leading-none ${exportJob.status === 'purging' ? 'text-rose-500' : 'text-indigo-500'}`}>
                          {exportJob.status === 'running' 
                            ? (exportJob.totalTarget > 0 ? `${Math.floor((exportJob.processedItems / exportJob.totalTarget) * 100)}%` : '—')
                            : exportJob.status === 'uploading'
                            ? (exportJob.totalFiles && exportJob.totalFiles > 0 ? `${Math.floor(((exportJob.filesUploaded || 0) / exportJob.totalFiles) * 100)}%` : '—')
                            : (exportJob.totalPurgeItems && exportJob.totalPurgeItems > 0 ? `${Math.floor(((exportJob.purgedItems || 0) / exportJob.totalPurgeItems) * 100)}%` : '—')}
                        </span>
                        {exportJob.status === 'running' ? (
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {getETA(exportJob.startedAt, exportJob.processedItems, exportJob.totalTarget)}
                          </span>
                        ) : exportJob.status === 'uploading' && (
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {getETA(exportJob.uploadStartedAt, exportJob.filesUploaded, exportJob.totalFiles)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button onClick={clearExport} className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bars */}
                {(exportJob.status === 'running' || exportJob.status === 'uploading' || exportJob.status === 'purging') && (
                  <div className="flex flex-col gap-3 mt-2 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    
                    {/* 1. Download Data Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-500 dark:text-slate-400">
                        <span>
                          1. ดึงข้อมูลจากฐานข้อมูลมาที่ระบบ (Download) 
                          {(exportJob.status === 'uploading' || exportJob.status === 'purging') && <span className="text-emerald-500 ml-1">— ดึงครบ 100% แล้ว</span>}
                        </span>
                        <span>{exportJob.status === 'running' && exportJob.totalTarget > 0 ? `${Math.min(100, Math.floor((exportJob.processedItems / exportJob.totalTarget) * 100))}%` : '100%'}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${exportJob.status === 'running' && exportJob.totalTarget > 0 ? Math.min(100, Math.floor((exportJob.processedItems / exportJob.totalTarget) * 100)) : 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 2 & 3. Upload File Bars */}
                    {(exportJob.status === 'uploading' || exportJob.status === 'purging' || (exportJob.status === 'running' && exportJob.totalFiles)) && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                        {/* Overall Files Upload */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-500 dark:text-slate-400">
                            <span>2. อัปโหลดไฟล์ภาพรวม (Total Uploads) {(exportJob.status === 'purging') && <span className="text-emerald-500 ml-1">— อัปโหลดเสร็จสมบูรณ์</span>}</span>
                            <span>{exportJob.status === 'purging' ? '100%' : (exportJob.totalFiles ? `${Math.floor(((exportJob.filesUploaded || 0) / exportJob.totalFiles) * 100)}%` : '0%')}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${exportJob.status === 'purging' ? 100 : (exportJob.totalFiles ? Math.floor(((exportJob.filesUploaded || 0) / exportJob.totalFiles) * 100) : 0)}%` }}
                            />
                          </div>
                        </div>

                        {/* Current File Upload — rendered by isolated micro-component to limit re-renders */}
                        {exportJob.status === 'uploading' && (
                          <UploadProgressBar currentUploadPart={exportJob.currentUploadPart} />
                        )}
                        
                        {/* 4. Purge Bar (Red) */}
                        {exportJob.status === 'purging' && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                            <div className="flex justify-between text-[11px] mb-1.5 font-bold text-rose-500">
                              <span>4. ลบข้อมูลที่ Export แล้วออกจากระบบ (Purging)</span>
                              <span>{exportJob.totalPurgeItems ? `${Math.floor(((exportJob.purgedItems || 0) / exportJob.totalPurgeItems) * 100)}%` : '0%'}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                style={{ width: `${exportJob.totalPurgeItems ? Math.floor(((exportJob.purgedItems || 0) / exportJob.totalPurgeItems) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {restoreJob && (
              <div className="flex flex-col p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                        {restoreJob.status === 'running' ? <Loader2 size={16} className="animate-spin" /> : 
                         restoreJob.status === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
                         <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {restoreJob.status === 'running' ? `กำลังนำเข้าข้อมูล (${restoreJob.processedItems.toLocaleString()} / ${restoreJob.totalItems.toLocaleString()})...` :
                         restoreJob.status === 'error' ? 'Restore ล้มเหลว' : 'Restore สำเร็จ'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-600">
                          สำเร็จ {restoreJob.successCount}
                        </span>
                        {restoreJob.failedCount > 0 && (
                          <span className="text-[10px] text-red-500">
                            ล้มเหลว {restoreJob.failedCount}
                          </span>
                        )}
                      </div>
                      {restoreJob.status === 'error' && restoreJob.errorMsg && (
                        <p className="text-xs text-red-500 mt-0.5">{restoreJob.errorMsg}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {restoreJob.status === 'running' ? (
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-purple-500 tabular-nums">
                          {restoreJob.totalItems > 0 ? `${Math.floor((restoreJob.processedItems / restoreJob.totalItems) * 100)}%` : '0%'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {getETA(restoreJob.startedAt, restoreJob.processedItems, restoreJob.totalItems)}
                        </span>
                      </div>
                    ) : (
                      <button onClick={clearRestore} className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                {restoreJob.status === 'running' && (
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300 rounded-full" 
                      style={{ width: `${restoreJob.totalItems > 0 ? (restoreJob.processedItems / restoreJob.totalItems) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Completed Export Files (Grouped) ── */}
            {groupedExports.map((group: typeof groupedExports[0]) => (
              <ExportGroupItem
                key={group.id}
                group={group}
                downloadingId={downloadingId}
                importingId={importingId}
                exportJobStatus={exportJob?.status}
                restoreJobStatus={restoreJob?.status}
                onDownloadJson={handleDownloadJson}
                onDownloadExcel={handleDownloadExcel}
                onImport={handleImport}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      {pinModal}
    </div>
  );
};

// ── Memoized Export Group Item to prevent slow re-renders ──
const ExportGroupItem = React.memo(({
  group,
  downloadingId,
  importingId,
  exportJobStatus,
  restoreJobStatus,
  onDownloadJson,
  onDownloadExcel,
  onImport,
  onDelete
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const shopNames = group.shopNames && group.shopNames.length > 0 ? group.shopNames : ['All Shops'];

  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl mt-0.5 flex-shrink-0">
          <FileJson size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate font-mono">
            {group.baseName} <span className="text-xs font-medium text-slate-400">({group.filesCount} ไฟล์)</span>
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <Calendar size={9} />
              {formatDateTime(group.createdAt)}
            </span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[10px] text-slate-400">({timeAgo(group.createdAt)})</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Store size={9} className="text-primary-400 flex-shrink-0" />
            {shopNames.map((name: string, i: number) => (
              <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30">
                {name}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {group.totalRecords.toLocaleString()} records
            </span>
            {group.tableNames && group.tableNames.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                {group.tableNames.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto md:flex-nowrap md:flex-shrink-0 md:ml-3 justify-start md:justify-end mt-2 md:mt-0" ref={dropdownRef}>
        {/* Download dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={downloadingId === group.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-100 dark:border-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingId === group.id
              ? <Loader2 size={12} className="animate-spin" />
              : <Download size={12} />}
            <span>Download</span>
            <ChevronDown size={11} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Smooth animated Dropdown menu */}
          <div 
            className={`absolute left-0 md:left-auto md:right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[60] overflow-hidden transition-all duration-200 origin-top-left md:origin-top-right ${
              isOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
            }`}
          >
            <button
              onClick={() => onDownloadJson(group, () => setIsOpen(false))}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <FileJson size={14} className="text-amber-500 flex-shrink-0" />
              <div>
                <p>JSON File</p>
                <p className="text-[10px] font-normal text-slate-400">{group.filesCount} ไฟล์ · {group.totalRecords.toLocaleString()} records</p>
              </div>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            <button
              onClick={() => onDownloadExcel(group, () => setIsOpen(false))}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <FileSpreadsheet size={14} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p>Excel File (.xlsx)</p>
                <p className="text-[10px] font-normal text-slate-400">สินค้า · ตัวเลือก · Log</p>
              </div>
            </button>
          </div>
        </div>

        {/* Restore button */}
        <button
          onClick={() => onImport(group)}
          disabled={importingId === group.id || exportJobStatus === 'running' || restoreJobStatus === 'running'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importingId === group.id ? 'Restoring...' : 'Restore'}
        </button>
        {/* Delete button */}
        <button
          onClick={() => onDelete(group.items[0])}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
});
