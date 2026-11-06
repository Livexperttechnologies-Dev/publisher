import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// In-App Notification Feed
router.get('/in-app', authenticateJwt, (req, res, next) =>
  notificationsController.getInAppFeed(req, res, next)
);
router.patch('/in-app/:id/read', authenticateJwt, (req, res, next) =>
  notificationsController.markAsRead(req, res, next)
);
router.post('/in-app/read-all', authenticateJwt, (req, res, next) =>
  notificationsController.markAllAsRead(req, res, next)
);

// Manual & Triggered Notifications Dispatch
router.post('/send', authenticateJwt, (req, res, next) =>
  notificationsController.send(req, res, next)
);

// Delivery Retry
router.post('/logs/:id/retry', authenticateJwt, (req, res, next) =>
  notificationsController.retry(req, res, next)
);

// Automated Scheduled Workflows Trigger
router.post('/jobs/run', authenticateJwt, (req, res, next) =>
  notificationsController.runJob(req, res, next)
);

// Hardware Integrations (80mm ESC/POS Receipt)
router.post('/hardware/esc-pos-receipt', authenticateJwt, (req, res, next) =>
  notificationsController.generateThermalReceipt(req, res, next)
);

// Catalogs, Settings & Vault
router.get('/templates', authenticateJwt, (req, res, next) =>
  notificationsController.getTemplates(req, res, next)
);
router.get('/workflows', authenticateJwt, (req, res, next) =>
  notificationsController.getWorkflowRules(req, res, next)
);
router.patch('/workflows/:id/toggle', authenticateJwt, (req, res, next) =>
  notificationsController.toggleWorkflowRule(req, res, next)
);
router.get('/credentials', authenticateJwt, (req, res, next) =>
  notificationsController.getCredentials(req, res, next)
);
router.get('/logs', authenticateJwt, (req, res, next) =>
  notificationsController.getLogs(req, res, next)
);

// External Inbound Webhooks (HMAC verification inside controller, no JWT)
router.post('/webhooks/:provider', (req, res, next) =>
  notificationsController.handleWebhook(req, res, next)
);

// Standard & Legacy CRUD
router.get('/', authenticateJwt, (req, res, next) => notificationsController.getAll(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => notificationsController.getById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => notificationsController.create(req, res, next));

export const notificationsRoutes = router;
