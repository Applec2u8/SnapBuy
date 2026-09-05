import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Home, 
  ShoppingBag, 
  Truck, 
  MapPin,
  Warehouse,
  PackageCheck,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReceiptModal } from './ReceiptModal';

const OrderSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showReceipt, setShowReceipt] = useState(false);

  const orderData = location.state?.orderData;

  // Scroll to top on mount; auto-show receipt if checkbox was checked
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state?.autoPrint && orderData) {
      // Slight delay so success animation shows first
      setTimeout(() => setShowReceipt(true), 600);
    }
  }, [location.state, orderData]);

  return (
    <>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 text-center space-y-12 animate-fade-in">
        {/* Success Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('order_placed_successfully', 'Success!')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">
              {t('order_id', 'Order ID')}: #{orderData?.orderId || Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </motion.div>
        </div>

        {/* Delivery Animation Container */}
        <div className="relative w-full max-w-lg mx-auto py-20">
          {/* Background Track */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full transform -translate-y-1/2" />
          
          {/* Animated Progress Track */}
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/2 left-0 h-1 bg-primary-500 rounded-full transform -translate-y-1/2"
          />

          {/* Icons Container */}
          <div className="relative flex justify-between items-center px-2">
            {/* Source: Warehouse */}
            <div className="relative group">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg group-hover:border-primary-500 transition-colors z-10 relative">
                <Warehouse size={28} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400">Hub</p>
            </div>

            {/* Delivery Vehicle Animation */}
            <motion.div
              animate={{ 
                x: ["0%", "400%"],
                y: [0, -5, 0, -5, 0]
              }}
              transition={{ 
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 0.5, repeat: Infinity, ease: "linear" }
              }}
              className="absolute left-[10%] top-1/2 -translate-y-1/2 z-20"
            >
              <div className="bg-primary-500 p-3 rounded-xl shadow-xl shadow-primary-500/30">
                <Truck size={24} className="text-white" />
              </div>
            </motion.div>

            {/* Destination: House */}
            <div className="relative group">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg group-hover:border-green-500 transition-colors z-10 relative">
                <MapPin size={28} className="text-slate-400 group-hover:text-green-500 transition-colors" />
              </div>
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Destination</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <PackageCheck className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-tight">Order in progress</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our team is preparing your package. You'll receive real-time updates as it moves through our hubs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-10 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
          >
            <Home size={18} />
            {t('back_to_home', 'Back to Home')}
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ShoppingBag size={18} />
            {t('view_my_orders', 'Track Order')}
          </button>
          {/* Manual print button if orderData is available */}
          {orderData && (
            <button
              onClick={() => setShowReceipt(true)}
              className="flex items-center gap-2 px-10 py-4 bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-slate-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-700 dark:hover:bg-slate-600 transition-all active:scale-95"
            >
              <Printer size={18} />
              Print Receipt
            </button>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && orderData && (
        <ReceiptModal
          orderData={orderData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};

export default OrderSuccess;
