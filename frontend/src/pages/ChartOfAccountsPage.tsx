import React, { useState, useMemo, useEffect } from 'react';
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
  Layers,
  Plus,
  Search,
  Download,
  BookOpen,
  Scale,
  TrendingUp,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Edit2,
  Trash2,
  RotateCcw,
  Printer,
  Filter,
  Check,
  X,
  Wallet,
  Landmark,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import {
  AccountClassification,
  LedgerItem,
  CostCentreItem,
  StatementEntry,
  STANDARD_ACCOUNT_GROUPS,
  INITIAL_LEDGERS,
  getStoredLedgers,
  saveStoredLedgers,
  saveLedgerItem,
  deleteLedgerItem,
  toggleLedgerActive,
  getStoredCostCentres,
  saveCostCentreItem,
  deleteCostCentreItem,
  getLedgerStatementEntries,
  addStatementEntry,
  exportToCsv,
} from '../services/accountingService';

export const ChartOfAccountsPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation State
  const [activeMainTab, setActiveMainTab] = useState<'chart' | 'trial_balance' | 'pnl' | 'balance_sheet' | 'cost_centres'>('chart');
  
  // Ledgers State
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cost Centres State
  const [costCentres, setCostCentres] = useState<CostCentreItem[]>([]);

  // Ledger Statement Drawer State
  const [selectedLedger, setSelectedLedger] = useState<LedgerItem | null>(null);
  const [isStatementDrawerOpen, setIsStatementDrawerOpen] = useState(false);
  const [statementEntries, setStatementEntries] = useState<StatementEntry[]>([]);
  const [statementDateFilter, setStatementDateFilter] = useState<string>('ALL');
  const [isAddingEntryInline, setIsAddingEntryInline] = useState(false);
  const [newEntryForm, setNewEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherNumber: 'JV/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000),
    voucherType: 'JOURNAL' as StatementEntry['voucherType'],
    narration: '',
    opposingLedgerName: '',
    costCentreName: '',
    debit: 0,
    credit: 0,
  });

  // Ledger Create / Edit Modal State
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [ledgerForm, setLedgerForm] = useState({
    code: '',
    name: '',
    groupName: STANDARD_ACCOUNT_GROUPS[0].name,
    classification: 'ASSET' as AccountClassification,
    openingBalance: 0,
    currentBalance: 0,
    isDebitBalance: true,
    isBankOrCash: false,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    description: '',
  });

  // Cost Centre Create / Edit Modal State
  const [isCostCentreModalOpen, setIsCostCentreModalOpen] = useState(false);
  const [editingCostCentreId, setEditingCostCentreId] = useState<string | null>(null);
  const [costCentreForm, setCostCentreForm] = useState({
    code: '',
    name: '',
    type: 'COST' as CostCentreItem['type'],
    category: 'EDITORIAL' as CostCentreItem['category'],
    managerName: '',
    allocatedBudget: 0,
    actualAmount: 0,
    description: '',
  });

  // Load Initial Data
  useEffect(() => {
    refreshLedgers();
    refreshCostCentres();
  }, []);

  const refreshLedgers = () => {
    const data = getStoredLedgers();
    setLedgers(data);
  };

  const refreshCostCentres = () => {
    const data = getStoredCostCentres();
    setCostCentres(data);
  };

  // Sync Statement entries when selectedLedger changes
  useEffect(() => {
    if (selectedLedger) {
      const entries = getLedgerStatementEntries(selectedLedger);
      setStatementEntries(entries);
    }
  }, [selectedLedger]);

  // Unique Group Names for Dropdown Filter
  const availableGroups = useMemo(() => {
    const groups = new Set(ledgers.map((l) => l.groupName));
    return Array.from(groups).sort();
  }, [ledgers]);

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.groupName.toLowerCase().includes(q) ||
        (l.bankName && l.bankName.toLowerCase().includes(q)) ||
        (l.branchName && l.branchName.toLowerCase().includes(q));

      const matchesClass = selectedClassification === 'ALL' || l.classification === selectedClassification;
      const matchesGroup = selectedGroupFilter === 'ALL' || l.groupName === selectedGroupFilter;

      return matchesSearch && matchesClass && matchesGroup;
    });
  }, [ledgers, searchQuery, selectedClassification, selectedGroupFilter]);

  // Filtered Statement Entries
  const filteredStatementEntries = useMemo(() => {
    if (!selectedLedger) return [];
    if (statementDateFilter === 'ALL') return statementEntries;
    return statementEntries.filter((e) => e.date.startsWith(statementDateFilter));
  }, [statementEntries, statementDateFilter, selectedLedger]);

  // Financial Computations for Trial Balance
  const trialBalanceData = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    const items = ledgers
      .filter((l) => l.isActive)
      .map((l) => {
        let debit = 0;
        let credit = 0;
        if (l.isDebitBalance) {
          if (l.currentBalance >= 0) debit = l.currentBalance;
          else credit = Math.abs(l.currentBalance);
        } else {
          if (l.currentBalance >= 0) credit = l.currentBalance;
          else debit = Math.abs(l.currentBalance);
        }
        totalDebit += debit;
        totalCredit += credit;
        return { ...l, debit, credit };
      });

    const difference = Math.round((totalDebit - totalCredit) * 100) / 100;
    return {
      items,
      totalDebit,
      totalCredit,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
    };
  }, [ledgers]);

  // Dynamic P&L Computations (Grouped Dynamically)
  const pnlData = useMemo(() => {
    const activeLedgers = ledgers.filter((l) => l.isActive);

    // Revenue ledgers grouped by groupName
    const revenueGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    let totalRevenue = 0;
    activeLedgers
      .filter((l) => l.classification === 'REVENUE')
      .forEach((l) => {
        if (!revenueGroupsMap[l.groupName]) {
          revenueGroupsMap[l.groupName] = { total: 0, ledgers: [] };
        }
        revenueGroupsMap[l.groupName].total += l.currentBalance;
        revenueGroupsMap[l.groupName].ledgers.push(l);
        totalRevenue += l.currentBalance;
      });

    // Expense Ledgers
    const directExpenseGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    const indirectExpenseGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    let directExpenses = 0;
    let indirectExpenses = 0;

    activeLedgers
      .filter((l) => l.classification === 'EXPENSE')
      .forEach((l) => {
        const isDirect =
          l.groupName.toLowerCase().includes('direct') ||
          l.groupName.toLowerCase().includes('production') ||
          l.groupName.toLowerCase().includes('paper') ||
          l.groupName.toLowerCase().includes('royalty') ||
          l.code.startsWith('400') ||
          l.code.startsWith('405');

        if (isDirect) {
          if (!directExpenseGroupsMap[l.groupName]) {
            directExpenseGroupsMap[l.groupName] = { total: 0, ledgers: [] };
          }
          directExpenseGroupsMap[l.groupName].total += l.currentBalance;
          directExpenseGroupsMap[l.groupName].ledgers.push(l);
          directExpenses += l.currentBalance;
        } else {
          if (!indirectExpenseGroupsMap[l.groupName]) {
            indirectExpenseGroupsMap[l.groupName] = { total: 0, ledgers: [] };
          }
          indirectExpenseGroupsMap[l.groupName].total += l.currentBalance;
          indirectExpenseGroupsMap[l.groupName].ledgers.push(l);
          indirectExpenses += l.currentBalance;
        }
      });

    const grossProfit = totalRevenue - directExpenses;
    const netProfit = grossProfit - indirectExpenses;

    return {
      totalRevenue,
      directExpenses,
      grossProfit,
      indirectExpenses,
      netProfit,
      revenueGroups: Object.entries(revenueGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
      directExpenseGroups: Object.entries(directExpenseGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
      indirectExpenseGroups: Object.entries(indirectExpenseGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
    };
  }, [ledgers]);

  // Dynamic Balance Sheet Computations (Grouped Dynamically)
  const balanceSheetData = useMemo(() => {
    const activeLedgers = ledgers.filter((l) => l.isActive);

    // Assets grouped by groupName
    const assetGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    let totalAssets = 0;
    activeLedgers
      .filter((l) => l.classification === 'ASSET')
      .forEach((l) => {
        if (!assetGroupsMap[l.groupName]) {
          assetGroupsMap[l.groupName] = { total: 0, ledgers: [] };
        }
        assetGroupsMap[l.groupName].total += l.currentBalance;
        assetGroupsMap[l.groupName].ledgers.push(l);
        totalAssets += l.currentBalance;
      });

    // Liabilities grouped by groupName
    const liabilityGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    let totalLiabilities = 0;
    activeLedgers
      .filter((l) => l.classification === 'LIABILITY')
      .forEach((l) => {
        if (!liabilityGroupsMap[l.groupName]) {
          liabilityGroupsMap[l.groupName] = { total: 0, ledgers: [] };
        }
        liabilityGroupsMap[l.groupName].total += l.currentBalance;
        liabilityGroupsMap[l.groupName].ledgers.push(l);
        totalLiabilities += l.currentBalance;
      });

    // Equity grouped by groupName
    const equityGroupsMap: Record<string, { total: number; ledgers: LedgerItem[] }> = {};
    let totalEquity = 0;
    activeLedgers
      .filter((l) => l.classification === 'EQUITY')
      .forEach((l) => {
        if (!equityGroupsMap[l.groupName]) {
          equityGroupsMap[l.groupName] = { total: 0, ledgers: [] };
        }
        equityGroupsMap[l.groupName].total += l.currentBalance;
        equityGroupsMap[l.groupName].ledgers.push(l);
        totalEquity += l.currentBalance;
      });

    const netProfit = pnlData.netProfit;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfit;
    const difference = Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netProfit,
      totalLiabilitiesAndEquity,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
      assetGroups: Object.entries(assetGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
      liabilityGroups: Object.entries(liabilityGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
      equityGroups: Object.entries(equityGroupsMap).map(([groupName, data]) => ({ groupName, ...data })),
    };
  }, [ledgers, pnlData]);

  // Cost Centre Summary Computations
  const costCentresSummary = useMemo(() => {
    let totalBudget = 0;
    let totalActualSpend = 0;
    let totalRevenue = 0;

    costCentres.forEach((cc) => {
      totalBudget += cc.allocatedBudget;
      if (cc.type === 'PROFIT' || cc.type === 'REVENUE') {
        totalRevenue += cc.actualAmount;
      } else {
        totalActualSpend += cc.actualAmount;
      }
    });

    const utilizationPct = totalBudget > 0 ? (totalActualSpend / totalBudget) * 100 : 0;
    return { totalBudget, totalActualSpend, totalRevenue, utilizationPct };
  }, [costCentres]);

  // --- LEDGER HANDLERS ---
  const handleOpenCreateLedger = () => {
    setEditingLedgerId(null);
    setLedgerForm({
      code: String(1000 + ledgers.length + 10),
      name: '',
      groupName: STANDARD_ACCOUNT_GROUPS[0].name,
      classification: STANDARD_ACCOUNT_GROUPS[0].classification,
      openingBalance: 0,
      currentBalance: 0,
      isDebitBalance: true,
      isBankOrCash: false,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      description: '',
    });
    setIsLedgerModalOpen(true);
  };

  const handleOpenEditLedger = (ledger: LedgerItem) => {
    setEditingLedgerId(ledger.id);
    setLedgerForm({
      code: ledger.code,
      name: ledger.name,
      groupName: ledger.groupName,
      classification: ledger.classification,
      openingBalance: ledger.openingBalance,
      currentBalance: ledger.currentBalance,
      isDebitBalance: ledger.isDebitBalance,
      isBankOrCash: ledger.isBankOrCash,
      bankName: ledger.bankName || '',
      accountNumber: ledger.accountNumber || '',
      ifscCode: ledger.ifscCode || '',
      branchName: ledger.branchName || '',
      description: ledger.description || '',
    });
    setIsLedgerModalOpen(true);
  };

  const handleSaveLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerForm.name.trim() || !ledgerForm.code.trim()) {
      alert('Account Ledger Name and Code are mandatory fields.');
      return;
    }

    // Check code duplication if creating new
    if (!editingLedgerId && ledgers.some((l) => l.code === ledgerForm.code.trim())) {
      alert(`Ledger with Account Code "${ledgerForm.code}" already exists.`);
      return;
    }

    const saved = saveLedgerItem({
      ...(editingLedgerId ? { id: editingLedgerId } : {}),
      code: ledgerForm.code.trim(),
      name: ledgerForm.name.trim(),
      groupName: ledgerForm.groupName,
      classification: ledgerForm.classification,
      openingBalance: Number(ledgerForm.openingBalance) || 0,
      currentBalance: Number(ledgerForm.currentBalance ?? ledgerForm.openingBalance) || 0,
      isBankOrCash: ledgerForm.isBankOrCash,
      bankName: ledgerForm.bankName.trim() || undefined,
      accountNumber: ledgerForm.accountNumber.trim() || undefined,
      ifscCode: ledgerForm.ifscCode.trim() || undefined,
      branchName: ledgerForm.branchName.trim() || undefined,
      description: ledgerForm.description.trim() || undefined,
    });

    setIsLedgerModalOpen(false);
    refreshLedgers();
    alert(`Account Ledger "${saved.name}" (${saved.code}) saved successfully.`);
  };

  const handleDeleteLedger = (ledger: LedgerItem) => {
    if (!window.confirm(`Are you sure you want to delete ledger "${ledger.name}" (${ledger.code})?`)) {
      return;
    }
    const res = deleteLedgerItem(ledger.id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    refreshLedgers();
    if (selectedLedger?.id === ledger.id) {
      setIsStatementDrawerOpen(false);
      setSelectedLedger(null);
    }
    alert(res.message);
  };

  const handleToggleLedgerStatus = (ledger: LedgerItem) => {
    toggleLedgerActive(ledger.id);
    refreshLedgers();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Chart of Accounts & Cost Centres to factory publishing defaults? Custom modifications will be restored.')) {
      saveStoredLedgers(INITIAL_LEDGERS);
      refreshLedgers();
      refreshCostCentres();
      alert('Chart of Accounts has been reset to factory defaults.');
    }
  };

  // --- COST CENTRE HANDLERS ---
  const handleOpenCreateCostCentre = () => {
    setEditingCostCentreId(null);
    setCostCentreForm({
      code: 'CC-' + Math.floor(100 + Math.random() * 900),
      name: '',
      type: 'COST',
      category: 'EDITORIAL',
      managerName: '',
      allocatedBudget: 0,
      actualAmount: 0,
      description: '',
    });
    setIsCostCentreModalOpen(true);
  };

  const handleOpenEditCostCentre = (cc: CostCentreItem) => {
    setEditingCostCentreId(cc.id);
    setCostCentreForm({
      code: cc.code,
      name: cc.name,
      type: cc.type,
      category: cc.category,
      managerName: cc.managerName,
      allocatedBudget: cc.allocatedBudget,
      actualAmount: cc.actualAmount,
      description: cc.description,
    });
    setIsCostCentreModalOpen(true);
  };

  const handleSaveCostCentre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costCentreForm.name.trim() || !costCentreForm.code.trim()) {
      alert('Cost Centre Code and Name are required.');
      return;
    }

    const saved = saveCostCentreItem({
      ...(editingCostCentreId ? { id: editingCostCentreId } : {}),
      code: costCentreForm.code.trim(),
      name: costCentreForm.name.trim(),
      type: costCentreForm.type,
      category: costCentreForm.category,
      managerName: costCentreForm.managerName.trim(),
      allocatedBudget: Number(costCentreForm.allocatedBudget) || 0,
      actualAmount: Number(costCentreForm.actualAmount) || 0,
      description: costCentreForm.description.trim(),
    });

    setIsCostCentreModalOpen(false);
    refreshCostCentres();
    alert(`Cost Centre "${saved.name}" (${saved.code}) saved successfully.`);
  };

  const handleDeleteCostCentre = (cc: CostCentreItem) => {
    if (window.confirm(`Delete Cost Centre "${cc.name}" (${cc.code})?`)) {
      deleteCostCentreItem(cc.id);
      refreshCostCentres();
    }
  };

  // --- STATEMENT DRAWER INLINE ENTRY HANDLER ---
  const handleAddInlineStatementEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger) return;

    if (!newEntryForm.narration.trim()) {
      alert('Please specify a narration or description for this entry.');
      return;
    }

    if (newEntryForm.debit <= 0 && newEntryForm.credit <= 0) {
      alert('Please specify either a Debit or Credit amount greater than 0.');
      return;
    }

    addStatementEntry({
      ledgerId: selectedLedger.id,
      date: newEntryForm.date,
      voucherNumber: newEntryForm.voucherNumber,
      voucherType: newEntryForm.voucherType,
      narration: newEntryForm.narration.trim(),
      opposingLedgerName: newEntryForm.opposingLedgerName.trim() || undefined,
      costCentreName: newEntryForm.costCentreName.trim() || undefined,
      debit: Number(newEntryForm.debit) || 0,
      credit: Number(newEntryForm.credit) || 0,
    });

    // Refresh selected ledger and entries
    refreshLedgers();
    const updatedLedgers = getStoredLedgers();
    const refreshedTarget = updatedLedgers.find((l) => l.id === selectedLedger.id);
    if (refreshedTarget) setSelectedLedger(refreshedTarget);

    setIsAddingEntryInline(false);
    setNewEntryForm({
      date: new Date().toISOString().split('T')[0],
      voucherNumber: 'JV/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000),
      voucherType: 'JOURNAL',
      narration: '',
      opposingLedgerName: '',
      costCentreName: '',
      debit: 0,
      credit: 0,
    });
  };

  // --- CSV EXPORTS ---
  const handleExportCurrentTab = () => {
    if (activeMainTab === 'chart') {
      const headers = ['Account Code', 'Ledger Name', 'Account Group', 'Classification', 'Nature', 'Opening Balance', 'Current Balance', 'Status', 'Bank / Cash'];
      const rows = filteredLedgers.map((l) => [
        l.code,
        l.name,
        l.groupName,
        l.classification,
        l.isDebitBalance ? 'Dr' : 'Cr',
        l.openingBalance,
        l.currentBalance,
        l.isActive ? 'Active' : 'Inactive',
        l.isBankOrCash ? (l.bankName ? `Bank (${l.bankName})` : 'Cash') : 'No',
      ]);
      exportToCsv('KIBO360_Chart_of_Accounts', headers, rows);
    } else if (activeMainTab === 'trial_balance') {
      const headers = ['Account Code', 'Particulars (Ledger Name)', 'Account Group', 'Debit Balance (INR)', 'Credit Balance (INR)'];
      const rows = trialBalanceData.items.map((i) => [i.code, i.name, i.groupName, i.debit, i.credit]);
      rows.push(['TOTAL', 'Grand Total', '', trialBalanceData.totalDebit, trialBalanceData.totalCredit]);
      exportToCsv('KIBO360_Trial_Balance', headers, rows);
    } else if (activeMainTab === 'pnl') {
      const headers = ['Category', 'Account Group', 'Account Ledger', 'Amount (INR)'];
      const rows: (string | number)[][] = [];

      pnlData.revenueGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Revenue', g.groupName, l.name, l.currentBalance]));
      });
      pnlData.directExpenseGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Direct Production Expense', g.groupName, l.name, l.currentBalance]));
      });
      rows.push(['Summary', 'Gross Profit', '', pnlData.grossProfit]);
      pnlData.indirectExpenseGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Indirect Expense', g.groupName, l.name, l.currentBalance]));
      });
      rows.push(['Summary', 'Net Profit Before Tax', '', pnlData.netProfit]);

      exportToCsv('KIBO360_Profit_and_Loss', headers, rows);
    } else if (activeMainTab === 'balance_sheet') {
      const headers = ['Section', 'Account Group', 'Account Ledger', 'Amount (INR)'];
      const rows: (string | number)[][] = [];

      balanceSheetData.assetGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Assets', g.groupName, l.name, l.currentBalance]));
      });
      rows.push(['Assets Total', '', '', balanceSheetData.totalAssets]);

      balanceSheetData.liabilityGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Liabilities', g.groupName, l.name, l.currentBalance]));
      });
      balanceSheetData.equityGroups.forEach((g) => {
        g.ledgers.forEach((l) => rows.push(['Equity', g.groupName, l.name, l.currentBalance]));
      });
      rows.push(['Equity', 'Retained Earnings (Period Net Profit)', '', balanceSheetData.netProfit]);
      rows.push(['Liabilities & Equity Total', '', '', balanceSheetData.totalLiabilitiesAndEquity]);

      exportToCsv('KIBO360_Balance_Sheet', headers, rows);
    } else if (activeMainTab === 'cost_centres') {
      const headers = ['Cost Centre Code', 'Department / Cost Centre Name', 'Type', 'Category', 'Manager', 'Allocated Budget (INR)', 'Actual Amount (INR)', 'Description'];
      const rows = costCentres.map((c) => [
        c.code,
        c.name,
        c.type,
        c.category,
        c.managerName,
        c.allocatedBudget,
        c.actualAmount,
        c.description,
      ]);
      exportToCsv('KIBO360_Cost_Centres', headers, rows);
    }
  };

  const handleExportStatementCsv = () => {
    if (!selectedLedger) return;
    const headers = ['Date', 'Voucher Number', 'Voucher Type', 'Opposing Account', 'Cost Centre', 'Narration', 'Debit (INR)', 'Credit (INR)', 'Running Balance (INR)', 'Nature'];
    const rows = filteredStatementEntries.map((e) => [
      e.date,
      e.voucherNumber,
      e.voucherType,
      e.opposingLedgerName || '-',
      e.costCentreName || '-',
      e.narration,
      e.debit,
      e.credit,
      e.runningBalance,
      e.isDebit ? 'Dr' : 'Cr',
    ]);
    exportToCsv(`KIBO360_Ledger_${selectedLedger.code}_${selectedLedger.name.replace(/\s+/g, '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <PageHeader
        title="Chart of Accounts & General Ledger"
        description="Double-entry financial accounting, multi-tier account hierarchies, dynamic trial balance, P&L, balance sheet, and division cost centres"
        breadcrumbs={[
          { label: 'Financial Accounting', href: '/' },
          { label: 'Chart of Accounts' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-slate-600 hover:text-slate-900 border-slate-300"
              title="Reset all ledgers to factory publishing defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCurrentTab}
              className="text-slate-700 hover:text-slate-900 border-slate-300"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export CSV
            </Button>
            {activeMainTab === 'cost_centres' ? (
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90 transition-opacity"
                size="sm"
                onClick={handleOpenCreateCostCentre}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Cost Centre
              </Button>
            ) : (
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90 transition-opacity"
                size="sm"
                onClick={handleOpenCreateLedger}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Account Ledger
              </Button>
            )}
          </div>
        }
      />

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 gap-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveMainTab('chart')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeMainTab === 'chart' ? brand.primaryColor : 'transparent',
            color: activeMainTab === 'chart' ? brand.primaryColor : '#64748B',
          }}
        >
          <FolderTree className="w-4 h-4" />
          Chart of Accounts ({ledgers.length})
        </button>
        <button
          onClick={() => setActiveMainTab('trial_balance')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeMainTab === 'trial_balance' ? brand.primaryColor : 'transparent',
            color: activeMainTab === 'trial_balance' ? brand.primaryColor : '#64748B',
          }}
        >
          <Scale className="w-4 h-4" />
          Trial Balance
          {trialBalanceData.isBalanced ? (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Balanced
            </span>
          ) : (
            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> Diff ₹{Math.abs(trialBalanceData.difference).toFixed(2)}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveMainTab('pnl')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeMainTab === 'pnl' ? brand.primaryColor : 'transparent',
            color: activeMainTab === 'pnl' ? brand.primaryColor : '#64748B',
          }}
        >
          <TrendingUp className="w-4 h-4" />
          Profit & Loss Account
          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
            ₹{(pnlData.netProfit / 100000).toFixed(2)}L
          </span>
        </button>
        <button
          onClick={() => setActiveMainTab('balance_sheet')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeMainTab === 'balance_sheet' ? brand.primaryColor : 'transparent',
            color: activeMainTab === 'balance_sheet' ? brand.primaryColor : '#64748B',
          }}
        >
          <Building className="w-4 h-4" />
          Balance Sheet
          {balanceSheetData.isBalanced && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Balanced
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveMainTab('cost_centres')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeMainTab === 'cost_centres' ? brand.primaryColor : 'transparent',
            color: activeMainTab === 'cost_centres' ? brand.primaryColor : '#64748B',
          }}
        >
          <PieChart className="w-4 h-4" />
          Cost Centre Accounting ({costCentres.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CHART OF ACCOUNTS & LEDGERS TABLE                 */}
      {/* ======================================================== */}
      {activeMainTab === 'chart' && (
        <div className="space-y-4">
          {/* Classification Filters, Group Filter & Search */}
          <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search ledger name, account code, group, or bank..."
                  className="pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Group Dropdown Filter */}
              <div className="md:col-span-4">
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                >
                  <option value="ALL">All Account Groups ({availableGroups.length})</option>
                  {availableGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Search / Counts */}
              <div className="md:col-span-3 flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing <strong className="text-slate-800">{filteredLedgers.length}</strong> of{' '}
                  <strong className="text-slate-800">{ledgers.length}</strong> ledgers
                </span>
                {(searchQuery || selectedClassification !== 'ALL' || selectedGroupFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedClassification('ALL');
                      setSelectedGroupFilter('ALL');
                    }}
                    className="text-purple-700 hover:underline font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Classification Quick Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
              {[
                { key: 'ALL', label: 'All Classifications', count: ledgers.length },
                { key: 'ASSET', label: 'Assets', count: ledgers.filter((l) => l.classification === 'ASSET').length },
                { key: 'LIABILITY', label: 'Liabilities', count: ledgers.filter((l) => l.classification === 'LIABILITY').length },
                { key: 'EQUITY', label: 'Equity & Reserves', count: ledgers.filter((l) => l.classification === 'EQUITY').length },
                { key: 'REVENUE', label: 'Revenue / Sales', count: ledgers.filter((l) => l.classification === 'REVENUE').length },
                { key: 'EXPENSE', label: 'Expenses', count: ledgers.filter((l) => l.classification === 'EXPENSE').length },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedClassification(item.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedClassification === item.key
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={{
                    backgroundColor: selectedClassification === item.key ? brand.primaryColor : undefined,
                  }}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedClassification === item.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Ledger Master Table */}
          <Card className="p-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Account Ledger Name</th>
                    <th className="py-3 px-4">Account Group</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Opening Balance (₹)</th>
                    <th className="py-3 px-4 text-right">Current Balance (₹)</th>
                    <th className="py-3 px-4 text-center">Nature</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No account ledgers match your active search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgers.map((l) => (
                      <tr
                        key={l.id}
                        className={`hover:bg-slate-50/80 transition-colors ${!l.isActive ? 'opacity-60 bg-slate-50/40' : ''}`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900">{l.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>{l.name}</span>
                            {l.isBankOrCash && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-purple-200">
                                {l.bankName ? <Landmark className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                                {l.bankName ? l.bankName : 'Cash'}
                              </span>
                            )}
                            {l.branchName && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                {l.branchName}
                              </span>
                            )}
                          </div>
                          {l.accountNumber && (
                            <div className="text-[11px] font-mono text-slate-400">
                              A/C: {l.accountNumber} {l.ifscCode ? `| IFSC: ${l.ifscCode}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{l.groupName}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              l.classification === 'ASSET'
                                ? 'purple'
                                : l.classification === 'LIABILITY'
                                ? 'coral'
                                : l.classification === 'REVENUE'
                                ? 'success'
                                : l.classification === 'EXPENSE'
                                ? 'warning'
                                : 'slate'
                            }
                          >
                            {l.classification}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-slate-600">
                          ₹{l.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center text-xs font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold ${
                              l.isDebitBalance ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {l.isDebitBalance ? 'Dr' : 'Cr'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleLedgerStatus(l)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              l.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                            title="Click to toggle Active/Inactive"
                          >
                            {l.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2"
                              onClick={() => {
                                setSelectedLedger(l);
                                setIsStatementDrawerOpen(true);
                              }}
                              title="View Ledger Statement & Entries"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              Statement
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900 px-2"
                              onClick={() => handleOpenEditLedger(l)}
                              title="Edit Ledger Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2"
                              onClick={() => handleDeleteLedger(l)}
                              title="Delete Ledger"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRIAL BALANCE                                     */}
      {/* ======================================================== */}
      {activeMainTab === 'trial_balance' && (
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Trial Balance Statement</h3>
                <Badge variant="purple">Live Aggregated</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed dynamically from all active general ledgers. Enforces strict double-entry equality (Debit = Credit).
              </p>
            </div>
            <div className="flex items-center gap-2">
              {trialBalanceData.isBalanced ? (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Double-Entry Balanced: Difference ₹0.00
                </span>
              ) : (
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  Imbalance Detected: ₹{Math.abs(trialBalanceData.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCurrentTab}
                className="text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Particulars (Account Ledger)</th>
                  <th className="py-2.5 px-3">Account Group</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {trialBalanceData.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.code}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      <button
                        onClick={() => {
                          setSelectedLedger(item);
                          setIsStatementDrawerOpen(true);
                        }}
                        className="hover:underline text-left"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">{item.groupName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-mono font-bold text-sm">
                <tr>
                  <td colSpan={3} className="py-3 px-3 uppercase text-slate-900 font-sans tracking-wide">
                    Grand Total
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900">
                    ₹{trialBalanceData.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900">
                    ₹{trialBalanceData.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PROFIT & LOSS ACCOUNT (100% DYNAMIC)             */}
      {/* ======================================================== */}
      {activeMainTab === 'pnl' && (
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Profit & Loss Account (P&L)</h3>
                <Badge variant="purple">Dynamic Real-time</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically categorized from all live Revenue & Expense ledgers. Zero hardcoded amounts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCurrentTab}
              className="text-slate-700"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export P&L CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Direct Production & Operating Expenses */}
            <div className="space-y-6">
              {/* Direct Expenses */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2 flex justify-between items-center text-[#690BA8]">
                  <span>Direct Production Expenses</span>
                  <span className="font-mono text-base">
                    ₹{pnlData.directExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </h4>
                {pnlData.directExpenseGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No direct production expense ledgers recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {pnlData.directExpenseGroups.map((group) => (
                      <div key={group.groupName} className="space-y-1">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {group.groupName}
                        </div>
                        <div className="pl-2 space-y-1 text-xs">
                          {group.ledgers.map((l) => (
                            <div key={l.id} className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                                {l.name}
                              </span>
                              <span className="font-mono font-semibold text-slate-800">
                                ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Indirect Expenses */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2 flex justify-between items-center text-slate-700">
                  <span>Indirect & Administrative Expenses</span>
                  <span className="font-mono text-base">
                    ₹{pnlData.indirectExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </h4>
                {pnlData.indirectExpenseGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No indirect operating expense ledgers recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {pnlData.indirectExpenseGroups.map((group) => (
                      <div key={group.groupName} className="space-y-1">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {group.groupName}
                        </div>
                        <div className="pl-2 space-y-1 text-xs">
                          {group.ledgers.map((l) => (
                            <div key={l.id} className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                                {l.name}
                              </span>
                              <span className="font-mono font-semibold text-slate-800">
                                ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Operating Revenue & Net Profit Calculation */}
            <div className="space-y-6">
              {/* Revenue */}
              <div className="space-y-3">
                <h4 className="font-bold text-emerald-800 text-sm border-b pb-2 flex justify-between items-center">
                  <span>Operating Revenue & Book Sales</span>
                  <span className="font-mono text-base text-emerald-700">
                    ₹{pnlData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </h4>
                {pnlData.revenueGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No revenue ledgers recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {pnlData.revenueGroups.map((group) => (
                      <div key={group.groupName} className="space-y-1">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {group.groupName}
                        </div>
                        <div className="pl-2 space-y-1 text-xs">
                          {group.ledgers.map((l) => (
                            <div key={l.id} className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                                {l.name}
                              </span>
                              <span className="font-mono font-semibold text-emerald-800">
                                ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Summary Box */}
              <div
                className="p-5 rounded-xl border space-y-3 shadow-sm"
                style={{
                  backgroundColor: `${brand.primaryColor}08`,
                  borderColor: `${brand.primaryColor}30`,
                }}
              >
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Total Operating Revenue:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    ₹{pnlData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Less: Direct Production Costs:</span>
                  <span className="font-mono font-bold text-slate-800">
                    (₹{pnlData.directExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between text-base border-t border-slate-200 pt-2 font-bold">
                  <span style={{ color: brand.primaryColor }}>Gross Profit:</span>
                  <span className="font-mono font-extrabold" style={{ color: brand.primaryColor }}>
                    ₹{pnlData.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Less: Indirect & Overhead Expenses:</span>
                  <span className="font-mono font-bold text-slate-800">
                    (₹{pnlData.indirectExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between text-lg border-t-2 border-slate-300 pt-3 font-extrabold">
                  <span className="text-slate-900">Net Profit (Before Tax):</span>
                  <span className="font-mono text-emerald-700">
                    ₹{pnlData.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BALANCE SHEET (100% DYNAMIC)                      */}
      {/* ======================================================== */}
      {activeMainTab === 'balance_sheet' && (
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Balance Sheet</h3>
                <Badge variant="purple">Accounting Equation (A = L + E)</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statement of financial position aggregated dynamically across all Asset, Liability, and Equity ledgers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {balanceSheetData.isBalanced ? (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Balanced: Difference ₹0.00
                </span>
              ) : (
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  Difference: ₹{Math.abs(balanceSheetData.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCurrentTab}
                className="text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Liabilities & Equity */}
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 text-base border-b pb-2 flex justify-between items-center" style={{ color: brand.primaryColor }}>
                <span>Liabilities & Equity</span>
                <span className="font-mono text-slate-900 text-sm">
                  ₹{balanceSheetData.totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </h4>

              {/* Liabilities Groups */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Liabilities & Borrowings:
                </div>
                {balanceSheetData.liabilityGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No liability ledgers recorded.</p>
                ) : (
                  balanceSheetData.liabilityGroups.map((group) => (
                    <div key={group.groupName} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{group.groupName}</span>
                        <span className="font-mono font-bold">
                          ₹{group.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="pl-3 space-y-1 text-xs">
                        {group.ledgers.map((l) => (
                          <div key={l.id} className="flex justify-between text-slate-500 py-0.5">
                            <span className="hover:text-slate-800 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                              {l.name}
                            </span>
                            <span className="font-mono font-medium">
                              ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Equity Groups + P&L Integration */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Shareholders Equity & Retained Earnings:
                </div>
                {balanceSheetData.equityGroups.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{group.groupName}</span>
                      <span className="font-mono font-bold">
                        ₹{group.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="pl-3 space-y-1 text-xs">
                      {group.ledgers.map((l) => (
                        <div key={l.id} className="flex justify-between text-slate-500 py-0.5">
                          <span className="hover:text-slate-800 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                            {l.name}
                          </span>
                          <span className="font-mono font-medium">
                            ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Dynamic Net Profit Injection into Equity */}
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Current Period Net Profit (From P&L):</span>
                  <span className="font-mono font-extrabold text-emerald-800">
                    ₹{balanceSheetData.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Total Liabilities & Equity Box */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between font-bold text-sm">
                <span className="text-slate-900">Total Liabilities & Equity:</span>
                <span className="font-mono text-slate-900 font-extrabold">
                  ₹{balanceSheetData.totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Right Column: Assets */}
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 text-base border-b pb-2 flex justify-between items-center" style={{ color: brand.primaryColor }}>
                <span>Assets</span>
                <span className="font-mono text-slate-900 text-sm">
                  ₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </h4>

              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Current & Non-Current Assets:
                </div>
                {balanceSheetData.assetGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No asset ledgers recorded.</p>
                ) : (
                  balanceSheetData.assetGroups.map((group) => (
                    <div key={group.groupName} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{group.groupName}</span>
                        <span className="font-mono font-bold">
                          ₹{group.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="pl-3 space-y-1 text-xs">
                        {group.ledgers.map((l) => (
                          <div key={l.id} className="flex justify-between text-slate-500 py-0.5">
                            <span className="hover:text-slate-800 cursor-pointer" onClick={() => { setSelectedLedger(l); setIsStatementDrawerOpen(true); }}>
                              {l.name}
                            </span>
                            <span className="font-mono font-medium">
                              ₹{l.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Assets Box */}
              <div
                className="p-3 rounded-lg border flex justify-between font-bold text-sm"
                style={{
                  backgroundColor: `${brand.primaryColor}10`,
                  borderColor: `${brand.primaryColor}40`,
                  color: brand.primaryColor,
                }}
              >
                <span>Total Assets:</span>
                <span className="font-mono font-extrabold">
                  ₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 5: COST CENTRE ACCOUNTING (100% DYNAMIC)             */}
      {/* ======================================================== */}
      {activeMainTab === 'cost_centres' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Centres</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{costCentres.length}</div>
              <span className="text-[11px] text-slate-400">Editorial, Prod, Sales, WH, Admin</span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Allocated Budget</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{costCentresSummary.totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">Total departmental budgets</span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Actual Cost Incurred</span>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                ₹{costCentresSummary.totalActualSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">
                {costCentresSummary.utilizationPct.toFixed(1)}% of budget utilized
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Profit Centres Generated</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                ₹{costCentresSummary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">Sales & distribution divisions</span>
            </Card>
          </div>

          {/* Cost Centres Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costCentres.map((cc) => {
              const utilPct = cc.allocatedBudget > 0 ? (cc.actualAmount / cc.allocatedBudget) * 100 : 0;
              const isProfitCentre = cc.type === 'PROFIT' || cc.type === 'REVENUE';

              return (
                <Card key={cc.id} className="p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {cc.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant={isProfitCentre ? 'success' : 'purple'}>
                          {cc.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-700 p-1 h-auto"
                          onClick={() => handleOpenEditCostCentre(cc)}
                          title="Edit Cost Centre"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-rose-600 p-1 h-auto"
                          onClick={() => handleDeleteCostCentre(cc)}
                          title="Delete Cost Centre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-2">{cc.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cc.description || 'No description provided.'}</p>
                    <div className="text-xs text-slate-600 font-medium mt-2">
                      Division Lead: <strong className="text-slate-800">{cc.managerName || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Allocated Budget:</span>
                      <span className="font-mono font-semibold text-slate-700">
                        ₹{cc.allocatedBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-bold">
                      <span className={isProfitCentre ? 'text-emerald-700' : 'text-slate-800'}>
                        {isProfitCentre ? 'Net Revenue:' : 'Actual Incurred:'}
                      </span>
                      <span className={`font-mono ${isProfitCentre ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}`}>
                        ₹{cc.actualAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Budget Utilization Bar */}
                    {!isProfitCentre && cc.allocatedBudget > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              utilPct > 90 ? 'bg-rose-500' : utilPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(utilPct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Utilization: {utilPct.toFixed(1)}%</span>
                          <span>Remaining: ₹{Math.max(0, cc.allocatedBudget - cc.actualAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER: GENERAL LEDGER STATEMENT                         */}
      {/* ======================================================== */}
      <Drawer
        isOpen={isStatementDrawerOpen}
        onClose={() => {
          setIsStatementDrawerOpen(false);
          setIsAddingEntryInline(false);
        }}
        title={selectedLedger ? `Ledger Statement: ${selectedLedger.name}` : 'General Ledger Statement'}
        width="xl"
      >
        {selectedLedger && (
          <div className="space-y-4">
            {/* Header Summary */}
            <div
              className="p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3 shadow-sm"
              style={{
                backgroundColor: `${brand.primaryColor}08`,
                borderColor: `${brand.primaryColor}25`,
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedLedger.code}</span>
                  <Badge variant="purple">{selectedLedger.classification}</Badge>
                  {selectedLedger.isBankOrCash && (
                    <Badge variant="slate">{selectedLedger.bankName ? 'Bank' : 'Cash'}</Badge>
                  )}
                </div>
                <p className="text-slate-600 font-medium mt-1">{selectedLedger.groupName}</p>
                {selectedLedger.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-400">
                    A/c: {selectedLedger.accountNumber} | IFSC: {selectedLedger.ifscCode}
                  </p>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 block text-[11px]">Closing Realized Balance:</span>
                <span className="font-mono font-extrabold text-lg text-slate-900">
                  ₹{selectedLedger.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-bold text-purple-700">
                    {selectedLedger.isDebitBalance ? 'Dr' : 'Cr'}
                  </span>
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingEntryInline(!isAddingEntryInline)}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {isAddingEntryInline ? 'Close Form' : 'Record Voucher / Entry'}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStatementCsv}
                className="text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Statement CSV
              </Button>
            </div>

            {/* Inline Quick Entry Form */}
            {isAddingEntryInline && (
              <form onSubmit={handleAddInlineStatementEntry} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-800 text-xs flex justify-between">
                  <span>Record Transaction Entry into {selectedLedger.name}</span>
                  <button type="button" onClick={() => setIsAddingEntryInline(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1">Date</label>
                    <Input
                      type="date"
                      value={newEntryForm.date}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Voucher Number</label>
                    <Input
                      value={newEntryForm.voucherNumber}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, voucherNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Voucher Type</label>
                    <select
                      className="w-full h-10 px-2 rounded-lg border border-slate-300 bg-white"
                      value={newEntryForm.voucherType}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, voucherType: e.target.value as any })}
                    >
                      <option value="JOURNAL">Journal Voucher</option>
                      <option value="PAYMENT">Bank Payment</option>
                      <option value="RECEIPT">Bank Receipt</option>
                      <option value="CONTRA">Contra (Bank / Cash)</option>
                      <option value="SALES">Sales Invoice</option>
                      <option value="PURCHASE">Purchase Bill</option>
                      <option value="ROYALTY">Royalty Accrual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Opposing Ledger</label>
                    <Input
                      placeholder="e.g. Ballarpur Paper Mills"
                      value={newEntryForm.opposingLedgerName}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, opposingLedgerName: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 block mb-1">Narration / Particulars</label>
                    <Input
                      placeholder="e.g. Monthly settlement of invoices"
                      value={newEntryForm.narration}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, narration: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Debit Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newEntryForm.debit || ''}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, debit: Number(e.target.value), credit: 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Credit Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newEntryForm.credit || ''}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, credit: Number(e.target.value), debit: 0 })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingEntryInline(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" style={{ backgroundColor: brand.primaryColor }} className="text-white">
                    Post to Ledger
                  </Button>
                </div>
              </form>
            )}

            {/* Entries Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Particulars / Narration</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStatementEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600">{entry.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-purple-700">{entry.voucherNumber}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        {entry.opposingLedgerName && (
                          <span className="font-semibold block text-slate-900">To/By: {entry.opposingLedgerName}</span>
                        )}
                        <span className="text-slate-500 text-[11px]">{entry.narration}</span>
                        {entry.costCentreName && (
                          <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                            {entry.costCentreName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900">
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{entry.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                        <span className="text-[10px] text-purple-700">{entry.isDebit ? 'Dr' : 'Cr'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT ACCOUNT LEDGER                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        title={editingLedgerId ? 'Edit Account Ledger' : 'Create New Account Ledger'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveLedger} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Account Code" required>
              <Input
                placeholder="e.g. 1045"
                value={ledgerForm.code}
                onChange={(e) => setLedgerForm({ ...ledgerForm, code: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Account Ledger Name" required>
              <Input
                placeholder="e.g. ICICI Bank Operative Current A/c"
                value={ledgerForm.name}
                onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Account Group" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={ledgerForm.groupName}
                onChange={(e) => {
                  const grp = STANDARD_ACCOUNT_GROUPS.find((g) => g.name === e.target.value);
                  setLedgerForm({
                    ...ledgerForm,
                    groupName: e.target.value,
                    classification: grp ? grp.classification : ledgerForm.classification,
                  });
                }}
              >
                {STANDARD_ACCOUNT_GROUPS.map((grp) => (
                  <option key={grp.name} value={grp.name}>
                    {grp.name} ({grp.classification})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Classification" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={ledgerForm.classification}
                onChange={(e) =>
                  setLedgerForm({
                    ...ledgerForm,
                    classification: e.target.value as AccountClassification,
                    isDebitBalance: e.target.value === 'ASSET' || e.target.value === 'EXPENSE',
                  })
                }
              >
                <option value="ASSET">ASSET (Normal Debit)</option>
                <option value="LIABILITY">LIABILITY (Normal Credit)</option>
                <option value="EQUITY">EQUITY (Normal Credit)</option>
                <option value="REVENUE">REVENUE (Normal Credit)</option>
                <option value="EXPENSE">EXPENSE (Normal Debit)</option>
              </select>
            </FormField>

            <FormField label="Opening Balance (₹)">
              <Input
                type="number"
                placeholder="0.00"
                value={ledgerForm.openingBalance}
                onChange={(e) =>
                  setLedgerForm({
                    ...ledgerForm,
                    openingBalance: Number(e.target.value),
                    currentBalance: editingLedgerId ? ledgerForm.currentBalance : Number(e.target.value),
                  })
                }
              />
            </FormField>

            {editingLedgerId && (
              <FormField label="Current Balance (₹)">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={ledgerForm.currentBalance}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, currentBalance: Number(e.target.value) })}
                />
              </FormField>
            )}

            <div className="md:col-span-2 pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="checkbox"
                id="isBankOrCashCheckbox"
                checked={ledgerForm.isBankOrCash}
                onChange={(e) => setLedgerForm({ ...ledgerForm, isBankOrCash: e.target.checked })}
                className="rounded border-slate-300 text-purple-700 w-4 h-4"
              />
              <label htmlFor="isBankOrCashCheckbox" className="text-sm font-semibold text-slate-800">
                Is Bank or Cash Account
              </label>
            </div>

            {ledgerForm.isBankOrCash && (
              <>
                <FormField label="Bank Institution Name">
                  <Input
                    placeholder="e.g. Kotak Mahindra Bank"
                    value={ledgerForm.bankName}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, bankName: e.target.value })}
                  />
                </FormField>
                <FormField label="Account Number">
                  <Input
                    placeholder="e.g. 50200012345678"
                    value={ledgerForm.accountNumber}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, accountNumber: e.target.value })}
                  />
                </FormField>
                <FormField label="IFSC Code">
                  <Input
                    placeholder="e.g. KKBK0000180"
                    value={ledgerForm.ifscCode}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, ifscCode: e.target.value })}
                  />
                </FormField>
                <FormField label="Branch Location">
                  <Input
                    placeholder="e.g. Connaught Place Branch"
                    value={ledgerForm.branchName}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, branchName: e.target.value })}
                  />
                </FormField>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsLedgerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingLedgerId ? 'Save Changes' : 'Create Ledger'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT COST CENTRE                         */}
      {/* ======================================================== */}
      <Modal
        isOpen={isCostCentreModalOpen}
        onClose={() => setIsCostCentreModalOpen(false)}
        title={editingCostCentreId ? 'Edit Cost Centre' : 'Create New Cost Centre'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCostCentre} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cost Centre Code" required>
              <Input
                placeholder="e.g. CC-DIGITAL"
                value={costCentreForm.code}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, code: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Type" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                value={costCentreForm.type}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, type: e.target.value as any })}
              >
                <option value="COST">Cost Centre (Expense Tracking)</option>
                <option value="PROFIT">Profit Centre (Revenue Tracking)</option>
                <option value="REVENUE">Revenue Division</option>
              </select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Cost Centre / Division Name" required>
                <Input
                  placeholder="e.g. Digital eBook Publishing & Audiobooks"
                  value={costCentreForm.name}
                  onChange={(e) => setCostCentreForm({ ...costCentreForm, name: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Category">
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                value={costCentreForm.category}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, category: e.target.value as any })}
              >
                <option value="EDITORIAL">Editorial & Authors</option>
                <option value="PRODUCTION">Production & Printing</option>
                <option value="SALES">Sales & Distribution</option>
                <option value="LOGISTICS">Logistics & Godown</option>
                <option value="ADMIN">Corporate Administration</option>
                <option value="OTHER">Other Auxiliary</option>
              </select>
            </FormField>

            <FormField label="Division Manager">
              <Input
                placeholder="e.g. Anand Mahindra"
                value={costCentreForm.managerName}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, managerName: e.target.value })}
              />
            </FormField>

            <FormField label="Allocated Budget (₹)">
              <Input
                type="number"
                placeholder="0.00"
                value={costCentreForm.allocatedBudget}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, allocatedBudget: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Actual Amount Incurred/Generated (₹)">
              <Input
                type="number"
                placeholder="0.00"
                value={costCentreForm.actualAmount}
                onChange={(e) => setCostCentreForm({ ...costCentreForm, actualAmount: Number(e.target.value) })}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Description">
                <Input
                  placeholder="e.g. Digital rights licensing and streaming royalties"
                  value={costCentreForm.description}
                  onChange={(e) => setCostCentreForm({ ...costCentreForm, description: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCostCentreModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingCostCentreId ? 'Save Cost Centre' : 'Create Cost Centre'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChartOfAccountsPage;
