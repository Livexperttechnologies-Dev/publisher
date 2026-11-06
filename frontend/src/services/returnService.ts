import { postDoubleEntryVoucher } from './voucherService';

export interface SalesReturn {
  id: string;
  creditNoteNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerId?: string;
  returnReason: 'TRANSIT_DAMAGE' | 'DEFECTIVE_PRINTING' | 'EXCESS_STOCK' | 'WRONG_EDITION' | 'CUSTOMER_RETURN';
  bookTitle: string;
  bookId?: string;
  isbn?: string;
  totalQuantity: number;
  unitRate: number;
  totalReturnAmount: number;
  condition: 'DAMAGED' | 'SALEABLE';
  refundMode: 'CREDIT_TO_ACCOUNT' | 'BANK_REFUND' | 'CASH_REFUND';
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'REVERSED';
  accountingVoucherNumber?: string;
  returnDate: string;
  approvedBy?: string;
}

export interface PurchaseReturn {
  id: string;
  debitNoteNumber: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId?: string;
  returnReason: 'DAMAGED_PAPER' | 'DEFECTIVE_PRINTING' | 'REJECTED_STOCK' | 'EXCESS_DISPATCH';
  materialName: string;
  totalQuantity: number;
  unitRate: number;
  totalReturnAmount: number;
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'REVERSED';
  accountingVoucherNumber?: string;
  returnDate: string;
}

export interface DistributorReturn {
  id: string;
  returnNumber: string;
  distributorName: string;
  distributorId?: string;
  returnType: 'UNSOLD_RETURN' | 'SEASON_END_PULLBACK' | 'DEFECTIVE_COPIES';
  bookTitle: string;
  totalQuantity: number;
  unitRate: number;
  totalAmount: number;
  condition: 'SALEABLE' | 'DAMAGED';
  status: 'CONFIRMED' | 'IN_TRANSIT';
  creditNoteNumber?: string;
  returnDate: string;
}

export interface FinancialAdjustment {
  id: string;
  adjustmentNumber: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  adjustmentType: 'DISCOUNT_REBATE' | 'PRICE_ADJUSTMENT' | 'CUSTOMER_CREDIT_NOTE' | 'SUPPLIER_DEBIT_NOTE';
  totalAdjustmentAmount: number;
  reason: string;
  status: 'PENDING_APPROVAL' | 'CONFIRMED';
  accountingVoucherNumber?: string;
  date: string;
}

export interface RefundRecord {
  id: string;
  refundNumber: string;
  refundType: 'CUSTOMER_REFUND' | 'SUPPLIER_REFUND';
  partyName: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH';
  status: 'CONFIRMED' | 'PENDING';
  accountingVoucherNumber?: string;
  refundDate: string;
  referenceNote?: string;
}

export interface QuarantineStock {
  id: string;
  bookId: string;
  isbn: string;
  title: string;
  damagedQuantity: number;
  quarantineDate: string;
  sourceReturnNumber: string;
  inspectionNotes: string;
  status: 'QUARANTINED' | 'SCRAPPED' | 'VENDOR_RETURNED';
}

const STORAGE_KEYS = {
  SALES_RETURNS: 'kibo360_sales_returns_v2',
  PURCHASE_RETURNS: 'kibo360_purchase_returns_v2',
  DISTRIBUTOR_RETURNS: 'kibo360_distributor_returns_v2',
  ADJUSTMENTS: 'kibo360_financial_adjustments_v2',
  REFUNDS: 'kibo360_refund_records_v2',
  QUARANTINE: 'kibo360_quarantine_stock_v2',
};

