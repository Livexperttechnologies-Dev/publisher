import { z } from 'zod';

const returnItemSchema = z.object({
  bookId: z.string().min(1),
  isbn: z.string().default('978-81-7008-001-1'),
  title: z.string().min(1),
  quantity: z.number().int().positive(),
  unitRate: z.number().positive(),
  taxableAmount: z.number().nonnegative(),
  gstRate: z.number().nonnegative().default(0),
  gstAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().positive(),
  condition: z.enum(['SALEABLE', 'DAMAGED', 'DEFECTIVE']).default('SALEABLE'),
  targetBin: z.enum(['MAIN_WAREHOUSE', 'DAMAGED_QUARANTINE_BIN']).default('MAIN_WAREHOUSE'),
});

export const createSalesReturnSchema = z.object({
  salesInvoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  returnType: z.enum(['FULL', 'PARTIAL']).default('PARTIAL'),
  returnReason: z.enum(['DEFECTIVE_PRINTING', 'TRANSIT_DAMAGE', 'EXCESS_STOCK', 'WRONG_EDITION', 'CUSTOMER_RETURN']),
  items: z.array(returnItemSchema).min(1),
  cgstAmount: z.number().nonnegative().default(0),
  sgstAmount: z.number().nonnegative().default(0),
  igstAmount: z.number().nonnegative().default(0),
  refundMode: z.enum(['CREDIT_TO_ACCOUNT', 'BANK_REFUND', 'CASH_REFUND']).default('CREDIT_TO_ACCOUNT'),
  approvalThreshold: z.number().optional().default(25000),
  notes: z.string().optional(),
});

export const approveSalesReturnSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const createPurchaseReturnSchema = z.object({
  purchaseInvoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  returnType: z.enum(['FULL', 'PARTIAL']).default('PARTIAL'),
  returnReason: z.enum(['DEFECTIVE_PRINTING', 'DAMAGED_PAPER', 'REJECTED_STOCK', 'EXCESS_DISPATCH', 'WRONG_SPECIFICATION']),
  items: z.array(returnItemSchema).min(1),
  cgstAmount: z.number().nonnegative().default(0),
  sgstAmount: z.number().nonnegative().default(0),
  igstAmount: z.number().nonnegative().default(0),
  settlementType: z.enum(['CREDIT_TO_ACCOUNT', 'BANK_REFUND', 'CASH_REFUND']).default('CREDIT_TO_ACCOUNT'),
  approvalThreshold: z.number().optional().default(25000),
  notes: z.string().optional(),
});

export const approvePurchaseReturnSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const createDistributorReturnSchema = z.object({
  distributorId: z.string().min(1),
  distributorName: z.string().min(1),
  returnType: z.enum(['UNSOLD_RETURN', 'DAMAGED_RETURN', 'CONSIGNMENT_RETURN']).default('UNSOLD_RETURN'),
  warehouseId: z.string().default('wh_central_delhi'),
  warehouseName: z.string().default('Central Warehouse - Delhi'),
  targetLocation: z.enum(['WAREHOUSE', 'DAMAGED_QUARANTINE_BIN']).default('WAREHOUSE'),
  items: z.array(returnItemSchema).min(1),
  approvalThreshold: z.number().optional().default(25000),
  notes: z.string().optional(),
});

export const approveDistributorReturnSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const createFinancialAdjustmentSchema = z.object({
  partyType: z.enum(['CUSTOMER', 'SUPPLIER', 'DISTRIBUTOR']),
  partyId: z.string().min(1),
  partyName: z.string().min(1),
  adjustmentType: z.enum([
    'CUSTOMER_CREDIT_NOTE',
    'SUPPLIER_DEBIT_NOTE',
    'PRICE_ADJUSTMENT',
    'DISCOUNT_REBATE',
    'ROUND_OFF_WRITE_OFF',
  ]),
  referenceDocumentNumber: z.string().optional(),
  taxableAmount: z.number().positive(),
  gstAmount: z.number().nonnegative().default(0),
  reason: z.string().min(3),
  approvalThreshold: z.number().optional().default(25000),
  notes: z.string().optional(),
});

export const approveFinancialAdjustmentSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const processRefundSchema = z.object({
  refundType: z.enum(['CUSTOMER_REFUND', 'SUPPLIER_REFUND']),
  partyId: z.string().min(1),
  partyName: z.string().min(1),
  referenceCreditDebitNote: z.string().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI']).default('BANK_TRANSFER'),
  bankLedgerId: z.string().default('led_bank_hdfc'),
  notes: z.string().optional(),
});

export const reverseReturnSchema = z.object({
  reason: z.string().min(3),
});
