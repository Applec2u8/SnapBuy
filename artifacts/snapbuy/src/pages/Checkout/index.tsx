import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ShieldCheck, MapPin, CreditCard, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCheckout } from './hooks/useCheckout';
import { AddressSelection } from './components/AddressSelection';
import { PaymentMethodSelection } from './components/PaymentMethodSelection';
import { OrderItemsReview } from './components/OrderItemsReview';
import { CheckoutSummary } from './components/CheckoutSummary';

const STEPS = [
  { icon: MapPin, label: 'Shipping' },
  { icon: CreditCard, label: 'Payment' },
  { icon: ClipboardList, label: 'Review' },
];

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    checkoutItems,
    addresses,
    selectedAddress,
    setSelectedAddress,
    showAddAddress,
    setShowAddAddress,
    loading,
    processing,
    newAddress,
    setNewAddress,
    handleAddAddress,
    calculateSubtotal,
    shippingFee,
    total,
    handlePlaceOrder,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    checkoutErrors,
    printReceipt,
    setPrintReceipt,
    shippingDays
  } = useCheckout();

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading checkout...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-32">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-white/5 mb-6 sm:mb-8 pb-4 sm:pb-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Back</span>
        </button>

        <h1 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">
          {t('checkout')}
        </h1>

        {/* Steps indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  idx === 0
                    ? 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                    : 'bg-transparent text-slate-400 border-transparent'
                }`}>
                  <Icon size={11} />
                  {step.label}
                </div>
                {idx < STEPS.length - 1 && <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

        {/* Left: Main checkout steps */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:block">
            Checkout Details
          </p>

          <AddressSelection
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            showAddAddress={showAddAddress}
            setShowAddAddress={setShowAddAddress}
            newAddress={newAddress}
            setNewAddress={setNewAddress}
            handleAddAddress={handleAddAddress}
            error={checkoutErrors.address}
          />

          <PaymentMethodSelection 
            selectedMethod={selectedPaymentMethod} 
            setSelectedMethod={setSelectedPaymentMethod}
            error={checkoutErrors.payment}
          />

          <OrderItemsReview items={checkoutItems} />

          {/* Trust badges */}
          <div className="hidden lg:flex items-center justify-center gap-6 py-4 text-slate-400">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" />
              SSL Secured
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-blue-500" />
              Privacy Protected
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-primary-500" />
              Secure Payment
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 hidden lg:block">
            Order Summary
          </p>
          <CheckoutSummary
            subtotal={calculateSubtotal()}
            shippingFee={shippingFee}
            total={total}
            processing={processing}
            onPlaceOrder={handlePlaceOrder}
            disabled={processing || checkoutItems.length === 0}
            itemCount={checkoutItems.length}
            printReceipt={printReceipt}
            setPrintReceipt={setPrintReceipt}
            shippingDays={shippingDays}
          />
        </div>
      </div>
    </div>
  );

};

export default Checkout;
