import { Router } from 'express';
import { taxationController } from './taxation.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// --------------------------------------------------------------------------
// GST RATES & CONFIGURATION
// --------------------------------------------------------------------------
router.get('/gst-rates', authenticateJwt, (req, res, next) => taxationController.getAllGstRates(req, res, next));
router.get('/gst-rates/:hsn', authenticateJwt, (req, res, next) => taxationController.getGstRateByHsn(req, res, next));
router.post('/gst-rates', authenticateJwt, (req, res, next) => taxationController.configureGstRate(req, res, next));

// --------------------------------------------------------------------------
// TAX CALCULATION ENGINE
// --------------------------------------------------------------------------
router.post('/calculate', authenticateJwt, (req, res, next) => taxationController.calculateTax(req, res, next));

// --------------------------------------------------------------------------
// TAX INVOICES, BILL OF SUPPLY & CREDIT/DEBIT NOTES
// --------------------------------------------------------------------------
router.get('/invoices', authenticateJwt, (req, res, next) => taxationController.getAllInvoices(req, res, next));
router.get('/invoices/:id', authenticateJwt, (req, res, next) => taxationController.getInvoiceById(req, res, next));
router.post('/invoices', authenticateJwt, (req, res, next) => taxationController.createInvoice(req, res, next));

// --------------------------------------------------------------------------
// E-INVOICE & E-WAY BILL
// --------------------------------------------------------------------------
router.post('/e-invoice/generate-irn', authenticateJwt, (req, res, next) => taxationController.generateIrn(req, res, next));
router.post('/e-invoice/cancel-irn', authenticateJwt, (req, res, next) => taxationController.cancelIrn(req, res, next));
router.post('/eway-bill/generate', authenticateJwt, (req, res, next) => taxationController.generateEwayBill(req, res, next));
router.post('/eway-bill/cancel', authenticateJwt, (req, res, next) => taxationController.cancelEwayBill(req, res, next));

// --------------------------------------------------------------------------
// TDS (TAX DEDUCTED AT SOURCE)
// --------------------------------------------------------------------------
router.get('/tds/configs', authenticateJwt, (req, res, next) => taxationController.getAllTdsConfigs(req, res, next));
router.post('/tds/deduct', authenticateJwt, (req, res, next) => taxationController.deductTds(req, res, next));
router.get('/tds/deductions', authenticateJwt, (req, res, next) => taxationController.getAllTdsDeductions(req, res, next));

// --------------------------------------------------------------------------
// GST REPORTS & FILINGS
// --------------------------------------------------------------------------
router.get('/reports/gstr1', authenticateJwt, (req, res, next) => taxationController.getGstr1Report(req, res, next));
router.get('/reports/gstr3b', authenticateJwt, (req, res, next) => taxationController.getGstr3bReport(req, res, next));
router.get('/reports/form26q', authenticateJwt, (req, res, next) => taxationController.getForm26qSummary(req, res, next));
router.get('/audit-logs', authenticateJwt, (req, res, next) => taxationController.getTaxAuditLogs(req, res, next));
router.get('/api-logs', authenticateJwt, (req, res, next) => taxationController.getTaxApiLogs(req, res, next));

export const taxationRoutes = router;
