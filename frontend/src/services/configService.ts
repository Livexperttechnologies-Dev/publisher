export interface CompanyProfile {
  companyName: string;
  gstin: string;
  pan: string;
  cin: string;
  currencySymbol: string;
  decimalPrecision: number;
  invoicePrefix: string;
  invValMethod: 'FIFO' | 'WEIGHTED_AVERAGE';
  registeredAddress: string;
  corporateEmail: string;
  supportPhone: string;
}

export interface BranchRecord {
  id: string;
  name: string;
  code: string;
  isMain: boolean;
  city: string;
  state: string;
  gstin: string;
  manager: string;
  prefix: string;
  transfers: boolean;
}

export interface MonthLock {
  month: string;
  isLocked: boolean;
}

export interface FiscalYearRecord {
  id: string;
  name: string;
  period: string;
  status: string;
  isClosed: boolean;
  lockedMonths: MonthLock[];
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  ip: string;
  action: string;
  entity: string;
  severity: 'INFO' | 'WARNING' | 'NOTICE' | 'CRITICAL';
  description: string;
  oldVal: any;
  newVal: any;
}

export interface BackupRecord {
  id: string;
  filename: string;
  backupName?: string;
  timestamp: string;
  size: string;
  fileSizeBytes?: number;
  sha256: string;
  type: string;
  status: string;
  location: string;
  storageLocation?: string;
  verifiedIntegrity?: boolean;
}

export interface InAppNotification {
  id: string;
  type: 'REORDER_ALERT' | 'OVERDUE_INVOICE' | 'APPROVAL_PENDING' | 'PAYMENT_CONFIRMATION' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}

export interface WorkflowRuleRecord {
  id: string;
  name: string;
  trigger: string;
  description: string;
  channels: string[];
  schedule: string;
  isActive: boolean;
  lastRun: string;
}

const STORAGE_KEYS = {
  PROFILE: 'kibo360_company_profile_v2',
  BRANCHES: 'kibo360_branches_list_v2',
  FISCAL_YEARS: 'kibo360_fiscal_years_v2',
  AUDIT_LOGS: 'kibo360_security_audit_logs_v2',
  BACKUPS: 'kibo360_automated_backups_v2',
  NOTIFICATIONS: 'kibo360_notifications_feed_v2',
  WORKFLOW_RULES: 'kibo360_workflow_rules_v2',
};

// Initial Seeds
const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'Apex Educational Publishers & Distributors Ltd.',
  gstin: '07AAAAA0000A1Z5',
  pan: 'AAACA1234D',
  cin: 'U22110DL2010PLC123456',
  currencySymbol: '₹',
  decimalPrecision: 2,
  invoicePrefix: 'AEPD',
  invValMethod: 'FIFO',
  registeredAddress: '14/2, Ansari Road, Daryaganj, New Delhi - 110002',
  corporateEmail: 'compliance@apexpublishers.com',
  supportPhone: '+91 11 4988 2300',
};

const DEFAULT_BRANCHES: BranchRecord[] = [
  {
    id: 'brn_1',
    name: 'Headquarters & Central Depot',
    code: 'HQ-DELHI',
    isMain: true,
    city: 'New Delhi',
    state: 'Delhi',
    gstin: '07AAAAA0000A1Z5',
    manager: 'KIBO360 Principal Administrator',
    prefix: 'DEL-INV',
    transfers: true,
  },
  {
    id: 'brn_2',
    name: 'Western Zonal Depot (Bhiwandi)',
    code: 'BHW-MUM',
    isMain: false,
    city: 'Bhiwandi, Mumbai',
    state: 'Maharashtra',
    gstin: '27AAAAA0000A1Z2',
    manager: 'Rajesh K. Patil',
    prefix: 'MUM-INV',
    transfers: true,
  },
  {
    id: 'brn_3',
    name: 'Southern Distribution Hub',
    code: 'STH-BLR',
    isMain: false,
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AAAAA0000A1Z8',
    manager: 'N. Chandrasekharan',
    prefix: 'BLR-INV',
    transfers: true,
  },
];

const DEFAULT_FISCAL_YEARS: FiscalYearRecord[] = [
  {
    id: 'fy_2026',
    name: 'FY 2026-2027',
    period: '01 Apr 2026 – 31 Mar 2027',
    status: 'Current Active',
    isClosed: false,
    lockedMonths: [
      { month: 'April 2026', isLocked: true },
      { month: 'May 2026', isLocked: true },
      { month: 'June 2026', isLocked: true },
      { month: 'July 2026', isLocked: false },
      { month: 'August 2026', isLocked: false },
      { month: 'September 2026', isLocked: false },
      { month: 'October 2026', isLocked: false },
      { month: 'November 2026', isLocked: false },
    ],
  },
  {
    id: 'fy_2025',
    name: 'FY 2025-2026',
    period: '01 Apr 2025 – 31 Mar 2026',
    status: 'Closed & Audited',
    isClosed: true,
    lockedMonths: [],
  },
];

