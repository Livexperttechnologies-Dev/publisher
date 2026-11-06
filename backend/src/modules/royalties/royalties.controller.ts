import { Request, Response, NextFunction } from 'express';
import { royaltiesService } from './royalties.service';
import {
  createAuthorAgreementSchema,
  updateAuthorAgreementSchema,
  createRoyaltyAccrualPeriodSchema,
  runRoyaltyCalculationSchema,
  approveRoyaltyCalculationSchema,
  settleRoyaltyPaymentSchema,
} from './royalties.validator';

export class RoyaltiesController {
  // ==========================================================================
  // 1. AUTHOR AGREEMENTS
  // ==========================================================================
  async getAgreements(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
        status: req.query.status as string,
        authorId: req.query.authorId as string,
        search: req.query.search as string,
      };
      const agreements = await royaltiesService.getAgreements(filters);
      return res.status(200).json({ success: true, data: agreements });
    } catch (err) {
      next(err);
    }
  }

  async getAgreementById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const agreement = await royaltiesService.getAgreementById(id);
      if (!agreement) return res.status(404).json({ success: false, message: 'Author Agreement not found' });
      return res.status(200).json({ success: true, data: agreement });
    } catch (err) {
      next(err);
    }
  }

  async createAgreement(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAuthorAgreementSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await royaltiesService.createAgreement(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async updateAgreement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateAuthorAgreementSchema.parse(req.body);
      const updated = await royaltiesService.updateAgreement(id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async addBookToAgreement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await royaltiesService.addBookToAgreement(id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async addSlabsToAgreement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await royaltiesService.addSlabsToAgreement(id, req.body.slabs);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 2. PERIODS & ACCRUAL RUNS
  // ==========================================================================
  async getAccrualPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const periods = await royaltiesService.getAccrualPeriods(companyId);
      return res.status(200).json({ success: true, data: periods });
    } catch (err) {
      next(err);
    }
  }

  async createAccrualPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createRoyaltyAccrualPeriodSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const period = await royaltiesService.createAccrualPeriod(validated, companyId);
      return res.status(201).json({ success: true, data: period });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 3. ROYALTY CALCULATION, APPROVAL & SETTLEMENT
  // ==========================================================================
  async calculateRoyalty(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = runRoyaltyCalculationSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const results = await royaltiesService.calculateRoyalty(validated, companyId);
      return res.status(200).json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }

  async approveRoyaltyCalculation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = approveRoyaltyCalculationSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await royaltiesService.approveRoyaltyCalculation(validated.calculationId, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async settleRoyaltyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = settleRoyaltyPaymentSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.userId || 'usr_staff';
      const result = await royaltiesService.settleRoyaltyPayment(validated, companyId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // 4. STATEMENTS & REPORTS
  // ==========================================================================
  async getAuthorRoyaltyStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const calculationId = req.params.calculationId as string;
      const statement = await royaltiesService.getAuthorRoyaltyStatement(calculationId);
      return res.status(200).json({ success: true, data: statement });
    } catch (err) {
      next(err);
    }
  }

  async getAuthorWiseRoyaltySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const summary = await royaltiesService.getAuthorWiseRoyaltySummary(companyId);
      return res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  async getBookWiseRoyaltyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await royaltiesService.getBookWiseRoyaltyReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getAdvanceRoyaltyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await royaltiesService.getAdvanceRoyaltyReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  // Compatibility / Fallback
  async getAll(req: Request, res: Response, next: NextFunction) {
    return this.getAgreements(req, res, next);
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    return this.getAgreementById(req, res, next);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    return this.createAgreement(req, res, next);
  }
}

export const royaltiesController = new RoyaltiesController();
