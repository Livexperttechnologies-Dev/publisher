export interface ExecutiveDashboardKPIs {
  companyId: string;
  financialYear: string;
  asOfDate: string;
  branchId?: string;
  totalRevenue: number;
  totalPurchases: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  totalExpenses: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
  bankBalance: number;
  totalLiquidFunds: number;
  inventoryValuation: number;
  totalBooksInStock: number;
  salesReturnsValue: number;
  outstandingRoyalty: number;
  monthlyRevenueTrend: { month: string; revenue: number; purchases: number }[];
  channelDistribution: { channel: string; percentage: number; amount: number }[];
}

export interface CashFlowActivityItem {
  particulars: string;
  amount: number;
  isPositive: boolean;
}

export interface CashFlowStatementReport {
  companyId: string;
  financialYear: string;
  period: string;
  operatingActivities: CashFlowActivityItem[];
  netCashFromOperations: number;
  investingActivities: CashFlowActivityItem[];
  netCashFromInvesting: number;
  financingActivities: CashFlowActivityItem[];
  netCashFromFinancing: number;
  netChangeInCash: number;
  openingCashAndBank: number;
  closingCashAndBank: number;
}

export interface AgeingBucketItem {
  partyId: string;
  partyName: string;
  totalOutstanding: number;
  bucket0to30: number;
  bucket31to60: number;
  bucket61to90: number;
  bucketOver90: number;
  creditLimit: number;
  status: 'CURRENT' | 'ATTENTION' | 'OVERDUE' | 'CRITICAL';
}

export interface PartyAgeingReport {
  companyId: string;
  asOfDate: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  totalOutstanding: number;
  totalBucket0to30: number;
  totalBucket31to60: number;
  totalBucket61to90: number;
  totalBucketOver90: number;
  parties: AgeingBucketItem[];
}

export interface BookProfitabilityItem {
  bookId: string;
  isbn: string;
  title: string;
  edition: string;
  authorName: string;
  copiesSold: number;
  grossRevenue: number;
  productionCost: number;
  royaltyExpense: number;
  netProfit: number;
  marginPercentage: number;
}

export interface AuthorSalesRoyaltyItem {
  authorId: string;
  authorName: string;
  titlesCount: number;
  totalCopiesSold: number;
  grossSalesValue: number;
  earnedRoyalty: number;
  advancesRecovered: number;
  netPayable: number;
}

export interface ProductionCostingMISItem {
  projectId: string;
  title: string;
  plannedCopies: number;
  actualCopies: number;
  budgetedCost: number;
  actualCost: number;
  paperCost: number;
  printingCost: number;
  bindingCost: number;
  varianceAmount: number;
  costPerCopy: number;
}

export interface StockAgeingMISItem {
  bookId: string;
  isbn: string;
  title: string;
  warehouseName: string;
  quantity: number;
  unitValue: number;
  totalValuation: number;
  ageDays: number;
  category: 'FAST_MOVING' | 'NORMAL' | 'SLOW_MOVING' | 'DEAD_STOCK';
}

export interface ReorderAlertItem {
  bookId: string;
  isbn: string;
  title: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  minimumStock: number;
  recommendedOrderQuantity: number;
  status: 'REORDER_NOW' | 'LOW_STOCK' | 'CRITICAL';
}

export interface ReportsFilterQuery {
  financialYear?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
  branchId?: string;
  warehouseId?: string;
  customerId?: string;
  distributorId?: string;
  format?: 'json' | 'csv' | 'pdf';
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
