import { ShoppingBag } from 'lucide-react';

interface BecomeSellerHeaderProps {
  shopsCount: number;
}

export const BecomeSellerHeader = ({ shopsCount }: BecomeSellerHeaderProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
         <ShoppingBag size={14} /> {shopsCount > 0 ? 'Expand Your Business' : 'Start Selling'}
      </div>
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
        {shopsCount > 0 ? 'Create Another' : 'Open your'} <span className="text-primary-500 italic">Shop</span>
      </h1>
      <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
        Join thousands of successful sellers and reach millions of customers. 
        Everything you need to sell online is right here.
      </p>
    </div>
  );
};
