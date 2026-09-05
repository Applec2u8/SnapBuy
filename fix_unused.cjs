const fs = require('fs');

function fixImports(file, toRemove) {
  let content = fs.readFileSync(file, 'utf-8');
  toRemove.forEach(imp => {
    const re = new RegExp('\\b' + imp + '\\b\\s*,?', 'g');
    content = content.replace(re, '');
  });
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  fs.writeFileSync(file, content);
}

// 1. GenerationProgress/index.tsx
fixImports('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/GenerationProgress/index.tsx', [
  'Package', 'CheckCircle2', 'Clock', 'ExternalLink', 'RefreshCw', 'useTranslation', 'useCountdown', 'triggerResume'
]);

// 2. GenerationProgress/JobItem.tsx
fixImports('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/GenerationProgress/JobItem.tsx', [
  'AnimatePresence', 'ChevronDown', 'ChevronUp', 'GripHorizontal', 'useIsMobile'
]);

// 3. VendorQuota/BuyQuotaModal.tsx
fixImports('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota/BuyQuotaModal.tsx', [
  'useMemo', 'TrendingUp', 'History', 'Zap', 'Timer', 'UploadCloud', 'AnimatePresence', 'useTranslation', 'computeHasActiveSpecialQuota', 'QuotaHistoryItem', 'RedeemedQuotaCode', 'useCountdown'
]);

// 4. VendorQuota/index.tsx
fixImports('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota/index.tsx', [
  'Wallet', 'CheckCircle2', 'Clock', 'X', 'CheckSquare', 'Calculator', 'QuotaPackage'
]);

// 5. VendorWallet/TxRow.tsx
let txRow = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/TxRow.tsx', 'utf-8');
txRow = txRow.replace(/import { useState[^]*?useTranslation } from 'react-i18next';/m, `import { ShoppingCart, Gift, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';`);
fs.writeFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/TxRow.tsx', txRow);

// 6. VendorWallet/WalletCard.tsx
let walletCard = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/WalletCard.tsx', 'utf-8');
walletCard = walletCard.replace(/import { useState[^]*?useTranslation } from 'react-i18next';/m, `import { motion } from 'framer-motion';`);
fs.writeFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/WalletCard.tsx', walletCard);

// 7. VendorWallet/index.tsx
let vwIndex = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/index.tsx', 'utf-8');
vwIndex = vwIndex.replace(/import React, { useState/, 'import { useState');
vwIndex = vwIndex.replace(/ShoppingCart,\s*/, '');
fs.writeFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet/index.tsx', vwIndex);

console.log('Fixed unused imports');
