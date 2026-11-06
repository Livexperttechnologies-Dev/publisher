import { z } from 'zod';

export const createWarehouseSchema = z.object({
  code: z.string().min(2, 'Warehouse code is required'),
  name: z.string().min(2, 'Warehouse name is required'),
  type: z
    .enum(['CENTRAL_DEPOT', 'BRANCH_GODOWN', 'PRESS_STORE', 'RETAIL_OUTLET', 'DAMAGED_HOLD'])
    .default('CENTRAL_DEPOT'),
  branchId: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().default('07'),
  pincode: z.string().min(4, 'Pincode is required'),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  capacitySqFt: z.number().positive().default(10000),
  isActive: z.boolean().default(true),
});

export const createWarehouseRackSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  rackCode: z.string().min(1, 'Rack code is required (e.g. RACK-A1-01)'),
  aisle: z.string().min(1, 'Aisle is required (e.g. AISLE-A)'),
  shelfLevel: z.string().min(1, 'Shelf level is required (e.g. SHELF-1)'),
  binNumber: z.string().optional(),
  capacityBooks: z.number().positive().default(1000),
  categoryAssigned: z.string().optional(),
});

export const stockInwardSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  bookId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().positive('Inward quantity must be positive'),
  unitCost: z.number().nonnegative('Unit cost must be non-negative'),
  referenceType: z.enum(['GRN', 'PURCHASE_INVOICE', 'PRODUCTION_PRESS', 'SALES_RETURN', 'OPENING_STOCK']).default('GRN'),
  referenceNumber: z.string().optional(),
  rackShelfCode: z.string().optional(),
  notes: z.string().optional(),
});

export const stockOutwardSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  bookId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().positive('Outward quantity must be positive'),
  referenceType: z.enum(['SALES_INVOICE', 'TRANSFER_DISPATCH', 'DAMAGE_WRITEOFF', 'SHRINKAGE_LOST']).default('SALES_INVOICE'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const stockReservationSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().positive('Reservation quantity must be positive'),
  salesOrderRef: z.string().optional(),
  release: z.boolean().default(false), // true if releasing reserved stock
});

export const createStockTransferSchema = z.object({
  transferType: z.enum(['WAREHOUSE_TO_WAREHOUSE', 'BRANCH_TO_BRANCH', 'INTER_COMPANY']).default('WAREHOUSE_TO_WAREHOUSE'),
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  dispatchDate: z.string().or(z.date()).optional(),
  expectedArrivalDate: z.string().or(z.date()).optional(),
  transporterName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  lrNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        title: z.string().min(1, 'Title is required'),
        dispatchedQuantity: z.number().positive('Dispatched quantity must be positive'),
        fromRackCode: z.string().optional(),
        toRackCode: z.string().optional(),
      })
    )
    .min(1, 'At least one line item required for transfer'),
});

export const receiveStockTransferSchema = z.object({
  transferId: z.string().min(1, 'Transfer ID is required'),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        receivedQuantity: z.number().nonnegative('Received quantity must be non-negative'),
        damagedQuantity: z.number().nonnegative().default(0),
        toRackCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Item receipt updates required'),
  notes: z.string().optional(),
});

export const createStockAdjustmentSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  adjustmentType: z.enum([
    'CYCLE_COUNT_RECONCILIATION',
    'DAMAGE_WRITEOFF',
    'SHRINKAGE_LOST',
    'OBSOLETE_EXPIRED',
    'OPENING_STOCK',
  ]),
  adjustmentDate: z.string().or(z.date()).optional(),
  reason: z.string().min(3, 'Adjustment reason is required'),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        title: z.string().min(1, 'Title is required'),
        physicalQuantity: z.number().nonnegative('Physical quantity must be non-negative'),
        unitCost: z.number().nonnegative('Unit cost must be non-negative'),
        rackShelfCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one adjustment item required'),
});

export const createStockAuditSessionSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  auditDate: z.string().or(z.date()).optional(),
  scheduledBy: z.string().min(1, 'Auditor name or ID is required'),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        countedQuantity: z.number().nonnegative('Counted quantity must be non-negative'),
        rackShelfCode: z.string().optional(),
      })
    )
    .min(1, 'At least one audit item count is required'),
});

export const generateBarcodeLabelsSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  warehouseId: z.string().optional(),
  quantity: z.number().positive().default(1),
  labelType: z.enum(['PRODUCT_LABEL', 'SHELF_RACK_LABEL']).default('PRODUCT_LABEL'),
  barcodeFormat: z.enum(['EAN13', 'CODE128']).default('CODE128'),
});
