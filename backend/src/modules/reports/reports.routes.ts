import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// Executive Dashboard
router.get('/executive-dashboard', authenticateJwt, (req, res, next) =>
  reportsController.getExecutiveDashboardKPIs(req, res, next)
);

// Financial Reports
router.get('/financial/cash-flow', authenticateJwt, (req, res, next) =>
  reportsController.getCashFlowStatement(req, res, next)
);
router.get('/financial/customer-ageing', authenticateJwt, (req, res, next) =>
  reportsController.getCustomerAgeingReport(req, res, next)
);
router.get('/financial/supplier-ageing', authenticateJwt, (req, res, next) =>
  reportsController.getSupplierAgeingReport(req, res, next)
);

// Publishing & MIS Reports
router.get('/publishing/book-profitability', authenticateJwt, (req, res, next) =>
  reportsController.getBookProfitabilityReport(req, res, next)
);
router.get('/publishing/author-sales', authenticateJwt, (req, res, next) =>
  reportsController.getAuthorSalesRoyaltyReport(req, res, next)
);
router.get('/publishing/production-costing', authenticateJwt, (req, res, next) =>
  reportsController.getProductionCostingMISReport(req, res, next)
);

// Inventory & Stock Reports
router.get('/inventory/stock-ageing', authenticateJwt, (req, res, next) =>
  reportsController.getStockAgeingMISReport(req, res, next)
);
router.get('/inventory/reorder-alerts', authenticateJwt, (req, res, next) =>
  reportsController.getReorderAlertsReport(req, res, next)
);

// Report Export Engine (CSV/Excel)
router.get('/export', authenticateJwt, (req, res, next) =>
  reportsController.exportReport(req, res, next)
);

// Catalog / Standard endpoints
router.get('/', authenticateJwt, (req, res, next) => reportsController.getAll(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => reportsController.getById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => reportsController.create(req, res, next));

export const reportsRoutes = router;