// Seed Data
const INITIAL_SALES_RETURNS: SalesReturn[] = [
  {
    id: 'srtn_001',
    creditNoteNumber: 'CN/2026/0001',
    invoiceNumber: 'INV/2026/0001',
    customerName: 'Oxford Book Store Pvt Ltd',
    returnReason: 'TRANSIT_DAMAGE',
    bookTitle: 'Senior Secondary Mathematics - Class 10',
    totalQuantity: 50,
    unitRate: 295,
    totalReturnAmount: 14750,
    condition: 'DAMAGED',
    refundMode: 'CREDIT_TO_ACCOUNT',
    status: 'CONFIRMED',
    accountingVoucherNumber: 'CN/2026/0001',
    returnDate: '2026-10-20',
    approvedBy: 'Regional Sales Manager',
  },
  {
    id: 'srtn_002',
    creditNoteNumber: 'CN/2026/0002',
    invoiceNumber: 'INV/2026/0001',
    customerName: 'Delhi Book House Retailers',
    returnReason: 'TRANSIT_DAMAGE',
    bookTitle: 'Senior Secondary Mathematics - Class 10',
    totalQuantity: 40,
    unitRate: 295,
    totalReturnAmount: 11800,
    condition: 'DAMAGED',
    refundMode: 'CREDIT_TO_ACCOUNT',
    status: 'CONFIRMED',
    accountingVoucherNumber: 'CN/2026/0002',
    returnDate: '2026-10-26',
    approvedBy: 'Head of Billing',
  },
  {
    id: 'srtn_003',
    creditNoteNumber: 'CN/2026/0003',
    invoiceNumber: 'INV/2026/0002',
    customerName: 'Maharashtra State Educational Distributors',
    returnReason: 'WRONG_EDITION',
    bookTitle: 'Indian Constitutional Law: Bare Act & Cases',
    totalQuantity: 200,
    unitRate: 380,
    totalReturnAmount: 76000,
    condition: 'SALEABLE',
    refundMode: 'CREDIT_TO_ACCOUNT',
    status: 'PENDING_APPROVAL',
    returnDate: '2026-11-03',
  },
];

const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: 'prtn_001',
    debitNoteNumber: 'DN/2026/0001',
    invoiceNumber: 'PINV/2026/0001',
    supplierName: 'Ballarpur Paper Mills Ltd',
    returnReason: 'DAMAGED_PAPER',
    materialName: '70 GSM Natural Shade Maplitho Paper Reels',
    totalQuantity: 28,
    unitRate: 700,
    totalReturnAmount: 19600,
    status: 'CONFIRMED',
    accountingVoucherNumber: 'DN/2026/0001',
    returnDate: '2026-10-22',
  },
  {
    id: 'prtn_002',
    debitNoteNumber: 'DN/2026/0002',
    invoiceNumber: 'PINV/2026/0002',
    supplierName: 'JK Paper Mills Ltd',
    returnReason: 'REJECTED_STOCK',
    materialName: 'Art Coated Board 300 GSM for Book Covers',
    totalQuantity: 32,
    unitRate: 840,
    totalReturnAmount: 26880,
    status: 'CONFIRMED',
    accountingVoucherNumber: 'DN/2026/0002',
    returnDate: '2026-10-29',
  },
];

const INITIAL_DISTRIBUTOR_RETURNS: DistributorReturn[] = [
  {
    id: 'drtn_001',
    returnNumber: 'DRTN/2026/0001',
    distributorName: 'Eastern Book Distributors Kolkata',
    returnType: 'UNSOLD_RETURN',
    bookTitle: 'Higher Secondary Physics Vol 1',
    totalQuantity: 120,
    unitRate: 350,
    totalAmount: 42000,
    condition: 'SALEABLE',
    status: 'CONFIRMED',
    creditNoteNumber: 'CN/2026/0004',
    returnDate: '2026-10-25',
  },
  {
    id: 'drtn_002',
    returnNumber: 'DRTN/2026/0002',
    distributorName: 'Southern Book Agencies Chennai',
    returnType: 'UNSOLD_RETURN',
    bookTitle: 'Complete Inorganic Chemistry (NEET)',
    totalQuantity: 80,
    unitRate: 295,
    totalAmount: 23600,
    condition: 'SALEABLE',
    status: 'CONFIRMED',
    creditNoteNumber: 'CN/2026/0005',
    returnDate: '2026-11-01',
  },
];

