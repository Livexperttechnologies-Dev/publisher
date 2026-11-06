export type WarehouseType =
  | 'CENTRAL_DEPOT'
  | 'BRANCH_GODOWN'
  | 'PRESS_STORE'
  | 'RETAIL_OUTLET'
  | 'DAMAGED_HOLD';

export type ValuationMethod = 'FIFO' | 'WEIGHTED_AVERAGE';

export type StockMovementType =
  | 'INWARD_PURCHASE'
  | 'INWARD_PRODUCTION'
  | 'INWARD_RETURN'
  | 'INWARD_TRANSFER'
  | 'OUTWARD_SALE'
  | 'OUTWARD_TRANSFER'
  | 'OUTWARD_DAMAGE'
  | 'OUTWARD_LOST'
  | 'ADJUSTMENT_CYCLE_COUNT'
  | 'OPENING_BALANCE';

export type StockTransferStatus =
  | 'DRAFT'
  | 'DISPATCHED_IN_TRANSIT'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type StockAdjustmentType =
  | 'CYCLE_COUNT_RECONCILIATION'
  | 'DAMAGE_WRITEOFF'
  | 'SHRINKAGE_LOST'
  | 'OBSOLETE_EXPIRED'
  | 'OPENING_STOCK';

export interface Warehouse {
  id: string;
  companyId: string;
  branchId?: string;
  code: string;
  name: string;
  type: WarehouseType;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  contactPerson?: string;
  contactPhone?: string;
  capacitySqFt: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRack {
  id: string;
  warehouseId: string;
  rackCode: string; // e.g. RACK-A1-01
  aisle: string;
  shelfLevel: string;
  binNumber?: string;
  capacityBooks: number;
  currentCount: number;
  categoryAssigned?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseStock {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName?: string;
  bookId: string;
  sku: string;
  title: string;
  isbn?: string;
  rackShelfCode?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number; // onHand - reserved
  reorderLevel: number;
  safetyStock: number;
  maxStockLevel: number;
  valuationMethod: ValuationMethod;
  weightedAverageCost: number;
  totalValuation: number; // onHand * weightedAverageCost or sum(fifo_lots)
  lastInwardDate?: string;
  lastOutwardDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FifoCostLot {
  id: string;
  companyId: string;
  warehouseId: string;
  bookId: string;
  sku: string;
  lotNumber: string;
  inwardDate: string;
  originalQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  isExhausted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName?: string;
  bookId: string;
  sku: string;
  title?: string;
  movementType: StockMovementType;
  referenceType: string;
  referenceId?: string;
  referenceNumber?: string;
  quantityDelta: number; // Positive for inward, negative for outward
  unitCost: number;
  totalValue: number;
  balanceOnHand: number;
  notes?: string;
  performedById?: string;
  createdAt: string;
}

export interface StockTransferItem {
  id: string;
  transferId?: string;
  bookId: string;
  sku: string;
  title: string;
  dispatchedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  discrepancyQuantity: number; // dispatched - (received + damaged)
  unitCost: number;
  fromRackCode?: string;
  toRackCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockTransfer {
  id: string;
  companyId: string;
  transferNumber: string; // e.g. TRF/2026/0001
  transferType: 'WAREHOUSE_TO_WAREHOUSE' | 'BRANCH_TO_BRANCH' | 'INTER_COMPANY';
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  dispatchDate: string;
  expectedArrivalDate?: string;
  receivedDate?: string;
  status: StockTransferStatus;
  transporterName?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  eWayBillNumber?: string;
  notes?: string;
  items: StockTransferItem[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentItem {
  id: string;
  adjustmentId?: string;
  bookId: string;
  sku: string;
  title: string;
  systemQuantity: number;
  physicalQuantity: number;
  varianceQuantity: number; // physical - system
  unitCost: number;
  varianceValue: number; // varianceQuantity * unitCost
  rackShelfCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockAdjustment {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName?: string;
  adjustmentNumber: string; // e.g. ADJ/2026/0001
  adjustmentType: StockAdjustmentType;
  adjustmentDate: string;
  reason: string;
  accountingVoucherId?: string;
  voucherNumber?: string;
  totalVarianceQuantity: number;
  totalVarianceValue: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  items: StockAdjustmentItem[];
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAuditItem {
  id: string;
  auditSessionId: string;
  bookId: string;
  sku: string;
  title: string;
  rackShelfCode?: string;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  unitCost: number;
  varianceValue: number;
  discrepancyResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockAuditSession {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName?: string;
  auditSessionNumber: string; // e.g. AUD/2026/0001
  auditDate: string;
  scheduledBy: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCREPANCY_FLAGGED';
  totalItemsAudited: number;
  matchedCount: number;
  varianceCount: number;
  netVarianceValue: number;
  notes?: string;
  items: StockAuditItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BarcodeLabelRequest {
  sku: string;
  warehouseId?: string;
  quantity?: number;
  labelType?: 'PRODUCT_LABEL' | 'SHELF_RACK_LABEL';
  barcodeFormat?: 'EAN13' | 'CODE128';
}

export interface BarcodeLabelOutput {
  sku: string;
  isbn?: string;
  title: string;
  mrp: number;
  rackShelfCode?: string;
  barcodeData: string;
  barcodeFormat: string;
  svgHtml: string;
}

// Reports
export interface StockSummaryItem {
  bookId: string;
  sku: string;
  title: string;
  isbn?: string;
  warehouseId: string;
  warehouseName: string;
  rackShelfCode?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  isBelowReorder: boolean;
  weightedAverageCost: number;
  totalValuationWac: number;
  totalValuationFifo: number;
}

export interface StockLedgerEntry {
  date: string;
  movementType: StockMovementType;
  referenceNumber?: string;
  quantityIn: number;
  quantityOut: number;
  balanceOnHand: number;
  unitCost: number;
  totalValue: number;
  notes?: string;
}

export interface StockAgeingItem {
  sku: string;
  title: string;
  warehouseName: string;
  quantityOnHand: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days91to180: number;
  days180Plus: number;
  category: 'FAST_MOVING' | 'NORMAL' | 'SLOW_MOVING' | 'DEAD_STOCK';
  totalValue: number;
}
