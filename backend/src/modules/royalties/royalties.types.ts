export type RoyaltyCalculationMethod =
  | 'PERCENTAGE_OF_MRP'
  | 'PERCENTAGE_OF_NET_SALES'
  | 'FIXED_AMOUNT_PER_COPY'
  | 'SLAB_BASED'
  | 'EDITION_SPECIFIC';

export type PaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';

export type AgreementStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export type RoyaltyPeriodStatus = 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'SETTLED';

export type RoyaltyCalcStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'CANCELLED';

export type PaymentMethod = 'NEFT' | 'RTGS' | 'CHEQUE' | 'BANK_TRANSFER';

export interface AgreementSlab {
  id: string;
  agreementId: string;
  fromQuantity: number;
  toQuantity?: number;
  royaltyPercentage: number;
  fixedRate?: number;
}

export interface AgreementBookItem {
  id: string;
  agreementId: string;
  bookId?: string;
  bookTitle: string;
  sku: string;
  isbn?: string;
  edition: string;
  territory: 'ALL' | 'DOMESTIC' | 'INTERNATIONAL';
  specificRate?: number;
  notes?: string;
}

export interface AuthorAgreement {
  id: string;
  companyId: string;
  agreementNumber: string; // e.g. AGR/2026/0001
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPan?: string; // e.g. AABCV1234F
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  contractStartDate: string;
  contractEndDate?: string;
  calculationMethod: RoyaltyCalculationMethod;
  royaltyPercentage: number;
  fixedRatePerCopy: number;
  advanceRoyaltyAmount: number;
  advanceBalanceRemaining: number;
  minimumGuarantee: number;
  paymentFrequency: PaymentFrequency;
  status: AgreementStatus;
  documentUrl?: string;
  notes?: string;
  books?: AgreementBookItem[];
  slabs?: AgreementSlab[];
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltyAccrualPeriod {
  id: string;
  companyId: string;
  periodNumber: string; // e.g. ROY/2026/Q1
  periodName: string; // e.g. "Q1 FY26-27 (Apr-Jun 2026)"
  startDate: string;
  endDate: string;
  status: RoyaltyPeriodStatus;
  totalGrossRoyalty: number;
  totalAdvanceRecovered: number;
  totalTdsDeducted: number;
  totalNetPayable: number;
  accountingVoucherId?: string;
  voucherNumber?: string;
  approvedById?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltyCalculationItem {
  id: string;
  royaltyCalculationId: string;
  bookId?: string;
  sku: string;
  bookTitle: string;
  isbn?: string;
  mrp: number;
  netSalesValue: number;
  grossSold: number;
  returnedCount: number;
  netEligibleSold: number;
  royaltyRateDescription: string;
  calculatedRoyalty: number;
}

export interface RoyaltyCalculation {
  id: string;
  companyId: string;
  periodId: string;
  periodName?: string;
  agreementId: string;
  agreementNumber?: string;
  authorId: string;
  authorName: string;
  authorPan?: string;
  grossCopiesSold: number;
  copiesReturned: number;
  eligibleNetCopies: number;
  grossRoyaltyAmount: number;
  minimumGuaranteeTopup: number;
  advanceRecovered: number;
  tdsRate: number; // e.g. 10.0%
  tdsAmount: number;
  netPayableAmount: number;
  status: RoyaltyCalcStatus;
  accountingVoucherId?: string;
  voucherNumber?: string;
  items?: RoyaltyCalculationItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltyPaymentSettlement {
  id: string;
  companyId: string;
  calculationId: string;
  settlementNumber: string; // e.g. ROYS/2026/0001
  authorId: string;
  authorName: string;
  paymentDate: string;
  grossAmountPaid: number;
  advanceRecouped: number;
  tdsDeducted: number;
  netAmountPaid: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  bankName: string;
  referenceNumber: string; // UTR or Cheque Number
  accountingVoucherId?: string;
  voucherNumber?: string; // PV/2026/XXXX
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorRoyaltyStatement {
  statementDate: string;
  periodName: string;
  authorName: string;
  authorPan?: string;
  bankDetails: {
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
  agreementNumber: string;
  calculationMethod: string;
  bookItems: Array<{
    sku: string;
    bookTitle: string;
    isbn?: string;
    mrp: number;
    grossSold: number;
    returnedCount: number;
    netEligibleSold: number;
    royaltyFormula: string;
    earnedAmount: number;
  }>;
  summary: {
    grossRoyalty: number;
    minimumGuaranteeApplied: number;
    totalEarned: number;
    advanceRecovered: number;
    remainingAdvanceBalance: number;
    tdsRatePercent: number;
    tdsWithheld: number;
    netPayableToAuthor: number;
    status: string;
    paymentReference?: string;
    settlementDate?: string;
  };
}

export interface AuthorRoyaltySummaryItem {
  authorId: string;
  authorName: string;
  authorPan?: string;
  activeAgreementsCount: number;
  totalGrossEarned: number;
  totalAdvanceRecovered: number;
  totalTdsWithheld: number;
  totalPaid: number;
  currentPayableBalance: number;
  outstandingAdvanceBalance: number;
}

export interface BookWiseRoyaltyReportItem {
  sku: string;
  bookTitle: string;
  authorName: string;
  mrp: number;
  lifetimeGrossCopiesSold: number;
  lifetimeReturnedCopies: number;
  lifetimeNetCopies: number;
  totalRoyaltyAccrued: number;
  avgRoyaltyPerCopy: number;
}

export interface AdvanceRoyaltyLedgerItem {
  authorId: string;
  authorName: string;
  agreementNumber: string;
  initialAdvanceAmount: number;
  advanceDisbursedDate: string;
  totalRecoupedToDate: number;
  unamortizedBalance: number;
  recoveryPercentage: number;
  status: 'RECOUPING' | 'FULLY_RECOUPED';
}

// Backward compatibility interfaces
export interface RoyaltiesItem {
  id: string;
  name?: string;
  code?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltiesQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
