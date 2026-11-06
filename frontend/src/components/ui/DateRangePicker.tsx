import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
        <div className="relative flex-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs border-none focus:outline-none text-slate-700 bg-transparent"
          />
          <Calendar size={13} className="absolute left-2 top-2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-slate-300 text-xs">to</span>
        <div className="relative flex-1">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs border-none focus:outline-none text-slate-700 bg-transparent"
          />
          <Calendar size={13} className="absolute left-2 top-2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
