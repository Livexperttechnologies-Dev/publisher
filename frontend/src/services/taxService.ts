import { postDoubleEntryVoucher } from './voucherService';
import { getStoredInvoices as getStoredSalesInvoices } from './salesService';
import { getStoredInvoices as getStoredPurchaseInvoices, getStoredReturns as getStoredPurchaseReturns } from './purchaseService';
import { getStoredCalculations as getStoredRoyaltyCalculations } from './royaltyService';

export interface GstRateItem {
  id: string;
  hsnSacCode: string;
  description: string;
  itemType: 'GOODS' | 'SERVICES';
  igstRate: number;
  cgstRate: number;
  sgstRate: number;
  cessRate: number;
  isExempt: boolean;
  exemptionNotification?: string;
  status: 'ACTIVE' | 'INACTIVE';
  adminReviewed: boolean;
  reviewedBy?: string;
  effectiveFrom?: string;
}

export interface TaxInvoiceItem {
  id: string;
  docType: 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  invoiceNumber: string;
  invoiceDate: string;
  recipientName: string;
  recipientGstin?: string;
  recipientType: 'B2B' | 'B2C' | 'EXEMPT';
  placeOfSupply: string;
  isInterState: boolean;
  pricingType: 'EXCLUSIVE' | 'INCLUSIVE';
  hsnCode: string;
  totalTaxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  accountingVoucherNumber?: string;
  irn?: string;
  irnStatus?: 'GENERATED' | 'PENDING' | 'NOT_APPLICABLE';
  ewbNumber?: string;
  status: 'GENERATED' | 'CANCELLED';
  notes?: string;
}

export interface TdsDeductionItem {
  id: string;
  partyName: string;
  partyPan: string;
  isPanValid: boolean;
  sectionCode: string;
  billOrPaymentRef: string;
  paymentDate: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  form16aCertificateNumber: string;
  accountingVoucherNumber?: string;
  notes?: string;
}

export interface EWayBillItem {
  id: string;
  ewbNumber: string;
  docNumber: string;
  docDate: string;
  fromGstin: string;
  toGstin: string;
  toPartyName: string;
  transporterName: string;
  vehicleNumber: string;
  distanceKm: number;
  validUntil: string;
  totalInvoiceValue: number;
  status: 'ACTIVE' | 'EXTENDED' | 'CANCELLED';
  notes?: string;
}

const STORAGE_KEYS = {
  GST_RATES: 'kibo360_tax_gst_rates_v2',
  TAX_INVOICES: 'kibo360_tax_invoices_v2',
  TDS_RECORDS: 'kibo360_tax_tds_records_v2',
  EWAY_BILLS: 'kibo360_tax_eway_bills_v2',
};