const DEFAULT_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud_log_001',
    timestamp: '2026-11-06 14:02:14',
    user: 'admin@kibo360.com',
    role: 'SUPER_ADMIN',
    ip: '127.0.0.1',
    action: 'LOGIN_SUCCESS',
    entity: 'auth_sessions',
    severity: 'INFO',
    description: 'Super Admin successfully authenticated via corporate credentials.',
    oldVal: null,
    newVal: { session: 'ses_91823', method: 'JWT_BEARER' },
  },
  {
    id: 'aud_log_002',
    timestamp: '2026-11-06 12:45:10',
    user: 'finance@apexpublishers.com',
    role: 'FINANCE_MANAGER',
    ip: '127.0.0.1',
    action: 'VOUCHER_POSTED',
    entity: 'journal_entries',
    severity: 'NOTICE',
    description: 'Posted balanced Journal Voucher #JV/2026/0002 for Fixed Asset Depreciation.',
    oldVal: { status: 'DRAFT' },
    newVal: { status: 'POSTED', totalAmount: 120000 },
  },
  {
    id: 'aud_log_003',
    timestamp: '2026-11-06 11:30:22',
    user: 'admin@kibo360.com',
    role: 'SUPER_ADMIN',
    ip: '127.0.0.1',
    action: 'PERIOD_LOCKED',
    entity: 'accounting_periods',
    severity: 'NOTICE',
    description: 'Locked accounting period "June 2026" against backdated adjustments.',
    oldVal: { isLocked: false },
    newVal: { isLocked: true },
  },
  {
    id: 'aud_log_004',
    timestamp: '2026-11-06 10:15:40',
    user: 'intruder@unknown.com',
    role: 'UNAUTHENTICATED',
    ip: '198.51.100.42',
    action: 'LOGIN_FAILED',
    entity: 'auth_sessions',
    severity: 'WARNING',
    description: 'Failed login attempt with invalid credentials from external IP.',
    oldVal: null,
    newVal: { attemptCount: 5, lockedOut: true },
  },
];

const DEFAULT_BACKUPS: BackupRecord[] = [
  {
    id: 'bkp_snap_20261106',
    filename: 'kibo360_db_snapshot_20261106_020000.sql.gz',
    backupName: 'kibo360_db_snapshot_20261106_020000.sql.gz',
    timestamp: '06-Nov-2026 02:00 AM',
    size: '48.50 MB',
    fileSizeBytes: 48500000,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    type: 'FULL_SNAPSHOT',
    status: 'VERIFIED',
    location: 's3://kibo360-encrypted-backups-mumbai/snapshots/2026-11-06/',
    storageLocation: 's3://kibo360-encrypted-backups-mumbai/snapshots/2026-11-06/',
    verifiedIntegrity: true,
  },
  {
    id: 'bkp_snap_20261105',
    filename: 'kibo360_db_snapshot_20261105_020000.sql.gz',
    backupName: 'kibo360_db_snapshot_20261105_020000.sql.gz',
    timestamp: '05-Nov-2026 02:00 AM',
    size: '43.12 MB',
    fileSizeBytes: 43120000,
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    type: 'FULL_SNAPSHOT',
    status: 'VERIFIED',
    location: 's3://kibo360-encrypted-backups-mumbai/snapshots/2026-11-05/',
    storageLocation: 's3://kibo360-encrypted-backups-mumbai/snapshots/2026-11-05/',
    verifiedIntegrity: true,
  },
];

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_001',
    type: 'REORDER_ALERT',
    title: 'Safety Stock Breach: Comprehensive Chemistry - Class 12',
    message: 'Available stock is 230 copies, which is below safety reorder level 500. Recommended order: 5,000 copies.',
    severity: 'CRITICAL',
    isRead: false,
    actionUrl: '/inventory',
    createdAt: '2 hours ago',
  },
  {
    id: 'notif_002',
    type: 'OVERDUE_INVOICE',
    title: 'Overdue Receivable: Eastern Book Agencies Kolkata',
    message: 'Invoice #INV/2026/0890 for INR 4,50,000 is 14 days past due. Credit limit is INR 5,00,000.',
    severity: 'WARNING',
    isRead: false,
    actionUrl: '/reports',
    createdAt: '5 hours ago',
  },
  {
    id: 'notif_003',
    type: 'APPROVAL_PENDING',
    title: 'Manager Approval Required: Expense Voucher EXP/2026/0004',
    message: 'International Book Fair Exhibition voucher of INR 2,06,500 requires Chief Financial Controller sign-off.',
    severity: 'WARNING',
    isRead: false,
    actionUrl: '/expenses',
    createdAt: '8 hours ago',
  },
  {
    id: 'notif_004',
    type: 'PAYMENT_CONFIRMATION',
    title: 'Customer Receipt Reconciled: Oxford Book Store',
    message: 'Receipt #REC/2026/0112 for INR 3,42,500 settled via HDFC Bank and posted to Trade Debtors.',
    severity: 'SUCCESS',
    isRead: true,
    actionUrl: '/banking',
    createdAt: '1 day ago',
  },
];

