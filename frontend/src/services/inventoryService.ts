import { postDoubleEntryVoucher } from './voucherService';
import { getStoredLedgers } from './accountingService';
import { getStoredBooks } from './catalogueService';

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  type: 'CENTRAL_DEPOT' | 'BRANCH_GODOWN' | 'RETAIL_OUTLET' | 'DAMAGED_HOLD' | 'TRANSIT_HUB';
  managerName: string;
  contactPhone: string;
  totalCapacitySqFt: number;
  currentUtilizationPct: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FifoLot {
  lotId: string;
  date: string;
  qty: number;
  unitCost: number;
}

export interface StockItem {
  id: string;
  bookId?: string;
  sku: string;
  title: string;
  isbn: string;
  warehouseId: string;
  warehouseName: string;
  rackShelf: string;
  batchNo: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  wacCost: number;
  fifoLots: FifoLot[];
  mrp: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  inwardDate: string; // ISO date format for ageing
}

export interface StockTransferItem {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  sku: string;
  title: string;
  dispatchDate: string;
  deliveryDate?: string;
  status: 'DRAFT' | 'DISPATCHED_IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  transporter: string;
  lrNumber: string;
  vehicleNumber?: string;
  copiesDispatched: number;
  copiesReceived: number;
  copiesDamaged: number;
  discrepancy: number;
  remarks?: string;
}

export interface StockMovementItem {
  id: string;
  date: string;
  sku: string;
  title: string;
  wh: string;
  type:
    | 'INWARD_PURCHASE'
    | 'PRODUCTION_CAPITALIZED'
    | 'TRANSFER_RECEIPT'
    | 'OUTWARD_SALE'
    | 'OUTWARD_TRANSFER'
    | 'DAMAGE_WRITEOFF'
    | 'CYCLE_COUNT_ADJUSTMENT'
    | 'INITIAL_OPENING';
  ref: string;
  in: number;
  out: number;
  bal: number;
  rate: number;
  notes?: string;
}

export interface AuditLineItem {
  sku: string;
  title: string;
  systemBookQty: number;
  physicalCountQty: number;
  varianceQty: number;
  unitCost: number;
  varianceValue: number;
  status: 'MATCHED' | 'SHORTAGE' | 'SURPLUS';
}

export interface CycleCountAuditItem {
  id: string;
  auditNumber: string;
  warehouseId: string;
  warehouse: string;
  date: string;
  scheduledBy: string;
  itemsCount: number;
  matched: number;
  variance: number;
  netVarianceValue: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'DISCREPANCY_FLAGGED' | 'RECONCILED';
  lines: AuditLineItem[];
  notes?: string;
}

export interface StockAdjustmentItem {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouse: string;
  type:
    | 'DAMAGE_WRITEOFF'
    | 'CYCLE_COUNT_RECONCILIATION'
    | 'SHRINKAGE_LOST'
    | 'OBSOLETE_EXPIRED'
    | 'SURPLUS_FOUND';
  date: string;
  sku: string;
  title: string;
  reason: string;
  systemQty: number;
  physicalQty: number;
  varianceQty: number;
  unitCost: number;
  varianceValue: number;
  voucherNumber: string;
  status: 'POSTED' | 'CANCELLED';
}

export interface ValuationAgeingSummary {
  sku: string;
  title: string;
  isbn: string;
  warehouseName: string;
  onHand: number;
  wacCost: number;
  wacTotalValue: number;
  fifoTotalValue: number;
  valuationDelta: number;
  ageDays: number;
  ageBucket: '< 30 Days' | '30-90 Days' | '91-180 Days' | '> 180 Days';
  ageStatus: 'ACTIVE' | 'NORMAL' | 'SLOW_MOVING' | 'DEAD_STOCK';
}

