import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';
import { reportsFilterQuerySchema, createReportsSchema } from './reports.validator';

export class ReportsController {
  async getExecutiveDashboardKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const kpis = await reportsService.getExecutiveDashboardKPIs(companyId, filters);
      return sendSuccess(res, 'Executive Dashboard KPIs fetched successfully', kpis);
    } catch (error) {
      next(error);
    }
  }

  async getCashFlowStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const cashFlow = await reportsService.getCashFlowStatement(companyId, filters);
      return sendSuccess(res, 'Cash Flow Statement generated successfully', cashFlow);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAgeingReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const report = await reportsService.getCustomerAgeingReport(companyId, filters);
      return sendSuccess(res, 'Customer Debtors Ageing Report generated successfully', report);
    } catch (error) {
      next(error);
    }
  }

  async getSupplierAgeingReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const report = await reportsService.getSupplierAgeingReport(companyId, filters);
      return sendSuccess(res, 'Supplier Creditors Ageing Report generated successfully', report);
    } catch (error) {
      next(error);
    }
  }

  async getBookProfitabilityReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const items = await reportsService.getBookProfitabilityReport(companyId, filters);
      return sendSuccess(res, 'Book-wise Profitability Report generated successfully', items);
    } catch (error) {
      next(error);
    }
  }

  async getAuthorSalesRoyaltyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const items = await reportsService.getAuthorSalesRoyaltyReport(companyId, filters);
      return sendSuccess(res, 'Author Sales and Royalty MIS Report generated successfully', items);
    } catch (error) {
      next(error);
    }
  }

  async getProductionCostingMISReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const items = await reportsService.getProductionCostingMISReport(companyId, filters);
      return sendSuccess(res, 'Production Costing & Variance MIS Report generated successfully', items);
    } catch (error) {
      next(error);
    }
  }

  async getStockAgeingMISReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const items = await reportsService.getStockAgeingMISReport(companyId, filters);
      return sendSuccess(res, 'Stock Ageing and Dead Stock MIS Report generated successfully', items);
    } catch (error) {
      next(error);
    }
  }

  async getReorderAlertsReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const filters = reportsFilterQuerySchema.parse(req.query);
      const items = await reportsService.getReorderAlertsReport(companyId, filters);
      return sendSuccess(res, 'Inventory Reorder Alerts Report generated successfully', items);
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const reportType = (req.query.reportType as string) || 'book-profitability';
      const filters = reportsFilterQuerySchema.parse(req.query);

      let data: any[] = [];
      let reportTitle = reportType;

      switch (reportType) {
        case 'book-profitability':
          data = await reportsService.getBookProfitabilityReport(companyId, filters);
          reportTitle = 'Book Profitability Report';
          break;
        case 'author-sales':
          data = await reportsService.getAuthorSalesRoyaltyReport(companyId, filters);
          reportTitle = 'Author Sales & Royalty Report';
          break;
        case 'production-costing':
          data = await reportsService.getProductionCostingMISReport(companyId, filters);
          reportTitle = 'Production Costing MIS Report';
          break;
        case 'stock-ageing':
          data = await reportsService.getStockAgeingMISReport(companyId, filters);
          reportTitle = 'Stock Ageing Report';
          break;
        case 'reorder-alerts':
          data = await reportsService.getReorderAlertsReport(companyId, filters);
          reportTitle = 'Reorder Alerts Report';
          break;
        default:
          data = await reportsService.getBookProfitabilityReport(companyId, filters);
          reportTitle = 'Report Export';
          break;
      }

      if (filters.format === 'csv') {
        const csvContent = reportsService.exportReportToCsv(reportTitle, data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${Date.now()}.csv"`);
        return res.status(200).send(csvContent);
      }

      return sendSuccess(res, `${reportTitle} exported successfully`, data);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { items, total } = await reportsService.getAll(req.query);
      return sendSuccess(res, 'Financial & MIS Reports catalogue fetched successfully', items, {
        total,
        page: 1,
        limit: 10,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await reportsService.getById(id as string);
      return sendSuccess(res, 'Report details fetched successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReportsSchema.parse(req.body);
      const created = await reportsService.create(validated);
      return sendSuccess(res, 'Custom Report definition created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();