import { Request, Response, NextFunction } from 'express';
import { companiesService } from './companies.service';
import { sendSuccess } from '../../utils/response';
import {
  createCompanySchema,
  updateCompanySchema,
  createBranchSchema,
  updateBranchSchema,
  createFiscalYearSchema,
  lockPeriodSchema,
  updateAccountingSettingsSchema,
} from './companies.validator';

export class CompaniesController {
  // Company endpoints
  async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.roleType === 'SUPER_ADMIN';
      const userCompanyId = req.user?.companyId;
      const companies = await companiesService.getAllCompanies(userCompanyId, isSuperAdmin);
      return sendSuccess(res, 'Companies retrieved successfully', companies);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companiesService.getCompanyById(req.params.id as string);
      return sendSuccess(res, 'Company retrieved successfully', company);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCompanySchema.parse(req.body);
      const created = await companiesService.createCompany(validated);
      return sendSuccess(res, 'Company created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCompanySchema.parse(req.body);
      const updated = await companiesService.updateCompany(req.params.id as string, validated);
      return sendSuccess(res, 'Company configuration updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  // Branch endpoints
  async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await companiesService.getBranchesByCompany(req.params.companyId as string);
      return sendSuccess(res, 'Branches retrieved successfully', branches);
    } catch (error) {
      next(error);
    }
  }

  async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBranchSchema.parse(req.body);
      const branch = await companiesService.createBranch(req.params.companyId as string, validated);
      return sendSuccess(res, 'Branch created successfully', branch, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // Fiscal Year & Period Lock endpoints
  async getFiscalYears(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await companiesService.getFiscalYears(req.params.companyId as string);
      return sendSuccess(res, 'Fiscal years retrieved successfully', list);
    } catch (error) {
      next(error);
    }
  }

  async createFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createFiscalYearSchema.parse(req.body);
      const fy = await companiesService.createFiscalYear(req.params.companyId as string, validated);
      return sendSuccess(res, 'Fiscal year created successfully', fy, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async togglePeriodLock(req: any, res: Response, next: NextFunction) {
    try {
      const { month, year, isLocked } = lockPeriodSchema.parse(req.body);
      const lockedBy = req.user?.fullName || 'Financial Controller';
      const updatedFY = await companiesService.togglePeriodLock(
        req.params.companyId as string,
        req.params.fyId as string,
        month,
        year,
        isLocked,
        lockedBy
      );
      return sendSuccess(
        res,
        isLocked ? `Period ${month}/${year} is now locked.` : `Period ${month}/${year} is unlocked.`,
        updatedFY
      );
    } catch (error) {
      next(error);
    }
  }

  // Accounting Settings Mapping
  async updateAccountingSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateAccountingSettingsSchema.parse(req.body);
      const updated = await companiesService.updateAccountingSettings(req.params.companyId as string, validated);
      return sendSuccess(res, 'Default accounting ledgers mapped successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  // Consolidated Reporting
  async getConsolidatedSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await companiesService.getConsolidatedSummary(req.params.companyId as string);
      return sendSuccess(res, 'Authorized consolidated reporting summary generated', summary);
    } catch (error) {
      next(error);
    }
  }
}

export const companiesController = new CompaniesController();
