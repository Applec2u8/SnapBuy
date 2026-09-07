import { motion } from 'framer-motion';
import { Bot, CheckCircle2, AlertCircle, Loader2, Users, ShoppingCart, Package, Trash2 } from 'lucide-react';

interface GenerateBotsTabProps {
  botCount: number;
  setBotCount: (val: number) => void;
  generating: boolean;
  generateResult: { createdCount: number; errors: string[] } | null;
  handleGenerateBots: () => void;
  totalBots: number | null;
  bots: any[];
  botsLoading: boolean;
  deletingBotId: string | null;
  deletingAll: boolean;
  handleDeleteBot: (id: string) => void;
  handleDeleteAllBots: () => void;
}

export function GenerateBotsTab({
  botCount,
  setBotCount,
  generating,
  generateResult,
  handleGenerateBots,
  totalBots,
  bots,
  botsLoading,
  deletingBotId,
  deletingAll,
  handleDeleteBot,
  handleDeleteAllBots
}: GenerateBotsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generate Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">สร้าง Bot Users</h3>
          <p className="text-xs text-slate-500 mt-1">บอทจะได้รับชื่อและรูปโปรไฟล์สุ่ม เพื่อให้ดูเหมือนลูกค้าจริง</p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">จำนวนบอทที่ต้องการสร้าง</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={botCount}
              onChange={e => setBotCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
            <div className="flex gap-1">
              {[10, 25, 50, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setBotCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${botCount === n
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">สูงสุด 100 บอทต่อครั้ง</p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5">
              <p className="font-black">ข้อมูลบอท</p>
              <p>• อีเมล: <span className="font-mono">john.doe@gmail.com</span> (สุ่มจาก Faker)</p>
              <p>• รหัสผ่าน: <span className="font-mono">AB1234</span> (2 ตัวพิมพ์ใหญ่ + 4 ตัวเลข)</p>
              <p>• ชื่อ: สุ่มไทย/อังกฤษ, รูปภาพสุ่มจาก DiceBear</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateBots}
          disabled={generating}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out w-full flex justify-center items-center gap-2 text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 disabled:cursor-not-allowed px-3 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
          {generating ? `กำลังสร้าง ${botCount} บอท...` : `สร้าง ${botCount} บอท`}
        </button>

        {generateResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200/50 dark:border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-[11px] font-black text-green-700 dark:text-green-400">
                สร้างสำเร็จ {generateResult.createdCount} บอท!
              </p>
            </div>
            {generateResult.errors.length > 0 && (
              <p className="text-[10px] text-rose-500">
                ผิดพลาด {generateResult.errors.length} รายการ: {generateResult.errors[0]}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Info Card */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white">
          <Bot size={32} className="mb-4 opacity-80" />
          <h3 className="text-xl font-black mb-2">ระบบบอทอัตโนมัติ</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            บอทจะถูกสร้างเป็นผู้ใช้จริงในระบบ แต่มีแท็ก <code className="bg-white/20 px-1 rounded">is_bot = true</code> เพื่อแยกออกจากลูกค้าจริง
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'สร้างออเดอร์', icon: ShoppingCart, desc: 'อัตโนมัติทุก X นาที' },
            { label: 'ชื่อจริง', icon: Users, desc: 'ไทย/อังกฤษสุ่ม' },
            { label: 'รูปโปรไฟล์', icon: Package, desc: 'สุ่มจาก DiceBear' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
              <item.icon size={20} className="text-violet-500 mx-auto mb-1.5" />
              <p className="text-[10px] font-black text-slate-900 dark:text-white">{item.label}</p>
              <p className="text-[9px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bot List Section ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden lg:col-span-2">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">รายชื่อบอท</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalBots ?? 0} bot{(totalBots ?? 0) !== 1 ? 's' : ''} ในระบบ</p>
          </div>
          {(totalBots ?? 0) > 0 && (
            <button
              onClick={handleDeleteAllBots}
              disabled={deletingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {deletingAll ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              ลบทั้งหมด
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
          {botsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-violet-500" />
            </div>
          ) : bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Bot size={32} className="mb-2 opacity-40" />
              <p className="text-xs font-bold">ยังไม่มีบอทในระบบ</p>
            </div>
          ) : bots.map(bot => (
            <div key={bot.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-500/20 flex-shrink-0">
                {bot.avatar_url
                  ? <img src={bot.avatar_url} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-violet-500"><Bot size={14} /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{bot.full_name || 'Bot User'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{bot.id.substring(0, 12)}...</p>
              </div>
              <button
                onClick={() => handleDeleteBot(bot.id)}
                disabled={deletingBotId === bot.id}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all disabled:opacity-50"
                title="ลบบอทนี้"
              >
                {deletingBotId === bot.id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Trash2 size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
