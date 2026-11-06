export interface ExpenseCategoryItem {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  defaultLedgerId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type ExpensePaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'CHEQUE';
export type ExpenseApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface ExpenseAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ExpenseVoucherItem {
  id: string;
  companyId: string;
  voucherNumber: string; // e.g. EXP/2026/0001
  categoryId: string;
  categoryName: string;
  date: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: ExpensePaymentMethod;
  paymentLedgerId?: string;
  vendorName?: string;
  vendorAccountId?: string;
  branchId?: string;
  branchName?: string;
  department: string; // Editorial, Production, Marketing, Logistics, Admin
  projectId?: string; // PRJ/2026/XXXX
  status: ExpenseApprovalStatus;
  approvalThreshold: number;
  approvedBy?: string;
  accountingVoucherNumber?: string;
  notes?: string;
  attachments?: ExpenseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type ReimbursementStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface EmployeeReimbursementItem {
  id: string;
  companyId: string;
  claimNumber: string; // e.g. CLM/2026/0001
  employeeId: string;
  employeeName: string;
  department: string;
  claimDate: string;
  purpose: string;
  amount: number;
  status: ReimbursementStatus;
  approvedBy?: string;
  approvalDate?: string;
  paidDate?: string;
  paymentMethod?: ExpensePaymentMethod;
  accountingVoucherNumber?: string;
  notes?: string;
  attachments?: ExpenseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface RecurringExpenseItem {
  id: string;
  companyId: string;
  title: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextDueDate: string;
  vendorName?: string;
  department?: string;
  branchId?: string;
  autoPost: boolean;
  status: RecurringStatus;
  lastGeneratedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetCategory = 'PLANT_AND_MACHINERY' | 'OFFICE_EQUIPMENT' | 'FURNITURE' | 'COMPUTERS' | 'VEHICLES';
export type DepreciationMethod = 'SLM' | 'WDV';
export type AssetStatus = 'ACTIVE' | 'TRANSFERRED' | 'DISPOSED' | 'WRITTEN_OFF';

export interface FixedAssetItem {
  id: string;
  companyId: string;
  assetCode: string; // e.g. AST/2026/0001
  assetName: string;
  category: AssetCategory;
  purchaseDate: string;
  purchaseValue: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  depreciationRate: number; // in percentage e.g. 15 for 15%
  accumulatedDepreciation: number;
  netBookValue: number;
  location: string;
  branchId?: string;
  branchName?: string;
  status: AssetStatus;
  disposalDate?: string;
  disposalValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDepreciationScheduleItem {
  id: string;
  companyId: string;
  assetId: string;
  assetCode?: string;
  assetName?: string;
  financialYear: string;
  periodName: string;
  depreciationDate: string;
  depreciationMethod: DepreciationMethod;
  openingBookValue: number;
  depreciationAmount: number;
  closingBookValue: number;
  accountingVoucherNumber?: string;
  createdAt: string;
}

export type AssetDisposalType = 'SALE' | 'SCRAP' | 'WRITE_OFF';

export interface AssetDisposalRecordItem {
  id: string;
  companyId: string;
  assetId: string;
  assetCode?: string;
  assetName?: string;
  disposalDate: string;
  disposalType: AssetDisposalType;
  originalCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  realizedAmount: number;
  gainLossAmount: number; // positive = gain, negative = loss
  buyerName?: string;
  paymentLedgerId?: string;
  accountingVoucherNumber?: string;
  notes?: string;
  createdAt: string;
}

export type BudgetType = 'EXPENSE' | 'REVENUE' | 'COMPREHENSIVE';
export type BudgetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISED';

export interface BudgetPlanItem {
  id: string;
  companyId: string;
  budgetCode: string; // e.g. BDG/2026/0001
  financialYear: string; // "2026-2027"
  title: string;
  budgetType: BudgetType;
  department: string;
  branchId?: string;
  branchName?: string;
  totalAllocatedExpense: number;
  totalAllocatedRevenue: number;
  actualExpenseIncurred: number;
  actualRevenueRealized: number;
  varianceAmount: number; // actual - allocated
  variancePercentage: number;
  varianceStatus: 'FAVOURABLE' | 'ADVERSE' | 'ON_TRACK';
  status: BudgetStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Reports
export interface ExpenseSummaryReport {
  companyId: string;
  financialYear: string;
  totalExpenses: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    count: number;
    percentage: number;
  }[];
  departmentBreakdown: {
    department: string;
    totalAmount: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    amount: number;
  }[];
}

export interface FixedAssetRegisterReport {
  companyId: string;
  generatedDate: string;
  totalOriginalCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  assets: {
    assetCode: string;
    assetName: string;
    category: string;
    location: string;
    purchaseDate: string;
    originalCost: number;
    depreciationMethod: string;
    accumulatedDepreciation: number;
    netBookValue: number;
    status: string;
  }[];
}

export interface BudgetVarianceReport {
  companyId: string;
  financialYear: string;
  totalBudgetedExpense: number;
  totalActualExpense: number;
  netExpenseVariance: number;
  totalBudgetedRevenue: number;
  totalActualRevenue: number;
  netRevenueVariance: number;
  departmentVariances: {
    department: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
    status: 'FAVOURABLE' | 'ADVERSE' | 'ON_TRACK';
  }[];
}

export interface DepartmentProfitabilityReport {
  companyId: string;
  financialYear: string;
  departments: {
    department: string;
    allocatedRevenue: number;
    actualRevenue: number;
    operatingExpenses: number;
    netProfit: number;
    marginPercentage: number;
  }[];
}

export interface ExpensesQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  categoryId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}
