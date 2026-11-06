import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  code: z.string().min(2, 'Company code is required').toUpperCase(),
  legalName: z.string().optional(),
  businessType: z.enum([
    'BOOK_PUBLISHER',
    'BOOK_WHOLESALER',
    'BOOK_DISTRIBUTOR',
    'BOOK_RETAILER',
    'BOOKSTORE',
    'EDUCATIONAL_SUPPLIER',
    'PRINTING_AND_PUBLISHING',
    'INSTITUTIONAL_SUPPLIER',
  ]).default('BOOK_PUBLISHER'),
  taxId: z.string().min(15, 'GSTIN must be 15 characters').max(15, 'GSTIN must be 15 characters'),
  pan: z.string().min(10, 'PAN must be 10 characters').max(10, 'PAN must be 10 characters'),
  cin: z.string().optional(),
  currency: z.string().default('INR'),
  currencySymbol: z.string().default('₹'),
  decimalPrecision: z.number().min(2).max(4).default(2),
  email: z.string().email(),
  phone: z.string().min(8),
  website: z.string().url().optional().or(z.literal('')),
  registeredAddress: z.string().min(5),
  billingAddress: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default('India'),
  postalCode: z.string().min(4),
  invoicePrefix: z.string().default('INV'),
  defaultCreditLimit: z.number().default(500000),
  bankDetails: z
    .object({
      accountName: z.string(),
      accountNumber: z.string(),
      bankName: z.string(),
      ifscCode: z.string(),
      branchName: z.string(),
      swiftCode: z.string().optional(),
      upiId: z.string().optional(),
    })
    .optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createBranchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  code: z.string().min(2, 'Branch code is required').toUpperCase(),
  isMain: z.boolean().default(false),
  registeredAddress: z.string().min(5),
  billingAddress: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default('India'),
  postalCode: z.string().min(4),
  phone: z.string().min(8),
  email: z.string().email(),
  gstin: z.string().min(15, 'Branch-specific GSTIN must be 15 characters'),
  branchManagerName: z.string().optional(),
  invoicePrefix: z.string().optional(),
  interBranchTransfersEnabled: z.boolean().default(true),
});

export const updateBranchSchema = createBranchSchema.partial();

export const createFiscalYearSchema = z.object({
  name: z.string().min(4, 'Fiscal year name is required (e.g. FY 2026-2027)'),
  startDate: z.string(), // ISO String
  endDate: z.string(),   // ISO String
  accountingStartDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export const lockPeriodSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  isLocked: z.boolean(),
});

export const updateAccountingSettingsSchema = z.object({
  defaultSalesAccountId: z.string().min(2),
  defaultPurchaseAccountId: z.string().min(2),
  inventoryValuationMethod: z.enum(['FIFO', 'WEIGHTED_AVERAGE', 'STANDARD_COST']),
  defaultReceivableAccountId: z.string().min(2),
  defaultPayableAccountId: z.string().min(2),
  defaultCashAccountId: z.string().min(2),
  defaultBankAccountId: z.string().min(2),
  roundOffAccountId: z.string().min(2),
  discountAllowedAccountId: z.string().min(2),
  discountReceivedAccountId: z.string().min(2),
});
