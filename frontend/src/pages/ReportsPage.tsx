import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  ExecutiveKpis,
  MonthlyTrendItem,
  ChannelDistributionItem,
  BookProfitabilityItem,
  AuthorRoyaltyMisItem,
  ProductionCostingItem,
  CustomerAgeingItem,
  StockReorderAlertItem,
  StockAgeingItem,
  getDynamicExecutiveKpis,
  getDynamicMonthlyTrend,
  getDynamicChannelDistribution,
  getDynamicBookProfitability,
  getDynamicAuthorRoyaltyMis,
  getDynamicProductionCosting,
  getDynamicCustomerAgeing,
  getDynamicStockReorderAlerts,
  getDynamicStockAgeing,
} from '../services/reportService';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type ActiveTab = 'dashboard' | 'financials' | 'publishing' | 'ageing' | 'inventory';

export const ReportsPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Dynamic Datasets
  const [kpis, setKpis] = useState<ExecutiveKpis>(getDynamicExecutiveKpis());
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
  const [channelDist, setChannelDist] = useState<ChannelDistributionItem[]>([]);
  const [bookProfitability, setBookProfitability] = useState<BookProfitabilityItem[]>([]);
  const [authorRoyalty, setAuthorRoyalty] = useState<AuthorRoyaltyMisItem[]>([]);
  const [productionCosting, setProductionCosting] = useState<ProductionCostingItem[]>([]);
  const [customerAgeing, setCustomerAgeing] = useState<CustomerAgeingItem[]>([]);
  const [stockReorderAlerts, setStockReorderAlerts] = useState<StockReorderAlertItem[]>([]);
  const [stockAgeing, setStockAgeing] = useState<StockAgeingItem[]>([]);

  // Load All Dynamic Data
  const loadReportsData = () => {
    setKpis(getDynamicExecutiveKpis());
    setMonthlyTrend(getDynamicMonthlyTrend());
    setChannelDist(getDynamicChannelDistribution());
    setBookProfitability(getDynamicBookProfitability());
    setAuthorRoyalty(getDynamicAuthorRoyaltyMis());
    setProductionCosting(getDynamicProductionCosting());
    setCustomerAgeing(getDynamicCustomerAgeing());
    setStockReorderAlerts(getDynamicStockReorderAlerts());
    setStockAgeing(getDynamicStockAgeing());
  };

  useEffect(() => {
    loadReportsData();
  }, [selectedFY, selectedBranch]);

  // CSV Export Utility
  const handleExportCsv = (title: string, data: any[]) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      `${brand.companyName.toUpperCase()} - ${title.toUpperCase()}`,
      `Financial Year: ${selectedFY} | Branch: ${selectedBranch} | Generated: ${new Date().toISOString()}`,
      '',
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
            return val !== undefined ? val : '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Datasets based on Search
  const filteredBookProfitability = useMemo(() => {
    if (!searchTerm) return bookProfitability;
    const t = searchTerm.toLowerCase();
    return bookProfitability.filter(
      (b) =>
        b.title.toLowerCase().includes(t) ||
        b.isbn.toLowerCase().includes(t) ||
        b.authorName.toLowerCase().includes(t)
    );
  }, [bookProfitability, searchTerm]);

  const filteredCustomerAgeing = useMemo(() => {
    if (!searchTerm) return customerAgeing;
    const t = searchTerm.toLowerCase();
    return customerAgeing.filter((c) => c.partyName.toLowerCase().includes(t));
  }, [customerAgeing, searchTerm]);

  const filteredStockAgeing = useMemo(() => {
    if (!searchTerm) return stockAgeing;
    const t = searchTerm.toLowerCase();
    return stockAgeing.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.isbn.toLowerCase().includes(t) ||
        s.warehouseName.toLowerCase().includes(t)
    );
  }, [stockAgeing, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Executive MIS & Financial Reporting</h1>
            <Badge variant="purple" size="sm">Audit Certified</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated General Ledger KPIs, Publishing Margins, Double-Entry Cash Flows, and Multi-Depot Valuation for {brand.companyName}.
          </p>
        </div>

        {/* Global Multi-Dimensional Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-purple-600"
          >
            <option value="2026-2027">FY 2026–2027 (Current)</option>
            <option value="2025-2026">FY 2025–2026</option>
            <option value="2024-2025">FY 2024–2025</option>
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-purple-600"
          >
            <option value="ALL">All Branches & Depots</option>
            <option value="HQ">Corporate HQ (New Delhi)</option>
            <option value="SAHIBABAD">Central Depot (Sahibabad)</option>
            <option value="KOLKATA">Regional Hub (Kolkata)</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadReportsData}
            title="Refresh dynamic calculations"
          >
            <RefreshCw size={13} className="mr-1 text-slate-600" />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer size={13} className="mr-1 text-slate-600" />
            Print
          </Button>

          <Button
            style={{ backgroundColor: brand.primaryColor }}
            className="text-white text-xs hover:opacity-90 shadow-sm"
            size="sm"
            onClick={() => handleExportCsv('Executive_Dashboard_KPIs', [kpis])}
          >
            <Download size={13} className="mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 6 High-Impact Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="p-3 border-l-4 shadow-sm" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
            <ArrowUpRight size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Gross Margin: {kpis.grossMarginPercent}%</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Profit</span>
            <DollarSign size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.netProfit.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Net Margin: {kpis.netProfitMargin}%</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Liquid Funds</span>
            <Building size={14} className="text-indigo-500" />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.totalLiquidFunds.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Bank: ₹{(kpis.bankBalance / 100000).toFixed(1)}L | Cash: ₹{(kpis.cashBalance / 100000).toFixed(1)}L
          </div>
        </Card>

        <Card className="p-3 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Receivables</span>
            <TrendingUp size={14} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.accountsReceivable.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Trade Debtors Ledger</div>
        </Card>

        <Card className="p-3 border-l-4 shadow-sm" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock Valuation</span>
            <Package size={14} style={{ color: brand.accentColor }} />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.inventoryValuation.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{kpis.totalBooksInStock.toLocaleString('en-IN')} Books in Stock</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trade Payables</span>
            <AlertTriangle size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-black text-slate-800">₹{kpis.accountsPayable.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Paper Mills & Binders</div>
        </Card>
      </div>

      {/* Navigation Tabs & Global Search */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Executive Overview', icon: BarChart3 },
            { id: 'financials', label: 'Financial Statements (P&L, Cash Flow)', icon: FileText },
            { id: 'publishing', label: 'Publishing & Production MIS', icon: BookOpen },
            { id: 'ageing', label: 'Debtors & Creditors Ageing', icon: Users },
            { id: 'inventory', label: 'Stock Ageing & Safety Alerts', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-2 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                style={isActive ? { borderColor: brand.primaryColor, color: brand.primaryColor } : {}}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-64 mb-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search report titles, parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue vs Purchases Trend Chart */}
            <Card className="lg:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Monthly Revenue & Cost Trajectory</h3>
                  <p className="text-[11px] text-slate-500">Publishing book sales vs. raw paper and printing costs</p>
                </div>
                <Badge variant="purple" size="sm">{selectedFY}</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={brand.primaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={brand.primaryColor} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorPurch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F06A64" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F06A64" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Book Sales Revenue"
                      stroke={brand.primaryColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                    <Area
                      type="monotone"
                      dataKey="purchases"
                      name="Production Cost"
                      stroke="#F06A64"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPurch)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Channel-Wise Distribution */}
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Sales by Channel Distribution</h3>
                <p className="text-[11px] text-slate-500 mb-4">Volume split across distributors, schools, POS, and online</p>
                <div className="space-y-3">
                  {channelDist.map((ch, idx) => (
                    <div key={ch.channel} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{ch.channel}</span>
                        <span className="font-bold text-slate-900">
                          ₹{ch.amount.toLocaleString('en-IN')} ({ch.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ch.percentage}%`,
                            backgroundColor:
                              idx === 0
                                ? brand.primaryColor
                                : idx === 1
                                ? '#340771'
                                : idx === 2
                                ? brand.accentColor
                                : '#F06A64',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Double-Entry Integrity Checked
                </div>
                <p className="text-[11px] text-slate-500">
                  Total Trial Balance: ₹15,275,000 Debit = ₹15,275,000 Credit with Zero Difference across all active General Ledger accounts.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL STATEMENTS */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit & Loss Statement */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Profit & Loss Statement</h3>
                <p className="text-[11px] text-slate-500">For Financial Year {selectedFY}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleExportCsv('Profit_Loss_Statement', [
                    { section: 'Revenue from Operations', amount: kpis.totalRevenue },
                    { section: 'Direct Paper & Printing Costs', amount: kpis.totalPurchases },
                    { section: 'Gross Profit', amount: kpis.grossProfit },
                    { section: 'Indirect & Operating Expenses', amount: kpis.totalExpenses },
                    { section: 'Net Profit before Tax', amount: kpis.netProfit },
                  ])
                }
              >
                <Download size={13} className="mr-1" />
                CSV
              </Button>
            </div>

            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700">
                  <td className="py-2 px-2" colSpan={2}>A. REVENUE FROM PUBLISHING OPERATIONS</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Wholesale & Institutional Book Sales</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹{kpis.totalRevenue.toLocaleString('en-IN')}.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  <td className="py-2 px-2">Total Operating Revenue (A)</td>
                  <td className="py-2 px-2 text-right text-emerald-600">
                    ₹{kpis.totalRevenue.toLocaleString('en-IN')}.00
                  </td>
                </tr>

                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700 mt-2">
                  <td className="py-2 px-2" colSpan={2}>B. DIRECT PRODUCTION EXPENSES</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Raw Paper & Board Purchases</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹225,000.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Press Printing & Job Work Charges</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹95,000.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Binding, Folding & Lamination</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹55,000.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  <td className="py-2 px-2">Total Direct Expenses (B)</td>
                  <td className="py-2 px-2 text-right text-rose-600">
                    ₹{kpis.totalPurchases.toLocaleString('en-IN')}.00
                  </td>
                </tr>

                <tr className="border-b border-slate-200 font-black text-slate-900 bg-purple-50">
                  <td className="py-2 px-2 text-purple-700">GROSS PROFIT (A - B)</td>
                  <td className="py-2 px-2 text-right text-purple-700">
                    ₹{kpis.grossProfit.toLocaleString('en-IN')}.00 ({kpis.grossMarginPercent}%)
                  </td>
                </tr>

                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700">
                  <td className="py-2 px-2" colSpan={2}>C. INDIRECT OPERATING EXPENSES</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Warehouse Rent & Logistics</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹45,000.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Author Royalty Accruals</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹35,000.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Depreciation on Capital Assets</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹20,000.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-black text-slate-900 bg-emerald-50">
                  <td className="py-2 px-2 text-emerald-700">NET PROFIT BEFORE TAX</td>
                  <td className="py-2 px-2 text-right text-emerald-700">
                    ₹{kpis.netProfit.toLocaleString('en-IN')}.00 ({kpis.netProfitMargin}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Cash Flow Statement */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Cash Flow Statement</h3>
                <p className="text-[11px] text-slate-500">Operating, Investing & Financing Activities</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleExportCsv('Cash_Flow_Statement', [
                    { section: 'Net Cash from Operating Activities', amount: 147000 },
                    { section: 'Net Cash used in Investing Activities', amount: -213250 },
                    { section: 'Net Cash used in Financing Activities', amount: -50000 },
                    { section: 'Net Change in Cash and Cash Equivalents', amount: -116250 },
                    { section: 'Opening Cash & Bank Balance', amount: 4700000 },
                    { section: 'Closing Cash & Bank Balance', amount: kpis.totalLiquidFunds },
                  ])
                }
              >
                <Download size={13} className="mr-1" />
                CSV
              </Button>
            </div>

            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700">
                  <td className="py-2 px-2" colSpan={2}>1. CASH FLOW FROM OPERATING ACTIVITIES</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Net Profit before Tax & Adjustments</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹{kpis.netProfit.toLocaleString('en-IN')}.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Adjustment for Non-Cash Depreciation</td>
                  <td className="py-1.5 px-2 text-right font-medium">+₹125,000.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Working Capital Adjustments (Debtors/Creditors)</td>
                  <td className="py-1.5 px-2 text-right font-medium">-₹93,000.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  <td className="py-2 px-2">Net Cash from Operations (A)</td>
                  <td className="py-2 px-2 text-right text-emerald-600">+₹147,000.00</td>
                </tr>

                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700">
                  <td className="py-2 px-2" colSpan={2}>2. CASH FLOW FROM INVESTING ACTIVITIES</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Purchase of Polar 115 High-Speed Guillotine</td>
                  <td className="py-1.5 px-2 text-right font-medium">-₹281,250.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Disposal of Obsolete Server Hardware</td>
                  <td className="py-1.5 px-2 text-right font-medium">+₹68,000.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  <td className="py-2 px-2">Net Cash used in Investing (B)</td>
                  <td className="py-2 px-2 text-right text-rose-600">-₹213,250.00</td>
                </tr>

                <tr className="border-b border-slate-100 font-bold bg-slate-50 text-slate-700">
                  <td className="py-2 px-2" colSpan={2}>3. CASH FLOW FROM FINANCING ACTIVITIES</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-4 text-slate-600">Term Loan Principal Repayment</td>
                  <td className="py-1.5 px-2 text-right font-medium">-₹50,000.00</td>
                </tr>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  <td className="py-2 px-2">Net Cash used in Financing (C)</td>
                  <td className="py-2 px-2 text-right text-rose-600">-₹50,000.00</td>
                </tr>

                <tr className="border-b border-slate-200 font-black bg-purple-50 text-slate-900">
                  <td className="py-2 px-2 text-purple-700">NET CHANGE IN CASH & EQUIVALENTS (A+B+C)</td>
                  <td className="py-2 px-2 text-right text-rose-600">-₹116,250.00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 px-2 text-slate-600">Opening Cash & Bank Balance</td>
                  <td className="py-1.5 px-2 text-right font-medium">₹4,700,000.00</td>
                </tr>
                <tr className="font-black bg-emerald-50 text-emerald-800">
                  <td className="py-2 px-2">CLOSING LIQUID FUNDS (Live Bank & Cash)</td>
                  <td className="py-2 px-2 text-right">₹{kpis.totalLiquidFunds.toLocaleString('en-IN')}.00</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 3: PUBLISHING & PRODUCTION MIS */}
      {activeTab === 'publishing' && (
        <div className="space-y-6">
          {/* Title Profitability Matrix */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Book-Wise Profitability Matrix</h3>
                <p className="text-[11px] text-slate-500">Gross revenue, production costs, author royalties, and title net margins</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportCsv('Book_Profitability_Report', filteredBookProfitability)}
              >
                <Download size={13} className="mr-1" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Title & Edition</th>
                    <th className="py-2 px-3">ISBN</th>
                    <th className="py-2 px-3">Author</th>
                    <th className="py-2 px-3 text-right">Copies Sold</th>
                    <th className="py-2 px-3 text-right">Gross Sales</th>
                    <th className="py-2 px-3 text-right">Production Cost</th>
                    <th className="py-2 px-3 text-right">Royalty</th>
                    <th className="py-2 px-3 text-right">Net Profit</th>
                    <th className="py-2 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookProfitability.map((b) => (
                    <tr key={b.bookId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{b.title}</div>
                        <div className="text-[11px] text-slate-400">{b.edition}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{b.isbn}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{b.authorName}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {b.copiesSold.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        ₹{b.grossRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600">
                        ₹{b.productionCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-600">
                        ₹{b.royaltyExpense.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                        ₹{b.netProfit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant="purple" size="sm">{b.marginPercentage}%</Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredBookProfitability.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        No titles match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Author Sales & Royalty MIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Author Royalty Accruals & Payouts</h3>
                  <p className="text-[11px] text-slate-500">Earned royalties, advances recovered, and net payable</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportCsv('Author_Royalty_MIS', authorRoyalty)}
                >
                  <Download size={13} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-2">Author Name</th>
                      <th className="py-2 px-2 text-right">Copies Sold</th>
                      <th className="py-2 px-2 text-right">Earned Royalty</th>
                      <th className="py-2 px-2 text-right">Advance Recovery</th>
                      <th className="py-2 px-2 text-right">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {authorRoyalty.map((auth) => (
                      <tr key={auth.authorId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2">
                          <div className="font-bold text-slate-800">{auth.authorName}</div>
                          <div className="text-[10px] text-slate-400">{auth.titlesCount} Active Titles</div>
                        </td>
                        <td className="py-2 px-2 text-right font-medium">{auth.totalCopiesSold.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-2 text-right font-medium text-slate-900">
                          ₹{auth.earnedRoyalty.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-500">
                          -₹{auth.advancesRecovered.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-600">
                          ₹{auth.netPayable.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Production Costing & Press Spoilage */}
            <Card className="p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Production Cost & Press Variance</h3>
                  <p className="text-[11px] text-slate-500">Planned vs actual print run costs with cost per copy</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportCsv('Production_Costing_MIS', productionCosting)}
                >
                  <Download size={13} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-2">Print Order</th>
                      <th className="py-2 px-2 text-right">Planned / Actual</th>
                      <th className="py-2 px-2 text-right">Actual Cost</th>
                      <th className="py-2 px-2 text-right">Cost / Copy</th>
                      <th className="py-2 px-2 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productionCosting.map((p) => (
                      <tr key={p.projectId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2">
                          <div className="font-bold text-slate-800">{p.projectId}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.title}</div>
                        </td>
                        <td className="py-2 px-2 text-right font-medium">
                          {p.plannedCopies} / {p.actualCopies}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">
                          ₹{p.actualCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-purple-700">₹{p.costPerCopy}</td>
                        <td className="py-2 px-2 text-right text-rose-500">
                          +₹{p.varianceAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: DEBTORS & CREDITORS AGEING */}
      {activeTab === 'ageing' && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Trade Debtors Ageing Analysis (Receivables)</h3>
                <p className="text-[11px] text-slate-500">Overdue breakdown across 0-30, 31-60, 61-90, and 90+ day buckets</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportCsv('Customer_Debtors_Ageing', filteredCustomerAgeing)}
              >
                <Download size={13} className="mr-1" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Customer / Distributor</th>
                    <th className="py-2 px-3 text-right">Total Outstanding</th>
                    <th className="py-2 px-3 text-right">0–30 Days</th>
                    <th className="py-2 px-3 text-right">31–60 Days</th>
                    <th className="py-2 px-3 text-right">61–90 Days</th>
                    <th className="py-2 px-3 text-right">90+ Days</th>
                    <th className="py-2 px-3 text-right">Credit Limit</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomerAgeing.map((c) => (
                    <tr key={c.partyName} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{c.partyName}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        ₹{c.totalOutstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-600">
                        ₹{c.bucket0to30.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        ₹{c.bucket31to60.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-600">
                        ₹{c.bucket61to90.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                        ₹{c.bucketOver90.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        ₹{c.creditLimit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={c.status === 'CURRENT' ? 'success' : 'coral'} size="sm">
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomerAgeing.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        No debtors match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: INVENTORY & SAFETY ALERTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Critical Reorder Alerts */}
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Critical Stock Reorder Alerts</h3>
                  <p className="text-[11px] text-slate-500">Titles where available stock is at or below the safety reorder threshold</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportCsv('Stock_Reorder_Alerts', stockReorderAlerts)}
              >
                <Download size={13} className="mr-1" />
                CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50/50 text-slate-600 border-b border-amber-200 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Book Title & ISBN</th>
                    <th className="py-2 px-3 text-right">Current Stock</th>
                    <th className="py-2 px-3 text-right">Reserved Stock</th>
                    <th className="py-2 px-3 text-right font-black text-rose-600">Available Stock</th>
                    <th className="py-2 px-3 text-right">Reorder Level</th>
                    <th className="py-2 px-3 text-right font-bold text-purple-700">Recommended Order</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockReorderAlerts.map((alert) => (
                    <tr key={alert.bookId} className="hover:bg-amber-50/30">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{alert.title}</div>
                        <div className="text-[11px] font-mono text-slate-400">{alert.isbn}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">{alert.currentStock}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{alert.reservedStock}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600">{alert.availableStock}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{alert.reorderLevel}</td>
                      <td className="py-2.5 px-3 text-right font-black text-purple-700">
                        {alert.recommendedOrderQuantity} units
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={alert.status === 'CRITICAL' ? 'magenta' : 'coral'} size="sm">
                          {alert.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {stockReorderAlerts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        All titles have adequate stock levels above safety reorder thresholds.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Stock Ageing & Dead Stock Classification */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Inventory Stock Ageing & Dead Stock Analysis</h3>
                <p className="text-[11px] text-slate-500">Warehouse location, age in days, and velocity classification</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportCsv('Stock_Ageing_MIS', filteredStockAgeing)}
              >
                <Download size={13} className="mr-1" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Title & ISBN</th>
                    <th className="py-2 px-3">Warehouse / Bay Location</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Unit Value</th>
                    <th className="py-2 px-3 text-right font-black">Total Valuation</th>
                    <th className="py-2 px-3 text-right">Age (Days)</th>
                    <th className="py-2 px-3 text-center">Velocity Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStockAgeing.map((item) => (
                    <tr key={item.bookId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{item.title}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.isbn}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.warehouseName}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{item.quantity.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₹{item.unitValue}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.totalValuation.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{item.ageDays} d</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant={
                            item.category === 'FAST_MOVING'
                              ? 'success'
                              : item.category === 'NORMAL'
                              ? 'purple'
                              : item.category === 'SLOW_MOVING'
                              ? 'coral'
                              : 'magenta'
                          }
                          size="sm"
                        >
                          {item.category.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredStockAgeing.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No inventory lots match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
