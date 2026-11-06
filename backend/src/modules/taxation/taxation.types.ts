export type GstDocType = 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
export type RecipientType = 'B2B' | 'B2CL' | 'B2CS' | 'EXEMPT';
export type PricingType = 'EXCLUSIVE' | 'INCLUSIVE';
export type ItemType = 'GOODS' | 'SERVICES';
export type TdsSection = '194C_INDIVIDUAL' | '194C_COMPANY' | '194J_ROYALTY' | '194J_PROFESSIONAL' | '194I_RENT_BUILDING' | '194H_COMMISSION' | '194Q_PURCHASE';
export type TdsDeductionType = 'PAYABLE' | 'RECEIVABLE';

export interface StateGstCode {
  code: string;
  stateName: string;
}

export const INDIAN_STATE_GST_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

export interface GstRateConfigDTO {
  id: string;
  companyId: string;
  hsnSacCode: string;
  description: string;
  itemType: ItemType;
  igstRate: number;
  cgstRate: number;
  sgstRate: number;
  cessRate: number;
  isExempt: boolean;
  exemptionNotification?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  adminReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TaxCalculationLineInput {
  hsnSacCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  isExempt?: boolean;
}

export interface TaxCalculationInput {
  companyId?: string;
  supplierGstin: string;
  placeOfSupply: string; // 2-digit state code e.g. "07" or "27"
  pricingType: PricingType;
  items: TaxCalculationLineInput[];
}

export interface TaxCalculatedLineOutput {
  hsnSacCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxableValue: number;
  isExempt: boolean;
  igstRate: number;
  igstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  cessRate: number;
  cessAmount: number;
  lineTotal: number;
}

export interface TaxCalculationResult {
  supplierGstin: string;
  supplierStateCode: string;
  placeOfSupply: string;
  isInterState: boolean;
  pricingType: PricingType;
  lines: TaxCalculatedLineOutput[];
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  roundingOff: number;
  grandTotal: number;
}

export interface CreateTaxInvoiceDTO {
  companyId?: string;
  branchId?: string;
  docType: GstDocType;
  invoiceNumber?: string;
  invoiceDate?: string;
  financialYear?: string;
  taxPeriod?: string;
  supplierGstin: string;
  recipientGstin?: string;
  recipientName: string;
  recipientType?: RecipientType;
  placeOfSupply: string;
  isReverseCharge?: boolean;
  pricingType: PricingType;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  items: TaxCalculationLineInput[];
  notes?: string;
}

export interface TaxInvoiceResponse {
  id: string;
  docType: GstDocType;
  invoiceNumber: string;
  invoiceDate: string;
  financialYear: string;
  taxPeriod: string;
  supplierGstin: string;
  supplierStateCode: string;
  recipientGstin?: string;
  recipientName: string;
  recipientType: RecipientType;
  placeOfSupply: string;
  isInterState: boolean;
  isReverseCharge: boolean;
  pricingType: PricingType;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  items: TaxCalculatedLineOutput[];
  totalTaxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  roundingOff: number;
  grandTotal: number;
  accountingVoucherNumber?: string;
  status: string;
  irn?: string;
  irnStatus?: string;
  signedQrCode?: string;
  ewbNumber?: string;
  ewbStatus?: string;
  ewbValidUntil?: string;
  createdAt: string;
}

export interface TdsConfigDTO {
  id: string;
  companyId: string;
  sectionCode: string;
  sectionName: string;
  description: string;
  thresholdLimit: number;
  tdsRateWithPan: number;
  tdsRateWithoutPan: number;
  applicableTo: string;
  status: string;
}

export interface DeductTdsInputDTO {
  companyId?: string;
  deductionType: TdsDeductionType;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  sectionCode: string;
  partyId: string;
  partyName: string;
  partyPan: string;
  billOrPaymentRef: string;
  paymentDate: string;
  grossAmount: number;
  remarks?: string;
}

export interface TdsDeductionResponse {
  id: string;
  deductionType: TdsDeductionType;
  financialYear: string;
  quarter: string;
  sectionCode: string;
  partyId: string;
  partyName: string;
  partyPan: string;
  isPanValid: boolean;
  billOrPaymentRef: string;
  paymentDate: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  depositStatus: string;
  challanBsrCode?: string;
  challanNumber?: string;
  challanDate?: string;
  form16aCertificateNumber?: string;
  accountingVoucherNumber?: string;
  createdAt: string;
}

export interface GenerateIrnDTO {
  invoiceId: string;
  companyId?: string;
}

export interface CancelIrnDTO {
  invoiceId: string;
  cancelReason: string; // 1-Duplicate, 2-Data Entry error, 3-Order cancelled, 4-Others
  remarks: string;
}

export interface GenerateEwayBillDTO {
  invoiceId: string;
  transporterId?: string;
  transporterName: string;
  vehicleNumber: string;
  distanceKm: number;
  dispatchAddress: string;
  shipToAddress: string;
}

export interface CancelEwayBillDTO {
  ewbNumber: string;
  cancelReason: string;
  remarks: string;
}

export interface Gstr1SummaryReport {
  financialYear: string;
  taxPeriod: string;
  b2bInvoicesCount: number;
  b2bTaxableValue: number;
  b2bTaxAmount: number;
  b2clInvoicesCount: number;
  b2clTaxableValue: number;
  b2clTaxAmount: number;
  b2csInvoicesCount: number;
  b2csTaxableValue: number;
  b2csTaxAmount: number;
  cdnrCount: number;
  cdnrTaxableValue: number;
  cdnrTaxAmount: number;
  exemptSuppliesValue: number;
  hsnSummary: Array<{
    hsnCode: string;
    description: string;
    totalQuantity: number;
    totalValue: number;
    taxableValue: number;
    igstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
  }>;
  totalOutwardTaxableValue: number;
  totalOutputTaxPayable: number;
}

export interface Gstr3bSummaryReport {
  financialYear: string;
  taxPeriod: string;
  table3_1_OutwardTaxableSupplies: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  table3_1_OutwardZeroRated: { taxableValue: number; igst: number };
  table3_1_OtherOutwardExempt: { taxableValue: number };
  table3_1_InwardReverseCharge: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
  };
  table4_EligibleItc: {
    itcAvailableAllOther: { igst: number; cgst: number; sgst: number };
    itcReversedRule42: { igst: number; cgst: number; sgst: number };
    netItcAvailable: { igst: number; cgst: number; sgst: number };
  };
  table5_TaxLiabilityLedgerOffset: {
    grossTaxLiability: { igst: number; cgst: number; sgst: number };
    itcUtilized: { igst: number; cgst: number; sgst: number };
    cashTaxPayable: { igst: number; cgst: number; sgst: number };
  };
}

export interface TaxAuditLogDTO {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  oldValues?: any;
  newValues?: any;
  remarks: string;
  timestamp: string;
}

export interface TaxApiLogDTO {
  id: string;
  serviceType: string;
  provider: string;
  requestEndpoint: string;
  requestPayload: any;
  responsePayload: any;
  httpStatusCode: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
}
