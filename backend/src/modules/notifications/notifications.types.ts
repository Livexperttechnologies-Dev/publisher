export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export type NotificationType =
  | 'LOW_STOCK_ALERT'
  | 'REORDER_ALERT'
  | 'PENDING_PO'
  | 'CUSTOMER_PAYMENT_REMINDER'
  | 'SUPPLIER_PAYMENT_REMINDER'
  | 'OVERDUE_INVOICE'
  | 'ROYALTY_PAYMENT_REMINDER'
  | 'APPROVAL_PENDING'
  | 'BANK_RECON_REMINDER'
  | 'FY_CLOSING_REMINDER'
  | 'PAYMENT_CONFIRMATION'
  | 'DAILY_SALES_SUMMARY'
  | 'SYSTEM_ALERT';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'READ';

export interface InAppNotification {
  id: string;
  companyId: string;
  userId?: string;
  recipientRole?: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  notificationId?: string;
  idempotencyKey?: string;
  channel: NotificationChannel;
  recipient: string; // email, phone number, userId
  type: NotificationType;
  subject?: string;
  content: string;
  status: DeliveryStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subjectTemplate?: string;
  bodyTemplate: string;
  variables: string[]; // e.g. ['customerName', 'invoiceNumber', 'amount', 'dueDate']
  isActive: boolean;
  dltTemplateId?: string; // For Indian SMS compliance
  whatsappTemplateName?: string; // For Meta Cloud API
}

export interface WorkflowRule {
  id: string;
  code: string;
  name: string;
  triggerEvent: string;
  description: string;
  conditionDescription?: string;
  channels: NotificationChannel[];
  targetRoles: string[];
  templateId: string;
  isActive: boolean;
  scheduleType: 'INSTANT' | 'SCHEDULED_DAILY' | 'SCHEDULED_WEEKLY' | 'SCHEDULED_MONTHLY';
  lastRunAt?: string;
  createdAt: string;
}

export interface IntegrationCredential {
  id: string;
  provider: 'RAZORPAY' | 'STRIPE' | 'WHATSAPP_CLOUD' | 'SENDGRID' | 'MSG91' | 'SHOPIFY' | 'NIC_E_INVOICE';
  name: string;
  category: 'PAYMENT_GATEWAY' | 'MESSAGING' | 'EMAIL' | 'SMS' | 'ECOMMERCE' | 'TAX_PORTAL';
  status: 'CONNECTED' | 'DISCONNECTED' | 'SANDBOX_MODE';
  environment: 'PRODUCTION' | 'SANDBOX';
  keyId: string;
  secretMasked: string;
  webhookSecretMasked?: string;
  endpointUrl?: string;
  senderId?: string;
  lastSyncAt?: string;
}

export interface ThermalPrinterReceiptConfig {
  printerName: string;
  interfaceType: 'USB' | 'NETWORK' | 'SERIAL' | 'BLUETOOTH';
  paperWidthMm: 58 | 80;
  characterSet: string;
  headerLines: string[];
  footerLines: string[];
  cutPaper: boolean;
  openCashDrawer: boolean;
  printBarcode: boolean;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: string;
  event?: string;
  payload?: any;
  error?: string;
}

export interface ScheduledJobResult {
  jobName: string;
  executionTimestamp: string;
  itemsProcessed: number;
  notificationsDispatched: number;
  errorsCount: number;
  details: string[];
}
