import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  header,
  actions,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-slate-200/80 rounded-xl shadow-sm transition-all duration-150',
          className
        )
      )}
      {...props}
    >
      {(header || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="font-semibold text-slate-800 text-base">{header}</div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