// Initial Seed Data for HSN & GST Rates
export const INITIAL_GST_RATES: GstRateItem[] = [
  {
    id: 'gst_rate_4901',
    hsnSacCode: '4901',
    description: 'Printed Books, brochures, leaflets, and academic textbooks (Exempt from GST)',
    itemType: 'GOODS',
    igstRate: 0.0,
    cgstRate: 0.0,
    sgstRate: 0.0,
    cessRate: 0.0,
    isExempt: true,
    exemptionNotification: 'Notification No. 02/2017-Central Tax (Rate)',
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Chief Financial Officer (CFO)',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_4903',
    hsnSacCode: '4903',
    description: "Children's picture, drawing or colouring books (Exempt from GST)",
    itemType: 'GOODS',
    igstRate: 0.0,
    cgstRate: 0.0,
    sgstRate: 0.0,
    cessRate: 0.0,
    isExempt: true,
    exemptionNotification: 'Notification No. 02/2017-Central Tax (Rate)',
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Chief Financial Officer (CFO)',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_4905',
    hsnSacCode: '4905',
    description: 'Maps, atlases, wall charts, topographical plans and globes (12% GST)',
    itemType: 'GOODS',
    igstRate: 12.0,
    cgstRate: 6.0,
    sgstRate: 6.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Taxation Manager',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_4802',
    hsnSacCode: '4802',
    description: 'Uncoated Maplitho printing paper and writing reels/sheets (12% GST)',
    itemType: 'GOODS',
    igstRate: 12.0,
    cgstRate: 6.0,
    sgstRate: 6.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Taxation Manager',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_9989',
    hsnSacCode: '9989',
    description: 'Job work services by way of printing of academic and trade books (12% GST)',
    itemType: 'SERVICES',
    igstRate: 12.0,
    cgstRate: 6.0,
    sgstRate: 6.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Chief Financial Officer (CFO)',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_9973',
    hsnSacCode: '9973',
    description: 'Licensing services for publishing rights, author copyright & translations (18% GST)',
    itemType: 'SERVICES',
    igstRate: 18.0,
    cgstRate: 9.0,
    sgstRate: 9.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Chief Financial Officer (CFO)',
    effectiveFrom: '2017-07-01',
  },
  {
    id: 'gst_rate_4911',
    hsnSacCode: '4911',
    description: 'Other printed trade catalogues, advertising materials, posters and marketing collateral (18% GST)',
    itemType: 'GOODS',
    igstRate: 18.0,
    cgstRate: 9.0,
    sgstRate: 9.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
    adminReviewed: true,
    reviewedBy: 'Senior Tax Auditor',
    effectiveFrom: '2017-07-01',
  },
];

// Initial Seed Data for Tax Invoices
export const INITIAL_TAX_INVOICES: TaxInvoiceItem[] = [
  {
    id: 'txinv_01',
    docType: 'TAX_INVOICE',
    invoiceNumber: 'INV/2026/0101',
    invoiceDate: '2026-11-04',
    recipientName: 'Apex Western Educational Distributors Pvt Ltd',
    recipientGstin: '27AABCT9918D1Z4',
    recipientType: 'B2B',
    placeOfSupply: '27 (Maharashtra)',
    isInterState: true,
    pricingType: 'EXCLUSIVE',
    hsnCode: '4905',
    totalTaxableValue: 80000.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    igstAmount: 9600.0,
    grandTotal: 89600.0,
    accountingVoucherNumber: 'SV/2026/0002',
    irn: '86c2ad16fe4f0ad8e11982bca192837261928371625348291029384756102938',
    irnStatus: 'GENERATED',
    ewbNumber: '243391742446',
    status: 'GENERATED',
    notes: 'Interstate sale of educational school atlases & science charts',
  },
  {
    id: 'txinv_02',
    docType: 'BILL_OF_SUPPLY',
    invoiceNumber: 'BOS/2026/0001',
    invoiceDate: '2026-11-03',
    recipientName: 'Oxford Book Store (Connaught Place)',
    recipientGstin: '07AAABO9912K1Z9',
    recipientType: 'EXEMPT',
    placeOfSupply: '07 (Delhi)',
    isInterState: false,
    pricingType: 'EXCLUSIVE',
    hsnCode: '4901',
    totalTaxableValue: 247500.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    igstAmount: 0.0,
    grandTotal: 247500.0,
    accountingVoucherNumber: 'SV/2026/0001',
    irnStatus: 'NOT_APPLICABLE',
    status: 'GENERATED',
    notes: 'Intrastate wholesale supply of printed academic physics & maths books (Nil-rated HSN 4901)',
  },
  {
    id: 'txinv_03',
    docType: 'CREDIT_NOTE',
    invoiceNumber: 'CN/2026/0012',
    invoiceDate: '2026-11-04',
    recipientName: 'Apex Western Educational Distributors Pvt Ltd',
    recipientGstin: '27AABCT9918D1Z4',
    recipientType: 'B2B',
    placeOfSupply: '27 (Maharashtra)',
    isInterState: true,
    pricingType: 'EXCLUSIVE',
    hsnCode: '4905',
    totalTaxableValue: 8000.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    igstAmount: 960.0,
    grandTotal: 8960.0,
    accountingVoucherNumber: 'CN/2026/0001',
    irnStatus: 'NOT_APPLICABLE',
    status: 'GENERATED',
    notes: 'Credit note issued against transit damage on atlas shipment',
  },
];

