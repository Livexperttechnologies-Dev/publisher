import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Calendar size={15} />
        </div>
        <input
          type="date"
          className={`block w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all ${
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
