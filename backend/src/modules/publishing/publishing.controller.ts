import { Request, Response, NextFunction } from 'express';
import { publishingService } from './publishing.service';
import {
  createPublishingProjectSchema,
  updateProjectStatusSchema,
  allocateIsbnSchema,
  createProductionOrderSchema,
  issueMaterialToProductionSchema,
  createVendorJobOrderSchema,
  receiveJobWorkSchema,
  createQualityInspectionSchema,
  completeProductionOrderSchema,
} from './publishing.validator';

export class PublishingController {
  // ==========================================================================
  // 1. PUBLISHING PROJECTS
  // ==========================================================================
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const projects = await publishingService.getProjects(filters);
      return res.status(200).json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const project = await publishingService.getProjectById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Publishing Project not found' });
      return res.status(200).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPublishingProjectSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const project = await publishingService.createProject(validated, companyId, userId);
      return res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  async updateProjectStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateProjectStatusSchema.parse(req.body);
      const updated = await publishingService.updateProjectStatus(id, validated.status, validated.notes);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async allocateIsbn(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = allocateIsbnSchema.parse(req.body);
      const updated = await publishingService.allocateIsbn(id, validated.isbn);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 2. PRODUCTION ORDERS
  // ==========================================================================
  async getProductionOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        status: req.query.status as string,
      };
      const orders = await publishingService.getProductionOrders(filters);
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getProductionOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await publishingService.getProductionOrderById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Production Order not found' });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async createProductionOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createProductionOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const order = await publishingService.createProductionOrder(validated, companyId, userId);
      return res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async issueMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = issueMaterialToProductionSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await publishingService.issueMaterial(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async completeProductionOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = completeProductionOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await publishingService.completeProductionOrder(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 3. VENDOR JOB ORDERS
  // ==========================================================================
  async getJobOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        productionOrderId: req.query.productionOrderId as string,
        vendorId: req.query.vendorId as string,
      };
      const jobs = await publishingService.getJobOrders(filters);
      return res.status(200).json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  async createJobOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createVendorJobOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const job = await publishingService.createJobOrder(validated, companyId, userId);
      return res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  async receiveJobWork(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = receiveJobWorkSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await publishingService.receiveJobWork(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 4. QUALITY INSPECTIONS
  // ==========================================================================
  async getInspections(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const inspections = await publishingService.getInspections(orderId);
      return res.status(200).json({ success: true, data: inspections });
    } catch (err) {
      next(err);
    }
  }

  async createInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createQualityInspectionSchema.parse(req.body);
      const inspection = await publishingService.createInspection(validated);
      return res.status(201).json({ success: true, data: inspection });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 5. PRODUCTION REPORTS
  // ==========================================================================
  async getProductionStatusReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await publishingService.getProductionStatusReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getMaterialConsumptionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await publishingService.getMaterialConsumptionReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getProductionVarianceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await publishingService.getProductionVarianceReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  // Compatibility / Fallback
  async getAll(req: Request, res: Response, next: NextFunction) {
    return this.getProjects(req, res, next);
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    return this.getProjectById(req, res, next);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    return this.createProject(req, res, next);
  }
}

export const publishingController = new PublishingController();