const INITIAL_ADJUSTMENTS: FinancialAdjustment[] = [
  {
    id: 'adj_001',
    adjustmentNumber: 'ADJ/2026/0001',
    partyName: 'Oxford Book Store Pvt Ltd',
    partyType: 'CUSTOMER',
    adjustmentType: 'DISCOUNT_REBATE',
    totalAdjustmentAmount: 5000,
    reason: 'Special promotional volume rebate authorized for Class 10 launch',
    status: 'CONFIRMED',
    accountingVoucherNumber: 'CN/2026/0006',
    date: '2026-10-24',
  },
  {
    id: 'adj_002',
    adjustmentNumber: 'ADJ/2026/0002',
    partyName: 'Ballarpur Paper Mills Ltd',
    partyType: 'SUPPLIER',
    adjustmentType: 'SUPPLIER_DEBIT_NOTE',
    totalAdjustmentAmount: 8500,
    reason: 'Rate difference rebate credited on reel GSM shortage',
    status: 'CONFIRMED',
    accountingVoucherNumber: 'DN/2026/0003',
    date: '2026-10-28',
  },
];

const INITIAL_REFUNDS: RefundRecord[] = [
  {
    id: 'ref_001',
    refundNumber: 'REF/2026/0001',
    refundType: 'CUSTOMER_REFUND',
    partyName: 'Oxford Book Store Pvt Ltd',
    amount: 14750,
    paymentMethod: 'BANK_TRANSFER',
    status: 'CONFIRMED',
    accountingVoucherNumber: 'PV/2026/0108',
    refundDate: '2026-10-28',
    referenceNote: 'Settlement of CN/2026/0001 transit damage refund',
  },
];

const INITIAL_QUARANTINE: QuarantineStock[] = [
  {
    id: 'quar_001',
    bookId: 'bk_math_10',
    isbn: '978-81-7008-001-1',
    title: 'Senior Secondary Mathematics - Class 10',
    damagedQuantity: 90,
    quarantineDate: '2026-10-26',
    sourceReturnNumber: 'CN/2026/0001 & CN/2026/0002',
    inspectionNotes: 'Water ingress during regional carrier transit. Spine binding damaged.',
    status: 'QUARANTINED',
  },
  {
    id: 'quar_002',
    bookId: 'raw_paper_coated',
    isbn: 'RAW-PAP-COATED',
    title: 'Art Coated Board 300 GSM for Book Covers',
    damagedQuantity: 20,
    quarantineDate: '2026-10-29',
    sourceReturnNumber: 'DN/2026/0002',
    inspectionNotes: 'Rejected on arrival due to edge crushing in roll container.',
    status: 'QUARANTINED',
  },
];

// LocalStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
}

// ==========================================
// SALES RETURNS (CREDIT NOTES) API
// ==========================================
export function getStoredSalesReturns(): SalesReturn[] {
  return getFromStorage<SalesReturn[]>(STORAGE_KEYS.SALES_RETURNS, INITIAL_SALES_RETURNS);
}

