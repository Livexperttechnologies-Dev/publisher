import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { returnsService } from './returns.service';
import {
  createSalesReturnSchema,
  approveSalesReturnSchema,
  createPurchaseReturnSchema,
  approvePurchaseReturnSchema,
  createDistributorReturnSchema,
  approveDistributorReturnSchema,
  createFinancialAdjustmentSchema,
  approveFinancialAdjustmentSchema,
  processRefundSchema,
  reverseReturnSchema,
} from './returns.validator';

export class ReturnsController {
  // --------------------------------------------------------------------------
  // 1. Sales Returns
  // --------------------------------------------------------------------------
  async getAllSalesReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { status, partyId, returnReason } = req.query;
      const items = await returnsService.getAllSalesReturns(companyId, {
        status: typeof status === 'string' ? status : undefined,
        partyId: typeof partyId === 'string' ? partyId : undefined,
        returnReason: typeof returnReason === 'string' ? returnReason : undefined,
      });
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  }

  async getSalesReturnById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await returnsService.getSalesReturnById(companyId, id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async createSalesReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createSalesReturnSchema.parse(req.body);
      const item = await returnsService.createSalesReturn(companyId, req.user, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async approveSalesReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = approveSalesReturnSchema.parse(req.body);
      const item = await returnsService.approveSalesReturn(companyId, req.user, id, validated);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async reverseSalesReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = reverseReturnSchema.parse(req.body);
      const item = await returnsService.reverseSalesReturn(companyId, req.user, id, validated.reason);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Purchase Returns
  // --------------------------------------------------------------------------
  async getAllPurchaseReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { status, partyId } = req.query;
      const items = await returnsService.getAllPurchaseReturns(companyId, {
        status: typeof status === 'string' ? status : undefined,
        partyId: typeof partyId === 'string' ? partyId : undefined,
      });
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  }

  async getPurchaseReturnById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await returnsService.getPurchaseReturnById(companyId, id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async createPurchaseReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createPurchaseReturnSchema.parse(req.body);
      const item = await returnsService.createPurchaseReturn(companyId, req.user, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async approvePurchaseReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = approvePurchaseReturnSchema.parse(req.body);
      const item = await returnsService.approvePurchaseReturn(companyId, req.user, id, validated);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 3. Distributor Returns & Reconciliation
  // --------------------------------------------------------------------------
  async getAllDistributorReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const items = await returnsService.getAllDistributorReturns(companyId);
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  }

  async createDistributorReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createDistributorReturnSchema.parse(req.body);
      const item = await returnsService.createDistributorReturn(companyId, req.user, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async getDistributorReconciliation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const distributorId = Array.isArray(req.params.distributorId)
        ? req.params.distributorId[0]
        : req.params.distributorId;
      const report = await returnsService.getDistributorReconciliationReport(companyId, distributorId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 4. Financial Adjustments
  // --------------------------------------------------------------------------
  async getAllFinancialAdjustments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const items = await returnsService.getAllFinancialAdjustments(companyId);
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  }

  async createFinancialAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createFinancialAdjustmentSchema.parse(req.body);
      const item = await returnsService.createFinancialAdjustment(companyId, req.user, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async approveFinancialAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = approveFinancialAdjustmentSchema.parse(req.body);
      const item = await returnsService.approveFinancialAdjustment(companyId, req.user, id, validated);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 5. Refunds
  // --------------------------------------------------------------------------
  async getAllRefunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const items = await returnsService.getAllRefunds(companyId);
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  }

  async processRefund(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = processRefundSchema.parse(req.body);
      const item = await returnsService.processRefund(companyId, req.user, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Reports
  // --------------------------------------------------------------------------
  async getReturnsSummaryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const report = await returnsService.getReturnsSummaryReport(companyId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getQuarantineStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const stock = await returnsService.getQuarantineStock(companyId);
      res.json({ success: true, data: stock });
    } catch (err) {
      next(err);
    }
  }
}

export const returnsController = new ReturnsController();
