import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { expensesService } from './expenses.service';
import {
  createExpenseCategorySchema,
  createExpenseVoucherSchema,
  approveExpenseVoucherSchema,
  createEmployeeReimbursementSchema,
  approveEmployeeReimbursementSchema,
  payEmployeeReimbursementSchema,
  createRecurringExpenseSchema,
  createFixedAssetSchema,
  transferFixedAssetSchema,
  calculateDepreciationSchema,
  disposeFixedAssetSchema,
  createBudgetPlanSchema,
  updateBudgetPlanSchema,
} from './expenses.validator';

export class ExpensesController {
  // --------------------------------------------------------------------------
  // 1. Categories
  // --------------------------------------------------------------------------
  async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const categories = await expensesService.getExpenseCategories(companyId);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createExpenseCategorySchema.parse(req.body);
      const category = await expensesService.createExpenseCategory(companyId, validated);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Expense Vouchers
  // --------------------------------------------------------------------------
  async getVouchers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { search, status, department, categoryId, page, limit } = req.query;
      const result = await expensesService.getExpenseVouchers(companyId, {
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
        department: typeof department === 'string' ? department : undefined,
        categoryId: typeof categoryId === 'string' ? categoryId : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getVoucherById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const voucher = await expensesService.getExpenseVoucherById(companyId, id);
      res.json({ success: true, data: voucher });
    } catch (err) {
      next(err);
    }
  }

  async createVoucher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createExpenseVoucherSchema.parse(req.body);
      const voucher = await expensesService.createExpenseVoucher(companyId, req.user, validated);
      res.status(201).json({ success: true, data: voucher });
    } catch (err) {
      next(err);
    }
  }

  async approveVoucher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = approveExpenseVoucherSchema.parse(req.body);
      const voucher = await expensesService.approveExpenseVoucher(companyId, req.user, id, validated);
      res.json({ success: true, data: voucher });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 3. Employee Reimbursements
  // --------------------------------------------------------------------------
  async getReimbursements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { status, department } = req.query;
      const items = await expensesService.getEmployeeReimbursements(companyId, {
        status: typeof status === 'string' ? status : undefined,
        department: typeof department === 'string' ? department : undefined,
      });
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async createReimbursement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createEmployeeReimbursementSchema.parse(req.body);
      const claim = await expensesService.createEmployeeReimbursement(companyId, req.user, validated);
      res.status(201).json({ success: true, data: claim });
    } catch (err) {
      next(err);
    }
  }

  async approveReimbursement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = approveEmployeeReimbursementSchema.parse(req.body);
      const claim = await expensesService.approveEmployeeReimbursement(companyId, req.user, id, validated);
      res.json({ success: true, data: claim });
    } catch (err) {
      next(err);
    }
  }

  async payReimbursement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = payEmployeeReimbursementSchema.parse(req.body);
      const claim = await expensesService.payEmployeeReimbursement(companyId, req.user, id, validated);
      res.json({ success: true, data: claim });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 4. Recurring Expenses
  // --------------------------------------------------------------------------
  async getRecurringExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const items = await expensesService.getRecurringExpenses(companyId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async createRecurringExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createRecurringExpenseSchema.parse(req.body);
      const item = await expensesService.createRecurringExpense(companyId, validated);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async processRecurringExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const result = await expensesService.processRecurringExpenses(companyId, req.user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 5. Fixed Assets
  // --------------------------------------------------------------------------
  async getFixedAssets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { search, status } = req.query;
      const items = await expensesService.getFixedAssets(companyId, {
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
      });
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async getFixedAssetById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const asset = await expensesService.getFixedAssetById(companyId, id);
      res.json({ success: true, data: asset });
    } catch (err) {
      next(err);
    }
  }

  async createFixedAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createFixedAssetSchema.parse(req.body);
      const asset = await expensesService.createFixedAsset(companyId, validated);
      res.status(201).json({ success: true, data: asset });
    } catch (err) {
      next(err);
    }
  }

  async transferFixedAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = transferFixedAssetSchema.parse(req.body);
      const asset = await expensesService.transferFixedAsset(companyId, id, validated);
      res.json({ success: true, data: asset });
    } catch (err) {
      next(err);
    }
  }

  async calculateDepreciation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = calculateDepreciationSchema.parse(req.body);
      const schedule = await expensesService.calculateAssetDepreciation(companyId, req.user, validated);
      res.json({ success: true, data: schedule });
    } catch (err) {
      next(err);
    }
  }

  async disposeFixedAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = disposeFixedAssetSchema.parse(req.body);
      const record = await expensesService.disposeFixedAsset(companyId, req.user, id, validated);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  async getDepreciationSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { assetId } = req.query;
      const schedules = await expensesService.getDepreciationSchedules(
        companyId,
        typeof assetId === 'string' ? assetId : undefined
      );
      res.json({ success: true, data: schedules });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Budget Management
  // --------------------------------------------------------------------------
  async getBudgets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { department, status } = req.query;
      const budgets = await expensesService.getBudgetPlans(companyId, {
        department: typeof department === 'string' ? department : undefined,
        status: typeof status === 'string' ? status : undefined,
      });
      res.json({ success: true, data: budgets });
    } catch (err) {
      next(err);
    }
  }

  async getBudgetById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const budget = await expensesService.getBudgetPlanById(companyId, id);
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  }

  async createBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const validated = createBudgetPlanSchema.parse(req.body);
      const budget = await expensesService.createBudgetPlan(companyId, req.user, validated);
      res.status(201).json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  }

  async updateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = updateBudgetPlanSchema.parse(req.body);
      const budget = await expensesService.updateBudgetPlan(companyId, id, validated);
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // 7. Reports
  // --------------------------------------------------------------------------
  async getExpenseSummaryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { financialYear } = req.query;
      const report = await expensesService.getExpenseSummaryReport(
        companyId,
        typeof financialYear === 'string' ? financialYear : undefined
      );
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getFixedAssetRegisterReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const report = await expensesService.getFixedAssetRegisterReport(companyId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getBudgetVarianceReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { financialYear } = req.query;
      const report = await expensesService.getBudgetVarianceReport(
        companyId,
        typeof financialYear === 'string' ? financialYear : undefined
      );
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getDepartmentProfitabilityReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { financialYear } = req.query;
      const report = await expensesService.getDepartmentProfitabilityReport(
        companyId,
        typeof financialYear === 'string' ? financialYear : undefined
      );
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}

export const expensesController = new ExpensesController();