const DEFAULT_WORKFLOW_RULES: WorkflowRuleRecord[] = [
  {
    id: 'rule_overdue_reminders',
    name: 'Automated Overdue Invoice Reminders',
    trigger: 'INVOICE_DUE_DATE_PASSED',
    description: 'Dispatches WhatsApp & Email reminders to customers when payment terms expire.',
    channels: ['WHATSAPP', 'EMAIL'],
    schedule: 'Daily at 09:30 AM',
    isActive: true,
    lastRun: 'Today, 09:30 AM (2 dispatched)',
  },
  {
    id: 'rule_reorder_alerts',
    name: 'Proactive Inventory Reorder Alert',
    trigger: 'AVAILABLE_STOCK_LTE_REORDER_LEVEL',
    description: 'Triggers In-App and Email alerts to warehouse supervisors when stock falls below safety levels.',
    channels: ['IN_APP', 'EMAIL'],
    schedule: 'Real-time on stock dispatch',
    isActive: true,
    lastRun: '2 hours ago (1 triggered)',
  },
  {
    id: 'rule_royalty_statements',
    name: 'Quarterly Author Royalty Dispatch',
    trigger: 'QUARTER_END_DATE_REACHED',
    description: 'Emails digital Royalty Statements & Section 194J TDS certificates to certified authors.',
    channels: ['EMAIL'],
    schedule: 'Quarterly on 1st of month',
    isActive: true,
    lastRun: '01 Oct 2026 (48 emails sent)',
  },
];

// LocalStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to key ${key}`, err);
  }
}

// ==========================================
// 1. COMPANY PROFILE API
// ==========================================
export function getStoredCompanyProfile(): CompanyProfile {
  return getFromStorage<CompanyProfile>(STORAGE_KEYS.PROFILE, DEFAULT_COMPANY_PROFILE);
}

export function saveCompanyProfile(profile: Partial<CompanyProfile>): CompanyProfile {
  const current = getStoredCompanyProfile();
  const updated = { ...current, ...profile };
  setToStorage(STORAGE_KEYS.PROFILE, updated);
  logAuditAction({
    action: 'COMPANY_PROFILE_UPDATED',
    entity: 'company_profile',
    severity: 'NOTICE',
    description: `Updated corporate profile for ${updated.companyName} (GSTIN: ${updated.gstin}).`,
    oldVal: current,
    newVal: updated,
  });
  return updated;
}

// ==========================================
// 2. BRANCHES API
// ==========================================
export function getStoredBranches(): BranchRecord[] {
  return getFromStorage<BranchRecord[]>(STORAGE_KEYS.BRANCHES, DEFAULT_BRANCHES);
}

export function saveBranch(branch: Partial<BranchRecord>): BranchRecord {
  const current = getStoredBranches();
  const id = branch.id || 'brn_' + Date.now();
  const finalBranch: BranchRecord = {
    id,
    name: branch.name || 'New Distribution Branch',
    code: (branch.code || 'BRN').toUpperCase(),
    isMain: branch.isMain ?? false,
    city: branch.city || 'Central City',
    state: branch.state || 'Delhi',
    gstin: branch.gstin || '07AAAAA0000A1Z5',
    manager: branch.manager || 'Branch Executive',
    prefix: branch.prefix || `${(branch.code || 'BRN').toUpperCase()}-INV`,
    transfers: branch.transfers ?? true,
  };

  const existingIndex = current.findIndex((b) => b.id === id);
  let updatedList: BranchRecord[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalBranch;
  } else {
    updatedList = [...current, finalBranch];
  }

  setToStorage(STORAGE_KEYS.BRANCHES, updatedList);
  logAuditAction({
    action: existingIndex >= 0 ? 'BRANCH_UPDATED' : 'BRANCH_CREATED',
    entity: 'branches',
    severity: 'NOTICE',
    description: `Registered / updated branch depot "${finalBranch.name}" [${finalBranch.code}].`,
    oldVal: existingIndex >= 0 ? current[existingIndex] : null,
    newVal: finalBranch,
  });
  return finalBranch;
}

