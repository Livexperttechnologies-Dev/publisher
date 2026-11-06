import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface ExportMenuProps {
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  label?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  label = 'Export',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Download size={14} />}
        rightIcon={<ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-44 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in-50 duration-150">
          <button
            onClick={() => {
              onExportExcel?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => {
              onExportPDF?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText size={15} className="text-[#E91E63]" />
            <span>Export to PDF (.pdf)</span>
          </button>
          <button
            onClick={() => {
              onExportCSV?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={15} className="text-[#690BA8]" />
            <span>Export to CSV (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
};
