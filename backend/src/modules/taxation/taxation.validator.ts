import { z } from 'zod';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const STATE_CODE_REGEX = /^[0-9]{2}$/;

export const gstRateConfigSchema = z.object({
  hsnSacCode: z.string().min(2, 'HSN/SAC code must have at least 2 characters').max(8),
  description: z.string().min(3, 'Description required'),
  itemType: z.enum(['GOODS', 'SERVICES']).default('GOODS'),
  igstRate: z.number().min(0).max(100),
  cgstRate: z.number().min(0).max(50),
  sgstRate: z.number().min(0).max(50),
  cessRate: z.number().min(0).max(100).default(0),
  isExempt: z.boolean().default(false),
  exemptionNotification: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const taxLineInputSchema = z.object({
  hsnSacCode: z.string().min(2).max(8),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  isExempt: z.boolean().optional().default(false),
});

export const taxCalculateSchema = z.object({
  companyId: z.string().optional(),
  supplierGstin: z.string().regex(GSTIN_REGEX, 'Invalid 15-character GSTIN format'),
  placeOfSupply: z.string().regex(STATE_CODE_REGEX, 'Place of supply must be a 2-digit Indian State code'),
  pricingType: z.enum(['EXCLUSIVE', 'INCLUSIVE']).default('EXCLUSIVE'),
  items: z.array(taxLineInputSchema).min(1, 'At least one item is required for tax calculation'),
});

export const createTaxInvoiceSchema = z.object({
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  docType: z.enum(['TAX_INVOICE', 'BILL_OF_SUPPLY', 'CREDIT_NOTE', 'DEBIT_NOTE']).default('TAX_INVOICE'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  financialYear: z.string().optional(),
  taxPeriod: z.string().optional(),
  supplierGstin: z.string().regex(GSTIN_REGEX, 'Supplier GSTIN must match official 15-character format'),
  recipientGstin: z.string().regex(GSTIN_REGEX, 'Recipient GSTIN must match 15-character format').optional().or(z.literal('')),
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientType: z.enum(['B2B', 'B2CL', 'B2CS', 'EXEMPT']).optional(),
  placeOfSupply: z.string().regex(STATE_CODE_REGEX, 'Place of supply must be a 2-digit State code'),
  isReverseCharge: z.boolean().optional().default(false),
  pricingType: z.enum(['EXCLUSIVE', 'INCLUSIVE']).default('EXCLUSIVE'),
  originalInvoiceNumber: z.string().optional(),
  originalInvoiceDate: z.string().optional(),
  items: z.array(taxLineInputSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

export const tdsConfigSchema = z.object({
  sectionCode: z.string().min(3),
  sectionName: z.string().min(3),
  description: z.string().min(5),
  thresholdLimit: z.number().min(0),
  tdsRateWithPan: z.number().min(0).max(100),
  tdsRateWithoutPan: z.number().min(0).max(100).default(20),
  applicableTo: z.string().default('VENDOR'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const deductTdsSchema = z.object({
  companyId: z.string().optional(),
  deductionType: z.enum(['PAYABLE', 'RECEIVABLE']).default('PAYABLE'),
  financialYear: z.string().min(4),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  sectionCode: z.string().min(3),
  partyId: z.string().min(1),
  partyName: z.string().min(2),
  partyPan: z.string(),
  billOrPaymentRef: z.string().min(2),
  paymentDate: z.string(),
  grossAmount: z.number().positive(),
  remarks: z.string().optional(),
});

export const generateIrnSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required for IRN generation'),
  companyId: z.string().optional(),
});

export const cancelIrnSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  cancelReason: z.string().min(1, 'Cancel reason code is required (1-4)'),
  remarks: z.string().min(3, 'Audit remarks required for IRN cancellation'),
});

export const generateEwayBillSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  transporterId: z.string().optional(),
  transporterName: z.string().min(2, 'Transporter name is required'),
  vehicleNumber: z.string().min(4, 'Vehicle registration number is required'),
  distanceKm: z.number().positive('Distance must be greater than 0 km'),
  dispatchAddress: z.string().min(5, 'Dispatch address is required'),
  shipToAddress: z.string().min(5, 'Delivery ship-to address is required'),
});

export const cancelEwayBillSchema = z.object({
  ewbNumber: z.string().length(12, 'E-Way bill number must be exactly 12 digits'),
  cancelReason: z.string().min(1, 'Cancellation reason is required'),
  remarks: z.string().min(3, 'Audit remarks are required'),
});
