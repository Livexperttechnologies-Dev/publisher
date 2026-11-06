import { z } from 'zod';

export const createRequisitionSchema = z.object({
  department: z.string().default('Editorial & Production'),
  requiredDate: z.string().or(z.date()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  requestedBy: z.string().min(1, 'Requester name is required'),
  remarks: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        title: z.string().min(1, 'Item title is required'),
        isbn: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        estimatedRate: z.number().nonnegative().default(0),
      })
    )
    .min(1, 'At least one line item is required'),
});

export const approveRequisitionSchema = z.object({
  approved: z.boolean(),
  remarks: z.string().optional(),
});

export const createQuotationSchema = z.object({
  quotationNo: z.string().min(1, 'Quotation number is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  requisitionId: z.string().optional(),
  validUntil: z.string().or(z.date()),
  paymentTerms: z.string().default('Net 45'),
  deliveryTerms: z.string().default('Ex-Factory'),
  leadTimeDays: z.number().nonnegative().default(14),
  additionalCharges: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        description: z.string().min(1, 'Item description is required'),
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().positive('Quantity must be positive'),
        rate: z.number().positive('Rate must be positive'),
        discountPercent: z.number().min(0).max(100).default(0),
        taxPercent: z.number().min(0).max(28).default(0),
      })
    )
    .min(1, 'At least one item is required'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierGstin: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierStateCode: z.string().optional(),
  expectedDelivery: z.string().or(z.date()),
  quotationRef: z.string().optional(),
  requisitionRef: z.string().optional(),
  freightCharges: z.number().nonnegative().default(0),
  additionalCharges: z.number().nonnegative().default(0),
  paymentTerms: z.string().default('Net 45'),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        bookTitle: z.string().min(1, 'Book title is required'),
        isbn: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unitRate: z.number().positive('Unit rate must be positive'),
        discountPercent: z.number().min(0).max(100).default(0),
        taxPercent: z.number().min(0).max(28).default(0),
      })
    )
    .min(1, 'At least one line item is required'),
});

export const createGRNSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase Order ID is required'),
  receiptDate: z.string().or(z.date()).optional(),
  warehouseId: z.string().optional(),
  warehouseName: z.string().default('Central Godown / Main Depot'),
  deliveryChallanNo: z.string().optional(),
  transporterName: z.string().optional(),
  lrNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        bookTitle: z.string().min(1, 'Book title is required'),
        isbn: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        receivedQuantity: z.number().nonnegative('Received quantity cannot be negative'),
        rejectedQuantity: z.number().nonnegative().default(0),
        damagedQuantity: z.number().nonnegative().default(0),
        warehouseRack: z.string().optional(),
        rejectionReason: z.string().optional(),
      })
    )
    .min(1, 'At least one receipt line item is required'),
});

export const createPurchaseInvoiceSchema = z.object({
  supplierInvoiceNo: z.string().min(1, 'Supplier Bill / Invoice number is required'),
  invoiceDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  purchaseOrderId: z.string().optional(),
  goodsReceiptNoteId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  supplierGstin: z.string().optional(),
  supplierStateCode: z.string().optional(),
  placeOfSupply: z.string().optional(),
  freightAmount: z.number().nonnegative().default(0),
  paymentTerms: z.string().default('Net 45'),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        description: z.string().min(1, 'Description is required'),
        sku: z.string().min(1, 'SKU is required'),
        hsnSacCode: z.string().default('4901'),
        quantity: z.number().positive('Quantity must be positive'),
        unitRate: z.number().positive('Unit rate must be positive'),
        discountAmount: z.number().nonnegative().default(0),
        taxRate: z.number().min(0).max(28).default(0),
      })
    )
    .min(1, 'At least one invoice line item is required'),
});

export const createPurchaseReturnSchema = z.object({
  purchaseInvoiceId: z.string().min(1, 'Purchase Invoice ID is required'),
  returnReason: z.string().min(1, 'Return reason is required'),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        title: z.string().min(1, 'Title is required'),
        returnedQty: z.number().positive('Returned quantity must be positive'),
        unitRate: z.number().positive('Unit rate must be positive'),
        taxRate: z.number().min(0).max(28).default(0),
      })
    )
    .min(1, 'At least one return item is required'),
});

export const createSupplierPaymentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  paymentDate: z.string().or(z.date()).optional(),
  paymentMode: z.enum(['BANK_TRANSFER_NEFT_RTGS', 'CHEQUE', 'CASH', 'UPI']).default('BANK_TRANSFER_NEFT_RTGS'),
  bankLedgerId: z.string().min(1, 'Bank or Cash Ledger is required'),
  referenceNumber: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  discountReceived: z.number().nonnegative().default(0),
  tdsDeducted: z.number().nonnegative().default(0),
  invoicesSettled: z
    .array(
      z.object({
        invoiceId: z.string().min(1, 'Invoice ID is required'),
        invoiceNumber: z.string(),
        allocatedAmount: z.number().positive('Allocated amount must be positive'),
      })
    )
    .min(1, 'At least one invoice must be settled'),
  notes: z.string().optional(),
});
