import { z } from 'zod';

export const createDistributorSchema = z.object({
  distributorCode: z.string().min(1, 'Distributor code is required'),
  name: z.string().min(2, 'Distributor legal name is required'),
  tradeName: z.string().optional(),
  territory: z.enum([
    'NORTH_INDIA',
    'WEST_INDIA',
    'SOUTH_INDIA',
    'EAST_INDIA',
    'CENTRAL_INDIA',
    'NATIONAL',
  ]).default('NORTH_INDIA'),
  gstin: z.string().min(15, 'Valid 15-character GSTIN is required').optional(),
  pan: z.string().min(10, 'Valid 10-character PAN is required').optional(),
  registeredAddress: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  contactPerson: z.string().min(1, 'Contact person name is required'),
  phone: z.string().min(10, 'Valid contact phone number is required'),
  email: z.string().email('Valid email is required'),
  creditLimit: z.number().positive().default(1000000.0),
  creditDays: z.number().int().positive().default(45),
  paymentTerms: z.string().default('NET_45'),
  commissionPercentage: z.number().min(0).max(100).default(8.0),
  standardDiscountPercentage: z.number().min(0).max(100).default(40.0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  notes: z.string().optional(),
});

export const updateDistributorSchema = createDistributorSchema.partial();

export const createDealerSchema = z.object({
  distributorId: z.string().optional(),
  dealerCode: z.string().min(1, 'Dealer code is required'),
  name: z.string().min(2, 'Dealer legal name is required'),
  tradeName: z.string().optional(),
  classification: z.enum([
    'TIER_1_PRIME',
    'TIER_2_WHOLESALE',
    'RETAIL_BOOKSTORE',
    'INSTITUTIONAL_SUPPLIER',
  ]).default('TIER_2_WHOLESALE'),
  territory: z.enum([
    'NORTH_INDIA',
    'WEST_INDIA',
    'SOUTH_INDIA',
    'EAST_INDIA',
    'CENTRAL_INDIA',
    'NATIONAL',
  ]).default('NORTH_INDIA'),
  gstin: z.string().min(15).optional(),
  pan: z.string().min(10).optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email().optional(),
  creditLimit: z.number().nonnegative().default(250000.0),
  discountPercentage: z.number().min(0).max(100).default(30.0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().optional(),
});

export const updateDealerSchema = createDealerSchema.partial();

export const distributionOrderItemSchema = z.object({
  bookId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  bookTitle: z.string().min(1, 'Book title is required'),
  isbn: z.string().optional(),
  mrp: z.number().positive('MRP must be positive'),
  discountPercentage: z.number().min(0).max(100).default(40.0),
  quantityOrdered: z.number().int().positive('Quantity must be positive'),
});

export const createDistributionOrderSchema = z.object({
  orderType: z.enum(['DISTRIBUTOR_BULK', 'DEALER_ORDER']).default('DISTRIBUTOR_BULK'),
  distributorId: z.string().optional(),
  dealerId: z.string().optional(),
  items: z.array(distributionOrderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const createDispatchChallanSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  transporterName: z.string().min(1, 'Transporter name is required'),
  lrNumber: z.string().min(1, 'Lorry Receipt (LR) number is required'),
  vehicleNumber: z.string().optional(),
  driverPhone: z.string().optional(),
  destinationCity: z.string().min(1, 'Destination city is required'),
  dispatchedItems: z.array(
    z.object({
      itemId: z.string().optional(),
      sku: z.string(),
      quantityToDispatch: z.number().int().positive('Quantity to dispatch must be positive'),
    })
  ).min(1, 'At least one dispatch item is required'),
});

export const recordDeliveryPodSchema = z.object({
  dispatchId: z.string().min(1, 'Dispatch ID is required'),
  receivedDate: z.string().or(z.date()).default(new Date().toISOString()),
  acceptedItemsCount: z.number().int().nonnegative('Accepted count must be non-negative'),
  transitDamagedCount: z.number().int().nonnegative().default(0),
  podRemarks: z.string().optional(),
});

export const issueConsignmentStockSchema = z.object({
  distributorId: z.string().min(1, 'Distributor ID is required'),
  items: z.array(
    z.object({
      sku: z.string().min(1, 'SKU is required'),
      bookTitle: z.string().min(1, 'Title is required'),
      isbn: z.string().optional(),
      mrp: z.number().positive(),
      discountPercentage: z.number().min(0).max(100).default(40.0),
      issuedQuantity: z.number().int().positive('Issued quantity must be positive'),
    })
  ).min(1, 'At least one consignment item is required'),
  notes: z.string().optional(),
});

export const settleConsignmentSalesSchema = z.object({
  consignmentIssueId: z.string().min(1, 'Consignment Issue ID is required'),
  salesReports: z.array(
    z.object({
      sku: z.string(),
      soldQuantity: z.number().int().positive('Sold quantity must be positive'),
    })
  ).min(1, 'At least one sold item is required'),
  notes: z.string().optional(),
});

export const returnConsignmentStockSchema = z.object({
  consignmentIssueId: z.string().min(1, 'Consignment Issue ID is required'),
  returnedItems: z.array(
    z.object({
      sku: z.string(),
      returnedQuantity: z.number().int().positive('Returned quantity must be positive'),
    })
  ).min(1, 'At least one return item is required'),
  notes: z.string().optional(),
});

export const calculateCommissionSchema = z.object({
  distributorId: z.string().min(1, 'Distributor ID is required'),
  periodName: z.string().min(1, 'Period name is required'),
  secondarySalesTurnover: z.number().positive('Secondary sales turnover must be positive'),
  targetSalesBenchmark: z.number().positive().default(5000000.0),
  notes: z.string().optional(),
});

export const settleCommissionPaymentSchema = z.object({
  settlementId: z.string().min(1, 'Commission settlement ID is required'),
  paymentMethod: z.enum(['NEFT', 'RTGS', 'CHEQUE', 'BANK_TRANSFER']).default('NEFT'),
  referenceNumber: z.string().min(1, 'Transaction reference/UTR number is required'),
  notes: z.string().optional(),
});

// Legacy schemas
export const createDistributorsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  code: z.string().optional(),
  status: z.string().default('ACTIVE'),
  description: z.string().optional(),
});

export const updateDistributorsSchema = createDistributorsSchema.partial();