export function deleteBranch(id: string): boolean {
  const current = getStoredBranches();
  const target = current.find((b) => b.id === id);
  if (target?.isMain) {
    return false; // Cannot delete headquarters
  }
  const updated = current.filter((b) => b.id !== id);
  setToStorage(STORAGE_KEYS.BRANCHES, updated);
  logAuditAction({
    action: 'BRANCH_DELETED',
    entity: 'branches',
    severity: 'WARNING',
    description: `Deleted branch depot "${target?.name}".`,
    oldVal: target,
    newVal: null,
  });
  return true;
}

// ==========================================
// 3. FISCAL YEARS & PERIOD LOCKS API
// ==========================================
export function getStoredFiscalYears(): FiscalYearRecord[] {
  return getFromStorage<FiscalYearRecord[]>(STORAGE_KEYS.FISCAL_YEARS, DEFAULT_FISCAL_YEARS);
}

export function saveFiscalYear(fy: Partial<FiscalYearRecord>): FiscalYearRecord {
  const current = getStoredFiscalYears();
  const id = fy.id || 'fy_' + Date.now();
  const finalFY: FiscalYearRecord = {
    id,
    name: fy.name || 'FY 2027-2028',
    period: fy.period || '01 Apr 2027 – 31 Mar 2028',
    status: fy.status || 'Upcoming Period',
    isClosed: fy.isClosed ?? false,
    lockedMonths: fy.lockedMonths || [],
  };

  const updated = [finalFY, ...current];
  setToStorage(STORAGE_KEYS.FISCAL_YEARS, updated);
  logAuditAction({
    action: 'FISCAL_YEAR_CREATED',
    entity: 'fiscal_years',
    severity: 'NOTICE',
    description: `Created new fiscal year period "${finalFY.name}".`,
    oldVal: null,
    newVal: finalFY,
  });
  return finalFY;
}

export function toggleMonthLock(fyId: string, monthName: string): FiscalYearRecord | null {
  const current = getStoredFiscalYears();
  const index = current.findIndex((fy) => fy.id === fyId);
  if (index < 0) return null;

  const targetFY = current[index];
  let isNowLocked = false;
  const updatedMonths = targetFY.lockedMonths.map((m) => {
    if (m.month === monthName) {
      isNowLocked = !m.isLocked;
      return { ...m, isLocked: !m.isLocked };
    }
    return m;
  });

  const updatedFY = { ...targetFY, lockedMonths: updatedMonths };
  current[index] = updatedFY;
  setToStorage(STORAGE_KEYS.FISCAL_YEARS, current);

  logAuditAction({
    action: isNowLocked ? 'PERIOD_LOCKED' : 'PERIOD_UNLOCKED',
    entity: 'accounting_periods',
    severity: 'NOTICE',
    description: `${isNowLocked ? 'Locked' : 'Unlocked'} accounting period "${monthName}" in ${targetFY.name}.`,
    oldVal: { month: monthName, isLocked: !isNowLocked },
    newVal: { month: monthName, isLocked: isNowLocked },
  });

  return updatedFY;
}

// ==========================================
// 4. SECURITY AUDIT & BACKUPS API
// ==========================================
export function getStoredAuditLogs(): AuditLogRecord[] {
  return getFromStorage<AuditLogRecord[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
}

export function logAuditAction(data: {
  action: string;
  entity: string;
  severity: AuditLogRecord['severity'];
  description: string;
  user?: string;
  role?: string;
  oldVal?: any;
  newVal?: any;
}): AuditLogRecord {
  const current = getStoredAuditLogs();
  const id = 'aud_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const newLog: AuditLogRecord = {
    id,
    timestamp,
    user: data.user || 'admin@kibo360.com',
    role: data.role || 'SUPER_ADMIN',
    ip: '127.0.0.1',
    action: data.action,
    entity: data.entity,
    severity: data.severity,
    description: data.description,
    oldVal: data.oldVal || null,
    newVal: data.newVal || null,
  };

  const updated = [newLog, ...current];
  setToStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
  return newLog;
}

export function getStoredBackups(): BackupRecord[] {
  return getFromStorage<BackupRecord[]>(STORAGE_KEYS.BACKUPS, DEFAULT_BACKUPS);
}

