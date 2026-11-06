export type PublishingProjectStatus =
  | 'PROPOSAL'
  | 'MANUSCRIPT_SUBMITTED'
  | 'EDITORIAL_REVIEW'
  | 'TYPESETTING_PROOF'
  | 'PRE_PRESS'
  | 'PRINT_PRODUCTION'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ProductionOrderStatus =
  | 'PLANNING'
  | 'MATERIAL_ISSUED'
  | 'PRINTING_IN_PROGRESS'
  | 'BINDING_IN_PROGRESS'
  | 'QA_INSPECTION'
  | 'COMPLETED'
  | 'CANCELLED';

export type JobWorkType =
  | 'PRINTING'
  | 'BINDING'
  | 'COVER_FINISHING'
  | 'PACKAGING';

export type JobOrderStatus =
  | 'DRAFT'
  | 'MATERIAL_ISSUED'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'BILLED'
  | 'CANCELLED';

export type QualityInspectionStatus =
  | 'PASSED'
  | 'PASSED_WITH_CONCESSION'
  | 'REJECTED';

export interface PublishingProject {
  id: string;
  companyId: string;
  projectNumber: string; // e.g. PRJ/2026/0001
  title: string;
  subtitle?: string;
  language: string;
  edition: string;
  category: string;
  status: PublishingProjectStatus;
  authorId: string;
  authorName: string;
  editorId?: string;
  editorName?: string;
  isbnAllocated?: string;
  targetPublicationDate?: string;
  plannedPrintRun: number;
  targetMrp: number;
  manuscriptWordCount?: number;
  estimatedPages: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionCostSheet {
  id: string;
  productionOrderId: string;
  paperCost: number;
  printingCost: number;
  plateCost: number;
  bindingCost: number;
  coverCost: number;
  packagingCost: number;
  labourCost: number;
  freightCost: number;
  overheadCost: number;
  totalCost: number;
  goodCopiesProduced: number;
  perCopyCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorJobOrder {
  id: string;
  companyId: string;
  productionOrderId: string;
  jobOrderNumber: string; // e.g. JOB/2026/0001
  jobType: JobWorkType;
  vendorId: string;
  vendorName: string;
  vendorGstin?: string;
  orderDate: string;
  dueDate?: string;
  status: JobOrderStatus;
  itemsDeliveredCount: number;
  materialIssuedNotes?: string;
  jobWorkRate: number;
  totalJobCharges: number;
  vendorInvoiceNumber?: string;
  accountingVoucherId?: string;
  voucherNumber?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityInspection {
  id: string;
  productionOrderId: string;
  inspectionNumber: string; // e.g. QA/2026/0001
  inspectionDate: string;
  inspectedBy: string;
  sampleSize: number;
  approvedCopies: number;
  rejectedCopies: number;
  quarantineCopies: number;
  printRegistrationPass: boolean;
  inkDensityPass: boolean;
  bindingAdhesionPass: boolean;
  pageSequencePass: boolean;
  trimmingPass: boolean;
  overallStatus: QualityInspectionStatus;
  remarks?: string;
  createdAt: string;
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  projectId?: string;
  orderNumber: string; // e.g. PROD/2026/0001
  bookId?: string;
  sku: string;
  title: string;
  edition: string;
  printRun: number;
  goodCopiesProduced: number;
  rejectedCopiesCount: number;
  sheetSize: string; // e.g. 23x36 inches
  paperGsm: number; // e.g. 70 GSM
  paperType: string; // e.g. Maplitho Natural Shade
  coverGsm: number; // e.g. 300 GSM Art Card
  coverFinishing: string; // e.g. Thermal Matte Lamination + Spot UV
  bindingType: string; // e.g. Section Sewn & Perfect Bound
  pagesCount: number;
  formsCount: number; // pages / 16
  reamsRequired: number; // calculated paper consumption
  platesRequired: number; // CTP plates
  status: ProductionOrderStatus;
  startDate: string;
  targetCompletionDate?: string;
  completedDate?: string;
  pressVendorId?: string;
  pressVendorName?: string;
  bindingVendorId?: string;
  bindingVendorName?: string;
  totalProductionCost: number;
  perCopyCost: number;
  accountingVoucherId?: string;
  voucherNumber?: string;
  costSheet?: ProductionCostSheet;
  jobOrders?: VendorJobOrder[];
  inspections?: QualityInspection[];
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Reports & Variance DTOs
export interface ProductionStatusReportItem {
  orderNumber: string;
  title: string;
  sku: string;
  printRun: number;
  status: ProductionOrderStatus;
  startDate: string;
  targetCompletionDate?: string;
  pressVendorName?: string;
  bindingVendorName?: string;
  estCostPerCopy: number;
}

export interface MaterialConsumptionReportItem {
  orderNumber: string;
  sku: string;
  title: string;
  printRun: number;
  paperGsm: number;
  calculatedReams: number;
  actualReamsConsumed: number;
  spoilageWastageReams: number;
  wastagePercentage: number;
  platesConsumed: number;
}

export interface ProductionVarianceReportItem {
  orderNumber: string;
  sku: string;
  title: string;
  plannedCopies: number;
  actualGoodCopies: number;
  copiesVariance: number;
  budgetedPerCopyCost: number;
  actualPerCopyCost: number;
  costVariance: number;
  varianceStatus: 'FAVORABLE' | 'UNFAVORABLE' | 'ON_BUDGET';
}