// Initial Data Seeds
export const INITIAL_WAREHOUSES: WarehouseItem[] = [
  {
    id: 'wh_central_press_depot',
    code: 'WH-CENTRAL-01',
    name: 'Central Press & Distribution Depot',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Plot 14-16, Daryaganj Publishing Hub',
    pincode: '110002',
    type: 'CENTRAL_DEPOT',
    managerName: 'Surendra Nath Gupta',
    contactPhone: '+91 98112 34501',
    totalCapacitySqFt: 45000,
    currentUtilizationPct: 76,
    status: 'ACTIVE',
  },
  {
    id: 'wh_bhiwandi_godown',
    code: 'WH-WEST-BHIWANDI',
    name: 'Western Regional Hub & Godown (Bhiwandi)',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    address: 'Survey No. 82/4, Mankoli Logistics Corridor, Bhiwandi',
    pincode: '421302',
    type: 'BRANCH_GODOWN',
    managerName: 'Vikas Kadam',
    contactPhone: '+91 98230 87122',
    totalCapacitySqFt: 32000,
    currentUtilizationPct: 68,
    status: 'ACTIVE',
  },
  {
    id: 'wh_retail_bookstore_depot',
    code: 'WH-RETAIL-01',
    name: 'Connaught Place Retail Depot & Outlet',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'N-Block Inner Circle, Connaught Place',
    pincode: '110001',
    type: 'RETAIL_OUTLET',
    managerName: 'Anita Saxena',
    contactPhone: '+91 98711 55609',
    totalCapacitySqFt: 6500,
    currentUtilizationPct: 82,
    status: 'ACTIVE',
  },
  {
    id: 'wh_damaged_quarantine_hold',
    code: 'WH-DAMAGED-HOLD',
    name: 'Quarantine & Damaged Returns Depot',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Shed C, Daryaganj Storage Compound',
    pincode: '110002',
    type: 'DAMAGED_HOLD',
    managerName: 'Rajesh Mehra',
    contactPhone: '+91 98101 22319',
    totalCapacitySqFt: 4000,
    currentUtilizationPct: 41,
    status: 'ACTIVE',
  },
];

export const INITIAL_STOCKS: StockItem[] = [
  {
    id: 'stk_01',
    bookId: 'bk_math_12_eng_pb',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    isbn: '9788177091877',
    warehouseId: 'wh_central_press_depot',
    warehouseName: 'Central Press & Distribution Depot',
    rackShelf: 'RACK-A1-01',
    batchNo: 'BATCH-2026-P01',
    onHand: 5550,
    reserved: 250,
    available: 5300,
    reorderLevel: 500,
    wacCost: 161.68,
    fifoLots: [
      { lotId: 'LOT-OCT-01', date: '2026-10-15', qty: 2550, unitCost: 160.0 },
      { lotId: 'LOT-NOV-02', date: '2026-11-02', qty: 3000, unitCost: 163.1 },
    ],
    mrp: 495.0,
    status: 'IN_STOCK',
    inwardDate: '2026-10-15',
  },
  {
    id: 'stk_02',
    bookId: 'bk_math_12_hindi_pb',
    sku: 'BK-MATH-12-ENG-PB',
    title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
    isbn: '9788177098801',
    warehouseId: 'wh_central_press_depot',
    warehouseName: 'Central Press & Distribution Depot',
    rackShelf: 'RACK-B2-01',
    batchNo: 'BATCH-2026-M04',
    onHand: 1495,
    reserved: 100,
    available: 1395,
    reorderLevel: 300,
    wacCost: 210.0,
    fifoLots: [
      { lotId: 'LOT-OCT-10', date: '2026-10-01', qty: 1495, unitCost: 210.0 },
    ],
    mrp: 795.0,
    status: 'IN_STOCK',
    inwardDate: '2026-10-01',
  },
  {
    id: 'stk_03',
    bookId: 'bk_godan_hindi',
    sku: 'BK-LIT-GODAN-HIN',
    title: 'गोदान (उपन्यास - मुंशी प्रेमचंद)',
    isbn: '9788177095512',
    warehouseId: 'wh_bhiwandi_godown',
    warehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    rackShelf: 'RACK-W1-01',
    batchNo: 'BATCH-2026-L02',
    onHand: 120,
    reserved: 0,
    available: 120,
    reorderLevel: 250,
    wacCost: 95.0,
    fifoLots: [
      { lotId: 'LOT-SEP-05', date: '2026-09-05', qty: 120, unitCost: 95.0 },
    ],
    mrp: 275.0,
    status: 'LOW_STOCK',
    inwardDate: '2026-09-05',
  },
  {
    id: 'stk_04',
    bookId: 'bk_math_12_eng_pb',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    isbn: '9788177091877',
    warehouseId: 'wh_bhiwandi_godown',
    warehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    rackShelf: 'RACK-W1-02',
    batchNo: 'BATCH-2026-P01',
    onHand: 290,
    reserved: 0,
    available: 290,
    reorderLevel: 200,
    wacCost: 161.68,
    fifoLots: [
      { lotId: 'LOT-TRF-01', date: '2026-11-04', qty: 290, unitCost: 161.68 },
    ],
    mrp: 495.0,
    status: 'IN_STOCK',
    inwardDate: '2026-11-04',
  },
];

export const INITIAL_TRANSFERS: StockTransferItem[] = [
  {
    id: 'trf_01',
    transferNumber: 'TRF/2026/0001',
    fromWarehouseId: 'wh_central_press_depot',
    fromWarehouseName: 'Central Press & Distribution Depot',
    toWarehouseId: 'wh_bhiwandi_godown',
    toWarehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    dispatchDate: '2026-11-04',
    deliveryDate: '2026-11-05',
    status: 'PARTIALLY_RECEIVED',
    transporter: 'VRL Logistics India Ltd.',
    lrNumber: 'VRL-INVENTORY-7711',
    vehicleNumber: 'MH-04-AZ-4521',
    copiesDispatched: 300,
    copiesReceived: 290,
    copiesDamaged: 5,
    discrepancy: 5,
    remarks: '5 copies damaged in cargo transit; 5 copies pending depot reconciliation.',
  },
];

