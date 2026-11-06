import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'magenta' | 'coral' | 'success' | 'slate' | 'warning';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  const variantStyles = {
    purple: 'bg-purple-50 text-[#690BA8] border border-purple-200/60',
    magenta: 'bg-pink-50 text-[#E91E63] border border-pink-200/60',
    coral: 'bg-orange-50 text-[#F06A64] border border-orange-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full font-medium leading-none tracking-wide select-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
