import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Database, HardDrive, Activity, ExternalLink, RefreshCw, Wifi, Terminal, DownloadCloud, Clock, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { ExportDataModal } from './components/ExportDataModal';
import { DataExportsList } from './components/DataExportsList';
import type { ExportJob } from './components/ExportDataModal';
import { toast } from 'sonner';

interface DbStats {
  database_size_bytes: number;
  active_connections: number;
  total_connections: number;
}

export const DatabaseDashboard: React.FC = () => {
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reclaimCountdown, setReclaimCountdown] = useState<number | null>(null);
  const [pendingJobs, setPendingJobs] = useState<(ExportJob & { status: 'running' | 'done' | 'error'; errorMsg?: string })[]>([]);
  const [vacuumRunning, setVacuumRunning] = useState(false);
  const [vacuumResult, setVacuumResult] = useState<{ ok: boolean; message: string; elapsed_ms?: number } | null>(null);
  const [isJobRunning, setIsJobRunning] = useState(false);

  const fetchDbStats = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data: dbData, error: dbError } = await supabase.rpc('get_db_stats');
      if (!dbError && dbData) {
        setDbStats(dbData);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn('Failed to fetch dashboard db stats', e);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  };

  const handleVacuumFull = async () => {
    setVacuumRunning(true);
    setVacuumResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('vacuum-full');
      if (error) {
        setVacuumResult({ ok: false, message: error.message ?? 'Edge Function error' });
        toast.error(`VACUUM FULL ล้มเหลว: ${error.message}`);
      } else if (data?.ok === false) {
        setVacuumResult({ ok: false, message: data.error ?? 'Unknown error', elapsed_ms: data.elapsed_ms });
        toast.error(`VACUUM FULL ล้มเหลว: ${data.error}`);
      } else {
        setVacuumResult({ ok: true, message: data?.message ?? 'VACUUM FULL สำเร็จ', elapsed_ms: data?.elapsed_ms });
        toast.success('ล้าง Dead Tuples สำเร็จ — คืนพื้นที่ disk เรียบร้อยแล้ว!');
        setTimeout(() => fetchDbStats(true), 1500);
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Unexpected error';
      setVacuumResult({ ok: false, message: msg });
      toast.error(`VACUUM FULL ล้มเหลว: ${msg}`);
    } finally {
      setVacuumRunning(false);
    }
  };


  useEffect(() => {
    fetchDbStats();
    const interval = setInterval(() => { fetchDbStats(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reclaimCountdown === null || reclaimCountdown <= 0) return;
    const interval = setInterval(() => {
      setReclaimCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [reclaimCountdown]);

  useEffect(() => {
    const checkJobs = () => {
      const rawE = localStorage.getItem('snapbuy_export_job');
      const rawR = localStorage.getItem('snapbuy_restore_job');
      const e = rawE ? JSON.parse(rawE) : null;
      const r = rawR ? JSON.parse(rawR) : null;
      setIsJobRunning(e?.status === 'running' || r?.status === 'running');
    };
    checkJobs();
    // storage event fires when localStorage changes in the same tab (via the job runners)
    // We also keep a 5-second fallback poll — much cheaper than the original 1-second interval
    window.addEventListener('storage', checkJobs);
    const fallback = setInterval(checkJobs, 5000);
    return () => {
      window.removeEventListener('storage', checkJobs);
      clearInterval(fallback);
    };
  }, []);

  const diskMB = dbStats ? dbStats.database_size_bytes / (1024 * 1024) : 0;
  const diskPct = Math.min(100, (diskMB / 500) * 100);
  const connPct = dbStats
    ? Math.min(100, (dbStats.active_connections / dbStats.total_connections) * 100)
    : 0;

  const diskColor = diskPct > 80 ? '#ef4444' : diskPct > 60 ? '#f59e0b' : '#22c55e';
  const connColor = connPct > 80 ? '#ef4444' : connPct > 50 ? '#f59e0b' : '#6366f1';

  return (
    <div className="space-y-6 pb-12 w-full max-w-full min-w-0 overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Database Monitor
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString('th-TH')}`
              : 'กำลังโหลดข้อมูล...'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            disabled={isJobRunning}
            className={`flex items-center justify-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-sm flex-1 sm:flex-none whitespace-nowrap transition-colors ${
              isJobRunning ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            <DownloadCloud size={14} />
            {isJobRunning ? 'Job Running...' : 'Export Data'}
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 flex-1 sm:flex-none whitespace-nowrap"
          >
            Supabase Dashboard <ExternalLink size={12} />
          </a>
          <button
            onClick={() => { fetchDbStats(true); }}
            className="p-2.5 text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all hover:text-primary-500 border border-slate-200 dark:border-slate-700 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Primary DB Info Card ───────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start md:items-center gap-3 sm:gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex-shrink-0 mt-1 md:mt-0">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Primary Database
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-0.5 leading-relaxed">
                Northeast Asia (Seoul) · ap-northeast-2 · t4g.nano
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`self-start md:self-auto flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${dbStats
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : loading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-red-500/10 text-red-500'
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${dbStats ? 'bg-green-500 animate-pulse' : loading ? 'bg-slate-400' : 'bg-red-500'}`}
            />
            {dbStats ? 'Online' : loading ? 'Loading' : 'Error'}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse min-w-0" />
            ))
          ) : dbStats ? (
            <>
              <div className="min-w-0 break-words">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Disk Used</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {diskMB.toFixed(1)}{' '}
                  <span className="text-sm font-bold text-slate-400">MB</span>
                </p>
              </div>
              <div className="min-w-0 break-words">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Disk %</p>
                <p
                  className={`text-xl font-black tracking-tight ${diskPct > 80
                      ? 'text-red-500'
                      : diskPct > 60
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                >
                  {diskPct.toFixed(1)}%
                </p>
              </div>
              <div className="min-w-0 break-words">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Connections</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {dbStats.active_connections}{' '}
                  <span className="text-sm font-bold text-slate-400">/ {dbStats.total_connections}</span>
                </p>
              </div>
              <div className="min-w-0 break-words">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Conn Load</p>
                <p
                  className={`text-xl font-black tracking-tight ${connPct > 80 ? 'text-red-500' : connPct > 50 ? 'text-amber-500' : 'text-indigo-500'}`}
                >
                  {connPct.toFixed(0)}%
                </p>
              </div>
            </>
          ) : (
            <p className="col-span-4 text-sm font-bold text-red-500">
              ไม่พบ function get_db_stats — ดูวิธีติดตั้งด้านล่าง
            </p>
          )}
        </div>
      </div>

      {/* ── Live Charts (CSS-based, no ResponsiveContainer) ── */}
      {dbStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Disk Usage */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <HardDrive size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disk Usage</p>
                  <p className="text-xs text-slate-400 mt-0.5">จาก pg_database_size</p>
                </div>
              </div>
              <p className={`text-xl font-black ${diskPct > 80 ? 'text-red-500' : diskPct > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {diskPct.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${diskPct}%`, backgroundColor: diskColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold tracking-widest mb-4">
              <span>{diskMB.toFixed(1)} MB</span>
              <span>500 MB (Free Tier)</span>
            </div>
            <div className="py-1.5 px-2.5 bg-amber-500/5 border border-amber-500/10 rounded-md flex items-center gap-1.5 text-amber-600/90 dark:text-amber-400/90">
              <Clock size={10} className="flex-shrink-0" />
              <p className="text-[10px] font-medium">เมื่อมีการ Export ข้อมูล ระบบจะล้าง Cache ภายใน 24 ชม.</p>
            </div>
          </div>

          {/* Connection Load */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Load</p>
                  <p className="text-xs text-slate-400 mt-0.5">จาก pg_stat_activity</p>
                </div>
              </div>
              <p className={`text-xl font-black ${connPct > 80 ? 'text-red-500' : connPct > 50 ? 'text-amber-500' : 'text-indigo-500'}`}>
                {connPct.toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${connPct}%`, backgroundColor: connColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold tracking-widest">
              <span>{dbStats.active_connections} active</span>
              <span>{dbStats.total_connections} max</span>
            </div>
          </div>

          {/* Active Connections */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Wifi size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Connections</p>
                  <p className="text-xs text-slate-400 mt-0.5">อัปเดตทุก 30 วินาที</p>
                </div>
              </div>
              <p className="text-3xl font-black text-blue-500">{dbStats.active_connections}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${connPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest">
              การเชื่อมต่อที่กำลังใช้งาน ณ ขณะนี้
            </p>
          </div>

        </div>
      )}

      {/* ── Disk Warning ─────────────────────────────── */}
      {dbStats && diskPct > 60 && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 ${diskPct > 80
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
              : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
            }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${diskPct > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
          />
          <p
            className={`text-xs font-bold ${diskPct > 80
                ? 'text-red-700 dark:text-red-400'
                : 'text-amber-700 dark:text-amber-400'
              }`}
          >
            {diskPct > 80
              ? `⚠️ Storage เกิน 80% (${diskPct.toFixed(1)}%) — Database อาจเข้าสู่โหมด Read-only ได้ทุกเมื่อ กรุณา clear data หรือ upgrade plan`
              : `ℹ️ Storage ใช้ไปแล้ว ${diskPct.toFixed(1)}% — ควรระวังและวางแผนล่วงหน้า`}
          </p>
        </div>
      )}

      {/* ── Setup Instructions DB Stats ─────────────────── */}
      {!loading && !dbStats && (
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-[2rem] p-6 mb-6">
          <p className="text-sm font-black text-red-500 mb-2">⚠️ ยังไม่ได้ติดตั้ง function get_db_stats</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            กรุณา Copy SQL ด้านล่างไปรันใน Supabase → SQL Editor → New Query → Run:
          </p>
          <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-[11px] text-slate-700 dark:text-emerald-400 overflow-x-auto font-mono leading-relaxed">
            {`CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  total_cluster_size bigint;
  wal_size bigint;
  active_conns int;
  max_conns int;
BEGIN
  SELECT sum(pg_tablespace_size(oid)) INTO total_cluster_size FROM pg_tablespace;
  BEGIN
    SELECT COALESCE(sum(size), 0) INTO wal_size FROM pg_ls_waldir();
  EXCEPTION WHEN OTHERS THEN wal_size := 0; END;
  SELECT count(*) INTO active_conns FROM pg_stat_activity;
  SELECT setting::int INTO max_conns FROM pg_settings WHERE name = 'max_connections';
  RETURN json_build_object(
    'database_size_bytes', total_cluster_size + wal_size,
    'active_connections', active_conns,
    'total_connections', max_conns
  );
END; $$;`}
          </pre>
        </div>
      )}


      {/* Reclaim countdown banner */}
      {reclaimCountdown !== null && reclaimCountdown > 0 && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Clock size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">กำลังคืนพื้นที่ว่าง</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-0.5">ระบบกำลังล้างไฟล์ประวัติการลบทิ้งอัตโนมัติ</p>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
            {Math.floor(reclaimCountdown / 60).toString().padStart(2, '0')}:{(reclaimCountdown % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Data Exports List */}
      <DataExportsList pendingJobs={pendingJobs} />

      {/* ── VACUUM FULL — Storage Reclaim ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl flex-shrink-0">
              <Trash2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Reclaim — ดีดน้ำหนัก</p>
              <p className="text-xs text-slate-400 mt-0.5">ล้าง Dead Tuples และคืนพื้นที่ Disk จากประวัติการลบทั้งหมด — กดเมื่อพร้อมเท่านั้น</p>
            </div>
          </div>
          <button
            id="vacuum-full-btn"
            onClick={handleVacuumFull}
            disabled={vacuumRunning}
            className={`flex items-center justify-center gap-2 text-xs font-black px-5 py-2.5 rounded-2xl transition-colors flex-shrink-0 ${
              vacuumRunning
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
            }`}
          >
            {vacuumRunning ? (
              <><RefreshCw size={13} className="animate-spin" /> กำลังล้าง...</>
            ) : (
              <><Zap size={13} /> VACUUM FULL</>
            )}
          </button>
        </div>

        {/* Card body */}
        <div className="p-5 space-y-4">
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-xl flex-shrink-0 mt-0.5">
                <Trash2 size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Dead Tuples</p>
                <p className="text-xs text-slate-400 leading-relaxed">แถวที่ถูก DELETE / UPDATE ยังคงอยู่ใน disk เป็น "ขยะ" กินพื้นที่โดยเปล่าประโยชน์</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl flex-shrink-0 mt-0.5">
                <Zap size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Edge Function</p>
                <p className="text-xs text-slate-400 leading-relaxed">รันผ่าน Supabase Edge Function ที่ connect DB โดยตรงนอก transaction จึงรัน VACUUM ได้</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl flex-shrink-0 mt-0.5">
                <AlertTriangle size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">คำเตือน</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/70 leading-relaxed">Lock ตารางชั่วคราว — รันช่วง traffic น้อยเท่านั้น อาจใช้เวลาสักนาที</p>
              </div>
            </div>
          </div>

          {/* Result banner */}
          {vacuumResult && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                vacuumResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${vacuumResult.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${vacuumResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {vacuumResult.message}
                </p>
                {vacuumResult.elapsed_ms !== undefined && (
                  <p className="text-[10px] text-slate-400 mt-0.5">ใช้เวลา {(vacuumResult.elapsed_ms / 1000).toFixed(1)} วินาที</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Supabase Native Logs Link ───────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-2xl">
              <Terminal size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Activity Logs</p>
              <p className="text-xs text-slate-400 mt-0.5">ดูประวัติการทำรายการโดยตรงจาก Supabase — ไม่กิน Storage เพิ่ม</p>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Postgres Logs', desc: 'ดู SQL Query ทุกตัวที่รัน, Errors และ Slow Queries', path: 'database-logs', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'API Request Logs', desc: 'ทุก HTTP Request ที่เข้ามาผ่าน REST/GraphQL API', path: 'api-logs', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Auth Logs', desc: 'Login, Signup, Token Refresh, และ Authentication Errors', path: 'auth-logs', color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Edge Function Logs', desc: 'Log ของ Edge Functions ทุกตัวที่รัน', path: 'edge-functions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map(item => (
            <a
              key={item.label}
              href={`https://supabase.com/dashboard/project/_/logs/${item.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className={`p-2 ${item.bg} ${item.color} rounded-xl flex-shrink-0 mt-0.5`}>
                <Terminal size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black ${item.color} uppercase tracking-wide`}>{item.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
              <ExternalLink size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
            </a>
          ))}
        </div>
        <div className="mx-5 mb-5 p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-xl flex items-start gap-2">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400/80 leading-relaxed">
            ตาราง <code className="font-mono bg-amber-100 dark:bg-amber-500/20 px-1 rounded">system_audit_log</code> ถูกนำออกแล้ว — Supabase มี Log ระดับ Database ให้ใช้ฟรีโดยไม่กิน Storage เพิ่ม
          </p>
        </div>
      </div>

      <ExportDataModal
        show={showExportModal}
        setShow={setShowExportModal}
        onExportStart={(job) => {
          setPendingJobs(prev => [...prev, { ...job, status: 'running' }]);
          toast.loading(`กำลังดึงข้อมูลและ Export ไฟล์...`, { id: job.id });
        }}
        onExportSuccess={(jobId) => {
          setPendingJobs(prev => prev.filter(j => j.id !== jobId));
          toast.success('Export ข้อมูลสำเร็จ!', { id: jobId });
        }}
        onExportError={(jobId, msg) => {
          setPendingJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'error', errorMsg: msg } : j));
          toast.error(`Export ล้มเหลว: ${msg}`, { id: jobId });
        }}
      />
    </div>
  );
};