export const INITIAL_MOVEMENTS: StockMovementItem[] = [
  {
    id: 'mov_01',
    date: '2026-11-05 14:20',
    sku: 'BK-MATH-12-ENG-PB',
    title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
    wh: 'Central Press & Distribution Depot',
    type: 'DAMAGE_WRITEOFF',
    ref: 'ADJ/2026/0001',
    in: 0,
    out: 5,
    bal: 1495,
    rate: 210.0,
    notes: 'Damaged copies discarded per QA audit report',
  },
  {
    id: 'mov_02',
    date: '2026-11-04 18:30',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1)',
    wh: 'Western Regional Hub & Godown (Bhiwandi)',
    type: 'TRANSFER_RECEIPT',
    ref: 'TRF/2026/0001',
    in: 290,
    out: 0,
    bal: 290,
    rate: 161.68,
    notes: 'Received via VRL Logistics consignment',
  },
  {
    id: 'mov_03',
    date: '2026-11-04 11:15',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1)',
    wh: 'Central Press & Distribution Depot',
    type: 'OUTWARD_TRANSFER',
    ref: 'TRF/2026/0001',
    in: 0,
    out: 300,
    bal: 5550,
    rate: 161.68,
    notes: 'Inter-warehouse dispatch to Western Hub',
  },
  {
    id: 'mov_04',
    date: '2026-11-03 16:45',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1)',
    wh: 'Central Press & Distribution Depot',
    type: 'OUTWARD_SALE',
    ref: 'SINV/2026/0002',
    in: 0,
    out: 50,
    bal: 5850,
    rate: 160.0,
    notes: 'Wholesale shipment to Oxford Book Store',
  },
  {
    id: 'mov_05',
    date: '2026-11-02 09:30',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1)',
    wh: 'Central Press & Distribution Depot',
    type: 'INWARD_PURCHASE',
    ref: 'GRN/2026/0002',
    in: 1000,
    out: 0,
    bal: 5950,
    rate: 170.0,
    notes: 'Direct press intake batch P01',
  },
];

export const INITIAL_AUDITS: CycleCountAuditItem[] = [
  {
    id: 'aud_01',
    auditNumber: 'AUD/2026/0001',
    warehouseId: 'wh_central_press_depot',
    warehouse: 'Central Press & Distribution Depot',
    date: '2026-11-05',
    scheduledBy: 'Internal Audit & Stocktaking Committee',
    itemsCount: 2,
    matched: 1,
    variance: 1,
    netVarianceValue: -1050.0,
    status: 'DISCREPANCY_FLAGGED',
    notes: 'Physical count verified across Aisles A & B; 5 copies of Mathematics XII damaged.',
    lines: [
      {
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        systemBookQty: 5550,
        physicalCountQty: 5550,
        varianceQty: 0,
        unitCost: 161.68,
        varianceValue: 0.0,
        status: 'MATCHED',
      },
      {
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        systemBookQty: 1500,
        physicalCountQty: 1495,
        varianceQty: -5,
        unitCost: 210.0,
        varianceValue: -1050.0,
        status: 'SHORTAGE',
      },
    ],
  },
];

export const INITIAL_ADJUSTMENTS: StockAdjustmentItem[] = [
  {
    id: 'adj_01',
    adjustmentNumber: 'ADJ/2026/0001',
    warehouseId: 'wh_central_press_depot',
    warehouse: 'Central Press & Distribution Depot',
    type: 'DAMAGE_WRITEOFF',
    date: '2026-11-05',
    sku: 'BK-MATH-12-ENG-PB',
    title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
    reason: 'Write-off of 5 water-damaged math book copies flagged in cycle count',
    systemQty: 1500,
    physicalQty: 1495,
    varianceQty: -5,
    unitCost: 210.0,
    varianceValue: -1050.0,
    voucherNumber: 'JV/2026/0005',
    status: 'POSTED',
  },
];

// LocalStorage Keys
const WAREHOUSES_KEY = 'kibo360_inventory_warehouses_v2';
const STOCKS_KEY = 'kibo360_inventory_stocks_v2';
const TRANSFERS_KEY = 'kibo360_inventory_transfers_v2';
const MOVEMENTS_KEY = 'kibo360_inventory_movements_v2';
const AUDITS_KEY = 'kibo360_inventory_audits_v2';
const ADJUSTMENTS_KEY = 'kibo360_inventory_adjustments_v2';

