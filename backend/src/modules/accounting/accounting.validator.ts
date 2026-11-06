import { z } from 'zod';

export const createAccountGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(150),
  code: z.string().min(2, 'Group code is required').max(50),
  parentGroupId: z.string().optional(),
  classification: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  isSystemGroup: z.boolean().default(false),
});

export const createAccountLedgerSchema = z.object({
  groupId: z.string().min(1, 'Account Group is required'),
  name: z.string().min(1, 'Ledger name is required').max(200),
  code: z.string().min(2, 'Ledger code is required').max(50),
  openingBalance: z.number().min(0).default(0.0),
  isDebitBalance: z.boolean().default(true),
  isBankOrCash: z.boolean().default(false),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  ifscCode: z.string().optional(),
  taxRegistration: z.string().optional(),
  isReconciliationRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateAccountLedgerSchema = createAccountLedgerSchema.partial();

export const journalEntryItemSchema = z.object({
  ledgerId: z.string().min(1, 'Ledger ID is required'),
  debitAmount: z.number().min(0, 'Debit cannot be negative').default(0.0),
  creditAmount: z.number().min(0, 'Credit cannot be negative').default(0.0),
  costCentreId: z.string().optional(),
  costCentreName: z.string().optional(),
  branchId: z.string().optional(),
  description: z.string().optional(),
});

export const createJournalEntrySchema = z
  .object({
    fiscalYearId: z.string().default('fy_current_2026_2027'),
    branchId: z.string().optional(),
    branchName: z.string().optional(),
    voucherType: z
      .enum([
        'JOURNAL',
        'PAYMENT_VOUCHER',
        'RECEIPT_VOUCHER',
        'CONTRA_VOUCHER',
        'DEBIT_NOTE',
        'CREDIT_NOTE',
        'SALES_INVOICE',
        'PURCHASE_BILL',
        'ROYALTY_ACCRUAL',
      ])
      .default('JOURNAL'),
    entryDate: z.string().default(new Date().toISOString()),
    narration: z.string().min(3, 'Narration must be at least 3 characters'),
    sourceRefId: z.string().optional(),
    items: z.array(journalEntryItemSchema).min(2, 'Double-entry requires at least two line items'),
  })
  .refine(
    (data) => {
      const totalDebit = data.items.reduce((sum, item) => sum + (item.debitAmount || 0), 0);
      const totalCredit = data.items.reduce((sum, item) => sum + (item.creditAmount || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    {
      message: 'Debit and Credit totals must balance exactly (Difference must be zero)',
      path: ['items'],
    }
  );

export const reverseVoucherSchema = z.object({
  reason: z.string().min(3, 'Reversal reason is required'),
  reversalDate: z.string().optional(),
});
