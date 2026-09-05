const fs = require('fs');
const path = require('path');

function splitGenerationProgress() {
  const dir = 'd:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/GenerationProgress';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const originalContent = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/GenerationProgress.tsx', 'utf-8');

  const imports = `import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Package, CheckCircle2, PauseCircle, Clock,
  ChevronDown, ChevronUp, GripHorizontal, AlertTriangle, ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
`;

  const jobItemMatch = originalContent.match(/const JobItem: React\.FC[^]*?(?=\/\/ ---------------------------------------------------------------------------\r?\n\/\/ Main widget)/);
  const hooksMatch = originalContent.match(/\/\/ Countdown hook[^]*?(?=const JobItem: React\.FC)/);
  const mainMatch = originalContent.match(/\/\/ Main widget[^]*/);

  const jobItemCode = imports + '\n' + (hooksMatch ? hooksMatch[0] : '') + '\n' + (jobItemMatch ? jobItemMatch[0] : '') + '\nexport default JobItem;';
  const mainCodeStr = imports + '\nimport JobItem from \'./JobItem\';\n' + (hooksMatch ? hooksMatch[0] : '') + '\n' + (mainMatch ? mainMatch[0] : '');

  fs.writeFileSync(path.join(dir, 'JobItem.tsx'), jobItemCode);
  fs.writeFileSync(path.join(dir, 'index.tsx'), mainCodeStr.replace(/export const GenerationProgress/, 'const GenerationProgress'));

  let finalMainCode = fs.readFileSync(path.join(dir, 'index.tsx'), 'utf-8');
  finalMainCode = finalMainCode.replace(/const GenerationProgress: React\.FC/, 'export const GenerationProgress: React.FC');
  fs.writeFileSync(path.join(dir, 'index.tsx'), finalMainCode);

  fs.unlinkSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/GenerationProgress.tsx');
  console.log("Splitted GenerationProgress");
}

function splitVendorQuota() {
  const dir = 'd:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const originalContent = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota.tsx', 'utf-8');

  const imports = `import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Wallet, Sparkles, CheckCircle2, Loader2, KeyRound,
  Clock, Package, TrendingUp, X, ShoppingCart, History,
  Gift, Zap, Tag, CheckSquare, Timer, Calculator, AlertTriangle, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { computeHasActiveSpecialQuota } from '../../utils/quotaHelpers';
`;

  // Note: quotaHelpers path changed from '../utils/quotaHelpers' to '../../utils/quotaHelpers' since we are in a subfolder now!
  const fixedContent = originalContent.replace(/from '\.\.\/utils\/quotaHelpers'/g, "from '../../utils/quotaHelpers'");
  
  const commonMatch = fixedContent.match(/const normalizeCategoryIds[^]*?(?=const BuyQuotaModal = )/);
  const commonCode = commonMatch ? commonMatch[0] : '';

  const modalMatch = fixedContent.match(/const BuyQuotaModal = \([^]*?(?=\r?\n\/\/ ─── Main Component)/);
  const modalCode = modalMatch ? modalMatch[0] : '';

  const mainMatch = fixedContent.match(/\/\/ ─── Main Component[^]*/);
  const mainCodeStr = mainMatch ? mainMatch[0] : '';

  const buyQuotaModalFile = imports + '\n' + commonCode + '\n' + modalCode + '\nexport default BuyQuotaModal;';
  const indexFile = imports + '\nimport BuyQuotaModal from \'./BuyQuotaModal\';\n' + commonCode + '\n' + mainCodeStr;

  fs.writeFileSync(path.join(dir, 'BuyQuotaModal.tsx'), buyQuotaModalFile);
  fs.writeFileSync(path.join(dir, 'index.tsx'), indexFile);

  fs.unlinkSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota.tsx');
  console.log("Splitted VendorQuota");
}

function splitVendorWallet() {
  const dir = 'd:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const originalContent = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet.tsx', 'utf-8');

  const imports = `import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  Gift,
  ArrowUpRight,
  Loader2,
  History,
  ShoppingCart,
  RefreshCw,
  CircleDollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
`;

  const typesMatch = originalContent.match(/\/\/ ─── Types ────────────────────────────────────────────────────────\r?\ninterface ShopWalletTx \{[^}]+\}/);
  const typesCode = typesMatch ? typesMatch[0] : '';

  const walletCardMatch = originalContent.match(/\/\/ ─── Stat Card ────────────────────────────────────────────────────\r?\nconst WalletCard = \(\{[^]*?\)\s*=>\s*\([^]*?\);/);
  const walletCardCode = walletCardMatch ? walletCardMatch[0] : '';

  const txRowMatch = originalContent.match(/\/\/ ─── Transaction Row ──────────────────────────────────────────────\r?\nconst TxRow = \(\{ tx \}: \{ tx: ShopWalletTx \}\) => \{[^]*?(?=\/\/ ─── Main Component)/);
  const txRowCode = txRowMatch ? txRowMatch[0] : '';

  const mainMatch = originalContent.match(/\/\/ ─── Main Component ───────────────────────────────────────────────[^]*/);
  const mainCodeStr = mainMatch ? mainMatch[0] : '';

  const walletCardFile = imports + '\n' + walletCardCode + '\nexport default WalletCard;';
  const txRowFile = imports + '\n' + typesCode + '\n' + txRowCode + '\nexport default TxRow;';
  const indexFile = imports + '\nimport WalletCard from \'./WalletCard\';\nimport TxRow from \'./TxRow\';\n' + typesCode + '\n' + mainCodeStr;

  fs.writeFileSync(path.join(dir, 'WalletCard.tsx'), walletCardFile);
  fs.writeFileSync(path.join(dir, 'TxRow.tsx'), txRowFile);
  fs.writeFileSync(path.join(dir, 'index.tsx'), indexFile);

  fs.unlinkSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorWallet.tsx');
  console.log("Splitted VendorWallet");
}

splitGenerationProgress();
splitVendorQuota();
splitVendorWallet();
