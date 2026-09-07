export interface Quota {
  id: string;
  code: string;
  product_limit: number;
  duration_days: number | null;
  is_used: boolean;
  used_by_shop_id: string | null;
  used_at: string | null;
  created_at: string;
  sales_percentage?: number;  is_special_quota?: boolean;  shops?: { id: string; name: string } | null;
  profiles?: { full_name: string } | null;
}

export interface ShopQuotaInfo {
  id: string;
  name: string;
  product_limit: number;
  quota_expires_at: string | null;
  owner_id: string;
  product_count: number;
  sales_percentage?: number;
  profiles?: { full_name: string; email: string } | null;
}

export interface QuotaPackage {
  id: string;
  name: string;
  product_limit: number;
  duration_days: number | null;
  price: number;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  category_limit: number;
}
