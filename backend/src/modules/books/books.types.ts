export type BookStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_PRINT' | 'DISCONTINUED';

export interface BookItem {
  id: string;
  companyId: string;
  parentTitleId?: string; // Grouping key for multiple editions, languages, and formats of same work
  title: string;
  subtitle?: string;
  isbn10?: string;
  isbn13?: string;
  sku: string; // Internal Book Code / SKU
  barcode?: string;
  authorId?: string;
  authorName: string;
  coAuthors?: string[];
  publisherId?: string;
  publisherName: string;
  edition: string;
  volume?: string;
  language: string;
  subject: string;
  category: string;
  subcategory?: string;
  publicationDate?: string;
  publicationYear: number;
  numberOfPages: number;
  bindingType: string;
  bookSize: string;
  printingFormat: string;
  hsnSacCode: string;
  taxRate: number; // e.g., 0.00% for exempt books
  mrp: number; // Maximum Retail Price
  wholesalePrice: number;
  dealerPrice: number;
  purchaseCost: number;
  openingStock: number;
  reorderLevel: number;
  warehouseId?: string;
  rackShelf?: string;
  productImage?: string;
  description?: string;
  status: BookStatus;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorItem {
  id: string;
  companyId: string;
  name: string;
  pseudonym?: string;
  bio?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pan?: string; // 10 chars for TDS compliance
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    branch?: string;
  };
  royaltyAgreementNumber?: string;
  royaltyStartDate?: string;
  royaltyEndDate?: string;
  royaltyType: 'PERCENTAGE_ON_MRP' | 'PERCENTAGE_ON_NET_SALES' | 'FIXED_PER_COPY';
  royaltyRate: number; // Percentage or fixed currency amount
  paymentTerms: string; // e.g. "Annual", "Semi-Annual", "Quarterly", "Net 30"
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublisherItem {
  id: string;
  companyId: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  paymentTerms: string; // e.g. "Net 60", "Net 90"
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaxonomyType =
  | 'CATEGORY'
  | 'SUBJECT'
  | 'LANGUAGE'
  | 'BINDING_TYPE'
  | 'PAPER_TYPE'
  | 'PRINTING_VENDOR'
  | 'BINDING_VENDOR'
  | 'WAREHOUSE'
  | 'RACK_SHELF'
  | 'UOM'
  | 'TAX_CODE'
  | 'HSN_CODE'
  | 'PRICE_LIST'
  | 'DISCOUNT_SCHEME';

export interface MasterTaxonomyItem {
  id: string;
  companyId: string;
  type: TaxonomyType;
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PartyType =
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'DEALER'
  | 'DISTRIBUTOR'
  | 'INSTITUTION_SCHOOL'
  | 'TRANSPORTER';

export interface PartyItem {
  id: string;
  companyId: string;
  partyType: PartyType;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  gstin?: string;
  pan?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  creditLimit: number;
  creditDays: number;
  discountRate: number;
  paymentTerms: string;
  bankDetails?: Record<string, any>;
  transporterDetails?: Record<string, any>;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BulkImportError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface BulkImportResult {
  totalProcessed: number;
  successfulCount: number;
  failedCount: number;
  errors: BulkImportError[];
  importedItems: BookItem[];
}

export interface BooksQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subject?: string;
  language?: string;
  authorId?: string;
  publisherId?: string;
  status?: string;
  companyId?: string;
  parentTitleId?: string;
}