export function saveSalesReturn(ret: Partial<SalesReturn>): { salesReturn: SalesReturn; glCreditNoteNumber?: string } {
  const current = getStoredSalesReturns();
  const qty = Number(ret.totalQuantity) || 1;
  const rate = Number(ret.unitRate) || 0;
  const total = Number(ret.totalReturnAmount) || qty * rate;
  const isOverThreshold = total > 25000;

  const id = ret.id || 'srtn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const creditNoteNumber = ret.creditNoteNumber || `CN/2026/${String(current.length + 1).padStart(4, '0')}`;
  const status = ret.status || (isOverThreshold ? 'PENDING_APPROVAL' : 'CONFIRMED');

  let accountingVoucherNumber = ret.accountingVoucherNumber;

  // If confirmed, post Credit Note to GL
  if (status === 'CONFIRMED' && !accountingVoucherNumber) {
    const glRecord = postDoubleEntryVoucher({
      voucherType: 'CREDIT_NOTE',
      date: ret.returnDate || new Date().toISOString().substring(0, 10),
      narration: `Sales Return & Credit Note for ${ret.customerName || 'Customer'} - ${ret.bookTitle || 'Books'} (${creditNoteNumber})`,
      totalAmount: total,
      branchName: 'Headquarters & Central Depot',
      createdByName: 'Returns Department',
      items: [
        {
          id: 'cn_dr_' + Date.now(),
          ledgerId: 'led_sales_return',
          ledgerName: 'Sales Returns & Trade Allowances',
          ledgerCode: '3020',
          costCentreName: 'Customer Returns & Claims',
          debitAmount: total,
          creditAmount: 0,
        },
        {
          id: 'cn_cr_' + Date.now(),
          ledgerId: 'led_debtors',
          ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
          ledgerCode: '1010',
          costCentreName: ret.customerName,
          debitAmount: 0,
          creditAmount: total,
        },
      ],
    });
    accountingVoucherNumber = glRecord.voucherNumber;

    // If damaged, push to quarantine bin
    if (ret.condition === 'DAMAGED') {
      addQuarantineStock({
        bookId: ret.bookId || 'bk_custom_' + Date.now(),
        isbn: ret.isbn || 'ISBN-RET-' + Math.floor(1000 + Math.random() * 9000),
        title: ret.bookTitle || 'Returned Book Stock',
        damagedQuantity: qty,
        quarantineDate: ret.returnDate || new Date().toISOString().substring(0, 10),
        sourceReturnNumber: creditNoteNumber,
        inspectionNotes: `Transit/Defect return from ${ret.customerName}: ${ret.returnReason}`,
      });
    }
  }

  const finalRecord: SalesReturn = {
    id,
    creditNoteNumber,
    invoiceNumber: ret.invoiceNumber || 'INV/2026/0001',
    customerName: ret.customerName || 'Customer Entity',
    customerId: ret.customerId,
    returnReason: ret.returnReason || 'TRANSIT_DAMAGE',
    bookTitle: ret.bookTitle || 'Book Title',
    bookId: ret.bookId,
    isbn: ret.isbn,
    totalQuantity: qty,
    unitRate: rate,
    totalReturnAmount: total,
    condition: ret.condition || 'DAMAGED',
    refundMode: ret.refundMode || 'CREDIT_TO_ACCOUNT',
    status,
    accountingVoucherNumber,
    returnDate: ret.returnDate || new Date().toISOString().substring(0, 10),
    approvedBy: status === 'CONFIRMED' ? (ret.approvedBy || 'Operations Lead') : undefined,
  };

  const existingIndex = current.findIndex((r) => r.id === id);
  let updatedList: SalesReturn[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalRecord;
  } else {
    updatedList = [finalRecord, ...current];
  }

  setToStorage(STORAGE_KEYS.SALES_RETURNS, updatedList);
  return { salesReturn: finalRecord, glCreditNoteNumber: accountingVoucherNumber };
}

export function approveSalesReturn(id: string, approver: string = 'Finance Controller'): SalesReturn | null {
  const returns = getStoredSalesReturns();
  const index = returns.findIndex((r) => r.id === id);
  if (index < 0) return null;

  const item = returns[index];
  if (item.status === 'CONFIRMED') return item;

  const today = new Date().toISOString().substring(0, 10);
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'CREDIT_NOTE',
    date: today,
    narration: `Sales Return Approval & Credit Note for ${item.customerName} - ${item.bookTitle} (${item.creditNoteNumber})`,
    totalAmount: item.totalReturnAmount,
    branchName: 'Headquarters & Central Depot',
    createdByName: approver,
    items: [
      {
        id: 'cn_dr_' + Date.now(),
        ledgerId: 'led_sales_return',
        ledgerName: 'Sales Returns & Trade Allowances',
        ledgerCode: '3020',
        costCentreName: 'Customer Returns & Claims',
        debitAmount: item.totalReturnAmount,
        creditAmount: 0,
      },
      {
        id: 'cn_cr_' + Date.now(),
        ledgerId: 'led_debtors',
        ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
        ledgerCode: '1010',
        costCentreName: item.customerName,
        debitAmount: 0,
        creditAmount: item.totalReturnAmount,
      },
    ],
  });

  const updated: SalesReturn = {
    ...item,
    status: 'CONFIRMED',
    accountingVoucherNumber: glRecord.voucherNumber,
    approvedBy: approver,
  };

  if (item.condition === 'DAMAGED') {
    addQuarantineStock({
      bookId: item.bookId || 'bk_custom_' + Date.now(),
      isbn: item.isbn || 'ISBN-RET-' + Math.floor(1000 + Math.random() * 9000),
      title: item.bookTitle,
      damagedQuantity: item.totalQuantity,
      quarantineDate: today,
      sourceReturnNumber: item.creditNoteNumber,
      inspectionNotes: `Transit/Defect approved return from ${item.customerName}: ${item.returnReason}`,
    });
  }

  returns[index] = updated;
  setToStorage(STORAGE_KEYS.SALES_RETURNS, returns);
  return updated;
}

