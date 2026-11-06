import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  subtext?: string;
}

interface SearchableSelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.subtext && o.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3.5 py-2 text-sm bg-white border rounded-lg cursor-pointer transition-all shadow-sm ${
          error ? 'border-red-400' : isOpen ? 'border-[#690BA8] ring-1 ring-[#690BA8]' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className={selectedOption ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {error && <p className="mt-1 text-xs text-[#E91E63]">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-center text-slate-400">No matching results</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer hover:bg-purple-50/60 transition-colors ${
                    opt.value === value ? 'bg-purple-50 font-semibold text-[#690BA8]' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p>{opt.label}</p>
                    {opt.subtext && <p className="text-[10px] text-slate-400">{opt.subtext}</p>}
                  </div>
                  {opt.value === value && <Check size={14} className="text-[#690BA8]" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
