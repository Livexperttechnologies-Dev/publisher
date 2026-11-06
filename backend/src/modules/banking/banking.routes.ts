import { Router } from 'express';
import { bankingController } from './banking.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// --------------------------------------------------------------------------
// BANK ACCOUNTS
// --------------------------------------------------------------------------
router.get('/accounts', authenticateJwt, (req, res, next) => bankingController.getAllBankAccounts(req, res, next));
router.get('/accounts/:id', authenticateJwt, (req, res, next) => bankingController.getBankAccountById(req, res, next));
router.post('/accounts', authenticateJwt, (req, res, next) => bankingController.createBankAccount(req, res, next));

// --------------------------------------------------------------------------
// CASH REGISTERS
// --------------------------------------------------------------------------
router.get('/registers', authenticateJwt, (req, res, next) => bankingController.getAllCashRegisters(req, res, next));
router.post('/registers', authenticateJwt, (req, res, next) => bankingController.createCashRegister(req, res, next));

// --------------------------------------------------------------------------
// BANK TRANSACTIONS
// --------------------------------------------------------------------------
router.get('/transactions/bank', authenticateJwt, (req, res, next) => bankingController.getAllBankTransactions(req, res, next));
router.post('/transactions/bank', authenticateJwt, (req, res, next) => bankingController.recordBankTransaction(req, res, next));

// --------------------------------------------------------------------------
// CASH TRANSACTIONS & PETTY CASH
// --------------------------------------------------------------------------
router.get('/transactions/cash', authenticateJwt, (req, res, next) => bankingController.getAllCashTransactions(req, res, next));
router.post('/transactions/cash', authenticateJwt, (req, res, next) => bankingController.recordCashTransaction(req, res, next));

// --------------------------------------------------------------------------
// CHEQUES
// --------------------------------------------------------------------------
router.get('/cheques', authenticateJwt, (req, res, next) => bankingController.getAllCheques(req, res, next));
router.post('/cheques/lifecycle', authenticateJwt, (req, res, next) => bankingController.processChequeLifecycle(req, res, next));

// --------------------------------------------------------------------------
// TRANSFERS (CONTRA)
// --------------------------------------------------------------------------
router.post('/transfers', authenticateJwt, (req, res, next) => bankingController.transferFunds(req, res, next));

// --------------------------------------------------------------------------
// CASH CLOSING
// --------------------------------------------------------------------------
router.post('/cash/close', authenticateJwt, (req, res, next) => bankingController.closeCashRegisterShift(req, res, next));
router.get('/cash/closings', authenticateJwt, (req, res, next) => bankingController.getAllCashClosings(req, res, next));

// --------------------------------------------------------------------------
// RECONCILIATION & STATEMENT IMPORT
// --------------------------------------------------------------------------
router.post('/reconciliation/import', authenticateJwt, (req, res, next) => bankingController.importBankStatement(req, res, next));
router.post('/reconciliation/calculate-brs', authenticateJwt, (req, res, next) => bankingController.calculateBrs(req, res, next));

// --------------------------------------------------------------------------
// REPORTS
// --------------------------------------------------------------------------
router.get('/reports/cash-book', authenticateJwt, (req, res, next) => bankingController.getCashBookReport(req, res, next));
router.get('/reports/bank-book', authenticateJwt, (req, res, next) => bankingController.getBankBookReport(req, res, next));
router.get('/reports/daily-collection', authenticateJwt, (req, res, next) => bankingController.getDailyCollectionReport(req, res, next));

export const bankingRoutes = router;