// Initial Seed Data for TDS Deductions
export const INITIAL_TDS_RECORDS: TdsDeductionItem[] = [
  {
    id: 'tds_01',
    partyName: 'Prof. H. C. Verma',
    partyPan: 'AAAPV1982K',
    isPanValid: true,
    sectionCode: '194J - Author Book Royalty (10%)',
    billOrPaymentRef: 'ROYS/2026/0001',
    paymentDate: '2026-10-05',
    grossAmount: 212850.0,
    tdsRate: 10.0,
    tdsAmount: 21285.0,
    netAmount: 191565.0,
    form16aCertificateNumber: 'CERT-16A/2026-27/49182',
    accountingVoucherNumber: 'PV/2026/0772',
    notes: 'Q2 FY26-27 author royalty TDS deduction deposited in central challan',
  },
  {
    id: 'tds_02',
    partyName: 'Dr. R. D. Sharma',
    partyPan: 'AAAPS4512R',
    isPanValid: true,
    sectionCode: '194J - Author Book Royalty (10%)',
    billOrPaymentRef: 'RCAL/2026/0003',
    paymentDate: '2026-10-02',
    grossAmount: 115025.0,
    tdsRate: 10.0,
    tdsAmount: 11502.5,
    netAmount: 103522.5,
    form16aCertificateNumber: 'CERT-16A/2026-27/49183',
    accountingVoucherNumber: 'JV/2026/0774',
    notes: 'Quarterly mathematics book royalty accrual TDS u/s 194J',
  },
  {
    id: 'tds_03',
    partyName: 'Classic Offset Printers & Book Binders',
    partyPan: 'AAACG5541L',
    isPanValid: true,
    sectionCode: '194C - Printing Presses Corporate (2%)',
    billOrPaymentRef: 'BILT/INV/9821',
    paymentDate: '2026-10-25',
    grossAmount: 140000.0,
    tdsRate: 2.0,
    tdsAmount: 2800.0,
    netAmount: 137200.0,
    form16aCertificateNumber: 'CERT-16A/2026-27/49184',
    accountingVoucherNumber: 'PB/2026/0001',
    notes: 'Job work printing contract payment TDS deduction',
  },
  {
    id: 'tds_04',
    partyName: 'Freelance Editorial Reviewer (No PAN Provided)',
    partyPan: 'NOTPROVIDED',
    isPanValid: false,
    sectionCode: '194J - Technical Fees (20% Sec 206AA)',
    billOrPaymentRef: 'BILL/2026/8812',
    paymentDate: '2026-11-04',
    grossAmount: 50000.0,
    tdsRate: 20.0,
    tdsAmount: 10000.0,
    netAmount: 40000.0,
    form16aCertificateNumber: 'CERT-16A/2026-27/49185',
    accountingVoucherNumber: 'JV/2026/0885',
    notes: 'Penal 20% withholding rate enforced under Section 206AA due to missing PAN',
  },
];

// Initial Seed Data for E-Way Bills
export const INITIAL_EWAY_BILLS: EWayBillItem[] = [
  {
    id: 'ewb_01',
    ewbNumber: '243391742446',
    docNumber: 'INV/2026/0101',
    docDate: '2026-11-04',
    fromGstin: '07AAACK1234D1Z5',
    toGstin: '27AABCT9918D1Z4',
    toPartyName: 'Apex Western Educational Distributors Pvt Ltd',
    transporterName: 'VRL Logistics India Ltd.',
    vehicleNumber: 'DL-01-AB-9921',
    distanceKm: 650,
    validUntil: '2026-11-08T23:59:59Z',
    totalInvoiceValue: 89600.0,
    status: 'ACTIVE',
    notes: 'Consignment in transit: Delhi Central Press Depot to Bhiwandi Western Hub (4 days validity)',
  },
];

