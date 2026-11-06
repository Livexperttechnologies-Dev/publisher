export type AccountClassification = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface LedgerItem {
  id: string;
  code: string;
  name: string;
  groupName: string;
  classification: AccountClassification;
  openingBalance: number;
  currentBalance: number;
  isDebitBalance: boolean;
  isBankOrCash: boolean;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  description?: string;
  costCentreId?: string;
  isActive: boolean;
}

export interface CostCentreItem {
  id: string;
  code: string;
  name: string;
  type: 'COST' | 'PROFIT' | 'REVENUE';
  category: 'EDITORIAL' | 'PRODUCTION' | 'SALES' | 'LOGISTICS' | 'ADMIN' | 'OTHER';
  managerName: string;
  allocatedBudget: number;
  actualAmount: number;
  description: string;
  isActive: boolean;
}

export interface StatementEntry {
  id: string;
  ledgerId: string;
  date: string;
  voucherNumber: string;
  voucherType: 'OPENING' | 'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'SALES' | 'PURCHASE' | 'JOURNAL' | 'ROYALTY';
  narration: string;
  opposingLedgerName?: string;
  costCentreName?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  isDebit: boolean;
}

export interface AccountGroupOption {
  name: string;
  classification: AccountClassification;
  isDirectExpense?: boolean;
}

export const STANDARD_ACCOUNT_GROUPS: AccountGroupOption[] = [
  // Assets
  { name: 'Cash and Bank Balances', classification: 'ASSET' },
  { name: 'Accounts Receivable (Trade Debtors)', classification: 'ASSET' },
  { name: 'Inventories (Finished Books & Paper)', classification: 'ASSET' },
  { name: 'Loans & Advances (Author Advances)', classification: 'ASSET' },
  { name: 'Fixed Assets & Printing Machinery', classification: 'ASSET' },
  { name: 'Prepaid Expenses & Deposits', classification: 'ASSET' },

  // Liabilities
  { name: 'Accounts Payable (Trade Creditors)', classification: 'LIABILITY' },
  { name: 'Duties & Taxes (GST & TDS Payable)', classification: 'LIABILITY' },
  { name: 'Author Royalty Accrued & Payable', classification: 'LIABILITY' },
  { name: 'Bank Borrowings & Term Loans', classification: 'LIABILITY' },
  { name: 'Outstanding Operational Expenses', classification: 'LIABILITY' },

  // Equity
  { name: 'Shareholders Equity & Capital', classification: 'EQUITY' },
  { name: 'Retained Earnings & Reserves', classification: 'EQUITY' },

  // Revenue
  { name: 'Book Sales & Publishing Revenue', classification: 'REVENUE' },
  { name: 'Digital & eBook Licensing Income', classification: 'REVENUE' },
  { name: 'Educational Institution Supplies', classification: 'REVENUE' },
  { name: 'Other Operating Income & Scrap Sales', classification: 'REVENUE' },

  // Expense
  { name: 'Direct Production Expenses (Paper & Printing)', classification: 'EXPENSE', isDirectExpense: true },
  { name: 'Author Royalty Expenses', classification: 'EXPENSE', isDirectExpense: true },
  { name: 'Warehouse & Logistics Expenses', classification: 'EXPENSE', isDirectExpense: false },
  { name: 'Sales, Marketing & Distributor Commissions', classification: 'EXPENSE', isDirectExpense: false },
  { name: 'Administrative & Office Expenses', classification: 'EXPENSE', isDirectExpense: false },
  { name: 'Depreciation & Amortization', classification: 'EXPENSE', isDirectExpense: false },
];

