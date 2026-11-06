import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { notificationsService } from './notifications.service';
import { sendSuccess } from '../../utils/response';
import {
  createNotificationSchema,
  sendNotificationSchema,
  executeWebhookSchema,
  generateReceiptSchema,
  createNotificationsSchema,
} from './notifications.validator';

export class NotificationsController {
  // 1. IN-APP FEED
  async getInAppFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.companyId as string) || req.user?.companyId || 'cmp_default_publisher';
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const { items, unreadCount } = await notificationsService.getInAppNotifications({
        companyId,
        unreadOnly,
        limit,
      });

      return sendSuccess(res, 'In-App notifications retrieved successfully', items, {
        total: items.length,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await notificationsService.markAsRead(id);
      return sendSuccess(res, 'Notification marked as read', updated);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const result = await notificationsService.markAllAsRead(companyId);
      return sendSuccess(res, 'All notifications marked as read', result);
    } catch (error) {
      next(error);
    }
  }

  // 2. DISPATCH NOTIFICATION
  async send(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = sendNotificationSchema.parse(req.body);
      const companyId = req.user?.companyId || 'cmp_default_publisher';
      const { log, isDuplicate } = await notificationsService.sendNotification({
        ...validated,
        companyId,
      });

      const message = isDuplicate
        ? 'Duplicate notification suppressed by Idempotency Key'
        : 'Notification dispatched successfully';

      return sendSuccess(res, message, log, { isDuplicate }, isDuplicate ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  // 3. RETRY FAILED DELIVERY
  async retry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const retried = await notificationsService.retryFailedDelivery(id);
      return sendSuccess(res, 'Notification delivery retried', retried);
    } catch (error) {
      next(error);
    }
  }

  // 4. AUTOMATED SCHEDULED JOBS
  async runJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobType = (req.body.jobType || req.query.jobType) as any;
      if (!jobType) {
        return res.status(400).json({ success: false, message: 'jobType is required' });
      }

      const result = await notificationsService.runScheduledJob(jobType);
      return sendSuccess(res, `Scheduled job ${jobType} executed successfully`, result);
    } catch (error) {
      next(error);
    }
  }

  // 5. EXTERNAL WEBHOOKS
  async handleWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const provider = (Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider).toUpperCase() as any;
      const signature = (req.headers['x-razorpay-signature'] ||
        req.headers['x-hub-signature-256'] ||
        req.headers['x-shopify-hmac-sha256']) as string | undefined;

      const result = notificationsService.verifyAndProcessWebhook(provider, signature, req.body);
      if (!result.isValid) {
        return res.status(400).json({ success: false, message: result.message });
      }

      return res.status(200).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
      next(error);
    }
  }

  // 6. HARDWARE ESC/POS THERMAL RECEIPT
  async generateThermalReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = generateReceiptSchema.parse(req.body);
      const receipt = notificationsService.generateEscPosThermalReceipt(validated);
      return sendSuccess(res, 'ESC/POS 80mm thermal receipt command sequence generated', receipt);
    } catch (error) {
      next(error);
    }
  }

  // 7. CATALOGS & SETTINGS
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const templates = await notificationsService.getTemplates();
      return sendSuccess(res, 'Notification templates retrieved successfully', templates);
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowRules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rules = await notificationsService.getWorkflowRules();
      return sendSuccess(res, 'Automated workflow rules retrieved successfully', rules);
    } catch (error) {
      next(error);
    }
  }

  async toggleWorkflowRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const isActive = req.body.isActive === true;
      const updated = await notificationsService.toggleWorkflowRule(id, isActive);
      return sendSuccess(res, `Workflow rule ${updated.name} ${isActive ? 'activated' : 'deactivated'}`, updated);
    } catch (error) {
      next(error);
    }
  }

  async getCredentials(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const creds = await notificationsService.getCredentials();
      return sendSuccess(res, 'Integration credentials status retrieved successfully', creds);
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await notificationsService.getNotificationLogs(limit);
      return sendSuccess(res, 'Notification audit logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  }

  // 8. STANDARD CRUD & LEGACY
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { items, total } = await notificationsService.getAll(req.query);
      return sendSuccess(res, 'System Notifications catalog fetched successfully', items, {
        total,
        page: 1,
        limit: 10,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await notificationsService.getById(id);
      return sendSuccess(res, 'Notification details fetched successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createNotificationsSchema.parse(req.body);
      const created = await notificationsService.create(validated);
      return sendSuccess(res, 'Notification item created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
