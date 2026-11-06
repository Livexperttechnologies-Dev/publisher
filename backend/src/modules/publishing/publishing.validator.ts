import { z } from 'zod';

export const createPublishingProjectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  subtitle: z.string().optional(),
  language: z.string().default('English'),
  edition: z.string().default('1st Edition'),
  category: z.string().default('Higher Education'),
  authorId: z.string().min(1, 'Author ID is required'),
  authorName: z.string().min(1, 'Author name is required'),
  editorId: z.string().optional(),
  editorName: z.string().optional(),
  isbnAllocated: z.string().optional(),
  targetPublicationDate: z.string().or(z.date()).optional(),
  plannedPrintRun: z.number().positive().default(3000),
  targetMrp: z.number().positive().default(495.0),
  manuscriptWordCount: z.number().optional(),
  estimatedPages: z.number().positive().default(448),
  notes: z.string().optional(),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum([
    'PROPOSAL',
    'MANUSCRIPT_SUBMITTED',
    'EDITORIAL_REVIEW',
    'TYPESETTING_PROOF',
    'PRE_PRESS',
    'PRINT_PRODUCTION',
    'PUBLISHED',
    'ARCHIVED',
  ]),
  notes: z.string().optional(),
});

export const allocateIsbnSchema = z.object({
  isbn: z.string().min(10, 'Valid 10 or 13 digit ISBN is required'),
});

export const createProductionOrderSchema = z.object({
  projectId: z.string().optional(),
  bookId: z.string().optional(),
  sku: z.string().min(1, 'Book SKU is required'),
  title: z.string().min(1, 'Title is required'),
  edition: z.string().default('1st Edition'),
  printRun: z.number().positive('Print run must be positive'),
  sheetSize: z.string().default('23x36 inches'),
  paperGsm: z.number().positive().default(70),
  paperType: z.string().default('Maplitho Natural Shade'),
  coverGsm: z.number().positive().default(300),
  coverFinishing: z.string().default('Thermal Matte Lamination + Spot UV'),
  bindingType: z.string().default('Section Sewn & Perfect Bound'),
  pagesCount: z.number().positive('Total page count is required'),
  targetCompletionDate: z.string().or(z.date()).optional(),
  pressVendorId: z.string().optional(),
  pressVendorName: z.string().optional(),
  bindingVendorId: z.string().optional(),
  bindingVendorName: z.string().optional(),
  notes: z.string().optional(),
});

export const issueMaterialToProductionSchema = z.object({
  productionOrderId: z.string().min(1, 'Production Order ID is required'),
  materialType: z.enum(['PAPER_REAMS', 'COVER_ART_BOARD', 'CTP_PLATES', 'LAMINATION_FILM']).default('PAPER_REAMS'),
  quantityIssued: z.number().positive('Issued quantity must be positive'),
  unitCost: z.number().positive('Material unit cost is required'),
  warehouseId: z.string().default('wh_central_press_depot'),
  notes: z.string().optional(),
});

export const createVendorJobOrderSchema = z.object({
  productionOrderId: z.string().min(1, 'Production Order ID is required'),
  jobType: z.enum(['PRINTING', 'BINDING', 'COVER_FINISHING', 'PACKAGING']),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  vendorGstin: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  materialIssuedNotes: z.string().optional(),
  jobWorkRate: z.number().positive('Job work rate is required'),
  totalJobCharges: z.number().positive('Total job work charges is required'),
});

export const receiveJobWorkSchema = z.object({
  jobOrderId: z.string().min(1, 'Job Order ID is required'),
  itemsDeliveredCount: z.number().positive('Delivered copies count is required'),
  vendorInvoiceNumber: z.string().min(1, 'Vendor Bill Number is required'),
  actualMaterialConsumed: z.number().nonnegative().optional(),
  spoilageWastageCount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createQualityInspectionSchema = z.object({
  productionOrderId: z.string().min(1, 'Production Order ID is required'),
  inspectedBy: z.string().min(1, 'Inspector name or ID is required'),
  sampleSize: z.number().positive().default(50),
  approvedCopies: z.number().nonnegative('Approved copies must be non-negative'),
  rejectedCopies: z.number().nonnegative().default(0),
  quarantineCopies: z.number().nonnegative().default(0),
  printRegistrationPass: z.boolean().default(true),
  inkDensityPass: z.boolean().default(true),
  bindingAdhesionPass: z.boolean().default(true),
  pageSequencePass: z.boolean().default(true),
  trimmingPass: z.boolean().default(true),
  remarks: z.string().optional(),
});

export const completeProductionOrderSchema = z.object({
  productionOrderId: z.string().min(1, 'Production Order ID is required'),
  destinationWarehouseId: z.string().default('wh_central_press_depot'),
  destinationRackCode: z.string().default('RACK-A1-01'),
  paperCost: z.number().nonnegative(),
  printingCost: z.number().nonnegative(),
  plateCost: z.number().nonnegative(),
  bindingCost: z.number().nonnegative(),
  coverCost: z.number().nonnegative(),
  packagingCost: z.number().nonnegative().default(0),
  labourCost: z.number().nonnegative().default(0),
  freightCost: z.number().nonnegative().default(0),
  overheadCost: z.number().nonnegative().default(0),
  goodCopiesProduced: z.number().positive('Good copies produced must be positive'),
  notes: z.string().optional(),
});