export function reverseSalesReturn(id: string): SalesReturn | null {
  const returns = getStoredSalesReturns();
  const index = returns.findIndex((r) => r.id === id);
  if (index < 0) return null;

  returns[index] = { ...returns[index], status: 'REVERSED' };
  setToStorage(STORAGE_KEYS.SALES_RETURNS, returns);
  return returns[index];
}

// ==========================================
// PURCHASE RETURNS (DEBIT NOTES) API
// ==========================================
export function getStoredPurchaseReturns(): PurchaseReturn[] {
  return getFromStorage<PurchaseReturn[]>(STORAGE_KEYS.PURCHASE_RETURNS, INITIAL_PURCHASE_RETURNS);
}

export function savePurchaseReturn(pr: Partial<PurchaseReturn>): { purchaseReturn: PurchaseReturn; glDebitNoteNumber: string } {
  const current = getStoredPurchaseReturns();
  const qty = Number(pr.totalQuantity) || 1;
  const rate = Number(pr.unitRate) || 0;
  const total = Number(pr.totalReturnAmount) || qty * rate;

  const id = pr.id || 'prtn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const debitNoteNumber = pr.debitNoteNumber || `DN/2026/${String(current.length + 1).padStart(4, '0')}`;
  const today = pr.returnDate || new Date().toISOString().substring(0, 10);

  // Post Debit Note to GL
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'DEBIT_NOTE',
    date: today,
    narration: `Purchase Return & Debit Note to ${pr.supplierName || 'Supplier'} for ${pr.materialName || 'Raw Material/Print Stock'} (${debitNoteNumber})`,
    totalAmount: total,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Procurement QA',
    items: [
      {
        id: 'dn_dr_' + Date.now(),
        ledgerId: 'led_creditors',
        ledgerName: 'Trade Creditors - Paper Mills & Printers',
        ledgerCode: '2001',
        costCentreName: pr.supplierName,
        debitAmount: total,
        creditAmount: 0,
      },
      {
        id: 'dn_cr_' + Date.now(),
        ledgerId: 'led_purchase_return',
        ledgerName: 'Purchase Returns & Outward Allowances',
        ledgerCode: '5020',
        costCentreName: 'Procurement Returns',
        debitAmount: 0,
        creditAmount: total,
      },
    ],
  });

  const finalRecord: PurchaseReturn = {
    id,
    debitNoteNumber,
    invoiceNumber: pr.invoiceNumber || 'PINV/2026/0001',
    supplierName: pr.supplierName || 'Supplier Entity',
    supplierId: pr.supplierId,
    returnReason: pr.returnReason || 'DAMAGED_PAPER',
    materialName: pr.materialName || 'Raw Paper Stock',
    totalQuantity: qty,
    unitRate: rate,
    totalReturnAmount: total,
    status: 'CONFIRMED',
    accountingVoucherNumber: glRecord.voucherNumber,
    returnDate: today,
  };

  const updatedList = [finalRecord, ...current];
  setToStorage(STORAGE_KEYS.PURCHASE_RETURNS, updatedList);
  return { purchaseReturn: finalRecord, glDebitNoteNumber: glRecord.voucherNumber };
}

// ==========================================
// DISTRIBUTOR CONSIGNMENT RETURNS API
// ==========================================
export function getStoredDistributorReturns(): DistributorReturn[] {
  return getFromStorage<DistributorReturn[]>(STORAGE_KEYS.DISTRIBUTOR_RETURNS, INITIAL_DISTRIBUTOR_RETURNS);
}