// Helper Functions for LocalStorage
export function getStoredGstRates(): GstRateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GST_RATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GST_RATES, JSON.stringify(INITIAL_GST_RATES));
      return INITIAL_GST_RATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GST_RATES;
  }
}

export function saveStoredGstRates(items: GstRateItem[]) {
  localStorage.setItem(STORAGE_KEYS.GST_RATES, JSON.stringify(items));
}

export function saveGstRateItem(item: Partial<GstRateItem>): GstRateItem {
  const list = getStoredGstRates();
  if (item.id) {
    const idx = list.findIndex((r) => r.id === item.id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...item } as GstRateItem;
      list[idx] = updated;
      saveStoredGstRates(list);
      return updated;
    }
  }

  const igst = Number(item.igstRate) || 0;
  const created: GstRateItem = {
    id: 'gst_rate_' + (item.hsnSacCode || Date.now().toString()),
    hsnSacCode: item.hsnSacCode || '4911',
    description: item.description || 'Configured classification',
    itemType: item.itemType || 'GOODS',
    igstRate: item.isExempt ? 0 : igst,
    cgstRate: item.isExempt ? 0 : igst / 2,
    sgstRate: item.isExempt ? 0 : igst / 2,
    cessRate: Number(item.cessRate) || 0,
    isExempt: Boolean(item.isExempt),
    exemptionNotification: item.exemptionNotification,
    status: item.status || 'ACTIVE',
    adminReviewed: true,
    reviewedBy: item.reviewedBy || 'Statutory Tax Officer',
    effectiveFrom: item.effectiveFrom || new Date().toISOString().slice(0, 10),
  };

  const updated = [created, ...list.filter((r) => r.hsnSacCode !== created.hsnSacCode)];
  saveStoredGstRates(updated);
  return created;
}

export function deleteGstRateItem(id: string): boolean {
  const list = getStoredGstRates();
  const filtered = list.filter((r) => r.id !== id);
  if (filtered.length !== list.length) {
    saveStoredGstRates(filtered);
    return true;
  }
  return false;
}

export function getStoredTaxInvoices(): TaxInvoiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TAX_INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TAX_INVOICES, JSON.stringify(INITIAL_TAX_INVOICES));
      return INITIAL_TAX_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TAX_INVOICES;
  }
}

export function saveStoredTaxInvoices(items: TaxInvoiceItem[]) {
  localStorage.setItem(STORAGE_KEYS.TAX_INVOICES, JSON.stringify(items));
}

export function generateEInvoiceIrn(invoiceId: string): TaxInvoiceItem {
  const list = getStoredTaxInvoices();
  const target = list.find((i) => i.id === invoiceId);
  if (!target) {
    throw new Error('Invoice not found');
  }

  // Generate deterministic 64-character SHA-256 simulation hash
  const rawData = `${target.recipientGstin || 'URP'}2026-2027${target.docType}${target.invoiceNumber}${Date.now()}`;
  let hash = '';
  for (let i = 0; i < rawData.length; i++) {
    const code = (rawData.charCodeAt(i) * 31 + i * 17) % 65536;
    hash += code.toString(16).padStart(4, '0');
  }
  const fakeIrn = (hash + '86c2ad16fe4f0ad8e11982bca192837261928371625348291029384756102938').substring(0, 64);

  target.irn = fakeIrn;
  target.irnStatus = 'GENERATED';
  saveStoredTaxInvoices(list);
  return target;
}

