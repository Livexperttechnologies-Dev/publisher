import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  Receipt,
  Plus,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  ArrowRightLeft,
  Calendar,
  Building2,
  FileCheck,
  Printer,
  Sparkles,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import {
  LedgerItem,
  CostCentreItem,
  getStoredLedgers,
  getStoredCostCentres,
  exportToCsv,
} from '../services/accountingService';
import {
  VoucherRecord,
  VoucherLineItem,
  getStoredVouchers,
  postDoubleEntryVoucher,
  reversePostedVoucher,
  resetVouchersToDefault,
} from '../services/voucherService';

const AVAILABLE_BRANCHES = [
  'Headquarters & Central Godown (Delhi)',
  'Western Zonal Depot (Bhiwandi Godown)',
  'Southern Distribution Hub (Bengaluru)',
];

export const VouchersPage: React.FC = () => {
  const { brand } = useBrand();
  const [searchParams] = useSearchParams();

  // Core Data State
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [costCentres, setCostCentres] = useState<CostCentreItem[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Modals & Drawers
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] = useState<VoucherRecord | null>(null);

  // Reversal Dialog State
  const [isReversalDialogOpen, setIsReversalDialogOpen] = useState(false);
  const [voucherToReverse, setVoucherToReverse] = useState<VoucherRecord | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // New Voucher Form State
  const [voucherFormType, setVoucherFormType] = useState<VoucherRecord['voucherType']>('JOURNAL');
  const [voucherFormDate, setVoucherFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [voucherFormBranch, setVoucherFormBranch] = useState(AVAILABLE_BRANCHES[0]);
  const [voucherFormNarration, setVoucherFormNarration] = useState('');
  const [voucherLines, setVoucherLines] = useState<
    Array<{
      ledgerId: string;
      ledgerName: string;
      ledgerCode: string;
      costCentreName: string;
      debitAmount: number;
      creditAmount: number;
    }>
  >([]);

  // Load Initial Data
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    const storedVouchers = getStoredVouchers();
    const storedLedgers = getStoredLedgers();
    const storedCostCentres = getStoredCostCentres();

    setVouchers(storedVouchers);
    setLedgers(storedLedgers);
    setCostCentres(storedCostCentres);

    // Initialize default voucher lines from live ledgers
    if (storedLedgers.length >= 2) {
      const first = storedLedgers[0];
      const second = storedLedgers[1];
      setVoucherLines([
        {
          ledgerId: first.id,
          ledgerName: first.name,
          ledgerCode: first.code,
          costCentreName: '',
          debitAmount: 10000,
          creditAmount: 0,
        },
        {
          ledgerId: second.id,
          ledgerName: second.name,
          ledgerCode: second.code,
          costCentreName: '',
          debitAmount: 0,
          creditAmount: 10000,
        },
      ]);
    }
  };

  // Open modal if URL has ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewVoucherModalOpen(true);
    }
  }, [searchParams]);

  // Live Double-Entry Balancing Calculation
  const formBalancing = useMemo(() => {
    const totalDebit = Number(
      voucherLines.reduce((sum, l) => sum + (Number(l.debitAmount) || 0), 0).toFixed(2)
    );
    const totalCredit = Number(
      voucherLines.reduce((sum, l) => sum + (Number(l.creditAmount) || 0), 0).toFixed(2)
    );
    const difference = Number(Math.abs(totalDebit - totalCredit).toFixed(2));
    const isBalanced = difference < 0.01 && totalDebit > 0;
    return { totalDebit, totalCredit, difference, isBalanced };
  }, [voucherLines]);

  // Filtered Vouchers List
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        v.voucherNumber.toLowerCase().includes(q) ||
        v.narration.toLowerCase().includes(q) ||
        v.branchName.toLowerCase().includes(q) ||
        v.items.some((i) => i.ledgerName.toLowerCase().includes(q) || i.ledgerCode.includes(q));

      const matchesType = selectedType === 'ALL' || v.voucherType === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
      const matchesBranch = selectedBranch === 'ALL' || v.branchName.includes(selectedBranch);

      return matchesSearch && matchesType && matchesStatus && matchesBranch;
    });
  }, [vouchers, searchQuery, selectedType, selectedStatus, selectedBranch]);

  // Helper: Auto-Balance Voucher Line
  const handleAutoBalance = () => {
    if (voucherLines.length < 2) return;
    const totalDebit = voucherLines.slice(0, -1).reduce((sum, l) => sum + (Number(l.debitAmount) || 0), 0);
    const totalCredit = voucherLines.slice(0, -1).reduce((sum, l) => sum + (Number(l.creditAmount) || 0), 0);

    const updated = [...voucherLines];
    const lastIdx = updated.length - 1;

    if (totalDebit > totalCredit) {
      updated[lastIdx].creditAmount = Number((totalDebit - totalCredit).toFixed(2));
      updated[lastIdx].debitAmount = 0;
    } else {
      updated[lastIdx].debitAmount = Number((totalCredit - totalDebit).toFixed(2));
      updated[lastIdx].creditAmount = 0;
    }
    setVoucherLines(updated);
  };

  // Handle Post New Voucher
  const handlePostVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBalancing.isBalanced) {
      alert(
        `Double-entry imbalance: Total Debit (₹${formBalancing.totalDebit}) must equal Total Credit (₹${formBalancing.totalCredit}). Difference: ₹${formBalancing.difference}`
      );
      return;
    }

    if (!voucherFormNarration.trim()) {
      alert('Please enter a clear transaction narration.');
      return;
    }

    const created = postDoubleEntryVoucher({
      voucherType: voucherFormType,
      date: voucherFormDate,
      branchName: voucherFormBranch,
      narration: voucherFormNarration.trim(),
      totalAmount: formBalancing.totalDebit,
      createdByName: 'Finance Manager',
      items: voucherLines.map((l, i) => ({
        id: 'itm_' + Date.now() + '_' + i,
        ledgerId: l.ledgerId,
        ledgerName: l.ledgerName,
        ledgerCode: l.ledgerCode,
        costCentreName: l.costCentreName || undefined,
        debitAmount: Number(l.debitAmount) || 0,
        creditAmount: Number(l.creditAmount) || 0,
      })),
    });

    setIsNewVoucherModalOpen(false);
    refreshAllData();
    alert(`Double-entry voucher ${created.voucherNumber} successfully posted and updated general ledgers!`);
  };

  // Handle Reversal Action
  const handleExecuteReversal = () => {
    if (!voucherToReverse) return;
    if (!reversalReason.trim()) {
      alert('Please specify an audit reason for reversing this voucher.');
      return;
    }

    const result = reversePostedVoucher(voucherToReverse.id, reversalReason.trim());
    if (!result) {
      alert('Unable to reverse this voucher. It may already be reversed.');
      return;
    }

    setIsReversalDialogOpen(false);
    setVoucherToReverse(null);
    setReversalReason('');
    refreshAllData();
    alert(`Voucher ${result.original.voucherNumber} reversed by ${result.reversal.voucherNumber}`);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset vouchers to factory audit defaults? Any custom posted vouchers will be restored.')) {
      resetVouchersToDefault();
      refreshAllData();
      alert('Vouchers have been reset to factory defaults.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Voucher Number',
      'Voucher Type',
      'Date',
      'Branch / Depot',
      'Narration',
      'Amount (INR)',
      'Status',
      'Reversal Flag',
      'Line Items (Account - Debit / Credit)',
    ];
    const rows = filteredVouchers.map((v) => [
      v.voucherNumber,
      v.voucherType,
      v.date,
      v.branchName,
      v.narration,
      v.totalAmount,
      v.status,
      v.isReversal ? 'REVERSAL' : 'ORIGINAL',
      v.items.map((i) => `${i.ledgerName} [Dr: ₹${i.debitAmount} | Cr: ₹${i.creditAmount}]`).join('; '),
    ]);
    exportToCsv('KIBO360_Vouchers_Register', headers, rows);
  };

  // Print Voucher Slip
  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Journal & Vouchers Management"
        description="Immutable double-entry voucher posting, payment/receipt journals, contra transfers, and strict audit reversal logging"
        breadcrumbs={[
          { label: 'Financial Accounting', href: '/' },
          { label: 'Journal & Vouchers' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-slate-600 hover:text-slate-900 border-slate-300"
              title="Reset vouchers to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-slate-700 hover:text-slate-900 border-slate-300"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Register
            </Button>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90 transition-opacity"
              size="sm"
              onClick={() => setIsNewVoucherModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Double-Entry Voucher
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search voucher #, narration, ledger, or branch..."
              className="pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Voucher Type Filter */}
          <div className="md:col-span-3">
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Voucher Types</option>
              <option value="JOURNAL">Journal Voucher (JV)</option>
              <option value="PAYMENT_VOUCHER">Payment Voucher (PV)</option>
              <option value="RECEIPT_VOUCHER">Receipt Voucher (RV)</option>
              <option value="CONTRA_VOUCHER">Contra Voucher (CV)</option>
              <option value="SALES_INVOICE">Sales Invoice (SV)</option>
              <option value="PURCHASE_BILL">Purchase Bill (PB)</option>
              <option value="ROYALTY_ACCRUAL">Royalty Accrual (RA)</option>
              <option value="DEBIT_NOTE">Debit Note (DN)</option>
              <option value="CREDIT_NOTE">Credit Note (CN)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="ALL">All Branches</option>
              <option value="Delhi">Delhi HQ Godown</option>
              <option value="Bhiwandi">Bhiwandi Depot</option>
              <option value="Bengaluru">Bengaluru Hub</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="POSTED">Posted (Active)</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        {/* Status Counts Bar */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{filteredVouchers.length}</strong> of{' '}
              <strong className="text-slate-800">{vouchers.length}</strong> vouchers
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">
              {vouchers.filter((v) => v.status === 'POSTED').length} Active Posted
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-700 font-semibold">
              {vouchers.filter((v) => v.status === 'REVERSED').length} Reversed
            </span>
          </div>

          {(searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL' || selectedBranch !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSelectedBranch('ALL');
              }}
              className="text-purple-700 hover:underline font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Vouchers Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher No. & Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Narration & Particulars</th>
                <th className="py-3 px-4">Branch / Depot</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No financial vouchers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr
                    key={v.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      v.status === 'REVERSED' ? 'bg-slate-50/60 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-sm" style={{ color: brand.primaryColor }}>
                        {v.voucherNumber}
                      </span>
                      <div className="text-xs text-slate-500 font-medium">{v.voucherType.replace(/_/g, ' ')}</div>
                      {v.isReversal && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                          REVERSAL ENTRY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">{v.date}</td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-2">{v.narration}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {v.items.map((i, idx) => (
                          <span key={idx} className="text-[11px] text-slate-500 font-mono">
                            {i.ledgerName}
                            {idx < v.items.length - 1 && ' •'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{v.branchName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      ₹{v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Badge variant={v.status === 'POSTED' ? 'success' : 'slate'}>{v.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2"
                          onClick={() => {
                            setSelectedVoucherForDetail(v);
                            setIsDetailDrawerOpen(true);
                          }}
                          title="View Voucher Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                        {v.status === 'POSTED' && !v.isReversal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2"
                            onClick={() => {
                              setVoucherToReverse(v);
                              setIsReversalDialogOpen(true);
                            }}
                            title="Execute Audit Reversal"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Reverse
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* DRAWER: VOUCHER BREAKDOWN & PRINTABLE AUDIT SLIP        */}
      {/* ======================================================== */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title={selectedVoucherForDetail ? `Voucher Slip: ${selectedVoucherForDetail.voucherNumber}` : 'Voucher Breakdown'}
        width="xl"
      >
        {selectedVoucherForDetail && (
          <div className="space-y-4">
            {/* Slip Header Box */}
            <div
              className="p-5 rounded-xl border space-y-3 shadow-sm"
              style={{
                backgroundColor: `${brand.primaryColor}08`,
                borderColor: `${brand.primaryColor}25`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-extrabold text-base text-slate-900">
                    {selectedVoucherForDetail.voucherNumber}
                  </span>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700 mt-0.5">
                    {selectedVoucherForDetail.voucherType.replace(/_/g, ' ')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Date: {selectedVoucherForDetail.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Voucher Amount:</span>
                  <span className="font-mono font-extrabold text-lg text-slate-900">
                    ₹{selectedVoucherForDetail.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div>
                    <Badge variant={selectedVoucherForDetail.status === 'POSTED' ? 'success' : 'slate'}>
                      {selectedVoucherForDetail.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-600">
                <span>Branch: <strong className="text-slate-800">{selectedVoucherForDetail.branchName}</strong></span>
                <span>Created By: <strong className="text-slate-800">{selectedVoucherForDetail.createdByName}</strong></span>
              </div>
            </div>

            {/* Narration Box */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-bold block text-slate-900 mb-0.5">Transaction Narration:</span>
              <p className="leading-relaxed">{selectedVoucherForDetail.narration}</p>
              {selectedVoucherForDetail.reversalReason && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-rose-800 font-semibold">
                  Reversal Audit Reason: {selectedVoucherForDetail.reversalReason}
                </div>
              )}
            </div>

            {/* Posting Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Account Ledger Particulars</th>
                    <th className="py-2.5 px-3">Cost Centre</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedVoucherForDetail.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                        {item.ledgerName}
                        <span className="block text-[11px] font-mono text-slate-400">Code: {item.ledgerCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{item.costCentreName || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.debitAmount > 0
                          ? `₹${item.debitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.creditAmount > 0
                          ? `₹${item.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 uppercase text-slate-800 font-sans">
                      Verified Total
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900">
                      ₹{selectedVoucherForDetail.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900">
                      ₹{selectedVoucherForDetail.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Print Slip Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handlePrintVoucher}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Voucher Slip
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ======================================================== */}
      {/* MODAL: POST NEW DOUBLE-ENTRY VOUCHER                     */}
      {/* ======================================================== */}
      <Modal
        isOpen={isNewVoucherModalOpen}
        onClose={() => setIsNewVoucherModalOpen(false)}
        title="Post New Double-Entry Voucher"
        maxWidth="2xl"
      >
        <form onSubmit={handlePostVoucher} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField label="Voucher Type" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={voucherFormType}
                onChange={(e) => setVoucherFormType(e.target.value as any)}
              >
                <option value="JOURNAL">Journal Voucher (JV)</option>
                <option value="PAYMENT_VOUCHER">Payment Voucher (PV)</option>
                <option value="RECEIPT_VOUCHER">Receipt Voucher (RV)</option>
                <option value="CONTRA_VOUCHER">Contra Voucher (CV)</option>
                <option value="SALES_INVOICE">Sales Invoice (SV)</option>
                <option value="PURCHASE_BILL">Purchase Bill (PB)</option>
                <option value="ROYALTY_ACCRUAL">Royalty Accrual (RA)</option>
                <option value="DEBIT_NOTE">Debit Note (DN)</option>
                <option value="CREDIT_NOTE">Credit Note (CN)</option>
              </select>
            </FormField>

            <FormField label="Entry Date" required>
              <Input
                type="date"
                value={voucherFormDate}
                onChange={(e) => setVoucherFormDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Branch / Depot" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={voucherFormBranch}
                onChange={(e) => setVoucherFormBranch(e.target.value)}
              >
                {AVAILABLE_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Transaction Narration" required>
            <Input
              placeholder="e.g. Settlement of paper reel supplies against Inv #BALL-9924"
              value={voucherFormNarration}
              onChange={(e) => setVoucherFormNarration(e.target.value)}
              required
            />
          </FormField>

          {/* Double-Entry Line Items Table */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Double-Entry Line Items
              </span>
              <div className="flex items-center gap-2">
                {!formBalancing.isBalanced && voucherLines.length >= 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoBalance}
                    className="text-purple-700 border-purple-200 hover:bg-purple-50 text-xs py-1"
                    title="Auto-fill the last line to balance Debit and Credit"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Auto-Balance Line
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fallbackLedger = ledgers[0] || {
                      id: 'led_cash',
                      name: 'Cash in Hand',
                      code: '1001',
                    };
                    setVoucherLines([
                      ...voucherLines,
                      {
                        ledgerId: fallbackLedger.id,
                        ledgerName: fallbackLedger.name,
                        ledgerCode: fallbackLedger.code,
                        costCentreName: '',
                        debitAmount: 0,
                        creditAmount: 0,
                      },
                    ]);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Line
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-5/12">Account Ledger</th>
                    <th className="py-2.5 px-3 w-3/12">Cost Centre</th>
                    <th className="py-2.5 px-3 text-right w-2/12">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right w-2/12">Credit (₹)</th>
                    <th className="py-2.5 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {voucherLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {/* Dynamic Ledger Selection */}
                      <td className="py-2 px-3">
                        <select
                          className="w-full h-8 px-2 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          value={line.ledgerId}
                          onChange={(e) => {
                            const selectedLedgerItem = ledgers.find((l) => l.id === e.target.value);
                            const updated = [...voucherLines];
                            updated[idx].ledgerId = e.target.value;
                            if (selectedLedgerItem) {
                              updated[idx].ledgerName = selectedLedgerItem.name;
                              updated[idx].ledgerCode = selectedLedgerItem.code;
                            }
                            setVoucherLines(updated);
                          }}
                        >
                          {ledgers.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.code} - {l.name} ({l.classification})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Dynamic Cost Centre Selection */}
                      <td className="py-2 px-3">
                        <select
                          className="w-full h-8 px-2 rounded-md border border-slate-300 text-xs bg-white focus:outline-none"
                          value={line.costCentreName}
                          onChange={(e) => {
                            const updated = [...voucherLines];
                            updated[idx].costCentreName = e.target.value;
                            setVoucherLines(updated);
                          }}
                        >
                          <option value="">None / Corporate HQ</option>
                          {costCentres.map((cc) => (
                            <option key={cc.id} value={cc.name}>
                              {cc.code} - {cc.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Debit Input */}
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full h-8 px-2 text-right font-mono rounded-md border border-slate-300 text-xs focus:outline-none"
                          value={line.debitAmount || ''}
                          onChange={(e) => {
                            const updated = [...voucherLines];
                            updated[idx].debitAmount = Number(e.target.value) || 0;
                            if (Number(e.target.value) > 0) updated[idx].creditAmount = 0;
                            setVoucherLines(updated);
                          }}
                        />
                      </td>

                      {/* Credit Input */}
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full h-8 px-2 text-right font-mono rounded-md border border-slate-300 text-xs focus:outline-none"
                          value={line.creditAmount || ''}
                          onChange={(e) => {
                            const updated = [...voucherLines];
                            updated[idx].creditAmount = Number(e.target.value) || 0;
                            if (Number(e.target.value) > 0) updated[idx].debitAmount = 0;
                            setVoucherLines(updated);
                          }}
                        />
                      </td>

                      {/* Remove Line Action */}
                      <td className="py-2 px-2 text-center">
                        {voucherLines.length > 2 && (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            onClick={() => {
                              const updated = voucherLines.filter((_, i) => i !== idx);
                              setVoucherLines(updated);
                            }}
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live Balancing Verification Strip */}
            <div
              className={`p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-mono font-bold gap-2 ${
                formBalancing.isBalanced
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {formBalancing.isBalanced ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Double-Entry Verified (Difference: ₹0.00)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>⚠️ Imbalance: Difference ₹{formBalancing.difference.toFixed(2)} must be 0</span>
                  </>
                )}
              </div>
              <div className="flex gap-4">
                <span>Total Debit: ₹{formBalancing.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span>Total Credit: ₹{formBalancing.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsNewVoucherModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formBalancing.isBalanced}
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white disabled:opacity-50"
            >
              Post Double-Entry Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: IMMUTABLE AUDIT VOUCHER REVERSAL                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isReversalDialogOpen}
        onClose={() => setIsReversalDialogOpen(false)}
        title="Immutable Voucher Reversal"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            In compliance with statutory financial audit standards, posted vouchers cannot be silently modified or erased. Reversing this voucher creates an exact opposing entry in the ledger and marks the original voucher as <span className="font-bold text-rose-700">REVERSED</span>.
          </p>

          {voucherToReverse && (
            <div className="p-3 bg-slate-50 rounded-lg border text-xs font-mono space-y-1">
              <div>
                Voucher:{' '}
                <span className="font-bold text-purple-700">{voucherToReverse.voucherNumber}</span>
              </div>
              <div>
                Amount:{' '}
                <span className="font-bold">
                  ₹{voucherToReverse.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="font-sans text-slate-500">{voucherToReverse.narration}</div>
            </div>
          )}

          <FormField label="Mandatory Reversal Audit Reason" required>
            <Input
              placeholder="e.g. Bank cheque bounced / duplicate billing cancellation"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsReversalDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleExecuteReversal}>
              Execute Reversal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VouchersPage;
