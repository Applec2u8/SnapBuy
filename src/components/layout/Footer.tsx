import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Smartphone,
  MessageCircle,
  Camera,
  Send,
  Play
} from 'lucide-react';
import logoName from '../../assets/logo-name.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-border pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 pb-16 border-b border-border/50">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{t('footer_free_shipping')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer_free_shipping_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
              <RefreshCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{t('footer_30_days_return')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer_easy_returns')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{t('footer_secure_payment')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer_secure_checkout')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{t('footer_24_7_support')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer_dedicated_support')}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logoName} alt="SnapBuy" className="h-10 transition-transform group-hover:scale-105" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {i18n.language.startsWith('th')
                ? 'จุดหมายปลายทางครบวงจรสำหรับเทรนด์ล่าสุดในแฟชั่น อิเล็กทรอนิกส์ และของตกแต่งบ้าน สินค้าคุณภาพส่งตรงถึงมือคุณ'
                : 'Your one-stop destination for the latest trends in fashion, electronics, and home decor. Quality products delivered to your doorstep.'}
            </p>
            <div className="flex flex-col gap-4">
              <h5 className="font-bold text-sm uppercase tracking-wider">{t('footer_follow_us')}</h5>
              <div className="flex items-center gap-3">
                {[
                  { Icon: MessageCircle, color: 'hover:bg-blue-600' },
                  { Icon: Camera, color: 'hover:bg-pink-600' },
                  { Icon: Send, color: 'hover:bg-sky-500' },
                  { Icon: Play, color: 'hover:bg-red-600' }
                ].map(({ Icon, color }, idx) => (
                  <a key={idx} href="#" className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-all duration-300 hover:text-white ${color}`}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer_quick_links')}</h4>
            <ul className="space-y-4">
              {[
                { label: t('home'), to: '/' },
                { label: t('shop'), to: '/shop' },
                { label: t('become_seller'), to: '/become-seller' },
                { label: t('featured_products'), to: '/shop?featured=true' },
                { label: t('trending'), to: '/shop?trending=true' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="group text-sm text-muted-foreground hover:text-primary-500 transition-all flex items-center gap-2">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer_customer_service')}</h4>
            <ul className="space-y-4">
              {[
                { label: t('footer_help_center'), to: '#' },
                { label: t('footer_how_to_buy'), to: '#' },
                { label: t('footer_shipping_delivery'), to: '#' },
                { label: t('footer_order_tracking'), to: '#' },
                { label: t('footer_returns_refunds'), to: '#' },
                { label: t('footer_privacy_policy'), to: '#' },
                { label: t('footer_terms_conditions'), to: '#' },
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.to} className="text-sm text-muted-foreground hover:text-primary-500 transition-all">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-lg mb-6">{t('footer_contact_us')}</h4>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <MapPin className="text-primary-500 flex-shrink-0" size={20} />
                  <span className="text-sm text-muted-foreground">123 Commerce St, Digital City, DC 12345</span>
                </li>
                <li className="flex gap-4">
                  <Phone className="text-primary-500 flex-shrink-0" size={20} />
                  <span className="text-sm text-muted-foreground">+1 234 567 890</span>
                </li>
                <li className="flex gap-4">
                  <Mail className="text-primary-500 flex-shrink-0" size={20} />
                  <span className="text-sm text-muted-foreground">support.snapbuys@gmail.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">{t('footer_newsletter')}</h4>
              <p className="text-xs text-muted-foreground mb-4">{t('footer_newsletter_desc')}</p>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-secondary/50 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                />
                <button className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-primary-500 text-white rounded-lg text-xs font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                  {t('footer_subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Download App & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-border/50 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* <h5 className="font-bold text-sm uppercase tracking-wider">{t('footer_app_download')}</h5>
            <div className="flex gap-3">
              <a href="#" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all">
                <Smartphone size={20} />
                <div className="text-left">
                  <p className="text-[8px] uppercase leading-none opacity-60">Download on the</p>
                  <p className="text-xs font-bold leading-none mt-1">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="fill-current"><path d="M3.609 1.814L13.792 12 3.61 22.186a2.26 2.26 0 0 1-.61-1.57V3.384c0-.602.22-1.168.609-1.57zM14.505 12.72l2.673 2.673L4.996 23.32a2.3 2.3 0 0 0 1.554.6c.49 0 .963-.15 1.348-.415L19.467 16.3c.753-.41 1.258-1.18 1.258-2.07 0-.89-.505-1.66-1.258-2.07L7.91 5.39a2.316 2.316 0 0 0-1.359-.414c-.582 0-1.127.206-1.555.597l12.182 12.181 2.673-2.672L14.505 12.72z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-[8px] uppercase leading-none opacity-60">Get it on</p>
                  <p className="text-xs font-bold leading-none mt-1">Google Play</p>
                </div>
              </a>
            </div> */}
          </div>

          <div className="flex flex-col sm:flex-row items-center md:justify-end gap-6">
            <h5 className="font-bold text-sm uppercase tracking-wider">{t('footer_payment_methods')}</h5>
            <div className="flex gap-4 items-center opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
              <div className="w-10 h-6 bg-white rounded border border-slate-200 flex items-center justify-center text-[8px] font-black italic text-blue-800">VISA</div>
              <div className="w-10 h-6 bg-white rounded border border-slate-200 flex items-center justify-center text-[8px] font-black italic text-red-600">MasterCard</div>
              <div className="w-10 h-6 bg-white rounded border border-slate-200 flex items-center justify-center text-[8px] font-black italic text-blue-500">PayPal</div>
              <div className="w-10 h-6 bg-white rounded border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-800">AMEX</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="font-bold text-primary-500">SnapBuy</span>. {t('footer_all_rights_reserved')}
          </p>

          <div className="flex items-center gap-8 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary-500 transition-colors">{t('footer_privacy_policy')}</a>
            <a href="#" className="hover:text-primary-500 transition-colors">{t('footer_terms_conditions')}</a>
            <a href="#" className="hover:text-primary-500 transition-colors">{t('footer_cookies_settings')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
