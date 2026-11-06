import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// ============================================================================
// Warehouses & Racks
// ============================================================================
router.get('/warehouses', authenticateJwt, (req, res, next) => inventoryController.getWarehouses(req, res, next));
router.get('/warehouses/:id', authenticateJwt, (req, res, next) => inventoryController.getWarehouseById(req, res, next));
router.post('/warehouses', authenticateJwt, (req, res, next) => inventoryController.createWarehouse(req, res, next));
router.get('/warehouses/:warehouseId/racks', authenticateJwt, (req, res, next) => inventoryController.getRacks(req, res, next));
router.post('/racks', authenticateJwt, (req, res, next) => inventoryController.createRack(req, res, next));

// ============================================================================
// Stock Tracking & Real-Time Availability
// ============================================================================
router.get('/stocks', authenticateJwt, (req, res, next) => inventoryController.getStocks(req, res, next));
router.get('/stocks/sku/:sku', authenticateJwt, (req, res, next) => inventoryController.getStockBySku(req, res, next));
router.get('/stocks/consolidated/:sku', authenticateJwt, (req, res, next) => inventoryController.getConsolidatedStock(req, res, next));

// ============================================================================
// Stock Inward, Outward & Reservation
// ============================================================================
router.post('/inward', authenticateJwt, (req, res, next) => inventoryController.stockInward(req, res, next));
router.post('/outward', authenticateJwt, (req, res, next) => inventoryController.stockOutward(req, res, next));
router.post('/reservation', authenticateJwt, (req, res, next) => inventoryController.stockReservation(req, res, next));

// ============================================================================
// Stock Transfers
// ============================================================================
router.post('/transfers/receive', authenticateJwt, (req, res, next) => inventoryController.receiveTransfer(req, res, next));
router.get('/transfers', authenticateJwt, (req, res, next) => inventoryController.getTransfers(req, res, next));
router.get('/transfers/:id', authenticateJwt, (req, res, next) => inventoryController.getTransferById(req, res, next));
router.post('/transfers', authenticateJwt, (req, res, next) => inventoryController.createTransfer(req, res, next));

// ============================================================================
// Physical Audits & Cycle Counts
// ============================================================================
router.get('/audits', authenticateJwt, (req, res, next) => inventoryController.getAuditSessions(req, res, next));
router.post('/audits', authenticateJwt, (req, res, next) => inventoryController.createAuditSession(req, res, next));

// ============================================================================
// Stock Adjustments & Damage Write-Offs
// ============================================================================
router.get('/adjustments', authenticateJwt, (req, res, next) => inventoryController.getAdjustments(req, res, next));
router.post('/adjustments', authenticateJwt, (req, res, next) => inventoryController.createAdjustment(req, res, next));

// ============================================================================
// Barcode & Shelf Label Generation
// ============================================================================
router.post('/barcode/labels', authenticateJwt, (req, res, next) => inventoryController.generateBarcodeLabels(req, res, next));

// ============================================================================
// Reports & Valuation Analytics
// ============================================================================
router.get('/reports/summary', authenticateJwt, (req, res, next) => inventoryController.getStockSummaryReport(req, res, next));
router.get('/reports/ledger/:sku', authenticateJwt, (req, res, next) => inventoryController.getStockLedgerReport(req, res, next));
router.get('/reports/ageing', authenticateJwt, (req, res, next) => inventoryController.getStockAgeingReport(req, res, next));
router.get('/reports/valuation', authenticateJwt, (req, res, next) => inventoryController.getInventoryValuationReport(req, res, next));
router.get('/reports/reorder', authenticateJwt, (req, res, next) => inventoryController.getReorderReport(req, res, next));

// Generic root fallback
router.get('/', authenticateJwt, (req, res, next) => inventoryController.getStocks(req, res, next));

export const inventoryRoutes = router;