export const INITIAL_LEDGERS: LedgerItem[] = [
  // Assets
  {
    id: 'led_cash',
    code: '1001',
    name: 'Cash in Hand (Central Cashier)',
    groupName: 'Cash and Bank Balances',
    classification: 'ASSET',
    openingBalance: 500000,
    currentBalance: 300000,
    isDebitBalance: true,
    isBankOrCash: true,
    branchName: 'Delhi HQ',
    isActive: true,
  },
  {
    id: 'led_bank_hdfc',
    code: '1002',
    name: 'HDFC Bank Corporate Current A/c',
    groupName: 'Cash and Bank Balances',
    classification: 'ASSET',
    openingBalance: 3500000,
    currentBalance: 3350000,
    isDebitBalance: true,
    isBankOrCash: true,
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '918010045678912',
    ifscCode: 'HDFC0000053',
    branchName: 'Daryaganj Branch',
    isActive: true,
  },
  {
    id: 'led_bank_sbi',
    code: '1003',
    name: 'State Bank of India Operative A/c',
    groupName: 'Cash and Bank Balances',
    classification: 'ASSET',
    openingBalance: 1200000,
    currentBalance: 1790000,
    isDebitBalance: true,
    isBankOrCash: true,
    bankName: 'State Bank of India',
    accountNumber: '10892345098',
    ifscCode: 'SBIN0000691',
    branchName: 'Chandni Chowk Branch',
    isActive: true,
  },
  {
    id: 'led_debtors',
    code: '1010',
    name: 'Trade Debtors - Wholesale & Retail Distributors',
    groupName: 'Accounts Receivable (Trade Debtors)',
    classification: 'ASSET',
    openingBalance: 2500000,
    currentBalance: 2500000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_inv_books',
    code: '1020',
    name: 'Inventory of Finished Bound Books',
    groupName: 'Inventories (Finished Books & Paper)',
    classification: 'ASSET',
    openingBalance: 4800000,
    currentBalance: 4800000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_inv_paper',
    code: '1021',
    name: 'Raw Paper Reels & Maplitho Inventory',
    groupName: 'Inventories (Finished Books & Paper)',
    classification: 'ASSET',
    openingBalance: 1800000,
    currentBalance: 1800000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_author_advances',
    code: '1050',
    name: 'Unadjusted Advances to Authors',
    groupName: 'Loans & Advances (Author Advances)',
    classification: 'ASSET',
    openingBalance: 450000,
    currentBalance: 360000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },

  // Liabilities
  {
    id: 'led_creditors',
    code: '2001',
    name: 'Trade Creditors - Paper Mills & Printers',
    groupName: 'Accounts Payable (Trade Creditors)',
    classification: 'LIABILITY',
    openingBalance: 2200000,
    currentBalance: 2200000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_gst_payable',
    code: '2010',
    name: 'GST Payable Account (Output GST)',
    groupName: 'Duties & Taxes (GST & TDS Payable)',
    classification: 'LIABILITY',
    openingBalance: 180000,
    currentBalance: 180000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_tds_payable',
    code: '2020',
    name: 'TDS Payable (Sec 194J on Royalties)',
    groupName: 'Duties & Taxes (GST & TDS Payable)',
    classification: 'LIABILITY',
    openingBalance: 45000,
    currentBalance: 55000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_bank_loan',
    code: '2030',
    name: 'Working Capital Term Loan - HDFC Bank',
    groupName: 'Bank Borrowings & Term Loans',
    classification: 'LIABILITY',
    openingBalance: 2000000,
    currentBalance: 2000000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },

  // Revenue
  {
    id: 'led_book_sales',
    code: '3001',
    name: 'Book Sales - Academic & School Textbooks',
    groupName: 'Book Sales & Publishing Revenue',
    classification: 'REVENUE',
    openingBalance: 0,
    currentBalance: 590000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_licensing_income',
    code: '3010',
    name: 'Publishing Rights & Content Licensing Income',
    groupName: 'Digital & eBook Licensing Income',
    classification: 'REVENUE',
    openingBalance: 0,
    currentBalance: 85000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },

  // Expenses
  {
    id: 'led_paper_purchase',
    code: '4001',
    name: 'Paper Reel & Printing Materials Purchase',
    groupName: 'Direct Production Expenses (Paper & Printing)',
    classification: 'EXPENSE',
    openingBalance: 0,
    currentBalance: 350000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_royalty_exp',
    code: '4050',
    name: 'Author Royalty Expenses',
    groupName: 'Author Royalty Expenses',
    classification: 'EXPENSE',
    openingBalance: 0,
    currentBalance: 100000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_logistics_exp',
    code: '4060',
    name: 'Depot Freight & Shipping Inward/Outward',
    groupName: 'Warehouse & Logistics Expenses',
    classification: 'EXPENSE',
    openingBalance: 0,
    currentBalance: 45000,
    isDebitBalance: true,
    isBankOrCash: false,
    isActive: true,
  },

  // Equity
  {
    id: 'led_share_capital',
    code: '5001',
    name: 'Paid-up Equity Share Capital',
    groupName: 'Shareholders Equity & Capital',
    classification: 'EQUITY',
    openingBalance: 10000000,
    currentBalance: 10000000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
  {
    id: 'led_retained_earnings',
    code: '5002',
    name: 'Retained Earnings & Reserves',
    groupName: 'Shareholders Equity & Capital',
    classification: 'EQUITY',
    openingBalance: 325000,
    currentBalance: 325000,
    isDebitBalance: false,
    isBankOrCash: false,
    isActive: true,
  },
];

export const INITIAL_COST_CENTRES: CostCentreItem[] = [
  {
    id: 'cc_edit',
    code: 'CC-EDIT',
    name: 'Author Contracts & Editorial Desk',
    type: 'COST',
    category: 'EDITORIAL',
    managerName: 'Dr. Sunita Deshmukh',
    allocatedBudget: 250000,
    actualAmount: 100000,
    description: 'Manuscript acquisitions, copyright permissions, proofreading, and author royalty settlements.',
    isActive: true,
  },
  {
    id: 'cc_prod',
    code: 'CC-PROD',
    name: 'Book Printing & Pre-Press Production',
    type: 'COST',
    category: 'PRODUCTION',
    managerName: 'Rajeshwar Sharma',
    allocatedBudget: 600000,
    actualAmount: 350000,
    description: 'Paper reel procurement, plate making, 4-colour offset machine runs, laminations, and binding.',
    isActive: true,
  },
  {
    id: 'cc_sales',
    code: 'CC-SALES',
    name: 'Wholesale Trade & Distribution Sales',
    type: 'PROFIT',
    category: 'SALES',
    managerName: 'Vikramaditya Roy',
    allocatedBudget: 150000,
    actualAmount: 675000,
    description: 'National book wholesale distributor network, bookstore merchandising, institutional textbook supplies.',
    isActive: true,
  },
  {
    id: 'cc_wh',
    code: 'CC-WH',
    name: 'Delhi Central Godown & Logistics',
    type: 'COST',
    category: 'LOGISTICS',
    managerName: 'Mahesh Goud',
    allocatedBudget: 100000,
    actualAmount: 45000,
    description: 'Pallet racking, warehouse safety, packaging boxes, courier dispatch, and stock dispatch tracking.',
    isActive: true,
  },
  {
    id: 'cc_admin',
    code: 'CC-ADMIN',
    name: 'Corporate HQ Administration & Finance',
    type: 'COST',
    category: 'ADMIN',
    managerName: 'Priya Narang',
    allocatedBudget: 120000,
    actualAmount: 38000,
    description: 'Statutory compliance, GST & audit filing, IT systems, ERP infrastructure, and legal counsel.',
    isActive: true,
  },
];

export const INITIAL_STATEMENT_ENTRIES: Record<string, StatementEntry[]> = {
  led_bank_hdfc: [
    {
      id: 'stmt_hdfc_1',
      ledgerId: 'led_bank_hdfc',
      date: '2026-11-01',
      voucherNumber: 'OB/2026/0001',
      voucherType: 'OPENING',
      narration: 'Opening balance brought forward from previous period',
      debit: 3500000,
      credit: 0,
      runningBalance: 3500000,
      isDebit: true,
    },
    {
      id: 'stmt_hdfc_2',
      ledgerId: 'led_bank_hdfc',
      date: '2026-11-03',
      voucherNumber: 'CV/2026/0001',
      voucherType: 'CONTRA',
      narration: 'Cash chest physical deposit into HDFC Corporate A/c',
      opposingLedgerName: 'Cash in Hand (Central Cashier)',
      debit: 200000,
      credit: 0,
      runningBalance: 3700000,
      isDebit: true,
    },
    {
      id: 'stmt_hdfc_3',
      ledgerId: 'led_bank_hdfc',
      date: '2026-11-04',
      voucherNumber: 'PV/2026/0001',
      voucherType: 'PAYMENT',
      narration: 'NEFT payment for Ballarpur Paper Mills paper reel invoice',
      opposingLedgerName: 'Trade Creditors - Paper Mills & Printers',
      costCentreName: 'Book Printing & Pre-Press Production',
      debit: 0,
      credit: 350000,
      runningBalance: 3350000,
      isDebit: true,
    },
    {
      id: 'stmt_hdfc_4',
      ledgerId: 'led_bank_hdfc',
      date: '2026-11-05',
      voucherNumber: 'RV/2026/0014',
      voucherType: 'RECEIPT',
      narration: 'RTGS clearance from Oxford Book Store & Distributors Ltd',
      opposingLedgerName: 'Trade Debtors - Wholesale & Retail Distributors',
      costCentreName: 'Wholesale Trade & Distribution Sales',
      debit: 342500,
      credit: 0,
      runningBalance: 3692500,
      isDebit: true,
    },
  ],
  led_cash: [
    {
      id: 'stmt_cash_1',
      ledgerId: 'led_cash',
      date: '2026-11-01',
      voucherNumber: 'OB/2026/0002',
      voucherType: 'OPENING',
      narration: 'Central cashier physical vault balance',
      debit: 500000,
      credit: 0,
      runningBalance: 500000,
      isDebit: true,
    },
    {
      id: 'stmt_cash_2',
      ledgerId: 'led_cash',
      date: '2026-11-03',
      voucherNumber: 'CV/2026/0001',
      voucherType: 'CONTRA',
      narration: 'Cash deposited into HDFC Corporate Account',
      opposingLedgerName: 'HDFC Bank Corporate Current A/c',
      debit: 0,
      credit: 200000,
      runningBalance: 300000,
      isDebit: true,
    },
  ],
  led_book_sales: [
    {
      id: 'stmt_sales_1',
      ledgerId: 'led_book_sales',
      date: '2026-11-02',
      voucherNumber: 'SI/2026/0891',
      voucherType: 'SALES',
      narration: 'Academic syllabus textbook supply to Oxford Book Store & Distributors Ltd',
      opposingLedgerName: 'Trade Debtors - Wholesale & Retail Distributors',
      costCentreName: 'Wholesale Trade & Distribution Sales',
      debit: 0,
      credit: 342500,
      runningBalance: 342500,
      isDebit: false,
    },
    {
      id: 'stmt_sales_2',
      ledgerId: 'led_book_sales',
      date: '2026-11-04',
      voucherNumber: 'SI/2026/0892',
      voucherType: 'SALES',
      narration: 'School Library Mathematics Reference Series direct supply',
      opposingLedgerName: 'Trade Debtors - Wholesale & Retail Distributors',
      costCentreName: 'Wholesale Trade & Distribution Sales',
      debit: 0,
      credit: 247500,
      runningBalance: 590000,
      isDebit: false,
    },
  ],
};

const LEDGERS_KEY = 'kibo360_coa_ledgers_v2';
const COST_CENTRES_KEY = 'kibo360_cost_centres_v2';
const STATEMENTS_KEY = 'kibo360_ledger_statements_v2';

// Ledgers Storage Helpers
export function getStoredLedgers(): LedgerItem[] {
  try {
    const raw = localStorage.getItem(LEDGERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredLedgers(INITIAL_LEDGERS);
  return INITIAL_LEDGERS;
}

export function saveStoredLedgers(ledgers: LedgerItem[]): void {
  try {
    localStorage.setItem(LEDGERS_KEY, JSON.stringify(ledgers));
  } catch {}
}

export function saveLedgerItem(ledger: Partial<LedgerItem> & { name: string; code: string; groupName: string; classification: AccountClassification }): LedgerItem {
  const current = getStoredLedgers();
  const isDebitBalance =
    ledger.classification === 'ASSET' || ledger.classification === 'EXPENSE';

  if (ledger.id) {
    const updated = current.map((item) =>
      item.id === ledger.id
        ? {
            ...item,
            ...ledger,
            currentBalance: Number(ledger.currentBalance ?? ledger.openingBalance ?? item.currentBalance),
            openingBalance: Number(ledger.openingBalance ?? item.openingBalance),
            isDebitBalance,
          }
        : item
    );
    saveStoredLedgers(updated);
    return updated.find((i) => i.id === ledger.id)!;
  } else {
    const newId = 'led_' + Date.now();
    const created: LedgerItem = {
      id: newId,
      code: ledger.code,
      name: ledger.name,
      groupName: ledger.groupName,
      classification: ledger.classification,
      openingBalance: Number(ledger.openingBalance) || 0,
      currentBalance: Number(ledger.openingBalance) || 0,
      isDebitBalance,
      isBankOrCash: Boolean(ledger.isBankOrCash),
      bankName: ledger.bankName,
      accountNumber: ledger.accountNumber,
      ifscCode: ledger.ifscCode,
      branchName: ledger.branchName,
      description: ledger.description,
      isActive: true,
    };
    saveStoredLedgers([...current, created]);
    return created;
  }
}

export function deleteLedgerItem(id: string): { success: boolean; message: string } {
  const current = getStoredLedgers();
  const target = current.find((l) => l.id === id);
  if (!target) return { success: false, message: 'Ledger not found.' };

  // Safety check: protect system default core ledgers from accidental hard deletion
  const protectedCodes = ['1001', '1002', '5001'];
  if (protectedCodes.includes(target.code)) {
    return {
      success: false,
      message: `Account code ${target.code} (${target.name}) is a protected core system ledger and cannot be deleted.`,
    };
  }

  const filtered = current.filter((l) => l.id !== id);
  saveStoredLedgers(filtered);
  return { success: true, message: `Ledger "${target.name}" removed successfully.` };
}

export function toggleLedgerActive(id: string): LedgerItem | null {
  const current = getStoredLedgers();
  let updatedItem: LedgerItem | null = null;
  const updated = current.map((l) => {
    if (l.id === id) {
      updatedItem = { ...l, isActive: !l.isActive };
      return updatedItem;
    }
    return l;
  });
  if (updatedItem) saveStoredLedgers(updated);
  return updatedItem;
}

// Cost Centres Storage Helpers
export function getStoredCostCentres(): CostCentreItem[] {
  try {
    const raw = localStorage.getItem(COST_CENTRES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredCostCentres(INITIAL_COST_CENTRES);
  return INITIAL_COST_CENTRES;
}

export function saveStoredCostCentres(centres: CostCentreItem[]): void {
  try {
    localStorage.setItem(COST_CENTRES_KEY, JSON.stringify(centres));
  } catch {}
}

export function saveCostCentreItem(item: Partial<CostCentreItem> & { code: string; name: string }): CostCentreItem {
  const current = getStoredCostCentres();
  if (item.id) {
    const updated = current.map((c) =>
      c.id === item.id
        ? {
            ...c,
            ...item,
            allocatedBudget: Number(item.allocatedBudget ?? c.allocatedBudget),
            actualAmount: Number(item.actualAmount ?? c.actualAmount),
          }
        : c
    );
    saveStoredCostCentres(updated);
    return updated.find((c) => c.id === item.id)!;
  } else {
    const created: CostCentreItem = {
      id: 'cc_' + Date.now(),
      code: item.code,
      name: item.name,
      type: item.type || 'COST',
      category: item.category || 'OTHER',
      managerName: item.managerName || 'Division In-charge',
      allocatedBudget: Number(item.allocatedBudget) || 0,
      actualAmount: Number(item.actualAmount) || 0,
      description: item.description || '',
      isActive: true,
    };
    saveStoredCostCentres([...current, created]);
    return created;
  }
}

export function deleteCostCentreItem(id: string): void {
  const current = getStoredCostCentres();
  const filtered = current.filter((c) => c.id !== id);
  saveStoredCostCentres(filtered);
}

// Statements Storage & Dynamic Generation
export function getStatementsMap(): Record<string, StatementEntry[]> {
  try {
    const raw = localStorage.getItem(STATEMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_STATEMENT_ENTRIES;
}

export function saveStatementsMap(map: Record<string, StatementEntry[]>): void {
  try {
    localStorage.setItem(STATEMENTS_KEY, JSON.stringify(map));
  } catch {}
}

export function getLedgerStatementEntries(ledger: LedgerItem): StatementEntry[] {
  const map = getStatementsMap();
  if (map[ledger.id] && map[ledger.id].length > 0) {
    return map[ledger.id];
  }

  // Synthesize realistic chronological statement if not explicitly seeded
  const entries: StatementEntry[] = [
    {
      id: `stmt_${ledger.id}_ob`,
      ledgerId: ledger.id,
      date: '2026-11-01',
      voucherNumber: 'OB/2026/0001',
      voucherType: 'OPENING',
      narration: `Opening balance brought forward for ${ledger.name}`,
      debit: ledger.isDebitBalance ? ledger.openingBalance : 0,
      credit: !ledger.isDebitBalance ? ledger.openingBalance : 0,
      runningBalance: ledger.openingBalance,
      isDebit: ledger.isDebitBalance,
    },
  ];

  if (ledger.currentBalance !== ledger.openingBalance) {
    const diff = ledger.currentBalance - ledger.openingBalance;
    const isIncrease = diff > 0;
    entries.push({
      id: `stmt_${ledger.id}_tx`,
      ledgerId: ledger.id,
      date: '2026-11-04',
      voucherNumber: 'JV/2026/0442',
      voucherType: 'JOURNAL',
      narration: `Operational period postings and settlements`,
      opposingLedgerName: 'General Settlement / Operations A/c',
      debit: isIncrease ? Math.abs(diff) : 0,
      credit: !isIncrease ? Math.abs(diff) : 0,
      runningBalance: ledger.currentBalance,
      isDebit: ledger.isDebitBalance,
    });
  }

  return entries;
}

export function addStatementEntry(entry: Omit<StatementEntry, 'id' | 'runningBalance' | 'isDebit'>): StatementEntry {
  const map = getStatementsMap();
  const list = map[entry.ledgerId] || [];
  const ledgers = getStoredLedgers();
  const targetLedger = ledgers.find((l) => l.id === entry.ledgerId);
  const isDebitNormal = targetLedger ? targetLedger.isDebitBalance : true;

  const previousBalance = list.length > 0 ? list[list.length - 1].runningBalance : 0;
  const balanceDelta = isDebitNormal ? entry.debit - entry.credit : entry.credit - entry.debit;
  const newBalance = previousBalance + balanceDelta;

  const created: StatementEntry = {
    ...entry,
    id: 'stmt_' + Date.now(),
    runningBalance: Math.abs(newBalance),
    isDebit: newBalance >= 0 ? isDebitNormal : !isDebitNormal,
  };

  map[entry.ledgerId] = [...list, created];
  saveStatementsMap(map);

  // Also update ledger's current balance
  if (targetLedger) {
    saveLedgerItem({
      ...targetLedger,
      currentBalance: Math.abs(newBalance),
    });
  }

  return created;
}

// Utility: Export to CSV
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const content = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
