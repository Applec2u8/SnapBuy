import { useCart } from './hooks/useCart';
import { EmptyCart } from './components/EmptyCart';
import { CartItem } from './components/CartItem';
import { OrderSummary } from './components/OrderSummary';
import { Checkbox } from '../../components/ui/Checkbox';

const Cart = () => {
  const {
    t,
    items,
    selectedKeys,
    selectedTotal,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    updateQuantity,
    handleCheckout
  } = useCart();

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
          {t('cart')} <span className="text-primary-500">({items.length})</span>
        </h1>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary-200">
          <Checkbox 
            checked={selectedKeys.length === items.length && items.length > 0}
            onChange={toggleSelectAll}
            label={selectedKeys.length === items.length ? 'Deselect All' : 'Select All'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemKey = `${item.id}-${item.variant?.id || 'none'}`;
            const isSelected = selectedKeys.includes(itemKey);
            return (
              <CartItem 
                key={itemKey}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                selected={isSelected}
                onSelect={() => toggleSelect(itemKey)}
              />
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary 
            total={selectedTotal} 
            itemCount={selectedKeys.length}
            onCheckout={handleCheckout}
            disabled={selectedKeys.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
