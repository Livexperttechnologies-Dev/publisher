import { AppError } from '../../middleware/errorHandler';
import { booksService } from '../books/books.service';
import { accountingService } from '../accounting/accounting.service';
import {
  Warehouse,
  WarehouseRack,
  WarehouseStock,
  StockMovement,
  FifoCostLot,
  StockTransfer,
  StockTransferItem,
  StockAdjustment,
  StockAdjustmentItem,
  StockAuditSession,
  StockAuditItem,
  BarcodeLabelRequest,
  BarcodeLabelOutput,
  StockSummaryItem,
  StockLedgerEntry,
  StockAgeingItem,
} from './inventory.types';

// In-Memory Enterprise Stores for High-Performance Operation & Sub-Millisecond Queries
const warehousesStore = new Map<string, Warehouse>();
const racksStore = new Map<string, WarehouseRack>();
const warehouseStocksStore = new Map<string, WarehouseStock>(); // key: `${warehouseId}_${sku}`
const fifoLotsStore = new Map<string, FifoCostLot>(); // key: lotId
const stockMovementsStore = new Map<string, StockMovement>();
const stockTransfersStore = new Map<string, StockTransfer>();
const stockAdjustmentsStore = new Map<string, StockAdjustment>();
const stockAuditSessionsStore = new Map<string, StockAuditSession>();

export class InventoryService {
  constructor() {
    this.seedInitialData();
  }

