import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  AuthorAgreementItem,
  RoyaltyCalculationItem,
  AdvanceLedgerItem,
  RoyaltySettlementItem,
  getStoredAgreements,
  saveAgreementItem,
  deleteAgreementItem,
  getStoredCalculations,
  saveCalculationRun,
  deleteCalculationRun,
  getStoredAdvances,
  issueAdvanceRoyalty,
  getStoredSettlements,
  settleRoyaltyPayment,
  computeRoyaltyKpis,
} from '../services/royaltyService';
import { getStoredBooks, getStoredAuthors, BookItem, AuthorItem } from '../services/catalogueService';
import {
  Feather,
  Plus,
  BookOpen,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calculator,
  Search,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Percent,
  TrendingDown,
  TrendingUp,
  Tag,
  ShieldCheck,
  Building,
  Receipt,
  Printer,
  ChevronRight,
  Landmark,
  ArrowRight,
  Wallet,
  Coins,
  Download,
  Trash2,
  Edit,
  FileCheck,
  Info,
} from 'lucide-react';

export const RoyaltiesPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'agreements' | 'calculations' | 'advances' | 'settlements' | 'statements'>('agreements');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Core Data States
  const [agreements, setAgreements] = useState<AuthorAgreementItem[]>([]);
  const [calculations, setCalculations] = useState<RoyaltyCalculationItem[]>([]);
  const [advances, setAdvances] = useState<AdvanceLedgerItem[]>([]);
  const [settlements, setSettlements] = useState<RoyaltySettlementItem[]>([]);
  const [catalogueBooks, setCatalogueBooks] = useState<BookItem[]>([]);
  const [catalogueAuthors, setCatalogueAuthors] = useState<AuthorItem[]>([]);

  // Selected Author for Statement Preview
  const [statementAuthorId, setStatementAuthorId] = useState<string>('');
  const [statementPeriod, setStatementPeriod] = useState<string>('Q2 FY26-27 (Jul - Sep 2026)');

  // Refresh All Data
  const refreshData = () => {
    const agrs = getStoredAgreements();
    const calcs = getStoredCalculations();
    const advs = getStoredAdvances();
    const setts = getStoredSettlements();
    const bks = getStoredBooks();
    const auths = getStoredAuthors();

    setAgreements(agrs);
    setCalculations(calcs);
    setAdvances(advs);
    setSettlements(setts);
    setCatalogueBooks(bks);
    setCatalogueAuthors(auths);

    if (agrs.length > 0 && !statementAuthorId) {
      setStatementAuthorId(agrs[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Dynamic KPIs
  const kpis = computeRoyaltyKpis();

  // --------------------------------------------------------------------------
  // MODAL 1: NEW / EDIT AUTHOR AGREEMENT
  // --------------------------------------------------------------------------
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [editingAgreementId, setEditingAgreementId] = useState<string | null>(null);
  const [selectedCatalogueAuthorId, setSelectedCatalogueAuthorId] = useState<string>('');
  const [agrForm, setAgrForm] = useState({
    authorName: '',
    authorPan: '',
    authorEmail: '',
    calculationMethod: 'PERCENTAGE_OF_MRP' as AuthorAgreementItem['calculationMethod'],
    royaltyPercentage: 10.0,
    fixedRatePerCopy: 0.0,
    advanceRoyaltyAmount: 50000.0,
    minimumGuarantee: 0.0,
    paymentFrequency: 'QUARTERLY' as AuthorAgreementItem['paymentFrequency'],
    bankName: 'HDFC Bank Ltd.',
    bankAccountNumber: '',
    bankIfsc: '',
    bookTitle: '',
    notes: '',
  });

  const handleOpenNewAgreementModal = () => {
    setEditingAgreementId(null);
    setSelectedCatalogueAuthorId('');
    setAgrForm({
      authorName: '',
      authorPan: '',
      authorEmail: '',
      calculationMethod: 'PERCENTAGE_OF_MRP',
      royaltyPercentage: 10.0,
      fixedRatePerCopy: 0.0,
      advanceRoyaltyAmount: 50000.0,
      minimumGuarantee: 0.0,
      paymentFrequency: 'QUARTERLY',
      bankName: 'HDFC Bank Ltd.',
      bankAccountNumber: '',
      bankIfsc: '',
      bookTitle: '',
      notes: '',
    });
    setIsAgreementModalOpen(true);
  };

  const handleOpenEditAgreementModal = (item: AuthorAgreementItem) => {
    setEditingAgreementId(item.id);
    setSelectedCatalogueAuthorId(item.authorId || '');
    setAgrForm({
      authorName: item.authorName,
      authorPan: item.authorPan,
      authorEmail: item.authorEmail || '',
      calculationMethod: item.calculationMethod,
      royaltyPercentage: item.royaltyPercentage,
      fixedRatePerCopy: item.fixedRatePerCopy,
      advanceRoyaltyAmount: item.advanceRoyaltyAmount,
      minimumGuarantee: item.minimumGuarantee,
      paymentFrequency: item.paymentFrequency,
      bankName: item.bankName,
      bankAccountNumber: item.bankAccountNumber,
      bankIfsc: item.bankIfsc,
      bookTitle: item.bookTitles.join(', '),
      notes: item.notes || '',
    });
    setIsAgreementModalOpen(true);
  };

  const handleSelectCatalogueAuthor = (authorId: string) => {
    setSelectedCatalogueAuthorId(authorId);
    const found = catalogueAuthors.find((a) => a.id === authorId);
    if (found) {
      // Find books written by this author
      const booksByAuthor = catalogueBooks.filter((b) => b.authorName.toLowerCase() === found.name.toLowerCase());
      const bookTitles = booksByAuthor.map((b) => b.title).join(', ');

      setAgrForm((prev) => ({
        ...prev,
        authorName: found.name,
        authorPan: found.pan || prev.authorPan,
        authorEmail: found.email || prev.authorEmail,
        bankName: found.bankDetails?.bankName || prev.bankName,
        bankAccountNumber: found.bankDetails?.accountNumber || prev.bankAccountNumber,
        bankIfsc: found.bankDetails?.ifsc || prev.bankIfsc,
        royaltyPercentage: found.royaltyRate || prev.royaltyPercentage,
        bookTitle: bookTitles || prev.bookTitle,
      }));
    }
  };

  const handleSaveAgreement = () => {
    if (!agrForm.authorName.trim()) {
      alert('Please enter or select author name');
      return;
    }

    const bookList = agrForm.bookTitle
      ? agrForm.bookTitle.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Academic Publication'];

    saveAgreementItem({
      id: editingAgreementId || undefined,
      authorId: selectedCatalogueAuthorId || undefined,
      authorName: agrForm.authorName.trim(),
      authorPan: agrForm.authorPan.trim().toUpperCase(),
      authorEmail: agrForm.authorEmail.trim(),
      calculationMethod: agrForm.calculationMethod,
      royaltyPercentage: Number(agrForm.royaltyPercentage) || 0,
      fixedRatePerCopy: Number(agrForm.fixedRatePerCopy) || 0,
      advanceRoyaltyAmount: Number(agrForm.advanceRoyaltyAmount) || 0,
      minimumGuarantee: Number(agrForm.minimumGuarantee) || 0,
      paymentFrequency: agrForm.paymentFrequency,
      bankName: agrForm.bankName.trim(),
      bankAccountNumber: agrForm.bankAccountNumber.trim(),
      bankIfsc: agrForm.bankIfsc.trim().toUpperCase(),
      bookTitles: bookList,
      notes: agrForm.notes.trim(),
    });

    setIsAgreementModalOpen(false);
    refreshData();
  };

  const handleDeleteAgreement = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete agreement for ${name}?`)) {
      deleteAgreementItem(id);
      refreshData();
    }
  };

  // --------------------------------------------------------------------------
  // MODAL 2: NEW ROYALTY ACCRUAL RUN
  // --------------------------------------------------------------------------
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [calcForm, setCalcForm] = useState({
    agreementId: '',
    periodName: 'Q3 FY26-27 (Oct - Dec 2026)',
    grossCopiesSold: 2500,
    copiesReturned: 50,
    bookTitle: '',
    mrp: 495,
    notes: '',
  });

  const handleOpenNewCalcModal = () => {
    const defaultAgr = agreements[0];
    setCalcForm({
      agreementId: defaultAgr ? defaultAgr.id : '',
      periodName: 'Q3 FY26-27 (Oct - Dec 2026)',
      grossCopiesSold: 2500,
      copiesReturned: 50,
      bookTitle: defaultAgr?.bookTitles[0] || '',
      mrp: 495,
      notes: '',
    });
    setIsCalcModalOpen(true);
  };

  const selectedAgreementForCalc = agreements.find((a) => a.id === calcForm.agreementId);

  // Live calculation preview in modal
  const calcGrossSold = Math.max(0, Number(calcForm.grossCopiesSold) || 0);
  const calcReturns = Math.max(0, Number(calcForm.copiesReturned) || 0);
  const calcNetCopies = Math.max(0, calcGrossSold - calcReturns);
  const calcMrp = Number(calcForm.mrp) || 450;

  let previewGrossRoyalty = 0;
  if (selectedAgreementForCalc) {
    if (selectedAgreementForCalc.calculationMethod === 'PERCENTAGE_OF_MRP') {
      previewGrossRoyalty = Math.round((calcNetCopies * calcMrp * (selectedAgreementForCalc.royaltyPercentage / 100)) * 100) / 100;
    } else if (selectedAgreementForCalc.calculationMethod === 'PERCENTAGE_OF_NET_SALES') {
      previewGrossRoyalty = Math.round((calcNetCopies * calcMrp * 0.60 * (selectedAgreementForCalc.royaltyPercentage / 100)) * 100) / 100;
    } else if (selectedAgreementForCalc.calculationMethod === 'FIXED_AMOUNT_PER_COPY') {
      previewGrossRoyalty = Math.round((calcNetCopies * selectedAgreementForCalc.fixedRatePerCopy) * 100) / 100;
    } else if (selectedAgreementForCalc.calculationMethod === 'SLAB_BASED') {
      if (calcNetCopies <= 2000) {
        previewGrossRoyalty = calcNetCopies * calcMrp * 0.075;
      } else if (calcNetCopies <= 5000) {
        previewGrossRoyalty = 2000 * calcMrp * 0.075 + (calcNetCopies - 2000) * calcMrp * 0.10;
      } else {
        previewGrossRoyalty = 2000 * calcMrp * 0.075 + 3000 * calcMrp * 0.10 + (calcNetCopies - 5000) * calcMrp * 0.125;
      }
      previewGrossRoyalty = Math.round(previewGrossRoyalty * 100) / 100;
    }
  }

  const previewMgTopup =
    selectedAgreementForCalc && selectedAgreementForCalc.minimumGuarantee > previewGrossRoyalty
      ? Math.round((selectedAgreementForCalc.minimumGuarantee - previewGrossRoyalty) * 100) / 100
      : 0;

  const previewTotalEarned = previewGrossRoyalty + previewMgTopup;

  const previewAdvanceRecouped =
    selectedAgreementForCalc && selectedAgreementForCalc.advanceBalanceRemaining > 0
      ? Math.min(selectedAgreementForCalc.advanceBalanceRemaining, previewTotalEarned)
      : 0;

  const isPanCompliant = selectedAgreementForCalc?.authorPan && selectedAgreementForCalc.authorPan.length === 10;
  const previewTdsRate = isPanCompliant ? 10.0 : 20.0;
  const previewTdsAmount = Math.round((previewTotalEarned * (previewTdsRate / 100)) * 100) / 100;
  const previewNetPayable = Math.max(0, Math.round((previewTotalEarned - previewAdvanceRecouped - previewTdsAmount) * 100) / 100);

  const handleSaveCalculation = () => {
    if (!calcForm.agreementId) {
      alert('Please select an author agreement');
      return;
    }
    try {
      saveCalculationRun({
        agreementId: calcForm.agreementId,
        periodName: calcForm.periodName,
        grossCopiesSold: calcGrossSold,
        copiesReturned: calcReturns,
        bookTitle: calcForm.bookTitle,
        mrp: calcMrp,
        notes: calcForm.notes,
      });
      setIsCalcModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error creating calculation run');
    }
  };

  const handleDeleteCalculation = (id: string) => {
    if (window.confirm('Delete this royalty calculation record?')) {
      deleteCalculationRun(id);
      refreshData();
    }
  };

  // --------------------------------------------------------------------------
  // MODAL 3: ISSUE AUTHOR ADVANCE
  // --------------------------------------------------------------------------
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    agreementNumber: '',
    authorName: '',
    amount: 50000,
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '',
    transactionRef: '',
    notes: '',
  });

  const handleOpenAdvanceModal = () => {
    const defaultAgr = agreements[0];
    setAdvanceForm({
      agreementNumber: defaultAgr ? defaultAgr.agreementNumber : '',
      authorName: defaultAgr ? defaultAgr.authorName : '',
      amount: 50000,
      bankName: 'HDFC Bank Corporate Current A/c',
      bankAccountNumber: defaultAgr ? defaultAgr.bankAccountNumber : '',
      transactionRef: `NEFT-ADV-${Date.now().toString().slice(-6)}`,
      notes: '',
    });
    setIsAdvanceModalOpen(true);
  };

  const handleSelectAgreementForAdvance = (agrNum: string) => {
    const agr = agreements.find((a) => a.agreementNumber === agrNum);
    if (agr) {
      setAdvanceForm((prev) => ({
        ...prev,
        agreementNumber: agr.agreementNumber,
        authorName: agr.authorName,
        bankAccountNumber: agr.bankAccountNumber,
      }));
    }
  };

  const handleSaveAdvance = () => {
    if (!advanceForm.agreementNumber || advanceForm.amount <= 0) {
      alert('Please enter valid agreement and amount');
      return;
    }

    issueAdvanceRoyalty({
      agreementNumber: advanceForm.agreementNumber,
      authorName: advanceForm.authorName,
      initialAdvanceAmount: Number(advanceForm.amount),
      bankName: advanceForm.bankName,
      bankAccountNumber: advanceForm.bankAccountNumber,
      transactionRef: advanceForm.transactionRef,
      notes: advanceForm.notes,
    });

    setIsAdvanceModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 4: SETTLE ROYALTY PAYMENT
  // --------------------------------------------------------------------------
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({
    calculationId: '',
    paymentMethod: 'NEFT' as RoyaltySettlementItem['paymentMethod'],
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '',
    transactionRef: '',
  });

  const handleOpenSettlementModal = (calcId?: string) => {
    const approvedCalcs = calculations.filter((c) => c.status === 'APPROVED');
    const targetCalc = calcId
      ? calculations.find((c) => c.id === calcId)
      : approvedCalcs[0] || calculations[0];

    const targetAgr = targetCalc ? agreements.find((a) => a.agreementNumber === targetCalc.agreementNumber) : null;

    setSettleForm({
      calculationId: targetCalc ? targetCalc.id : '',
      paymentMethod: 'NEFT',
      bankName: targetAgr?.bankName || 'HDFC Bank Corporate Current A/c',
      bankAccountNumber: targetAgr?.bankAccountNumber || '',
      transactionRef: `NEFT-ROY-${Date.now().toString().slice(-6)}`,
    });
    setIsSettlementModalOpen(true);
  };

  const selectedCalcForSettlement = calculations.find((c) => c.id === settleForm.calculationId);

  const handleSaveSettlement = () => {
    if (!settleForm.calculationId) {
      alert('Please select an approved calculation run');
      return;
    }

    try {
      settleRoyaltyPayment({
        calculationId: settleForm.calculationId,
        paymentMethod: settleForm.paymentMethod,
        bankName: settleForm.bankName,
        bankAccountNumber: settleForm.bankAccountNumber,
        transactionRef: settleForm.transactionRef,
      });

      setIsSettlementModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error processing settlement');
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

  const handleExportAgreements = () => {
    exportCsv(
      'kibo360_author_agreements',
      ['Agreement No', 'Author Name', 'PAN', 'Method', 'Rate %', 'Fixed Rate', 'Advance Remaining', 'MG', 'Frequency', 'Status'],
      agreements.map((a) => [
        a.agreementNumber,
        a.authorName,
        a.authorPan,
        a.calculationMethod,
        a.royaltyPercentage,
        a.fixedRatePerCopy,
        a.advanceBalanceRemaining,
        a.minimumGuarantee,
        a.paymentFrequency,
        a.status,
      ])
    );
  };

  const handleExportCalculations = () => {
    exportCsv(
      'kibo360_royalty_calculations',
      ['Calculation No', 'Period', 'Author', 'Agreement No', 'Gross Sold', 'Returns', 'Net Copies', 'Earned Royalty', 'Advance Recouped', 'TDS Rate', 'TDS Amount', 'Net Payable', 'Status', 'GL Voucher'],
      calculations.map((c) => [
        c.calculationNumber,
        c.periodName,
        c.authorName,
        c.agreementNumber,
        c.grossCopiesSold,
        c.copiesReturned,
        c.eligibleNetCopies,
        c.grossRoyaltyAmount + c.minimumGuaranteeTopup,
        c.advanceRecovered,
        c.tdsRate,
        c.tdsAmount,
        c.netPayableAmount,
        c.status,
        c.voucherNumber || '',
      ])
    );
  };

  const handleExportAdvances = () => {
    exportCsv(
      'kibo360_author_advances',
      ['Advance No', 'Agreement No', 'Author Name', 'Date', 'Initial Advance', 'Recouped To Date', 'Unamortized Balance', 'Recovery %', 'Status', 'GL Voucher'],
      advances.map((a) => [
        a.advanceNumber,
        a.agreementNumber,
        a.authorName,
        a.advanceDate,
        a.initialAdvanceAmount,
        a.totalRecoupedToDate,
        a.unamortizedBalance,
        a.recoveryPercentage,
        a.status,
        a.voucherNumber || '',
      ])
    );
  };

  const handleExportSettlements = () => {
    exportCsv(
      'kibo360_royalty_settlements',
      ['Settlement No', 'Author', 'PAN', 'Period', 'Settlement Date', 'Gross Earned', 'Advance Recouped', 'TDS Amount', 'Net Paid', 'Method', 'Bank', 'Ref', 'GL Voucher'],
      settlements.map((s) => [
        s.settlementNumber,
        s.authorName,
        s.authorPan,
        s.periodName,
        s.settlementDate,
        s.grossAmount,
        s.advanceRecouped,
        s.tdsAmount,
        s.netPaidAmount,
        s.paymentMethod,
        s.bankName,
        s.transactionRef,
        s.voucherNumber,
      ])
    );
  };

  // Filtered lists
  const filteredAgreements = agreements.filter((a) => {
    const matchesSearch =
      a.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.authorPan && a.authorPan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCalculations = calculations.filter((c) => {
    return (
      c.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.periodName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statement Preview Author
  const activeStatementAgreement = agreements.find((a) => a.id === statementAuthorId) || agreements[0];
  const activeStatementCalcs = calculations.filter(
    (c) => activeStatementAgreement && c.agreementNumber === activeStatementAgreement.agreementNumber
  );

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Author Royalty Management Hub"
        description="Comprehensive author contracts, sales volume slabs, return adjustments, advance recoupment, TDS Section 194J compliance, and double-entry general ledger settlements."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" style={{ color: brand.primaryColor }} />}
              onClick={() => setActiveTab('statements')}
            >
              Print Author Statement
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenNewAgreementModal}
              style={{ backgroundColor: brand.primaryColor }}
            >
              New Author Agreement
            </Button>
          </div>
        }
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Contracts
            </span>
            <Feather className="w-5 h-5" style={{ color: brand.primaryColor }} />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{kpis.totalAuthors} Authors</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {kpis.panComplianceRate}% PAN Compliant
          </div>
        </Card>

        <Card className="p-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gross Accrued
            </span>
            <Coins className="w-5 h-5" style={{ color: brand.accentColor }} />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹{kpis.totalGrossAccrued.toLocaleString()}</div>
          <div className="mt-1 text-xs text-slate-500">{kpis.totalNetCopiesSold.toLocaleString()} Net Copies Sold</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Advances Recouped
            </span>
            <RotateCcw className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-800">₹{kpis.totalAdvancesRecouped.toLocaleString()}</div>
          <div className="mt-1 text-xs text-indigo-600 font-medium">₹{kpis.totalAdvancesRemaining.toLocaleString()} Remaining</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TDS Withheld (194J)
            </span>
            <Building className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">₹{kpis.totalTdsWithheld.toLocaleString()}</div>
          <div className="mt-1 text-xs text-amber-700 font-medium">10.0% Standard Rate</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Paid to Authors
            </span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">₹{kpis.totalNetPaid.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">NEFT Bank Settlement</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('agreements')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'agreements'
                ? 'text-[#690BA8] border-[#690BA8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{
              borderColor: activeTab === 'agreements' ? brand.primaryColor : 'transparent',
              color: activeTab === 'agreements' ? brand.primaryColor : undefined,
            }}
          >
            <Feather className="w-4 h-4" />
            Author Agreements ({agreements.length})
          </button>

          <button
            onClick={() => setActiveTab('calculations')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculations'
                ? 'text-[#690BA8] border-[#690BA8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{
              borderColor: activeTab === 'calculations' ? brand.primaryColor : 'transparent',
              color: activeTab === 'calculations' ? brand.primaryColor : undefined,
            }}
          >
            <Calculator className="w-4 h-4" />
            Royalty Accrual Runs ({calculations.length})
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'advances'
                ? 'text-[#690BA8] border-[#690BA8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{
              borderColor: activeTab === 'advances' ? brand.primaryColor : 'transparent',
              color: activeTab === 'advances' ? brand.primaryColor : undefined,
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Advance Recovery Ledger ({advances.length})
          </button>

          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settlements'
                ? 'text-[#690BA8] border-[#690BA8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{
              borderColor: activeTab === 'settlements' ? brand.primaryColor : 'transparent',
              color: activeTab === 'settlements' ? brand.primaryColor : undefined,
            }}
          >
            <Receipt className="w-4 h-4" />
            Payment Settlements & GL ({settlements.length})
          </button>

          <button
            onClick={() => setActiveTab('statements')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'statements'
                ? 'text-[#690BA8] border-[#690BA8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{
              borderColor: activeTab === 'statements' ? brand.primaryColor : 'transparent',
              color: activeTab === 'statements' ? brand.primaryColor : undefined,
            }}
          >
            <FileText className="w-4 h-4" />
            Formal Author Statement Preview
          </button>
        </nav>
      </div>

      {/* =====================================================================
          TAB 1: AUTHOR AGREEMENTS & CONTRACTS
          ===================================================================== */}
      {activeTab === 'agreements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search author, agreement #, or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportAgreements}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenNewAgreementModal}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Add Author Agreement
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAgreements.map((a) => (
              <Card key={a.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${brand.primaryColor}15`,
                        borderColor: `${brand.primaryColor}40`,
                        color: brand.primaryColor,
                      }}
                    >
                      <Feather className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold" style={{ color: brand.primaryColor }}>
                          {a.agreementNumber}
                        </span>
                        <Badge variant="purple">{a.calculationMethod.replace(/_/g, ' ')}</Badge>
                        <Badge variant={a.status === 'ACTIVE' ? 'success' : 'slate'}>{a.status}</Badge>
                        {a.authorPan && (
                          <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                            PAN: {a.authorPan}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mt-1">{a.authorName}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Frequency: <strong>{a.paymentFrequency}</strong> • Bank: {a.bankName || 'Direct NEFT'} (A/c: {a.bankAccountNumber || 'Provided'})
                        {a.bankIfsc ? ` • IFSC: ${a.bankIfsc}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {a.calculationMethod === 'SLAB_BASED' && (
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volume Slabs</div>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded inline-block"
                          style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
                        >
                          7.5% → 10% → 12.5%
                        </span>
                      </div>
                    )}

                    {a.royaltyPercentage > 0 && a.calculationMethod !== 'SLAB_BASED' && (
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Royalty Rate</div>
                        <div className="text-lg font-bold" style={{ color: brand.primaryColor }}>
                          {a.royaltyPercentage.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {a.fixedRatePerCopy > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fixed Rate</div>
                        <div className="text-lg font-bold text-slate-800">
                          ₹{a.fixedRatePerCopy.toFixed(2)} <span className="text-xs text-slate-500">/ copy</span>
                        </div>
                      </div>
                    )}

                    {a.minimumGuarantee > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Min. Guarantee</div>
                        <div className="text-lg font-bold text-amber-700">₹{a.minimumGuarantee.toLocaleString()}</div>
                      </div>
                    )}

                    {a.advanceRoyaltyAmount > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advance Status</div>
                        <div className="text-sm font-bold text-slate-800">
                          ₹{a.advanceBalanceRemaining.toLocaleString()}{' '}
                          <span className="text-xs text-slate-400 font-normal">/ ₹{a.advanceRoyaltyAmount.toLocaleString()}</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${a.advanceBalanceRemaining === 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                          {a.advanceBalanceRemaining === 0 ? 'Fully Recouped' : 'Unamortized Balance'}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <button
                        onClick={() => handleOpenEditAgreementModal(a)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Edit Agreement"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgreement(a.id, a.authorName)}
                        className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Agreement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Associated Book Titles & Notes */}
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">Contracted Titles:</span>
                    {a.bookTitles.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                  {a.notes && <span className="text-slate-500 italic max-w-md truncate">{a.notes}</span>}
                </div>
              </Card>
            ))}

            {filteredAgreements.length === 0 && (
              <Card className="p-8 text-center text-slate-500">
                No author agreements match your filter.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: ROYALTY CALCULATION RUNS & ACCRUALS
          ===================================================================== */}
      {activeTab === 'calculations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Quarterly sales volume evaluation, return adjustments, MG top-ups, advance recovery, TDS Section 194J compliance, and GL voucher accrual.
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportCalculations}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenNewCalcModal}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Run Royalty Calculation
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Period & Author</th>
                    <th className="py-3 px-4">Agreement #</th>
                    <th className="py-3 px-4 text-center">Gross / Returns / Net</th>
                    <th className="py-3 px-4 text-right">Earned Royalty</th>
                    <th className="py-3 px-4 text-right">Advance Recouped</th>
                    <th className="py-3 px-4 text-right">TDS (194J)</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">GL Voucher</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalculations.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{c.authorName}</div>
                        <div className="text-xs text-slate-500">{c.periodName}</div>
                        <div className="text-[11px] text-slate-400 italic truncate max-w-xs">{c.bookTitle}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium" style={{ color: brand.primaryColor }}>
                        {c.agreementNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-slate-800">{c.eligibleNetCopies.toLocaleString()}</span>{' '}
                        <span className="text-xs text-slate-400">({c.grossCopiesSold} - {c.copiesReturned})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{(c.grossRoyaltyAmount + c.minimumGuaranteeTopup).toLocaleString()}
                        {c.minimumGuaranteeTopup > 0 && (
                          <div className="text-[11px] text-amber-600 font-normal">incl. ₹{c.minimumGuaranteeTopup.toLocaleString()} MG</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-700 font-semibold">
                        {c.advanceRecovered > 0 ? `-₹${c.advanceRecovered.toLocaleString()}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-medium">
                        -₹{c.tdsAmount.toLocaleString()}
                        <div className="text-[10px] text-slate-400">{c.tdsRate}%</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 text-base">
                        ₹{c.netPayableAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={c.status === 'PAID' ? 'success' : c.status === 'APPROVED' ? 'purple' : 'slate'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-700">
                        {c.voucherNumber || 'Pending'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {c.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenSettlementModal(c.id)}
                              className="text-xs py-1 px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                            >
                              Settle
                            </Button>
                          )}
                          <button
                            onClick={() => handleDeleteCalculation(c.id)}
                            className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCalculations.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No calculation runs recorded yet. Click "Run Royalty Calculation" to generate one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ADVANCE RECOVERY LEDGER
          ===================================================================== */}
      {activeTab === 'advances' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Tracking unamortized upfront advances paid to authors against quarterly accrued sales royalties.
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportAdvances}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAdvanceModal}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Issue Author Advance
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advances.map((adv) => (
              <Card key={adv.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold" style={{ color: brand.primaryColor }}>
                      {adv.agreementNumber}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-0.5">{adv.authorName}</h3>
                    <div className="text-xs text-slate-400">{adv.advanceDate} • Ref: {adv.transactionRef}</div>
                  </div>
                  <Badge variant={adv.status === 'FULLY_RECOUPED' ? 'success' : 'purple'}>
                    {adv.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Initial Advance Disbursed:</span>
                    <span className="font-semibold text-slate-800">₹{adv.initialAdvanceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Recouped to Date:</span>
                    <span className="font-semibold text-emerald-600">₹{adv.totalRecoupedToDate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2">
                    <span className="font-medium text-slate-800">Unamortized Advance Balance:</span>
                    <span className="font-bold" style={{ color: brand.primaryColor }}>
                      ₹{adv.unamortizedBalance.toLocaleString()}
                    </span>
                  </div>
                  {adv.voucherNumber && (
                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                      <span>GL Payment Voucher:</span>
                      <span className="font-mono font-semibold text-indigo-700">{adv.voucherNumber}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Recoupment Progress</span>
                    <span className="font-bold text-slate-700">{adv.recoveryPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${adv.recoveryPercentage}%`,
                        backgroundColor: adv.recoveryPercentage === 100 ? '#10B981' : brand.primaryColor,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {advances.length === 0 && (
              <div className="col-span-3 text-center py-8 text-slate-500">
                No author advances registered. Click "Issue Author Advance" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: PAYMENT SETTLEMENTS & GENERAL LEDGER
          ===================================================================== */}
      {activeTab === 'settlements' && (
        <Card className="p-5 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-slate-200 gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Royalty Disbursement Audit Register</h3>
              <p className="text-xs text-slate-500">Double-entry bank disbursements with Section 194J TDS and Advance reconciliation</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportSettlements}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenSettlementModal()}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Settle Royalty Payment
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Settlement #</th>
                  <th className="py-3 px-4">Author Beneficiary</th>
                  <th className="py-3 px-4">Date & Bank</th>
                  <th className="py-3 px-4 text-right">Gross Earned</th>
                  <th className="py-3 px-4 text-right">Advance Recouped</th>
                  <th className="py-3 px-4 text-right">TDS (194J)</th>
                  <th className="py-3 px-4 text-right">Net Paid</th>
                  <th className="py-3 px-4 text-center">Payment Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                      {s.settlementNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{s.authorName}</div>
                      <span className="text-xs text-slate-400 font-mono">PAN: {s.authorPan || 'NOT PROVIDED'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{s.settlementDate}</div>
                      <span className="text-xs text-slate-500">{s.bankName}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">₹{s.grossAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-indigo-700 font-semibold">
                      {s.advanceRecouped > 0 ? `-₹${s.advanceRecouped.toLocaleString()}` : '₹0'}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 font-medium">-₹{s.tdsAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">₹{s.netPaidAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        {s.voucherNumber}
                      </span>
                    </td>
                  </tr>
                ))}

                {settlements.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No royalty settlements recorded yet. Click "Settle Royalty Payment" to disburse funds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 5: FORMAL AUTHOR ROYALTY STATEMENT PREVIEW
          ===================================================================== */}
      {activeTab === 'statements' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Author:</label>
                <select
                  value={statementAuthorId}
                  onChange={(e) => setStatementAuthorId(e.target.value)}
                  className="text-sm font-semibold border border-slate-300 rounded-lg py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20"
                >
                  {agreements.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.authorName} ({a.agreementNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Period:</label>
                <select
                  value={statementPeriod}
                  onChange={(e) => setStatementPeriod(e.target.value)}
                  className="text-sm font-semibold border border-slate-300 rounded-lg py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20"
                >
                  <option value="Q2 FY26-27 (Jul - Sep 2026)">Q2 FY26-27 (Jul - Sep 2026)</option>
                  <option value="Q3 FY26-27 (Oct - Dec 2026)">Q3 FY26-27 (Oct - Dec 2026)</option>
                  <option value="Q1 FY26-27 (Apr - Jun 2026)">Q1 FY26-27 (Apr - Jun 2026)</option>
                  <option value="Annual FY26-27">Annual FY26-27</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              style={{ backgroundColor: brand.primaryColor }}
            >
              Print Statement (PDF)
            </Button>
          </div>

          {/* Branded Formal Statement Document */}
          {activeStatementAgreement && (
            <Card className="p-8 border border-slate-300 bg-white max-w-4xl mx-auto shadow-sm print:shadow-none print:border-none">
              {/* Statement Header */}
              <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <img src="/kibo360-logo.png" alt="KIBO360" className="h-8 w-auto object-contain" />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: brand.primaryColor }}>
                      {brand.companyName || 'Publishing ERP'}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                    STATEMENT OF AUTHOR ROYALTIES
                  </h2>
                  <div className="text-xs text-slate-500">
                    Period: <strong>{statementPeriod}</strong>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600">
                  <div className="font-bold text-slate-900 text-sm">KIBO360 Academic Publishing Ltd.</div>
                  <div>Registered Office: 4832/24, Ansari Road, Daryaganj</div>
                  <div>New Delhi - 110002, India</div>
                  <div>GSTIN: 07AAACK1234D1Z5 | TAN: DELK12345F</div>
                </div>
              </div>

              {/* Author Beneficiary Details */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Author Information</span>
                  <span className="font-bold text-slate-900 text-sm">{activeStatementAgreement.authorName}</span>
                  <div className="text-slate-600 mt-0.5">
                    PAN: <strong className="font-mono">{activeStatementAgreement.authorPan || 'PENDING'}</strong>
                  </div>
                  <div className="text-slate-600">
                    Agreement Ref:{' '}
                    <strong className="font-mono" style={{ color: brand.primaryColor }}>
                      {activeStatementAgreement.agreementNumber}
                    </strong>
                  </div>
                  <div className="text-slate-600">
                    Contract Basis: <strong>{activeStatementAgreement.calculationMethod.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block uppercase font-semibold">Bank Remittance Particulars</span>
                  <div className="font-semibold text-slate-800">{activeStatementAgreement.bankName || 'Direct NEFT'}</div>
                  <div className="text-slate-600 font-mono">A/c: {activeStatementAgreement.bankAccountNumber || 'Provided'}</div>
                  <div className="text-slate-600 font-mono">IFSC: {activeStatementAgreement.bankIfsc || 'N/A'}</div>
                  <div className="text-emerald-700 font-semibold mt-1">Section 194J TDS Compliant: YES</div>
                </div>
              </div>

              {/* Book-wise Breakdown Table */}
              <div className="py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Sales Volume & Contractual Royalty Calculation
                </h4>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-2 px-3">Title / SKU</th>
                      <th className="py-2 px-3 text-right">MRP (₹)</th>
                      <th className="py-2 px-3 text-center">Gross Sold</th>
                      <th className="py-2 px-3 text-center">Returns</th>
                      <th className="py-2 px-3 text-center">Net Eligible</th>
                      <th className="py-2 px-3">Royalty Formula</th>
                      <th className="py-2 px-3 text-right">Earned (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeStatementCalcs.length > 0 ? (
                      activeStatementCalcs.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{c.bookTitle}</div>
                            <span className="text-slate-400 font-mono text-[10px]">{c.calculationNumber}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">₹{c.mrp.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">{c.grossCopiesSold.toLocaleString()}</td>
                          <td className="py-2 px-3 text-center text-rose-600">
                            {c.copiesReturned > 0 ? `-${c.copiesReturned}` : '0'}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">{c.eligibleNetCopies.toLocaleString()}</td>
                          <td className="py-2 px-3 text-[11px] text-slate-600">
                            {c.calculationMethod.replace(/_/g, ' ')}
                            {c.minimumGuaranteeTopup > 0 ? ` + MG Top-up ₹${c.minimumGuaranteeTopup}` : ''}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            ₹{(c.grossRoyaltyAmount + c.minimumGuaranteeTopup).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-500">
                          No calculation runs logged for this author yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary & Deductions */}
              {(() => {
                const totalGross = activeStatementCalcs.reduce(
                  (sum, c) => sum + c.grossRoyaltyAmount + c.minimumGuaranteeTopup,
                  0
                );
                const totalAdv = activeStatementCalcs.reduce((sum, c) => sum + c.advanceRecovered, 0);
                const totalTds = activeStatementCalcs.reduce((sum, c) => sum + c.tdsAmount, 0);
                const totalNet = activeStatementCalcs.reduce((sum, c) => sum + c.netPayableAmount, 0);

                return (
                  <div className="border-t border-slate-200 pt-4 flex justify-end">
                    <div className="w-80 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Gross Royalty Earned:</span>
                        <span className="font-semibold text-slate-800">₹{totalGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-medium">
                        <span>Less: Advance Recouped:</span>
                        <span>-₹{totalAdv.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-700 font-medium">
                        <span>Less: TDS u/s 194J ({activeStatementAgreement.authorPan ? '10%' : '20%'}):</span>
                        <span>-₹{totalTds.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-800 pt-2">
                        <span>Net Disbursed via Bank:</span>
                        <span className="text-emerald-700 text-base">₹{totalNet.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legal Signatures */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-500">
                <div>
                  <div className="font-semibold text-slate-800">Verified by:</div>
                  <div className="mt-4 border-b border-slate-300 w-48"></div>
                  <div className="text-[11px] mt-1">Chief Financial Officer & Editorial Director</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">Computer-Generated Certificate</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Authorized digital record pursuant to Indian IT Act & Section 194J IT Rules.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL: NEW / EDIT AUTHOR AGREEMENT
          ===================================================================== */}
      <Modal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        title={editingAgreementId ? 'Edit Author Royalty Agreement' : 'Create New Author Royalty Agreement'}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {!editingAgreementId && catalogueAuthors.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs">
              <label className="font-bold text-[#690BA8] block mb-1">
                Link Existing Catalogue Author (Auto-fills PAN & Banking)
              </label>
              <select
                value={selectedCatalogueAuthorId}
                onChange={(e) => handleSelectCatalogueAuthor(e.target.value)}
                className="w-full text-sm border border-purple-300 rounded-lg p-2 bg-white"
              >
                <option value="">-- Choose Catalogue Author or Enter Below --</option>
                {catalogueAuthors.map((ca) => (
                  <option key={ca.id} value={ca.id}>
                    {ca.name} (PAN: {ca.pan || 'N/A'}) - {ca.bookCount} Books
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Author Full Name" required>
              <Input
                placeholder="e.g. Prof. R. K. Narayan"
                value={agrForm.authorName}
                onChange={(e) => setAgrForm({ ...agrForm, authorName: e.target.value })}
              />
            </FormField>

            <FormField label="Author PAN (for 10% TDS)">
              <Input
                placeholder="e.g. AABCN1234F"
                value={agrForm.authorPan}
                onChange={(e) => setAgrForm({ ...agrForm, authorPan: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Associated Book Titles (comma-separated)">
            <Input
              placeholder="e.g. The Guide (Malgudi Heritage Edition), Swami and Friends"
              value={agrForm.bookTitle}
              onChange={(e) => setAgrForm({ ...agrForm, bookTitle: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Calculation Method">
              <select
                value={agrForm.calculationMethod}
                onChange={(e) => setAgrForm({ ...agrForm, calculationMethod: e.target.value as any })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="PERCENTAGE_OF_MRP">Percentage on Retail MRP</option>
                <option value="PERCENTAGE_OF_NET_SALES">Percentage on Net Realized Sales (Wholesale)</option>
                <option value="FIXED_AMOUNT_PER_COPY">Fixed Rate Per Copy Sold</option>
                <option value="SLAB_BASED">Volume Tier Slabs (7.5% - 10% - 12.5%)</option>
              </select>
            </FormField>

            {agrForm.calculationMethod === 'FIXED_AMOUNT_PER_COPY' ? (
              <FormField label="Fixed Rate Per Copy (₹)">
                <Input
                  type="number"
                  value={agrForm.fixedRatePerCopy}
                  onChange={(e) => setAgrForm({ ...agrForm, fixedRatePerCopy: Number(e.target.value) })}
                />
              </FormField>
            ) : (
              <FormField label="Royalty Rate (%)">
                <Input
                  type="number"
                  value={agrForm.royaltyPercentage}
                  onChange={(e) => setAgrForm({ ...agrForm, royaltyPercentage: Number(e.target.value) })}
                  disabled={agrForm.calculationMethod === 'SLAB_BASED'}
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Advance Royalty (₹)">
              <Input
                type="number"
                value={agrForm.advanceRoyaltyAmount}
                onChange={(e) => setAgrForm({ ...agrForm, advanceRoyaltyAmount: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Minimum Guarantee (₹)">
              <Input
                type="number"
                value={agrForm.minimumGuarantee}
                onChange={(e) => setAgrForm({ ...agrForm, minimumGuarantee: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Payment Frequency">
              <select
                value={agrForm.paymentFrequency}
                onChange={(e) => setAgrForm({ ...agrForm, paymentFrequency: e.target.value as any })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Bank Name">
              <Input
                placeholder="Bank Name"
                value={agrForm.bankName}
                onChange={(e) => setAgrForm({ ...agrForm, bankName: e.target.value })}
              />
            </FormField>
            <FormField label="Account Number">
              <Input
                placeholder="Account No"
                value={agrForm.bankAccountNumber}
                onChange={(e) => setAgrForm({ ...agrForm, bankAccountNumber: e.target.value })}
              />
            </FormField>
            <FormField label="IFSC Code">
              <Input
                placeholder="IFSC"
                value={agrForm.bankIfsc}
                onChange={(e) => setAgrForm({ ...agrForm, bankIfsc: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Contract Notes / Remarks">
            <Input
              placeholder="e.g. Volume slab tiers, revision terms, special permissions"
              value={agrForm.notes}
              onChange={(e) => setAgrForm({ ...agrForm, notes: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsAgreementModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAgreement}
              style={{ backgroundColor: brand.primaryColor }}
            >
              {editingAgreementId ? 'Update Author Agreement' : 'Execute Author Contract'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: RUN ROYALTY CALCULATION
          ===================================================================== */}
      <Modal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        title="Run Quarterly Author Royalty Accrual"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Select Author Agreement" required>
              <select
                value={calcForm.agreementId}
                onChange={(e) => {
                  const val = e.target.value;
                  const agr = agreements.find((a) => a.id === val);
                  setCalcForm((prev) => ({
                    ...prev,
                    agreementId: val,
                    bookTitle: agr?.bookTitles[0] || prev.bookTitle,
                  }));
                }}
                className="w-full text-sm border border-slate-200 rounded-lg p-2"
              >
                {agreements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.authorName} ({a.agreementNumber}) - {a.calculationMethod.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Royalty Period" required>
              <select
                value={calcForm.periodName}
                onChange={(e) => setCalcForm({ ...calcForm, periodName: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2"
              >
                <option value="Q3 FY26-27 (Oct - Dec 2026)">Q3 FY26-27 (Oct - Dec 2026)</option>
                <option value="Q4 FY26-27 (Jan - Mar 2027)">Q4 FY26-27 (Jan - Mar 2027)</option>
                <option value="Q2 FY26-27 (Jul - Sep 2026)">Q2 FY26-27 (Jul - Sep 2026)</option>
                <option value="Q1 FY26-27 (Apr - Jun 2026)">Q1 FY26-27 (Apr - Jun 2026)</option>
                <option value="Annual FY26-27">Annual FY26-27</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Gross Copies Sold" required>
              <Input
                type="number"
                value={calcForm.grossCopiesSold}
                onChange={(e) => setCalcForm({ ...calcForm, grossCopiesSold: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Customer Returns">
              <Input
                type="number"
                value={calcForm.copiesReturned}
                onChange={(e) => setCalcForm({ ...calcForm, copiesReturned: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Unit Retail MRP (₹)">
              <Input
                type="number"
                value={calcForm.mrp}
                onChange={(e) => setCalcForm({ ...calcForm, mrp: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Book Title / SKU">
            <Input
              value={calcForm.bookTitle}
              onChange={(e) => setCalcForm({ ...calcForm, bookTitle: e.target.value })}
              placeholder="e.g. Concepts of Physics (Part 1)"
            />
          </FormField>

          {/* Real-time Calculation Breakdown Preview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-sm flex items-center justify-between pb-1 border-b border-slate-200">
              <span>Royalty Accrual Computation Breakdown</span>
              <span className="text-emerald-700 font-semibold">{calcNetCopies.toLocaleString()} Net Eligible Copies</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Earned Royalty:</span>
              <span className="font-semibold text-slate-800">₹{previewGrossRoyalty.toLocaleString()}</span>
            </div>
            {previewMgTopup > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Minimum Guarantee Top-up (to ₹{selectedAgreementForCalc?.minimumGuarantee.toLocaleString()}):</span>
                <span className="font-semibold">+₹{previewMgTopup.toLocaleString()}</span>
              </div>
            )}
            {previewAdvanceRecouped > 0 && (
              <div className="flex justify-between text-indigo-700">
                <span>Less: Advance Recoupment (Bal: ₹{selectedAgreementForCalc?.advanceBalanceRemaining.toLocaleString()}):</span>
                <span className="font-semibold">-₹{previewAdvanceRecouped.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-rose-700">
              <span>
                Less: TDS u/s 194J ({previewTdsRate}% - {isPanCompliant ? 'PAN Valid' : 'No PAN / 206AA'}):
              </span>
              <span className="font-semibold">-₹{previewTdsAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Net Author Payable:</span>
              <span className="text-emerald-700 text-base">₹{previewNetPayable.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-400 italic pt-1">
              * Submitting posts an automated double-entry Journal Voucher in the General Ledger (Debit Author Royalty Expense 4050, Credit TDS 2020, Credit Advances 1050, Credit Payables 2001).
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsCalcModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCalculation}
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post Accrual & Journal Voucher
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: ISSUE AUTHOR ADVANCE
          ===================================================================== */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Issue Author Upfront Advance"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <FormField label="Target Author Agreement" required>
            <select
              value={advanceForm.agreementNumber}
              onChange={(e) => handleSelectAgreementForAdvance(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg p-2"
            >
              {agreements.map((a) => (
                <option key={a.id} value={a.agreementNumber}>
                  {a.authorName} ({a.agreementNumber})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Advance Amount (₹)" required>
            <Input
              type="number"
              value={advanceForm.amount}
              onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
            />
          </FormField>

          <FormField label="Disbursing Bank Account">
            <select
              value={advanceForm.bankName}
              onChange={(e) => setAdvanceForm({ ...advanceForm, bankName: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg p-2"
            >
              <option value="HDFC Bank Corporate Current A/c">HDFC Bank Corporate Current A/c (1002)</option>
              <option value="State Bank of India Operative A/c">State Bank of India Operative A/c (1003)</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Author Bank Account No">
              <Input
                value={advanceForm.bankAccountNumber}
                onChange={(e) => setAdvanceForm({ ...advanceForm, bankAccountNumber: e.target.value })}
              />
            </FormField>

            <FormField label="Transaction / UTR Ref">
              <Input
                value={advanceForm.transactionRef}
                onChange={(e) => setAdvanceForm({ ...advanceForm, transactionRef: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Disbursement Purpose / Notes">
            <Input
              placeholder="e.g. Upfront advance for upcoming edition revision"
              value={advanceForm.notes}
              onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAdvance}
              style={{ backgroundColor: brand.primaryColor }}
            >
              Disburse Advance & Post GL Voucher
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: SETTLE ROYALTY PAYMENT
          ===================================================================== */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Execute Royalty Payout Settlement"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <FormField label="Approved Calculation to Disburse" required>
            <select
              value={settleForm.calculationId}
              onChange={(e) => {
                const val = e.target.value;
                const calc = calculations.find((c) => c.id === val);
                const agr = calc ? agreements.find((a) => a.agreementNumber === calc.agreementNumber) : null;
                setSettleForm((prev) => ({
                  ...prev,
                  calculationId: val,
                  bankAccountNumber: agr?.bankAccountNumber || prev.bankAccountNumber,
                }));
              }}
              className="w-full text-sm border border-slate-200 rounded-lg p-2"
            >
              {calculations
                .filter((c) => c.status === 'APPROVED')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.authorName} - {c.periodName} (Net: ₹{c.netPayableAmount.toLocaleString()})
                  </option>
                ))}
              {calculations.filter((c) => c.status === 'APPROVED').length === 0 && (
                <option value="">No pending approved calculations available</option>
              )}
            </select>
          </FormField>

          {selectedCalcForSettlement && (
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-800 text-sm">Disbursement Summary</div>
              <div className="flex justify-between text-slate-700">
                <span>Beneficiary:</span>
                <span className="font-semibold">{selectedCalcForSettlement.authorName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>PAN (10% TDS Deducted):</span>
                <span className="font-mono font-semibold">{selectedCalcForSettlement.authorPan || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-emerald-900 font-bold border-t border-emerald-200 pt-1 text-sm">
                <span>Net Payable via Bank:</span>
                <span>₹{selectedCalcForSettlement.netPayableAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Payment Method">
              <select
                value={settleForm.paymentMethod}
                onChange={(e) => setSettleForm({ ...settleForm, paymentMethod: e.target.value as any })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2"
              >
                <option value="NEFT">NEFT (Standard Direct Credit)</option>
                <option value="RTGS">RTGS (High Value Real-Time)</option>
                <option value="UPI">UPI Direct Remittance</option>
                <option value="CHEQUE">Bank Cheque / Demand Draft</option>
              </select>
            </FormField>

            <FormField label="Remitting Bank">
              <select
                value={settleForm.bankName}
                onChange={(e) => setSettleForm({ ...settleForm, bankName: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2"
              >
                <option value="HDFC Bank Corporate Current A/c">HDFC Bank Corporate Current A/c (1002)</option>
                <option value="State Bank of India Operative A/c">State Bank of India Operative A/c (1003)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Author Destination A/c">
              <Input
                value={settleForm.bankAccountNumber}
                onChange={(e) => setSettleForm({ ...settleForm, bankAccountNumber: e.target.value })}
              />
            </FormField>

            <FormField label="Bank UTR / Transaction Ref">
              <Input
                value={settleForm.transactionRef}
                onChange={(e) => setSettleForm({ ...settleForm, transactionRef: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsSettlementModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettlement}
              disabled={!settleForm.calculationId}
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post Payment Voucher & Settle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
