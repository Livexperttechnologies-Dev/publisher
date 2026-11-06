import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// --------------------------------------------------------------------------
// 1. Categories
// --------------------------------------------------------------------------
router.get('/categories', authenticateJwt, (req, res, next) => expensesController.getCategories(req, res, next));
router.post('/categories', authenticateJwt, (req, res, next) => expensesController.createCategory(req, res, next));

// --------------------------------------------------------------------------
// 2. Expense Vouchers
// --------------------------------------------------------------------------
router.get('/vouchers', authenticateJwt, (req, res, next) => expensesController.getVouchers(req, res, next));
router.get('/vouchers/:id', authenticateJwt, (req, res, next) => expensesController.getVoucherById(req, res, next));
router.post('/vouchers', authenticateJwt, (req, res, next) => expensesController.createVoucher(req, res, next));
router.post('/vouchers/:id/approval', authenticateJwt, (req, res, next) => expensesController.approveVoucher(req, res, next));

// --------------------------------------------------------------------------
// 3. Employee Reimbursements
// --------------------------------------------------------------------------
router.get('/reimbursements', authenticateJwt, (req, res, next) => expensesController.getReimbursements(req, res, next));
router.post('/reimbursements', authenticateJwt, (req, res, next) => expensesController.createReimbursement(req, res, next));
router.post('/reimbursements/:id/approval', authenticateJwt, (req, res, next) => expensesController.approveReimbursement(req, res, next));
router.post('/reimbursements/:id/pay', authenticateJwt, (req, res, next) => expensesController.payReimbursement(req, res, next));

// --------------------------------------------------------------------------
// 4. Recurring Expenses
// --------------------------------------------------------------------------
router.get('/recurring', authenticateJwt, (req, res, next) => expensesController.getRecurringExpenses(req, res, next));
router.post('/recurring', authenticateJwt, (req, res, next) => expensesController.createRecurringExpense(req, res, next));
router.post('/recurring/process', authenticateJwt, (req, res, next) => expensesController.processRecurringExpenses(req, res, next));

// --------------------------------------------------------------------------
// 5. Fixed Assets & Depreciation
// --------------------------------------------------------------------------
router.get('/assets', authenticateJwt, (req, res, next) => expensesController.getFixedAssets(req, res, next));
router.get('/assets/:id', authenticateJwt, (req, res, next) => expensesController.getFixedAssetById(req, res, next));
router.post('/assets', authenticateJwt, (req, res, next) => expensesController.createFixedAsset(req, res, next));
router.post('/assets/:id/transfer', authenticateJwt, (req, res, next) => expensesController.transferFixedAsset(req, res, next));
router.post('/assets/depreciation', authenticateJwt, (req, res, next) => expensesController.calculateDepreciation(req, res, next));
router.post('/assets/:id/dispose', authenticateJwt, (req, res, next) => expensesController.disposeFixedAsset(req, res, next));
router.get('/depreciation-schedules', authenticateJwt, (req, res, next) => expensesController.getDepreciationSchedules(req, res, next));

// --------------------------------------------------------------------------
// 6. Budget Management
// --------------------------------------------------------------------------
router.get('/budgets', authenticateJwt, (req, res, next) => expensesController.getBudgets(req, res, next));
router.get('/budgets/:id', authenticateJwt, (req, res, next) => expensesController.getBudgetById(req, res, next));
router.post('/budgets', authenticateJwt, (req, res, next) => expensesController.createBudget(req, res, next));
router.put('/budgets/:id', authenticateJwt, (req, res, next) => expensesController.updateBudget(req, res, next));

// --------------------------------------------------------------------------
// 7. Reports
// --------------------------------------------------------------------------
router.get('/reports/summary', authenticateJwt, (req, res, next) => expensesController.getExpenseSummaryReport(req, res, next));
router.get('/reports/asset-register', authenticateJwt, (req, res, next) => expensesController.getFixedAssetRegisterReport(req, res, next));
router.get('/reports/budget-variance', authenticateJwt, (req, res, next) => expensesController.getBudgetVarianceReport(req, res, next));
router.get('/reports/profitability', authenticateJwt, (req, res, next) => expensesController.getDepartmentProfitabilityReport(req, res, next));

export const expensesRoutes = router;
export default router;
