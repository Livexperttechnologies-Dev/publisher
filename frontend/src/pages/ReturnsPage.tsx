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
  SalesReturn,
  PurchaseReturn,
  DistributorReturn,
  FinancialAdjustment,
  RefundRecord,
  QuarantineStock,
  getStoredSalesReturns,
  saveSalesReturn,
  approveSalesReturn,
  reverseSalesReturn,
  getStoredPurchaseReturns,
  savePurchaseReturn,
  getStoredDistributorReturns,
  saveDistributorReturn,
  getStoredAdjustments,
  saveAdjustment,
  getStoredRefunds,
  saveRefund,
  getStoredQuarantine,
  scrapQuarantineStock,
  computeReturnKpis,
  computeDistributorReconciliation,
} from '../services/returnService';
import {
  RotateCcw,
  FileText,
  AlertTriangle,
  Plus,
  CheckCircle2,
  DollarSign,
  Truck,
  Building,
  ShieldCheck,
  Package,
  Layers,
  ArrowRightLeft,
  XCircle,
  FileCheck,
  Check,
  Archive,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Percent,
} from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Search Filter
  const [activeTab, setActiveTab] = useState<
    'sales' | 'purchases' | 'distributors' | 'adjustments' | 'refunds' | 'quarantine'
  >('sales');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Dynamic Data State
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [distributorReturns, setDistributorReturns] = useState<DistributorReturn[]>([]);
  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [quarantine, setQuarantine] = useState<QuarantineStock[]>([]);

  // Modals Control
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showReconModal, setShowReconModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form States
  const [salesForm, setSalesForm] = useState({
    invoiceNumber: 'INV/2026/0001',
    customerName: 'Delhi Book House Retailers',
    returnReason: 'TRANSIT_DAMAGE' as SalesReturn['returnReason'],
    bookTitle: 'Senior Secondary Mathematics - Class 10',
    quantity: '20',
    unitRate: '295',
    condition: 'DAMAGED' as SalesReturn['condition'],
    refundMode: 'CREDIT_TO_ACCOUNT' as SalesReturn['refundMode'],
  });

  const [purchaseForm, setPurchaseForm] = useState({
    invoiceNumber: 'PINV/2026/0001',
    supplierName: 'Ballarpur Paper Mills Ltd',
    returnReason: 'DAMAGED_PAPER' as PurchaseReturn['returnReason'],
    materialName: '70 GSM Natural Shade Maplitho Paper Reels',
    quantity: '10',
    unitRate: '700',
  });

  const [adjForm, setAdjForm] = useState({
    partyType: 'CUSTOMER' as FinancialAdjustment['partyType'],
    partyName: 'Oxford Book Store Pvt Ltd',
    adjustmentType: 'DISCOUNT_REBATE' as FinancialAdjustment['adjustmentType'],
    amount: '',
    reason: '',
  });

  const [refundForm, setRefundForm] = useState({
    refundType: 'CUSTOMER_REFUND' as RefundRecord['refundType'],
    partyName: 'Delhi Book House Retailers',
    amount: '',
    paymentMethod: 'BANK_TRANSFER' as RefundRecord['paymentMethod'],
    referenceNote: '',
  });

  // Load All Dynamic Data
  const loadAllData = () => {
    setSalesReturns(getStoredSalesReturns());
    setPurchaseReturns(getStoredPurchaseReturns());
    setDistributorReturns(getStoredDistributorReturns());
    setAdjustments(getStoredAdjustments());
    setRefunds(getStoredRefunds());
    setQuarantine(getStoredQuarantine());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // KPIs & Dynamic Reconciliation
  const kpis = useMemo(
    () => computeReturnKpis(),
    [salesReturns, purchaseReturns, quarantine, refunds]
  );

  const reconData = useMemo(() => computeDistributorReconciliation(), [distributorReturns]);

  // Handlers
  const handleCreateSalesReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(salesForm.quantity) || 1;
    const rate = parseFloat(salesForm.unitRate) || 0;
    const total = qty * rate;

    const { salesReturn, glCreditNoteNumber } = saveSalesReturn({
      invoiceNumber: salesForm.invoiceNumber,
      customerName: salesForm.customerName,
      returnReason: salesForm.returnReason,
      bookTitle: salesForm.bookTitle,
      totalQuantity: qty,
      unitRate: rate,
      totalReturnAmount: total,
      condition: salesForm.condition,
      refundMode: salesForm.refundMode,
    });

    loadAllData();
    setShowSalesModal(false);

    setSuccessMessage(
      glCreditNoteNumber
        ? `Sales Return ${salesReturn.creditNoteNumber} confirmed & posted as GL Credit Note ${glCreditNoteNumber}!${
            salesForm.condition === 'DAMAGED' ? ' (Damaged stock routed to Quarantine Bin)' : ''
          }`
        : `Sales Return ${salesReturn.creditNoteNumber} registered and routed to Controller Approval (amount > ₹25,000)!`
    );
    setShowSuccessModal(true);
  };

  const handleApproveSalesReturn = (id: string) => {
    const updated = approveSalesReturn(id, 'Finance Controller');
    if (updated) {
      loadAllData();
      setSuccessMessage(
        `Sales Return ${updated.creditNoteNumber} approved & posted as GL Credit Note ${updated.accountingVoucherNumber}!`
      );
      setShowSuccessModal(true);
    }
  };

  const handleReverseSalesReturn = (id: string) => {
    if (confirm('Are you sure you want to reverse this confirmed sales return?')) {
      const updated = reverseSalesReturn(id);
      if (updated) {
        loadAllData();
        setSuccessMessage(`Sales Return ${updated.creditNoteNumber} status set to REVERSED.`);
        setShowSuccessModal(true);
      }
    }
  };

  const handleCreatePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(purchaseForm.quantity) || 1;
    const rate = parseFloat(purchaseForm.unitRate) || 0;
    const total = qty * rate;

    const { purchaseReturn, glDebitNoteNumber } = savePurchaseReturn({
      invoiceNumber: purchaseForm.invoiceNumber,
      supplierName: purchaseForm.supplierName,
      returnReason: purchaseForm.returnReason,
      materialName: purchaseForm.materialName,
      totalQuantity: qty,
      unitRate: rate,
      totalReturnAmount: total,
    });

    loadAllData();
    setShowPurchaseModal(false);

    setSuccessMessage(
      `Purchase Return ${purchaseReturn.debitNoteNumber} issued & posted as GL Debit Note ${glDebitNoteNumber}!`
    );
    setShowSuccessModal(true);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const { adjustment, glVoucherNumber } = saveAdjustment({
      partyType: adjForm.partyType,
      partyName: adjForm.partyName,
      adjustmentType: adjForm.adjustmentType,
      totalAdjustmentAmount: parseFloat(adjForm.amount) || 0,
      reason: adjForm.reason,
    });

    loadAllData();
    setShowAdjustmentModal(false);
    setAdjForm({
      partyType: 'CUSTOMER',
      partyName: 'Oxford Book Store Pvt Ltd',
      adjustmentType: 'DISCOUNT_REBATE',
      amount: '',
      reason: '',
    });

    setSuccessMessage(
      `Financial Adjustment ${adjustment.adjustmentNumber} posted with General Ledger voucher ${glVoucherNumber}!`
    );
    setShowSuccessModal(true);
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const { refund, glPaymentVoucher } = saveRefund({
      refundType: refundForm.refundType,
      partyName: refundForm.partyName,
      amount: parseFloat(refundForm.amount) || 0,
      paymentMethod: refundForm.paymentMethod,
      referenceNote: refundForm.referenceNote,
    });

    loadAllData();
    setShowRefundModal(false);
    setRefundForm({
      refundType: 'CUSTOMER_REFUND',
      partyName: 'Delhi Book House Retailers',
      amount: '',
      paymentMethod: 'BANK_TRANSFER',
      referenceNote: '',
    });

    setSuccessMessage(
      `Direct Refund ${refund.refundNumber} disbursed via ${refund.paymentMethod} & posted as GL Payment Voucher ${glPaymentVoucher}!`
    );
    setShowSuccessModal(true);
  };

  const handleScrapQuarantine = (id: string) => {
    if (confirm('Are you sure you want to scrap and write off this quarantined damaged stock?')) {
      const res = scrapQuarantineStock(id);
      if (res) {
        loadAllData();
        setSuccessMessage(
          `Damaged stock for "${res.item.title}" successfully scrapped & written off in GL as Journal Voucher ${res.glJournalVoucher}!`
        );
        setShowSuccessModal(true);
      }
    }
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
  const filteredSales = useMemo(() => {
    if (!searchTerm) return salesReturns;
    const t = searchTerm.toLowerCase();
    return salesReturns.filter(
      (r) =>
        r.creditNoteNumber.toLowerCase().includes(t) ||
        r.customerName.toLowerCase().includes(t) ||
        r.invoiceNumber.toLowerCase().includes(t) ||
        r.bookTitle.toLowerCase().includes(t)
    );
  }, [salesReturns, searchTerm]);

  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return purchaseReturns;
    const t = searchTerm.toLowerCase();
    return purchaseReturns.filter(
      (pr) =>
        pr.debitNoteNumber.toLowerCase().includes(t) ||
        pr.supplierName.toLowerCase().includes(t) ||
        pr.invoiceNumber.toLowerCase().includes(t) ||
        pr.materialName.toLowerCase().includes(t)
    );
  }, [purchaseReturns, searchTerm]);

  const filteredDistributors = useMemo(() => {
    if (!searchTerm) return distributorReturns;
    const t = searchTerm.toLowerCase();
    return distributorReturns.filter(
      (dr) =>
        dr.returnNumber.toLowerCase().includes(t) ||
        dr.distributorName.toLowerCase().includes(t) ||
        dr.bookTitle.toLowerCase().includes(t)
    );
  }, [distributorReturns, searchTerm]);

  const filteredAdjustments = useMemo(() => {
    if (!searchTerm) return adjustments;
    const t = searchTerm.toLowerCase();
    return adjustments.filter(
      (a) =>
        a.adjustmentNumber.toLowerCase().includes(t) ||
        a.partyName.toLowerCase().includes(t) ||
        a.reason.toLowerCase().includes(t)
    );
  }, [adjustments, searchTerm]);

  const filteredRefunds = useMemo(() => {
    if (!searchTerm) return refunds;
    const t = searchTerm.toLowerCase();
    return refunds.filter(
      (ref) => ref.refundNumber.toLowerCase().includes(t) || ref.partyName.toLowerCase().includes(t)
    );
  }, [refunds, searchTerm]);

  const filteredQuarantine = useMemo(() => {
    if (!searchTerm) return quarantine;
    const t = searchTerm.toLowerCase();
    return quarantine.filter(
      (q) =>
        q.title.toLowerCase().includes(t) ||
        q.isbn.toLowerCase().includes(t) ||
        q.sourceReturnNumber.toLowerCase().includes(t)
    );
  }, [quarantine, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Returns & Financial Adjustments"
        description={`Comprehensive lifecycle for Sales Returns (Credit Notes), Purchase Returns (Debit Notes), Distributor Consignment Returns, Damaged Stock Quarantine, and Direct Payout Refunds for ${brand.companyName}.`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReconModal(true)}
              className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Distributor Reconciliation
            </Button>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white text-xs hover:opacity-90 shadow-sm"
              onClick={() => setShowSalesModal(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Sales Return (Credit Note)
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 shadow-sm" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Sales Returns (Credit Notes)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{kpis.totalSalesReturnsAmount.toLocaleString('en-IN')}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-purple-700">{kpis.confirmedSalesReturnsCount} confirmed</span>
                {kpis.pendingSalesReturnsCount > 0 && (
                  <span className="text-amber-600 font-medium">({kpis.pendingSalesReturnsCount} pending)</span>
                )}
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
            >
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Purchase Returns (Debit Notes)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{kpis.totalPurchaseReturnsAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {kpis.purchaseReturnsCount} supplier debit notes (ITC reversed)
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 shadow-sm" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Damaged Stock Quarantine</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis.totalQuarantineCopies} Copies</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">
                {kpis.quarantineBinsCount} lots quarantined for scrap / insurance
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brand.accentColor}15`, color: brand.accentColor }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500">Refunds & Direct Payouts</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                ₹{kpis.totalRefundsAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {kpis.refundsCount} direct bank & cash disbursements
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'sales', label: `Sales Returns (${salesReturns.length})`, icon: RotateCcw },
            { id: 'purchases', label: `Purchase Returns (${purchaseReturns.length})`, icon: FileText },
            { id: 'distributors', label: `Distributor Consignment (${distributorReturns.length})`, icon: Truck },
            { id: 'adjustments', label: `Financial Adjustments (${adjustments.length})`, icon: ArrowRightLeft },
            { id: 'refunds', label: `Direct Refunds (${refunds.length})`, icon: DollarSign },
            { id: 'quarantine', label: `Damaged Quarantine Bin (${quarantine.length})`, icon: Archive },
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

        <div className="relative w-64 mb-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search returns, parties, invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* TAB 1: SALES RETURNS */}
      {activeTab === 'sales' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Sales Returns & Customer Credit Notes</h3>
              <p className="text-xs text-slate-500">
                Full and partial returns with reason tracking, warehouse quarantine routing, and General Ledger Credit Notes (`CN/2026/xxxx`). Returns &gt; ₹25,000 route to Controller Approval.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('sales_returns', filteredSales)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowSalesModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Return
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Credit Note #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Item / Book Title</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Credit (₹)</th>
                  <th className="p-3">GL Posting</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{r.creditNoteNumber}</td>
                    <td className="p-3 text-slate-600 text-xs">{r.returnDate}</td>
                    <td className="p-3 text-slate-700 font-mono text-xs">{r.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{r.customerName}</td>
                    <td className="p-3 text-slate-700 text-xs max-w-xs truncate">{r.bookTitle}</td>
                    <td className="p-3 text-xs text-slate-600">{r.returnReason.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                          r.condition === 'DAMAGED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {r.condition}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold">{r.totalQuantity}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{r.totalReturnAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      {r.accountingVoucherNumber ? (
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {r.accountingVoucherNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending Approval</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          r.status === 'CONFIRMED' ? 'success' : r.status === 'PENDING_APPROVAL' ? 'warning' : 'slate'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {r.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                          onClick={() => handleApproveSalesReturn(r.id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      )}
                      {r.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-rose-600 hover:bg-rose-50 h-7 px-2"
                          onClick={() => handleReverseSalesReturn(r.id)}
                        >
                          Reverse
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400">
                      No sales returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: PURCHASE RETURNS */}
      {activeTab === 'purchases' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Purchase Returns & Supplier Debit Notes</h3>
              <p className="text-xs text-slate-500">
                Returns to paper mills & printing vendors with automated Input Tax Credit (ITC) reversal and double-entry Debit Note vouchers (`DN/2026/xxxx`).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('purchase_returns', filteredPurchases)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowPurchaseModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Purchase Return
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Debit Note #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Purchase Inv #</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Material Title</th>
                  <th className="p-3">Return Reason</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Debit Total (₹)</th>
                  <th className="p-3">GL Posting</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-indigo-700">{pr.debitNoteNumber}</td>
                    <td className="p-3 text-slate-600 text-xs">{pr.returnDate}</td>
                    <td className="p-3 text-slate-700 font-mono text-xs">{pr.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{pr.supplierName}</td>
                    <td className="p-3 text-slate-600 text-xs">{pr.materialName}</td>
                    <td className="p-3 text-xs text-slate-600">{pr.returnReason.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-right font-semibold">{pr.totalQuantity}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{pr.totalReturnAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {pr.accountingVoucherNumber}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="success">{pr.status}</Badge>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No purchase returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: DISTRIBUTOR RETURNS */}
      {activeTab === 'distributors' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Distributor Consignment Returns & Stock Inward</h3>
              <p className="text-xs text-slate-500">
                Receipt of unsold academic copies, stock condition grading, and consignment balance adjustments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('distributor_returns', filteredDistributors)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowReconModal(true)}
              >
                <FileCheck className="w-3.5 h-3.5 mr-1" />
                Consignment Statement
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Return Ref</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Distributor</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Return Type</th>
                  <th className="p-3 text-right">Copies Returned</th>
                  <th className="p-3 text-right">Credit Value (₹)</th>
                  <th className="p-3">Credit Note #</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDistributors.map((dr) => (
                  <tr key={dr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{dr.returnNumber}</td>
                    <td className="p-3 text-slate-600 text-xs">{dr.returnDate}</td>
                    <td className="p-3 font-medium text-slate-800">{dr.distributorName}</td>
                    <td className="p-3 text-slate-600 text-xs">{dr.bookTitle}</td>
                    <td className="p-3 text-xs text-purple-700 font-semibold">{dr.returnType.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{dr.totalQuantity}</td>
                    <td className="p-3 text-right font-bold text-purple-700">₹{dr.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-xs">{dr.creditNoteNumber || '—'}</td>
                    <td className="p-3">
                      <Badge variant="success">{dr.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: FINANCIAL ADJUSTMENTS */}
      {activeTab === 'adjustments' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Financial Adjustments & Rebates</h3>
              <p className="text-xs text-slate-500">
                Customer credit notes and supplier debit notes for rate differences, price corrections, and volume discounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('financial_adjustments', filteredAdjustments)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowAdjustmentModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Adjustment
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Adjustment #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">Party Type</th>
                  <th className="p-3">Adjustment Type</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3">GL Posting</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{a.adjustmentNumber}</td>
                    <td className="p-3 text-slate-600 text-xs">{a.date}</td>
                    <td className="p-3 font-medium text-slate-800">{a.partyName}</td>
                    <td className="p-3 text-xs text-slate-600">{a.partyType}</td>
                    <td className="p-3 text-xs font-semibold text-indigo-700">{a.adjustmentType.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-xs text-slate-600 max-w-xs truncate">{a.reason}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{a.totalAdjustmentAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-xs text-emerald-700">{a.accountingVoucherNumber}</td>
                    <td className="p-3">
                      <Badge variant="success">{a.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: REFUNDS */}
      {activeTab === 'refunds' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Customer & Supplier Direct Refund Disbursements</h3>
              <p className="text-xs text-slate-500">
                Direct bank settlements for customer credit balances and supplier return payouts with GL Payment Vouchers (`PV/2026/xxxx`).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('refund_records', filteredRefunds)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white text-xs hover:opacity-90"
                onClick={() => setShowRefundModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Process Refund
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Refund Ref #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">Disbursement Method</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3">Bank GL Voucher</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-purple-700">{ref.refundNumber}</td>
                    <td className="p-3 text-slate-600 text-xs">{ref.refundDate}</td>
                    <td className="p-3 text-xs font-semibold text-purple-700">{ref.refundType.replace(/_/g, ' ')}</td>
                    <td className="p-3 font-medium text-slate-800">{ref.partyName}</td>
                    <td className="p-3 text-xs text-slate-600">{ref.paymentMethod}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{ref.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-xs text-emerald-700">{ref.accountingVoucherNumber}</td>
                    <td className="p-3">
                      <Badge variant="success">{ref.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 6: DAMAGED QUARANTINE BIN */}
      {activeTab === 'quarantine' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Damaged & Defective Stock Quarantine Bin</h3>
              <p className="text-xs text-slate-500">
                Isolated inventory segregated from saleable stock. Supports direct scrap write-off with General Ledger Loss Provisioning (`JV/2026/xxxx`).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => exportToCsv('quarantine_stock', filteredQuarantine)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
              <Badge variant="warning">Quarantine Bay 3</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-3">Item / Book Title</th>
                  <th className="p-3">ISBN / SKU</th>
                  <th className="p-3 text-right">Quarantined Quantity</th>
                  <th className="p-3">Quarantine Date</th>
                  <th className="p-3">Source Return Reference</th>
                  <th className="p-3">Inspection Notes</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuarantine.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{q.title}</td>
                    <td className="p-3 font-mono text-xs text-slate-600">{q.isbn}</td>
                    <td className="p-3 text-right font-bold text-rose-600">{q.damagedQuantity} Copies</td>
                    <td className="p-3 text-xs text-slate-600">{q.quarantineDate}</td>
                    <td className="p-3 font-mono text-xs text-slate-700">{q.sourceReturnNumber}</td>
                    <td className="p-3 text-xs text-slate-500 max-w-xs truncate">{q.inspectionNotes}</td>
                    <td className="p-3">
                      <Badge variant={q.status === 'QUARANTINED' ? 'warning' : 'slate'}>{q.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      {q.status === 'QUARANTINED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50 h-7 px-2"
                          onClick={() => handleScrapQuarantine(q.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
                          Scrap & Write-Off
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: Create Sales Return */}
      <Modal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        title="Create Sales Return & Credit Note"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSalesReturn} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sales Invoice Reference" required>
              <Input
                placeholder="INV/2026/0001"
                value={salesForm.invoiceNumber}
                onChange={(e) => setSalesForm({ ...salesForm, invoiceNumber: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Customer Name" required>
              <Input
                placeholder="e.g. Oxford Book Store Pvt Ltd"
                value={salesForm.customerName}
                onChange={(e) => setSalesForm({ ...salesForm, customerName: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Return Reason" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={salesForm.returnReason}
                onChange={(e) =>
                  setSalesForm({ ...salesForm, returnReason: e.target.value as SalesReturn['returnReason'] })
                }
              >
                <option value="TRANSIT_DAMAGE">Transit Damage & Torn Cartons</option>
                <option value="DEFECTIVE_PRINTING">Defective Printing / Binding</option>
                <option value="EXCESS_STOCK">Excess Billed Stock</option>
                <option value="WRONG_EDITION">Wrong Edition Dispatched</option>
                <option value="CUSTOMER_RETURN">Customer Return / Exchange</option>
              </select>
            </FormField>

            <FormField label="Item Condition & Target Bin" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={salesForm.condition}
                onChange={(e) =>
                  setSalesForm({ ...salesForm, condition: e.target.value as SalesReturn['condition'] })
                }
              >
                <option value="DAMAGED">Damaged (Route to Quarantine Bin)</option>
                <option value="SALEABLE">Saleable (Restock to Central Warehouse)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Book Title" required>
              <Input
                value={salesForm.bookTitle}
                onChange={(e) => setSalesForm({ ...salesForm, bookTitle: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Quantity Returned" required>
              <Input
                type="number"
                placeholder="20"
                value={salesForm.quantity}
                onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Unit Billed Rate (₹)" required>
              <Input
                type="number"
                placeholder="295"
                value={salesForm.unitRate}
                onChange={(e) => setSalesForm({ ...salesForm, unitRate: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Refund Settlement Mode" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={salesForm.refundMode}
              onChange={(e) =>
                setSalesForm({ ...salesForm, refundMode: e.target.value as SalesReturn['refundMode'] })
              }
            >
              <option value="CREDIT_TO_ACCOUNT">Credit to Customer Account (Offset Future Invoices)</option>
              <option value="BANK_REFUND">Direct Bank Refund Payout (HDFC Bank)</option>
              <option value="CASH_REFUND">Cash Refund</option>
            </select>
          </FormField>

          <div className="p-3 bg-purple-50 rounded-md text-xs text-purple-900 border border-purple-100 flex items-center justify-between">
            <span>Approval Rule: Returns &gt; ₹25,000 route to Controller Approval</span>
            <span className="font-bold">
              Total Credit: ₹
              {(
                (parseInt(salesForm.quantity) || 0) * (parseFloat(salesForm.unitRate) || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowSalesModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Issue Credit Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Create Purchase Return */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Create Purchase Return & Debit Note"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePurchaseReturn} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Bill Reference" required>
              <Input
                placeholder="PINV/2026/0001"
                value={purchaseForm.invoiceNumber}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Supplier Name" required>
              <Input
                placeholder="e.g. Ballarpur Paper Mills Ltd"
                value={purchaseForm.supplierName}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Return Reason" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={purchaseForm.returnReason}
              onChange={(e) =>
                setPurchaseForm({ ...purchaseForm, returnReason: e.target.value as PurchaseReturn['returnReason'] })
              }
            >
              <option value="DAMAGED_PAPER">Damaged Paper / Moisture Flaw</option>
              <option value="DEFECTIVE_PRINTING">Printing Plate Flaw</option>
              <option value="REJECTED_STOCK">Rejected During Quality Inspection</option>
              <option value="EXCESS_DISPATCH">Excess Dispatch Beyond PO</option>
            </select>
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Material Title" required>
              <Input
                value={purchaseForm.materialName}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, materialName: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Quantity" required>
              <Input
                type="number"
                placeholder="10"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Purchase Unit Rate (₹)" required>
              <Input
                type="number"
                placeholder="700"
                value={purchaseForm.unitRate}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, unitRate: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Issue Debit Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Distributor Reconciliation Statement */}
      <Modal
        isOpen={showReconModal}
        onClose={() => setShowReconModal(false)}
        title="Distributor Consignment Reconciliation Statement"
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-lg border space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Distributor: {reconData.distributorName}</span>
              <span className="text-emerald-700">Status: RECONCILED</span>
            </div>
            <p className="text-xs text-slate-500">Consignment Agreement: Academic Semester 2026-27</p>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t text-xs">
              <div>
                <span className="text-slate-500">Initial Consignment Dispatched:</span>
                <span className="font-bold ml-1 text-slate-800">
                  {reconData.dispatchedCopies.toLocaleString('en-IN')} Copies (₹
                  {reconData.dispatchedValue.toLocaleString('en-IN')})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Confirmed Secondary Sales:</span>
                <span className="font-bold ml-1 text-indigo-700">
                  {reconData.secondarySalesCopies.toLocaleString('en-IN')} Copies (₹
                  {reconData.secondarySalesValue.toLocaleString('en-IN')})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Total Returned Copies:</span>
                <span className="font-bold ml-1 text-purple-700">
                  {reconData.returnedCopies.toLocaleString('en-IN')} Copies (₹
                  {reconData.returnedValue.toLocaleString('en-IN')})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Unsold On-Hold Balance:</span>
                <span className="font-bold ml-1 text-amber-700">
                  {reconData.unsoldBalanceCopies.toLocaleString('en-IN')} Copies (₹
                  {reconData.unsoldBalanceValue.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 mt-2 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-900">Net Financial Settlement Due:</span>
              <span className="text-base font-bold text-emerald-800">
                ₹{reconData.netSettlementDue.toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={() => setShowReconModal(false)}
            >
              Close Statement
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Financial Adjustment */}
      <Modal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        title="Post Financial Adjustment Note"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4">
          <FormField label="Party Type" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={adjForm.partyType}
              onChange={(e) =>
                setAdjForm({ ...adjForm, partyType: e.target.value as FinancialAdjustment['partyType'] })
              }
            >
              <option value="CUSTOMER">Customer (Credit Note)</option>
              <option value="SUPPLIER">Supplier (Debit Note)</option>
            </select>
          </FormField>

          <FormField label="Party Name" required>
            <Input
              placeholder="e.g. Oxford Book Store Pvt Ltd"
              value={adjForm.partyName}
              onChange={(e) => setAdjForm({ ...adjForm, partyName: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Adjustment Type" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={adjForm.adjustmentType}
              onChange={(e) =>
                setAdjForm({ ...adjForm, adjustmentType: e.target.value as FinancialAdjustment['adjustmentType'] })
              }
            >
              <option value="DISCOUNT_REBATE">Trade Discount / Promotional Rebate</option>
              <option value="PRICE_ADJUSTMENT">Price Difference Adjustment</option>
              <option value="CUSTOMER_CREDIT_NOTE">Customer Credit Note</option>
              <option value="SUPPLIER_DEBIT_NOTE">Supplier Debit Note</option>
            </select>
          </FormField>

          <FormField label="Adjustment Amount (₹)" required>
            <Input
              type="number"
              placeholder="5000"
              value={adjForm.amount}
              onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Reason & Justification" required>
            <Input
              placeholder="e.g. Authorized promotional launch rebate"
              value={adjForm.reason}
              onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
              required
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAdjustmentModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Post Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Direct Refund */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Disburse Direct Refund Payout"
        maxWidth="md"
      >
        <form onSubmit={handleProcessRefund} className="space-y-4">
          <FormField label="Refund Type" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={refundForm.refundType}
              onChange={(e) =>
                setRefundForm({ ...refundForm, refundType: e.target.value as RefundRecord['refundType'] })
              }
            >
              <option value="CUSTOMER_REFUND">Customer Credit Balance Refund</option>
              <option value="SUPPLIER_REFUND">Supplier Payout Receipt</option>
            </select>
          </FormField>

          <FormField label="Party Name" required>
            <Input
              placeholder="e.g. Oxford Book Store Pvt Ltd"
              value={refundForm.partyName}
              onChange={(e) => setRefundForm({ ...refundForm, partyName: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Refund Amount (₹)" required>
            <Input
              type="number"
              placeholder="14750"
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Disbursement Method" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={refundForm.paymentMethod}
              onChange={(e) =>
                setRefundForm({ ...refundForm, paymentMethod: e.target.value as RefundRecord['paymentMethod'] })
              }
            >
              <option value="BANK_TRANSFER">HDFC Corporate Bank NEFT / RTGS</option>
              <option value="UPI">UPI Payout</option>
              <option value="CHEQUE">Account Payee Cheque</option>
              <option value="CASH">Cash in Hand</option>
            </select>
          </FormField>

          <FormField label="Reference Note / Reason">
            <Input
              placeholder="e.g. Credit balance settlement for damaged stock"
              value={refundForm.referenceNote}
              onChange={(e) => setRefundForm({ ...refundForm, referenceNote: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
            >
              Disburse Refund
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

export default ReturnsPage;
