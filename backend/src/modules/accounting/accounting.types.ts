export type AccountClassification = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface AccountGroupItem {
  id: string;
  companyId: string;
  parentGroupId?: string;
  name: string;
  code: string;
  classification: AccountClassification;
  isSystemGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountLedgerItem {
  id: string;
  companyId: string;
  groupId: string;
  groupName: string;
  name: string;
  code: string;
  classification: AccountClassification;
  openingBalance: number;
  currentBalance: number;
  isDebitBalance: boolean; // True if normal balance is debit (Assets, Expenses), False if credit (Liabilities, Income, Equity)
  isBankOrCash: boolean;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  taxRegistration?: string;
  isReconciliationRequired: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VoucherType =
  | 'JOURNAL'
  | 'PAYMENT_VOUCHER'
  | 'RECEIPT_VOUCHER'
  | 'CONTRA_VOUCHER'
  | 'DEBIT_NOTE'
  | 'CREDIT_NOTE'
  | 'SALES_INVOICE'
  | 'PURCHASE_BILL'
  | 'ROYALTY_ACCRUAL';

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED' | 'REVERSED';

export interface JournalEntryItemDto {
  id?: string;
  ledgerId: string;
  ledgerName?: string;
  ledgerCode?: string;
  costCentreId?: string;
  costCentreName?: string;
  branchId?: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface JournalEntryDto {
  id: string;
  companyId: string;
  branchId?: string;
  branchName?: string;
  fiscalYearId: string;
  voucherNumber: string;
  voucherType: VoucherType;
  entryDate: string;
  postingDate: string;
  narration: string;
  status: JournalEntryStatus;
  totalAmount: number;
  isReversal: boolean;
  reversedFromId?: string;
  sourceRefId?: string;
  createdById: string;
  items: JournalEntryItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransactionEntry {
  id: string;
  voucherId: string;
  date: string;
  voucherNumber: string;
  voucherType: VoucherType;
  narration: string;
  opposingLedgerName?: string;
  costCentreName?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  isDebit: boolean;
}

export interface LedgerStatement {
  ledger: AccountLedgerItem;
  fromDate?: string;
  toDate?: string;
  openingBalance: number;
  isOpeningDebit: boolean;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  isClosingDebit: boolean;
  entries: LedgerTransactionEntry[];
}

export interface TrialBalanceItem {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  groupName: string;
  classification: AccountClassification;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  asOfDate: string;
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

export interface ProfitLossItem {
  ledgerId: string;
  ledgerName: string;
  amount: number;
}

export interface ProfitLossReport {
  periodStart: string;
  periodEnd: string;
  incomeItems: ProfitLossItem[];
  totalIncome: number;
  directExpenseItems: ProfitLossItem[];
  totalDirectExpenses: number;
  grossProfit: number;
  indirectExpenseItems: ProfitLossItem[];
  totalIndirectExpenses: number;
  netProfit: number;
}

export interface BalanceSheetGroup {
  groupName: string;
  total: number;
  ledgers: Array<{ id: string; name: string; amount: number }>;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: BalanceSheetGroup[];
  totalAssets: number;
  liabilities: BalanceSheetGroup[];
  totalLiabilities: number;
  equity: BalanceSheetGroup[];
  retainedEarnings: number;
  totalEquityAndLiabilities: number;
  difference: number;
  isBalanced: boolean;
}

export interface DayBookReport {
  date: string;
  vouchers: JournalEntryDto[];
  totalDebit: number;
  totalCredit: number;
}

export interface CostCentreReport {
  costCentres: Array<{
    id: string;
    code: string;
    name: string;
    totalExpense: number;
    totalRevenue: number;
    netAmount: number;
    entries: Array<{
      date: string;
      voucherNumber: string;
      ledgerName: string;
      amount: number;
      description?: string;
    }>;
  }>;
}

export interface AccountingQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  groupId?: string;
  classification?: AccountClassification;
  voucherType?: VoucherType;
  status?: JournalEntryStatus;
  fromDate?: string;
  toDate?: string;
  companyId?: string;
  branchId?: string;
}
