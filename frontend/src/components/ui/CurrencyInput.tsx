import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  currencySymbol?: string;
  value: string | number;
  onChange: (val: string) => void;
  error?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  currencySymbol = '₹',
  value,
  onChange,
  error,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold font-mono text-sm">
          {currencySymbol}
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          className={`block w-full pl-8 pr-3.5 py-2 text-sm font-mono font-medium text-right bg-white border rounded-lg focus:outline-none transition-all ${
            error
              ? 'border-red-400 focus:border-[#E91E63]'
              : 'border-slate-200 focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8]'
          } ${className || ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#E91E63]">{error}</p>}
    </div>
  );
};
