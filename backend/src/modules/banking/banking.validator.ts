import { z } from 'zod';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const createBankAccountSchema = z.object({
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  accountName: z.string().min(3, 'Account name required'),
  accountNumber: z.string().min(6, 'Valid account number required'),
  bankName: z.string().min(2, 'Bank name required'),
  ifscCode: z.string().regex(IFSC_REGEX, 'Valid 11-character Indian IFSC code required (e.g. HDFC0001234)'),
  branchName: z.string().min(2, 'Branch location required'),
  swiftCode: z.string().optional(),
  accountType: z.enum(['CURRENT', 'SAVINGS', 'OVERDRAFT']).default('CURRENT'),
  openingBalance: z.number().min(0).default(0),
  ledgerId: z.string().optional(),
});

export const createCashRegisterSchema = z.object({
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  name: z.string().min(2, 'Register name required'),
  code: z.string().min(2, 'Register code required'),
  cashierName: z.string().min(2, 'Assigned cashier required'),
  openingBalance: z.number().min(0).default(0),
  isPettyCash: z.boolean().default(false),
  ledgerId: z.string().optional(),
});

export const recordBankTxSchema = z.object({
  companyId: z.string().optional(),
  bankAccountId: z.string().min(1, 'Bank account ID required'),
  transactionType: z.enum(['RECEIPT', 'PAYMENT', 'CONTRA_TRANSFER', 'BANK_CHARGE', 'INTEREST']),
  paymentMethod: z.enum(['CASH', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'CARD', 'GATEWAY']),
  transactionDate: z.string().optional(),
  referenceNumber: z.string().min(1, 'Reference number / UTR / Cheque leaf number required'),
  partyName: z.string().optional(),
  partyLedgerId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  narration: z.string().min(3, 'Detailed narration required'),
});

export const recordCashTxSchema = z.object({
  companyId: z.string().optional(),
  cashRegisterId: z.string().min(1, 'Cash register ID required'),
  transactionType: z.enum(['RECEIPT', 'PAYMENT', 'CONTRA_DEPOSIT', 'PETTY_EXPENSE']),
  transactionDate: z.string().optional(),
  partyName: z.string().optional(),
  partyLedgerId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  expenseCategory: z.string().optional(),
  narration: z.string().min(3, 'Detailed narration required'),
});

export const interBankTransferSchema = z.object({
  companyId: z.string().optional(),
  fromBankAccountId: z.string().optional(),
  toBankAccountId: z.string().optional(),
  fromCashRegisterId: z.string().optional(),
  toCashRegisterId: z.string().optional(),
  transferType: z.enum(['BANK_TO_BANK', 'CASH_TO_BANK', 'BANK_TO_CASH']),
  amount: z.number().positive('Transfer amount must be positive'),
  referenceNumber: z.string().min(1, 'Reference number / Cheque / UTR required'),
  transferDate: z.string().optional(),
  narration: z.string().min(3, 'Transfer narration required'),
});

export const chequeLifecycleSchema = z.object({
  chequeId: z.string().min(1, 'Cheque ID required'),
  action: z.enum(['DEPOSIT', 'CLEAR', 'BOUNCE', 'CANCEL']),
  date: z.string().optional(),
  bounceReason: z.string().optional(),
  bounceCharges: z.number().min(0).default(0),
});

export const cashClosingSchema = z.object({
  companyId: z.string().optional(),
  cashRegisterId: z.string().min(1, 'Cash register ID required'),
  cashierName: z.string().min(2, 'Cashier name required'),
  physicalCountedCash: z.number().min(0, 'Physical cash cannot be negative'),
  discrepancyReason: z.string().optional(),
  notes: z.string().optional(),
});

export const statementRowSchema = z.object({
  date: z.string().min(1),
  narration: z.string().min(1),
  referenceNumber: z.string().min(1),
  withdrawalAmount: z.number().optional().default(0),
  depositAmount: z.number().optional().default(0),
  balance: z.number().optional(),
});

export const importStatementSchema = z.object({
  companyId: z.string().optional(),
  bankAccountId: z.string().min(1, 'Bank account ID required'),
  statementFileName: z.string().min(3, 'File name required'),
  rows: z.array(statementRowSchema).min(1, 'At least one transaction line required'),
});

export const brsCalculationSchema = z.object({
  companyId: z.string().optional(),
  bankAccountId: z.string().min(1, 'Bank account ID required'),
  statementPeriod: z.string().min(2, 'Statement period required'),
  asOfDate: z.string().min(4, 'As of date required'),
  bankStatementBalance: z.number(),
});
