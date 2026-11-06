import { Router } from 'express';
import { returnsController } from './returns.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// --------------------------------------------------------------------------
// 1. Sales Returns
// --------------------------------------------------------------------------
router.get('/sales', authenticateJwt, (req, res, next) => returnsController.getAllSalesReturns(req, res, next));
router.get('/sales/:id', authenticateJwt, (req, res, next) => returnsController.getSalesReturnById(req, res, next));
router.post('/sales', authenticateJwt, (req, res, next) => returnsController.createSalesReturn(req, res, next));
router.post('/sales/:id/approval', authenticateJwt, (req, res, next) => returnsController.approveSalesReturn(req, res, next));
router.post('/sales/:id/reverse', authenticateJwt, (req, res, next) => returnsController.reverseSalesReturn(req, res, next));

// --------------------------------------------------------------------------
// 2. Purchase Returns
// --------------------------------------------------------------------------
router.get('/purchases', authenticateJwt, (req, res, next) => returnsController.getAllPurchaseReturns(req, res, next));
router.get('/purchases/:id', authenticateJwt, (req, res, next) => returnsController.getPurchaseReturnById(req, res, next));
router.post('/purchases', authenticateJwt, (req, res, next) => returnsController.createPurchaseReturn(req, res, next));
router.post('/purchases/:id/approval', authenticateJwt, (req, res, next) => returnsController.approvePurchaseReturn(req, res, next));

// --------------------------------------------------------------------------
// 3. Distributor Returns & Reconciliation
// --------------------------------------------------------------------------
router.get('/distributors', authenticateJwt, (req, res, next) => returnsController.getAllDistributorReturns(req, res, next));
router.post('/distributors', authenticateJwt, (req, res, next) => returnsController.createDistributorReturn(req, res, next));
router.get('/distributors/:distributorId/reconciliation', authenticateJwt, (req, res, next) =>
  returnsController.getDistributorReconciliation(req, res, next)
);

// --------------------------------------------------------------------------
// 4. Financial Adjustments
// --------------------------------------------------------------------------
router.get('/adjustments', authenticateJwt, (req, res, next) => returnsController.getAllFinancialAdjustments(req, res, next));
router.post('/adjustments', authenticateJwt, (req, res, next) => returnsController.createFinancialAdjustment(req, res, next));
router.post('/adjustments/:id/approval', authenticateJwt, (req, res, next) =>
  returnsController.approveFinancialAdjustment(req, res, next)
);

// --------------------------------------------------------------------------
// 5. Direct Refunds
// --------------------------------------------------------------------------
router.get('/refunds', authenticateJwt, (req, res, next) => returnsController.getAllRefunds(req, res, next));
router.post('/refunds', authenticateJwt, (req, res, next) => returnsController.processRefund(req, res, next));

// --------------------------------------------------------------------------
// 6. Reports & Stock
// --------------------------------------------------------------------------
router.get('/reports/summary', authenticateJwt, (req, res, next) => returnsController.getReturnsSummaryReport(req, res, next));
router.get('/reports/quarantine-stock', authenticateJwt, (req, res, next) =>
  returnsController.getQuarantineStock(req, res, next)
);

export const returnsRoutes = router;
export default router;
