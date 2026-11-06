export type PaymentMethod =
  | 'CASH'
  | 'CHEQUE'
  | 'NEFT'
  | 'RTGS'
  | 'IMPS'
  | 'UPI'
  | 'CARD'
  | 'GATEWAY';

export type ChequeStatus =
  | 'ISSUED'
  | 'RECEIVED'
  | 'DEPOSITED'
  | 'CLEARED'
  | 'BOUNCED'
  | 'CANCELLED';

export type BankTxType =
  | 'RECEIPT'
  | 'PAYMENT'
  | 'CONTRA_TRANSFER'
  | 'BANK_CHARGE'
  | 'INTEREST';

export type CashTxType =
  | 'RECEIPT'
  | 'PAYMENT'
  | 'CONTRA_DEPOSIT'
  | 'PETTY_EXPENSE';

export type ReconciliationStatus =
  | 'UNRECONCILED'
  | 'MATCHED'
  | 'CLEARED'
  | 'BOUNCED';

export interface BankAccountDTO {
  id: string;
  companyId: string;
  branchId?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  swiftCode?: string;
  currency: string;
  accountType: 'CURRENT' | 'SAVINGS' | 'OVERDRAFT';
  openingBalance: number;
  currentBalance: number;
  ledgerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashRegisterDTO {
  id: string;
  companyId: string;
  branchId?: string;
  name: string;
  code: string;
  cashierName: string;
  openingBalance: number;
  currentBalance: number;
  ledgerId?: string;
  isPettyCash: boolean;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface BankTransactionDTO {
  id: string;
  companyId: string;
  bankAccountId: string;
  transactionType: BankTxType;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  valueDate?: string;
  referenceNumber: string; // Cheque #, UTR, Auth code
  partyName?: string;
  partyLedgerId?: string;
  debitAmount: number; // Deposit into bank
  creditAmount: number; // Withdrawal from bank
  runningBalance: number;
  narration: string;
  accountingVoucherNumber?: string;
  reconciliationStatus: ReconciliationStatus;
  reconciliationDate?: string;
  createdAt: string;
}

export interface ChequeLeafDTO {
  id: string;
  companyId: string;
  bankAccountId: string;
  chequeNumber: string;
  chequeType: 'ISSUED' | 'RECEIVED';
  issueOrReceiptDate: string;
  payeeOrDrawer: string;
  amount: number;
  clearingDate?: string;
  bounceDate?: string;
  bounceReason?: string;
  bounceCharges: number;
  status: ChequeStatus;
  voucherNumber?: string;
  reversalVoucherNumber?: string;
  createdAt: string;
}

export interface CashTransactionDTO {
  id: string;
  companyId: string;
  cashRegisterId: string;
  transactionType: CashTxType;
  transactionDate: string;
  receiptNumber: string;
  partyName?: string;
  partyLedgerId?: string;
  debitAmount: number; // Inward cash
  creditAmount: number; // Outward cash
  runningBalance: number;
  expenseCategory?: string;
  narration: string;
  accountingVoucherNumber?: string;
  createdAt: string;
}

export interface CashClosingSessionDTO {
  id: string;
  companyId: string;
  cashRegisterId: string;
  closingNumber: string;
  cashierName: string;
  shiftDate: string;
  openingCash: number;
  totalCashIn: number;
  totalCashOut: number;
  systemExpectedCash: number;
  physicalCountedCash: number;
  discrepancy: number; // physical - system
  discrepancyReason?: string;
  status: 'CLOSED' | 'RECONCILED';
  notes?: string;
  createdAt: string;
}

export interface BankReconciliationDTO {
  id: string;
  companyId: string;
  bankAccountId: string;
  statementPeriod: string;
  asOfDate: string;
  bookBalance: number;
  unpresentedCheques: number; // Cheques issued not presented (+)
  uncreditedCheques: number; // Cheques deposited not credited (-)
  directBankDebits: number; // Bank charges (-)
  directBankCredits: number; // Direct transfers (+)
  reconciledBalance: number;
  bankStatementBalance: number;
  difference: number;
  isBalanced: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateBankAccountDTO {
  companyId?: string;
  branchId?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  swiftCode?: string;
  accountType?: 'CURRENT' | 'SAVINGS' | 'OVERDRAFT';
  openingBalance?: number;
  ledgerId?: string;
}

export interface CreateCashRegisterDTO {
  companyId?: string;
  branchId?: string;
  name: string;
  code: string;
  cashierName: string;
  openingBalance?: number;
  isPettyCash?: boolean;
  ledgerId?: string;
}

export interface RecordBankTxInputDTO {
  companyId?: string;
  bankAccountId: string;
  transactionType: BankTxType;
  paymentMethod: PaymentMethod;
  transactionDate?: string;
  referenceNumber: string;
  partyName?: string;
  partyLedgerId?: string;
  amount: number;
  narration: string;
}

export interface RecordCashTxInputDTO {
  companyId?: string;
  cashRegisterId: string;
  transactionType: CashTxType;
  transactionDate?: string;
  partyName?: string;
  partyLedgerId?: string;
  amount: number;
  expenseCategory?: string;
  narration: string;
}

export interface InterBankTransferInputDTO {
  companyId?: string;
  fromBankAccountId?: string;
  toBankAccountId?: string;
  fromCashRegisterId?: string;
  toCashRegisterId?: string;
  transferType: 'BANK_TO_BANK' | 'CASH_TO_BANK' | 'BANK_TO_CASH';
  amount: number;
  referenceNumber: string;
  transferDate?: string;
  narration: string;
}

export interface ChequeLifecycleInputDTO {
  chequeId: string;
  action: 'DEPOSIT' | 'CLEAR' | 'BOUNCE' | 'CANCEL';
  date?: string;
  bounceReason?: string;
  bounceCharges?: number;
}

export interface CashClosingInputDTO {
  companyId?: string;
  cashRegisterId: string;
  cashierName: string;
  physicalCountedCash: number;
  discrepancyReason?: string;
  notes?: string;
}

export interface StatementRowInput {
  date: string;
  narration: string;
  referenceNumber: string;
  withdrawalAmount?: number;
  depositAmount?: number;
  balance?: number;
}

export interface ImportBankStatementDTO {
  companyId?: string;
  bankAccountId: string;
  statementFileName: string;
  rows: StatementRowInput[];
}

export interface BrsCalculationInputDTO {
  companyId?: string;
  bankAccountId: string;
  statementPeriod: string;
  asOfDate: string;
  bankStatementBalance: number;
}