export function saveDistributorReturn(dr: Partial<DistributorReturn>): DistributorReturn {
  const current = getStoredDistributorReturns();
  const id = dr.id || 'drtn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const returnNumber = dr.returnNumber || `DRTN/2026/${String(current.length + 1).padStart(4, '0')}`;
  const qty = Number(dr.totalQuantity) || 1;
  const rate = Number(dr.unitRate) || 0;
  const total = Number(dr.totalAmount) || qty * rate;
  const creditNoteNum = dr.creditNoteNumber || `CN/2026/${Math.floor(1000 + Math.random() * 9000)}`;

  const finalRecord: DistributorReturn = {
    id,
    returnNumber,
    distributorName: dr.distributorName || 'Distributor Partner',
    distributorId: dr.distributorId,
    returnType: dr.returnType || 'UNSOLD_RETURN',
    bookTitle: dr.bookTitle || 'Catalogue Title',
    totalQuantity: qty,
    unitRate: rate,
    totalAmount: total,
    condition: dr.condition || 'SALEABLE',
    status: dr.status || 'CONFIRMED',
    creditNoteNumber: creditNoteNum,
    returnDate: dr.returnDate || new Date().toISOString().substring(0, 10),
  };

  const updatedList = [finalRecord, ...current];
  setToStorage(STORAGE_KEYS.DISTRIBUTOR_RETURNS, updatedList);
  return finalRecord;
}

// ==========================================
// FINANCIAL ADJUSTMENTS API
// ==========================================
export function getStoredAdjustments(): FinancialAdjustment[] {
  return getFromStorage<FinancialAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
}

export function saveAdjustment(adj: Partial<FinancialAdjustment>): { adjustment: FinancialAdjustment; glVoucherNumber: string } {
  const current = getStoredAdjustments();
  const id = adj.id || 'adj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const adjustmentNumber = adj.adjustmentNumber || `ADJ/2026/${String(current.length + 1).padStart(4, '0')}`;
  const amount = Number(adj.totalAdjustmentAmount) || 0;
  const today = adj.date || new Date().toISOString().substring(0, 10);
  const isCustomer = adj.partyType === 'CUSTOMER';

  const glRecord = postDoubleEntryVoucher({
    voucherType: isCustomer ? 'CREDIT_NOTE' : 'DEBIT_NOTE',
    date: today,
    narration: `Financial Adjustment (${adj.adjustmentType}): ${adj.partyName} - ${adj.reason} (${adjustmentNumber})`,
    totalAmount: amount,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Financial Controller',
    items: isCustomer
      ? [
          {
            id: 'adj_dr_' + Date.now(),
            ledgerId: 'led_discount_exp',
            ledgerName: 'Trade Discounts & Customer Rebates',
            ledgerCode: '4030',
            costCentreName: adj.partyName,
            debitAmount: amount,
            creditAmount: 0,
          },
          {
            id: 'adj_cr_' + Date.now(),
            ledgerId: 'led_debtors',
            ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
            ledgerCode: '1010',
            costCentreName: adj.partyName,
            debitAmount: 0,
            creditAmount: amount,
          },
        ]
      : [
          {
            id: 'adj_dr_' + Date.now(),
            ledgerId: 'led_creditors',
            ledgerName: 'Trade Creditors - Paper Mills & Printers',
            ledgerCode: '2001',
            costCentreName: adj.partyName,
            debitAmount: amount,
            creditAmount: 0,
          },
          {
            id: 'adj_cr_' + Date.now(),
            ledgerId: 'led_purchase_rebate',
            ledgerName: 'Supplier Discounts & Rate Rebates',
            ledgerCode: '5030',
            costCentreName: adj.partyName,
            debitAmount: 0,
            creditAmount: amount,
          },
        ],
  });

  const finalRecord: FinancialAdjustment = {
    id,
    adjustmentNumber,
    partyName: adj.partyName || 'Party Entity',
    partyType: adj.partyType || 'CUSTOMER',
    adjustmentType: adj.adjustmentType || 'DISCOUNT_REBATE',
    totalAdjustmentAmount: amount,
    reason: adj.reason || 'Financial reconciliation rebate',
    status: 'CONFIRMED',
    accountingVoucherNumber: glRecord.voucherNumber,
    date: today,
  };

  const updatedList = [finalRecord, ...current];
  setToStorage(STORAGE_KEYS.ADJUSTMENTS, updatedList);
  return { adjustment: finalRecord, glVoucherNumber: glRecord.voucherNumber };
}

// ==========================================
// DIRECT REFUNDS API
// ==========================================
export function getStoredRefunds(): RefundRecord[] {
  return getFromStorage<RefundRecord[]>(STORAGE_KEYS.REFUNDS, INITIAL_REFUNDS);
}

