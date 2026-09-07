import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  PlusCircle, 
  Loader2,
  Package,
  LayoutGrid,
  Layers,
  Info,
  AlertCircle,
  AlertTriangle,
  Tag,
  AlignLeft,
  DollarSign,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface AddProductModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  handleAddProduct: (e: React.FormEvent) => void;
  newProduct: any;
  setNewProduct: (product: any) => void;
  categorySearch: string;
  setCategorySearch: (search: string) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (show: boolean) => void;
  categories: any[];
  shopCats?: string[];
  filteredCategories: any[];
  selectedFiles: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFiles: (files: File[]) => void;
  uploading: boolean;
  shop?: any;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  showAddModal,
  setShowAddModal,
  handleAddProduct,
  newProduct,
  setNewProduct,
  categorySearch,
  setCategorySearch,
  showCategoryDropdown,
  setShowCategoryDropdown,
  filteredCategories,
  shopCats,
  selectedFiles,
  handleFileChange,
  setSelectedFiles,
  uploading,
  shop
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [variantInput, setVariantInput] = useState({
    name: '',
    value: '',
    price_override: '',
    stock_quantity: '',
    file: null as File | null
  });

  // Handle click outside to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCategoryDropdown) {
          setShowCategoryDropdown(false);
        } else {
          setShowAddModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showCategoryDropdown, setShowCategoryDropdown, setShowAddModal]);

  const addVariant = () => {
    if (!variantInput.name || !variantInput.value) {
      toast.error('Option Name and Value are required');
      return;
    }
    setNewProduct({
      ...newProduct,
      variants: [...(newProduct.variants || []), { ...variantInput }]
    });
    setVariantInput({ name: '', value: '', price_override: '', stock_quantity: '', file: null });
  };

  const removeVariant = (index: number) => {
    const updated = [...newProduct.variants];
    updated.splice(index, 1);
    setNewProduct({ ...newProduct, variants: updated });
  };

  const onVariantFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVariantInput({ ...variantInput, file: e.target.files[0] });
    }
  };

  const canSubmit = newProduct.name && 
                    newProduct.price && 
                    newProduct.category_id && 
                    newProduct.variants?.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Please fill in all required fields.');
      return;
    }
    handleAddProduct(e);
  };

  if (!showAddModal) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in text-left cursor-pointer"
      onClick={() => setShowAddModal(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl md:max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col m-2 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Listing</h3>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">New Product</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">

          {/* Quota Warning Banner */}
          {shop && (() => {
            const isNoQuota = shop.product_limit === 0;
            const isExpired = shop.quota_expires_at && new Date(shop.quota_expires_at) < new Date();
            if (!isNoQuota && !isExpired) return null;
            return (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                    {isNoQuota ? 'ยังไม่มีโควต้า' : 'โควต้าหมดอายุแล้ว'}
                  </p>
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5 leading-relaxed">
                    {isNoQuota
                      ? 'กรุณากรอกโค้ดโควต้าในหน้า Settings ก่อนเริ่มลงสินค้า'
                      : `โควต้าหมดอายุเมื่อ ${new Date(shop.quota_expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} — กรุณากรอกโค้ดใหม่ในหน้า Settings`
                    }
                  </p>
                </div>
              </div>
            );
          })()}
          
          {/* GROUP 1: IDENTITY */}
          <div className="bg-slate-50 dark:bg-slate-800/20 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center"><LayoutGrid size={12} /></div>
              <label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Product Info</label>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Tag className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500" size={16} />
                  <input 
                    required
                    className="w-full bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                    placeholder="Product Name" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="w-full sm:w-48 relative group">
                  <DollarSign className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500" size={16} />
                  <input 
                    required
                    type="number"
                    className="w-full bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                    placeholder="Base Price" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              {/* Category Input with Ref for Click Outside */}
              <div className="relative group" ref={dropdownRef}>
                <LayoutGrid className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500" size={16} />
                <input 
                  className="w-full bg-white dark:bg-slate-900 pl-12 pr-12 py-4 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                  placeholder="Select Category"
                  value={categorySearch}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onChange={e => setCategorySearch(e.target.value)}
                />
                {categorySearch && (
                  <button 
                    type="button"
                    onClick={() => {
                      setCategorySearch('');
                      setNewProduct({...newProduct, category_id: null});
                      setShowCategoryDropdown(false);
                    }}
                    className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                {showCategoryDropdown && (() => {
                  const hasShopCats = shopCats !== undefined;
                  return (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-slide-up">
                      {filteredCategories.length === 0 ? (
                        <div className="px-5 py-4 text-xs font-bold text-slate-400 text-center">
                          ไม่พบหมวดหมู่
                        </div>
                      ) : filteredCategories.map(cat => {
                        const isLocked = hasShopCats && !shopCats.includes(cat.id);
                        return (
                          <button 
                            key={cat.id}
                            type="button"
                            disabled={isLocked}
                            className={`w-full px-5 py-3 text-left text-xs font-bold transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-none uppercase tracking-widest flex items-center justify-between ${
                              isLocked 
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 text-slate-500' 
                                : 'hover:bg-primary-500 hover:text-white cursor-pointer'
                            }`}
                            onClick={() => {
                              if (isLocked) return;
                              setNewProduct({...newProduct, category_id: cat.id});
                              setCategorySearch(cat.name);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {cat.icon_url && <img src={cat.icon_url} alt={cat.name} className="w-4 h-4 object-contain" />}
                              {cat.name}
                            </div>
                            {isLocked && <Lock size={14} className="text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="relative group">
                 <AlignLeft className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500" size={16} />
                 <textarea 
                   className="w-full bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[100px]" 
                   placeholder="Product Description"
                   value={newProduct.description}
                   onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                 />
              </div>
            </div>
          </div>

          {/* GALLERY & VARIANTS ... remains same */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2"><ImageIcon size={12} className="text-primary-500" /><label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Global Gallery ({selectedFiles.length}/20)</label></div>
                {selectedFiles.length > 0 && <button type="button" onClick={() => setSelectedFiles([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear All</button>}
             </div>
             <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group overflow-hidden">
                     <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                     <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
                {selectedFiles.length < 20 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all">
                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                    <Plus size={20} className="text-slate-400" />
                  </label>
                )}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Layers size={12} className="text-primary-500" /><label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Product Options with Images</label></div>
              {!newProduct.variants?.length && (
                 <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Required</span>
                 </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex gap-4">
                 <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all flex-shrink-0 bg-white dark:bg-slate-900">
                    <input type="file" className="hidden" onChange={onVariantFileChange} accept="image/*" />
                    {variantInput.file ? <img src={URL.createObjectURL(variantInput.file)} className="w-full h-full object-cover rounded-2xl" /> : <ImageIcon size={20} className="text-slate-300" />}
                 </label>
                 <div className="flex-1 space-y-3">
                    <input className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800" placeholder="Option Name (e.g. Color)" value={variantInput.name} onChange={e => setVariantInput({...variantInput, name: e.target.value})} />
                    <input className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800" placeholder="Item Value (e.g. Red)" value={variantInput.value} onChange={e => setVariantInput({...variantInput, value: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                    <input className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800" type="number" placeholder="Price" value={variantInput.price_override} onChange={e => setVariantInput({...variantInput, price_override: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                    <input className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800" type="number" placeholder="Qty" value={variantInput.stock_quantity} onChange={e => setVariantInput({...variantInput, stock_quantity: e.target.value})} />
                 </div>
              </div>
              <button type="button" onClick={addVariant} className="w-full py-3 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"><Plus size={14} /> Add Option Item</button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {newProduct.variants?.map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 group animate-slide-up">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0">
                    {v.file ? <img src={URL.createObjectURL(v.file)} className="w-full h-full object-cover" /> : <Package size={16} className="m-auto text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[10px] uppercase tracking-tight truncate dark:text-white">{v.name}: {v.value}</p>
                    <p className="text-[9px] text-primary-500 font-bold uppercase tracking-widest">${parseFloat(v.price_override) || newProduct.price || 0} | Stock: {v.stock_quantity}</p>
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              ))}
              {(!newProduct.variants || newProduct.variants.length === 0) && (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                   <Info size={24} className="mx-auto text-slate-200 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Add at least one option to publish</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              disabled={uploading || !canSubmit} 
              type="submit" 
              className={`w-full py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${canSubmit ? 'bg-primary-500 text-white shadow-primary-500/30 hover:shadow-primary-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
              <span>{uploading ? 'Publishing...' : 'Confirm & Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
