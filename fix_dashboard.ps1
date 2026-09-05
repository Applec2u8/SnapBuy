$file = 'src\pages\Admin\views\Database\DatabaseDashboard.tsx'
$allLines = Get-Content $file -Encoding UTF8

# Keep lines 0..514 (before the corrupted audit log block)
# Keep lines 556..end (after the corrupted section, starting at System Activity Log)
$keep1 = $allLines[0..514]
$keep2 = $allLines[556..($allLines.Length-1)]

$newBlock = @'
      {/* Setup Instructions Audit Log */}
      {!loading && auditLogSetupRequired && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-[2rem] p-6"
        >
          <p className="text-sm font-black text-red-500 mb-2">⚠️ ยังไม่ได้ติดตั้งระบบ Database Audit Log</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            กรุณา Copy SQL ด้านล่างไปรันใน Supabase เพื่อเปิดระบบบันทึกความเคลื่อนไหวทั้งหมด:
          </p>
        </motion.div>
      )}

      {/* Reclaim countdown banner */}
      {reclaimCountdown !== null && reclaimCountdown > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center justify-between"
        >
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
        </motion.div>
      )}

      {/* Data Exports List */}
      <DataExportsList pendingJobs={pendingJobs} />

'@

$newLines = $newBlock -split "`r?`n"
$result = $keep1 + $newLines + $keep2
Set-Content $file -Value $result -Encoding UTF8
Write-Host "Done. Total lines: $($result.Length)"
