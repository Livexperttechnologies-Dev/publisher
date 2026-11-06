export type SalesChannel =
  | 'RETAIL_COUNTER_POS'
  | 'WHOLESALE'
  | 'DISTRIBUTOR'
  | 'DEALER'
  | 'INSTITUTION_SCHOOL'
  | 'ONLINE_ORDER'
  | 'DIRECT_PUBLISHER';

export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'STOCK_RESERVED'
  | 'PARTIALLY_DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SalesInvoiceStatus = 'DRAFT' | 'POSTED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'UPI'
  | 'BANK_TRANSFER_NEFT_RTGS'
  | 'CHEQUE'
  | 'SPLIT_PAYMENT'
  | 'CUSTOMER_CREDIT';

// 1. Quotation
export interface SalesQuotationItem {
  bookId?: string;
  title: string;
  isbn?: string;
  sku: string;
  mrp: number;
  unitRate: number;
  discountPercent: number;
  taxRate: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesQuotation {
  id: string;
  companyId: string;
  branchId?: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  salesChannel: SalesChannel;
  quotationDate: string;
  validUntil: string;
  paymentTerms: string;
  items: SalesQuotationItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  freightCharges: number;
  grandTotal: number;
  status: 'ACTIVE' | 'ACCEPTED' | 'CONVERTED_TO_ORDER' | 'EXPIRED';
  remarks?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Sales Order
export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  bookId?: string;
  title: string;
  isbn?: string;
  sku: string;
  mrp: number;
  quantity: number;
  deliveredQuantity: number;
  unitRate: number;
  discountPercent: number;
  taxRate: number;
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

export interface SalesOrder {
  id: string;
  companyId: string;
  branchId?: string;
  branchName?: string;
  orderNumber: string;
  quotationRef?: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerStateCode?: string;
  salesChannel: SalesChannel;
  orderDate: string;
  deliveryDueDate: string;
  paymentTerms: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  freightCharges: number;
  roundOff: number;
  grandTotal: number;
  status: SalesOrderStatus;
  stockReserved: boolean;
  notes?: string;
  createdById?: string;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// 3. Delivery Challan
export interface DeliveryChallanItem {
  id: string;
  deliveryChallanId: string;
  bookId?: string;
  sku: string;
  title: string;
  orderedQuantity: number;
  dispatchedQuantity: number;
  warehouseRack?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryChallan {
  id: string;
  companyId: string;
  branchId?: string;
  challanNumber: string;
  salesOrderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  deliveryAddress?: string;
  dispatchDate: string;
  transporterName?: string;
  lrNumber?: string;
  vehicleNumber?: string;
  eWayBillNumber?: string;
  status: 'DISPATCHED' | 'DELIVERED' | 'INVOICED';
  notes?: string;
  items: DeliveryChallanItem[];
  createdAt: string;
  updatedAt: string;
}

// 4. Sales Invoice
export interface SalesInvoiceItem {
  id: string;
  salesInvoiceId: string;
  bookId?: string;
  sku: string;
  barcode?: string;
  title: string;
  hsnSacCode: string;
  mrp: number;
  quantity: number;
  unitRate: number;
  discountPercent: number;
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
  purchaseCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SplitPaymentDetail {
  cashAmount?: number;
  cardAmount?: number;
  upiAmount?: number;
  cardLast4?: string;
  upiRef?: string;
}

export interface SalesInvoice {
  id: string;
  companyId: string;
  branchId?: string;
  invoiceNumber: string;
  salesChannel: SalesChannel;
  salesOrderId?: string;
  orderNumber?: string;
  deliveryChallanId?: string;
  challanNumber?: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerStateCode?: string;
  placeOfSupply: string;
  invoiceDate: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: SplitPaymentDetail;
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
  status: SalesInvoiceStatus;
  accountingVoucherId?: string;
  voucherNumber?: string;
  isPosCounterSale: boolean;
  posShiftId?: string;
  cashierName?: string;
  notes?: string;
  items: SalesInvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// 5. Sales Return & Credit Note
export interface SalesReturnItem {
  bookId?: string;
  sku: string;
  title: string;
  returnedQty: number;
  unitRate: number;
  taxableAmount: number;
  totalAmount: number;
}

export interface SalesReturn {
  id: string;
  companyId: string;
  creditNoteNumber: string;
  salesInvoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  returnReason: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalReturnAmount: number;
  accountingVoucherId?: string;
  voucherNumber?: string;
  items: SalesReturnItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 6. Customer Receipt
export interface CustomerReceipt {
  id: string;
  companyId: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  receiptDate: string;
  paymentMethod: PaymentMethod;
  bankLedgerId: string;
  bankLedgerName: string;
  referenceNumber?: string;
  amount: number;
  discountAllowed: number;
  tdsDeductedByCustomer: number;
  invoicesSettled: {
    invoiceId: string;
    invoiceNumber: string;
    allocatedAmount: number;
  }[];
  accountingVoucherId?: string;
  voucherNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 7. POS Shift & Held Carts
export interface PosShift {
  id: string;
  companyId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  shiftOpenedAt: string;
  shiftClosedAt?: string;
  openingFloatCash: number;
  cashSalesTotal: number;
  cardSalesTotal: number;
  upiSalesTotal: number;
  totalSales: number;
  closingDrawerCash: number;
  cashVariance: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeldCart {
  id: string;
  cartHoldRef: string;
  cashierName: string;
  customerName: string;
  heldAt: string;
  items: any[];
  totalAmount: number;
}

// 8. Customer Ageing & Statements
export interface CustomerAgeingItem {
  customerId: string;
  customerName: string;
  customerGstin?: string;
  creditLimit: number;
  creditDays: number;
  currentNotDue: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export interface CustomerStatementEntry {
  date: string;
  refType: 'SALES_INVOICE' | 'RECEIPT' | 'CREDIT_NOTE';
  refNumber: string;
  description: string;
  debit: number; // Invoice debits customer (they owe us)
  credit: number; // Receipt/Credit Note credits customer
  runningBalance: number;
}

export interface CustomerStatementReport {
  customerId: string;
  customerName: string;
  customerGstin?: string;
  openingBalance: number;
  entries: CustomerStatementEntry[];
  closingBalance: number;
}

// 9. Query & Filter Interfaces
export interface SalesQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  salesChannel?: SalesChannel;
  fromDate?: string;
  toDate?: string;
  companyId?: string;
  isPosCounterSale?: boolean;
}

// 10. Reports
export interface DailySalesReport {
  date: string;
  totalInvoices: number;
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  taxCollected: number;
  cashCollected: number;
  cardCollected: number;
  upiCollected: number;
  creditSales: number;
}

export interface ChannelWiseSalesReport {
  channel: SalesChannel;
  channelName: string;
  invoiceCount: number;
  totalRevenue: number;
  sharePercentage: number;
}

export interface SalesMarginReportItem {
  sku: string;
  title: string;
  quantitySold: number;
  revenue: number;
  totalCogs: number;
  grossMarginAmount: number;
  grossMarginPercentage: number;
}
