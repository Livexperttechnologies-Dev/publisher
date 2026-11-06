import { Router } from 'express';
import { accountingController } from './accounting.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// Apply Authentication Guard to all Accounting Routes
router.use(authenticateJwt);

// Financial Statements & Reports
router.get('/reports/trial-balance', (req, res, next) => accountingController.getTrialBalance(req, res, next));
router.get('/reports/profit-loss', (req, res, next) => accountingController.getProfitLoss(req, res, next));
router.get('/reports/balance-sheet', (req, res, next) => accountingController.getBalanceSheet(req, res, next));
router.get('/reports/day-book', (req, res, next) => accountingController.getDayBook(req, res, next));
router.get('/reports/cost-centres', (req, res, next) => accountingController.getCostCentres(req, res, next));

// Chart of Accounts: Groups & Ledgers
router.get('/groups', (req, res, next) => accountingController.getGroups(req, res, next));
router.get('/ledgers', (req, res, next) => accountingController.getLedgers(req, res, next));
router.post('/ledgers', (req, res, next) => accountingController.createLedger(req, res, next));
router.get('/ledgers/:id', (req, res, next) => accountingController.getLedgerById(req, res, next));
router.get('/ledgers/:id/statement', (req, res, next) => accountingController.getLedgerStatement(req, res, next));

// Vouchers & Double-Entry Posting
router.get('/vouchers', (req, res, next) => accountingController.getVouchers(req, res, next));
router.post('/vouchers', (req, res, next) => accountingController.createVoucher(req, res, next));
router.get('/vouchers/:id', (req, res, next) => accountingController.getVoucherById(req, res, next));
router.post('/vouchers/:id/reverse', (req, res, next) => accountingController.reverseVoucher(req, res, next));

// Base Route (Backward compatibility with Phase 01)
router.get('/', (req, res, next) => accountingController.getAll(req, res, next));
router.post('/', (req, res, next) => accountingController.create(req, res, next));
router.get('/:id', (req, res, next) => accountingController.getById(req, res, next));

export const accountingRoutes = router;
