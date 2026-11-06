export type RequisitionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PO_RAISED' | 'REJECTED';
export type PurchaseOrderStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type GRNStatus = 'RECEIVED' | 'QUALITY_VERIFIED' | 'INSPECTED' | 'POSTED_TO_INVENTORY';
export type PurchaseInvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentMode = 'BANK_TRANSFER_NEFT_RTGS' | 'CHEQUE' | 'CASH' | 'UPI';

// 1. Purchase Requisition
export interface PurchaseRequisitionItem {
  id?: string;
  bookId?: string;
  title: string;
  isbn?: string;
  sku: string;
  quantity: number;
  estimatedRate: number;
  estimatedAmount: number;
}

export interface PurchaseRequisition {
  id: string;
  companyId: string;
  requisitionNo: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requestedBy: string;
  status: RequisitionStatus;
  remarks?: string;
  items: PurchaseRequisitionItem[];
  totalEstimated: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Supplier Quotation & Comparison
export interface SupplierQuotationItem {
  bookId?: string;
  description: string;
  sku: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  lineTotal: number;
}

export interface SupplierQuotation {
  id: string;
  companyId: string;
  quotationNo: string;
  supplierId: string;
  supplierName: string;
  requisitionId?: string;
  quotationDate: string;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms: string;
  leadTimeDays: number;
  items: SupplierQuotationItem[];
  subtotal: number;
  taxAmount: number;
  additionalCharges: number;
  grandTotal: number;
  status: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierComparisonItem {
  sku: string;
  itemDescription: string;
  quantity: number;
  supplierOffers: {
    supplierId: string;
    supplierName: string;
    quotationNo: string;
    unitRate: number;
    discountPercent: number;
    landedCostPerUnit: number;
    lineTotal: number;
    leadTimeDays: number;
    paymentTerms: string;
    isLowestRate: boolean;
  }[];
  recommendedSupplierId: string;
  recommendedSupplierName: string;
}

export interface SupplierComparisonReport {
  comparisonDate: string;
  requisitionId?: string;
  suppliersComparedCount: number;
  items: SupplierComparisonItem[];
  totalPotentialSavings: number;
}

// 3. Purchase Order
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  bookId?: string;
  bookTitle: string;
  isbn?: string;
  sku: string;
  quantity: number; // ordered quantity
  receivedQuantity: number;
  unitRate: number;
  discountPercent: number;
  taxPercent: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  branchId?: string;
  branchName?: string;
  poNumber: string;
  orderDate: string;
  expectedDelivery: string;
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  supplierAddress?: string;
  supplierStateCode?: string;
  quotationRef?: string;
  requisitionRef?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  freightCharges: number;
  additionalCharges: number;
  roundOff: number;
  grandTotal: number;
  paymentTerms: string;
  deliveryTerms?: string;
  status: PurchaseOrderStatus;
  notes?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// 4. Goods Receipt Note (GRN)
export interface GoodsReceiptNoteItem {
  id: string;
  goodsReceiptNoteId: string;
  bookId?: string;
  bookTitle: string;
  isbn?: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  pendingQuantity: number;
  warehouseRack?: string;
  batchBarcode?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptNote {
  id: string;
  companyId: string;
  branchId?: string;
  grnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  warehouseId?: string;
  warehouseName?: string;
  deliveryChallanNo?: string;
  transporterName?: string;
  lrNumber?: string;
  vehicleNumber?: string;
  items: GoodsReceiptNoteItem[];
  status: GRNStatus;
  notes?: string;
  receivedBy?: string;
  inspectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 5. Purchase Invoice (Vendor Bill)
export interface PurchaseInvoiceItem {
  id: string;
  purchaseInvoiceId: string;
  bookId?: string;
  description: string;
  sku: string;
  hsnSacCode: string;
  quantity: number;
  unitRate: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInvoice {
  id: string;
  companyId: string;
  branchId?: string;
  invoiceNumber: string;
  supplierInvoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  purchaseOrderId?: string;
  poNumber?: string;
  goodsReceiptNoteId?: string;
  grnNumber?: string;
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  supplierStateCode?: string;
  placeOfSupply?: string;
  subtotalTaxable: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  freightAmount: number;
  roundOff: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  status: PurchaseInvoiceStatus;
  accountingVoucherId?: string;
  voucherNumber?: string;
  threeWayMatched: boolean;
  paymentTerms: string;
  notes?: string;
  items: PurchaseInvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// 6. Purchase Return & Debit Note
export interface PurchaseReturnItem {
  bookId?: string;
  sku: string;
  title: string;
  returnedQty: number;
  unitRate: number;
  taxableAmount: number;
  totalAmount: number;
}

export interface PurchaseReturn {
  id: string;
  companyId: string;
  returnNumber: string; // Debit Note # e.g. DN/2026/0001
  purchaseInvoiceId: string;
  invoiceNumber: string;
  supplierInvoiceNo?: string;
  supplierId: string;
  supplierName: string;
  returnDate: string;
  returnReason: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalReturnAmount: number;
  accountingVoucherId?: string;
  voucherNumber?: string;
  items: PurchaseReturnItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Supplier Payment
export interface SupplierPayment {
  id: string;
  companyId: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  paymentMode: PaymentMode;
  bankLedgerId: string;
  bankLedgerName: string;
  referenceNumber?: string;
  amount: number;
  discountReceived: number;
  tdsDeducted: number;
  invoicesSettled: {
    invoiceId: string;
    invoiceNumber: string;
    allocatedAmount: number;
  }[];
  accountingVoucherId?: string;
  voucherNumber?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Ageing & Payables
export interface SupplierAgeingItem {
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  creditDays: number;
  currentNotDue: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export interface SupplierStatementEntry {
  date: string;
  refType: 'PURCHASE_INVOICE' | 'PAYMENT' | 'DEBIT_NOTE';
  refNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface SupplierStatementReport {
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  openingBalance: number;
  entries: SupplierStatementEntry[];
  closingBalance: number;
}

// 9. Reports
export interface PurchaseRegisterItem {
  invoiceNumber: string;
  supplierInvoiceNo: string;
  date: string;
  supplierName: string;
  supplierGstin?: string;
  placeOfSupply: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  freightAmount: number;
  netAmount: number;
  voucherNumber?: string;
}

export interface PurchaseRegisterReport {
  fromDate?: string;
  toDate?: string;
  items: PurchaseRegisterItem[];
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalFreight: number;
  grandTotal: number;
}

export interface PurchasesQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
  companyId?: string;
}