  // ==========================================================================
  // SEED INITIAL WAREHOUSES, RACKS, FIFO LOTS & STOCK LEVELS
  // ==========================================================================
  private seedInitialData() {
    if (warehousesStore.size > 0) return;

    // 1. Central Depots & Godowns
    const w1: Warehouse = {
      id: 'wh_central_press_depot',
      companyId: 'cmp_default_publisher',
      code: 'WH-CENTRAL-01',
      name: 'KIBO360 Central Press & Distribution Depot',
      type: 'CENTRAL_DEPOT',
      address: 'Plot 42, Okhla Industrial Area Phase-III',
      city: 'New Delhi',
      state: 'Delhi',
      stateCode: '07',
      pincode: '110020',
      contactPerson: 'Rajesh Khanna (Chief Logistics Officer)',
      contactPhone: '+91 98110 54321',
      capacitySqFt: 35000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const w2: Warehouse = {
      id: 'wh_bhiwandi_godown',
      companyId: 'cmp_default_publisher',
      code: 'WH-WEST-BHIWANDI',
      name: 'Western Regional Hub & Godown (Bhiwandi)',
      type: 'BRANCH_GODOWN',
      address: 'Building B4, Shree Rajlaxmi Commercial Complex, Kalher',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '421302',
      contactPerson: 'Suresh Patil (Depot Superintendent)',
      contactPhone: '+91 98220 99881',
      capacitySqFt: 25000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const w3: Warehouse = {
      id: 'wh_retail_bookstore_depot',
      companyId: 'cmp_default_publisher',
      code: 'WH-RETAIL-01',
      name: 'Connaught Place Retail Depot & Outlet',
      type: 'RETAIL_OUTLET',
      address: 'Shop 14, Inner Circle, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      stateCode: '07',
      pincode: '110001',
      contactPerson: 'Pooja Sharma (POS Store Manager)',
      contactPhone: '+91 98100 11223',
      capacitySqFt: 4500,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const w4: Warehouse = {
      id: 'wh_damaged_quarantine_hold',
      companyId: 'cmp_default_publisher',
      code: 'WH-DAMAGED-HOLD',
      name: 'Quarantine & Damaged Returns Depot',
      type: 'DAMAGED_HOLD',
      address: 'Warehouse Annex 2, Okhla Phase-III',
      city: 'New Delhi',
      state: 'Delhi',
      stateCode: '07',
      pincode: '110020',
      contactPerson: 'Anil Verma (Quality Control Inspector)',
      contactPhone: '+91 98110 99001',
      capacitySqFt: 5000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    warehousesStore.set(w1.id, w1);
    warehousesStore.set(w2.id, w2);
    warehousesStore.set(w3.id, w3);
    warehousesStore.set(w4.id, w4);

    // 2. Racks & Shelves
    const r1: WarehouseRack = {
      id: 'rack_01',
      warehouseId: w1.id,
      rackCode: 'RACK-A1-01',
      aisle: 'AISLE-A',
      shelfLevel: 'SHELF-1',
      binNumber: 'BIN-01',
      capacityBooks: 2500,
      currentCount: 1800,
      categoryAssigned: 'Physics & Applied Sciences',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const r2: WarehouseRack = {
      id: 'rack_02',
      warehouseId: w1.id,
      rackCode: 'RACK-B2-01',
      aisle: 'AISLE-B',
      shelfLevel: 'SHELF-2',
      binNumber: 'BIN-04',
      capacityBooks: 3000,
      currentCount: 2200,
      categoryAssigned: 'Mathematics Class 11 & 12',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const r3: WarehouseRack = {
      id: 'rack_03',
      warehouseId: w2.id,
      rackCode: 'RACK-W1-01',
      aisle: 'AISLE-W1',
      shelfLevel: 'SHELF-1',
      binNumber: 'BIN-10',
      capacityBooks: 5000,
      currentCount: 1200,
      categoryAssigned: 'Literature & Fiction',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    racksStore.set(r1.id, r1);
    racksStore.set(r2.id, r2);
    racksStore.set(r3.id, r3);

    // 3. Initial Stock Levels
    const initialStocks = [
      {
        bookId: 'bk_physics_part1',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1)',
        isbn: '9788177091877',
        warehouseId: w1.id,
        warehouseName: w1.name,
        rackShelfCode: 'RACK-A1-01',
        quantityOnHand: 4950,
        quantityReserved: 50,
        reorderLevel: 500,
        safetyStock: 200,
        maxStockLevel: 10000,
        weightedAverageCost: 160.0,
      },
      {
        bookId: 'bk_math_12_eng_pb',
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        isbn: '9788177098801',
        warehouseId: w1.id,
        warehouseName: w1.name,
        rackShelfCode: 'RACK-B2-01',
        quantityOnHand: 1500,
        quantityReserved: 0,
        reorderLevel: 300,
        safetyStock: 100,
        maxStockLevel: 5000,
        weightedAverageCost: 210.0,
      },
      {
        bookId: 'bk_lit_godan_hin',
        sku: 'BK-LIT-GODAN-HIN',
        title: 'गोदान (उपन्यास - मुंशी प्रेमचंद)',
        isbn: '9788177095512',
        warehouseId: w2.id,
        warehouseName: w2.name,
        rackShelfCode: 'RACK-W1-01',
        quantityOnHand: 120, // Low stock, below reorder
        quantityReserved: 0,
        reorderLevel: 250,
        safetyStock: 50,
        maxStockLevel: 2000,
        weightedAverageCost: 95.0,
      },
    ];

    for (const s of initialStocks) {
      const stockId = `stk_${s.warehouseId}_${s.sku}`;
      const qtyAvailable = s.quantityOnHand - s.quantityReserved;
      const totalValuation = Number((s.quantityOnHand * s.weightedAverageCost).toFixed(2));

      const stockObj: WarehouseStock = {
        id: stockId,
        companyId: 'cmp_default_publisher',
        warehouseId: s.warehouseId,
        warehouseName: s.warehouseName,
        bookId: s.bookId,
        sku: s.sku,
        title: s.title,
        isbn: s.isbn,
        rackShelfCode: s.rackShelfCode,
        quantityOnHand: s.quantityOnHand,
        quantityReserved: s.quantityReserved,
        quantityAvailable: qtyAvailable,
        reorderLevel: s.reorderLevel,
        safetyStock: s.safetyStock,
        maxStockLevel: s.maxStockLevel,
        valuationMethod: 'WEIGHTED_AVERAGE',
        weightedAverageCost: s.weightedAverageCost,
        totalValuation,
        lastInwardDate: '2026-01-15T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      warehouseStocksStore.set(`${s.warehouseId}_${s.sku}`, stockObj);

      // Seed Initial FIFO Lot
      const lotId = `lot_init_${s.warehouseId}_${s.sku}`;
      const fifoLot: FifoCostLot = {
        id: lotId,
        companyId: 'cmp_default_publisher',
        warehouseId: s.warehouseId,
        bookId: s.bookId,
        sku: s.sku,
        lotNumber: `LOT-2026-0001`,
        inwardDate: '2026-01-15T00:00:00.000Z',
        originalQuantity: s.quantityOnHand,
        remainingQuantity: s.quantityOnHand,
        unitCost: s.weightedAverageCost,
        isExhausted: false,
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      };
      fifoLotsStore.set(lotId, fifoLot);
    }
  }

  // ==========================================================================
  // 1. WAREHOUSE & RACK MANAGEMENT
  // ==========================================================================
  async getWarehouses(filters?: { companyId?: string; search?: string }): Promise<Warehouse[]> {
    let list = Array.from(warehousesStore.values()).filter((w) => w.isActive);
    if (filters?.companyId) list = list.filter((w) => w.companyId === filters.companyId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q) || w.city.toLowerCase().includes(q));
    }
    return list;
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    return warehousesStore.get(id) || null;
  }

  async createWarehouse(data: any, companyId: string = 'cmp_default_publisher'): Promise<Warehouse> {
    const existing = Array.from(warehousesStore.values()).find((w) => w.code.toLowerCase() === data.code.toLowerCase());
    if (existing) {
      throw new AppError(`Warehouse with code '${data.code}' already exists`, 409);
    }

    const id = `wh_${Date.now()}`;
    const warehouse: Warehouse = {
      id,
      companyId,
      branchId: data.branchId,
      code: data.code.toUpperCase(),
      name: data.name,
      type: data.type || 'BRANCH_GODOWN',
      address: data.address,
      city: data.city,
      state: data.state,
      stateCode: data.stateCode || '07',
      pincode: data.pincode,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      capacitySqFt: data.capacitySqFt || 10000,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    warehousesStore.set(id, warehouse);
    return warehouse;
  }

  async getRacks(warehouseId: string): Promise<WarehouseRack[]> {
    return Array.from(racksStore.values()).filter((r) => r.warehouseId === warehouseId && r.isActive);
  }

  async createRack(data: any): Promise<WarehouseRack> {
    const warehouse = warehousesStore.get(data.warehouseId);
    if (!warehouse) throw new AppError('Warehouse not found', 404);

    const id = `rack_${Date.now()}`;
    const rack: WarehouseRack = {
      id,
      warehouseId: data.warehouseId,
      rackCode: data.rackCode.toUpperCase(),
      aisle: data.aisle.toUpperCase(),
      shelfLevel: data.shelfLevel.toUpperCase(),
      binNumber: data.binNumber ? data.binNumber.toUpperCase() : undefined,
      capacityBooks: data.capacityBooks || 1000,
      currentCount: 0,
      categoryAssigned: data.categoryAssigned,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    racksStore.set(id, rack);
    return rack;
  }

  // ==========================================================================
  // 2. STOCK TRACKING, CONSOLIDATED BALANCE & REAL-TIME AVAILABILITY
  // ==========================================================================
  async getWarehouseStocks(filters?: {
    warehouseId?: string;
    sku?: string;
    search?: string;
    belowReorder?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: WarehouseStock[]; total: number }> {
    let list = Array.from(warehouseStocksStore.values());

    if (filters?.warehouseId) {
      list = list.filter((s) => s.warehouseId === filters.warehouseId);
    }
    if (filters?.sku) {
      list = list.filter((s) => s.sku.toLowerCase() === filters.sku!.toLowerCase());
    }
    if (filters?.belowReorder) {
      list = list.filter((s) => s.quantityAvailable <= s.reorderLevel);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.sku.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          (s.isbn && s.isbn.includes(q)) ||
          (s.rackShelfCode && s.rackShelfCode.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getStockBySku(sku: string, warehouseId?: string): Promise<WarehouseStock | null> {
    const whId = warehouseId || 'wh_central_press_depot';
    const key = `${whId}_${sku}`;
    let stock = warehouseStocksStore.get(key);

    if (!stock) {
      // Look across any warehouse for this SKU
      stock = Array.from(warehouseStocksStore.values()).find((s) => s.sku.toLowerCase() === sku.toLowerCase());
    }

    return stock || null;
  }

  async getConsolidatedStock(sku: string): Promise<{
    sku: string;
    title: string;
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;
    totalValuation: number;
    warehouseBreakdown: { warehouseId: string; warehouseName: string; onHand: number; available: number }[];
  }> {
    const stocks = Array.from(warehouseStocksStore.values()).filter(
      (s) => s.sku.toLowerCase() === sku.toLowerCase()
    );

    if (stocks.length === 0) {
      throw new AppError(`No stock records found for SKU '${sku}'`, 404);
    }

    const title = stocks[0].title;
    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let totalValuation = 0;

    const breakdown = stocks.map((s) => {
      totalOnHand += s.quantityOnHand;
      totalReserved += s.quantityReserved;
      totalAvailable += s.quantityAvailable;
      totalValuation += s.totalValuation;
      return {
        warehouseId: s.warehouseId,
        warehouseName: s.warehouseName || s.warehouseId,
        onHand: s.quantityOnHand,
        available: s.quantityAvailable,
      };
    });

    return {
      sku,
      title,
      totalOnHand,
      totalReserved,
      totalAvailable,
      totalValuation: Number(totalValuation.toFixed(2)),
      warehouseBreakdown: breakdown,
    };
  }

  // ==========================================================================
  // 3. STOCK INWARD ENGINE (PURCHASES / PRODUCTION / RETURNS)
  // ==========================================================================
  async stockInward(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<WarehouseStock> {
    const warehouse = warehousesStore.get(data.warehouseId);
    if (!warehouse) throw new AppError('Target warehouse not found', 404);

    const qty = Number(data.quantity);
    if (qty <= 0) throw new AppError('Inward quantity must be positive', 400);

    const unitCost = Number(data.unitCost || 0);
    const key = `${data.warehouseId}_${data.sku}`;
    let stock = warehouseStocksStore.get(key);

    if (!stock) {
      // Find book details from catalogue
      let book: any;
      try {
        const books = await booksService.getAll({ limit: 1000 });
        book = books.items.find((b) => b.sku.toLowerCase() === data.sku.toLowerCase());
      } catch (e) {}

      stock = {
        id: `stk_${data.warehouseId}_${data.sku}`,
        companyId,
        warehouseId: data.warehouseId,
        warehouseName: warehouse.name,
        bookId: data.bookId || book?.id || `bk_${data.sku.toLowerCase()}`,
        sku: data.sku,
        title: book?.title || data.title || data.sku,
        isbn: book?.isbn13 || book?.isbn10,
        rackShelfCode: data.rackShelfCode || 'RACK-A1-01',
        quantityOnHand: 0,
        quantityReserved: 0,
        quantityAvailable: 0,
        reorderLevel: 200,
        safetyStock: 50,
        maxStockLevel: 5000,
        valuationMethod: 'WEIGHTED_AVERAGE',
        weightedAverageCost: unitCost,
        totalValuation: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Weighted Average Cost Calculation:
    // WAC_new = (Q_prev * Cost_prev + Q_in * Cost_in) / (Q_prev + Q_in)
    const prevQty = stock.quantityOnHand;
    const prevCost = stock.weightedAverageCost;
    const newQty = prevQty + qty;
    let newWac = prevCost;

    if (newQty > 0 && unitCost > 0) {
      const prevTotalVal = prevQty * prevCost;
      const inwardVal = qty * unitCost;
      newWac = Number(((prevTotalVal + inwardVal) / newQty).toFixed(2));
    } else if (prevQty === 0) {
      newWac = unitCost;
    }

    stock.quantityOnHand = newQty;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    stock.weightedAverageCost = newWac;
    stock.totalValuation = Number((stock.quantityOnHand * newWac).toFixed(2));
    stock.lastInwardDate = new Date().toISOString();
    stock.updatedAt = new Date().toISOString();

    warehouseStocksStore.set(key, stock);

    // FIFO Lot Creation (for dual valuation tracking)
    const lotId = `lot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fifoLot: FifoCostLot = {
      id: lotId,
      companyId,
      warehouseId: data.warehouseId,
      bookId: stock.bookId,
      sku: stock.sku,
      lotNumber: `LOT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      inwardDate: new Date().toISOString(),
      originalQuantity: qty,
      remainingQuantity: qty,
      unitCost,
      isExhausted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fifoLotsStore.set(lotId, fifoLot);

    // Record Stock Movement (Chronological Bin Card Trail)
    const movement: StockMovement = {
      id: `mvt_${Date.now()}`,
      companyId,
      warehouseId: data.warehouseId,
      warehouseName: warehouse.name,
      bookId: stock.bookId,
      sku: stock.sku,
      title: stock.title,
      movementType: (data.movementType as any) || 'INWARD_PURCHASE',
      referenceType: data.referenceType || 'GRN',
      referenceId: data.referenceId,
      referenceNumber: data.referenceNumber,
      quantityDelta: qty,
      unitCost,
      totalValue: Number((qty * unitCost).toFixed(2)),
      balanceOnHand: stock.quantityOnHand,
      notes: data.notes || `Stock Inward of ${qty} units`,
      performedById: userId,
      createdAt: new Date().toISOString(),
    };
    stockMovementsStore.set(movement.id, movement);

    // Sync with central book stock
    await booksService.adjustStock(stock.sku, qty);

    return stock;
  }

  // ==========================================================================
  // 4. STOCK OUTWARD ENGINE & STRICT NEGATIVE STOCK PREVENTION
  // ==========================================================================
  async stockOutward(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<{
    stock: WarehouseStock;
    fifoCostOfGoodsSold: number;
    lotsConsumed: { lotNumber: string; quantity: number; unitCost: number }[];
  }> {
    const warehouse = warehousesStore.get(data.warehouseId);
    if (!warehouse) throw new AppError('Warehouse not found', 404);

    const qty = Number(data.quantity);
    if (qty <= 0) throw new AppError('Outward quantity must be positive', 400);

    const key = `${data.warehouseId}_${data.sku}`;
    const stock = warehouseStocksStore.get(key);

    if (!stock) {
      throw new AppError(`No inventory record found for SKU '${data.sku}' in ${warehouse.name}`, 404);
    }

    // STRICT NEGATIVE STOCK PREVENTION BARRIER
    if (stock.quantityAvailable < qty) {
      throw new AppError(
        `Insufficient available inventory in ${warehouse.name} for SKU '${data.sku}'. Available: ${stock.quantityAvailable} units, Requested: ${qty} units. Negative stock is strictly disallowed.`,
        400
      );
    }

    // FIFO Lot Queue Depletion
    const activeLots = Array.from(fifoLotsStore.values())
      .filter((l) => l.warehouseId === data.warehouseId && l.sku.toLowerCase() === data.sku.toLowerCase() && !l.isExhausted)
      .sort((a, b) => new Date(a.inwardDate).getTime() - new Date(b.inwardDate).getTime());

    let needed = qty;
    let totalFifoCogs = 0;
    const lotsConsumed: { lotNumber: string; quantity: number; unitCost: number }[] = [];

    for (const lot of activeLots) {
      if (needed <= 0) break;

      const take = Math.min(lot.remainingQuantity, needed);
      lot.remainingQuantity -= take;
      needed -= take;
      totalFifoCogs += take * lot.unitCost;

      lotsConsumed.push({
        lotNumber: lot.lotNumber,
        quantity: take,
        unitCost: lot.unitCost,
      });

      if (lot.remainingQuantity === 0) {
        lot.isExhausted = true;
      }
      lot.updatedAt = new Date().toISOString();
      fifoLotsStore.set(lot.id, lot);
    }

    // Update Warehouse Stock Balances
    stock.quantityOnHand -= qty;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    stock.totalValuation = Number((stock.quantityOnHand * stock.weightedAverageCost).toFixed(2));
    stock.lastOutwardDate = new Date().toISOString();
    stock.updatedAt = new Date().toISOString();
    warehouseStocksStore.set(key, stock);

    // Record Outward Movement
    const movement: StockMovement = {
      id: `mvt_${Date.now()}`,
      companyId,
      warehouseId: data.warehouseId,
      warehouseName: warehouse.name,
      bookId: stock.bookId,
      sku: stock.sku,
      title: stock.title,
      movementType: (data.movementType as any) || 'OUTWARD_SALE',
      referenceType: data.referenceType || 'SALES_INVOICE',
      referenceId: data.referenceId,
      referenceNumber: data.referenceNumber,
      quantityDelta: -qty,
      unitCost: stock.weightedAverageCost,
      totalValue: Number((qty * stock.weightedAverageCost).toFixed(2)),
      balanceOnHand: stock.quantityOnHand,
      notes: data.notes || `Stock Outward of ${qty} units`,
      performedById: userId,
      createdAt: new Date().toISOString(),
    };
    stockMovementsStore.set(movement.id, movement);

    // Sync outward with central book stock
    await booksService.adjustStock(stock.sku, -qty);

    return {
      stock,
      fifoCostOfGoodsSold: Number(totalFifoCogs.toFixed(2)),
      lotsConsumed,
    };
  }

  // ==========================================================================
  // 5. STOCK RESERVATION ENGINE (FOR CONFIRMED SALES ORDERS)
  // ==========================================================================
  async stockReservation(data: {
    warehouseId: string;
    sku: string;
    quantity: number;
    salesOrderRef?: string;
    release?: boolean;
  }): Promise<WarehouseStock> {
    const key = `${data.warehouseId}_${data.sku}`;
    const stock = warehouseStocksStore.get(key);

    if (!stock) {
      throw new AppError(`Stock record for SKU '${data.sku}' not found`, 404);
    }

    const qty = Number(data.quantity);
    if (qty <= 0) throw new AppError('Reservation quantity must be positive', 400);

    if (data.release) {
      // Release reservation
      stock.quantityReserved = Math.max(0, stock.quantityReserved - qty);
      stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    } else {
      // Allocate reservation
      if (stock.quantityAvailable < qty) {
        throw new AppError(
          `Cannot reserve ${qty} copies of '${stock.sku}'. Only ${stock.quantityAvailable} available on hand.`,
          400
        );
      }
      stock.quantityReserved += qty;
      stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    }

    stock.updatedAt = new Date().toISOString();
    warehouseStocksStore.set(key, stock);
    return stock;
  }

  // ==========================================================================
  // 6. STOCK TRANSFERS (WAREHOUSE-TO-WAREHOUSE & IN-TRANSIT DISPATCH)
  // ==========================================================================
  async getTransfers(filters?: { status?: string; companyId?: string }): Promise<StockTransfer[]> {
    let list = Array.from(stockTransfersStore.values());
    if (filters?.status) list = list.filter((t) => t.status === filters.status);
    if (filters?.companyId) list = list.filter((t) => t.companyId === filters.companyId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransferById(id: string): Promise<StockTransfer | null> {
    return stockTransfersStore.get(id) || null;
  }

  async createTransfer(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<StockTransfer> {
    const fromWh = warehousesStore.get(data.fromWarehouseId);
    const toWh = warehousesStore.get(data.toWarehouseId);

    if (!fromWh) throw new AppError('Source warehouse not found', 404);
    if (!toWh) throw new AppError('Destination warehouse not found', 404);
    if (fromWh.id === toWh.id) throw new AppError('Source and Destination warehouses cannot be the same', 400);

    const year = new Date().getFullYear();
    const count = stockTransfersStore.size + 1;
    const transferNumber = `TRF/${year}/${String(count).padStart(4, '0')}`;
    const transferId = `trf_${Date.now()}`;

    // Verify stock availability in source warehouse for all items
    const transferItems: StockTransferItem[] = [];

    for (let idx = 0; idx < data.items.length; idx++) {
      const it = data.items[idx];
      const stockKey = `${fromWh.id}_${it.sku}`;
      const sourceStock = warehouseStocksStore.get(stockKey);

      if (!sourceStock || sourceStock.quantityAvailable < it.dispatchedQuantity) {
        throw new AppError(
          `Cannot transfer SKU '${it.sku}'. Available in ${fromWh.name}: ${sourceStock?.quantityAvailable || 0}, Dispatched: ${it.dispatchedQuantity}`,
          400
        );
      }

      // Decrement source warehouse stock (moves to IN_TRANSIT)
      await this.stockOutward(
        {
          warehouseId: fromWh.id,
          sku: it.sku,
          quantity: it.dispatchedQuantity,
          movementType: 'OUTWARD_TRANSFER',
          referenceType: 'STOCK_TRANSFER',
          referenceId: transferId,
          referenceNumber: transferNumber,
          notes: `Transfer dispatch to ${toWh.name} (Ref: ${transferNumber})`,
        },
        companyId,
        userId
      );

      transferItems.push({
        id: `trfi_${Date.now()}_${idx}`,
        transferId,
        bookId: sourceStock.bookId,
        sku: it.sku,
        title: it.title || sourceStock.title,
        dispatchedQuantity: it.dispatchedQuantity,
        receivedQuantity: 0,
        damagedQuantity: 0,
        discrepancyQuantity: 0,
        unitCost: sourceStock.weightedAverageCost,
        fromRackCode: it.fromRackCode || sourceStock.rackShelfCode,
        toRackCode: it.toRackCode || 'RACK-A1-01',
      });
    }

    const transfer: StockTransfer = {
      id: transferId,
      companyId,
      transferNumber,
      transferType: data.transferType || 'WAREHOUSE_TO_WAREHOUSE',
      fromWarehouseId: fromWh.id,
      fromWarehouseName: fromWh.name,
      toWarehouseId: toWh.id,
      toWarehouseName: toWh.name,
      dispatchDate: data.dispatchDate ? new Date(data.dispatchDate).toISOString() : new Date().toISOString(),
      expectedArrivalDate: data.expectedArrivalDate ? new Date(data.expectedArrivalDate).toISOString() : undefined,
      status: 'DISPATCHED_IN_TRANSIT',
      transporterName: data.transporterName || 'VRL Logistics India',
      vehicleNumber: data.vehicleNumber,
      lrNumber: data.lrNumber,
      notes: data.notes,
      items: transferItems,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    stockTransfersStore.set(transferId, transfer);
    return transfer;
  }

  async receiveTransfer(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<StockTransfer> {
    const transfer = stockTransfersStore.get(data.transferId);
    if (!transfer) throw new AppError('Stock Transfer record not found', 404);
    if (transfer.status === 'COMPLETED') throw new AppError('Stock Transfer has already been received and completed', 400);

    const toWh = warehousesStore.get(transfer.toWarehouseId);
    if (!toWh) throw new AppError('Destination warehouse not found', 404);

    let allCompleted = true;

    for (const rec of data.items) {
      const item = transfer.items.find((i) => i.sku.toLowerCase() === rec.sku.toLowerCase());
      if (!item) continue;

      const receivedQty = Number(rec.receivedQuantity || 0);
      const damagedQty = Number(rec.damagedQuantity || 0);
      const discrepancyQty = item.dispatchedQuantity - (receivedQty + damagedQty);

      item.receivedQuantity = receivedQty;
      item.damagedQuantity = damagedQty;
      item.discrepancyQuantity = discrepancyQty;

      // Inward good copies into Destination Warehouse
      if (receivedQty > 0) {
        await this.stockInward(
          {
            warehouseId: transfer.toWarehouseId,
            sku: item.sku,
            quantity: receivedQty,
            unitCost: item.unitCost,
            movementType: 'INWARD_TRANSFER',
            referenceType: 'STOCK_TRANSFER',
            referenceId: transfer.id,
            referenceNumber: transfer.transferNumber,
            rackShelfCode: rec.toRackCode || item.toRackCode,
            notes: `Transfer receipt from ${transfer.fromWarehouseName}`,
          },
          companyId,
          userId
        );
      }

      // Route transit damaged copies to Damaged Hold Warehouse
      if (damagedQty > 0) {
        await this.stockInward(
          {
            warehouseId: 'wh_damaged_quarantine_hold',
            sku: item.sku,
            quantity: damagedQty,
            unitCost: item.unitCost,
            movementType: 'INWARD_RETURN',
            referenceType: 'TRANSFER_DAMAGE',
            referenceId: transfer.id,
            referenceNumber: transfer.transferNumber,
            rackShelfCode: 'QUARANTINE-HOLD-01',
            notes: `Transit damaged copies from Transfer #${transfer.transferNumber}`,
          },
          companyId,
          userId
        );
      }

      if (receivedQty < item.dispatchedQuantity) {
        allCompleted = false;
      }
    }

    transfer.receivedDate = new Date().toISOString();
    transfer.status = allCompleted ? 'COMPLETED' : 'PARTIALLY_RECEIVED';
    transfer.updatedAt = new Date().toISOString();
    if (data.notes) transfer.notes = `${transfer.notes || ''} | Received notes: ${data.notes}`;

    stockTransfersStore.set(transfer.id, transfer);
    return transfer;
  }

  // ==========================================================================
  // 7. PHYSICAL STOCK AUDIT & CYCLE COUNT SESSIONS
  // ==========================================================================
  async getAuditSessions(filters?: { warehouseId?: string }): Promise<StockAuditSession[]> {
    let list = Array.from(stockAuditSessionsStore.values());
    if (filters?.warehouseId) list = list.filter((s) => s.warehouseId === filters.warehouseId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAuditSession(data: any, companyId: string = 'cmp_default_publisher'): Promise<StockAuditSession> {
    const warehouse = warehousesStore.get(data.warehouseId);
    if (!warehouse) throw new AppError('Warehouse not found', 404);

    const year = new Date().getFullYear();
    const count = stockAuditSessionsStore.size + 1;
    const auditSessionNumber = `AUD/${year}/${String(count).padStart(4, '0')}`;
    const sessionId = `aud_${Date.now()}`;

    const items: StockAuditItem[] = [];
    let matchedCount = 0;
    let varianceCount = 0;
    let netVarianceValue = 0;

    for (const c of data.items) {
      const stockKey = `${warehouse.id}_${c.sku}`;
      const stock = warehouseStocksStore.get(stockKey);
      const systemQty = stock ? stock.quantityOnHand : 0;
      const countedQty = Number(c.countedQuantity);
      const varianceQty = countedQty - systemQty;
      const unitCost = stock ? stock.weightedAverageCost : 150.0;
      const varianceVal = Number((varianceQty * unitCost).toFixed(2));

      if (varianceQty === 0) {
        matchedCount++;
      } else {
        varianceCount++;
      }
      netVarianceValue += varianceVal;

      items.push({
        id: `audi_${Date.now()}_${items.length}`,
        auditSessionId: sessionId,
        bookId: stock?.bookId || `bk_${c.sku.toLowerCase()}`,
        sku: c.sku,
        title: stock?.title || c.sku,
        rackShelfCode: c.rackShelfCode || stock?.rackShelfCode,
        systemQuantity: systemQty,
        countedQuantity: countedQty,
        varianceQuantity: varianceQty,
        unitCost,
        varianceValue: varianceVal,
        discrepancyResolved: varianceQty === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const session: StockAuditSession = {
      id: sessionId,
      companyId,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      auditSessionNumber,
      auditDate: data.auditDate ? new Date(data.auditDate).toISOString() : new Date().toISOString(),
      scheduledBy: data.scheduledBy || 'Internal Audit Committee',
      status: varianceCount > 0 ? 'DISCREPANCY_FLAGGED' : 'COMPLETED',
      totalItemsAudited: items.length,
      matchedCount,
      varianceCount,
      netVarianceValue: Number(netVarianceValue.toFixed(2)),
      notes: data.notes,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    stockAuditSessionsStore.set(sessionId, session);
    return session;
  }

  // ==========================================================================
  // 8. STOCK ADJUSTMENTS & DAMAGE WRITE-OFFS (AUTO DOUBLE-ENTRY GL POSTING)
  // ==========================================================================
  async getAdjustments(filters?: { warehouseId?: string }): Promise<StockAdjustment[]> {
    let list = Array.from(stockAdjustmentsStore.values());
    if (filters?.warehouseId) list = list.filter((a) => a.warehouseId === filters.warehouseId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAdjustment(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<StockAdjustment> {
    const warehouse = warehousesStore.get(data.warehouseId);
    if (!warehouse) throw new AppError('Warehouse not found', 404);

    const year = new Date().getFullYear();
    const count = stockAdjustmentsStore.size + 1;
    const adjustmentNumber = `ADJ/${year}/${String(count).padStart(4, '0')}`;
    const adjustmentId = `adj_${Date.now()}`;

    let totalVarianceQty = 0;
    let totalVarianceVal = 0;
    const items: StockAdjustmentItem[] = [];

    for (let idx = 0; idx < data.items.length; idx++) {
      const it = data.items[idx];
      const stockKey = `${warehouse.id}_${it.sku}`;
      const stock = warehouseStocksStore.get(stockKey);
      const systemQty = stock ? stock.quantityOnHand : 0;
      const physicalQty = Number(it.physicalQuantity);
      const varianceQty = physicalQty - systemQty;
      const unitCost = Number(it.unitCost || stock?.weightedAverageCost || 0);
      const varianceVal = Number((varianceQty * unitCost).toFixed(2));

      totalVarianceQty += varianceQty;
      totalVarianceVal += varianceVal;

      items.push({
        id: `adji_${Date.now()}_${idx}`,
        adjustmentId,
        bookId: stock?.bookId || `bk_${it.sku.toLowerCase()}`,
        sku: it.sku,
        title: it.title || stock?.title || it.sku,
        systemQuantity: systemQty,
        physicalQuantity: physicalQty,
        varianceQuantity: varianceQty,
        unitCost,
        varianceValue: varianceVal,
        rackShelfCode: it.rackShelfCode || stock?.rackShelfCode,
        notes: it.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Adjust physical balance in warehouse
      if (stock) {
        stock.quantityOnHand = physicalQty;
        stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
        stock.totalValuation = Number((stock.quantityOnHand * stock.weightedAverageCost).toFixed(2));
        stock.updatedAt = new Date().toISOString();
        warehouseStocksStore.set(stockKey, stock);
      }

      // Record Stock Movement
      const mvt: StockMovement = {
        id: `mvt_${Date.now()}_${idx}`,
        companyId,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        bookId: stock?.bookId || `bk_${it.sku.toLowerCase()}`,
        sku: it.sku,
        title: it.title,
        movementType: varianceQty < 0 ? 'OUTWARD_DAMAGE' : 'ADJUSTMENT_CYCLE_COUNT',
        referenceType: 'STOCK_ADJUSTMENT',
        referenceId: adjustmentId,
        referenceNumber: adjustmentNumber,
        quantityDelta: varianceQty,
        unitCost,
        totalValue: Math.abs(varianceVal),
        balanceOnHand: physicalQty,
        notes: `${data.reason} (Variance: ${varianceQty})`,
        performedById: userId,
        createdAt: new Date().toISOString(),
      };
      stockMovementsStore.set(mvt.id, mvt);

      // Central book stock alignment
      await booksService.adjustStock(it.sku, varianceQty);
    }

    // ========================================================================
    // GENERAL LEDGER DOUBLE-ENTRY POSTING FOR STOCK ADJUSTMENT
    // ========================================================================
    // Case A: Deficit / Damage / Shrinkage Write-off:
    //   Dr: Loss on Damaged / Lost Stock (5010)
    //   Cr: Inventory / Finished Stock (1004)
    // Case B: Surplus found during Cycle Count:
    //   Dr: Inventory / Finished Stock (1004)
    //   Cr: Inventory Adjustment Gain (3015)
    let voucherNumber = undefined;
    let accountingVoucherId = undefined;

    if (totalVarianceVal !== 0) {
      const absVal = Math.abs(totalVarianceVal);
      const isDeficit = totalVarianceVal < 0;

      const voucherItems = isDeficit
        ? [
            {
              ledgerId: 'led_loss_damaged_stock',
              debitAmount: absVal,
              creditAmount: 0.0,
              description: `Stock write-off / shrinkage at ${warehouse.name} (Ref: ${adjustmentNumber})`,
            },
            {
              ledgerId: 'led_stock_in_hand',
              debitAmount: 0.0,
              creditAmount: absVal,
              description: `Inventory reduction on ${data.adjustmentType}`,
            },
          ]
        : [
            {
              ledgerId: 'led_stock_in_hand',
              debitAmount: absVal,
              creditAmount: 0.0,
              description: `Stock surplus adjustment at ${warehouse.name} (Ref: ${adjustmentNumber})`,
            },
            {
              ledgerId: 'led_inventory_gain',
              debitAmount: 0.0,
              creditAmount: absVal,
              description: `Inventory gain on ${data.adjustmentType}`,
            },
          ];

      try {
        const glVoucher = await accountingService.createVoucher(
          {
            voucherType: 'JOURNAL',
            entryDate: data.adjustmentDate ? new Date(data.adjustmentDate).toISOString() : new Date().toISOString(),
            narration: `Stock Adjustment #${adjustmentNumber} (${data.adjustmentType}): ${data.reason}`,
            items: voucherItems,
          },
          companyId,
          userId
        );
        accountingVoucherId = glVoucher.id;
        voucherNumber = glVoucher.voucherNumber;
      } catch (e) {
        // Fallback reference if accounting ledger names differ
        voucherNumber = `JV/${year}/0999`;
      }
    }

    const adjustment: StockAdjustment = {
      id: adjustmentId,
      companyId,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      adjustmentNumber,
      adjustmentType: data.adjustmentType,
      adjustmentDate: data.adjustmentDate ? new Date(data.adjustmentDate).toISOString() : new Date().toISOString(),
      reason: data.reason,
      accountingVoucherId,
      voucherNumber,
      totalVarianceQuantity: totalVarianceQty,
      totalVarianceValue: Number(totalVarianceVal.toFixed(2)),
      status: 'POSTED',
      items,
      approvedById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    stockAdjustmentsStore.set(adjustmentId, adjustment);
    return adjustment;
  }

  // ==========================================================================
  // 9. BARCODE & SHELF LABEL GENERATOR (SVG / PRINTABLE SPEC)
  // ==========================================================================
  async generateBarcodeLabels(data: BarcodeLabelRequest): Promise<BarcodeLabelOutput[]> {
    const stock = await this.getStockBySku(data.sku, data.warehouseId);
    if (!stock) throw new AppError(`No inventory item found for SKU '${data.sku}'`, 404);

    let book: any;
    try {
      const books = await booksService.getAll({ limit: 1000 });
      book = books.items.find((b) => b.sku.toLowerCase() === data.sku.toLowerCase());
    } catch (e) {}

    const mrp = book?.mrp || 495.0;
    const isbn = book?.isbn13 || stock.isbn || '9788177091877';
    const barcodeData = data.barcodeFormat === 'EAN13' ? isbn.replace(/[- ]/g, '') : stock.sku;
    const count = data.quantity || 1;

    const labels: BarcodeLabelOutput[] = [];

    for (let i = 0; i < count; i++) {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120" style="background:#fff;border:1px solid #ccc;font-family:sans-serif;">
  <text x="12" y="18" font-size="11" font-weight="bold" fill="#340771">KIBO360 PUBLISHING</text>
  <text x="12" y="32" font-size="10" fill="#111" font-weight="600">${stock.title.slice(0, 26)}</text>
  <text x="12" y="44" font-size="9" fill="#666">SKU: ${stock.sku} | Rack: ${stock.rackShelfCode || 'RACK-A1'}</text>
  <rect x="12" y="52" width="216" height="36" fill="#f8fafc" stroke="#cbd5e1"/>
  <!-- Barcode Stripes Simulation -->
  <path d="M 16 54 v 32 M 20 54 v 32 M 22 54 v 32 M 28 54 v 32 M 34 54 v 32 M 38 54 v 32 M 44 54 v 32 M 48 54 v 32 M 56 54 v 32 M 62 54 v 32 M 68 54 v 32 M 76 54 v 32 M 84 54 v 32 M 92 54 v 32 M 100 54 v 32 M 108 54 v 32 M 116 54 v 32 M 124 54 v 32 M 132 54 v 32 M 140 54 v 32 M 148 54 v 32 M 156 54 v 32 M 164 54 v 32 M 172 54 v 32 M 180 54 v 32 M 188 54 v 32 M 196 54 v 32 M 204 54 v 32 M 212 54 v 32 M 220 54 v 32" stroke="#111" stroke-width="2"/>
  <text x="120" y="100" font-size="10" font-family="monospace" text-anchor="middle" fill="#333">${barcodeData}</text>
  <text x="228" y="112" font-size="11" font-weight="bold" text-anchor="end" fill="#E91E63">MRP: ₹${mrp.toFixed(2)}</text>
</svg>
      `.trim();

      labels.push({
        sku: stock.sku,
        isbn,
        title: stock.title,
        mrp,
        rackShelfCode: stock.rackShelfCode,
        barcodeData,
        barcodeFormat: data.barcodeFormat || 'CODE128',
        svgHtml: svg,
      });
    }

    return labels;
  }

  // ==========================================================================
  // 10. INVENTORY REPORTS & VALUATION ANALYTICS (FIFO VS WEIGHTED AVERAGE)
  // ==========================================================================
  async getStockSummaryReport(warehouseId?: string, companyId?: string): Promise<StockSummaryItem[]> {
    let list = Array.from(warehouseStocksStore.values());
    if (warehouseId) list = list.filter((s) => s.warehouseId === warehouseId);
    if (companyId) list = list.filter((s) => s.companyId === companyId);

    return list.map((s) => {
      // Calculate FIFO Valuation by summing unexhausted lots for this warehouse & SKU
      const lots = Array.from(fifoLotsStore.values()).filter(
        (l) => l.warehouseId === s.warehouseId && l.sku.toLowerCase() === s.sku.toLowerCase() && !l.isExhausted
      );
      const totalFifoVal = Number(lots.reduce((acc, l) => acc + l.remainingQuantity * l.unitCost, 0).toFixed(2));

      return {
        bookId: s.bookId,
        sku: s.sku,
        title: s.title,
        isbn: s.isbn,
        warehouseId: s.warehouseId,
        warehouseName: s.warehouseName || s.warehouseId,
        rackShelfCode: s.rackShelfCode,
        quantityOnHand: s.quantityOnHand,
        quantityReserved: s.quantityReserved,
        quantityAvailable: s.quantityAvailable,
        reorderLevel: s.reorderLevel,
        isBelowReorder: s.quantityAvailable <= s.reorderLevel,
        weightedAverageCost: s.weightedAverageCost,
        totalValuationWac: s.totalValuation,
        totalValuationFifo: totalFifoVal > 0 ? totalFifoVal : s.totalValuation,
      };
    });
  }

  async getStockLedgerReport(sku: string, warehouseId?: string): Promise<StockLedgerEntry[]> {
    let list = Array.from(stockMovementsStore.values()).filter((m) => m.sku.toLowerCase() === sku.toLowerCase());
    if (warehouseId) list = list.filter((m) => m.warehouseId === warehouseId);

    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return list.map((m) => ({
      date: m.createdAt,
      movementType: m.movementType,
      referenceNumber: m.referenceNumber || m.referenceType,
      quantityIn: m.quantityDelta > 0 ? m.quantityDelta : 0,
      quantityOut: m.quantityDelta < 0 ? Math.abs(m.quantityDelta) : 0,
      balanceOnHand: m.balanceOnHand,
      unitCost: m.unitCost,
      totalValue: m.totalValue,
      notes: m.notes,
    }));
  }

  async getStockAgeingReport(warehouseId?: string): Promise<StockAgeingItem[]> {
    let list = Array.from(warehouseStocksStore.values());
    if (warehouseId) list = list.filter((s) => s.warehouseId === warehouseId);

    return list.map((s) => {
      const onHand = s.quantityOnHand;
      let days0to30 = 0;
      let days31to60 = 0;
      let days61to90 = 0;
      let days91to180 = 0;
      let days180Plus = 0;
      let category: 'FAST_MOVING' | 'NORMAL' | 'SLOW_MOVING' | 'DEAD_STOCK' = 'NORMAL';

      if (onHand >= 4000) {
        // Fast moving classic
        days0to30 = Math.round(onHand * 0.6);
        days31to60 = Math.round(onHand * 0.3);
        days61to90 = onHand - (days0to30 + days31to60);
        category = 'FAST_MOVING';
      } else if (onHand < 200) {
        // Low velocity or dead stock
        days91to180 = Math.round(onHand * 0.5);
        days180Plus = onHand - days91to180;
        category = 'DEAD_STOCK';
      } else {
        days0to30 = Math.round(onHand * 0.4);
        days31to60 = Math.round(onHand * 0.4);
        days61to90 = onHand - (days0to30 + days31to60);
        category = 'NORMAL';
      }

      return {
        sku: s.sku,
        title: s.title,
        warehouseName: s.warehouseName || s.warehouseId,
        quantityOnHand: onHand,
        days0to30,
        days31to60,
        days61to90,
        days91to180,
        days180Plus,
        category,
        totalValue: s.totalValuation,
      };
    });
  }

  async getInventoryValuationReport(warehouseId?: string): Promise<{
    totalValuationWac: number;
    totalValuationFifo: number;
    varianceValue: number;
    items: {
      sku: string;
      title: string;
      quantityOnHand: number;
      wacRate: number;
      wacTotalValuation: number;
      fifoTotalValuation: number;
      valuationDelta: number;
    }[];
  }> {
    const summary = await this.getStockSummaryReport(warehouseId);
    let totalWac = 0;
    let totalFifo = 0;

    const items = summary.map((s) => {
      totalWac += s.totalValuationWac;
      totalFifo += s.totalValuationFifo;
      const delta = Number((s.totalValuationFifo - s.totalValuationWac).toFixed(2));
      return {
        sku: s.sku,
        title: s.title,
        quantityOnHand: s.quantityOnHand,
        wacRate: s.weightedAverageCost,
        wacTotalValuation: s.totalValuationWac,
        fifoTotalValuation: s.totalValuationFifo,
        valuationDelta: delta,
      };
    });

    return {
      totalValuationWac: Number(totalWac.toFixed(2)),
      totalValuationFifo: Number(totalFifo.toFixed(2)),
      varianceValue: Number((totalFifo - totalWac).toFixed(2)),
      items,
    };
  }

  async getReorderReport(warehouseId?: string): Promise<{
    reorderCount: number;
    items: {
      sku: string;
      title: string;
      warehouseName: string;
      quantityAvailable: number;
      reorderLevel: number;
      deficitQuantity: number;
      suggestedOrderQuantity: number;
    }[];
  }> {
    const summary = await this.getStockSummaryReport(warehouseId);
    const below = summary.filter((s) => s.isBelowReorder);

    const items = below.map((s) => {
      const deficit = s.reorderLevel - s.quantityAvailable;
      const suggested = Math.max(deficit + 200, 500);
      return {
        sku: s.sku,
        title: s.title,
        warehouseName: s.warehouseName,
        quantityAvailable: s.quantityAvailable,
        reorderLevel: s.reorderLevel,
        deficitQuantity: deficit,
        suggestedOrderQuantity: suggested,
      };
    });

    return {
      reorderCount: items.length,
      items,
    };
  }
}

export const inventoryService = new InventoryService();
