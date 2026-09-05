import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useCartStore } from './useCartStore';

interface AuthState {
  user: User | null;
  profile: any | null;
  shop: any | null;
  shops: any[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setShop: (shop: any | null) => void;
  setShops: (shops: any[]) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  fetchShop: (shopId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  shop: null,
  shops: [],
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setShop: (shop) => {
    if (shop) {
      localStorage.setItem('activeShopId', shop.id);
    } else {
      localStorage.removeItem('activeShopId');
    }
    set({ shop });
  },
  setShops: (shops) => set({ shops }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    useCartStore.getState().clearCart();
    localStorage.removeItem('activeShopId');
    set({ user: null, profile: null, shop: null, shops: [] });
  },
  fetchProfile: async (userId) => {
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Fetch All Shops
      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', userId);
      
      const savedShopId = localStorage.getItem('activeShopId');
      let activeShop = null;

      if (shopsData && shopsData.length > 0) {
        if (savedShopId) {
          activeShop = shopsData.find(s => s.id === savedShopId) || shopsData[0];
        } else {
          activeShop = shopsData[0];
        }
      }
      
      set({ 
        profile: profileData || null, 
        shops: shopsData || [],
        shop: activeShop,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching profile/shops:', error);
      set({ loading: false });
    }
  },
  fetchShop: async (shopId) => {
    try {
      const { data } = await supabase.from('shops').select('*').eq('id', shopId).single();
      if (data) {
        set((state) => ({
          shop: data,
          shops: state.shops.map(s => s.id === data.id ? data : s),
        }));
      }
    } catch (error) {
      console.error('Error refreshing shop:', error);
    }
  },
}));
