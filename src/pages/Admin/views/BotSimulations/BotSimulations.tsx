import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import { Bot, Users, Zap, Loader2 } from 'lucide-react';
import { logAdminAction } from '../../../../lib/auditLog';
import { GenerateBotsTab } from './components/GenerateBotsTab';
import { SimulationJobsTab } from './components/SimulationJobsTab';

interface Shop {
  id: string;
  name: string;
  logo_url?: string;
  products?: { id: string }[];
}

interface BotJob {
  id: string;
  shop_id: string;
  bot_count_min: number;
  bot_count_max: number;
  items_per_order_min: number;
  items_per_order_max: number;
  price_preference: 'random' | 'cheap' | 'expensive' | 'all';
  max_runs?: number | null;
  interval_minutes: number;
  status: 'active' | 'paused';
  last_run_at: string | null;
  created_at: string;
  shops?: { name: string; logo_url?: string };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function BotSimulations() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'generate' | 'jobs'>('generate');

  // Generate Bots state
  const [botCount, setBotCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ createdCount: number; errors: string[] } | null>(null);
  const [totalBots, setTotalBots] = useState<number | null>(null);
  const [bots, setBots] = useState<any[]>([]);
  const [botsLoading, setBotsLoading] = useState(false);
  const [deletingBotId, setDeletingBotId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState<BotJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);

