import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import {
  createWarehouseSchema,
  createWarehouseRackSchema,
  stockInwardSchema,
  stockOutwardSchema,
  stockReservationSchema,
  createStockTransferSchema,
  receiveStockTransferSchema,
  createStockAdjustmentSchema,
  createStockAuditSessionSchema,
  generateBarcodeLabelsSchema,
} from './inventory.validator';

export class InventoryController {
  // ==========================================================================
  // WAREHOUSES & RACKS
  // ==========================================================================
  async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        search: req.query.search as string,
      };
      const result = await inventoryService.getWarehouses(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getWarehouseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const wh = await inventoryService.getWarehouseById(id);
      if (!wh) return res.status(404).json({ success: false, message: 'Warehouse not found' });
      return res.status(200).json({ success: true, data: wh });
    } catch (err) {
      next(err);
    }
  }

  async createWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createWarehouseSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await inventoryService.createWarehouse(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async getRacks(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.params.warehouseId as string;
      const racks = await inventoryService.getRacks(warehouseId);
      return res.status(200).json({ success: true, data: racks });
    } catch (err) {
      next(err);
    }
  }

  async createRack(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createWarehouseRackSchema.parse(req.body);
      const created = await inventoryService.createRack(validated);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // STOCK TRACKING & AVAILABILITY
  // ==========================================================================
  async getStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        warehouseId: req.query.warehouseId as string,
        sku: req.query.sku as string,
        search: req.query.search as string,
        belowReorder: req.query.belowReorder === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };
      const result = await inventoryService.getWarehouseStocks(filters);
      return res.status(200).json({ success: true, data: result.items, meta: { total: result.total, page: filters.page, limit: filters.limit } });
    } catch (err) {
      next(err);
    }
  }

  async getStockBySku(req: Request, res: Response, next: NextFunction) {
    try {
      const sku = req.params.sku as string;
      const warehouseId = req.query.warehouseId as string;
      const stock = await inventoryService.getStockBySku(sku, warehouseId);
      if (!stock) return res.status(404).json({ success: false, message: `Stock for SKU '${sku}' not found` });
      return res.status(200).json({ success: true, data: stock });
    } catch (err) {
      next(err);
    }
  }

  async getConsolidatedStock(req: Request, res: Response, next: NextFunction) {
    try {
      const sku = req.params.sku as string;
      const result = await inventoryService.getConsolidatedStock(sku);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // INWARD & OUTWARD MOVEMENTS
  // ==========================================================================
  async stockInward(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = stockInwardSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const updated = await inventoryService.stockInward(validated, companyId, userId);
      return res.status(201).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async stockOutward(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = stockOutwardSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const result = await inventoryService.stockOutward(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async stockReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = stockReservationSchema.parse(req.body);
      const updated = await inventoryService.stockReservation(validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // STOCK TRANSFERS
  // ==========================================================================
  async getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const transfers = await inventoryService.getTransfers(filters);
      return res.status(200).json({ success: true, data: transfers });
    } catch (err) {
      next(err);
    }
  }

  async getTransferById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const transfer = await inventoryService.getTransferById(id);
      if (!transfer) return res.status(404).json({ success: false, message: 'Stock Transfer not found' });
      return res.status(200).json({ success: true, data: transfer });
    } catch (err) {
      next(err);
    }
  }

  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createStockTransferSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await inventoryService.createTransfer(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async receiveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = receiveStockTransferSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const updated = await inventoryService.receiveTransfer(validated, companyId, userId);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // PHYSICAL AUDITS & CYCLE COUNTS
  // ==========================================================================
  async getAuditSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const sessions = await inventoryService.getAuditSessions({ warehouseId });
      return res.status(200).json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async createAuditSession(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createStockAuditSessionSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const session = await inventoryService.createAuditSession(validated, companyId);
      return res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // STOCK ADJUSTMENTS & DAMAGE WRITE-OFFS
  // ==========================================================================
  async getAdjustments(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const adjustments = await inventoryService.getAdjustments({ warehouseId });
      return res.status(200).json({ success: true, data: adjustments });
    } catch (err) {
      next(err);
    }
  }

  async createAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createStockAdjustmentSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await inventoryService.createAdjustment(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // BARCODE LABELS
  // ==========================================================================
  async generateBarcodeLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = generateBarcodeLabelsSchema.parse(req.body);
      const labels = await inventoryService.generateBarcodeLabels(validated);
      return res.status(200).json({ success: true, data: labels });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // INVENTORY REPORTS
  // ==========================================================================
  async getStockSummaryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await inventoryService.getStockSummaryReport(warehouseId, companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getStockLedgerReport(req: Request, res: Response, next: NextFunction) {
    try {
      const sku = req.params.sku as string;
      const warehouseId = req.query.warehouseId as string;
      const ledger = await inventoryService.getStockLedgerReport(sku, warehouseId);
      return res.status(200).json({ success: true, data: ledger });
    } catch (err) {
      next(err);
    }
  }

  async getStockAgeingReport(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const report = await inventoryService.getStockAgeingReport(warehouseId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getInventoryValuationReport(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const report = await inventoryService.getInventoryValuationReport(warehouseId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getReorderReport(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const report = await inventoryService.getReorderReport(warehouseId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();
