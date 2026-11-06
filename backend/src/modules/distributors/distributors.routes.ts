import { Router } from 'express';
import { distributorsController } from './distributors.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// ============================================================================
// 1. Distribution Reports & Analytics (Must precede :id routes)
// ============================================================================
router.get('/reports/territory', authenticateJwt, (req, res, next) => distributorsController.getTerritorySalesPerformance(req, res, next));
router.get('/reports/distributor-performance', authenticateJwt, (req, res, next) => distributorsController.getDistributorPerformance(req, res, next));
router.get('/reports/consignments', authenticateJwt, (req, res, next) => distributorsController.getConsignmentStockReport(req, res, next));
router.get('/reports/profitability', authenticateJwt, (req, res, next) => distributorsController.getDistributionProfitabilityReport(req, res, next));

// ============================================================================
// 2. Consignment Stock Management
// ============================================================================
router.post('/consignments/issue', authenticateJwt, (req, res, next) => distributorsController.issueConsignment(req, res, next));
router.post('/consignments/settle-sales', authenticateJwt, (req, res, next) => distributorsController.settleConsignmentSales(req, res, next));
router.post('/consignments/return', authenticateJwt, (req, res, next) => distributorsController.returnConsignmentStock(req, res, next));
router.get('/consignments', authenticateJwt, (req, res, next) => distributorsController.getConsignmentIssues(req, res, next));

// ============================================================================
// 3. Dispatches & POD Tracking
// ============================================================================
router.post('/dispatches/pod', authenticateJwt, (req, res, next) => distributorsController.recordDeliveryPod(req, res, next));
router.post('/dispatches', authenticateJwt, (req, res, next) => distributorsController.createDispatch(req, res, next));

// ============================================================================
// 4. Commission Settlements
// ============================================================================
router.post('/commissions/calculate', authenticateJwt, (req, res, next) => distributorsController.calculateCommission(req, res, next));

// ============================================================================
// 5. Distribution Orders
// ============================================================================
router.get('/orders/:id', authenticateJwt, (req, res, next) => distributorsController.getOrderById(req, res, next));
router.get('/orders', authenticateJwt, (req, res, next) => distributorsController.getOrders(req, res, next));
router.post('/orders', authenticateJwt, (req, res, next) => distributorsController.createOrder(req, res, next));

// ============================================================================
// 6. Dealers
// ============================================================================
router.put('/dealers/:id', authenticateJwt, (req, res, next) => distributorsController.updateDealer(req, res, next));
router.get('/dealers/:id', authenticateJwt, (req, res, next) => distributorsController.getDealerById(req, res, next));
router.get('/dealers', authenticateJwt, (req, res, next) => distributorsController.getDealers(req, res, next));
router.post('/dealers', authenticateJwt, (req, res, next) => distributorsController.createDealer(req, res, next));

// ============================================================================
// 7. Distributors Master
// ============================================================================
router.put('/distributors/:id', authenticateJwt, (req, res, next) => distributorsController.updateDistributor(req, res, next));
router.get('/distributors/:id', authenticateJwt, (req, res, next) => distributorsController.getDistributorById(req, res, next));
router.get('/distributors', authenticateJwt, (req, res, next) => distributorsController.getDistributors(req, res, next));
router.post('/distributors', authenticateJwt, (req, res, next) => distributorsController.createDistributor(req, res, next));

// ============================================================================
// Legacy Fallbacks
// ============================================================================
router.get('/', authenticateJwt, (req, res, next) => distributorsController.getDistributors(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => distributorsController.getDistributorById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => distributorsController.createDistributor(req, res, next));

export const distributorsRoutes = router;
