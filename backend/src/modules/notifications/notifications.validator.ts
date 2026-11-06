import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.enum([
    'LOW_STOCK_ALERT',
    'REORDER_ALERT',
    'PENDING_PO',
    'CUSTOMER_PAYMENT_REMINDER',
    'SUPPLIER_PAYMENT_REMINDER',
    'OVERDUE_INVOICE',
    'ROYALTY_PAYMENT_REMINDER',
    'APPROVAL_PENDING',
    'BANK_RECON_REMINDER',
    'FY_CLOSING_REMINDER',
    'PAYMENT_CONFIRMATION',
    'DAILY_SALES_SUMMARY',
    'SYSTEM_ALERT',
  ]),
  title: z.string().min(2),
  message: z.string().min(2),
  severity: z.enum(['INFO', 'SUCCESS', 'WARNING', 'CRITICAL']).default('INFO'),
  userId: z.string().optional(),
  recipientRole: z.string().optional(),
  data: z.record(z.any()).optional(),
  actionUrl: z.string().optional(),
});

export const sendNotificationSchema = z.object({
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP']),
  recipient: z.string().min(1), // email, phone number, or userId
  type: z.enum([
    'LOW_STOCK_ALERT',
    'REORDER_ALERT',
    'PENDING_PO',
    'CUSTOMER_PAYMENT_REMINDER',
    'SUPPLIER_PAYMENT_REMINDER',
    'OVERDUE_INVOICE',
    'ROYALTY_PAYMENT_REMINDER',
    'APPROVAL_PENDING',
    'BANK_RECON_REMINDER',
    'FY_CLOSING_REMINDER',
    'PAYMENT_CONFIRMATION',
    'DAILY_SALES_SUMMARY',
    'SYSTEM_ALERT',
  ]),
  subject: z.string().optional(),
  content: z.string().optional(),
  templateCode: z.string().optional(),
  variables: z.record(z.any()).optional(),
  idempotencyKey: z.string().optional(),
});

export const updateWorkflowRuleSchema = z.object({
  isActive: z.boolean().optional(),
  channels: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'])).optional(),
  targetRoles: z.array(z.string()).optional(),
});

export const executeWebhookSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'WHATSAPP_CLOUD', 'SHOPIFY']),
  event: z.string(),
  signature: z.string().optional(),
  payload: z.record(z.any()),
});

export const generateReceiptSchema = z.object({
  invoiceNumber: z.string(),
  customerName: z.string(),
  customerGstin: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      isbn: z.string().optional(),
      quantity: z.number().positive(),
      rate: z.number().positive(),
      amount: z.number().positive(),
    })
  ),
  subtotal: z.number().positive(),
  taxAmount: z.number().nonnegative(),
  grandTotal: z.number().positive(),
  paymentMode: z.string(),
  cashierName: z.string(),
  date: z.string().optional(),
  width: z.enum(['58mm', '80mm']).default('80mm'),
});

// Backward compatibility schema
export const createNotificationsSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional(),
  status: z.string().default('ACTIVE'),
  description: z.string().optional(),
});
