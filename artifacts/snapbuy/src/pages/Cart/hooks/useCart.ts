import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/useCartStore';
import { useTranslation } from 'react-i18next';

export const useCart = () => {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    items.map(item => `${item.id}-${item.variant?.id || 'none'}`)
  );

  const toggleSelect = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (selectedKeys.length === items.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(items.map(item => `${item.id}-${item.variant?.id || 'none'}`));
    }
  };

  const selectedItems = useMemo(() => {
    return items.filter(item => 
      selectedKeys.includes(`${item.id}-${item.variant?.id || 'none'}`)
    );
  }, [items, selectedKeys]);

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [selectedItems]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    // We can pass selected items to checkout via state
    navigate('/checkout', { state: { checkoutItems: selectedItems } });
  };

  return {
    t,
    items,
    selectedKeys,
    selectedItems,
    selectedTotal,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    updateQuantity,
    handleCheckout,
    navigate
  };
};
