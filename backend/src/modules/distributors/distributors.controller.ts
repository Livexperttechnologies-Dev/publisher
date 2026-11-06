import { Request, Response, NextFunction } from 'express';
import { distributorsService } from './distributors.service';
import {
  createDistributorSchema,
  updateDistributorSchema,
  createDealerSchema,
  updateDealerSchema,
  createDistributionOrderSchema,
  createDispatchChallanSchema,
  recordDeliveryPodSchema,
  issueConsignmentStockSchema,
  settleConsignmentSalesSchema,
  returnConsignmentStockSchema,
  calculateCommissionSchema,
} from './distributors.validator';

export class DistributorsController {
  // ==========================================================================
  // 1. DISTRIBUTORS
  // ==========================================================================
  async getDistributors(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        territory: req.query.territory as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const distributors = await distributorsService.getDistributors(filters);
      return res.status(200).json({ success: true, data: distributors });
    } catch (err) {
      next(err);
    }
  }

  async getDistributorById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const distributor = await distributorsService.getDistributorById(id);
      if (!distributor) return res.status(404).json({ success: false, message: 'Distributor not found' });
      return res.status(200).json({ success: true, data: distributor });
    } catch (err) {
      next(err);
    }
  }

  async createDistributor(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDistributorSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await distributorsService.createDistributor(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async updateDistributor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateDistributorSchema.parse(req.body);
      const updated = await distributorsService.updateDistributor(id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 2. DEALERS
  // ==========================================================================
  async getDealers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        distributorId: req.query.distributorId as string,
        classification: req.query.classification as string,
        search: req.query.search as string,
      };
      const dealers = await distributorsService.getDealers(filters);
      return res.status(200).json({ success: true, data: dealers });
    } catch (err) {
      next(err);
    }
  }

  async getDealerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const dealer = await distributorsService.getDealerById(id);
      if (!dealer) return res.status(404).json({ success: false, message: 'Dealer not found' });
      return res.status(200).json({ success: true, data: dealer });
    } catch (err) {
      next(err);
    }
  }

  async createDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDealerSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await distributorsService.createDealer(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async updateDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateDealerSchema.parse(req.body);
      const updated = await distributorsService.updateDealer(id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 3. DISTRIBUTION ORDERS
  // ==========================================================================
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        distributorId: req.query.distributorId as string,
        status: req.query.status as string,
      };
      const orders = await distributorsService.getOrders(filters);
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await distributorsService.getOrderById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Distribution Order not found' });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDistributionOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const order = await distributorsService.createOrder(validated, companyId, userId);
      return res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 4. DISPATCHES & DELIVERY CHALLANS
  // ==========================================================================
  async createDispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDispatchChallanSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await distributorsService.createDispatch(validated, companyId);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async recordDeliveryPod(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = recordDeliveryPodSchema.parse(req.body);
      const dispatch = await distributorsService.recordDeliveryPod(validated);
      return res.status(200).json({ success: true, data: dispatch });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 5. CONSIGNMENT MANAGEMENT
  // ==========================================================================
  async getConsignmentIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        distributorId: req.query.distributorId as string,
      };
      const issues = await distributorsService.getConsignmentIssues(filters);
      return res.status(200).json({ success: true, data: issues });
    } catch (err) {
      next(err);
    }
  }

  async issueConsignment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = issueConsignmentStockSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const issue = await distributorsService.issueConsignment(validated, companyId);
      return res.status(201).json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  }

  async settleConsignmentSales(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = settleConsignmentSalesSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await distributorsService.settleConsignmentSales(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async returnConsignmentStock(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = returnConsignmentStockSchema.parse(req.body);
      const result = await distributorsService.returnConsignmentStock(validated);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 6. COMMISSION SETTLEMENT
  // ==========================================================================
  async calculateCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = calculateCommissionSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await distributorsService.calculateCommission(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 7. REPORTS
  // ==========================================================================
  async getTerritorySalesPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await distributorsService.getTerritorySalesPerformance(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getDistributorPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await distributorsService.getDistributorPerformance(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getConsignmentStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await distributorsService.getConsignmentStockReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getDistributionProfitabilityReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await distributorsService.getDistributionProfitabilityReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  // Compatibility / Fallback
  async getAll(req: Request, res: Response, next: NextFunction) {
    return this.getDistributors(req, res, next);
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    return this.getDistributorById(req, res, next);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    return this.createDistributor(req, res, next);
  }
}

export const distributorsController = new DistributorsController();
