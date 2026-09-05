const fs = require('fs');

let content = fs.readFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota/index.tsx', 'utf-8');

// I know that it currently looks like:
// const update = () => {
//   const diff = new Date(targetDate).getTime() - Date.now();
//   const [loadingHistory, setLoadingHistory] = useState(true);

// because the fuzzy matcher deleted a chunk! Let's just fix the whole thing safely:
// Let's replace everything between `const useCountdown = ...` and `const [loadingHistory...`

const startIdx = content.indexOf('const useCountdown');
const endIdx = content.indexOf('const [loadingHistory');

const newMiddle = `const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) { setTimeLeft(null); return; }

    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// ─── Main Component ───────────────────────────────────────────────
const VendorQuota = ({ setShowImportModal, canShowImportButton = false }: { setShowImportModal?: (show: boolean) => void; canShowImportButton?: boolean }) => {
  const { t } = useTranslation();
  const { profile, shop: storeShop, fetchShop } = useAuthStore();
  const [shop, setShop] = useState<any>(storeShop || null);
  const [productCount, setProductCount] = useState(0);
  const [loadingShop, setLoadingShop] = useState(true);
  const [history, setHistory] = useState<QuotaHistoryItem[]>([]);
  const [redeemedCodes, setRedeemedCodes] = useState<RedeemedQuotaCode[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  `;

content = content.substring(0, startIdx) + newMiddle + content.substring(endIdx);
fs.writeFileSync('d:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components/VendorQuota/index.tsx', content);

console.log('Fixed index.tsx');