// --- WAREHOUSE HELPERS ---
export function getStoredWarehouses(): WarehouseItem[] {
  try {
    const raw = localStorage.getItem(WAREHOUSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredWarehouses(INITIAL_WAREHOUSES);
  return INITIAL_WAREHOUSES;
}

export function saveStoredWarehouses(warehouses: WarehouseItem[]): void {
  try {
    localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
  } catch {}
}

export function saveWarehouseItem(
  wh: Partial<WarehouseItem> & { name: string; city: string }
): WarehouseItem {
  const current = getStoredWarehouses();
  if (wh.id) {
    const updated = current.map((w) => (w.id === wh.id ? ({ ...w, ...wh } as WarehouseItem) : w));
    saveStoredWarehouses(updated);
    return updated.find((w) => w.id === wh.id)!;
  } else {
    const code =
      wh.code ||
      `WH-${wh.city.toUpperCase().replace(/\s+/g, '').slice(0, 4)}-${String(current.length + 1).padStart(2, '0')}`;
    const created: WarehouseItem = {
      id: 'wh_' + Date.now(),
      code,
      name: wh.name,
      city: wh.city,
      state: wh.state || 'Delhi',
      address: wh.address || '',
      pincode: wh.pincode || '',
      type: wh.type || 'BRANCH_GODOWN',
      managerName: wh.managerName || 'Depot In-charge',
      contactPhone: wh.contactPhone || '+91 98000 00000',
      totalCapacitySqFt: Number(wh.totalCapacitySqFt) || 10000,
      currentUtilizationPct: Number(wh.currentUtilizationPct) || 50,
      status: wh.status || 'ACTIVE',
    };
    saveStoredWarehouses([created, ...current]);
    return created;
  }
}

export function deleteWarehouseItem(id: string): void {
  const current = getStoredWarehouses();
  saveStoredWarehouses(current.filter((w) => w.id !== id));
}

// --- STOCK HELPERS ---
export function getStoredStocks(): StockItem[] {
  try {
    const raw = localStorage.getItem(STOCKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredStocks(INITIAL_STOCKS);
  return INITIAL_STOCKS;
}

export function saveStoredStocks(stocks: StockItem[]): void {
  try {
    localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
  } catch {}
}

export function saveStockItem(stock: Partial<StockItem> & { sku: string; title: string; warehouseName: string }): StockItem {
  const current = getStoredStocks();
  const onHand = Number(stock.onHand) || 0;
  const reserved = Number(stock.reserved) || 0;
  const available = Math.max(0, onHand - reserved);
  const reorder = Number(stock.reorderLevel) || 100;
  const status: StockItem['status'] =
    onHand <= 0 ? 'OUT_OF_STOCK' : onHand < reorder ? 'LOW_STOCK' : 'IN_STOCK';

  if (stock.id) {
    const updated = current.map((s) => {
      if (s.id === stock.id) {
        return {
          ...s,
          ...stock,
          onHand,
          reserved,
          available,
          reorderLevel: reorder,
          status,
        } as StockItem;
      }
      return s;
    });
    saveStoredStocks(updated);
    return updated.find((s) => s.id === stock.id)!;
  } else {
    const created: StockItem = {
      id: 'stk_' + Date.now(),
      bookId: stock.bookId,
      sku: stock.sku,
      title: stock.title,
      isbn: stock.isbn || '9788177090000',
      warehouseId: stock.warehouseId || 'wh_central_press_depot',
      warehouseName: stock.warehouseName,
      rackShelf: stock.rackShelf || 'RACK-GEN-01',
      batchNo: stock.batchNo || `BATCH-${new Date().getFullYear()}-01`,
      onHand,
      reserved,
      available,
      reorderLevel: reorder,
      wacCost: Number(stock.wacCost) || 150.0,
      fifoLots: stock.fifoLots || [
        {
          lotId: `LOT-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          qty: onHand,
          unitCost: Number(stock.wacCost) || 150.0,
        },
      ],
      mrp: Number(stock.mrp) || 350.0,
      status,
      inwardDate: stock.inwardDate || new Date().toISOString().slice(0, 10),
    };
    saveStoredStocks([created, ...current]);

    // Record Inward Movement
    recordStockMovement({
      sku: created.sku,
      title: created.title,
      wh: created.warehouseName,
      type: 'INWARD_PURCHASE',
      ref: `INW/${Date.now().toString().slice(-6)}`,
      in: onHand,
      out: 0,
      bal: onHand,
      rate: created.wacCost,
      notes: 'Initial inward entry created',
    });

    return created;
  }
}

export function deleteStockItem(id: string): void {
  const current = getStoredStocks();
  saveStoredStocks(current.filter((s) => s.id !== id));
}

// --- TRANSFERS HELPERS ---
export function getStoredTransfers(): StockTransferItem[] {
  try {
    const raw = localStorage.getItem(TRANSFERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredTransfers(INITIAL_TRANSFERS);
  return INITIAL_TRANSFERS;
}

export function saveStoredTransfers(transfers: StockTransferItem[]): void {
  try {
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify(transfers));
  } catch {}
}

export function createTransfer(
  data: {
    fromWarehouseId: string;
    fromWarehouseName: string;
    toWarehouseId: string;
    toWarehouseName: string;
    sku: string;
    title: string;
    copiesDispatched: number;
    transporter: string;
    lrNumber?: string;
    vehicleNumber?: string;
    remarks?: string;
  }
): StockTransferItem {
  const transfers = getStoredTransfers();
  const year = new Date().getFullYear();
  const count = transfers.length + 1;
  const transferNumber = `TRF/${year}/${String(count).padStart(4, '0')}`;
  const lrNumber = data.lrNumber || `LR-${Math.floor(100000 + Math.random() * 900000)}`;

  const newTransfer: StockTransferItem = {
    id: 'trf_' + Date.now(),
    transferNumber,
    fromWarehouseId: data.fromWarehouseId,
    fromWarehouseName: data.fromWarehouseName,
    toWarehouseId: data.toWarehouseId,
    toWarehouseName: data.toWarehouseName,
    sku: data.sku,
    title: data.title,
    dispatchDate: new Date().toISOString().slice(0, 10),
    status: 'DISPATCHED_IN_TRANSIT',
    transporter: data.transporter,
    lrNumber,
    vehicleNumber: data.vehicleNumber,
    copiesDispatched: data.copiesDispatched,
    copiesReceived: 0,
    copiesDamaged: 0,
    discrepancy: 0,
    remarks: data.remarks,
  };

  saveStoredTransfers([newTransfer, ...transfers]);

  // Deduct from Source Warehouse Stock
  const stocks = getStoredStocks();
  const sourceStock = stocks.find(
    (s) => s.sku === data.sku && s.warehouseId === data.fromWarehouseId
  );
  if (sourceStock) {
    const newOnHand = Math.max(0, sourceStock.onHand - data.copiesDispatched);
    const updatedStock = {
      ...sourceStock,
      onHand: newOnHand,
      available: Math.max(0, newOnHand - sourceStock.reserved),
      status: (newOnHand <= 0
        ? 'OUT_OF_STOCK'
        : newOnHand < sourceStock.reorderLevel
        ? 'LOW_STOCK'
        : 'IN_STOCK') as StockItem['status'],
    };
    saveStoredStocks(stocks.map((s) => (s.id === sourceStock.id ? updatedStock : s)));

    // Record Outward Transfer movement
    recordStockMovement({
      sku: data.sku,
      title: data.title,
      wh: data.fromWarehouseName,
      type: 'OUTWARD_TRANSFER',
      ref: transferNumber,
      in: 0,
      out: data.copiesDispatched,
      bal: newOnHand,
      rate: sourceStock.wacCost,
      notes: `Dispatched to ${data.toWarehouseName} via ${data.transporter}`,
    });
  }

  return newTransfer;
}

export function receiveTransfer(
  transferId: string,
  copiesReceived: number,
  copiesDamaged: number,
  notes?: string
): StockTransferItem | null {
  const transfers = getStoredTransfers();
  const transfer = transfers.find((t) => t.id === transferId);
  if (!transfer) return null;

  const totalAccounted = copiesReceived + copiesDamaged;
  const discrepancy = transfer.copiesDispatched - totalAccounted;
  const status: StockTransferItem['status'] =
    discrepancy === 0 && copiesDamaged === 0 ? 'COMPLETED' : 'PARTIALLY_RECEIVED';

  const updatedTransfer: StockTransferItem = {
    ...transfer,
    copiesReceived,
    copiesDamaged,
    discrepancy,
    deliveryDate: new Date().toISOString().slice(0, 10),
    status,
    remarks: notes || transfer.remarks,
  };

  saveStoredTransfers(transfers.map((t) => (t.id === transferId ? updatedTransfer : t)));

  // Add Good Copies to Destination Warehouse Stock
  const stocks = getStoredStocks();
  const destStock = stocks.find(
    (s) => s.sku === transfer.sku && s.warehouseId === transfer.toWarehouseId
  );

  if (destStock) {
    const newOnHand = destStock.onHand + copiesReceived;
    const updatedStock = {
      ...destStock,
      onHand: newOnHand,
      available: Math.max(0, newOnHand - destStock.reserved),
      status: (newOnHand <= 0
        ? 'OUT_OF_STOCK'
        : newOnHand < destStock.reorderLevel
        ? 'LOW_STOCK'
        : 'IN_STOCK') as StockItem['status'],
    };
    saveStoredStocks(stocks.map((s) => (s.id === destStock.id ? updatedStock : s)));

    recordStockMovement({
      sku: transfer.sku,
      title: transfer.title,
      wh: transfer.toWarehouseName,
      type: 'TRANSFER_RECEIPT',
      ref: transfer.transferNumber,
      in: copiesReceived,
      out: 0,
      bal: newOnHand,
      rate: destStock.wacCost,
      notes: `Received from ${transfer.fromWarehouseName}`,
    });
  } else {
    // If not in destination warehouse yet, create stock item
    const createdDestStock: StockItem = {
      id: 'stk_' + Date.now(),
      sku: transfer.sku,
      title: transfer.title,
      isbn: '9788177091877',
      warehouseId: transfer.toWarehouseId,
      warehouseName: transfer.toWarehouseName,
      rackShelf: 'RACK-DEST-01',
      batchNo: 'BATCH-TRF-' + new Date().getFullYear(),
      onHand: copiesReceived,
      reserved: 0,
      available: copiesReceived,
      reorderLevel: 100,
      wacCost: 160.0,
      fifoLots: [
        {
          lotId: `LOT-TRF-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          qty: copiesReceived,
          unitCost: 160.0,
        },
      ],
      mrp: 495.0,
      status: 'IN_STOCK',
      inwardDate: new Date().toISOString().slice(0, 10),
    };
    saveStoredStocks([createdDestStock, ...stocks]);

    recordStockMovement({
      sku: transfer.sku,
      title: transfer.title,
      wh: transfer.toWarehouseName,
      type: 'TRANSFER_RECEIPT',
      ref: transfer.transferNumber,
      in: copiesReceived,
      out: 0,
      bal: copiesReceived,
      rate: 160.0,
      notes: `Received from ${transfer.fromWarehouseName}`,
    });
  }

  // If there are damaged copies, write-off or log to Damaged Depot
  if (copiesDamaged > 0) {
    saveAdjustmentItem({
      warehouseId: transfer.toWarehouseId,
      warehouse: transfer.toWarehouseName,
      type: 'DAMAGE_WRITEOFF',
      sku: transfer.sku,
      title: transfer.title,
      reason: `Transit damage for ${transfer.transferNumber} via ${transfer.transporter}`,
      systemQty: copiesReceived + copiesDamaged,
      physicalQty: copiesReceived,
      varianceQty: -copiesDamaged,
      unitCost: 160.0,
    });
  }

  return updatedTransfer;
}

// --- MOVEMENTS HELPERS ---
export function getStoredMovements(): StockMovementItem[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredMovements(INITIAL_MOVEMENTS);
  return INITIAL_MOVEMENTS;
}

export function saveStoredMovements(movements: StockMovementItem[]): void {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  } catch {}
}

export function recordStockMovement(
  movement: Omit<StockMovementItem, 'id' | 'date'> & { date?: string }
): StockMovementItem {
  const current = getStoredMovements();
  const now = new Date();
  const dateStr =
    movement.date ||
    `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

  const created: StockMovementItem = {
    id: 'mov_' + Date.now() + Math.random().toString(36).substring(2, 5),
    date: dateStr,
    ...movement,
  };

  saveStoredMovements([created, ...current]);
  return created;
}

// --- AUDITS & CYCLE COUNTS HELPERS ---
export function getStoredAudits(): CycleCountAuditItem[] {
  try {
    const raw = localStorage.getItem(AUDITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredAudits(INITIAL_AUDITS);
  return INITIAL_AUDITS;
}

export function saveStoredAudits(audits: CycleCountAuditItem[]): void {
  try {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
  } catch {}
}

export function saveAuditItem(
  audit: Partial<CycleCountAuditItem> & {
    warehouseId: string;
    warehouse: string;
    lines: AuditLineItem[];
  }
): CycleCountAuditItem {
  const current = getStoredAudits();
  const matched = audit.lines.filter((l) => l.varianceQty === 0).length;
  const variance = audit.lines.filter((l) => l.varianceQty !== 0).length;
  const netVarianceValue = audit.lines.reduce((acc, l) => acc + l.varianceValue, 0);
  const status: CycleCountAuditItem['status'] =
    variance > 0 ? 'DISCREPANCY_FLAGGED' : 'RECONCILED';

  if (audit.id) {
    const updated = current.map((a) =>
      a.id === audit.id
        ? ({
            ...a,
            ...audit,
            matched,
            variance,
            netVarianceValue,
            status,
          } as CycleCountAuditItem)
        : a
    );
    saveStoredAudits(updated);
    return updated.find((a) => a.id === audit.id)!;
  } else {
    const year = new Date().getFullYear();
    const count = current.length + 1;
    const auditNumber = `AUD/${year}/${String(count).padStart(4, '0')}`;

    const created: CycleCountAuditItem = {
      id: 'aud_' + Date.now(),
      auditNumber,
      warehouseId: audit.warehouseId,
      warehouse: audit.warehouse,
      date: audit.date || new Date().toISOString().slice(0, 10),
      scheduledBy: audit.scheduledBy || 'Stock Audit Team',
      itemsCount: audit.lines.length,
      matched,
      variance,
      netVarianceValue,
      status,
      lines: audit.lines,
      notes: audit.notes,
    };

    saveStoredAudits([created, ...current]);
    return created;
  }
}

export function deleteAuditItem(id: string): void {
  const current = getStoredAudits();
  saveStoredAudits(current.filter((a) => a.id !== id));
}

// --- ADJUSTMENTS HELPERS ---
export function getStoredAdjustments(): StockAdjustmentItem[] {
  try {
    const raw = localStorage.getItem(ADJUSTMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredAdjustments(INITIAL_ADJUSTMENTS);
  return INITIAL_ADJUSTMENTS;
}

export function saveStoredAdjustments(adjustments: StockAdjustmentItem[]): void {
  try {
    localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(adjustments));
  } catch {}
}

export function saveAdjustmentItem(
  adj: Partial<StockAdjustmentItem> & {
    warehouseId: string;
    warehouse: string;
    sku: string;
    type: StockAdjustmentItem['type'];
    varianceQty: number;
    unitCost: number;
    reason: string;
  }
): StockAdjustmentItem {
  const current = getStoredAdjustments();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const adjustmentNumber = `ADJ/${year}/${String(count).padStart(4, '0')}`;
  const voucherNumber = `JV/${year}/${String(count + 4).padStart(4, '0')}`;
  const varianceValue = Number((adj.varianceQty * adj.unitCost).toFixed(2));

  const created: StockAdjustmentItem = {
    id: 'adj_' + Date.now(),
    adjustmentNumber,
    warehouseId: adj.warehouseId,
    warehouse: adj.warehouse,
    type: adj.type,
    date: adj.date || new Date().toISOString().slice(0, 10),
    sku: adj.sku,
    title: adj.title || 'Stock Item',
    reason: adj.reason,
    systemQty: Number(adj.systemQty) || 0,
    physicalQty: Number(adj.physicalQty) || 0,
    varianceQty: adj.varianceQty,
    unitCost: adj.unitCost,
    varianceValue,
    voucherNumber,
    status: 'POSTED',
  };

  saveStoredAdjustments([created, ...current]);

  // Update Stock Quantity in the selected Warehouse
  const stocks = getStoredStocks();
  const stockItem = stocks.find(
    (s) => s.sku === adj.sku && s.warehouseId === adj.warehouseId
  );
  if (stockItem) {
    const newOnHand = Math.max(0, stockItem.onHand + adj.varianceQty);
    const updated = {
      ...stockItem,
      onHand: newOnHand,
      available: Math.max(0, newOnHand - stockItem.reserved),
      status: (newOnHand <= 0
        ? 'OUT_OF_STOCK'
        : newOnHand < stockItem.reorderLevel
        ? 'LOW_STOCK'
        : 'IN_STOCK') as StockItem['status'],
    };
    saveStoredStocks(stocks.map((s) => (s.id === stockItem.id ? updated : s)));

    // Record Stock Movement
    recordStockMovement({
      sku: adj.sku,
      title: stockItem.title,
      wh: adj.warehouse,
      type: adj.type === 'DAMAGE_WRITEOFF' ? 'DAMAGE_WRITEOFF' : 'CYCLE_COUNT_ADJUSTMENT',
      ref: adjustmentNumber,
      in: adj.varianceQty > 0 ? adj.varianceQty : 0,
      out: adj.varianceQty < 0 ? Math.abs(adj.varianceQty) : 0,
      bal: newOnHand,
      rate: adj.unitCost,
      notes: `${adj.type.replace(/_/g, ' ')}: ${adj.reason}`,
    });
  }

  // Create real Journal Voucher in GL (voucherService)
  try {
    const absValue = Math.abs(varianceValue);
    const ledgers = getStoredLedgers();
    const lossLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('loss') || l.name.toLowerCase().includes('damage')) ||
      ledgers.find((l) => l.classification === 'EXPENSE') ||
      ledgers[0];
    const inventoryLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('inventory') || l.name.toLowerCase().includes('stock')) ||
      ledgers.find((l) => l.classification === 'ASSET') ||
      ledgers[1] ||
      ledgers[0];

    postDoubleEntryVoucher({
      voucherType: 'JOURNAL',
      date: created.date,
      branchName: adj.warehouse,
      createdByName: 'Inventory Manager',
      narration: `Stock Adjustment ${adjustmentNumber} for SKU: ${adj.sku}. Reason: ${adj.reason}`,
      totalAmount: absValue,
      items: [
        {
          id: 'vli_' + Date.now() + '_1',
          ledgerId: lossLedger.id,
          ledgerName: lossLedger.name,
          ledgerCode: lossLedger.code,
          debitAmount: adj.varianceQty < 0 ? absValue : 0,
          creditAmount: adj.varianceQty > 0 ? absValue : 0,
          description: `${adj.type.replace(/_/g, ' ')} for ${adj.sku} (${adj.varianceQty} copies)`,
        },
        {
          id: 'vli_' + Date.now() + '_2',
          ledgerId: inventoryLedger.id,
          ledgerName: inventoryLedger.name,
          ledgerCode: inventoryLedger.code,
          debitAmount: adj.varianceQty > 0 ? absValue : 0,
          creditAmount: adj.varianceQty < 0 ? absValue : 0,
          description: `Adjustment to warehouse stock balance (${adj.varianceQty} copies)`,
        },
      ],
    });
  } catch (e) {
    console.error('Error posting GL voucher for stock adjustment:', e);
  }

  return created;
}

export function deleteAdjustmentItem(id: string): void {
  const current = getStoredAdjustments();
  saveStoredAdjustments(current.filter((a) => a.id !== id));
}

// --- VALUATION & AGEING CALCULATIONS ---
export function calculateValuationAndAgeing(stocks: StockItem[]): {
  items: ValuationAgeingSummary[];
  totalWacValue: number;
  totalFifoValue: number;
  netDelta: number;
  activeValue: number;
  normalValue: number;
  slowMovingValue: number;
  deadStockValue: number;
} {
  const now = new Date().getTime();

  let totalWac = 0;
  let totalFifo = 0;
  let activeVal = 0;
  let normalVal = 0;
  let slowVal = 0;
  let deadVal = 0;

  const items: ValuationAgeingSummary[] = stocks.map((s) => {
    const wacVal = Number((s.onHand * s.wacCost).toFixed(2));
    totalWac += wacVal;

    // FIFO calculation based on fifoLots
    let fifoVal = 0;
    if (s.fifoLots && s.fifoLots.length > 0) {
      let remaining = s.onHand;
      for (const lot of s.fifoLots) {
        if (remaining <= 0) break;
        const take = Math.min(lot.qty, remaining);
        fifoVal += take * lot.unitCost;
        remaining -= take;
      }
      if (remaining > 0) {
        fifoVal += remaining * s.wacCost;
      }
    } else {
      fifoVal = wacVal;
    }
    fifoVal = Number(fifoVal.toFixed(2));
    totalFifo += fifoVal;

    const delta = Number((fifoVal - wacVal).toFixed(2));

    // Ageing Calculation based on inwardDate
    const inwardTime = s.inwardDate ? new Date(s.inwardDate).getTime() : now;
    const diffDays = Math.max(0, Math.floor((now - inwardTime) / (1000 * 60 * 60 * 24)));

    let ageBucket: ValuationAgeingSummary['ageBucket'] = '< 30 Days';
    let ageStatus: ValuationAgeingSummary['ageStatus'] = 'ACTIVE';

    if (diffDays <= 30) {
      ageBucket = '< 30 Days';
      ageStatus = 'ACTIVE';
      activeVal += wacVal;
    } else if (diffDays <= 90) {
      ageBucket = '30-90 Days';
      ageStatus = 'NORMAL';
      normalVal += wacVal;
    } else if (diffDays <= 180) {
      ageBucket = '91-180 Days';
      ageStatus = 'SLOW_MOVING';
      slowVal += wacVal;
    } else {
      ageBucket = '> 180 Days';
      ageStatus = 'DEAD_STOCK';
      deadVal += wacVal;
    }

    return {
      sku: s.sku,
      title: s.title,
      isbn: s.isbn,
      warehouseName: s.warehouseName,
      onHand: s.onHand,
      wacCost: s.wacCost,
      wacTotalValue: wacVal,
      fifoTotalValue: fifoVal,
      valuationDelta: delta,
      ageDays: diffDays,
      ageBucket,
      ageStatus,
    };
  });

  return {
    items,
    totalWacValue: Number(totalWac.toFixed(2)),
    totalFifoValue: Number(totalFifo.toFixed(2)),
    netDelta: Number((totalFifo - totalWac).toFixed(2)),
    activeValue: Number(activeVal.toFixed(2)),
    normalValue: Number(normalVal.toFixed(2)),
    slowMovingValue: Number(slowVal.toFixed(2)),
    deadStockValue: Number(deadVal.toFixed(2)),
  };
}
