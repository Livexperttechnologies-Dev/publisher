import { z } from 'zod';

export const isbn10Regex = /^(?:[0-9]{9}X|[0-9]{10})$/;
export const isbn13Regex = /^(?:978|979)[0-9]{10}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const createBookSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(300),
  subtitle: z.string().optional(),
  parentTitleId: z.string().optional(),
  isbn10: z.string().regex(isbn10Regex, 'Invalid ISBN-10 format').optional().or(z.literal('')),
  isbn13: z.string().regex(isbn13Regex, 'Invalid ISBN-13 format (13 digits starting with 978 or 979)').optional().or(z.literal('')),
  sku: z.string().min(2, 'Internal book code/SKU is required').max(50),
  barcode: z.string().optional(),
  authorId: z.string().optional(),
  authorName: z.string().min(1, 'Author name is required').max(200),
  coAuthors: z.array(z.string()).optional(),
  publisherId: z.string().optional(),
  publisherName: z.string().min(1, 'Publisher name is required').max(200),
  edition: z.string().default('1st Edition'),
  volume: z.string().optional(),
  language: z.string().default('English'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  publicationDate: z.string().optional(),
  publicationYear: z.number().int().min(1800).max(2100).default(new Date().getFullYear()),
  numberOfPages: z.number().int().min(1, 'Number of pages must be at least 1'),
  bindingType: z.string().default('Paperback'),
  bookSize: z.string().default('Royal 8vo'),
  printingFormat: z.string().default('1 Color'),
  hsnSacCode: z.string().default('4901'),
  taxRate: z.number().min(0).max(100).default(0.00),
  mrp: z.number().positive('MRP must be greater than 0'),
  wholesalePrice: z.number().min(0, 'Wholesale price cannot be negative').optional(),
  dealerPrice: z.number().min(0, 'Dealer price cannot be negative').optional(),
  purchaseCost: z.number().min(0, 'Purchase cost cannot be negative').optional(),
  openingStock: z.number().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(50),
  warehouseId: z.string().optional(),
  rackShelf: z.string().optional(),
  productImage: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_PRINT', 'DISCONTINUED']).default('ACTIVE'),
});

export const updateBookSchema = createBookSchema.partial();

export const createAuthorSchema = z.object({
  name: z.string().min(1, 'Author name is required').max(200),
  pseudonym: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email('Invalid author email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pan: z.string().regex(panRegex, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  bankDetails: z
    .object({
      accountName: z.string(),
      accountNumber: z.string(),
      bankName: z.string(),
      ifsc: z.string(),
      branch: z.string().optional(),
    })
    .optional(),
  royaltyAgreementNumber: z.string().optional(),
  royaltyStartDate: z.string().optional(),
  royaltyEndDate: z.string().optional(),
  royaltyType: z.enum(['PERCENTAGE_ON_MRP', 'PERCENTAGE_ON_NET_SALES', 'FIXED_PER_COPY']).default('PERCENTAGE_ON_MRP'),
  royaltyRate: z.number().min(0).max(100).default(10.00),
  paymentTerms: z.string().default('Annual'),
  isActive: z.boolean().default(true),
});

export const createPublisherSchema = z.object({
  name: z.string().min(1, 'Publisher name is required').max(200),
  code: z.string().min(2, 'Publisher code is required').max(50),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  gstin: z.string().regex(gstinRegex, 'Invalid GSTIN format').optional().or(z.literal('')),
  pan: z.string().regex(panRegex, 'Invalid PAN format').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  paymentTerms: z.string().default('Net 60'),
  isActive: z.boolean().default(true),
});

export const createTaxonomySchema = z.object({
  type: z.enum([
    'CATEGORY',
    'SUBJECT',
    'LANGUAGE',
    'BINDING_TYPE',
    'PAPER_TYPE',
    'PRINTING_VENDOR',
    'BINDING_VENDOR',
    'WAREHOUSE',
    'RACK_SHELF',
    'UOM',
    'TAX_CODE',
    'HSN_CODE',
    'PRICE_LIST',
    'DISCOUNT_SCHEME',
  ]),
  code: z.string().min(2, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const createPartySchema = z.object({
  partyType: z.enum([
    'CUSTOMER',
    'SUPPLIER',
    'DEALER',
    'DISTRIBUTOR',
    'INSTITUTION_SCHOOL',
    'TRANSPORTER',
  ]),
  name: z.string().min(1, 'Party name is required').max(200),
  code: z.string().min(2, 'Party code is required').max(50),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  gstin: z.string().regex(gstinRegex, 'Invalid GSTIN format').optional().or(z.literal('')),
  pan: z.string().regex(panRegex, 'Invalid PAN format').optional().or(z.literal('')),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  stateCode: z.string().optional(),
  pincode: z.string().optional(),
  creditLimit: z.number().min(0).default(500000),
  creditDays: z.number().int().min(0).default(30),
  discountRate: z.number().min(0).max(100).default(0),
  paymentTerms: z.string().default('Net 30'),
  bankDetails: z.record(z.any()).optional(),
  transporterDetails: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const bulkImportSchema = z.object({
  items: z.array(z.record(z.any())).min(1, 'At least one book row must be provided for import'),
  duplicateHandling: z.enum(['REJECT', 'SKIP', 'UPDATE']).default('REJECT'),
});
