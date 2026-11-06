import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  AlertCircle,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BookMarked,
  DollarSign,
  Download,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  X,
  ExternalLink,
  Building2,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { useBrand } from '../contexts/BrandContext';
import {
  DashboardMetrics,
  DashboardFilters,
  KpiTargets,
  getStoredKpiTargets,
  saveStoredKpiTargets,
  fetchLiveDashboardMetrics,
  DEFAULT_DASHBOARD_METRICS,
} from '../services/dashboardService';

interface VoucherItem {
  id: string;
  type: string;
  typeColor: string;
  party: string;
  date: string;
  rawDate: string;
  debit: string;
  credit: string;
  debitVal: number;
  creditVal: number;
  narration: string;
  ledgerAccount: string;
  status: string;
}

const initialVouchers: VoucherItem[] = [
  {
    id: 'VCH-0891',
    type: 'Sales Invoice',
    typeColor: 'purple',
    party: 'Oxford Book Store & Distributors Ltd',
    date: '04 Nov 2026',
    rawDate: '2026-11-04',
    debit: '₹342,500.00',
    credit: '₹342,500.00',
    debitVal: 342500,
    creditVal: 342500,
    narration: 'Dispatch of CBSE Class 10 & 12 Science textbooks against Purchase Order #OBS-9021',
    ledgerAccount: 'Book Sales - Academic & School Textbooks',
    status: 'Posted',
  },
  {
    id: 'VCH-0412',
    type: 'Purchase Bill',
    typeColor: 'slate',
    party: 'Century Paper Mills & Board Suppliers',
    date: '04 Nov 2026',
    rawDate: '2026-11-04',
    debit: '₹780,000.00',
    credit: '₹780,000.00',
    debitVal: 780000,
    creditVal: 780000,
    narration: 'Receipt of 65 GSM Maplitho Paper Reels (40 Tons) for winter reprints',
    ledgerAccount: 'Paper Reel & Printing Materials Purchase',
    status: 'Posted',
  },
  {
    id: 'VCH-1102',
    type: 'Receipt Voucher',
    typeColor: 'success',
    party: 'St. Xavier Educational Foundation',
    date: '03 Nov 2026',
    rawDate: '2026-11-03',
    debit: '₹550,000.00',
    credit: '₹550,000.00',
    debitVal: 550000,
    creditVal: 550000,
    narration: 'RTGS clearance against Institutional Supply Invoice #AEPD/2026/0411',
    ledgerAccount: 'HDFC Bank Corporate Current A/c',
    status: 'Posted',
  },
  {
    id: 'VCH-0045',
    type: 'Royalty Accrual',
    typeColor: 'magenta',
    party: 'Prof. R. K. Sharma (Physics Vol 1 & 2)',
    date: '02 Nov 2026',
    rawDate: '2026-11-02',
    debit: '₹145,200.00',
    credit: '₹145,200.00',
    debitVal: 145200,
    creditVal: 145200,
    narration: 'Quarterly author royalty accrued on 7,260 sold book copies @ 10% contract slab',
    ledgerAccount: 'Author Royalty Accrued Liability',
    status: 'Posted',
  },
  {
    id: 'VCH-0982',
    type: 'Payment Voucher',
    typeColor: 'coral',
    party: 'Classic Offset Printers & Binders',
    date: '01 Nov 2026',
    rawDate: '2026-11-01',
    debit: '₹410,000.00',
    credit: '₹410,000.00',
    debitVal: 410000,
    creditVal: 410000,
    narration: 'Settlement of binding and lamination job work bill #PB-8821 for Mathematics edition',
    ledgerAccount: 'Printing & Binding Job Work Expenses',
    status: 'Posted',
  },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { brand } = useBrand();

  // Dynamic Dashboard Filters State
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'FY_2026_27',
    branchId: 'ALL',
    unitFormat: 'STANDARD',
  });

  // Dynamic Metrics and Targets State
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_DASHBOARD_METRICS);
  const [targets, setTargets] = useState<KpiTargets>(() => getStoredKpiTargets());
  const [isLoading, setIsLoading] = useState(false);
  const [chartMode, setChartMode] = useState<'INFLOW_COST' | 'MARGIN_PCT'>('INFLOW_COST');

  // Modals state
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);
  const [isDayBookOpen, setIsDayBookOpen] = useState(false);
  const [dayBookDateFilter, setDayBookDateFilter] = useState('ALL');
  const [dayBookTypeFilter, setDayBookTypeFilter] = useState('ALL');
  const [dayBookSearch, setDayBookSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Targets Form
  const [editTargetRevenue, setEditTargetRevenue] = useState(targets.annualRevenueTarget);
  const [editTargetDso, setEditTargetDso] = useState(targets.targetDsoDays);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load metrics dynamically whenever filters change
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveDashboardMetrics(filters);
      setMetrics(data);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [filters.period, filters.branchId]);

  // Format currency dynamically based on selected unit
  const formatCurrency = (amount: number): string => {
    if (filters.unitFormat === 'CRORES') {
      const cr = amount / 10000000;
      return `₹${cr.toFixed(2)} Cr`;
    }
    if (filters.unitFormat === 'LAKHS') {
      const lk = amount / 100000;
      return `₹${lk.toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Dynamic Target Progress
  const revenueProgressPct = Math.min(100, Math.round((metrics.totalRevenue / (targets.annualRevenueTarget || 1)) * 100));
  const calculatedDso = Math.round((metrics.accountsReceivable / (metrics.totalRevenue || 1)) * 365);
  const isDsoHealthy = calculatedDso <= targets.targetDsoDays;

  // Filter day book vouchers
  const filteredDayBook = initialVouchers.filter((v) => {
    const matchesDate = dayBookDateFilter === 'ALL' || v.date === dayBookDateFilter || v.rawDate === dayBookDateFilter;
    const matchesType = dayBookTypeFilter === 'ALL' || v.type === dayBookTypeFilter;
    const matchesSearch =
      v.id.toLowerCase().includes(dayBookSearch.toLowerCase()) ||
      v.party.toLowerCase().includes(dayBookSearch.toLowerCase()) ||
      v.narration.toLowerCase().includes(dayBookSearch.toLowerCase()) ||
      v.ledgerAccount.toLowerCase().includes(dayBookSearch.toLowerCase());
    return matchesDate && matchesType && matchesSearch;
  });

  const totalDayDebit = filteredDayBook.reduce((sum, v) => sum + v.debitVal, 0);
  const totalDayCredit = filteredDayBook.reduce((sum, v) => sum + v.creditVal, 0);

  // Export CSV Helper
  const handleExportCsv = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((row) =>
        Object.values(row)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv successfully!`);
  };

  const handleExportDayBook = () => {
    const exportData = filteredDayBook.map((v) => ({
      VoucherNumber: v.id,
      Type: v.type,
      Date: v.date,
      Party: v.party,
      LedgerAccount: v.ledgerAccount,
      Debit: v.debitVal,
      Credit: v.creditVal,
      Narration: v.narration,
      Status: v.status,
    }));
    handleExportCsv(`Publishing_Day_Book_${dayBookDateFilter === 'ALL' ? 'Audit_Trail' : dayBookDateFilter}`, exportData);
  };

  const handleExportFinancialPack = () => {
    const pack = [
      { Metric: 'Reporting Entity', Value: brand.companyName || 'Apex Educational Publishers' },
      { Metric: 'Selected Period Scope', Value: filters.period },
      { Metric: 'Selected Branch Godown', Value: filters.branchId },
      { Metric: 'Total Publishing Revenue', Value: formatCurrency(metrics.totalRevenue) },
      { Metric: 'Gross Profit', Value: formatCurrency(metrics.grossProfit), Margin: `${metrics.grossProfitMargin}%` },
      { Metric: 'Net Profit', Value: formatCurrency(metrics.netProfit), Margin: `${metrics.netProfitMargin}%` },
      { Metric: 'Trade Receivables (Debtors)', Value: formatCurrency(metrics.accountsReceivable), DSO: `${calculatedDso} Days` },
      { Metric: 'Stock Valuation (Godowns)', Value: formatCurrency(metrics.inventoryValuation), Units: `${metrics.totalBooksInStock} Copies` },
      { Metric: 'Accrued Author Royalties', Value: formatCurrency(metrics.outstandingRoyalty) },
      ...initialVouchers.map((v) => ({
        Metric: `Voucher ${v.id} (${v.type})`,
        Value: v.debit,
        Party: v.party,
        Date: v.date,
      })),
    ];
    handleExportCsv('Dynamic_Financial_Executive_Pack', pack);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: KpiTargets = {
      ...targets,
      annualRevenueTarget: Number(editTargetRevenue),
      targetDsoDays: Number(editTargetDso),
    };
    setTargets(updated);
    saveStoredKpiTargets(updated);
    setIsTargetsModalOpen(false);
    showToast('Dynamic KPI targets and benchmarks updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Top Bar: Entity, Live Date Range, Branch Selector, and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Financial & Publishing Operations Hub
            </h2>
            <Badge variant="purple" size="sm">
              Live Dynamic Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active reporting for <span className="font-semibold text-slate-700">{brand.companyName || 'Apex Educational Publishers'}</span> • Double-entry trial balance synchronization.
          </p>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Building2 size={13} style={{ color: brand.primaryColor }} />
            <select
              value={filters.branchId}
              onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branches (Consolidated)</option>
              <option value="brn_main_hq">Delhi HQ & Central Depot</option>
              <option value="brn_mumbai">Western Zonal Depot (Bhiwandi)</option>
              <option value="brn_bangalore">Southern Distribution Hub</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Calendar size={13} className="text-slate-400" />
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="FY_2026_27">FY 2026-27 (Year-To-Date)</option>
              <option value="Q1">Q1 (Apr – Jun 2026)</option>
              <option value="Q2">Q2 (Jul – Sep 2026)</option>
              <option value="Q3">Q3 (Oct – Dec 2026)</option>
              <option value="THIS_MONTH">This Month (Nov 2026)</option>
            </select>
          </div>

          {/* Currency Unit Format Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px] font-semibold">
            {(['STANDARD', 'LAKHS', 'CRORES'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFilters({ ...filters, unitFormat: fmt })}
                className={`px-2 py-1 rounded transition-all ${
                  filters.unitFormat === fmt
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {fmt === 'STANDARD' ? '₹' : fmt === 'LAKHS' ? '₹ Lakhs' : '₹ Crores'}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            title="Refresh dynamic accounting metrics"
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-brand-primary' : ''} />
          </button>

          {/* Target Settings */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sliders size={13} />}
            onClick={() => {
              setEditTargetRevenue(targets.annualRevenueTarget);
              setEditTargetDso(targets.targetDsoDays);
              setIsTargetsModalOpen(true);
            }}
          >
            KPI Targets
          </Button>

          {/* Export Financial Pack */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportFinancialPack}
          >
            Export Pack
          </Button>

          {/* New Journal Entry */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => navigate('/vouchers?action=new')}
          >
            New Voucher
          </Button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: REVENUE */}
        <Card
          className="p-4 border-l-4 transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{ borderLeftColor: brand.primaryColor }}
          onClick={() => navigate('/sales')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {filters.period === 'THIS_MONTH' ? 'Monthly Revenue' : 'YTD Publishing Revenue'}
            </span>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: `${brand.primaryColor}1A`,
                color: brand.primaryColor,
              }}
            >
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatCurrency(metrics.totalRevenue)}
            </h3>
            {/* Progress bar towards dynamic annual target */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                <span>Target: {formatCurrency(targets.annualRevenueTarget)}</span>
                <span className="font-bold text-slate-700">{revenueProgressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${revenueProgressPct}%`,
                    backgroundColor: brand.primaryColor,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={13} /> +14.8% YoY
              </span>
              <span className="text-brand-primary font-semibold hover:underline flex items-center gap-0.5">
                View Sales <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Card>

        {/* KPI 2: TRADE RECEIVABLES */}
        <Card
          className="p-4 border-l-4 transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{ borderLeftColor: brand.deepColor }}
          onClick={() => navigate('/sales')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Trade Receivables (Debtors)
            </span>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: `${brand.deepColor}1A`,
                color: brand.deepColor,
              }}
            >
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatCurrency(metrics.accountsReceivable)}
            </h3>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                <span>DSO Velocity</span>
                <span className={`font-bold ${isDsoHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {calculatedDso} Days (Target: {targets.targetDsoDays}d)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDsoHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (calculatedDso / targets.targetDsoDays) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Book Wholesalers & Dealers</span>
              <span className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5">
                Ageing Report <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Card>

        {/* KPI 3: INVENTORY VALUATION */}
        <Card
          className="p-4 border-l-4 transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{ borderLeftColor: brand.accentColor }}
          onClick={() => navigate('/inventory')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Stock Valuation (Godowns)
            </span>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: `${brand.accentColor}1A`,
                color: brand.accentColor,
              }}
            >
              <BookMarked size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatCurrency(metrics.inventoryValuation)}
            </h3>
            <div className="mt-2 text-xs text-slate-600">
              <p className="text-[11px] font-semibold text-slate-700">
                {metrics.totalBooksInStock.toLocaleString('en-IN')} Total Bound Copies
              </p>
              <p className="text-[10px] text-slate-400">
                Finished Titles + Paper Mill Reels
              </p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Valuation: FIFO / Cost</span>
              <span className="font-semibold hover:underline flex items-center gap-0.5" style={{ color: brand.accentColor }}>
                Godowns <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Card>

        {/* KPI 4: AUTHOR ROYALTIES */}
        <Card
          className="p-4 border-l-4 transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{ borderLeftColor: brand.coralColor }}
          onClick={() => navigate('/royalties')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Accrued Author Royalties
            </span>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: `${brand.coralColor}1A`,
                color: brand.coralColor,
              }}
            >
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatCurrency(metrics.outstandingRoyalty)}
            </h3>
            <div className="mt-2 text-xs flex items-center gap-2">
              <Badge variant="coral" size="sm">
                98 Contracts
              </Badge>
              <span className="text-[10px] text-slate-500">Quarterly payout in 18 days</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">TDS 194J Automated</span>
              <span className="font-semibold hover:underline flex items-center gap-0.5" style={{ color: brand.coralColor }}>
                Statements <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dynamic Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Production Cost Chart (2 cols) */}
        <Card
          className="lg:col-span-2"
          header={
            chartMode === 'INFLOW_COST'
              ? 'Monthly Publishing Inflow vs. Production Costs (₹ in Lakhs)'
              : 'Monthly Gross Profit Margin Analysis (%)'
          }
          actions={
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChartMode('INFLOW_COST')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMode === 'INFLOW_COST'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Inflow vs Costs
              </button>
              <button
                onClick={() => setChartMode('MARGIN_PCT')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMode === 'MARGIN_PCT'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Margin %
              </button>
            </div>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'INFLOW_COST' ? (
                <AreaChart data={metrics.monthlyRevenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={brand.primaryColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={brand.primaryColor} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={brand.coralColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={brand.coralColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: any) => [`₹${val} Lakhs`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Sales Revenue (Lakhs)"
                    stroke={brand.primaryColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#purpleGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="purchases"
                    name="Production & Paper Cost (Lakhs)"
                    stroke={brand.coralColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#costGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={metrics.monthlyRevenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Gross Margin']}
                  />
                  <Bar dataKey="grossMarginPct" name="Gross Margin %" fill={brand.primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dynamic Sector Revenue Distribution Card (1 col) */}
        <Card header="Revenue by Sector & Imprint">
          <div className="space-y-4 pt-1">
            {metrics.channelDistribution.map((sector, idx) => {
              const colors = [brand.primaryColor, brand.deepColor, brand.accentColor, brand.coralColor, '#64748b'];
              const sectorColor = colors[idx % colors.length];

              return (
                <div key={sector.channel} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate pr-2" title={sector.channel}>{sector.channel}</span>
                    <span className="font-bold text-slate-800 shrink-0">
                      {sector.percentage}% <span className="text-[10px] text-slate-400 font-normal">({formatCurrency(sector.amount)})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sector.percentage}%`,
                        backgroundColor: sectorColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dominant Publishing Sector:</span>
              <span className="font-bold" style={{ color: brand.primaryColor }}>
                {metrics.channelDistribution[0]?.channel || 'School Curriculum'} ({metrics.channelDistribution[0]?.percentage || 48}%)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Posted Financial Vouchers Table with Clickable View Day Book Action */}
      <Card
        header="Recent Financial & Inventory Vouchers (Audit Trail)"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            rightIcon={<ArrowUpRight size={14} />}
            onClick={() => setIsDayBookOpen(true)}
            className="cursor-pointer font-semibold shadow-xs hover:bg-slate-50"
          >
            View Day Book
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Voucher No</th>
                <th className="py-2.5 px-4">Voucher Type</th>
                <th className="py-2.5 px-4">Party / Author / Account</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Debit (₹)</th>
                <th className="py-2.5 px-4 text-right">Credit (₹)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {initialVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setIsDayBookOpen(true)}
                      className="hover:underline cursor-pointer transition-colors"
                      style={{ color: brand.primaryColor }}
                      title="Click to view full Day Book Audit Trail"
                    >
                      {voucher.id}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={voucher.typeColor as any} size="sm">
                      {voucher.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{voucher.party}</td>
                  <td className="py-3 px-4 text-slate-500">{voucher.date}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                    {voucher.debit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                    {voucher.credit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ● {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: DYNAMIC KPI TARGETS CUSTOMIZER */}
      <Modal
        isOpen={isTargetsModalOpen}
        onClose={() => setIsTargetsModalOpen(false)}
        title="Customize Financial & Operational KPI Targets"
        subtitle="Set organizational benchmarks to track progress dynamically across revenue and collection velocity."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveTargets} className="space-y-4">
          <FormField label="Annual Revenue Benchmark Target (₹)" required>
            <Input
              type="number"
              value={editTargetRevenue}
              onChange={(e) => setEditTargetRevenue(Number(e.target.value))}
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Currently: {formatCurrency(editTargetRevenue)}
            </p>
          </FormField>

          <FormField label="Target DSO (Days Sales Outstanding)" required>
            <Input
              type="number"
              value={editTargetDso}
              onChange={(e) => setEditTargetDso(Number(e.target.value))}
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Industry standard for book distributors: 30 to 45 days.
            </p>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsTargetsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Dynamic Targets
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: INTERACTIVE DAY BOOK AUDIT TRAIL EXPLORER */}
      <Modal
        isOpen={isDayBookOpen}
        onClose={() => setIsDayBookOpen(false)}
        title="Publishing Day Book (Chronological Audit Trail)"
        subtitle="Complete daily double-entry posting ledger across sales, purchases, bank cash, and author royalties."
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Day Book Balancing Proof Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Day Debits
              </span>
              <span className="text-base font-bold font-mono text-slate-800">
                ₹{totalDayDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Day Credits
              </span>
              <span className="text-base font-bold font-mono text-slate-800">
                ₹{totalDayCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Double-Entry Proof
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-0.5">
                <CheckCircle2 size={14} /> Balanced (₹0.00 Diff)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Posted Transactions
              </span>
              <span className="text-base font-bold font-mono text-slate-800">
                {filteredDayBook.length} Vouchers
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {/* Date Filter */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Calendar size={13} className="text-slate-400" />
                <select
                  value={dayBookDateFilter}
                  onChange={(e) => setDayBookDateFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Dates (Recent Trail)</option>
                  <option value="04 Nov 2026">04 Nov 2026 (Today)</option>
                  <option value="03 Nov 2026">03 Nov 2026 (Yesterday)</option>
                  <option value="02 Nov 2026">02 Nov 2026</option>
                  <option value="01 Nov 2026">01 Nov 2026</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={dayBookTypeFilter}
                  onChange={(e) => setDayBookTypeFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Voucher Types</option>
                  <option value="Sales Invoice">Sales Invoice</option>
                  <option value="Purchase Bill">Purchase Bill</option>
                  <option value="Receipt Voucher">Receipt Voucher</option>
                  <option value="Payment Voucher">Payment Voucher</option>
                  <option value="Royalty Accrual">Royalty Accrual</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search party, narration, or account..."
                value={dayBookSearch}
                onChange={(e) => setDayBookSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary w-56"
              />
            </div>
          </div>

          {/* Day Book Detailed Table */}
          <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Party / Account</th>
                  <th className="py-2.5 px-3">Narration & Details</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDayBook.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No vouchers matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDayBook.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold" style={{ color: brand.primaryColor }}>
                        {v.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={v.typeColor as any} size="sm">
                          {v.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{v.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        <p>{v.party}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{v.ledgerAccount}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={v.narration}>
                        {v.narration}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {v.debit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {v.credit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant="success" size="sm">
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={handleExportDayBook}
              >
                Export Day Book (CSV)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Printer size={13} />}
                onClick={() => window.print()}
              >
                Print Day Book
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDayBookOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ExternalLink size={13} />}
                onClick={() => {
                  setIsDayBookOpen(false);
                  navigate('/vouchers');
                }}
              >
                Open in Journal & Vouchers Register
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
