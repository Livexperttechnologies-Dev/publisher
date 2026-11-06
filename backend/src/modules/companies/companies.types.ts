export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  swiftCode?: string;
  upiId?: string;
}

export interface AccountingSettings {
  defaultSalesAccountId: string;
  defaultSalesAccountName?: string;
  defaultPurchaseAccountId: string;
  defaultPurchaseAccountName?: string;
  inventoryValuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';
  defaultReceivableAccountId: string;
  defaultReceivableAccountName?: string;
  defaultPayableAccountId: string;
  defaultPayableAccountName?: string;
  defaultCashAccountId: string;
  defaultCashAccountName?: string;
  defaultBankAccountId: string;
  defaultBankAccountName?: string;
  roundOffAccountId: string;
  roundOffAccountName?: string;
  discountAllowedAccountId: string;
  discountAllowedAccountName?: string;
  discountReceivedAccountId: string;
  discountReceivedAccountName?: string;
}

export interface CostCentreItem {
  id: string;
  code: string;
  name: string;
  category: 'PRODUCTION' | 'EDITORIAL' | 'EXHIBITION' | 'MARKETING' | 'ADMIN';
  isActive: boolean;
}

export interface ProfitCentreItem {
  id: string;
  code: string;
  name: string;
  division: 'SCHOOL_CURRICULUM' | 'HIGHER_EDUCATION' | 'TRADE_FICTION' | 'DIGITAL';
  isActive: boolean;
}

export interface PaymentTermItem {
  id: string;
  name: string;
  days: number;
  isDefault?: boolean;
}

export interface CompanyItem {
  id: string;
  name: string;
  code: string;
  legalName: string;
  businessType: string;
  taxId: string; // GSTIN
  pan: string;
  cin?: string | null;
  currency: string;
  currencySymbol: string;
  decimalPrecision: number;
  fiscalYearStart: number;
  email: string;
  phone: string;
  website?: string | null;
  registeredAddress: string;
  billingAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string | null;
  invoicePrefix: string;
  invoiceNumberingRule: {
    format: string; // e.g. "{PREFIX}/{YEAR}/{NUM}"
    padding: number;
    resetAnnually: boolean;
    nextNumber: number;
  };
  bankDetails: BankDetails;
  accountingSettings: AccountingSettings;
  costCentres: CostCentreItem[];
  profitCentres: ProfitCentreItem[];
  paymentTerms: PaymentTermItem[];
  defaultCreditLimit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchItem {
  id: string;
  companyId: string;
  name: string;
  code: string;
  isMain: boolean;
  registeredAddress: string;
  billingAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  gstin: string; // Branch state-wise GSTIN
  branchManagerId?: string | null;
  branchManagerName?: string | null;
  invoicePrefix: string; // e.g. "DEL-INV", "MUM-INV"
  interBranchTransfersEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalPeriodLock {
  month: number; // 1 - 12
  year: number;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

export interface FiscalYearItem {
  id: string;
  companyId: string;
  name: string; // "FY 2026-2027"
  startDate: string;
  endDate: string;
  accountingStartDate: string;
  isClosed: boolean;
  isCurrent: boolean;
  lockedPeriods: FiscalPeriodLock[];
  createdAt: string;
  updatedAt: string;
}