export function saveRefund(ref: Partial<RefundRecord>): { refund: RefundRecord; glPaymentVoucher: string } {
  const current = getStoredRefunds();
  const id = ref.id || 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const refundNumber = ref.refundNumber || `REF/2026/${String(current.length + 1).padStart(4, '0')}`;
  const amount = Number(ref.amount) || 0;
  const today = ref.refundDate || new Date().toISOString().substring(0, 10);

  // Post Payment Voucher to GL
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'PAYMENT_VOUCHER',
    date: today,
    narration: `Direct Refund Payout to ${ref.partyName} via ${ref.paymentMethod} (${refundNumber})`,
    totalAmount: amount,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Treasury & Disbursements',
    items: [
      {
        id: 'ref_dr_' + Date.now(),
        ledgerId: 'led_debtors',
        ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
        ledgerCode: '1010',
        costCentreName: ref.partyName,
        debitAmount: amount,
        creditAmount: 0,
      },
      {
        id: 'ref_cr_' + Date.now(),
        ledgerId: ref.paymentMethod === 'CASH' ? 'led_cash' : 'led_bank_hdfc',
        ledgerName: ref.paymentMethod === 'CASH' ? 'Central Depot Cash Chest' : 'HDFC Bank Corporate Current A/c',
        ledgerCode: ref.paymentMethod === 'CASH' ? '1001' : '1002',
        debitAmount: 0,
        creditAmount: amount,
      },
    ],
  });

  const finalRecord: RefundRecord = {
    id,
    refundNumber,
    refundType: ref.refundType || 'CUSTOMER_REFUND',
    partyName: ref.partyName || 'Customer Party',
    amount,
    paymentMethod: ref.paymentMethod || 'BANK_TRANSFER',
    status: 'CONFIRMED',
    accountingVoucherNumber: glRecord.voucherNumber,
    refundDate: today,
    referenceNote: ref.referenceNote,
  };

  const updatedList = [finalRecord, ...current];
  setToStorage(STORAGE_KEYS.REFUNDS, updatedList);
  return { refund: finalRecord, glPaymentVoucher: glRecord.voucherNumber };
}

// ==========================================
// DAMAGED STOCK QUARANTINE BIN API
// ==========================================
export function getStoredQuarantine(): QuarantineStock[] {
  return getFromStorage<QuarantineStock[]>(STORAGE_KEYS.QUARANTINE, INITIAL_QUARANTINE);
}

export function addQuarantineStock(item: Partial<QuarantineStock>): QuarantineStock {
  const current = getStoredQuarantine();
  const id = item.id || 'quar_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const finalRecord: QuarantineStock = {
    id,
    bookId: item.bookId || 'bk_general',
    isbn: item.isbn || 'ISBN-QUAR',
    title: item.title || 'Quarantined Title',
    damagedQuantity: Number(item.damagedQuantity) || 1,
    quarantineDate: item.quarantineDate || new Date().toISOString().substring(0, 10),
    sourceReturnNumber: item.sourceReturnNumber || 'DIRECT-INSPECTION',
    inspectionNotes: item.inspectionNotes || 'Stock isolated due to damage',
    status: item.status || 'QUARANTINED',
  };

  const updated = [finalRecord, ...current];
  setToStorage(STORAGE_KEYS.QUARANTINE, updated);
  return finalRecord;
}

export function scrapQuarantineStock(id: string): { item: QuarantineStock; glJournalVoucher: string } | null {
  const current = getStoredQuarantine();
  const index = current.findIndex((q) => q.id === id);
  if (index < 0) return null;

  const item = current[index];
  const lossValue = item.damagedQuantity * 150; // estimated cost basis
  const today = new Date().toISOString().substring(0, 10);

  const glRecord = postDoubleEntryVoucher({
    voucherType: 'JOURNAL',
    date: today,
    narration: `Damaged Stock Scrap Write-Off for ${item.title} (${item.damagedQuantity} copies quarantined under ${item.sourceReturnNumber})`,
    totalAmount: lossValue,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Depot Warehouse Manager',
    items: [
      {
        id: 'loss_dr_' + Date.now(),
        ledgerId: 'led_loss_damage',
        ledgerName: 'Loss on Damaged, Defective & Scrapped Books',
        ledgerCode: '5090',
        costCentreName: 'Quarantine Scrap Write-off',
        debitAmount: lossValue,
        creditAmount: 0,
      },
      {
        id: 'loss_cr_' + Date.now(),
        ledgerId: 'led_stock_fg',
        ledgerName: 'Finished Goods Stock - Books',
        ledgerCode: '1020',
        costCentreName: 'Central Depot Stock',
        debitAmount: 0,
        creditAmount: lossValue,
      },
    ],
  });

  const updatedItem: QuarantineStock = {
    ...item,
    status: 'SCRAPPED',
  };

  current[index] = updatedItem;
  setToStorage(STORAGE_KEYS.QUARANTINE, current);
  return { item: updatedItem, glJournalVoucher: glRecord.voucherNumber };
}

