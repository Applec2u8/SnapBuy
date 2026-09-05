const fs = require('fs');
const path = 'd:\\Dev\\clone\\SnapBuy\\src\\pages\\VendorDashboard\\components\\GuaranteePayment.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('const formatMoney')) {
  code = code.replace(
    'const { user, shop, profile, fetchProfile } = useAuthStore();',
    'const { user, shop, profile, fetchProfile } = useAuthStore();\n  const formatMoney = (val: number) => val.toLocaleString(\'en-US\', { minimumFractionDigits: 2, maximumFractionDigits: 2 });'
  );
}

// Global replaces
code = code.replace(/\$\{([^}]+)\.toFixed\(2\)\}/g, '\\${formatMoney($1)}');
code = code.replace(/\$\{([^}]+)\.toFixed\(0\)\}/g, '\\${formatMoney($1)}');

// Fix sticky footer layout
const footerOld1 = `            {/* Universal Sticky Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col-reverse sm:flex-row justify-end gap-3 print:hidden">
              {!paymentSuccess ? (
                <>
                  <button 
                    onClick={handlePrint} 
                    className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-2xl sm:rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-xs flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
                  >
                    <Printer size={16} /> Print Draft
                  </button>
                  <button
                    onClick={handlePayGuarantee}
                    disabled={paying}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black uppercase tracking-widest py-3 sm:py-2.5 px-8 rounded-2xl sm:rounded-xl transition-colors shadow-lg shadow-primary-500/20 text-sm sm:text-xs"
                  >
                    {paying ? (
                      <><span className="w-4 h-4 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : \`Confirm & Pay \\\${\\\${formatMoney(summary.totalCost)}}\`}
                  </button>
                </>
              ) : (`;

const footerOld2 = footerOld1.replace(/\\\$\{\\\$\{formatMoney\(summary\.totalCost\)\}\}/, '\\${formatMoney(summary.totalCost)}');

const footerNew = `            {/* Universal Sticky Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-bold text-sm text-slate-600 dark:text-slate-400">{selectedItemsData.length} items</span>
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="font-black text-sm text-slate-900 dark:text-white">Total: $\\${formatMoney(summary.totalCost)}</span>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full sm:w-auto">
                {!paymentSuccess ? (
                  <>
                    <button 
                      onClick={handlePrint} 
                      className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-2xl sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-xs flex items-center justify-center gap-2 transition-colors uppercase tracking-widest shadow-sm"
                    >
                      <Printer size={16} /> Print Draft
                    </button>
                    <button
                      onClick={handlePayGuarantee}
                      disabled={paying}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 sm:py-2.5 px-8 rounded-2xl sm:rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm sm:text-xs"
                    >
                      {paying ? (
                        <><span className="w-4 h-4 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                      ) : \`Confirm & Pay\`}
                    </button>
                  </>
                ) : (`;

if (code.includes(footerOld2)) {
  code = code.replace(footerOld2, footerNew);
} else {
  // Try matching more loosely
  code = code.replace(/<div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col-reverse sm:flex-row justify-end gap-3 print:hidden">[\s\S]*?Confirm & Pay[\s\S]*?<\/button>\s*<\/>\s*\) : \(/, footerNew.replace('            {/* Universal Sticky Footer */}\n', ''));
}

fs.writeFileSync(path, code);
console.log('Update complete.');
