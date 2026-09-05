// Shared types for the UserDetail feature

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  updated_at?: string;
  auto_boost_enabled?: boolean;
  auto_boost_amount?: number;
  auto_boost_frequency?: string;
  auto_like_boost_enabled?: boolean;
  auto_like_boost_amount?: number;
  auto_like_boost_frequency?: string;
  [key: string]: unknown;
}

export interface ShopRecord {
  id: string;
  name?: string;
  logo_url?: string;
  image_url?: string;
  owner_id?: string;
  [key: string]: unknown;
}

export interface ProductRecord {
  id: string;
  name?: string;
  price?: number;
  images?: string[];
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  shop_id?: string;
  shops?: { name?: string };
  categories?: { name?: string };
  [key: string]: unknown;
}

export interface BoostConfig {
  isEnabled: boolean;
  amount: number;
  frequency: string;
}

export interface BoostOptions {
  percentage: number;
  mode: 'random' | 'ordered';
  type: 'views' | 'likes' | 'both';
}

export interface EditForm {
  view_count: number;
  like_count: number;
  comment_count: number;
  [key: string]: unknown;
}

export const FREQUENCY_OPTIONS: { value: string; labelKey?: string; label?: string }[] = [
  { value: 'minute',     label: 'Every Minute' },
  { value: '5_minutes',  label: 'Every 5 Min' },
  { value: '15_minutes', label: 'Every 15 Min' },
  { value: '30_minutes', label: 'Every 30 Min' },
  { value: 'hourly',     labelKey: 'admin_every_hour' },
  { value: 'daily',      labelKey: 'admin_every_day' },
  { value: 'weekly',     labelKey: 'admin_every_week' },
];

export const SORT_OPTIONS = [
  { label: 'Newest First',      value: 'newest' },
  { label: 'Oldest First',      value: 'oldest' },
  { label: 'Views: High to Low', value: 'views-desc' },
  { label: 'Views: Low to High', value: 'views-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
];
