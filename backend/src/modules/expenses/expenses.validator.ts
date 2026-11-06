import { z } from 'zod';

export const createExpenseCategorySchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  defaultLedgerId: z.string().default('led_admin_exp'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const createExpenseVoucherSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  taxAmount: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'CHEQUE']).default('BANK_TRANSFER'),
  paymentLedgerId: z.string().optional(),
  vendorName: z.string().optional(),
  vendorAccountId: z.string().optional(),
  branchId: z.string().optional(),
  branchName: z.string().optional(),
  department: z.string().default('Administration'),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  approvalThreshold: z.number().optional().default(50000),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string().optional(),
  })).optional(),
});

export const approveExpenseVoucherSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const createEmployeeReimbursementSchema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  department: z.string().default('Administration'),
  purpose: z.string().min(3),
  amount: z.number().positive(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string().optional(),
  })).optional(),
});

export const approveEmployeeReimbursementSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const payEmployeeReimbursementSchema = z.object({
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'CHEQUE']).default('BANK_TRANSFER'),
  paymentLedgerId: z.string().default('led_bank_hdfc'),
  notes: z.string().optional(),
});

export const createRecurringExpenseSchema = z.object({
  title: z.string().min(2),
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).default('MONTHLY'),
  startDate: z.string().optional(),
  vendorName: z.string().optional(),
  department: z.string().optional().default('Administration'),
  branchId: z.string().optional(),
  autoPost: z.boolean().default(true),
});

export const createFixedAssetSchema = z.object({
  assetName: z.string().min(2),
  category: z.enum(['PLANT_AND_MACHINERY', 'OFFICE_EQUIPMENT', 'FURNITURE', 'COMPUTERS', 'VEHICLES']),
  purchaseDate: z.string().optional(),
  purchaseValue: z.number().positive(),
  salvageValue: z.number().nonnegative().default(0),
  usefulLifeYears: z.number().int().positive().default(5),
  depreciationMethod: z.enum(['SLM', 'WDV']).default('SLM'),
  depreciationRate: z.number().positive().default(10),
  location: z.string().min(2),
  branchId: z.string().optional(),
  branchName: z.string().optional(),
});

export const transferFixedAssetSchema = z.object({
  newLocation: z.string().min(2),
  newBranchId: z.string().optional(),
  newBranchName: z.string().optional(),
  transferReason: z.string().optional(),
});

export const calculateDepreciationSchema = z.object({
  assetId: z.string().min(1),
  financialYear: z.string().default('2026-2027'),
  periodName: z.string().default('Annual FY 2026-27'),
});

export const disposeFixedAssetSchema = z.object({
  disposalDate: z.string().optional(),
  disposalType: z.enum(['SALE', 'SCRAP', 'WRITE_OFF']).default('SALE'),
  realizedAmount: z.number().nonnegative().default(0),
  buyerName: z.string().optional(),
  paymentLedgerId: z.string().default('led_bank_hdfc'),
  notes: z.string().optional(),
});

export const createBudgetPlanSchema = z.object({
  financialYear: z.string().default('2026-2027'),
  title: z.string().min(2),
  budgetType: z.enum(['EXPENSE', 'REVENUE', 'COMPREHENSIVE']).default('EXPENSE'),
  department: z.string().min(2),
  branchId: z.string().optional(),
  totalAllocatedExpense: z.number().nonnegative().default(0),
  totalAllocatedRevenue: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export const updateBudgetPlanSchema = z.object({
  totalAllocatedExpense: z.number().nonnegative().optional(),
  totalAllocatedRevenue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REVISED']).optional(),
});