  // Scheduler ref to avoid stale closure
  const jobsRef = useRef<BotJob[]>([]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  // New Job form
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    shop_id: '',
    bot_count: 5,
    items_per_order_max: 3,
    interval_minutes: 60,
    price_preference: 'random' as 'random' | 'cheap' | 'expensive' | 'all',
    max_runs: 1,
  });
  const [creatingJob, setCreatingJob] = useState(false);

  // Shop picker state
  const [shopSearch, setShopSearch] = useState('');
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const shopPickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (shopPickerRef.current && !shopPickerRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    fetchBotCount();
    fetchBots();
    fetchShops();
    fetchJobs();

    // Client-side scheduler: check every 60 seconds for active jobs that are due
    const schedulerInterval = setInterval(async () => {
      const activeJobs = jobsRef.current.filter(j => j.status === 'active');
      if (activeJobs.length === 0) return;

      const now = Date.now();
      let didRun = false;

      for (const job of activeJobs) {
        const lastRunMs = job.last_run_at ? new Date(job.last_run_at).getTime() : 0;
        const intervalMs = job.interval_minutes * 60 * 1000;
        if (now - lastRunMs >= intervalMs) {
          try {
            const { data, error } = await supabase.rpc('run_bot_job', { p_job_id: job.id });
            if (!error && data?.success) {
              didRun = true;
            }
          } catch (_) {
            // silent fail — scheduler will retry next tick
          }
        }
      }

      if (didRun) fetchJobs();
    }, 60_000);

    return () => clearInterval(schedulerInterval);
  }, []);

  const fetchBotCount = async () => {
    const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_bot', true);
    const cnt = count ?? 0;
    setTotalBots(cnt);
    if (cnt > 0) {
      setNewJob(p => ({ ...p, bot_count: Math.min(p.bot_count, cnt) }));
    }
  };

  const fetchBots = async () => {
    setBotsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email:id')
      .eq('is_bot', true)
      .order('created_at', { ascending: false })
      .limit(100);
    setBots(data || []);
    setBotsLoading(false);
  };

  const fetchShops = async () => {
    const { data } = await supabase.from('shops').select('id, name, logo_url, products(id)').order('name');
    setShops(data || []);
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    const { data } = await supabase
      .from('bot_simulation_jobs')
      .select('*, shops(name, logo_url)')
      .order('created_at', { ascending: false });
    setJobs(data || []);
    setJobsLoading(false);
  };

  const handleGenerateBots = async () => {
    if (!user) return;
    setGenerating(true);
    setGenerateResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-bots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ botCount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate bots');
      setGenerateResult(json);
      toast.success(`✅ สร้างบอทสำเร็จ ${json.createdCount} คน`);
      await logAdminAction('generate_bots', 'bot', undefined, undefined, { count: json.createdCount });
      fetchBotCount();
      fetchBots();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('ลบบอทนี้? ออเดอร์ที่เกี่ยวข้องจะถูกลบด้วย')) return;
    setDeletingBotId(botId);
    try {
      const { error } = await supabase.rpc('delete_bot', { p_bot_id: botId });
      if (error) throw error;
      toast.success('ลบบอทสำเร็จ');
      await logAdminAction('delete_bot', 'bot', botId, undefined, { bot_id: botId });
      fetchBotCount();
      fetchBots();
    } catch (err: any) {
      toast.error(err.message || 'ลบบอทไม่สำเร็จ');
    } finally {
      setDeletingBotId(null);
    }
  };

  const handleDeleteAllBots = async () => {
    if (!confirm(`ลบบอททั้งหมด ${totalBots} คน? ข้อมูลออเดอร์จะหายไปด้วย`)) return;
    setDeletingAll(true);
    try {
      const { error } = await supabase.rpc('delete_all_bots');
      if (error) throw error;
      toast.success('ลบบอททั้งหมดสำเร็จ');
      await logAdminAction('delete_all_bots', 'bot', undefined, undefined, {});
      fetchBotCount();
      fetchBots();
    } catch (err: any) {
      toast.error(err.message || 'ลบบอทไม่สำเร็จ');
    } finally {
      setDeletingAll(false);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.shop_id) {
      toast.error('กรุณาเลือกร้านค้า');
      return;
    }
    if (newJob.bot_count < 1) {
      toast.error('จำนวนบอทต้องมากกว่า 0');
      return;
    }
    if (totalBots !== null && totalBots > 0 && newJob.bot_count > totalBots) {
      toast.error(`จำนวนบอทต้องไม่เกินที่มีในระบบ (สูงสุด ${totalBots} บอท)`);
      return;
    }
    setCreatingJob(true);
    try {
      const payload = {
        shop_id: newJob.shop_id,
        bot_count_min: newJob.bot_count,
        bot_count_max: newJob.bot_count,
        items_per_order_min: 1,
        items_per_order_max: newJob.items_per_order_max,
        interval_minutes: newJob.interval_minutes,
        price_preference: newJob.price_preference,
        max_runs: newJob.max_runs === 0 ? null : newJob.max_runs,
        status: 'active'
      };
      const { data, error } = await supabase.from('bot_simulation_jobs').insert(payload).select().single();
      if (error) throw error;

      toast.success('สร้าง Simulation Job สำเร็จ! ระบบกำลังรันออเดอร์แรกรอโปรดรอสักครู่...');

      await logAdminAction('create_bot_job', 'bot', data.id, newJob.shop_id, { shop_id: newJob.shop_id, bot_count: newJob.bot_count });

      // Trigger first run immediately
      if (data) {
        const { data: runData, error: runError } = await supabase.rpc('run_bot_job', { p_job_id: data.id });
        if (runError) {
          toast.error('รันรอบแรกไม่สำเร็จ: ' + runError.message);
        } else {
          if (runData?.success) {
            toast.success(`รันรอบแรกสำเร็จ! บอททำการซื้อไป ${runData.bots_run} รายการ`);

            await logAdminAction(
              'run_bot_simulations',
              'bot',
              data.id,
              data.shops?.name,
              { bot_count: runData.bots_run, duration_hours: data.interval_minutes / 60 }
            );
          }
        }
      }

      setShowNewJobForm(false);
      setNewJob({ shop_id: '', bot_count: 5, items_per_order_max: 3, interval_minutes: 60, price_preference: 'random', max_runs: 1 });
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingJob(false);
    }
  };

  const handleRunJobNow = async (jobId: string) => {
    toast('กำลังสั่งให้บอทซื้อสินค้า...', { icon: <Loader2 size={14} className="animate-spin text-violet-500" /> });
    const { data, error } = await supabase.rpc('run_bot_job', { p_job_id: jobId });
    if (error) {
      toast.error(error.message);
    } else {
      if (data?.success) {
        toast.success(`สั่งรันสำเร็จ! บอทซื้อไป ${data.bots_run} ออเดอร์`);

        const job = jobs.find(j => j.id === jobId);
        await logAdminAction(
          'run_bot_simulations',
          'bot',
          job?.shop_id,
          job?.shops?.name,
          { bot_count: data.bots_run, instant: true }
        );

        fetchJobs();
      } else {
        toast.error(data?.message || 'ไม่สามารถรันได้');
      }
    }
  };

  const handleToggleJob = async (job: BotJob) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('bot_simulation_jobs').update({ status: newStatus }).eq('id', job.id);
    if (error) return toast.error(error.message);
    toast.success(newStatus === 'active' ? '▶ Job เปิดใช้งานแล้ว' : '⏸ Job หยุดชั่วคราว');

    await logAdminAction('toggle_bot_job', 'bot', job.id, job.shops?.name, { status: newStatus });

    fetchJobs();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('ต้องการลบ Simulation Job นี้ใช่ไหม?')) return;
    const { error } = await supabase.from('bot_simulation_jobs').delete().eq('id', jobId);
    if (error) return toast.error(error.message);
    toast.success('ลบ Job สำเร็จ');

    await logAdminAction('delete_bot_job', 'bot', jobId, undefined, { job_id: jobId });

    fetchJobs();
  };

  // Handlers and helpers are above this line



  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
            <Bot size={24} className="text-violet-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">AUTO / GENERATE BOTS</h2>
            <p className="text-sm text-slate-500">สร้างบอทและจำลองการซื้อขายอัตโนมัติ</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-200/50 dark:border-violet-500/20">
          <Users size={16} className="text-violet-500" />
          <div>
            <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest leading-none">Bot Pool</p>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
              {totalBots === null ? '—' : totalBots.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[
          { id: 'generate', label: '🤖 สร้างบอท', icon: Bot },
          { id: 'jobs', label: '⚙️ Simulation Jobs', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Generate Bots ── */}
      {activeTab === 'generate' && (
        <GenerateBotsTab 
          botCount={botCount}
          setBotCount={setBotCount}
          generating={generating}
          generateResult={generateResult}
          handleGenerateBots={handleGenerateBots}
          totalBots={totalBots}
          bots={bots}
          botsLoading={botsLoading}
          deletingBotId={deletingBotId}
          deletingAll={deletingAll}
          handleDeleteBot={handleDeleteBot}
          handleDeleteAllBots={handleDeleteAllBots}
        />
      )}

      {/* ── TAB: Simulation Jobs ── */}
      {activeTab === 'jobs' && (
        <SimulationJobsTab 
          jobs={jobs}
          jobsLoading={jobsLoading}
          shops={shops}
          showNewJobForm={showNewJobForm}
          setShowNewJobForm={setShowNewJobForm}
          newJob={newJob}
          setNewJob={setNewJob}
          creatingJob={creatingJob}
          handleCreateJob={handleCreateJob}
          handleRunJobNow={handleRunJobNow}
          handleToggleJob={handleToggleJob}
          handleDeleteJob={handleDeleteJob}
          shopSearch={shopSearch}
          setShopSearch={setShopSearch}
          shopDropdownOpen={shopDropdownOpen}
          setShopDropdownOpen={setShopDropdownOpen}
          shopPickerRef={shopPickerRef}
          totalBots={totalBots}
          fetchJobs={fetchJobs}
        />
      )}
    </div>
  );
}
