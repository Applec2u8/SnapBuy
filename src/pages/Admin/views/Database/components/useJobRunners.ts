import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { saveExportChunk, getExportData, clearExportData } from '../../../../../lib/idb';
import { toast } from 'sonner';
import { logAdminAction } from '../../../../../lib/auditLog';

export interface LocalExportState {
  jobId: string;
  shopIds: string[];
  shopNames: string[];
  percentage: number;
  totalTarget: number;
  processedItems: number;
  currentShopIndex: number;
  currentOffset: number;
  exportProducts?: boolean;
  purgeAfterExport?: boolean;
  exportedProductIds?: string[]; // Track IDs to delete
  status: 'running' | 'uploading' | 'purging' | 'completed' | 'error';
  errorMsg?: string;
  startedAt?: number;
  totalFiles?: number;
  filesUploaded?: number;
  currentUploadPart?: number;
  uploadStartedAt?: number;
  totalPurgeItems?: number;
  purgedItems?: number;
}

export interface LocalRestoreState {
  jobId: string;
  files: string[];
  totalItems: number;
  processedItems: number;
  successCount: number;
  failedCount: number;
  status: 'running' | 'completed' | 'error';
  errorMsg?: string;
  startedAt?: number;
}

export function useJobRunners(onRefreshExports: () => void) {
  const [exportJob, setExportJob] = useState<LocalExportState | null>(null);
  const [restoreJob, setRestoreJob] = useState<LocalRestoreState | null>(null);

  const isExportRunning = useRef(false);
  const isRestoreRunning = useRef(false);
  const onRefreshExportsRef = useRef(onRefreshExports);
  useEffect(() => { onRefreshExportsRef.current = onRefreshExports; }, [onRefreshExports]);

  const runExport = useCallback(async (initialState: LocalExportState) => {
    if (isExportRunning.current) return;
    isExportRunning.current = true;

    let state = { ...initialState };

    try {
      if (state.totalTarget === 0) {
        let total = 0;
        if (state.exportProducts !== false) {
          for (const shopId of state.shopIds) {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('shop_id', shopId);
            if (count) total += Math.max(1, Math.floor(count * (state.percentage / 100)));
          }
        }
        state.totalTarget = total;
        localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
        setExportJob({ ...state });
      }

      const fetchLimit = 1000;

      // ── Process Products ──────────────────────────
      if (state.exportProducts !== false) {
        while (state.currentShopIndex < state.shopIds.length) {
          const shopId = state.shopIds[state.currentShopIndex];

        const { count: shopCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shopId);

        if (!shopCount || shopCount === 0) {
          state.currentShopIndex++;
          state.currentOffset = 0;
          localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
          continue;
        }

        const targetShopExportCount = Math.max(1, Math.floor(shopCount * (state.percentage / 100)));

        while (state.currentOffset < targetShopExportCount) {
          const remaining = targetShopExportCount - state.currentOffset;
          const currentLimit = Math.min(fetchLimit, remaining);

          const { data: chunk, error } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: true })
            .range(state.currentOffset, state.currentOffset + currentLimit - 1);

          if (error) throw error;
          if (!chunk || chunk.length === 0) break;

          const chunkIds = chunk.map((p: any) => p.id);
          
          let variants: any[] = [];
          const VAR_BATCH = 100;
          for (let i = 0; i < chunkIds.length; i += VAR_BATCH) {
            const batchIds = chunkIds.slice(i, i + VAR_BATCH);
            const { data: varBatch, error: varError } = await supabase
              .from('product_variants')
              .select('*')
              .in('product_id', batchIds);

            if (varError) throw varError;
            if (varBatch) variants.push(...varBatch);
          }

          await saveExportChunk(state.jobId, [{ products: chunk, variants: variants || [] }]);

          state.currentOffset += currentLimit;
          state.processedItems += chunk.length;
          localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
          setExportJob({ ...state });

          if (chunk.length < currentLimit) break;
        }

          state.currentShopIndex++;
          state.currentOffset = 0;
          localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
        }
      }



      if (state.processedItems === 0) throw new Error('ไม่พบข้อมูลที่จะ Export');

      toast.loading('กำลังเตรียมสร้างไฟล์ JSON...', { id: state.jobId });
      const chunks = await getExportData(state.jobId);
      
      // We will upload multiple files to prevent "maximum allowed size" error
      // Smaller chunks (5000) mean the progress bar updates more frequently
      const MAX_ITEMS_PER_FILE = 5000;
      
      let currentProducts: any[] = [];
      let currentVariants: any[] = [];
      let currentCount = 0;
      
      let allProductIds: string[] = [];
      
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      
      // Calculate approximate total files needed
      let totalItemsInChunks = 0;
      for (const c of chunks) {
        totalItemsInChunks += (c.products?.length || 0) + (c.variants?.length || 0);
      }
      const totalFiles = Math.max(1, Math.ceil(totalItemsInChunks / MAX_ITEMS_PER_FILE));
      
      state.status = 'uploading';
      state.totalFiles = totalFiles;
      state.filesUploaded = 0;
      state.uploadStartedAt = Date.now();
      setExportJob({ ...state });
      
      let partNumber = 1;

      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        if (c.products) {
          currentProducts.push(...c.products);
          allProductIds.push(...c.products.map((p: any) => p.id));
        }
        if (c.variants) currentVariants.push(...c.variants);

        currentCount += (c.products?.length || 0) + (c.variants?.length || 0);

        if (currentCount >= MAX_ITEMS_PER_FILE || i === chunks.length - 1) {
          if (currentCount === 0) continue;
          
          const exportData = { products: currentProducts, product_variants: currentVariants };
          const jsonString = JSON.stringify(exportData);
          
          const suffix = totalFiles > 1 ? `_part${partNumber}` : '';
          const fileName = `export_${timeStr}${suffix}.json`;
          
          // Update state to show we are currently working on this part
          state.currentUploadPart = partNumber;
          setExportJob({ ...state });
          
          toast.loading(`กำลังอัปโหลดไฟล์ที่ ${partNumber} จาก ${totalFiles}...`, { id: state.jobId });
          const { error: uploadError } = await supabase.storage
            .from('exports')
            .upload(fileName, jsonString, { contentType: 'application/json', upsert: true });

          if (uploadError) throw uploadError;

          const tableNames = [];
          if (currentProducts.length > 0) tableNames.push('products', 'product_variants');

          const { error: insertError } = await supabase.from('data_exports').insert({
            file_name: fileName,
            file_url: fileName,
            table_names: tableNames,
            record_count: currentProducts.length + currentVariants.length,
            shop_ids: state.shopIds,
            shop_names: state.shopNames,
          });

          if (insertError) throw new Error(`บันทึกข้อมูลลงตารางล้มเหลว: ${insertError.message}`);

          state.filesUploaded = partNumber;
          setExportJob({ ...state });
          
          partNumber++;
          currentProducts = [];
          currentVariants = [];
          currentCount = 0;
        }
      }

      await clearExportData(state.jobId);

      // ── Purge phase (Archive mode) ──────────────────────────
      if (state.purgeAfterExport) {
        state.status = 'purging';
        state.totalPurgeItems = allProductIds.length;
        state.purgedItems = 0;
        setExportJob({ ...state });

        let actuallyDeletedCount = 0;

        if (allProductIds.length > 0) {
          const BATCH = 500;
          toast.loading(`กำลังลบข้อมูล products ออกจากฐานข้อมูล...`, { id: state.jobId });

          for (let i = 0; i < allProductIds.length; i += BATCH) {
            const batch = allProductIds.slice(i, i + BATCH);
            const { data: deleted, error } = await supabase
              .from('products')
              .delete()
              .in('id', batch)
              .select('id');
              
            if (error) throw new Error(`ลบข้อมูล products ล้มเหลว: ${error.message}`);
            
            actuallyDeletedCount += (deleted?.length || 0);
            state.purgedItems += batch.length;
            setExportJob({ ...state });
          }
        }

        // If nothing was deleted despite having items to delete, warn the user about RLS
        if (state.totalPurgeItems > 0 && actuallyDeletedCount === 0) {
           toast.error('พบปัญหา: ไม่สามารถลบข้อมูลได้ อาจเกิดจาก Database RLS Policies ป้องกันการลบข้อมูล (Delete) กรุณาตรวจสอบสิทธิ์', { id: state.jobId, duration: 10000 });
           throw new Error('ไม่สามารถลบข้อมูลได้เนื่องจากติดสิทธิ์ Database RLS');
        }
      }

      state.status = 'completed';
      localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
      setExportJob({ ...state });

      // Export completed — no audit log write needed
      toast.success(
        state.purgeAfterExport
          ? `Archive สำเร็จ! สร้างไฟล์และลบออกจากฐานข้อมูลแล้ว`
          : 'ส่งออกข้อมูลสำเร็จ!',
        { id: state.jobId }
      );
      
      await logAdminAction(
        state.purgeAfterExport ? 'archive_database' : 'export_database',
        'database',
        undefined,
        state.shopNames.join(', ') || 'All Shops',
        { products: state.processedItems, files: state.totalFiles || 1 }
      );
      
      onRefreshExportsRef.current();

    } catch (e: any) {
      state.status = 'error';
      state.errorMsg = e.message;
      localStorage.setItem('snapbuy_export_job', JSON.stringify(state));
      setExportJob({ ...state });
      toast.error(`Export ล้มเหลว: ${e.message}`, { id: state.jobId });
    } finally {
      isExportRunning.current = false;
    }
  }, []);

  const runRestore = useCallback(async (initialState: LocalRestoreState) => {
    if (isRestoreRunning.current) return;
    isRestoreRunning.current = true;

    let state = { ...initialState };

    try {
      // 1. First loop to calculate total items across all files
      let totalItems = 0;
      if (state.totalItems === 0) {
        toast.loading(`กำลังคำนวณจำนวนข้อมูล...`, { id: state.jobId });
        for (const fName of state.files) {
          const { data, error } = await supabase.storage.from('exports').download(fName);
          if (error) continue;
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            totalItems += parsed.length;
          } else {
            totalItems += (parsed.products?.length || 0) + (parsed.product_variants?.length || 0);
          }
        }
        state.totalItems = totalItems;
        setRestoreJob({ ...state });
      }

      toast.loading(`กำลังกู้คืนข้อมูลทั้งหมด...`, { id: state.jobId });
      const CHUNK_SIZE = 200;


      // Helper: detect permission/RLS errors to fail fast
      const isAuthError = (err: any) =>
        err?.status === 403 || err?.code === 'PGRST301' || /forbidden|permission denied|rls/i.test(err?.message || '');

      // 2. Loop through each file, download, parse, and upsert
      for (let fileIndex = 0; fileIndex < state.files.length; fileIndex++) {
        const fName = state.files[fileIndex];
        toast.loading(`กำลังโหลดไฟล์ที่ ${fileIndex + 1} / ${state.files.length}...`, { id: state.jobId });
        const { data, error } = await supabase.storage.from('exports').download(fName);
        if (error) throw error;
        
        const text = await data.text();
        const parsed = JSON.parse(text);
        
        let products: any[] = [];
        let variants: any[] = [];

        if (Array.isArray(parsed)) {
          products = parsed.map((p: any) => { const { variants: _v, ...rest } = p; return rest; });
          variants = parsed.flatMap((p: any) => p.variants || []);
        } else {
          products = parsed.products || [];
          variants = parsed.product_variants || [];
          // Note: system_audit_log is no longer included in exports
        }

        toast.loading(`กำลังนำเข้าข้อมูล ไฟล์ ${fileIndex + 1}/${state.files.length}...`, { id: state.jobId });

        // Upsert Products
        for (let i = 0; i < products.length; i += CHUNK_SIZE) {
          const chunk = products.slice(i, i + CHUNK_SIZE);
          const { error: upsertError } = await supabase.from('products').upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });

          if (upsertError) {
            // If it's an auth/RLS error, fail immediately — don't retry row by row
            if (isAuthError(upsertError)) {
              throw new Error(`ไม่มีสิทธิ์ upsert ข้อมูล products — กรุณาเพิ่ม RLS Policy สำหรับ INSERT/UPDATE ใน Supabase`);
            }
            // For other errors, count as failed but continue
            state.failedCount += chunk.length;
            state.processedItems += chunk.length;
          } else {
            state.successCount += chunk.length;
            state.processedItems += chunk.length;
          }
          localStorage.setItem('snapbuy_restore_job', JSON.stringify(state));
          setRestoreJob({ ...state });
        }

        // Upsert Variants
        for (let i = 0; i < variants.length; i += CHUNK_SIZE) {
          const chunk = variants.slice(i, i + CHUNK_SIZE);
          const { error: upsertError } = await supabase.from('product_variants').upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });

          if (upsertError) {
            if (isAuthError(upsertError)) {
              throw new Error(`ไม่มีสิทธิ์ upsert ข้อมูล product_variants — กรุณาเพิ่ม RLS Policy สำหรับ INSERT/UPDATE ใน Supabase`);
            }
            state.failedCount += chunk.length;
            state.processedItems += chunk.length;
          } else {
            state.successCount += chunk.length;
            state.processedItems += chunk.length;
          }
          localStorage.setItem('snapbuy_restore_job', JSON.stringify(state));
          setRestoreJob({ ...state });
        }
      }

      state.status = 'completed';
      localStorage.setItem('snapbuy_restore_job', JSON.stringify(state));
      setRestoreJob({ ...state });

      // Restore completed — no audit log write needed
      toast.success(`กู้คืนสำเร็จ ${state.successCount} รายการ / ล้มเหลว ${state.failedCount} รายการ`, { id: state.jobId });
      
      await logAdminAction(
        'restore_database',
        'database',
        undefined,
        'Full Restore',
        { products: state.successCount, failed: state.failedCount, files: state.files.length }
      );

    } catch (e: any) {
      state.status = 'error';
      state.errorMsg = e.message;
      localStorage.setItem('snapbuy_restore_job', JSON.stringify(state));
      setRestoreJob({ ...state });
      toast.error(`Restore ล้มเหลว: ${e.message}`, { id: state.jobId });
    } finally {
      isRestoreRunning.current = false;
    }
  }, []);

  useEffect(() => {
    const handleExportTrigger = () => {
      const raw = localStorage.getItem('snapbuy_export_job');
      if (!raw) return;
      const state: LocalExportState = JSON.parse(raw);
      setExportJob(state);
      if (state.status === 'running') runExport(state);
    };

    const handleRestoreTrigger = () => {
      const raw = localStorage.getItem('snapbuy_restore_job');
      if (!raw) return;
      const state: LocalRestoreState = JSON.parse(raw);
      setRestoreJob(state);
      if (state.status === 'running') runRestore(state);
    };

    handleExportTrigger();
    handleRestoreTrigger();

    window.addEventListener('export_job_started', handleExportTrigger);
    window.addEventListener('restore_job_started', handleRestoreTrigger);
    return () => {
      window.removeEventListener('export_job_started', handleExportTrigger);
      window.removeEventListener('restore_job_started', handleRestoreTrigger);
    };
  }, [runExport, runRestore]);

  const clearExport = () => {
    localStorage.removeItem('snapbuy_export_job');
    setExportJob(null);
  };

  const clearRestore = () => {
    localStorage.removeItem('snapbuy_restore_job');
    setRestoreJob(null);
  };

  return { exportJob, restoreJob, clearExport, clearRestore };
}