export function createTaxInvoice(data: {
  docType: 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  recipientName: string;
  recipientGstin?: string;
  placeOfSupply: string;
  isInterState: boolean;
  pricingType: 'EXCLUSIVE' | 'INCLUSIVE';
  hsnCode: string;
  taxableValue: number;
  taxRate: number;
  notes?: string;
}): TaxInvoiceItem {
  const list = getStoredTaxInvoices();
  const year = new Date().getFullYear();
  const nextNum = list.length + 1;
  const prefix =
    data.docType === 'TAX_INVOICE'
      ? 'INV'
      : data.docType === 'BILL_OF_SUPPLY'
      ? 'BOS'
      : data.docType === 'CREDIT_NOTE'
      ? 'CN'
      : 'DN';
  const invoiceNumber = `${prefix}/${year}/${String(nextNum).padStart(4, '0')}`;
  const voucherNumber = `VCH/${year}/${String(nextNum + 100).padStart(4, '0')}`;

  const taxable = Math.round(Number(data.taxableValue) * 100) / 100;
  const taxRate = Number(data.taxRate) || 0;
  const totalTax = Math.round(taxable * (taxRate / 100) * 100) / 100;

  const cgst = !data.isInterState ? Math.round(totalTax / 2 * 100) / 100 : 0;
  const sgst = !data.isInterState ? Math.round(totalTax / 2 * 100) / 100 : 0;
  const igst = data.isInterState ? totalTax : 0;
  const grandTotal = Math.round((taxable + totalTax) * 100) / 100;

  const created: TaxInvoiceItem = {
    id: 'txinv_' + Date.now(),
    docType: data.docType,
    invoiceNumber,
    invoiceDate: new Date().toISOString().slice(0, 10),
    recipientName: data.recipientName,
    recipientGstin: (data.recipientGstin || '').toUpperCase(),
    recipientType: data.recipientGstin ? 'B2B' : data.docType === 'BILL_OF_SUPPLY' ? 'EXEMPT' : 'B2C',
    placeOfSupply: data.placeOfSupply,
    isInterState: data.isInterState,
    pricingType: data.pricingType,
    hsnCode: data.hsnCode,
    totalTaxableValue: taxable,
    cgstAmount: cgst,
    sgstAmount: sgst,
    igstAmount: igst,
    grandTotal,
    accountingVoucherNumber: voucherNumber,
    irnStatus: data.docType === 'TAX_INVOICE' && data.recipientGstin ? 'PENDING' : 'NOT_APPLICABLE',
    status: 'GENERATED',
    notes: data.notes,
  };

  const updated = [created, ...list];
  saveStoredTaxInvoices(updated);
  return created;
}

export function getStoredTdsRecords(): TdsDeductionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TDS_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TDS_RECORDS, JSON.stringify(INITIAL_TDS_RECORDS));
      return INITIAL_TDS_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TDS_RECORDS;
  }
}

export function saveStoredTdsRecords(items: TdsDeductionItem[]) {
  localStorage.setItem(STORAGE_KEYS.TDS_RECORDS, JSON.stringify(items));
}

