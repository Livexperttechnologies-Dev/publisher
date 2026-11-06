import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  children,
}) => {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label} {required && <span className="text-[#E91E63]">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-[#E91E63] mt-0.5">{error}</p>}
    </div>
  );
};
