import { z } from 'zod';

export const createAuditLogSchema = z.object({
  action: z.enum([
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'USER_CREATED',
    'USER_DEACTIVATED',
    'ROLE_UPDATED',
    'PERMISSION_CHANGED',
    'MASTER_DATA_CHANGED',
    'VOUCHER_CREATED',
    'VOUCHER_APPROVED',
    'VOUCHER_POSTED',
    'VOUCHER_REVERSED',
    'INVOICE_CREATED',
    'INVOICE_MODIFIED',
    'PAYMENT_DISBURSED',
    'PAYMENT_RECEIVED',
    'STOCK_ADJUSTED',
    'STOCK_TRANSFERRED',
    'PERIOD_LOCKED',
    'PERIOD_UNLOCKED',
    'BACKUP_CREATED',
    'BACKUP_VERIFIED',
    'BACKUP_RESTORED',
    'SECURITY_ALERT',
  ]),
  entity: z.string().min(1),
  entityId: z.string().optional(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  status: z.enum(['SUCCESS', 'FAILURE', 'REJECTED']).default('SUCCESS'),
  severity: z.enum(['INFO', 'NOTICE', 'WARNING', 'CRITICAL']).default('INFO'),
  description: z.string().min(1),
});

export const auditQuerySchema = z.object({
  companyId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  severity: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(50),
});

export const createBackupSchema = z.object({
  backupType: z.enum(['FULL_SNAPSHOT', 'TRANSACTION_LOG', 'INCREMENTAL']).default('FULL_SNAPSHOT'),
  retentionDays: z.number().int().positive().optional().default(30),
  notes: z.string().optional(),
});

export const pitrRecoverySchema = z.object({
  targetTimestamp: z.string().min(1),
  companyId: z.string().optional().default('cmp_default_publisher'),
  reason: z.string().min(3),
});
