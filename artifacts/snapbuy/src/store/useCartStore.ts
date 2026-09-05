import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  shop_id: string;
  shop_name?: string;
  variant?: {
    id: string;
    name: string;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => 
          item.id === newItem.id && item.variant?.id === newItem.variant?.id
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id && item.variant?.id === newItem.variant?.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (id, variantId) => {
        set({ 
          items: get().items.filter((item) => 
            !(item.id === id && item.variant?.id === variantId)
          ) 
        });
      },
      updateQuantity: (id, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(id, variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id && item.variant?.id === variantId 
              ? { ...item, quantity } 
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'snapbuy-cart',
    }
  )
);