export function triggerDatabaseBackup(backupType: string = 'FULL_SNAPSHOT', retentionDays: number = 30): BackupRecord {
  const current = getStoredBackups();
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').substring(0, 14);
  const timestamp = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const backup: BackupRecord = {
    id: 'bkp_snap_' + Date.now(),
    filename: `kibo360_db_snapshot_${dateStr}.sql.gz`,
    backupName: `kibo360_db_snapshot_${dateStr}.sql.gz`,
    timestamp,
    size: '49.15 MB',
    fileSizeBytes: 49150000,
    sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    type: backupType,
    status: 'VERIFIED',
    location: 's3://kibo360-encrypted-backups-mumbai/snapshots/on-demand/',
    storageLocation: 's3://kibo360-encrypted-backups-mumbai/snapshots/on-demand/',
    verifiedIntegrity: true,
  };

  const updated = [backup, ...current];
  setToStorage(STORAGE_KEYS.BACKUPS, updated);
  logAuditAction({
    action: 'BACKUP_CREATED',
    entity: 'database_backups',
    severity: 'INFO',
    description: `Created manual encrypted database snapshot ${backup.filename} (${backupType}, ${retentionDays} days retention).`,
    oldVal: null,
    newVal: backup,
  });
  return backup;
}

export function executePitrRestore(targetTime: string, reason: string): { success: boolean; message: string } {
  const msg = `Point-in-Time recovery successfully simulated to timestamp ${targetTime}. Reason: "${reason}". Database verified clean with zero data corruption.`;
  logAuditAction({
    action: 'PITR_RECOVERY_EXECUTED',
    entity: 'database_recovery',
    severity: 'CRITICAL',
    description: msg,
    oldVal: { systemState: 'LIVE' },
    newVal: { targetRecoveryTime: targetTime, status: 'RECOVERED' },
  });
  return { success: true, message: msg };
}

// ==========================================
// 5. NOTIFICATIONS & WORKFLOW RULES API
// ==========================================
export function getStoredNotifications(): InAppNotification[] {
  return getFromStorage<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
}

export function markNotificationRead(id: string): InAppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
}

export function markAllNotificationsRead(): InAppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
}

export function createNotification(notif: Partial<InAppNotification>): InAppNotification {
  const current = getStoredNotifications();
  const id = notif.id || 'notif_' + Date.now();
  const newNotif: InAppNotification = {
    id,
    type: notif.type || 'SYSTEM_ALERT',
    title: notif.title || 'Notification Alert',
    message: notif.message || '',
    severity: notif.severity || 'INFO',
    isRead: false,
    actionUrl: notif.actionUrl || '/',
    createdAt: 'Just now',
  };

  const updated = [newNotif, ...current];
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return newNotif;
}

export function getStoredWorkflowRules(): WorkflowRuleRecord[] {
  return getFromStorage<WorkflowRuleRecord[]>(STORAGE_KEYS.WORKFLOW_RULES, DEFAULT_WORKFLOW_RULES);
}

export function toggleWorkflowRule(id: string): WorkflowRuleRecord | null {
  const current = getStoredWorkflowRules();
  const index = current.findIndex((r) => r.id === id);
  if (index < 0) return null;

  const target = current[index];
  const updatedRule = { ...target, isActive: !target.isActive };
  current[index] = updatedRule;
  setToStorage(STORAGE_KEYS.WORKFLOW_RULES, current);
  logAuditAction({
    action: updatedRule.isActive ? 'WORKFLOW_ACTIVATED' : 'WORKFLOW_PAUSED',
    entity: 'workflow_rules',
    severity: 'NOTICE',
    description: `${updatedRule.isActive ? 'Activated' : 'Paused'} automated workflow rule "${updatedRule.name}".`,
    oldVal: { isActive: target.isActive },
    newVal: { isActive: updatedRule.isActive },
  });
  return updatedRule;
}

export function executeWorkflowRule(id: string): { rule: WorkflowRuleRecord; message: string } | null {
  const current = getStoredWorkflowRules();
  const index = current.findIndex((r) => r.id === id);
  if (index < 0) return null;

  const rule = current[index];
  const nowStr = 'Just now (executed test run)';
  const updatedRule = { ...rule, lastRun: nowStr };
  current[index] = updatedRule;
  setToStorage(STORAGE_KEYS.WORKFLOW_RULES, current);

  logAuditAction({
    action: 'WORKFLOW_TEST_DISPATCHED',
    entity: 'workflow_rules',
    severity: 'INFO',
    description: `Dispatched test run for workflow rule "${rule.name}" via channels [${rule.channels.join(', ')}].`,
    oldVal: null,
    newVal: { executedAt: new Date().toISOString() },
  });

  return { rule: updatedRule, message: `Workflow rule "${rule.name}" test triggered successfully!` };
}
