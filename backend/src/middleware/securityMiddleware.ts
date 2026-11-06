import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { AppError } from './errorHandler';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enterprise In-Memory Sliding Window Rate Limiter
 */
export const createRateLimiter = (options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  skipSuperAdmin?: boolean;
}) => {
  const windowMs = options.windowMs || 60000; // default 1 minute
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests. Please slow down and try again later.';

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (options.skipSuperAdmin && req.user?.roleType === 'SUPER_ADMIN') {
      return next();
    }

    const key = (req.user?.id || req.ip || req.socket.remoteAddress || 'unknown_client') + ':' + req.baseUrl;
    const now = Date.now();
    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetSeconds));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', String(resetSeconds));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
};

/**
 * Multi-Warehouse Isolation Guard
 * Restricts warehouse managers and godown clerks to their authorized warehouses
 */
export const preventCrossWarehouseAccess = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  // Super Admin & Central Executive roles can inspect any godown
  if (
    req.user.roleType === 'SUPER_ADMIN' ||
    req.user.dataScope === 'ALL_COMPANIES' ||
    req.user.role === 'CHIEF_FINANCIAL_CONTROLLER' ||
    req.user.role === 'PUBLISHER_OWNER'
  ) {
    return next();
  }

  const targetWarehouseId =
    req.params.warehouseId || req.query.warehouseId || req.body.warehouseId;

  // If user has specific warehouse restriction tag
  const userWarehouseId = (req.user as any).warehouseId || req.user.branchId;

  if (targetWarehouseId && userWarehouseId && targetWarehouseId !== userWarehouseId && targetWarehouseId !== 'ALL') {
    return next(
      new AppError(
        'Forbidden: Cross-warehouse access violation. You are only authorized to operate within your assigned godown depot.',
        403
      )
    );
  }

  next();
};

/**
 * SQL Injection Pattern Detection & Sanitization
 */
const SQLI_REGEX = /(\b(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|alter\s+table|exec(\s|\+)+(s|x)p\w*)\b|--\s|;\s*drop\b)/i;

const inspectForSqlInjection = (obj: any): boolean => {
  if (!obj) return false;
  if (typeof obj === 'string') {
    return SQLI_REGEX.test(obj);
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (inspectForSqlInjection(obj[key])) {
        return true;
      }
    }
  }
  return false;
};

export const sqlInjectionGuard = (req: Request, res: Response, next: NextFunction) => {
  if (
    inspectForSqlInjection(req.query) ||
    inspectForSqlInjection(req.body) ||
    inspectForSqlInjection(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Security Alert: Malicious SQL injection pattern detected and blocked by KIBO360 Security Gateway',
      code: 'SQLI_ATTACK_DETECTED',
    });
  }
  next();
};

/**
 * XSS Payload Detection & Sanitization
 */
const XSS_REGEX = /(<\s*script\b[^>]*>.*?<\s*\/\s*script\s*>|<\s*iframe\b|javascript\s*:|onerror\s*=|onload\s*=|onclick\s*=)/i;

const inspectForXss = (obj: any): boolean => {
  if (!obj) return false;
  if (typeof obj === 'string') {
    return XSS_REGEX.test(obj);
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (inspectForXss(obj[key])) {
        return true;
      }
    }
  }
  return false;
};

export const xssGuard = (req: Request, res: Response, next: NextFunction) => {
  if (inspectForXss(req.body) || inspectForXss(req.query) || inspectForXss(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Security Alert: Malicious Cross-Site Scripting (XSS) payload detected and blocked by KIBO360 Firewall',
      code: 'XSS_ATTACK_DETECTED',
    });
  }
  next();
};

/**
 * Secure File Upload Validation Middleware
 */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const DANGEROUS_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.phtml',
  '.pl',
  '.cgi',
  '.py',
  '.js',
  '.vbs',
  '.jar',
  '.msi',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const fileData = req.body?.file || (req as any).file;
  if (!fileData) {
    return next();
  }

  const filename = fileData.originalname || fileData.filename || fileData.name || '';
  const mimetype = fileData.mimetype || fileData.type || '';
  const sizeBytes = fileData.size || fileData.sizeBytes || 0;

  // Check file extension
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return res.status(400).json({
      success: false,
      message: `Security Violation: File extension ${ext} is strictly prohibited for security compliance.`,
      code: 'PROHIBITED_FILE_EXTENSION',
    });
  }

  // Check MIME type whitelist
  if (mimetype && !ALLOWED_MIME_TYPES.has(mimetype)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported file type: ${mimetype}. Allowed types: PDF, PNG, JPEG, CSV, Excel.`,
      code: 'UNSUPPORTED_MIME_TYPE',
    });
  }

  // Check file size
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds the 10 MB maximum threshold (Received: ${(sizeBytes / (1024 * 1024)).toFixed(2)} MB).`,
      code: 'FILE_SIZE_EXCEEDED',
    });
  }

  next();
};
