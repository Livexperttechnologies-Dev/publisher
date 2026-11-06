import { z } from 'zod';

export const agreementSlabSchema = z.object({
  fromQuantity: z.number().int().nonnegative('From quantity must be non-negative'),
  toQuantity: z.number().int().positive('To quantity must be positive').optional(),
  royaltyPercentage: z.number().min(0).max(100, 'Royalty percentage between 0 and 100'),
  fixedRate: z.number().nonnegative().optional(),
});

export const agreementBookItemSchema = z.object({
  bookId: z.string().optional(),
  bookTitle: z.string().min(1, 'Book title is required'),
  sku: z.string().min(1, 'Book SKU is required'),
  isbn: z.string().optional(),
  edition: z.string().default('1st Edition'),
  territory: z.enum(['ALL', 'DOMESTIC', 'INTERNATIONAL']).default('ALL'),
  specificRate: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createAuthorAgreementSchema = z.object({
  authorId: z.string().min(1, 'Author ID is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorEmail: z.string().email().optional(),
  authorPan: z.string().min(10, 'Valid 10-character PAN is required for TDS compliance').optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankName: z.string().optional(),
  contractStartDate: z.string().or(z.date()),
  contractEndDate: z.string().or(z.date()).optional(),
  calculationMethod: z.enum([
    'PERCENTAGE_OF_MRP',
    'PERCENTAGE_OF_NET_SALES',
    'FIXED_AMOUNT_PER_COPY',
    'SLAB_BASED',
    'EDITION_SPECIFIC',
  ]).default('PERCENTAGE_OF_MRP'),
  royaltyPercentage: z.number().min(0).max(100).default(10.0),
  fixedRatePerCopy: z.number().nonnegative().default(0.0),
  advanceRoyaltyAmount: z.number().nonnegative().default(0.0),
  minimumGuarantee: z.number().nonnegative().default(0.0),
  paymentFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL']).default('QUARTERLY'),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
  documentUrl: z.string().optional(),
  notes: z.string().optional(),
  books: z.array(agreementBookItemSchema).optional(),
  slabs: z.array(agreementSlabSchema).optional(),
});

export const updateAuthorAgreementSchema = createAuthorAgreementSchema.partial();

export const createRoyaltyAccrualPeriodSchema = z.object({
  periodNumber: z.string().min(1, 'Period number is required (e.g. ROY/2026/Q1)'),
  periodName: z.string().min(1, 'Period name is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const runRoyaltyCalculationSchema = z.object({
  periodId: z.string().min(1, 'Period ID is required'),
  agreementId: z.string().optional(), // if omitted, runs for all active agreements
  salesDataOverrides: z.array(
    z.object({
      sku: z.string(),
      grossSold: z.number().int().nonnegative(),
      returnedCount: z.number().int().nonnegative().default(0),
      netSalesValue: z.number().nonnegative().optional(),
    })
  ).optional(),
});

export const approveRoyaltyCalculationSchema = z.object({
  calculationId: z.string().min(1, 'Royalty calculation ID is required'),
  notes: z.string().optional(),
});

export const settleRoyaltyPaymentSchema = z.object({
  calculationId: z.string().min(1, 'Royalty calculation ID is required'),
  paymentDate: z.string().or(z.date()).default(new Date().toISOString()),
  paymentMethod: z.enum(['NEFT', 'RTGS', 'CHEQUE', 'BANK_TRANSFER']).default('NEFT'),
  bankName: z.string().default('HDFC Bank Corporate A/c'),
  referenceNumber: z.string().min(1, 'Transaction UTR or Cheque Number is required'),
  notes: z.string().optional(),
});

// Legacy backward-compatibility schemas
export const createRoyaltiesSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  code: z.string().optional(),
  status: z.string().default('ACTIVE'),
  description: z.string().optional(),
});

export const updateRoyaltiesSchema = createRoyaltiesSchema.partial();
