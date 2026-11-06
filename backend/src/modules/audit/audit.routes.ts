import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticateJwt, requireRole } from '../../middleware/authMiddleware';
import {
  createRateLimiter,
  sqlInjectionGuard,
  xssGuard,
  validateFileUpload,
} from '../../middleware/securityMiddleware';

const router = Router();

// Apply security firewall guards to audit and security endpoints
router.use(sqlInjectionGuard);
router.use(xssGuard);

// Rate limiter: 100 requests / minute for audit queries
const auditRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Security Alert: Audit query rate limit exceeded. Please retry after delay.',
});

// Audit Trail Logs
router.get('/logs', authenticateJwt, auditRateLimiter, (req, res, next) =>
  auditController.getLogs(req, res, next)
);
router.get('/export', authenticateJwt, (req, res, next) =>
  auditController.exportLogs(req, res, next)
);
router.post('/logs', authenticateJwt, (req, res, next) =>
  auditController.createLog(req, res, next)
);

// Database Backups & Integrity Verification
router.get('/backups', authenticateJwt, (req, res, next) =>
  auditController.getBackups(req, res, next)
);
router.post('/backups', authenticateJwt, requireRole(['SUPER_ADMIN', 'CHIEF_FINANCIAL_CONTROLLER']), (req, res, next) =>
  auditController.createBackup(req, res, next)
);
router.post('/backups/:id/verify', authenticateJwt, (req, res, next) =>
  auditController.verifyBackup(req, res, next)
);

// Point-In-Time Recovery (Restricted to Super Admin & Chief Financial Controller)
router.post(
  '/backups/restore-pitr',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'CHIEF_FINANCIAL_CONTROLLER']),
  (req, res, next) => auditController.restorePointInTime(req, res, next)
);

// Security & Compliance Status
router.get('/security-status', authenticateJwt, (req, res, next) =>
  auditController.getSecurityStatus(req, res, next)
);

// File Upload Security Verification Endpoint
router.post('/validate-upload', authenticateJwt, validateFileUpload, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'File upload passed security verification (MIME whitelist, size ceiling, and extension check)',
    file: req.body?.file,
  });
});

export const auditRoutes = router;