export function recordTdsDeduction(data: {
  partyName: string;
  partyPan: string;
  sectionCode: string;
  grossAmount: number;
  billOrPaymentRef?: string;
  notes?: string;
}): TdsDeductionItem {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const cleanPan = (data.partyPan || '').trim().toUpperCase();
  const isPanValid = panRegex.test(cleanPan);

  const gross = Math.max(0, Number(data.grossAmount) || 0);

  // Statutory Rates:
  // Section 194J (Royalties/Professional): 10%
  // Section 194C (Contractors / Presses): 2% Company, 1% Individual
  // Section 194I (Rent): 10%
  // Penal rate under Section 206AA for missing/invalid PAN: 20%
  let baseRate = 10.0;
  if (data.sectionCode.includes('194C_COMPANY')) baseRate = 2.0;
  else if (data.sectionCode.includes('194C_INDIVIDUAL')) baseRate = 1.0;
  else if (data.sectionCode.includes('194I')) baseRate = 10.0;

  const effectiveRate = isPanValid ? baseRate : 20.0;
  const tdsAmount = Math.round(gross * (effectiveRate / 100) * 100) / 100;
  const netAmount = Math.round((gross - tdsAmount) * 100) / 100;

  const records = getStoredTdsRecords();
  const year = new Date().getFullYear();
  const nextNum = records.length + 1;
  const certNum = `CERT-16A/${year}-${year + 1}/${String(nextNum + 49180).padStart(5, '0')}`;
  const voucherNum = `JV/${year}/${String(nextNum + 880).padStart(4, '0')}`;

  // Post Double-Entry General Ledger Voucher
  try {
    postDoubleEntryVoucher({
      voucherType: 'JOURNAL',
      date: new Date().toISOString().slice(0, 10),
      narration: `TDS Deduction u/s ${data.sectionCode} (${effectiveRate}%) on ${data.partyName} - Ref: ${data.billOrPaymentRef || certNum}`,
      totalAmount: gross,
      branchName: 'Headquarters & Accounts Division',
      createdByName: 'Direct Taxation Officer',
      items: [
        {
          id: '1',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors / Vendors & Authors Payable',
          ledgerCode: '2001',
          debitAmount: gross,
          creditAmount: 0,
          description: `Gross disbursement to ${data.partyName}`,
        },
        {
          id: '2',
          ledgerId: 'led_tds_payable',
          ledgerName: 'TDS Payable (Sec 194J/194C on Royalties & Contracts)',
          ledgerCode: '2020',
          debitAmount: 0,
          creditAmount: tdsAmount,
          description: `TDS Withheld u/s ${data.sectionCode} (${cleanPan})`,
        },
        {
          id: '3',
          ledgerId: 'led_bank_hdfc',
          ledgerName: 'HDFC Bank Corporate Current A/c',
          ledgerCode: '1002',
          debitAmount: 0,
          creditAmount: netAmount,
          description: `Net payment after TDS deduction to ${data.partyName}`,
        },
      ],
    });
  } catch (err) {
    console.warn('Could not post auto GL voucher for TDS deduction:', err);
  }

  const created: TdsDeductionItem = {
    id: 'tds_' + Date.now(),
    partyName: data.partyName,
    partyPan: cleanPan || 'NOTPROVIDED',
    isPanValid,
    sectionCode: `${data.sectionCode} (${effectiveRate}%${!isPanValid ? ' Sec 206AA' : ''})`,
    billOrPaymentRef: data.billOrPaymentRef || `BILL/${year}/${String(nextNum + 200).padStart(4, '0')}`,
    paymentDate: new Date().toISOString().slice(0, 10),
    grossAmount: gross,
    tdsRate: effectiveRate,
    tdsAmount,
    netAmount,
    form16aCertificateNumber: certNum,
    accountingVoucherNumber: voucherNum,
    notes: data.notes,
  };

  const updated = [created, ...records];
  saveStoredTdsRecords(updated);
  return created;
}

export function getStoredEWayBills(): EWayBillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EWAY_BILLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EWAY_BILLS, JSON.stringify(INITIAL_EWAY_BILLS));
      return INITIAL_EWAY_BILLS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EWAY_BILLS;
  }
}

export function saveStoredEWayBills(items: EWayBillItem[]) {
  localStorage.setItem(STORAGE_KEYS.EWAY_BILLS, JSON.stringify(items));
}

export function createEWayBill(data: {
  docNumber: string;
  toGstin: string;
  toPartyName: string;
  transporterName: string;
  vehicleNumber: string;
  distanceKm: number;
  totalInvoiceValue: number;
  notes?: string;
}): EWayBillItem {
  const bills = getStoredEWayBills();
  const nextEwb = '24' + String(Date.now()).slice(-10);

  const dist = Math.max(1, Number(data.distanceKm) || 100);
  // Rule: 1 day per 200 km for regular vehicles
  const validityDays = Math.max(1, Math.ceil(dist / 200));
  const validUntilDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  const created: EWayBillItem = {
    id: 'ewb_' + Date.now(),
    ewbNumber: nextEwb,
    docNumber: data.docNumber,
    docDate: new Date().toISOString().slice(0, 10),
    fromGstin: '07AAACK1234D1Z5',
    toGstin: (data.toGstin || 'URP').toUpperCase(),
    toPartyName: data.toPartyName,
    transporterName: data.transporterName,
    vehicleNumber: (data.vehicleNumber || 'DL-01-AB-1234').toUpperCase(),
    distanceKm: dist,
    validUntil: validUntilDate,
    totalInvoiceValue: Number(data.totalInvoiceValue) || 50000,
    status: 'ACTIVE',
    notes: data.notes,
  };

  const updated = [created, ...bills];
  saveStoredEWayBills(updated);
  return created;
}

