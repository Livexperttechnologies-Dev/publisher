import { Router } from 'express';
import { royaltiesController } from './royalties.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// ============================================================================
// 1. Royalty Statements & Reports (Static endpoints before :id)
// ============================================================================
router.get('/reports/author-summary', authenticateJwt, (req, res, next) => royaltiesController.getAuthorWiseRoyaltySummary(req, res, next));
router.get('/reports/book-wise', authenticateJwt, (req, res, next) => royaltiesController.getBookWiseRoyaltyReport(req, res, next));
router.get('/reports/advances', authenticateJwt, (req, res, next) => royaltiesController.getAdvanceRoyaltyReport(req, res, next));
router.get('/statements/:calculationId', authenticateJwt, (req, res, next) => royaltiesController.getAuthorRoyaltyStatement(req, res, next));

// ============================================================================
// 2. Royalty Accrual Periods
// ============================================================================
router.get('/periods', authenticateJwt, (req, res, next) => royaltiesController.getAccrualPeriods(req, res, next));
router.post('/periods', authenticateJwt, (req, res, next) => royaltiesController.createAccrualPeriod(req, res, next));

// ============================================================================
// 3. Royalty Calculation, Approval & Settlement Workflow
// ============================================================================
router.post('/calculate', authenticateJwt, (req, res, next) => royaltiesController.calculateRoyalty(req, res, next));
router.post('/approve', authenticateJwt, (req, res, next) => royaltiesController.approveRoyaltyCalculation(req, res, next));
router.post('/settle', authenticateJwt, (req, res, next) => royaltiesController.settleRoyaltyPayment(req, res, next));

// ============================================================================
// 4. Author Agreements & Contracts
// ============================================================================
router.post('/agreements/:id/books', authenticateJwt, (req, res, next) => royaltiesController.addBookToAgreement(req, res, next));
router.post('/agreements/:id/slabs', authenticateJwt, (req, res, next) => royaltiesController.addSlabsToAgreement(req, res, next));
router.put('/agreements/:id', authenticateJwt, (req, res, next) => royaltiesController.updateAgreement(req, res, next));
router.get('/agreements/:id', authenticateJwt, (req, res, next) => royaltiesController.getAgreementById(req, res, next));
router.get('/agreements', authenticateJwt, (req, res, next) => royaltiesController.getAgreements(req, res, next));
router.post('/agreements', authenticateJwt, (req, res, next) => royaltiesController.createAgreement(req, res, next));

// ============================================================================
// Legacy Fallbacks
// ============================================================================
router.get('/', authenticateJwt, (req, res, next) => royaltiesController.getAgreements(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => royaltiesController.getAgreementById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => royaltiesController.createAgreement(req, res, next));

export const royaltiesRoutes = router;
