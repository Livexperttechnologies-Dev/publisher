export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'USER_CREATED'
  | 'USER_DEACTIVATED'
  | 'ROLE_UPDATED'
  | 'PERMISSION_CHANGED'
  | 'MASTER_DATA_CHANGED'
  | 'VOUCHER_CREATED'
  | 'VOUCHER_APPROVED'
  | 'VOUCHER_POSTED'
  | 'VOUCHER_REVERSED'
  | 'INVOICE_CREATED'
  | 'INVOICE_MODIFIED'
  | 'PAYMENT_DISBURSED'
  | 'PAYMENT_RECEIVED'
  | 'STOCK_ADJUSTED'
  | 'STOCK_TRANSFERRED'
  | 'PERIOD_LOCKED'
  | 'PERIOD_UNLOCKED'
  | 'BACKUP_CREATED'
  | 'BACKUP_VERIFIED'
  | 'BACKUP_RESTORED'
  | 'SECURITY_ALERT';

export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';

export interface AuditLog {
  id: string;
  timestamp: string;
  companyId: string;
  branchId?: string;
  userId: string;
  username: string;
  userRole: string;
  ipAddress: string;
  userAgent?: string;
  action: AuditAction;
  entity: string; // e.g. 'journal_entries', 'account_ledgers', 'users', 'books'
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'REJECTED';
  severity: AuditSeverity;
  description: string;
}

export interface AuditQueryFilters {
  companyId?: string;
  userId?: string;
  action?: AuditAction;
  entity?: string;
  startDate?: string;
  endDate?: string;
  severity?: AuditSeverity;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DatabaseBackup {
  id: string;
  filename: string;
  timestamp: string;
  fileSizeBytes: number;
  checksumSha256: string;
  backupType: 'FULL_SNAPSHOT' | 'TRANSACTION_LOG' | 'INCREMENTAL';
  status: 'VERIFIED' | 'COMPLETED' | 'CORRUPTED';
  retentionDays: number;
  storageLocation: string;
  verifiedAt?: string;
  restoredAt?: string;
}

export interface PointInTimeRecoveryResult {
  recoveryId: string;
  targetTimestamp: string;
  companyId: string;
  snapshotUsed: string;
  replayedVouchersCount: number;
  finalLedgersBalanced: boolean;
  status: 'RESTORE_SUCCESSFUL' | 'RESTORE_FAILED';
  restoredAt: string;
  details: string[];
}
