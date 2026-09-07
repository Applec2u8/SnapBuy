import React from 'react';

interface MoneyProps {
  amount: number;
  currency?: string;
  compact?: boolean; // use compact notation for small UI
  className?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, currency = '$', compact = false, className = '' }) => {
  const fixed = (Number(amount) || 0).toFixed(2);
  const [intPart, decPart] = fixed.split('.');

  const intFormatted = compact
    ? new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(Number(intPart))
    : new Intl.NumberFormat('en-US').format(Number(intPart));

  // Inline styles with clamp to make integer scale across screen sizes
  const intStyle: React.CSSProperties = {
    fontSize: 'clamp(1rem, 3.5vw, 2.25rem)',
    lineHeight: 1,
  };
  const decStyle: React.CSSProperties = {
    fontSize: 'clamp(0.75rem, 1.6vw, 1rem)',
    lineHeight: 1,
    opacity: 0.9,
  };
  const currencyStyle: React.CSSProperties = {
    fontSize: 'clamp(0.75rem, 1.6vw, 1rem)',
    lineHeight: 1,
    opacity: 0.9,
  };

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`} style={{ whiteSpace: 'nowrap' }}>
      <span style={currencyStyle} className="text-slate-300">{currency}</span>
      <span style={intStyle} className="font-black truncate" aria-label={`${intFormatted} dollars`}>{intFormatted}</span>
      <span style={decStyle} className="text-slate-400">.{decPart}</span>
    </div>
  );
};

export default Money;
