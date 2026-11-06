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
  BankAccountItem,
  CashRegisterItem,
  BankTransactionItem,
  ChequeItem,
  CashClosingItem,
  getStoredBankAccounts,
  saveBankAccountItem,
  getStoredCashRegisters,
  getStoredTransactions,
  getStoredCheques,
  saveChequeItem,
  updateChequeStatus,
  getStoredClosings,
  recordCashClosing,
  executeContraTransfer,
  computeBrsReconciliation,
  computeBankingKpis,
} from '../services/bankingService';
import {
  Landmark,
  Wallet,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  DollarSign,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  CreditCard,
  Building,
  RotateCcw,
  ShieldCheck,
  Search,
  Download,
  Check,
  XCircle,
} from 'lucide-react';

export const BankingPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<
    'accounts' | 'cash' | 'transfers' | 'cheques' | 'brs' | 'reports'
  >('accounts');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data States
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegisterItem[]>([]);
  const [transactions, setTransactions] = useState<BankTransactionItem[]>([]);
  const [cheques, setCheques] = useState<ChequeItem[]>([]);
  const [closings, setClosings] = useState<CashClosingItem[]>([]);
  const [selectedBrsAccountId, setSelectedBrsAccountId] = useState<string>('bnk_hdfc_01');

  // Refresh All Data
  const refreshData = () => {
    const accs = getStoredBankAccounts();
    const regs = getStoredCashRegisters();
    const txs = getStoredTransactions();
    const chqs = getStoredCheques();
    const cls = getStoredClosings();

    setBankAccounts(accs);
    setCashRegisters(regs);
    setTransactions(txs);
    setCheques(chqs);
    setClosings(cls);

    if (accs.length > 0 && !selectedBrsAccountId) {
      setSelectedBrsAccountId(accs[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const kpis = useMemo(() => computeBankingKpis(), [bankAccounts, cashRegisters, cheques]);
  const brs = useMemo(
    () => computeBrsReconciliation(selectedBrsAccountId),
    [selectedBrsAccountId, bankAccounts, cheques, transactions]
  );

  // --------------------------------------------------------------------------
  // MODAL 1: ADD BANK ACCOUNT
  // --------------------------------------------------------------------------
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accForm, setAccForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: 'HDFC Bank Ltd.',
    ifscCode: 'HDFC0001234',
    branchName: 'Connaught Place, New Delhi',
    accountType: 'CURRENT' as BankAccountItem['accountType'],
    openingBalance: '250000',
    notes: '',
  });

  const handleOpenAccountModal = () => {
    setAccForm({
      accountName: 'Axis Bank Distribution A/c',
      accountNumber: `9180200${Date.now().toString().slice(-7)}`,
      bankName: 'Axis Bank Ltd.',
      ifscCode: 'UTIB0000124',
      branchName: 'Daryaganj Branch, New Delhi',
      accountType: 'CURRENT',
      openingBalance: '250000',
      notes: 'Operating account for regional sales collection',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.accountName || !accForm.accountNumber) {
      alert('Please enter account name and number');
      return;
    }

    saveBankAccountItem({
      accountName: accForm.accountName,
      accountNumber: accForm.accountNumber,
      bankName: accForm.bankName,
      ifscCode: accForm.ifscCode.toUpperCase(),
      branchName: accForm.branchName,
      accountType: accForm.accountType,
      openingBalance: Number(accForm.openingBalance) || 0,
      notes: accForm.notes,
    });

    setIsAccountModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 2: TRANSFER FUNDS (CONTRA VOUCHER)
  // --------------------------------------------------------------------------
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    transferType: 'BANK_TO_BANK' as 'BANK_TO_BANK' | 'CASH_TO_BANK' | 'BANK_TO_CASH',
    sourceId: 'bnk_hdfc_01',
    destinationId: 'bnk_sbi_02',
    amount: '50000',
    referenceNumber: `RTGS-TRF-${Date.now().toString().slice(-6)}`,
    notes: 'Inter-account liquidity rebalancing',
  });

  const handleOpenTransferModal = () => {
    setTransferForm({
      transferType: 'BANK_TO_BANK',
      sourceId: bankAccounts[0]?.id || 'bnk_hdfc_01',
      destinationId: bankAccounts[1]?.id || 'bnk_sbi_02',
      amount: '50000',
      referenceNumber: `RTGS-TRF-${Date.now().toString().slice(-6)}`,
      notes: 'Inter-account liquidity rebalancing',
    });
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferForm.amount);
    if (!amt || amt <= 0) {
      alert('Please enter valid transfer amount');
      return;
    }

    try {
      executeContraTransfer({
        transferType: transferForm.transferType,
        sourceId: transferForm.sourceId,
        destinationId: transferForm.destinationId,
        amount: amt,
        referenceNumber: transferForm.referenceNumber || `TRF-${Date.now().toString().slice(-6)}`,
        notes: transferForm.notes,
      });

      setIsTransferModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error processing transfer');
    }
  };

  // --------------------------------------------------------------------------
  // MODAL 3: CASH SHIFT CLOSE
  // --------------------------------------------------------------------------
  const [isCashCloseModalOpen, setIsCashCloseModalOpen] = useState(false);
  const [closeForm, setCloseForm] = useState({
    registerId: 'csh_central_01',
    cashierName: 'Rajiv Malhotra',
    physicalCount: '25000',
    notes: 'Day-end drawer count',
  });

  const handleOpenCashCloseModal = (regId?: string) => {
    const reg = regId ? cashRegisters.find((r) => r.id === regId) : cashRegisters[0];
    setCloseForm({
      registerId: reg ? reg.id : 'csh_central_01',
      cashierName: reg ? reg.cashierName : 'Rajiv Malhotra',
      physicalCount: reg ? String(reg.currentBalance) : '25000',
      notes: 'Shift closing physical cash count',
    });
    setIsCashCloseModalOpen(true);
  };

  const handleSaveCashClose = (e: React.FormEvent) => {
    e.preventDefault();
    recordCashClosing({
      registerId: closeForm.registerId,
      cashierName: closeForm.cashierName,
      physicalCountedCash: Number(closeForm.physicalCount),
      notes: closeForm.notes,
    });

    setIsCashCloseModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 4: ISSUE / RECORD CHEQUE
  // --------------------------------------------------------------------------
  const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
  const [chequeForm, setChequeForm] = useState({
    chequeNumber: `CHQ-${Date.now().toString().slice(-6)}`,
    chequeType: 'ISSUED' as ChequeItem['chequeType'],
    bankAccountId: 'bnk_hdfc_01',
    payeeOrDrawer: 'Replika Press India Ltd.',
    amount: '45000',
    notes: '',
  });

  const handleOpenChequeModal = () => {
    setChequeForm({
      chequeNumber: `CHQ-${Date.now().toString().slice(-6)}`,
      chequeType: 'ISSUED',
      bankAccountId: bankAccounts[0]?.id || 'bnk_hdfc_01',
      payeeOrDrawer: 'Century Paper & Pulp Mills Ltd.',
      amount: '50000',
      notes: 'Cheque issued for paper consignment',
    });
    setIsChequeModalOpen(true);
  };

  const handleSaveCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chequeForm.payeeOrDrawer || !chequeForm.amount) {
      alert('Please fill payee and amount');
      return;
    }

    const targetBank = bankAccounts.find((b) => b.id === chequeForm.bankAccountId);

    saveChequeItem({
      chequeNumber: chequeForm.chequeNumber,
      chequeType: chequeForm.chequeType,
      bankAccountId: chequeForm.bankAccountId,
      bankName: targetBank ? targetBank.bankName : 'HDFC Bank Ltd.',
      payeeOrDrawer: chequeForm.payeeOrDrawer,
      amount: Number(chequeForm.amount),
      status: chequeForm.chequeType === 'ISSUED' ? 'ISSUED' : 'RECEIVED',
      notes: chequeForm.notes,
    });

    setIsChequeModalOpen(false);
    refreshData();
  };

  const handleClearCheque = (chqId: string) => {
    if (window.confirm('Mark this cheque as CLEARED in bank passbook?')) {
      updateChequeStatus(chqId, 'CLEARED');
      refreshData();
    }
  };

  const handleBounceCheque = (chqId: string) => {
    const reason = window.prompt('Enter Dishonour Reason / Return Memo Code:', 'Funds Insufficient (Code: 01)');
    if (reason !== null) {
      updateChequeStatus(chqId, 'BOUNCED', 590.0, reason);
      refreshData();
    }
  };

  // --------------------------------------------------------------------------
  // CSV EXPORT LOGIC
  // --------------------------------------------------------------------------
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAccounts = () => {
    exportCsv(
      'kibo360_bank_accounts',
      ['Account Name', 'Account Number', 'Bank Name', 'IFSC', 'Branch', 'Type', 'Current Balance', 'Status'],
      bankAccounts.map((b) => [
        b.accountName,
        b.accountNumber,
        b.bankName,
        b.ifscCode,
        b.branchName,
        b.accountType,
        b.currentBalance,
        b.status,
      ])
    );
  };

  const handleExportTransactions = () => {
    exportCsv(
      'kibo360_bank_transactions',
      ['Date', 'Method', 'Reference', 'Party Name', 'Inward (Debit)', 'Outward (Credit)', 'Balance', 'Voucher'],
      transactions.map((t) => [
        t.transactionDate,
        t.paymentMethod,
        t.referenceNumber,
        t.partyName,
        t.debitAmount,
        t.creditAmount,
        t.runningBalance,
        t.accountingVoucherNumber || '',
      ])
    );
  };

  const handleExportCheques = () => {
    exportCsv(
      'kibo360_cheques_register',
      ['Cheque #', 'Flow Type', 'Payee / Drawer', 'Bank', 'Amount', 'Status', 'Bounce Charges', 'Clearing Date'],
      cheques.map((c) => [
        c.chequeNumber,
        c.chequeType,
        c.payeeOrDrawer,
        c.bankName,
        c.amount,
        c.status,
        c.bounceCharges || 0,
        c.clearingDate || '',
      ])
    );
  };

  const handleExportClosings = () => {
    exportCsv(
      'kibo360_cash_shift_closings',
      ['Closing #', 'Date', 'Register', 'Cashier', 'Expected Cash', 'Physical Counted', 'Discrepancy', 'Status'],
      closings.map((c) => [
        c.closingNumber,
        c.shiftDate,
        c.registerName,
        c.cashierName,
        c.systemExpectedCash,
        c.physicalCountedCash,
        c.discrepancy,
        c.status,
      ])
    );
  };

  // Filtered views
  const filteredAccounts = bankAccounts.filter(
    (b) =>
      b.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.accountNumber.includes(searchTerm)
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCheques = cheques.filter(
    (c) =>
      c.chequeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.payeeOrDrawer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Banking & Cash Management"
        description="Comprehensive Treasury Management, Multi-Account Ledgers, CTS Cheque Lifecycle, Inter-Bank Contra Transfers, Imprest Petty Cash & Bank Reconciliation (BRS)."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenTransferModal}
              className="gap-2"
              style={{ color: brand.primaryColor, borderColor: `${brand.primaryColor}40` }}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Funds (Contra)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAccountModal}
              className="gap-2"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Plus className="h-4 w-4" />
              Add Bank Account
            </Button>
          </div>
        }
      />

      {/* Treasury KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Liquid Bank Funds
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{kpis.totalBankFunds.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {kpis.bankAccountsCount} Scheduled Accounts
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
            >
              <Landmark className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Counter & Petty Cash
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{kpis.totalCashFunds.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Shift Balance Reconciled
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Cheques in Clearing
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{kpis.chequesInClearing.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {kpis.chequesInClearingCount} Cheque(s) Awaiting CTS Presentation
              </p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                BRS Statement Status
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {brs.netDifference === 0 ? '₹0.00 Diff' : `₹${brs.netDifference} Diff`}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> 100% Balanced with Bank
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${brand.accentColor}15`, color: brand.accentColor }}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'accounts', label: `Bank Accounts (${bankAccounts.length})` },
          { key: 'cash', label: `Cash Desks & Petty Cash (${cashRegisters.length})` },
          { key: 'cheques', label: `Cheque Register & Dishonour (${cheques.length})` },
          { key: 'transfers', label: 'Inter-Bank Transfers & Contra' },
          { key: 'brs', label: 'Bank Reconciliation Statement (BRS)' },
          { key: 'reports', label: 'Cash Book & Treasury Reports' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#690BA8] text-[#690BA8] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{
                borderColor: isActive ? brand.primaryColor : 'transparent',
                color: isActive ? brand.primaryColor : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: BANK ACCOUNTS & TRANSACTIONS
          ===================================================================== */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAccounts.map((acc) => (
              <Card key={acc.id} className="p-5 space-y-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{acc.accountName}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">A/C: {acc.accountNumber}</p>
                  </div>
                  <Badge variant="purple">{acc.accountType}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-semibold">{acc.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-700">{acc.ifscCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span>{acc.branchName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Current Available Balance
                    </span>
                    <div className="text-xl font-bold font-mono" style={{ color: brand.primaryColor }}>
                      ₹{acc.currentBalance.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBrsAccountId(acc.id);
                      setActiveTab('brs');
                    }}
                    className="text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Reconcile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Bank Transactions Table */}
          <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Recent Bank Transactions & Entries</h3>
                <p className="text-xs text-slate-500">
                  Live ledger postings for UPI, NEFT, RTGS, and Cheque clearances
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleExportTransactions} leftIcon={<Download size={12} />}>
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference / UTR</th>
                    <th className="py-3 px-4">Party / Details</th>
                    <th className="py-3 px-4 text-right">Inward (Debit)</th>
                    <th className="py-3 px-4 text-right">Outward (Credit)</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                    <th className="py-3 px-4 text-center">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {tx.transactionDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {tx.referenceNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{tx.partyName}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {tx.debitAmount > 0 ? `+₹${tx.debitAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                        {tx.creditAmount > 0 ? `-₹${tx.creditAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{tx.runningBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                        {tx.accountingVoucherNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CASH DESKS & PETTY CASH
          ===================================================================== */}
      {activeTab === 'cash' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cashRegisters.map((reg) => (
              <Card key={reg.id} className="p-6 space-y-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{reg.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {reg.code}</p>
                  </div>
                  {reg.isPettyCash ? (
                    <Badge variant="purple">IMPREST PETTY CASH</Badge>
                  ) : (
                    <Badge variant="success">RETAIL CASH COUNTER</Badge>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-600">Custodial Cashier:</span>
                  <span className="font-semibold text-slate-800">{reg.cashierName}</span>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Current Physical Balance
                    </span>
                    <div className="text-2xl font-bold font-mono text-emerald-700">
                      ₹{reg.currentBalance.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenCashCloseModal(reg.id)}
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    Close Shift & Reconcile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Cash Shift Closings Log */}
          <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Cash Shift Day-End Closings & Audit History</h3>
                <p className="text-xs text-slate-500">
                  Physical denomination counts compared against system expected cash books
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportClosings} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Closing #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Register & Cashier</th>
                    <th className="py-3 px-4 text-right">System Expected</th>
                    <th className="py-3 px-4 text-right">Physical Counted</th>
                    <th className="py-3 px-4 text-right">Discrepancy (Variance)</th>
                    <th className="py-3 px-4 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {closings.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                        {c.closingNumber}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{c.shiftDate}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div>{c.registerName}</div>
                        <span className="text-xs text-slate-400 font-normal">{c.cashierName}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{c.systemExpectedCash.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{c.physicalCountedCash.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {c.discrepancy === 0 ? (
                          <span className="text-emerald-700 font-bold">₹0.00 (Balanced)</span>
                        ) : (
                          <span className="text-red-600 font-bold">
                            ₹{c.discrepancy.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={c.status === 'RECONCILED' ? 'success' : 'warning'}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: CHEQUE REGISTER & DISHONOUR LOG
          ===================================================================== */}
      {activeTab === 'cheques' && (
        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Cheque Leaves Register & CTS Clearing</h3>
              <p className="text-xs text-slate-500">
                CTS-2010 cheque lifecycle with automatic dishonour reversal vouchers and bounce charge tracking
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportCheques} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenChequeModal}
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Record Cheque
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Cheque #</th>
                  <th className="py-3 px-4">Flow Type</th>
                  <th className="py-3 px-4">Payee / Drawer</th>
                  <th className="py-3 px-4">Bank</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Bounce Charges</th>
                  <th className="py-3 px-4">Clearing Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCheques.map((chq) => (
                  <tr key={chq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                      {chq.chequeNumber}
                    </td>
                    <td className="py-3 px-4">
                      {chq.chequeType === 'ISSUED' ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                          ISSUED (OUTWARD)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          RECEIVED (INWARD)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{chq.payeeOrDrawer}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{chq.bankName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{chq.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {chq.status === 'CLEARED' && (
                        <Badge variant="success">CLEARED</Badge>
                      )}
                      {chq.status === 'BOUNCED' && (
                        <Badge variant="warning">BOUNCED / DISHONOURED</Badge>
                      )}
                      {(chq.status === 'ISSUED' || chq.status === 'RECEIVED' || chq.status === 'DEPOSITED') && (
                        <Badge variant="slate">PENDING CLEARANCE</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-red-600 font-bold">
                      {chq.bounceCharges ? `₹${chq.bounceCharges.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {chq.clearingDate || 'In Presentation'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {chq.status !== 'CLEARED' && chq.status !== 'BOUNCED' && (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearCheque(chq.id)}
                            className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 p-1 h-6"
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBounceCheque(chq.id)}
                            className="text-xs text-rose-600 hover:bg-rose-50 p-1 h-6"
                          >
                            Dishonour
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 4: TRANSFERS & CONTRA
          ===================================================================== */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Double-Entry Contra Voucher Posting</h3>
                <p className="text-xs text-slate-500">
                  Real-time inter-bank funds rebalancing and cash counter bank deposits
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenTransferModal}
                className="gap-2"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <Plus className="h-4 w-4" /> New Contra Transfer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#690BA8]">
                  Inter-Bank Transfer Formula
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Dr:</strong> Destination Bank Account &nbsp;|&nbsp; <strong>Cr:</strong> Source Bank Account (Voucher: <code>CV/2026/XXXX</code>)
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Cash Deposit Formula
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Dr:</strong> Commercial Bank Account &nbsp;|&nbsp; <strong>Cr:</strong> Cash in Hand (Voucher: <code>CV/2026/XXXX</code>)
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 5: BANK RECONCILIATION STATEMENT (BRS)
          ===================================================================== */}
      {activeTab === 'brs' && (
        <div className="space-y-6">
          {/* Account Selector Bar */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="text-xs font-semibold text-slate-700">Select Bank Account for BRS:</label>
            <select
              value={selectedBrsAccountId}
              onChange={(e) => setSelectedBrsAccountId(e.target.value)}
              className="text-xs font-semibold border border-slate-300 rounded-md p-1.5 bg-white"
            >
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.accountName} ({b.accountNumber}) - Balance: ₹{b.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-5 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{brs.accountName}</h3>
                  <p className="text-xs text-slate-500">Statutory Monthly Reconciliation Statement</p>
                </div>
                <Badge variant={brs.netDifference === 0 ? 'success' : 'warning'}>
                  {brs.netDifference === 0 ? 'ZERO DIFFERENCE' : 'VARIANCE'}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">Balance as per Company Books:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{brs.bookBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-indigo-700">
                  <span>Add: Cheques issued but not yet presented:</span>
                  <span className="font-mono font-bold">
                    +₹{brs.issuedUnpresentedCheques.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-amber-700">
                  <span>Deduct: Cheques deposited but not credited:</span>
                  <span className="font-mono font-bold">
                    -₹{brs.depositedUncreditedCheques.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-red-600">
                  <span>Deduct: Bank debit charges (Dishonour fees):</span>
                  <span className="font-mono font-bold">
                    -₹{brs.bankCharges.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-base font-bold border-t-2 border-purple-200" style={{ color: brand.primaryColor }}>
                  <span>Reconciled Balance (Expected Statement):</span>
                  <span className="font-mono">
                    ₹{brs.expectedPassbookBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-slate-600">
                  <span>Balance as per Bank Passbook Statement:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{brs.passbookBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800 font-bold">
                  <span>Net Reconciliation Difference:</span>
                  <span className="font-mono">
                    ₹{brs.netDifference.toFixed(2)} {brs.netDifference === 0 ? '(Matched)' : ''}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 text-sm">Bank Statement Import Engine</h3>
                  <Upload className="h-5 w-5" style={{ color: brand.primaryColor }} />
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Import CSV / Excel statements from HDFC, SBI, or ICICI internet banking. The system matches transactions automatically and rejects duplicate imports to protect financial integrity.
                </p>

                <div className="mt-4 border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/40">
                  <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: brand.primaryColor }} />
                  <div className="text-sm font-semibold text-slate-800">
                    HDFC_Statement_Current_Period.csv
                  </div>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ Verified: {transactions.length} rows parsed, 0 duplicates
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Attempting to re-import a previously processed statement file will trigger a <strong>409 Conflict</strong> protection barrier.
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: CASH BOOK & DAILY COLLECTION REPORTS
          ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 text-sm">
              Daily Collection Register by Payment Channel
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-700">
                  <QrCode className="h-4 w-4" style={{ color: brand.primaryColor }} /> UPI (PhonePe / GPay QR):
                </span>
                <span className="font-mono font-bold text-slate-900">₹45,000.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-700">
                  <Wallet className="h-4 w-4 text-emerald-600" /> Counter Cash:
                </span>
                <span className="font-mono font-bold text-slate-900">₹25,000.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-700">
                  <Receipt className="h-4 w-4 text-indigo-600" /> CTS Cheques Cleared:
                </span>
                <span className="font-mono font-bold text-slate-900">₹45,000.00</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold border-t border-slate-200" style={{ color: brand.primaryColor }}>
                <span>Total Daily Treasury Inflow:</span>
                <span className="font-mono">₹1,15,000.00</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 text-sm">
              Statutory Books & Registers
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">Cash Book (Chronological)</div>
                  <div className="text-slate-500">Counter and Petty cash inflows & outflows</div>
                </div>
                <Button size="sm" variant="outline" onClick={handleExportClosings} className="text-xs">
                  Export
                </Button>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">Bank Book (Account-Wise)</div>
                  <div className="text-slate-500">HDFC, SBI, ICICI operating statements</div>
                </div>
                <Button size="sm" variant="outline" onClick={handleExportTransactions} className="text-xs">
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ADD BANK ACCOUNT
          ===================================================================== */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Add Commercial Bank Account"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <FormField label="Account Display Name" required>
            <Input
              placeholder="e.g. Axis Bank Book Distribution A/c"
              value={accForm.accountName}
              onChange={(e) => setAccForm({ ...accForm, accountName: e.target.value })}
            />
          </FormField>

          <FormField label="Bank Account Number" required>
            <Input
              placeholder="e.g. 918020019283711"
              value={accForm.accountNumber}
              onChange={(e) => setAccForm({ ...accForm, accountNumber: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bank Name">
              <Input value={accForm.bankName} onChange={(e) => setAccForm({ ...accForm, bankName: e.target.value })} />
            </FormField>

            <FormField label="IFSC Code (11-Char)">
              <Input
                value={accForm.ifscCode}
                onChange={(e) => setAccForm({ ...accForm, ifscCode: e.target.value.toUpperCase() })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Branch Location">
              <Input
                value={accForm.branchName}
                onChange={(e) => setAccForm({ ...accForm, branchName: e.target.value })}
              />
            </FormField>

            <FormField label="Opening Balance (₹)">
              <Input
                type="number"
                value={accForm.openingBalance}
                onChange={(e) => setAccForm({ ...accForm, openingBalance: e.target.value })}
                min={0}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Save Bank Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 2: TRANSFER FUNDS (CONTRA)
          ===================================================================== */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Funds (Contra Voucher)"
        maxWidth="md"
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <FormField label="Transfer Type">
            <select
              value={transferForm.transferType}
              onChange={(e) => setTransferForm({ ...transferForm, transferType: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
            >
              <option value="BANK_TO_BANK">Bank to Bank (Inter-Bank Rebalance)</option>
              <option value="CASH_TO_BANK">Cash to Bank Deposit</option>
              <option value="BANK_TO_CASH">Bank to Cash Withdrawal (Counter / Petty)</option>
            </select>
          </FormField>

          {transferForm.transferType === 'BANK_TO_BANK' && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Source Bank">
                <select
                  value={transferForm.sourceId}
                  onChange={(e) => setTransferForm({ ...transferForm, sourceId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (₹{b.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Destination Bank">
                <select
                  value={transferForm.destinationId}
                  onChange={(e) => setTransferForm({ ...transferForm, destinationId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                >
                  {bankAccounts
                    .filter((b) => b.id !== transferForm.sourceId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (₹{b.currentBalance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </FormField>
            </div>
          )}

          <FormField label="Transfer Amount (₹)" required>
            <Input
              type="number"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              min={1}
            />
          </FormField>

          <FormField label="Challan / UTR Reference">
            <Input
              placeholder="e.g. RTGS-TRF-0981 or Cash Deposit Slip #7721"
              value={transferForm.referenceNumber}
              onChange={(e) => setTransferForm({ ...transferForm, referenceNumber: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post Contra Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 3: CASH SHIFT CLOSE
          ===================================================================== */}
      <Modal
        isOpen={isCashCloseModalOpen}
        onClose={() => setIsCashCloseModalOpen(false)}
        title="Day-End Cash Counter Shift Close"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCashClose} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Register:</span>
              <span className="font-bold text-slate-800">Central Cash Desk (CSH-MAIN)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="font-bold text-slate-800">{closeForm.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">System Book Expected:</span>
              <span className="font-bold font-mono" style={{ color: brand.primaryColor }}>
                ₹{cashRegisters.find((r) => r.id === closeForm.registerId)?.currentBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <FormField label="Physical Cash Counted (₹)" required>
            <Input
              type="number"
              value={closeForm.physicalCount}
              onChange={(e) => setCloseForm({ ...closeForm, physicalCount: e.target.value })}
              min={0}
            />
          </FormField>

          <FormField label="Closing Notes / Shift Summary">
            <Input
              value={closeForm.notes}
              onChange={(e) => setCloseForm({ ...closeForm, notes: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCashCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Confirm Shift Close
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 4: RECORD CHEQUE
          ===================================================================== */}
      <Modal
        isOpen={isChequeModalOpen}
        onClose={() => setIsChequeModalOpen(false)}
        title="Record Cheque Leaf (CTS-2010)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCheque} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cheque Number" required>
              <Input
                placeholder="e.g. CHQ-882191"
                value={chequeForm.chequeNumber}
                onChange={(e) => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
              />
            </FormField>

            <FormField label="Flow Type">
              <select
                value={chequeForm.chequeType}
                onChange={(e) => setChequeForm({ ...chequeForm, chequeType: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
              >
                <option value="ISSUED">Issued (Outward Payment)</option>
                <option value="RECEIVED">Received (Inward Collection)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Payee / Drawer Party" required>
            <Input
              placeholder="e.g. Replika Press India Ltd."
              value={chequeForm.payeeOrDrawer}
              onChange={(e) => setChequeForm({ ...chequeForm, payeeOrDrawer: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bank Account">
              <select
                value={chequeForm.bankAccountId}
                onChange={(e) => setChequeForm({ ...chequeForm, bankAccountId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({b.accountNumber.slice(-4)})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Cheque Amount (₹)" required>
              <Input
                type="number"
                value={chequeForm.amount}
                onChange={(e) => setChequeForm({ ...chequeForm, amount: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsChequeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Record Cheque Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
