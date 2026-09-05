import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

export const PACKAGE_CONFIG = {
  hour:  { label: "1 Hour",   minutes: 60,    cost: 1,   boostPerMin: 1, desc: "Quick Boost" },
  day:   { label: "24 Hours", minutes: 1440,  cost: 15,  boostPerMin: 2, desc: "Daily Exposure" },
  week:  { label: "7 Days",   minutes: 10080, cost: 80,  boostPerMin: 3, desc: "Steady Growth", highlight: true },
  month: { label: "30 Days",  minutes: 43200, cost: 300, boostPerMin: 5, desc: "Maximum Reach" },
} as const;

export type DurationKey = keyof typeof PACKAGE_CONFIG;

export const useBulkPromote = () => {
  const navigate = useNavigate();
  const { user, shop, profile, fetchProfile } = useAuthStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [promoteType, setPromoteType] = useState<"views" | "likes">("views");
  const [duration, setDuration] = useState<DurationKey>("hour");
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotingIds, setPromotingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && shop) fetchProducts();
  }, [user, shop]);

  const fetchProducts = async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("shop_id", shop.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error("Error loading products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const activeBoosts = filteredProducts.filter(
    p => p.is_promoted && p.promoted_until && new Date(p.promoted_until) > new Date()
  );
  const boostableProducts = filteredProducts.filter(
    p => !(p.is_promoted && p.promoted_until && new Date(p.promoted_until) > new Date())
  );

  const isAllSelected =
    boostableProducts.length > 0 &&
    boostableProducts.every(p => selectedIds.has(p.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(boostableProducts.map(p => p.id)));
    }
  };

  const config = PACKAGE_CONFIG[duration];
  const costPerProduct = config.cost;
  const selectedCount = selectedIds.size;
  const totalCost = costPerProduct * selectedCount;
  const walletBalance = profile?.wallet_balance || 0;
  const isInsufficient = totalCost > 0 && walletBalance < totalCost;
  const estimatedTotal = config.boostPerMin * config.minutes;

  const calculatePromotedUntil = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + config.minutes);
    return now.toISOString();
  };

  const handleBulkPromote = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one product to boost.");
      return;
    }
    if (isInsufficient) {
      toast.error(`Not enough balance. Need $${totalCost}, have $${walletBalance}.`);
      return;
    }
    setIsPromoting(true);
    const promotedUntil = calculatePromotedUntil();
    const idsToPromote = Array.from(selectedIds);
    setPromotingIds(new Set(idsToPromote));

    let successCount = 0;
    let failCount = 0;

    for (const productId of idsToPromote) {
      try {
        const { error } = await supabase.rpc("promote_product", {
          p_product_id: productId,
          p_promote_type: promoteType,
          p_token_cost: costPerProduct,
          p_promoted_until: promotedUntil,
          p_boost_per_minute: config.boostPerMin,
        });
        if (error) throw error;
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `Boosted ${successCount} product${successCount > 1 ? "s" : ""}! +${config.boostPerMin} ${promoteType}/min each over ${config.label}`
      );
      if (profile) await fetchProfile(profile.id);
    }
    if (failCount > 0) {
      toast.error(`${failCount} product(s) failed to boost.`);
    }

    setSelectedIds(new Set());
    setIsPromoting(false);
    setPromotingIds(new Set());
    fetchProducts();
  };

  return {
    products: filteredProducts,
    activeBoosts,
    boostableProducts,
    loading,
    search,
    setSearch,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    selectedCount,
    promoteType,
    setPromoteType,
    duration,
    setDuration,
    isPromoting,
    promotingIds,
    handleBulkPromote,
    totalCost,
    costPerProduct,
    estimatedTotal,
    walletBalance,
    isInsufficient,
    config,
    navigate,
    shop,
    isSidebarOpen,
    setIsSidebarOpen,
    PACKAGE_CONFIG,
  };
};
