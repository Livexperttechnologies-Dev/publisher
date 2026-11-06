import { Router } from 'express';
import { publishingController } from './publishing.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// ============================================================================
// 1. Production Reports & Analytics (Must precede :id routes)
// ============================================================================
router.get('/reports/status', authenticateJwt, (req, res, next) => publishingController.getProductionStatusReport(req, res, next));
router.get('/reports/material-consumption', authenticateJwt, (req, res, next) => publishingController.getMaterialConsumptionReport(req, res, next));
router.get('/reports/variance', authenticateJwt, (req, res, next) => publishingController.getProductionVarianceReport(req, res, next));

// ============================================================================
// 2. Production Orders & Workflows (Static operations before :id)
// ============================================================================
router.post('/orders/issue-material', authenticateJwt, (req, res, next) => publishingController.issueMaterial(req, res, next));
router.post('/orders/complete', authenticateJwt, (req, res, next) => publishingController.completeProductionOrder(req, res, next));
router.get('/orders', authenticateJwt, (req, res, next) => publishingController.getProductionOrders(req, res, next));
router.get('/orders/:id', authenticateJwt, (req, res, next) => publishingController.getProductionOrderById(req, res, next));
router.post('/orders', authenticateJwt, (req, res, next) => publishingController.createProductionOrder(req, res, next));

// ============================================================================
// 3. Vendor Job Orders (Press, Binding, Finishing)
// ============================================================================
router.post('/jobs/receive', authenticateJwt, (req, res, next) => publishingController.receiveJobWork(req, res, next));
router.get('/jobs', authenticateJwt, (req, res, next) => publishingController.getJobOrders(req, res, next));
router.post('/jobs', authenticateJwt, (req, res, next) => publishingController.createJobOrder(req, res, next));

// ============================================================================
// 4. Quality Control & Inspection Signoffs
// ============================================================================
router.get('/inspections/:orderId', authenticateJwt, (req, res, next) => publishingController.getInspections(req, res, next));
router.post('/inspections', authenticateJwt, (req, res, next) => publishingController.createInspection(req, res, next));

// ============================================================================
// 5. Publishing Projects & Editorial Lifecycle
// ============================================================================
router.patch('/projects/:id/status', authenticateJwt, (req, res, next) => publishingController.updateProjectStatus(req, res, next));
router.post('/projects/:id/allocate-isbn', authenticateJwt, (req, res, next) => publishingController.allocateIsbn(req, res, next));
router.get('/projects/:id', authenticateJwt, (req, res, next) => publishingController.getProjectById(req, res, next));
router.get('/projects', authenticateJwt, (req, res, next) => publishingController.getProjects(req, res, next));
router.post('/projects', authenticateJwt, (req, res, next) => publishingController.createProject(req, res, next));

// ============================================================================
// Legacy Fallbacks
// ============================================================================
router.get('/', authenticateJwt, (req, res, next) => publishingController.getProjects(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => publishingController.getProjectById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => publishingController.createProject(req, res, next));

export const publishingRoutes = router;
