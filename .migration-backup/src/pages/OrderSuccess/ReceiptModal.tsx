import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: { size?: string; color?: string };
}

interface ReceiptAddress {
  full_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address_line: string;
}

interface OrderData {
  orderId: string;
  items: ReceiptItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address?: ReceiptAddress;
  paymentMethod: string;
  userEmail?: string;
  shopId?: string | null;
  createdAt: string;
}

interface ReceiptModalProps {
  orderData: OrderData;
  onClose: () => void;
}

const buildReceiptHTML = (orderData: OrderData): string => {
  const { orderId, items, subtotal, shippingFee, total, address, paymentMethod, userEmail, shopId, createdAt } = orderData;
  const t = (key: string) => i18n.t(key);

  const shopUrl = shopId
    ? `${window.location.origin}/shop/${shopId}`
    : window.location.origin;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shopUrl)}&margin=4`;

  const paymentLabel =
    paymentMethod === 'wallet' ? t('receipt_wallet')
      : paymentMethod === 'cod' ? t('receipt_cod')
        : t('receipt_credit_card');

  const rows = items.map(item => `
    <tr>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
        <div style="font-size: 12px; font-weight: 600; color: #111827;">${item.name}</div>
        ${item.variant?.size || item.variant?.color
      ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${t('receipt_sku')}: ${[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}</div>`
      : `<div style="font-size: 10px; color: #9ca3af;">${t('receipt_sku')}: —</div>`
    }
      </td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #374151;">${t('receipt_standard')}</td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #374151;">${item.quantity}</td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px; color: #374151;">$${item.price.toLocaleString()}</td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px; color: #374151;">$0.00</td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px; font-weight: 600; color: #111827;">$${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const addrFull = address
    ? `${address.address_line}, ${address.district}, ${address.city}, ${address.province} - ${address.postal_code}, Thailand`
    : '—';

  const qrSvg = `<img src="${qrApiUrl}" width="100" height="100" style="display:block;" alt="QR Code" />`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${t('receipt_title')} - ${orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sarabun', 'Prompt', Arial, sans-serif; background: white; color: #111827; }
    .receipt { max-width: 800px; margin: 0 auto; padding: 40px; }
    .control-panel { 
      position: sticky; 
      top: 0; 
      background: white; 
      border-bottom: 2px solid #e5e7eb; 
      padding: 12px 16px; 
      margin-bottom: 20px;
      display: flex;
      gap: 8px;
      z-index: 100;
    }
    .btn { 
      padding: 8px 16px; 
      border: 1px solid #d1d5db; 
      border-radius: 6px; 
      background: white; 
      color: #374151;
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    .btn:hover { background: #f3f4f6; border-color: #9ca3af; }
    .btn-primary { background: #3b82f6; color: white; border-color: #3b82f6; }
    .btn-primary:hover { background: #2563eb; }
    @media print {
      .control-panel { display: none; }
      body { margin: 0; }
      .receipt { padding: 20px; max-width: 100%; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
<div class="control-panel">
  <button class="btn" onclick="window.history.back()">← Back</button>
  <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
  <button class="btn" onclick="window.close()">Close Tab</button>
</div>
<div class="receipt">
  <!-- Header -->
  <table width="100%" style="margin-bottom: 24px;">
    <tr>
      <td style="vertical-align: top;">
        <div style="font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px;">SnapBuy Store</div>
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${t('receipt_email')}: ${userEmail || 'store@snapbuy.com'}</div>
        <div style="font-size: 12px; color: #6b7280;">${t('receipt_phone')}: ${address?.phone || '—'}</div>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <div style="font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -1px; margin-bottom: 8px;">${t('receipt_invoice')}</div>
        <table style="margin-left: auto; font-size: 12px; color: #374151;">
          <tr>
            <td style="padding: 2px 8px 2px 0; color: #6b7280;">${t('receipt_order_id')}:</td>
            <td style="font-weight: 700;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 2px 8px 2px 0; color: #6b7280;">${t('receipt_date')}:</td>
            <td style="font-weight: 700;">${createdAt}</td>
          </tr>
          <tr>
            <td style="padding: 2px 8px 2px 0; color: #6b7280;">${t('receipt_payment_method')}:</td>
            <td style="font-weight: 700;">${paymentLabel}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="height: 1px; background: #e5e7eb; margin-bottom: 20px;"></div>

  <!-- Shipping Address -->
  <div style="margin-bottom: 24px;">
    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">${t('receipt_ship_to')}:</div>
    <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 3px;">${address?.full_name || '—'}</div>
    <div style="font-size: 12px; color: #374151; margin-bottom: 2px;">${addrFull}</div>
    <div style="font-size: 12px; color: #374151; margin-bottom: 2px;">${t('receipt_email')}: ${userEmail || '—'}</div>
    <div style="font-size: 12px; color: #374151;">${t('receipt_phone')}: ${address?.phone || '—'}</div>
  </div>

  <div style="height: 1px; background: #e5e7eb; margin-bottom: 0;"></div>

  <!-- Products Table -->
  <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f9fafb;">
        <th style="padding: 10px 6px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_product_name')}</th>
        <th style="padding: 10px 6px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_shipping_type')}</th>
        <th style="padding: 10px 6px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_quantity')}</th>
        <th style="padding: 10px 6px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_unit_price')}</th>
        <th style="padding: 10px 6px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_tax')}</th>
        <th style="padding: 10px 6px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">${t('receipt_total')}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <!-- Footer: QR + Totals -->
  <table width="100%" style="margin-top: 16px;">
    <tr>
      <td style="vertical-align: bottom; padding-right: 16px;">
        ${qrSvg}
        <div style="font-size: 9px; color: #9ca3af; margin-top: 4px; text-align: center;">${t('receipt_scan_shop')}</div>
      </td>
      <td style="width: 260px; vertical-align: top;">
        <table width="100%" style="font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">${t('receipt_subtotal')}</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 600;">$${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">${t('receipt_shipping_fee')}</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 600;">$${shippingFee.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">${t('receipt_total_tax')}</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 600;">$0.00</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">${t('receipt_coupon_discount')}</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 600;">$0.00</td>
          </tr>
          <tr>
            <td colspan="2" style="height: 1px; background: #111827; padding: 0;"></td>
          </tr>
          <tr>
            <td style="padding: 8px 0 4px; font-weight: 800; font-size: 14px; color: #111827;">${t('receipt_grand_total')}</td>
            <td style="padding: 8px 0 4px; text-align: right; font-weight: 900; font-size: 16px; color: #111827;">$${total.toLocaleString()}</td>
          </tr>
        </table>
        ${paymentMethod !== 'cod' ? `<div style="margin-top: 12px; padding: 8px; background: #ecfdf5; border: 1px dashed #10b981; border-radius: 4px; text-align: center; font-size: 10px; font-weight: 700; color: #059669;">
          ${t('receipt_paid_note')}
        </div>` : ''}
      </td>
    </tr>
  </table>
</div>
</body>
<script>
  window.onload = function() {
    setTimeout(function() {
      window.print();
    }, 200);
  };
</script>
</html>`;
};

export const ReceiptModal = ({ orderData, onClose }: ReceiptModalProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handlePrint = () => {
    const html = buildReceiptHTML(orderData);
    const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  const { orderId, items, subtotal, shippingFee, total, address, paymentMethod, userEmail, shopId, createdAt } = orderData;

  const paymentLabel =
    paymentMethod === 'wallet' ? t('receipt_wallet')
      : paymentMethod === 'cod' ? t('receipt_cod')
        : t('receipt_credit_card');

  const shopUrl = shopId
    ? `${window.location.origin}/shop/${shopId}`
    : window.location.origin;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shopUrl)}&margin=4`;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white">{t('receipt_invoice')} / {t('receipt_title')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{orderId}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
            >
              <Printer size={15} />
              {t('receipt_print')}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt Content Preview */}
        <div className="p-6 sm:p-8 font-sans text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white mb-1">SnapBuy Store</p>
              <p className="text-xs text-slate-500">{t('receipt_email')}: {userEmail || 'store@snapbuy.com'}</p>
              <p className="text-xs text-slate-500">{t('receipt_phone')}: {address?.phone || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('receipt_invoice')}</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                <p><span className="text-slate-400">{t('receipt_order_id')}:</span> <span className="font-bold">{orderId}</span></p>
                <p><span className="text-slate-400">{t('receipt_date')}:</span> <span className="font-bold">{createdAt}</span></p>
                <p><span className="text-slate-400">{t('receipt_payment_method')}:</span> <span className="font-bold">{paymentLabel}</span></p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700 mb-5" />

          {/* Shipping Address */}
          {address && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('receipt_ship_to')}:</p>
              <p className="font-black text-sm text-slate-900 dark:text-white">{address.full_name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{address.address_line}, {address.district}, {address.city}, {address.province} - {address.postal_code}, Thailand</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('receipt_email')}: {userEmail || '—'}</p>
              <p className="text-xs text-slate-500">{t('receipt_phone')}: {address.phone}</p>
            </div>
          )}

          <hr className="border-slate-200 dark:border-slate-700 mb-0" />

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">{t('receipt_product_name')}</th>
                  <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700 hidden sm:table-cell">{t('receipt_shipping_type')}</th>
                  <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">{t('receipt_quantity')}</th>
                  <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">{t('receipt_unit_price')}</th>
                  <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700 hidden sm:table-cell">{t('receipt_tax')}</th>
                  <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">{t('receipt_total')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-3 align-top">
                      <p className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {t('receipt_sku')}: {item.variant?.size || item.variant?.color ? [item.variant.size, item.variant.color].filter(Boolean).join(' / ') : '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500 hidden sm:table-cell">{t('receipt_standard')}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-xs text-slate-700 dark:text-slate-300">${item.price.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-xs text-slate-500 hidden sm:table-cell">$0.00</td>
                    <td className="px-3 py-3 text-right text-xs font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: QR Code + Totals */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div className="text-center sm:text-left self-start sm:self-end">
              <a
                href={shopId ? `/shop/${shopId}` : '/'}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img src={qrApiUrl} width={80} height={80} alt="Shop QR Code" className="border border-slate-200 dark:border-slate-700 p-1 bg-white mx-auto sm:mx-0 rounded-lg" />
              </a>
              <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{t('receipt_scan_shop')}</p>
            </div>
            <div className="w-full sm:max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('receipt_subtotal')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('receipt_shipping_fee')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">${shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('receipt_total_tax')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">$0.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('receipt_coupon_discount')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">$0.00</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">{t('receipt_grand_total')}</span>
                <span className="font-black text-xl text-primary-500">${total.toLocaleString()}</span>
              </div>
              {paymentMethod !== 'cod' && (
                <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-dashed border-emerald-500/50 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {t('receipt_paid_note')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
