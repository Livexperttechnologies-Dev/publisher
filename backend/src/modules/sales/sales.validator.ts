import { z } from 'zod';

export const createSalesQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  salesChannel: z
    .enum([
      'RETAIL_COUNTER_POS',
      'WHOLESALE',
      'DISTRIBUTOR',
      'DEALER',
      'INSTITUTION_SCHOOL',
      'ONLINE_ORDER',
      'DIRECT_PUBLISHER',
    ])
    .default('WHOLESALE'),
  validUntil: z.string().or(z.date()),
  paymentTerms: z.string().default('Net 30'),
  freightCharges: z.number().nonnegative().default(0),
  remarks: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        title: z.string().min(1, 'Book title is required'),
        isbn: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        mrp: z.number().positive('MRP must be positive'),
        unitRate: z.number().positive('Unit rate must be positive'),
        discountPercent: z.number().min(0).max(100).default(0),
        taxRate: z.number().min(0).max(28).default(0),
        quantity: z.number().positive('Quantity must be greater than zero'),
      })
    )
    .min(1, 'At least one line item is required'),
});

export const createSalesOrderSchema = z.object({
  quotationRef: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerGstin: z.string().optional(),
  customerStateCode: z.string().optional(),
  salesChannel: z
    .enum([
      'RETAIL_COUNTER_POS',
      'WHOLESALE',
      'DISTRIBUTOR',
      'DEALER',
      'INSTITUTION_SCHOOL',
      'ONLINE_ORDER',
      'DIRECT_PUBLISHER',
    ])
    .default('WHOLESALE'),
  orderDate: z.string().or(z.date()).optional(),
  deliveryDueDate: z.string().or(z.date()),
  paymentTerms: z.string().default('Net 30'),
  freightCharges: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        title: z.string().min(1, 'Book title is required'),
        isbn: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        mrp: z.number().positive('MRP must be positive'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unitRate: z.number().positive('Unit rate must be positive'),
        discountPercent: z.number().min(0).max(100).default(0),
        taxRate: z.number().min(0).max(28).default(0),
      })
    )
    .min(1, 'At least one line item is required'),
});

export const createDeliveryChallanSchema = z.object({
  salesOrderId: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  deliveryAddress: z.string().optional(),
  dispatchDate: z.string().or(z.date()).optional(),
  transporterName: z.string().optional(),
  lrNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  eWayBillNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        title: z.string().min(1, 'Title is required'),
        orderedQuantity: z.number().positive('Ordered quantity must be positive'),
        dispatchedQuantity: z.number().positive('Dispatched quantity must be positive'),
        warehouseRack: z.string().optional(),
      })
    )
    .min(1, 'At least one challan item is required'),
});

export const createSalesInvoiceSchema = z.object({
  salesChannel: z
    .enum([
      'RETAIL_COUNTER_POS',
      'WHOLESALE',
      'DISTRIBUTOR',
      'DEALER',
      'INSTITUTION_SCHOOL',
      'ONLINE_ORDER',
      'DIRECT_PUBLISHER',
    ])
    .default('WHOLESALE'),
  salesOrderId: z.string().optional(),
  deliveryChallanId: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerGstin: z.string().optional(),
  customerStateCode: z.string().optional(),
  placeOfSupply: z.string().default('07-Delhi'),
  invoiceDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  paymentMethod: z
    .enum([
      'CASH',
      'CARD',
      'UPI',
      'BANK_TRANSFER_NEFT_RTGS',
      'CHEQUE',
      'SPLIT_PAYMENT',
      'CUSTOMER_CREDIT',
    ])
    .default('CUSTOMER_CREDIT'),
  paymentDetails: z
    .object({
      cashAmount: z.number().nonnegative().optional(),
      cardAmount: z.number().nonnegative().optional(),
      upiAmount: z.number().nonnegative().optional(),
      cardLast4: z.string().optional(),
      upiRef: z.string().optional(),
    })
    .optional(),
  freightAmount: z.number().nonnegative().default(0),
  isPosCounterSale: z.boolean().default(false),
  cashierName: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        bookId: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        barcode: z.string().optional(),
        title: z.string().min(1, 'Title is required'),
        hsnSacCode: z.string().default('4901'),
        mrp: z.number().positive('MRP must be positive'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unitRate: z.number().positive('Unit rate must be positive'),
        discountPercent: z.number().min(0).max(100).default(0),
        taxRate: z.number().min(0).max(28).default(0),
        purchaseCost: z.number().nonnegative().optional(),
      })
    )
    .min(1, 'At least one line item is required'),
});

export const posSaleSchema = z.object({
  customerName: z.string().default('Retail Walk-in Customer'),
  customerId: z.string().default('pty_walkin_retail'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'SPLIT_PAYMENT']).default('CASH'),
  paymentDetails: z
    .object({
      cashAmount: z.number().nonnegative().optional(),
      cardAmount: z.number().nonnegative().optional(),
      upiAmount: z.number().nonnegative().optional(),
      cardLast4: z.string().optional(),
      upiRef: z.string().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU or Barcode is required'),
        quantity: z.number().positive('Quantity must be positive'),
        customDiscountPercent: z.number().min(0).max(100).optional(),
      })
    )
    .min(1, 'At least one item in cart'),
  posShiftId: z.string().optional(),
});

export const createSalesReturnSchema = z.object({
  salesInvoiceId: z.string().min(1, 'Sales Invoice ID is required'),
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

export const createCustomerReceiptSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  receiptDate: z.string().or(z.date()).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER_NEFT_RTGS', 'CHEQUE']).default('BANK_TRANSFER_NEFT_RTGS'),
  bankLedgerId: z.string().min(1, 'Bank or Cash Ledger is required'),
  referenceNumber: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  discountAllowed: z.number().nonnegative().default(0),
  tdsDeductedByCustomer: z.number().nonnegative().default(0),
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

export const openPosShiftSchema = z.object({
  openingFloatCash: z.number().nonnegative().default(5000),
  cashierName: z.string().min(1, 'Cashier name is required'),
});

export const closePosShiftSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  closingDrawerCash: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const holdCartSchema = z.object({
  customerName: z.string().default('Counter Customer'),
  cashierName: z.string().optional().default('Counter Cashier'),
  items: z.array(z.any()).min(1, 'Cart items required'),
  totalAmount: z.number().nonnegative(),
});
