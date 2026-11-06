import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  ExpenseVoucher,
  FixedAsset,
  ReimbursementClaim,
  RecurringExpense,
  BudgetPlan,
  getStoredExpenseVouchers,
  saveExpenseVoucher,
  approveExpenseVoucher,
  deleteExpenseVoucher,
  getStoredFixedAssets,
  saveFixedAsset,
  runAssetDepreciation,
  deleteFixedAsset,
  getStoredReimbursements,
  saveReimbursementClaim,
  approveReimbursementClaim,
  payReimbursementClaim,
  getStoredRecurringExpenses,
  saveRecurringExpense,
  processRecurringExpenses,
  toggleRecurringStatus,
  getStoredBudgets,
  computeExpenseKpis,
  computeCategoryBreakdown,
  computeDepreciationSummary,
} from '../services/expenseService';
import {
  Receipt,
  Building2,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Check,
  Building,
  Briefcase,
  PieChart,
  Search,
  Download,
  Trash2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Percent,
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<
    'vouchers' | 'assets' | 'reimbursements' | 'recurring' | 'budgets' | 'reports'
  >('vouchers');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Dynamic Data
  const [vouchers, setVouchers] = useState<ExpenseVoucher[]>([]);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [budgets, setBudgets] = useState<BudgetPlan[]>([]);

  // Modals Control
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Selected Target for Action
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  // Form States
  const [voucherForm, setVoucherForm] = useState({
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Administration',
    amount: '',
    taxAmount: '0',
    vendorName: '',
    paymentMethod: 'BANK_TRANSFER' as ExpenseVoucher['paymentMethod'],
    notes: '',
  });

  const [assetForm, setAssetForm] = useState({
    assetName: '',
    category: 'PLANT_AND_MACHINERY' as FixedAsset['category'],
    purchaseValue: '',
    salvageValue: '0',
    usefulLifeYears: '10',
    depreciationMethod: 'SLM' as 'SLM' | 'WDV',
    annualDepreciationRate: '10',
    location: '',
    serialNumber: '',
  });

  const [claimForm, setClaimForm] = useState({
    employeeName: '',
    department: 'Editorial',
    purpose: '',
    amount: '',
    receiptAttached: true,
  });

  const [recurringForm, setRecurringForm] = useState({
    title: '',
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Administration',
    amount: '',
    frequency: 'MONTHLY' as RecurringExpense['frequency'],
    nextDueDate: new Date().toISOString().substring(0, 10),
    vendorName: '',
    paymentMethod: 'BANK_TRANSFER',
  });

  // Load All Dynamic Data
  const loadAllData = () => {
    setVouchers(getStoredExpenseVouchers());
    setAssets(getStoredFixedAssets());
    setClaims(getStoredReimbursements());
    setRecurring(getStoredRecurringExpenses());
    setBudgets(getStoredBudgets());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // KPIs and Live Aggregates
  const kpis = useMemo(() => computeExpenseKpis(), [vouchers, assets, budgets, claims]);
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(), [vouchers]);
  const depreciationSummary = useMemo(() => computeDepreciationSummary(), [assets]);

  // Handlers
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const { voucher, glVoucherNumber } = saveExpenseVoucher({
      categoryName: voucherForm.categoryName,
      department: voucherForm.department,
      amount: parseFloat(voucherForm.amount) || 0,
      taxAmount: parseFloat(voucherForm.taxAmount) || 0,
      paymentMethod: voucherForm.paymentMethod,
      vendorName: voucherForm.vendorName || undefined,
      notes: voucherForm.notes,
    });

    loadAllData();
    setShowVoucherModal(false);
    setVoucherForm({
      categoryName: 'Administrative, Rent & Utilities',
      department: 'Administration',
      amount: '',
      taxAmount: '0',
      vendorName: '',
      paymentMethod: 'BANK_TRANSFER',
      notes: '',
    });

    setSuccessMessage(
      glVoucherNumber
        ? `Expense Voucher ${voucher.voucherNumber} recorded & posted to GL as ${glVoucherNumber}!`
        : `Expense Voucher ${voucher.voucherNumber} recorded (routed for Manager Approval since > ₹50,000)!`
    );
    setShowSuccessModal(true);
  };

  const handleApproveVoucher = (id: string) => {
    const updated = approveExpenseVoucher(id, 'Finance Manager');
    if (updated) {
      loadAllData();
      setSuccessMessage(`Expense Voucher ${updated.voucherNumber} approved & posted to GL as ${updated.accountingVoucherNumber}!`);
      setShowSuccessModal(true);
    }
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm('Are you sure you want to delete this expense voucher?')) {
      deleteExpenseVoucher(id);
      loadAllData();
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newA = saveFixedAsset({
      assetName: assetForm.assetName,
      category: assetForm.category,
      purchaseValue: parseFloat(assetForm.purchaseValue) || 0,
      salvageValue: parseFloat(assetForm.salvageValue) || 0,
      usefulLifeYears: parseFloat(assetForm.usefulLifeYears) || 5,
      depreciationMethod: assetForm.depreciationMethod,
      annualDepreciationRate: parseFloat(assetForm.annualDepreciationRate) || 10,
      location: assetForm.location,
      serialNumber: assetForm.serialNumber,
    });

    loadAllData();
    setShowAssetModal(false);
    setAssetForm({
      assetName: '',
      category: 'PLANT_AND_MACHINERY',
      purchaseValue: '',
      salvageValue: '0',
      usefulLifeYears: '10',
      depreciationMethod: 'SLM',
      annualDepreciationRate: '10',
      location: '',
      serialNumber: '',
    });

    setSuccessMessage(`Capital Asset ${newA.assetCode} (${newA.assetName}) successfully added to Asset Register!`);
    setShowSuccessModal(true);
  };

  const handlePostDepreciation = (assetId: string) => {
    const result = runAssetDepreciation(assetId);
    setShowDepreciationModal(false);
    if (result) {
      loadAllData();
      setSuccessMessage(
        `Depreciation of ₹${result.depreciationAmount.toLocaleString('en-IN')} posted to GL as JV ${result.glVoucherNumber} for ${result.asset.assetName}!`
      );
      setShowSuccessModal(true);
    } else {
      alert('Unable to run depreciation: Asset is already fully depreciated or salvage threshold reached.');
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Are you sure you want to remove this asset from the register?')) {
      deleteFixedAsset(id);
      loadAllData();
    }
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim = saveReimbursementClaim({
      employeeName: claimForm.employeeName,
      department: claimForm.department,
      purpose: claimForm.purpose,
      amount: parseFloat(claimForm.amount) || 0,
      receiptAttached: claimForm.receiptAttached,
    });

    loadAllData();
    setShowClaimModal(false);
    setClaimForm({
      employeeName: '',
      department: 'Editorial',
      purpose: '',
      amount: '',
      receiptAttached: true,
    });

    setSuccessMessage(`Employee claim ${newClaim.claimNumber} submitted for departmental review!`);
    setShowSuccessModal(true);
  };

  const handleApproveClaim = (id: string) => {
    const res = approveReimbursementClaim(id);
    if (res) {
      loadAllData();
      setSuccessMessage(`Claim ${res.claimNumber} approved for settlement!`);
      setShowSuccessModal(true);
    }
  };

  const handlePayClaim = (id: string) => {
    const res = payReimbursementClaim(id, 'BANK_TRANSFER');
    if (res) {
      loadAllData();
      setSuccessMessage(
        `Claim ${res.claim.claimNumber} settled via Bank Transfer! GL Payment Voucher: ${res.glVoucherNumber}`
      );
      setShowSuccessModal(true);
    }
  };

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const newR = saveRecurringExpense({
      title: recurringForm.title,
      categoryName: recurringForm.categoryName,
      department: recurringForm.department,
      amount: parseFloat(recurringForm.amount) || 0,
      frequency: recurringForm.frequency,
      nextDueDate: recurringForm.nextDueDate,
      vendorName: recurringForm.vendorName,
      paymentMethod: recurringForm.paymentMethod,
    });

    loadAllData();
    setShowRecurringModal(false);
    setRecurringForm({
      title: '',
      categoryName: 'Administrative, Rent & Utilities',
      department: 'Administration',
      amount: '',
      frequency: 'MONTHLY',
      nextDueDate: new Date().toISOString().substring(0, 10),
      vendorName: '',
      paymentMethod: 'BANK_TRANSFER',
    });

    setSuccessMessage(`Recurring schedule "${newR.title}" added to automated expense calendar!`);
    setShowSuccessModal(true);
  };

  const handleProcessRecurringBatch = () => {
    const { generatedCount } = processRecurringExpenses();
    loadAllData();
    setSuccessMessage(
      `Processed ${generatedCount} active recurring expense vouchers with direct double-entry General Ledger postings!`
    );
    setShowSuccessModal(true);
  };

  const handleToggleRecurring = (id: string) => {
    toggleRecurringStatus(id);
    loadAllData();
  };

  // CSV Export Utility
  const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredVouchers = useMemo(() => {
    if (!searchTerm) return vouchers;
    const term = searchTerm.toLowerCase();
    return vouchers.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(term) ||
        v.categoryName.toLowerCase().includes(term) ||
        v.department.toLowerCase().includes(term) ||
        (v.vendorName && v.vendorName.toLowerCase().includes(term))
    );
  }, [vouchers, searchTerm]);

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    const term = searchTerm.toLowerCase();
    return assets.filter(
      (a) =>
        a.assetCode.toLowerCase().includes(term) ||
        a.assetName.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.location.toLowerCase().includes(term)
    );
  }, [assets, searchTerm]);

  const filteredClaims = useMemo(() => {
    if (!searchTerm) return claims;
    const term = searchTerm.toLowerCase();
    return claims.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(term) ||
        c.employeeName.toLowerCase().includes(term) ||
        c.department.toLowerCase().includes(term) ||
        c.purpose.toLowerCase().includes(term)
    );
  }, [claims, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Expenses, Fixed Assets & Budgeting"
        description={`Enterprise management of operating expenses, double-entry GL vouchers, fixed assets SLM/WDV depreciation schedules, employee reimbursements, and departmental budgets for ${brand.companyName}.`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={handleProcessRecurringBatch}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Process Recurring Run
            </Button>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white text-xs hover:opacity-90 shadow-sm"
              onClick={() => setShowVoucherModal(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Expense Voucher
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 shadow-sm" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Approved Expenses (MTD)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{kpis.approvedExpensesMtd.toLocaleString('en-IN')}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-purple-700">{kpis.approvedVouchersCount} posted</span>
                {kpis.pendingApprovalsCount > 0 && (
                  <span className="text-amber-600 font-medium">({kpis.pendingApprovalsCount} pending)</span>
                )}
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
            >
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Fixed Assets (Gross Cost)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{(kpis.grossAssetValue / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-xs text-slate-500 mt-1">{kpis.totalAssetsCount} capital assets registered</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 shadow-sm" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Net Book Value (NBV)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{(kpis.netBookValue / 100000).toFixed(2)} Lakh
              </h3>
              <p className="text-xs text-rose-600 font-medium mt-1">
                Depreciation: ₹{(kpis.accumulatedDepreciation / 100000).toFixed(2)} L
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brand.accentColor}15`, color: brand.accentColor }}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Budget Consumption Delta</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {kpis.overallBudgetVariancePct > 0 ? `+${kpis.overallBudgetVariancePct}%` : `${kpis.overallBudgetVariancePct}%`}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {kpis.reimbursementsPendingCount > 0
                  ? `${kpis.reimbursementsPendingCount} staff claim(s) awaiting approval`
                  : 'All departments within fiscal ceiling'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'vouchers', label: `Expense Vouchers (${vouchers.length})`, icon: Receipt },
            { id: 'assets', label: `Fixed Assets Register (${assets.length})`, icon: Building },
            { id: 'reimbursements', label: `Employee Claims (${claims.length})`, icon: UserCheck },
            { id: 'recurring', label: `Recurring Expenses (${recurring.length})`, icon: RotateCcw },
            { id: 'budgets', label: 'Budget vs Actuals', icon: Briefcase },
            { id: 'reports', label: 'Costing & Depreciation Reports', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-b-2 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                style={isActive ? { borderColor: brand.primaryColor, color: brand.primaryColor } : {}}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 mb-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses, assets, claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* TAB 1: EXPENSE VOUCHERS */}
      {activeTab === 'vouchers' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Operational & Departmental Expense Vouchers</h3>
              <p className="text-xs text-slate-500">
                Multi-dimensional tagging with direct General Ledger Payment Voucher (`PV/2026/xxxx`) integration. Vouchers &gt; ₹50,000 require manager approval.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('expense_vouchers', filteredVouchers)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowVoucherModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Record Voucher
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Expense Category</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Vendor / Beneficiary</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3 text-right">Tax (₹)</th>
                  <th className="p-3 text-right">Total (₹)</th>
                  <th className="p-3">GL Posting</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{v.voucherNumber}</td>
                    <td className="p-3 text-slate-600">{v.date}</td>
                    <td className="p-3 font-medium text-slate-800">{v.categoryName}</td>
                    <td className="p-3 text-slate-600">{v.department}</td>
                    <td className="p-3 text-slate-600">{v.vendorName || '—'}</td>
                    <td className="p-3 text-right font-medium">₹{v.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-slate-500">₹{v.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{v.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      {v.accountingVoucherNumber ? (
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {v.accountingVoucherNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending Approval</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={v.status === 'APPROVED' ? 'success' : v.status === 'PENDING_APPROVAL' ? 'warning' : 'slate'}
                      >
                        {v.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {v.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                          onClick={() => handleApproveVoucher(v.id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-rose-600 h-7 w-7 p-0"
                        onClick={() => handleDeleteVoucher(v.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      No expense vouchers match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: FIXED ASSETS */}
      {activeTab === 'assets' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Fixed Asset Register & Depreciation Engine</h3>
              <p className="text-xs text-slate-500">
                Track capital offset printing presses, IT server clusters, warehouse fixtures with SLM/WDV depreciation schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('fixed_assets_register', filteredAssets)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowAssetModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Register Asset
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Asset Code</th>
                  <th className="p-3">Asset Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Depot Location</th>
                  <th className="p-3 text-right">Original Cost</th>
                  <th className="p-3 text-right">Acc. Depreciation</th>
                  <th className="p-3 text-right">Net Book Value</th>
                  <th className="p-3">Method & Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{a.assetCode}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{a.assetName}</div>
                      {a.serialNumber && (
                        <div className="text-xs text-slate-400 font-mono">S/N: {a.serialNumber}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 text-xs">{a.category.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-slate-600 text-xs">{a.location}</td>
                    <td className="p-3 text-right font-medium">₹{a.purchaseValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-rose-600 font-medium">
                      ₹{a.accumulatedDepreciation.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{a.netBookValue.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {a.depreciationMethod} ({a.annualDepreciationRate}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={a.status === 'ACTIVE' ? 'success' : a.status === 'FULLY_DEPRECIATED' ? 'warning' : 'slate'}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {a.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50 h-7 px-2"
                          onClick={() => {
                            setSelectedAsset(a);
                            setShowDepreciationModal(true);
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Depreciate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-rose-600 h-7 w-7 p-0"
                        onClick={() => handleDeleteAsset(a.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No assets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: EMPLOYEE REIMBURSEMENTS */}
      {activeTab === 'reimbursements' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Employee Expense Claims & Reimbursements</h3>
              <p className="text-xs text-slate-500">
                Staff travel, book fair conveyance, manuscript review meals with double-entry Payment Voucher disbursement.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('employee_reimbursements', filteredClaims)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowClaimModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Submit Claim
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Claim #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Purpose & Details</th>
                  <th className="p-3 text-right">Claim Amount</th>
                  <th className="p-3">GL Payment Ref</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{c.claimNumber}</td>
                    <td className="p-3 text-slate-600">{c.claimDate}</td>
                    <td className="p-3 font-medium text-slate-800">{c.employeeName}</td>
                    <td className="p-3 text-slate-600">{c.department}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{c.purpose}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      {c.accountingVoucherNumber ? (
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {c.accountingVoucherNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not Disbursed</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={c.status === 'PAID' ? 'success' : c.status === 'APPROVED' ? 'purple' : 'warning'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {c.status === 'SUBMITTED' && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2"
                          onClick={() => handleApproveClaim(c.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {c.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                          onClick={() => handlePayClaim(c.id)}
                        >
                          Pay Settlement
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredClaims.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No reimbursement claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: RECURRING EXPENSES */}
      {activeTab === 'recurring' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recurring Scheduled Expenses</h3>
              <p className="text-xs text-slate-500">
                Automated monthly, quarterly, and annual leases, cloud infrastructure retainers, and utility schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-purple-700 border-purple-300"
                onClick={handleProcessRecurringBatch}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Run Recurring Batch
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowRecurringModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Schedule
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurring.map((r) => (
              <div
                key={r.id}
                className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white shadow-xs hover:border-purple-200 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{r.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.categoryName} • {r.vendorName}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {r.frequency}
                    </span>
                    <span className="text-slate-600">Next Due: {r.nextDueDate}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-lg font-bold text-slate-900">₹{r.amount.toLocaleString('en-IN')}</div>
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant={r.status === 'ACTIVE' ? 'success' : 'slate'}>{r.status}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-slate-500 h-6 px-2"
                      onClick={() => handleToggleRecurring(r.id)}
                    >
                      {r.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: BUDGET VS ACTUALS */}
      {activeTab === 'budgets' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Departmental Budget vs. Actual Incurred (FY 2026-27)</h3>
              <p className="text-xs text-slate-500">
                Live computation of operating expenditures against allocated annual ceilings, updating dynamically as vouchers and claims are settled.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('budget_vs_actuals', budgets)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Badge variant="purple">FY 2026-2027 Budget</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Allocated Budget</th>
                  <th className="p-3 text-right">Actual Incurred (Live)</th>
                  <th className="p-3 text-right">Variance Amount</th>
                  <th className="p-3 text-right">Consumption %</th>
                  <th className="p-3">Variance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map((b) => {
                  const consumption = Math.round((b.actualExpenseIncurred / b.totalAllocatedExpense) * 100);
                  const isFavourable = b.varianceStatus === 'FAVOURABLE';
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">{b.department}</td>
                      <td className="p-3 text-right font-medium">₹{b.totalAllocatedExpense.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-purple-700">
                        ₹{b.actualExpenseIncurred.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          isFavourable ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        ₹{b.varianceAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, consumption)}%`,
                                backgroundColor: consumption > 90 ? '#E91E63' : brand.primaryColor,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{consumption}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={isFavourable ? 'success' : 'coral'}>{b.varianceStatus}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-700" />
              Dynamic Expense Distribution by Category
            </h4>
            <div className="space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.name}</span>
                    <span>
                      ₹{item.amount.toLocaleString('en-IN')} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${item.pct}%`, backgroundColor: brand.primaryColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              Fixed Asset Depreciation Schedule Summary
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Straight-Line Method (SLM) Annual Provision</div>
                  <div className="text-xs text-slate-500">Printing Presses & Industrial Depot Fixtures</div>
                </div>
                <div className="text-right font-bold text-purple-700">
                  ₹{depreciationSummary.slmAnnual.toLocaleString('en-IN')} / yr
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Written-Down Value (WDV) Annual Provision</div>
                  <div className="text-xs text-slate-500">IT Infrastructure, Servers & Cluster Hardware</div>
                </div>
                <div className="text-right font-bold text-indigo-700">
                  ₹{depreciationSummary.wdvAnnual.toLocaleString('en-IN')} / yr
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Total Net Book Value (NBV)</div>
                  <div className="text-xs text-slate-500">Total Active Capital Assets under Balance Sheet</div>
                </div>
                <div className="text-right font-bold text-emerald-700">
                  ₹{depreciationSummary.totalNbv.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: Record Expense Voucher */}
      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title="Record New Expense Voucher"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateVoucher} className="space-y-4">
          <FormField label="Expense Category" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={voucherForm.categoryName}
              onChange={(e) => setVoucherForm({ ...voucherForm, categoryName: e.target.value })}
            >
              <option value="Administrative, Rent & Utilities">Administrative, Rent & Utilities</option>
              <option value="Direct Production & Printing">Direct Production & Printing</option>
              <option value="Marketing & Book Fairs">Marketing & Book Fairs</option>
              <option value="Freight & Logistics">Freight & Logistics</option>
              <option value="Editorial & Proofreading">Editorial & Proofreading</option>
              <option value="Staff Travel & Conveyance">Staff Travel & Conveyance</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={voucherForm.department}
                onChange={(e) => setVoucherForm({ ...voucherForm, department: e.target.value })}
              >
                <option value="Administration">Administration</option>
                <option value="Editorial">Editorial</option>
                <option value="Production">Production</option>
                <option value="Marketing">Marketing</option>
                <option value="Logistics">Logistics</option>
                <option value="Finance">Finance</option>
              </select>
            </FormField>

            <FormField label="Payment Method" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={voucherForm.paymentMethod}
                onChange={(e) =>
                  setVoucherForm({ ...voucherForm, paymentMethod: e.target.value as ExpenseVoucher['paymentMethod'] })
                }
              >
                <option value="BANK_TRANSFER">Bank Transfer (HDFC Corporate Current)</option>
                <option value="UPI">UPI QR / Corporate Virtual Address</option>
                <option value="CASH">Cash in Hand (Central Cash Chest)</option>
                <option value="CREDIT_CARD">Corporate Credit Card</option>
                <option value="CHEQUE">CTS-2010 Cheque</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Base Amount (₹)" required>
              <Input
                type="number"
                placeholder="25000"
                value={voucherForm.amount}
                onChange={(e) => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                required
              />
            </FormField>

            <FormField label="GST / Tax Amount (₹)">
              <Input
                type="number"
                placeholder="4500"
                value={voucherForm.taxAmount}
                onChange={(e) => setVoucherForm({ ...voucherForm, taxAmount: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Vendor / Beneficiary Name">
            <Input
              placeholder="e.g. Ballarpur Logistics Pvt Ltd"
              value={voucherForm.vendorName}
              onChange={(e) => setVoucherForm({ ...voucherForm, vendorName: e.target.value })}
            />
          </FormField>

          <FormField label="Narration / Description">
            <Input
              placeholder="Brief purpose of expense voucher"
              value={voucherForm.notes}
              onChange={(e) => setVoucherForm({ ...voucherForm, notes: e.target.value })}
            />
          </FormField>

          <div className="p-3 bg-purple-50 rounded-md text-xs text-purple-900 border border-purple-100 flex items-center justify-between">
            <span>Approval Rule: Vouchers &gt; ₹50,000 route to Manager Approval</span>
            <span className="font-bold">
              Total: ₹
              {(
                (parseFloat(voucherForm.amount) || 0) + (parseFloat(voucherForm.taxAmount) || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowVoucherModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Create & Post Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Register Fixed Asset */}
      <Modal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        title="Register Capital Fixed Asset"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <FormField label="Asset Description / Name" required>
            <Input
              placeholder="e.g. Polar 115 High-Speed Paper Cutting Guillotine"
              value={assetForm.assetName}
              onChange={(e) => setAssetForm({ ...assetForm, assetName: e.target.value })}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Asset Category" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={assetForm.category}
                onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value as FixedAsset['category'] })}
              >
                <option value="PLANT_AND_MACHINERY">Plant & Printing Machinery</option>
                <option value="COMPUTERS">Computers & Server Hardware</option>
                <option value="FURNITURE">Furniture & Warehouse Fixtures</option>
                <option value="OFFICE_EQUIPMENT">Office Equipment</option>
                <option value="VEHICLES">Vehicles & Transport</option>
              </select>
            </FormField>

            <FormField label="Depreciation Method" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={assetForm.depreciationMethod}
                onChange={(e) =>
                  setAssetForm({ ...assetForm, depreciationMethod: e.target.value as 'SLM' | 'WDV' })
                }
              >
                <option value="SLM">Straight-Line Method (SLM)</option>
                <option value="WDV">Written-Down Value (WDV)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Capital Cost (₹)" required>
              <Input
                type="number"
                placeholder="2400000"
                value={assetForm.purchaseValue}
                onChange={(e) => setAssetForm({ ...assetForm, purchaseValue: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Salvage Value (₹)">
              <Input
                type="number"
                placeholder="150000"
                value={assetForm.salvageValue}
                onChange={(e) => setAssetForm({ ...assetForm, salvageValue: e.target.value })}
              />
            </FormField>

            <FormField label="Useful Life (Years)">
              <Input
                type="number"
                placeholder="10"
                value={assetForm.usefulLifeYears}
                onChange={(e) => setAssetForm({ ...assetForm, usefulLifeYears: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Depot Location / Bay" required>
              <Input
                placeholder="e.g. Bindery Section, Okhla Central Depot"
                value={assetForm.location}
                onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Serial Number / Plate #">
              <Input
                placeholder="e.g. POLAR-115-2026-X"
                value={assetForm.serialNumber}
                onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAssetModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Add to Asset Register
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Run Depreciation */}
      <Modal
        isOpen={showDepreciationModal}
        onClose={() => setShowDepreciationModal(false)}
        title="Post Asset Depreciation Journal"
        maxWidth="md"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm border space-y-1">
              <div className="font-bold text-slate-800">{selectedAsset.assetName}</div>
              <div className="text-xs text-slate-500">Asset Code: {selectedAsset.assetCode}</div>
              <div className="flex justify-between text-xs pt-2 border-t mt-2">
                <span>Original Cost: ₹{selectedAsset.purchaseValue.toLocaleString('en-IN')}</span>
                <span className="font-semibold text-purple-700">
                  NBV: ₹{selectedAsset.netBookValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-200">
              <p className="font-semibold">Automated General Ledger Posting:</p>
              <p className="mt-1 font-mono">Dr: Depreciation & Amortization Exp (Ledger #4040)</p>
              <p className="font-mono">Cr: Accumulated Depreciation Provision (Ledger #1199)</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button variant="outline" onClick={() => setShowDepreciationModal(false)}>
                Cancel
              </Button>
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => handlePostDepreciation(selectedAsset.id)}
              >
                Post Depreciation JV
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Submit Reimbursement Claim */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Submit Employee Reimbursement Claim"
        maxWidth="md"
      >
        <form onSubmit={handleCreateClaim} className="space-y-4">
          <FormField label="Employee Name" required>
            <Input
              placeholder="e.g. Vikramaditya Sen"
              value={claimForm.employeeName}
              onChange={(e) => setClaimForm({ ...claimForm, employeeName: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Department" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={claimForm.department}
              onChange={(e) => setClaimForm({ ...claimForm, department: e.target.value })}
            >
              <option value="Editorial">Editorial</option>
              <option value="Production">Production</option>
              <option value="Marketing">Marketing</option>
              <option value="Logistics">Logistics</option>
              <option value="Administration">Administration</option>
            </select>
          </FormField>

          <FormField label="Purpose of Expense" required>
            <Input
              placeholder="e.g. Author manuscript launch dinner & cab fares"
              value={claimForm.purpose}
              onChange={(e) => setClaimForm({ ...claimForm, purpose: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Amount Claimed (₹)" required>
            <Input
              type="number"
              placeholder="3500"
              value={claimForm.amount}
              onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
              required
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chkReceipt"
              checked={claimForm.receiptAttached}
              onChange={(e) => setClaimForm({ ...claimForm, receiptAttached: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="chkReceipt" className="text-xs text-slate-700">
              Verified tax invoice/receipt attached with physical claim voucher
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowClaimModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Submit Claim
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Add Recurring Schedule */}
      <Modal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        title="Add Recurring Scheduled Expense"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRecurring} className="space-y-4">
          <FormField label="Schedule Title" required>
            <Input
              placeholder="e.g. Regional Depot Warehouse Lease"
              value={recurringForm.title}
              onChange={(e) => setRecurringForm({ ...recurringForm, title: e.target.value })}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={recurringForm.categoryName}
                onChange={(e) => setRecurringForm({ ...recurringForm, categoryName: e.target.value })}
              >
                <option value="Administrative, Rent & Utilities">Administrative, Rent & Utilities</option>
                <option value="Direct Production & Printing">Direct Production & Printing</option>
                <option value="Marketing & Book Fairs">Marketing & Book Fairs</option>
                <option value="Freight & Logistics">Freight & Logistics</option>
              </select>
            </FormField>

            <FormField label="Frequency" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={recurringForm.frequency}
                onChange={(e) =>
                  setRecurringForm({ ...recurringForm, frequency: e.target.value as RecurringExpense['frequency'] })
                }
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="BIANNUAL">Biannual</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount (₹)" required>
              <Input
                type="number"
                placeholder="45000"
                value={recurringForm.amount}
                onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Next Due Date" required>
              <Input
                type="date"
                value={recurringForm.nextDueDate}
                onChange={(e) => setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Vendor Name" required>
            <Input
              placeholder="e.g. Commercial Realty Holdings Ltd"
              value={recurringForm.vendorName}
              onChange={(e) => setRecurringForm({ ...recurringForm, vendorName: e.target.value })}
              required
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowRecurringModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Success Feedback */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Operation Successful"
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-slate-800">{successMessage}</p>
          <Button
            style={{ backgroundColor: brand.primaryColor }}
            className="text-white w-full"
            onClick={() => setShowSuccessModal(false)}
          >
            Acknowledge
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
