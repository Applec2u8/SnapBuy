import { MapPin, Plus, CheckCircle2, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddressSelectionProps {
  addresses: any[];
  selectedAddress: string | null;
  setSelectedAddress: (id: string) => void;
  showAddAddress: boolean;
  setShowAddAddress: (show: boolean) => void;
  newAddress: any;
  setNewAddress: (data: any) => void;
  handleAddAddress: (e: React.FormEvent) => void;
  error?: boolean;
}

export const AddressSelection = ({
  addresses,
  selectedAddress,
  setSelectedAddress,
  showAddAddress,
  setShowAddAddress,
  newAddress,
  setNewAddress,
  handleAddAddress,
  error
}: AddressSelectionProps) => {
  const { t } = useTranslation();

  const getInputClass = (val: string) => `bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-sm border ${error && showAddAddress && !val.trim() ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all w-full`;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border ${error && !selectedAddress && !showAddAddress ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <MapPin size={16} className="text-primary-500" />
          </div>
          <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white">
            {t('shipping_address')}
          </h2>
        </div>
        {!showAddAddress && (
          <button
            onClick={() => setShowAddAddress(true)}
            className="flex items-center gap-1.5 text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest border border-primary-500/30 hover:border-primary-500 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={12} />
            {t('add_product')}
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {showAddAddress ? (
          <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input required placeholder="Full Name" className={getInputClass(newAddress.full_name)} value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} />
            <input required placeholder="Phone Number" className={getInputClass(newAddress.phone)} value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
            <input required placeholder="Province" className={getInputClass(newAddress.province)} value={newAddress.province} onChange={e => setNewAddress({...newAddress, province: e.target.value})} />
            <input required placeholder="City / Town" className={getInputClass(newAddress.city)} value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
            <input required placeholder="District" className={getInputClass(newAddress.district)} value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} />
            <input required placeholder="Postal Code" className={getInputClass(newAddress.postal_code)} value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
            <textarea required placeholder="Detailed Address" className={`${getInputClass(newAddress.address_line)} sm:col-span-2 resize-none`} rows={2} value={newAddress.address_line} onChange={e => setNewAddress({...newAddress, address_line: e.target.value})} />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors">
                {t('save')}
              </button>
              <button type="button" onClick={() => setShowAddAddress(false)} className="px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                {t('cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {addresses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center opacity-50">
                <Home size={32} className="text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No saved addresses</p>
                <button onClick={() => setShowAddAddress(true)} className="text-xs font-bold text-primary-500 hover:underline">
                  + Add your first address
                </button>
              </div>
            )}
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  selectedAddress === addr.id
                    ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <input type="radio" name="address" className="hidden" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddress === addr.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-black text-sm text-slate-900 dark:text-white">{addr.full_name}</p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">{addr.phone}</span>
                    {addr.is_default && <span className="text-[9px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Default</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {addr.address_line}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                </div>
                {selectedAddress === addr.id && (
                  <CheckCircle2 className="text-primary-500 flex-shrink-0 mt-0.5" size={20} />
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
