import { Router } from 'express';
import { salesController } from './sales.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// ============================================================================
// POS (Point of Sale) Endpoints
// ============================================================================
router.get('/pos/scan', authenticateJwt, (req, res, next) => salesController.scanItem(req, res, next));
router.post('/pos/scan', authenticateJwt, (req, res, next) => salesController.scanItem(req, res, next));
router.post('/pos/sale', authenticateJwt, (req, res, next) => salesController.processPosSale(req, res, next));
router.post('/pos/hold', authenticateJwt, (req, res, next) => salesController.holdCart(req, res, next));
router.get('/pos/held-carts', authenticateJwt, (req, res, next) => salesController.getHeldCarts(req, res, next));
router.post('/pos/resume/:id', authenticateJwt, (req, res, next) => salesController.resumeHeldCart(req, res, next));
router.post('/pos/shift/open', authenticateJwt, (req, res, next) => salesController.openPosShift(req, res, next));
router.post('/pos/shift/close', authenticateJwt, (req, res, next) => salesController.closePosShift(req, res, next));

// ============================================================================
// Sales Quotations
// ============================================================================
router.get('/quotations', authenticateJwt, (req, res, next) => salesController.getQuotations(req, res, next));
router.get('/quotations/:id', authenticateJwt, (req, res, next) => salesController.getQuotationById(req, res, next));
router.post('/quotations', authenticateJwt, (req, res, next) => salesController.createQuotation(req, res, next));

// ============================================================================
// Sales Orders
// ============================================================================
router.get('/orders', authenticateJwt, (req, res, next) => salesController.getOrders(req, res, next));
router.get('/orders/:id', authenticateJwt, (req, res, next) => salesController.getOrderById(req, res, next));
router.post('/orders', authenticateJwt, (req, res, next) => salesController.createOrder(req, res, next));
router.post('/orders/:id/cancel', authenticateJwt, (req, res, next) => salesController.cancelOrder(req, res, next));

// ============================================================================
// Delivery Challans
// ============================================================================
router.get('/challans', authenticateJwt, (req, res, next) => salesController.getDeliveryChallans(req, res, next));
router.get('/challans/:id', authenticateJwt, (req, res, next) => salesController.getDeliveryChallanById(req, res, next));
router.post('/challans', authenticateJwt, (req, res, next) => salesController.createDeliveryChallan(req, res, next));

// ============================================================================
// Sales Invoices
// ============================================================================
router.get('/invoices', authenticateJwt, (req, res, next) => salesController.getInvoices(req, res, next));
router.get('/invoices/:id', authenticateJwt, (req, res, next) => salesController.getInvoiceById(req, res, next));
router.post('/invoices', authenticateJwt, (req, res, next) => salesController.createInvoice(req, res, next));

// ============================================================================
// Sales Returns & Credit Notes
// ============================================================================
router.get('/returns', authenticateJwt, (req, res, next) => salesController.getReturns(req, res, next));
router.get('/returns/:id', authenticateJwt, (req, res, next) => salesController.getReturnById(req, res, next));
router.post('/returns', authenticateJwt, (req, res, next) => salesController.createReturn(req, res, next));

// ============================================================================
// Customer Receipts
// ============================================================================
router.get('/receipts', authenticateJwt, (req, res, next) => salesController.getReceipts(req, res, next));
router.get('/receipts/:id', authenticateJwt, (req, res, next) => salesController.getReceiptById(req, res, next));
router.post('/receipts', authenticateJwt, (req, res, next) => salesController.createReceipt(req, res, next));

// ============================================================================
// Receivables & Customer Statements
// ============================================================================
router.get('/receivables/ageing', authenticateJwt, (req, res, next) => salesController.getCustomerAgeing(req, res, next));
router.get('/customers/ageing', authenticateJwt, (req, res, next) => salesController.getCustomerAgeing(req, res, next));
router.get('/customers/statement/:customerId', authenticateJwt, (req, res, next) => salesController.getCustomerStatement(req, res, next));

// ============================================================================
// Reports & Analytics
// ============================================================================
router.get('/reports/daily', authenticateJwt, (req, res, next) => salesController.getDailySalesReport(req, res, next));
router.get('/reports/channel-wise', authenticateJwt, (req, res, next) => salesController.getChannelWiseSalesReport(req, res, next));
router.get('/reports/book-wise', authenticateJwt, (req, res, next) => salesController.getBookWiseSalesReport(req, res, next));
router.get('/reports/margin', authenticateJwt, (req, res, next) => salesController.getSalesMarginReport(req, res, next));

// Generic root fallback
router.get('/', authenticateJwt, (req, res, next) => salesController.getOrders(req, res, next));

export const salesRoutes = router;
