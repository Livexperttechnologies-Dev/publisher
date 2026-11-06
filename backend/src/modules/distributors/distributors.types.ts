export type Territory =
  | 'NORTH_INDIA'
  | 'WEST_INDIA'
  | 'SOUTH_INDIA'
  | 'EAST_INDIA'
  | 'CENTRAL_INDIA'
  | 'NATIONAL';

export type DealerClassification =
  | 'TIER_1_PRIME'
  | 'TIER_2_WHOLESALE'
  | 'RETAIL_BOOKSTORE'
  | 'INSTITUTIONAL_SUPPLIER';

export type DistributionOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'ALLOCATED'
  | 'PARTIALLY_DISPATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DispatchTrackingStatus = 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'POD_RECEIVED';

export type ConsignmentStatus = 'ISSUED' | 'PARTIALLY_SETTLED' | 'RECONCILED';

export interface Distributor {
  id: string;
  companyId: string;
  distributorCode: string;
  name: string;
  tradeName?: string;
  territory: Territory;
  gstin?: string;
  pan?: string;
  registeredAddress?: string;
  city: string;
  state: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  creditLimit: number;
  currentOutstanding: number;
  creditDays: number;
  paymentTerms: string;
  commissionPercentage: number;
  standardDiscountPercentage: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dealer {
  id: string;
  companyId: string;
  distributorId?: string;
  distributorName?: string;
  dealerCode: string;
  name: string;
  tradeName?: string;
  classification: DealerClassification;
  territory: Territory;
  gstin?: string;
  pan?: string;
  address?: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email?: string;
  creditLimit: number;
  currentOutstanding: number;
  discountPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionOrderItem {
  id: string;
  orderId: string;
  bookId?: string;
  sku: string;
  bookTitle: string;
  isbn?: string;
  mrp: number;
  discountPercentage: number;
  unitRate: number;
  quantityOrdered: number;
  quantityDispatched: number;
  totalAmount: number;
}

export interface DistributionOrder {
  id: string;
  companyId: string;
  orderNumber: string; // e.g. ORD-DIST/2026/0001
  orderType: 'DISTRIBUTOR_BULK' | 'DEALER_ORDER';
  distributorId?: string;
  distributorName?: string;
  dealerId?: string;
  dealerName?: string;
  orderDate: string;
  totalMrpAmount: number;
  discountAmount: number;
  netOrderAmount: number;
  totalQuantityOrdered: number;
  totalQuantityDispatched: number;
  status: DistributionOrderStatus;
  salesInvoiceNumber?: string;
  notes?: string;
  createdById: string;
  items?: DistributionOrderItem[];
  dispatches?: DistributionDispatch[];
  createdAt: string;
  updatedAt: string;
}

export interface DistributionDispatch {
  id: string;
  companyId: string;
  orderId: string;
  orderNumber?: string;
  challanNumber: string; // e.g. DDC/2026/0001
  dispatchDate: string;
  transporterName: string;
  lrNumber: string;
  vehicleNumber?: string;
  driverPhone?: string;
  destinationCity: string;
  totalItemsCount: number;
  trackingStatus: DispatchTrackingStatus;
  receivedDate?: string;
  acceptedItemsCount: number;
  transitDamagedCount: number;
  podRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsignmentIssueItem {
  id: string;
  consignmentIssueId: string;
  bookId?: string;
  sku: string;
  bookTitle: string;
  isbn?: string;
  mrp: number;
  discountPercentage: number;
  issuedQuantity: number;
  soldQuantity: number;
  returnedQuantity: number;
  balanceQuantity: number;
  createdAt: string;
}

export interface ConsignmentIssue {
  id: string;
  companyId: string;
  issueNumber: string; // e.g. CSG/2026/0001
  distributorId: string;
  distributorName: string;
  issueDate: string;
  status: ConsignmentStatus;
  totalIssuedQuantity: number;
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  balanceOnHoldQuantity: number;
  notes?: string;
  items?: ConsignmentIssueItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DistributionCommissionSettlement {
  id: string;
  companyId: string;
  settlementNumber: string; // e.g. CMS/2026/0001
  distributorId: string;
  distributorName: string;
  periodName: string;
  secondarySalesTurnover: number;
  commissionPercentage: number;
  baseCommissionAmount: number;
  targetBonusAmount: number;
  totalCommissionPayable: number;
  status: 'CALCULATED' | 'APPROVED' | 'SETTLED';
  accountingVoucherId?: string;
  voucherNumber?: string;
  paymentVoucherNumber?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TerritorySalesPerformanceItem {
  territory: Territory;
  distributorsCount: number;
  dealersCount: number;
  totalGrossSales: number;
  totalNetSales: number;
  totalCopiesSold: number;
  targetAchievementPercentage: number;
}

export interface DistributorSalesPerformanceItem {
  distributorCode: string;
  distributorName: string;
  territory: Territory;
  creditLimit: number;
  currentOutstanding: number;
  creditUtilizationPercentage: number;
  lifetimeGrossSales: number;
  commissionEarned: number;
  status: string;
}

export interface ConsignmentStockStatementItem {
  distributorName: string;
  sku: string;
  bookTitle: string;
  mrp: number;
  issuedTotal: number;
  soldTotal: number;
  returnedTotal: number;
  currentStockOnHold: number;
  stockValuationAtMrp: number;
}

export interface DistributionProfitabilityReportItem {
  channelType: 'DISTRIBUTOR_NETWORK' | 'DEALER_DIRECT';
  channelName: string;
  territory: Territory;
  grossSalesValue: number;
  discountGiven: number;
  netRevenue: number;
  costOfGoodsSold: number;
  commissionExpense: number;
  netContributionMargin: number;
  profitabilityPercentage: number;
}

// Backward compatibility interfaces
export interface DistributorsItem {
  id: string;
  name?: string;
  code?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributorsQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