// ==========================================
// KPIS & DISTRIBUTOR CONSIGNMENT RECONCILIATION
// ==========================================
export interface ReturnKpis {
  totalSalesReturnsAmount: number;
  confirmedSalesReturnsCount: number;
  pendingSalesReturnsCount: number;
  totalPurchaseReturnsAmount: number;
  purchaseReturnsCount: number;
  totalQuarantineCopies: number;
  quarantineBinsCount: number;
  totalRefundsAmount: number;
  refundsCount: number;
}

export function computeReturnKpis(): ReturnKpis {
  const sReturns = getStoredSalesReturns();
  const pReturns = getStoredPurchaseReturns();
  const quarantine = getStoredQuarantine().filter((q) => q.status === 'QUARANTINED');
  const refunds = getStoredRefunds();

  const confirmedSR = sReturns.filter((r) => r.status === 'CONFIRMED');
  const confirmedSRTotal = confirmedSR.reduce((s, r) => s + r.totalReturnAmount, 0);
  const pendingSRCount = sReturns.filter((r) => r.status === 'PENDING_APPROVAL').length;

  const confirmedPR = pReturns.filter((r) => r.status === 'CONFIRMED');
  const confirmedPRTotal = confirmedPR.reduce((s, r) => s + r.totalReturnAmount, 0);

  const quarCopies = quarantine.reduce((s, q) => s + q.damagedQuantity, 0);
  const refundsTotal = refunds.reduce((s, r) => s + r.amount, 0);

  return {
    totalSalesReturnsAmount: confirmedSRTotal,
    confirmedSalesReturnsCount: confirmedSR.length,
    pendingSalesReturnsCount: pendingSRCount,
    totalPurchaseReturnsAmount: confirmedPRTotal,
    purchaseReturnsCount: confirmedPR.length,
    totalQuarantineCopies: quarCopies,
    quarantineBinsCount: quarantine.length,
    totalRefundsAmount: refundsTotal,
    refundsCount: refunds.length,
  };
}

export interface DistributorReconciliation {
  distributorName: string;
  dispatchedCopies: number;
  dispatchedValue: number;
  secondarySalesCopies: number;
  secondarySalesValue: number;
  returnedCopies: number;
  returnedValue: number;
  unsoldBalanceCopies: number;
  unsoldBalanceValue: number;
  netSettlementDue: number;
}

export function computeDistributorReconciliation(distributorName: string = 'Eastern Book Distributors Kolkata'): DistributorReconciliation {
  const returns = getStoredDistributorReturns().filter(
    (d) => d.distributorName.toLowerCase() === distributorName.toLowerCase()
  );

  const returnedCopies = returns.reduce((s, d) => s + d.totalQuantity, 0);
  const returnedValue = returns.reduce((s, d) => s + d.totalAmount, 0);

  const initialCopies = 1000;
  const initialValue = 350000;
  const secondarySalesCopies = 680;
  const secondarySalesValue = 238000;

  const unsoldCopies = Math.max(0, initialCopies - secondarySalesCopies - returnedCopies);
  const unsoldValue = unsoldCopies * 350;
  const netDue = Math.max(0, secondarySalesValue - returnedValue);

  return {
    distributorName,
    dispatchedCopies: initialCopies,
    dispatchedValue: initialValue,
    secondarySalesCopies,
    secondarySalesValue,
    returnedCopies,
    returnedValue,
    unsoldBalanceCopies: unsoldCopies,
    unsoldBalanceValue: unsoldValue,
    netSettlementDue: netDue,
  };
}
