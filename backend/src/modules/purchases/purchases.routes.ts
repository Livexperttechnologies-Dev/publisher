import { Router } from 'express';
import { purchasesController } from './purchases.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// Requisitions
router.get('/requisitions', authenticateJwt, (req, res, next) => purchasesController.getRequisitions(req, res, next));
router.get('/requisitions/:id', authenticateJwt, (req, res, next) => purchasesController.getRequisitionById(req, res, next));
router.post('/requisitions', authenticateJwt, (req, res, next) => purchasesController.createRequisition(req, res, next));
router.post('/requisitions/:id/approve', authenticateJwt, (req, res, next) => purchasesController.approveRequisition(req, res, next));

// Quotations & Comparison
router.get('/quotations/compare', authenticateJwt, (req, res, next) => purchasesController.compareQuotations(req, res, next));
router.get('/quotations', authenticateJwt, (req, res, next) => purchasesController.getQuotations(req, res, next));
router.get('/quotations/:id', authenticateJwt, (req, res, next) => purchasesController.getQuotationById(req, res, next));
router.post('/quotations', authenticateJwt, (req, res, next) => purchasesController.createQuotation(req, res, next));

// Purchase Orders
router.get('/orders', authenticateJwt, (req, res, next) => purchasesController.getOrders(req, res, next));
router.get('/orders/:id', authenticateJwt, (req, res, next) => purchasesController.getOrderById(req, res, next));
router.post('/orders', authenticateJwt, (req, res, next) => purchasesController.createOrder(req, res, next));
router.post('/orders/:id/cancel', authenticateJwt, (req, res, next) => purchasesController.cancelOrder(req, res, next));

// Goods Receipt Notes (GRN)
router.get('/grn', authenticateJwt, (req, res, next) => purchasesController.getGRNs(req, res, next));
router.get('/grn/:id', authenticateJwt, (req, res, next) => purchasesController.getGRNById(req, res, next));
router.post('/grn', authenticateJwt, (req, res, next) => purchasesController.createGRN(req, res, next));

// Purchase Invoices (Vendor Bills)
router.get('/invoices', authenticateJwt, (req, res, next) => purchasesController.getInvoices(req, res, next));
router.get('/invoices/:id', authenticateJwt, (req, res, next) => purchasesController.getInvoiceById(req, res, next));
router.post('/invoices', authenticateJwt, (req, res, next) => purchasesController.createInvoice(req, res, next));

// Purchase Returns & Debit Notes
router.get('/returns', authenticateJwt, (req, res, next) => purchasesController.getReturns(req, res, next));
router.get('/returns/:id', authenticateJwt, (req, res, next) => purchasesController.getReturnById(req, res, next));
router.post('/returns', authenticateJwt, (req, res, next) => purchasesController.createReturn(req, res, next));

// Supplier Payments
router.get('/payments', authenticateJwt, (req, res, next) => purchasesController.getPayments(req, res, next));
router.get('/payments/:id', authenticateJwt, (req, res, next) => purchasesController.getPaymentById(req, res, next));
router.post('/payments', authenticateJwt, (req, res, next) => purchasesController.createPayment(req, res, next));

// Payables & Ageing
router.get('/payables/ageing', authenticateJwt, (req, res, next) => purchasesController.getSupplierAgeing(req, res, next));
router.get('/payables/statement/:supplierId', authenticateJwt, (req, res, next) => purchasesController.getSupplierStatement(req, res, next));

// Reports
router.get('/reports/register', authenticateJwt, (req, res, next) => purchasesController.getPurchaseRegister(req, res, next));
router.get('/reports/supplier-wise', authenticateJwt, (req, res, next) => purchasesController.getSupplierWisePurchases(req, res, next));
router.get('/reports/book-wise', authenticateJwt, (req, res, next) => purchasesController.getBookWisePurchases(req, res, next));
router.get('/reports/pending-orders', authenticateJwt, (req, res, next) => purchasesController.getPendingPurchaseOrders(req, res, next));

// Backward compatibility with generic root
router.get('/', authenticateJwt, (req, res, next) => purchasesController.getOrders(req, res, next));

export const purchasesRoutes = router;
