export type ItemCondition = 'SALEABLE' | 'DAMAGED' | 'DEFECTIVE';
export type TargetBin = 'MAIN_WAREHOUSE' | 'DAMAGED_QUARANTINE_BIN';

export interface ReturnItem {
  bookId: string;
  isbn: string;
  title: string;
  quantity: number;
  unitRate: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  condition: ItemCondition;
  targetBin: TargetBin;
}

export type ReturnStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'REVERSED';
export type SalesReturnReason = 'DEFECTIVE_PRINTING' | 'TRANSIT_DAMAGE' | 'EXCESS_STOCK' | 'WRONG_EDITION' | 'CUSTOMER_RETURN';
export type PurchaseReturnReason = 'DEFECTIVE_PRINTING' | 'DAMAGED_PAPER' | 'REJECTED_STOCK' | 'EXCESS_DISPATCH' | 'WRONG_SPECIFICATION';
export type RefundMode = 'CREDIT_TO_ACCOUNT' | 'BANK_REFUND' | 'CASH_REFUND';

export interface SalesReturnItem {
  id: string;
  companyId: string;
  creditNoteNumber: string; // e.g. CN/2026/0101
  salesInvoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  returnType: 'FULL' | 'PARTIAL';
  returnReason: SalesReturnReason;
  items: ReturnItem[];
  totalQuantity: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalReturnAmount: number;
  refundMode: RefundMode;
  status: ReturnStatus;
  approvalThreshold: number;
  approvedBy?: string;
  accountingVoucherNumber?: string;
  stockAdjusted: boolean;
  royaltyAdjusted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturnItem {
  id: string;
  companyId: string;
  debitNoteNumber: string; // e.g. DN/2026/0101
  purchaseInvoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  returnDate: string;
  returnType: 'FULL' | 'PARTIAL';
  returnReason: PurchaseReturnReason;
  items: ReturnItem[];
  totalQuantity: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalReturnAmount: number;
  settlementType: RefundMode;
  status: ReturnStatus;
  approvalThreshold: number;
  approvedBy?: string;
  accountingVoucherNumber?: string;
  stockAdjusted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DistributorReturnType = 'UNSOLD_RETURN' | 'DAMAGED_RETURN' | 'CONSIGNMENT_RETURN';

export interface DistributorReturnItem {
  id: string;
  companyId: string;
  returnNumber: string; // e.g. DRTN/2026/0001
  distributorId: string;
  distributorName: string;
  returnType: DistributorReturnType;
  returnDate: string;
  warehouseId: string;
  warehouseName: string;
  targetLocation: 'WAREHOUSE' | 'DAMAGED_QUARANTINE_BIN';
  items: ReturnItem[];
  totalQuantity: number;
  totalAmount: number;
  creditNoteNumber?: string;
  status: ReturnStatus;
  approvalThreshold: number;
  approvedBy?: string;
  accountingVoucherNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdjustmentPartyType = 'CUSTOMER' | 'SUPPLIER' | 'DISTRIBUTOR';
export type AdjustmentType =
  | 'CUSTOMER_CREDIT_NOTE'
  | 'SUPPLIER_DEBIT_NOTE'
  | 'PRICE_ADJUSTMENT'
  | 'DISCOUNT_REBATE'
  | 'ROUND_OFF_WRITE_OFF';

export interface FinancialAdjustmentItem {
  id: string;
  companyId: string;
  adjustmentNumber: string; // e.g. ADJ/2026/0001
  partyType: AdjustmentPartyType;
  partyId: string;
  partyName: string;
  adjustmentType: AdjustmentType;
  referenceDocumentNumber?: string;
  date: string;
  taxableAmount: number;
  gstAmount: number;
  totalAdjustmentAmount: number;
  reason: string;
  approvalThreshold: number;
  status: ReturnStatus;
  approvedBy?: string;
  voucherType: 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'JOURNAL';
  accountingVoucherNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundItem {
  id: string;
  companyId: string;
  refundNumber: string; // e.g. REF/2026/0001
  refundType: 'CUSTOMER_REFUND' | 'SUPPLIER_REFUND';
  partyId: string;
  partyName: string;
  referenceCreditDebitNote?: string;
  refundDate: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'UPI';
  bankLedgerId: string;
  status: 'CONFIRMED';
  accountingVoucherNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ReturnsSummaryReport {
  companyId: string;
  generatedDate: string;
  totalSalesReturnsCount: number;
  totalSalesReturnsValue: number;
  totalPurchaseReturnsCount: number;
  totalPurchaseReturnsValue: number;
  totalDistributorReturnsCount: number;
  totalDistributorReturnsValue: number;
  damagedQuarantineCount: number;
  damagedQuarantineValue: number;
  topReasons: { reason: string; count: number; value: number }[];
}

export interface DistributorReconciliationReport {
  distributorId: string;
  distributorName: string;
  totalDispatchedCopies: number;
  totalDispatchedValue: number;
  totalSoldCopies: number;
  totalSoldValue: number;
  totalReturnedCopies: number;
  totalReturnedValue: number;
  unsoldConsignmentCopies: number;
  unsoldConsignmentValue: number;
  netSettlementDue: number;
  status: 'RECONCILED' | 'PENDING_CONFIRMATION';
}

export interface ReturnsQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  partyId?: string;
  returnReason?: string;
  startDate?: string;
  endDate?: string;
}