// Dynamic GSTR-1, GSTR-3B & Tax KPI Compilation
export function compileTaxReturnSummaries() {
  const taxInvoices = getStoredTaxInvoices();
  const tdsRecords = getStoredTdsRecords();
  const purchaseInvoices = getStoredPurchaseInvoices();
  const ewayBills = getStoredEWayBills();

  // 1. GSTR-1 (Outward Supplies)
  // Table 4A: B2B Invoices (registered)
  const b2bInvoices = taxInvoices.filter((i) => i.recipientType === 'B2B' && i.docType === 'TAX_INVOICE');
  const table4ATaxable = b2bInvoices.reduce((sum, i) => sum + i.totalTaxableValue, 0);
  const table4ATax = b2bInvoices.reduce((sum, i) => sum + (i.cgstAmount + i.sgstAmount + i.igstAmount), 0);

  // Table 8: Exempt Supplies (Nil-rated books HSN 4901)
  const exemptInvoices = taxInvoices.filter((i) => i.docType === 'BILL_OF_SUPPLY' || i.hsnCode === '4901');
  const table8ExemptTurnover = exemptInvoices.reduce((sum, i) => sum + i.totalTaxableValue, 0);

  // Table 9B: Credit & Debit Notes
  const creditNotes = taxInvoices.filter((i) => i.docType === 'CREDIT_NOTE');
  const table9BTaxable = creditNotes.reduce((sum, i) => sum + i.totalTaxableValue, 0);
  const table9BTax = creditNotes.reduce((sum, i) => sum + (i.cgstAmount + i.sgstAmount + i.igstAmount), 0);

  const netTaxableOutward = Math.max(0, table4ATaxable + table8ExemptTurnover - table9BTaxable);
  const netOutputTaxLiability = Math.max(0, table4ATax - table9BTax);

  // 2. GSTR-3B (Monthly Return & Rule 42 ITC Reversal)
  // Available Gross ITC from purchases
  const grossAvailableItc = purchaseInvoices.reduce((sum, p) => sum + p.taxAmount, 0);

  // Apportionment Rule 42:
  // Reversal = Gross ITC * (Exempt Turnover / Total Turnover)
  const totalTurnover = Math.max(1, table4ATaxable + table8ExemptTurnover);
  const exemptRatio = table8ExemptTurnover / totalTurnover;
  const rule42ItcReversal = Math.round(grossAvailableItc * exemptRatio * 100) / 100;
  const netEligibleItc = Math.max(0, Math.round((grossAvailableItc - rule42ItcReversal) * 100) / 100);

  const netCashTaxPayable = Math.max(0, Math.round((netOutputTaxLiability - netEligibleItc) * 100) / 100);

  // 3. TDS 26Q Summary
  const totalTdsDeductions = tdsRecords.reduce((sum, t) => sum + t.tdsAmount, 0);
  const activeChallanCount = tdsRecords.length;

  return {
    kpis: {
      exemptBookTurnover: table8ExemptTurnover,
      outputGstLiability: netOutputTaxLiability,
      eligibleItc: netEligibleItc,
      totalTdsDeductions,
      activeChallanCount,
      activeEwayCount: ewayBills.filter((e) => e.status === 'ACTIVE').length,
    },
    gstr1: {
      table4ATaxable,
      table4ATax,
      table8ExemptTurnover,
      table9BTaxable,
      table9BTax,
      netTaxableOutward,
      netOutputTaxLiability,
    },
    gstr3b: {
      outwardTaxLiability: netOutputTaxLiability,
      grossAvailableItc,
      rule42ItcReversal,
      netEligibleItc,
      netCashTaxPayable,
    },
  };
}
