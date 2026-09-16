import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Package, Tag, DollarSign, Layers } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';

interface EditProductModalProps {
  product: any | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  categories,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '',
    category_id: '',
    brand: '',
    is_published: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price !== undefined && product.price !== null ? String(product.price) : '',
        compare_at_price: product.compare_at_price !== undefined && product.compare_at_price !== null ? String(product.compare_at_price) : '',
        stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null ? String(product.stock_quantity) : '0',
        category_id: product.category_id || '',
        brand: product.brand || '',
        is_published: Boolean(product.is_published)
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('กรุณาระบุชื่อสินค้า');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        category_id: formData.category_id || null,
        brand: formData.brand.trim() || null,
        is_published: formData.is_published,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);

      if (error) throw error;

      toast.success('อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว');
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">แก้ไขข้อมูลสินค้า</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-md">
                ID: {product.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          {/* Product Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              ชื่อสินค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
              placeholder="ระบุชื่อสินค้า..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                ราคาขาย ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="0.00"
                />
                <DollarSign size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Compare at price */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                ราคาเดิม / เปรียบเทียบ ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_at_price}
                  onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="0.00"
                />
                <DollarSign size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stock Quantity */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                จำนวนคงเหลือ (Stock)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                placeholder="0"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                หมวดหมู่
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
              >
                <option value="">-- ไม่ระบุหมวดหมู่ --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                แบรนด์
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                placeholder="ชื่อแบรนด์..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              คำอธิบายสินค้า
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none transition-all resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>

          {/* Publish Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">สถานะการเผยแพร่ (Visibility)</p>
              <p className="text-[10px] text-slate-400">
                {formData.is_published ? 'สินค้าเปิดแสดงและสั่งซื้อได้บนหน้าร้าน (Public)' : 'ซ่อนสินค้าจากหน้าร้าน (Hidden)'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
};
