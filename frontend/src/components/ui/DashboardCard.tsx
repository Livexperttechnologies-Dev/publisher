import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string; // Hex color for left border indicator
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  accentColor = '#690BA8',
}) => {
  return (
    <Card className="p-4" style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
          {title}
        </span>
        {icon && (
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-800 font-mono tracking-tight">{value}</h3>
        {(change || subtext) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {change && (
              <span
                className={`font-semibold flex items-center ${
                  isPositive ? 'text-emerald-600' : 'text-[#F06A64]'
                }`}
              >
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
              </span>
            )}
            {subtext && <span className="text-slate-400">{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
