import { postDoubleEntryVoucher } from './voucherService';
import { getStoredLedgers } from './accountingService';
import { getStoredStocks, saveStoredStocks, recordStockMovement, StockItem } from './inventoryService';
import { getStoredParties, PartyItem } from './catalogueService';

export interface OrderLineItem {
  id: string;
  sku: string;
  title: string;
  mrp: number;
  discountPercent: number;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export interface SalesOrderItem {
  id: string;
  orderNumber: string;
  quotationRef?: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  channel: 'WHOLESALE' | 'DISTRIBUTOR' | 'DEALER' | 'INSTITUTION_SCHOOL' | 'RETAIL';
  orderDate: string;
  deliveryDueDate: string;
  warehouseId?: string;
  warehouseName?: string;
  itemsCount: number;
  subtotal: number;
  freightCharges: number;
  grandTotal: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'INVOICED' | 'CANCELLED';
  items: OrderLineItem[];
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  sku: string;
  title: string;
  hsnCode: string;
  mrp: number;
  discountPercent: number;
  unitPrice: number;
  quantity: number;
  taxRate: number; // Indian GST on Printed Books is 0% (HSN 4901)
  taxAmount: number;
  totalAmount: number;
}

export interface SalesInvoiceItem {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerAddress?: string;
  channel: 'WHOLESALE' | 'DISTRIBUTOR' | 'DEALER' | 'INSTITUTION_SCHOOL' | 'RETAIL';
  date: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  freightCharges: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  voucherNumber: string;
  paymentMethod: 'CREDIT' | 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'SPLIT';
  dispatchWarehouseName?: string;
  items: InvoiceLineItem[];
}

export interface DeliveryChallanItem {
  id: string;
  challanNumber: string;
  orderNumber?: string;
  invoiceNumber?: string;
  customerName: string;
  transporter: string;
  lrNumber: string;
  vehicleNumber: string;
  dispatchDate: string;
  warehouseName: string;
  itemsCount: number;
  status: 'DISPATCHED' | 'DELIVERED' | 'RETURNED';
  notes?: string;
}

export interface SalesReturnItem {
  id: string;
  creditNoteNumber: string;
  invoiceNumber: string;
  customerName: string;
  returnDate: string;
  reason: string;
  totalAmount: number;
  voucherNumber: string;
  status: 'POSTED' | 'DRAFT' | 'CANCELLED';
  sku?: string;
  title?: string;
  quantityReturned?: number;
}

export interface CustomerReceiptItem {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  invoiceNumber?: string;
  date: string;
  paymentMethod: 'BANK_TRANSFER_NEFT_RTGS' | 'UPI' | 'CHEQUE' | 'CASH';
  bankName: string;
  amount: number;
  reference: string;
  voucherNumber: string;
  status: 'POSTED' | 'CANCELLED';
  notes?: string;
}

export interface PosSaleRecord {
  id: string;
  billNumber: string;
  date: string;
  time: string;
  cashierName: string;
  terminalId: string;
  customerName: string;
  items: InvoiceLineItem[];
  subtotal: number;
  netPayable: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'SPLIT_PAYMENT';
  cashTendered: number;
  upiReceived: number;
  voucherNumber: string;
}

export interface PosHeldCart {
  id: string;
  ref: string;
  customer: string;
  time: string;
  itemsCount: number;
  total: number;
  items: any[];
}

export interface DebtorsAgeingSummary {
  customerName: string;
  gstin: string;
  creditLimit: number;
  current: number; // 0-30 days
  days1to30: number; // 1-30 days overdue
  days31to60: number; // 31-60 days overdue
  days61to90: number; // 61-90 days overdue
  days90Plus: number; // >90 days overdue
  totalDue: number;
}

// Initial Seeds
export const INITIAL_SALES_ORDERS: SalesOrderItem[] = [
  {
    id: 'so_001',
    orderNumber: 'SO/2026/0001',
    quotationRef: 'SQ/2026/0001',
    customerId: 'pty_oxford',
    customerName: 'Oxford Book Store & Distributors Ltd.',
    customerGstin: '07AAACR1234A1Z1',
    channel: 'WHOLESALE',
    orderDate: '2026-11-04',
    deliveryDueDate: '2026-11-15',
    warehouseName: 'Central Press & Distribution Depot',
    itemsCount: 50,
    subtotal: 13500.0,
    freightCharges: 350.0,
    grandTotal: 13850.0,
    status: 'CONFIRMED',
    items: [
      {
        id: 'li_01',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        mrp: 495.0,
        discountPercent: 40,
        unitPrice: 297.0,
        quantity: 50,
        totalAmount: 14850.0,
      },
    ],
    notes: 'Urgent consignment dispatch via VRL Logistics',
  },
  {
    id: 'so_002',
    orderNumber: 'SO/2026/0002',
    quotationRef: 'SQ/2026/0002',
    customerId: 'pty_delhi_book',
    customerName: 'Delhi Book Agency & Central Dealers',
    customerGstin: '07AABCD8899K1Z2',
    channel: 'DEALER',
    orderDate: '2026-11-05',
    deliveryDueDate: '2026-11-20',
    warehouseName: 'Central Press & Distribution Depot',
    itemsCount: 100,
    subtotal: 42000.0,
    freightCharges: 800.0,
    grandTotal: 42800.0,
    status: 'PROCESSING',
    items: [
      {
        id: 'li_02',
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        mrp: 795.0,
        discountPercent: 25,
        unitPrice: 596.25,
        quantity: 70,
        totalAmount: 41737.5,
      },
    ],
    notes: 'Academic session semester restock',
  },
];

export const INITIAL_SALES_INVOICES: SalesInvoiceItem[] = [
  {
    id: 'sinv_001',
    invoiceNumber: 'SINV/2026/0001',
    orderNumber: 'SO/2026/0001',
    customerId: 'pty_oxford',
    customerName: 'Oxford Book Store & Distributors Ltd.',
    customerGstin: '07AAACR1234A1Z1',
    customerAddress: 'Publishers Hub, Daryaganj, New Delhi - 110002',
    channel: 'WHOLESALE',
    date: '2026-11-05',
    dueDate: '2026-12-05',
    subtotal: 14850.0,
    taxAmount: 0.0,
    freightCharges: 350.0,
    grandTotal: 15200.0,
    paidAmount: 15200.0,
    balanceDue: 0.0,
    status: 'PAID',
    voucherNumber: 'SV/2026/0001',
    paymentMethod: 'BANK_TRANSFER',
    dispatchWarehouseName: 'Central Press & Distribution Depot',
    items: [
      {
        id: 'ili_01',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        hsnCode: '4901',
        mrp: 495.0,
        discountPercent: 40,
        unitPrice: 297.0,
        quantity: 50,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 14850.0,
      },
    ],
  },
  {
    id: 'sinv_002',
    invoiceNumber: 'SINV/2026/0002',
    customerId: 'pty_st_xavier',
    customerName: 'St. Xavier Senior Secondary School',
    customerGstin: '07AAACS1122D1Z4',
    customerAddress: 'Civil Lines, Delhi - 110054',
    channel: 'INSTITUTION_SCHOOL',
    date: '2026-11-05',
    dueDate: '2026-11-25',
    subtotal: 47600.0,
    taxAmount: 0.0,
    freightCharges: 0.0,
    grandTotal: 47600.0,
    paidAmount: 0.0,
    balanceDue: 47600.0,
    status: 'ISSUED',
    voucherNumber: 'SV/2026/0002',
    paymentMethod: 'CREDIT',
    dispatchWarehouseName: 'Central Press & Distribution Depot',
    items: [
      {
        id: 'ili_02',
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        hsnCode: '4901',
        mrp: 795.0,
        discountPercent: 20,
        unitPrice: 636.0,
        quantity: 75,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 47600.0,
      },
    ],
  },
];

export const INITIAL_CHALLANS: DeliveryChallanItem[] = [
  {
    id: 'dc_001',
    challanNumber: 'DC/2026/0001',
    orderNumber: 'SO/2026/0001',
    invoiceNumber: 'SINV/2026/0001',
    customerName: 'Oxford Book Store & Distributors Ltd.',
    transporter: 'VRL Logistics India Ltd.',
    lrNumber: 'VRL-MUM-998822',
    vehicleNumber: 'MH-04-AZ-4521',
    dispatchDate: '2026-11-06',
    warehouseName: 'Central Press & Distribution Depot',
    itemsCount: 50,
    status: 'DISPATCHED',
    notes: '2 heavy cartons with security strap seal.',
  },
];

export const INITIAL_SALES_RETURNS: SalesReturnItem[] = [
  {
    id: 'sret_001',
    creditNoteNumber: 'CN/2026/0001',
    invoiceNumber: 'SINV/2026/0001',
    customerName: 'Oxford Book Store & Distributors Ltd.',
    returnDate: '2026-11-07',
    reason: 'Defective spine binding on 5 copies during transit inspection',
    totalAmount: 1485.0,
    voucherNumber: 'CN/2026/0001',
    status: 'POSTED',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    quantityReturned: 5,
  },
];

export const INITIAL_CUSTOMER_RECEIPTS: CustomerReceiptItem[] = [
  {
    id: 'rcpt_001',
    receiptNumber: 'RV/2026/0001',
    customerId: 'pty_oxford',
    customerName: 'Oxford Book Store & Distributors Ltd.',
    invoiceNumber: 'SINV/2026/0001',
    date: '2026-11-08',
    paymentMethod: 'BANK_TRANSFER_NEFT_RTGS',
    bankName: 'HDFC Bank Corporate Current A/c',
    amount: 13715.0,
    reference: 'NEFT/HDFC/20261108/99881',
    voucherNumber: 'RV/2026/0001',
    status: 'POSTED',
    notes: 'Settlement after adjusting CN/2026/0001 (₹1,485.00)',
  },
];

export const INITIAL_HELD_CARTS: PosHeldCart[] = [
  {
    id: 'hold_01',
    ref: 'HOLD-8812',
    customer: 'Walk-in Student Customer',
    time: '15 mins ago',
    itemsCount: 1,
    total: 715.5,
    items: [
      {
        id: 'cart_h1',
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        mrp: 795.0,
        quantity: 1,
        discountPercent: 10,
        unitPrice: 715.5,
        taxRate: 0,
        totalAmount: 715.5,
      },
    ],
  },
];

// LocalStorage Keys
const ORDERS_KEY = 'kibo360_sales_orders_v2';
const INVOICES_KEY = 'kibo360_sales_invoices_v2';
const CHALLANS_KEY = 'kibo360_delivery_challans_v2';
const RETURNS_KEY = 'kibo360_sales_returns_v2';
const RECEIPTS_KEY = 'kibo360_customer_receipts_v2';
const POS_SALES_KEY = 'kibo360_pos_sales_v2';
const HELD_CARTS_KEY = 'kibo360_pos_held_carts_v2';

// --- SALES ORDERS HELPERS ---
export function getStoredOrders(): SalesOrderItem[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredOrders(INITIAL_SALES_ORDERS);
  return INITIAL_SALES_ORDERS;
}

export function saveStoredOrders(orders: SalesOrderItem[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export function saveOrderItem(
  order: Partial<SalesOrderItem> & {
    customerName: string;
    channel: SalesOrderItem['channel'];
    items: OrderLineItem[];
  }
): SalesOrderItem {
  const current = getStoredOrders();
  const subtotal = order.items.reduce((acc, i) => acc + i.totalAmount, 0);
  const freight = Number(order.freightCharges) || 0;
  const grandTotal = Number((subtotal + freight).toFixed(2));
  const totalCopies = order.items.reduce((acc, i) => acc + i.quantity, 0);

  if (order.id) {
    const updated = current.map((o) =>
      o.id === order.id
        ? ({
            ...o,
            ...order,
            itemsCount: totalCopies,
            subtotal,
            freightCharges: freight,
            grandTotal,
          } as SalesOrderItem)
        : o
    );
    saveStoredOrders(updated);
    return updated.find((o) => o.id === order.id)!;
  } else {
    const year = new Date().getFullYear();
    const count = current.length + 1;
    const orderNumber = `SO/${year}/${String(count).padStart(4, '0')}`;
    const quotationRef = `SQ/${year}/${String(count).padStart(4, '0')}`;

    const created: SalesOrderItem = {
      id: 'so_' + Date.now(),
      orderNumber,
      quotationRef,
      customerId: order.customerId || 'pty_cust_gen',
      customerName: order.customerName,
      customerGstin: order.customerGstin,
      channel: order.channel,
      orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
      deliveryDueDate:
        order.deliveryDueDate ||
        new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      warehouseName: order.warehouseName || 'Central Press & Distribution Depot',
      itemsCount: totalCopies,
      subtotal,
      freightCharges: freight,
      grandTotal,
      status: order.status || 'CONFIRMED',
      items: order.items,
      notes: order.notes,
    };

    saveStoredOrders([created, ...current]);
    return created;
  }
}

export function deleteOrderItem(id: string): void {
  const current = getStoredOrders();
  saveStoredOrders(current.filter((o) => o.id !== id));
}

// --- SALES INVOICES HELPERS ---
export function getStoredInvoices(): SalesInvoiceItem[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredInvoices(INITIAL_SALES_INVOICES);
  return INITIAL_SALES_INVOICES;
}

export function saveStoredInvoices(invoices: SalesInvoiceItem[]): void {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch {}
}

export function saveInvoiceItem(
  inv: Partial<SalesInvoiceItem> & {
    customerName: string;
    channel: SalesInvoiceItem['channel'];
    items: InvoiceLineItem[];
  }
): SalesInvoiceItem {
  const current = getStoredInvoices();
  const subtotal = inv.items.reduce((acc, i) => acc + i.totalAmount, 0);
  const taxAmount = inv.items.reduce((acc, i) => acc + (i.taxAmount || 0), 0);
  const freight = Number(inv.freightCharges) || 0;
  const grandTotal = Number((subtotal + taxAmount + freight).toFixed(2));
  const paid = Number(inv.paidAmount) || 0;
  const balanceDue = Math.max(0, Number((grandTotal - paid).toFixed(2)));
  const status: SalesInvoiceItem['status'] =
    balanceDue === 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';

  const year = new Date().getFullYear();
  const count = current.length + 1;
  const invoiceNumber = inv.invoiceNumber || `SINV/${year}/${String(count).padStart(4, '0')}`;
  const voucherNumber = inv.voucherNumber || `SV/${year}/${String(count).padStart(4, '0')}`;

  const created: SalesInvoiceItem = {
    id: inv.id || 'sinv_' + Date.now(),
    invoiceNumber,
    orderId: inv.orderId,
    orderNumber: inv.orderNumber,
    customerId: inv.customerId || 'pty_cust_gen',
    customerName: inv.customerName,
    customerGstin: inv.customerGstin,
    customerAddress: inv.customerAddress,
    channel: inv.channel,
    date: inv.date || new Date().toISOString().slice(0, 10),
    dueDate: inv.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    subtotal,
    taxAmount,
    freightCharges: freight,
    grandTotal,
    paidAmount: paid,
    balanceDue,
    status,
    voucherNumber,
    paymentMethod: inv.paymentMethod || 'CREDIT',
    dispatchWarehouseName: inv.dispatchWarehouseName || 'Central Press & Distribution Depot',
    items: inv.items,
  };

  if (inv.id) {
    const updated = current.map((i) => (i.id === inv.id ? created : i));
    saveStoredInvoices(updated);
  } else {
    saveStoredInvoices([created, ...current]);

    // Decrement Warehouse Stock & Record Outward Movement for each line item
    try {
      const stocks = getStoredStocks();
      inv.items.forEach((item) => {
        const targetStock = stocks.find((s) => s.sku === item.sku);
        if (targetStock) {
          const newOnHand = Math.max(0, targetStock.onHand - item.quantity);
          targetStock.onHand = newOnHand;
          targetStock.available = Math.max(0, newOnHand - targetStock.reserved);

          recordStockMovement({
            sku: item.sku,
            title: item.title,
            wh: created.dispatchWarehouseName || 'Central Press & Distribution Depot',
            type: 'OUTWARD_SALE',
            ref: invoiceNumber,
            in: 0,
            out: item.quantity,
            bal: newOnHand,
            rate: targetStock.wacCost,
            notes: `Dispatched against ${invoiceNumber} to ${created.customerName}`,
          });
        }
      });
      saveStoredStocks(stocks);
    } catch (e) {
      console.error('Error updating stock on sales invoice creation:', e);
    }

    // Post Double-Entry Sales Invoice Voucher in General Ledger
    try {
      const ledgers = getStoredLedgers();
      const debtorsLedger =
        ledgers.find((l) => l.name.toLowerCase().includes('debtor') || l.name.toLowerCase().includes('receivable')) ||
        ledgers.find((l) => l.classification === 'ASSET') ||
        ledgers[0];
      const salesLedger =
        ledgers.find((l) => l.name.toLowerCase().includes('sale') || l.name.toLowerCase().includes('revenue')) ||
        ledgers.find((l) => l.classification === 'REVENUE') ||
        ledgers[1] ||
        ledgers[0];

      postDoubleEntryVoucher({
        voucherType: 'SALES_INVOICE',
        date: created.date,
        branchName: created.dispatchWarehouseName || 'Delhi HQ',
        createdByName: 'Sales Billing Manager',
        narration: `Tax Invoice ${invoiceNumber} issued to ${created.customerName}`,
        totalAmount: grandTotal,
        items: [
          {
            id: 'svli_' + Date.now() + '_1',
            ledgerId: debtorsLedger.id,
            ledgerName: `${created.customerName} (Trade Receivable)`,
            ledgerCode: debtorsLedger.code,
            debitAmount: grandTotal,
            creditAmount: 0,
            description: `Sales Invoice ${invoiceNumber}`,
          },
          {
            id: 'svli_' + Date.now() + '_2',
            ledgerId: salesLedger.id,
            ledgerName: 'Sales Revenue - Educational Books',
            ledgerCode: salesLedger.code,
            debitAmount: 0,
            creditAmount: grandTotal,
            description: `Book Sales Revenue per ${invoiceNumber}`,
          },
        ],
      });
    } catch (e) {
      console.error('Error posting GL voucher for sales invoice:', e);
    }
  }

  return created;
}

export function deleteInvoiceItem(id: string): void {
  const current = getStoredInvoices();
  saveStoredInvoices(current.filter((i) => i.id !== id));
}

// --- DELIVERY CHALLANS HELPERS ---
export function getStoredChallans(): DeliveryChallanItem[] {
  try {
    const raw = localStorage.getItem(CHALLANS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredChallans(INITIAL_CHALLANS);
  return INITIAL_CHALLANS;
}

export function saveStoredChallans(challans: DeliveryChallanItem[]): void {
  try {
    localStorage.setItem(CHALLANS_KEY, JSON.stringify(challans));
  } catch {}
}

export function saveChallanItem(
  ch: Partial<DeliveryChallanItem> & { customerName: string; transporter: string }
): DeliveryChallanItem {
  const current = getStoredChallans();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const challanNumber = ch.challanNumber || `DC/${year}/${String(count).padStart(4, '0')}`;

  const created: DeliveryChallanItem = {
    id: ch.id || 'dc_' + Date.now(),
    challanNumber,
    orderNumber: ch.orderNumber,
    invoiceNumber: ch.invoiceNumber,
    customerName: ch.customerName,
    transporter: ch.transporter,
    lrNumber: ch.lrNumber || `LR-${Math.floor(100000 + Math.random() * 900000)}`,
    vehicleNumber: ch.vehicleNumber || 'MH-04-AZ-4521',
    dispatchDate: ch.dispatchDate || new Date().toISOString().slice(0, 10),
    warehouseName: ch.warehouseName || 'Central Press & Distribution Depot',
    itemsCount: Number(ch.itemsCount) || 50,
    status: ch.status || 'DISPATCHED',
    notes: ch.notes,
  };

  saveStoredChallans([created, ...current]);
  return created;
}

// --- SALES RETURNS & CREDIT NOTES HELPERS ---
export function getStoredReturns(): SalesReturnItem[] {
  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredReturns(INITIAL_SALES_RETURNS);
  return INITIAL_SALES_RETURNS;
}

export function saveStoredReturns(returns: SalesReturnItem[]): void {
  try {
    localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
  } catch {}
}

export function saveReturnItem(
  ret: Partial<SalesReturnItem> & {
    invoiceNumber: string;
    customerName: string;
    reason: string;
    totalAmount: number;
  }
): SalesReturnItem {
  const current = getStoredReturns();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const creditNoteNumber = ret.creditNoteNumber || `CN/${year}/${String(count).padStart(4, '0')}`;
  const voucherNumber = ret.voucherNumber || `CN/${year}/${String(count).padStart(4, '0')}`;

  const created: SalesReturnItem = {
    id: ret.id || 'cn_' + Date.now(),
    creditNoteNumber,
    invoiceNumber: ret.invoiceNumber,
    customerName: ret.customerName,
    returnDate: ret.returnDate || new Date().toISOString().slice(0, 10),
    reason: ret.reason,
    totalAmount: Number(ret.totalAmount) || 0,
    voucherNumber,
    status: 'POSTED',
    sku: ret.sku,
    title: ret.title,
    quantityReturned: Number(ret.quantityReturned) || 0,
  };

  saveStoredReturns([created, ...current]);

  // Adjust Invoice Balance if invoice found
  const invoices = getStoredInvoices();
  const targetInvoice = invoices.find((i) => i.invoiceNumber === ret.invoiceNumber);
  if (targetInvoice) {
    const newPaid = Number((targetInvoice.paidAmount + created.totalAmount).toFixed(2));
    const newBal = Math.max(0, Number((targetInvoice.grandTotal - newPaid).toFixed(2)));
    targetInvoice.paidAmount = newPaid;
    targetInvoice.balanceDue = newBal;
    targetInvoice.status = newBal === 0 ? 'PAID' : 'PARTIALLY_PAID';
    saveStoredInvoices(invoices);
  }

  // Restore inventory if SKU and return quantity specified
  if (created.sku && created.quantityReturned && created.quantityReturned > 0) {
    try {
      const stocks = getStoredStocks();
      const targetStock = stocks.find((s) => s.sku === created.sku);
      if (targetStock) {
        targetStock.onHand += created.quantityReturned;
        targetStock.available += created.quantityReturned;
        saveStoredStocks(stocks);

        recordStockMovement({
          sku: created.sku,
          title: created.title || targetStock.title,
          wh: targetStock.warehouseName,
          type: 'TRANSFER_RECEIPT',
          ref: creditNoteNumber,
          in: created.quantityReturned,
          out: 0,
          bal: targetStock.onHand,
          rate: targetStock.wacCost,
          notes: `Restocked from Sales Return / Credit Note ${creditNoteNumber}`,
        });
      }
    } catch (e) {
      console.error('Error restocking returned inventory:', e);
    }
  }

  // Post Credit Note Voucher in General Ledger
  try {
    const ledgers = getStoredLedgers();
    const debtorsLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('debtor') || l.name.toLowerCase().includes('receivable')) ||
      ledgers[0];
    const returnLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('return') || l.name.toLowerCase().includes('sale')) ||
      ledgers[1] ||
      ledgers[0];

    postDoubleEntryVoucher({
      voucherType: 'CREDIT_NOTE',
      date: created.returnDate,
      branchName: 'Delhi HQ',
      createdByName: 'Returns Storekeeper',
      narration: `Credit Note ${creditNoteNumber} for sales return against ${created.invoiceNumber}. Reason: ${created.reason}`,
      totalAmount: created.totalAmount,
      items: [
        {
          id: 'cnli_' + Date.now() + '_1',
          ledgerId: returnLedger.id,
          ledgerName: 'Sales Returns & Allowances',
          ledgerCode: returnLedger.code,
          debitAmount: created.totalAmount,
          creditAmount: 0,
          description: `Credit Note ${creditNoteNumber}`,
        },
        {
          id: 'cnli_' + Date.now() + '_2',
          ledgerId: debtorsLedger.id,
          ledgerName: `${created.customerName} (Trade Receivable)`,
          ledgerCode: debtorsLedger.code,
          debitAmount: 0,
          creditAmount: created.totalAmount,
          description: `Reversal of Receivable for returned copies`,
        },
      ],
    });
  } catch (e) {
    console.error('Error posting GL voucher for credit note:', e);
  }

  return created;
}

// --- CUSTOMER RECEIPTS HELPERS ---
export function getStoredReceipts(): CustomerReceiptItem[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredReceipts(INITIAL_CUSTOMER_RECEIPTS);
  return INITIAL_CUSTOMER_RECEIPTS;
}

export function saveStoredReceipts(receipts: CustomerReceiptItem[]): void {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  } catch {}
}

export function saveReceiptItem(
  rcpt: Partial<CustomerReceiptItem> & {
    customerName: string;
    amount: number;
    paymentMethod: CustomerReceiptItem['paymentMethod'];
  }
): CustomerReceiptItem {
  const current = getStoredReceipts();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const receiptNumber = rcpt.receiptNumber || `RV/${year}/${String(count).padStart(4, '0')}`;
  const voucherNumber = rcpt.voucherNumber || `RV/${year}/${String(count).padStart(4, '0')}`;

  const created: CustomerReceiptItem = {
    id: rcpt.id || 'rcpt_' + Date.now(),
    receiptNumber,
    customerId: rcpt.customerId || 'pty_cust_gen',
    customerName: rcpt.customerName,
    invoiceNumber: rcpt.invoiceNumber,
    date: rcpt.date || new Date().toISOString().slice(0, 10),
    paymentMethod: rcpt.paymentMethod,
    bankName: rcpt.bankName || 'HDFC Bank Corporate Current A/c',
    amount: Number(rcpt.amount) || 0,
    reference: rcpt.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    voucherNumber,
    status: 'POSTED',
    notes: rcpt.notes,
  };

  saveStoredReceipts([created, ...current]);

  // Adjust target invoice if specified
  if (created.invoiceNumber) {
    const invoices = getStoredInvoices();
    const inv = invoices.find((i) => i.invoiceNumber === created.invoiceNumber);
    if (inv) {
      inv.paidAmount = Number((inv.paidAmount + created.amount).toFixed(2));
      inv.balanceDue = Math.max(0, Number((inv.grandTotal - inv.paidAmount).toFixed(2)));
      inv.status = inv.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
      saveStoredInvoices(invoices);
    }
  }

  // Post Double-Entry Receipt Voucher in GL
  try {
    const ledgers = getStoredLedgers();
    const bankOrCashLedger =
      created.paymentMethod === 'CASH'
        ? ledgers.find((l) => l.name.toLowerCase().includes('cash')) || ledgers[0]
        : ledgers.find((l) => l.name.toLowerCase().includes('bank') || l.name.toLowerCase().includes('hdfc')) || ledgers[0];

    const debtorsLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('debtor') || l.name.toLowerCase().includes('receivable')) ||
      ledgers[0];

    postDoubleEntryVoucher({
      voucherType: 'RECEIPT_VOUCHER',
      date: created.date,
      branchName: 'Delhi HQ',
      createdByName: 'Chief Cashier',
      narration: `Payment received from ${created.customerName} via ${created.paymentMethod} (Ref: ${created.reference})`,
      totalAmount: created.amount,
      items: [
        {
          id: 'rvli_' + Date.now() + '_1',
          ledgerId: bankOrCashLedger.id,
          ledgerName: bankOrCashLedger.name,
          ledgerCode: bankOrCashLedger.code,
          debitAmount: created.amount,
          creditAmount: 0,
          description: `Customer Receipt ${receiptNumber}`,
        },
        {
          id: 'rvli_' + Date.now() + '_2',
          ledgerId: debtorsLedger.id,
          ledgerName: `${created.customerName} (Trade Receivable)`,
          ledgerCode: debtorsLedger.code,
          debitAmount: 0,
          creditAmount: created.amount,
          description: `Settlement of dues per ${receiptNumber}`,
        },
      ],
    });
  } catch (e) {
    console.error('Error posting GL voucher for customer receipt:', e);
  }

  return created;
}

// --- POS SALES & HELD CARTS HELPERS ---
export function getStoredPosSales(): PosSaleRecord[] {
  try {
    const raw = localStorage.getItem(POS_SALES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveStoredPosSales(sales: PosSaleRecord[]): void {
  try {
    localStorage.setItem(POS_SALES_KEY, JSON.stringify(sales));
  } catch {}
}

export function recordPosSale(sale: {
  customerName?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  netPayable: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'SPLIT_PAYMENT';
  cashTendered?: number;
  upiReceived?: number;
}): PosSaleRecord {
  const current = getStoredPosSales();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const billNumber = `POS/${year}/${String(count).padStart(5, '0')}`;
  const voucherNumber = `SV/${year}/POS-${String(count).padStart(4, '0')}`;
  const now = new Date();

  const record: PosSaleRecord = {
    id: 'pos_' + Date.now(),
    billNumber,
    date: now.toISOString().slice(0, 10),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    cashierName: 'Counter Cashier (Terminal 01)',
    terminalId: 'POS-TERM-01',
    customerName: sale.customerName || 'Retail Walk-in Customer',
    items: sale.items,
    subtotal: sale.subtotal,
    netPayable: sale.netPayable,
    paymentMethod: sale.paymentMethod,
    cashTendered: sale.cashTendered || sale.netPayable,
    upiReceived: sale.upiReceived || 0,
    voucherNumber,
  };

  saveStoredPosSales([record, ...current]);

  // Decrement Stock in Inventory
  try {
    const stocks = getStoredStocks();
    sale.items.forEach((item) => {
      const targetStock = stocks.find((s) => s.sku === item.sku);
      if (targetStock) {
        targetStock.onHand = Math.max(0, targetStock.onHand - item.quantity);
        targetStock.available = Math.max(0, targetStock.onHand - targetStock.reserved);

        recordStockMovement({
          sku: item.sku,
          title: item.title,
          wh: 'Connaught Place Retail Depot & Outlet',
          type: 'OUTWARD_SALE',
          ref: billNumber,
          in: 0,
          out: item.quantity,
          bal: targetStock.onHand,
          rate: targetStock.wacCost,
          notes: `Retail POS counter sale per bill ${billNumber}`,
        });
      }
    });
    saveStoredStocks(stocks);
  } catch (e) {
    console.error('Error decrementing stock on POS sale:', e);
  }

  // Also record into Sales Invoices list for universal invoicing audit
  saveInvoiceItem({
    invoiceNumber: billNumber,
    customerName: record.customerName,
    channel: 'RETAIL',
    date: record.date,
    dueDate: record.date,
    subtotal: record.subtotal,
    taxAmount: 0,
    freightCharges: 0,
    grandTotal: record.netPayable,
    paidAmount: record.netPayable,
    balanceDue: 0,
    status: 'PAID',
    voucherNumber,
    paymentMethod:
      sale.paymentMethod === 'CASH'
        ? 'CASH'
        : sale.paymentMethod === 'UPI'
        ? 'UPI'
        : 'SPLIT',
    dispatchWarehouseName: 'Connaught Place Retail Depot & Outlet',
    items: sale.items,
  });

  return record;
}

export function getStoredHeldCarts(): PosHeldCart[] {
  try {
    const raw = localStorage.getItem(HELD_CARTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredHeldCarts(INITIAL_HELD_CARTS);
  return INITIAL_HELD_CARTS;
}

export function saveStoredHeldCarts(carts: PosHeldCart[]): void {
  try {
    localStorage.setItem(HELD_CARTS_KEY, JSON.stringify(carts));
  } catch {}
}

// --- DEBTORS AGEING & CUSTOMER STATEMENTS ---
export function calculateDebtorsAgeing(
  invoices: SalesInvoiceItem[]
): DebtorsAgeingSummary[] {
  const parties = getStoredParties();
  const now = new Date().getTime();

  // Group invoices by customer
  const customerMap: Record<
    string,
    { gstin: string; creditLimit: number; invoices: SalesInvoiceItem[] }
  > = {};

  // First seed known parties
  parties
    .filter((p) => p.partyType === 'DISTRIBUTOR' || p.partyType === 'DEALER')
    .forEach((p) => {
      customerMap[p.name] = {
        gstin: p.gstin || '07AAAAA0000A1Z5',
        creditLimit: p.creditLimit || 1000000,
        invoices: [],
      };
    });

  // Assign invoices
  invoices.forEach((inv) => {
    if (!customerMap[inv.customerName]) {
      customerMap[inv.customerName] = {
        gstin: inv.customerGstin || '07AAAAA0000A1Z5',
        creditLimit: 500000,
        invoices: [],
      };
    }
    customerMap[inv.customerName].invoices.push(inv);
  });

  const result: DebtorsAgeingSummary[] = [];

  Object.keys(customerMap).forEach((custName) => {
    const entry = customerMap[custName];
    let current = 0;
    let days1to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let days90Plus = 0;
    let totalDue = 0;

    entry.invoices.forEach((inv) => {
      if (inv.balanceDue > 0) {
        totalDue += inv.balanceDue;
        const dueTime = new Date(inv.dueDate).getTime();
        const diffDays = Math.floor((now - dueTime) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          current += inv.balanceDue;
        } else if (diffDays <= 30) {
          days1to30 += inv.balanceDue;
        } else if (diffDays <= 60) {
          days31to60 += inv.balanceDue;
        } else if (diffDays <= 90) {
          days61to90 += inv.balanceDue;
        } else {
          days90Plus += inv.balanceDue;
        }
      }
    });

    result.push({
      customerName: custName,
      gstin: entry.gstin,
      creditLimit: entry.creditLimit,
      current: Number(current.toFixed(2)),
      days1to30: Number(days1to30.toFixed(2)),
      days31to60: Number(days31to60.toFixed(2)),
      days61to90: Number(days61to90.toFixed(2)),
      days90Plus: Number(days90Plus.toFixed(2)),
      totalDue: Number(totalDue.toFixed(2)),
    });
  });

  return result;
}

export function getCustomerStatement(
  customerName: string,
  invoices: SalesInvoiceItem[],
  receipts: CustomerReceiptItem[],
  returns: SalesReturnItem[]
): {
  customerName: string;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  entries: Array<{
    date: string;
    ref: string;
    desc: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
} {
  const rawEntries: Array<{
    date: string;
    ref: string;
    desc: string;
    debit: number;
    credit: number;
  }> = [];

  // Invoices -> Debits
  invoices
    .filter((i) => i.customerName.toLowerCase().includes(customerName.toLowerCase()))
    .forEach((inv) => {
      rawEntries.push({
        date: inv.date,
        ref: inv.invoiceNumber,
        desc: `Tax Invoice (${inv.items.map((it) => `${it.quantity}x ${it.sku}`).join(', ')})`,
        debit: inv.grandTotal,
        credit: 0,
      });
    });

  // Credit Notes -> Credits
  returns
    .filter((r) => r.customerName.toLowerCase().includes(customerName.toLowerCase()))
    .forEach((ret) => {
      rawEntries.push({
        date: ret.returnDate,
        ref: ret.creditNoteNumber,
        desc: `Credit Note: ${ret.reason}`,
        debit: 0,
        credit: ret.totalAmount,
      });
    });

  // Receipts -> Credits
  receipts
    .filter((r) => r.customerName.toLowerCase().includes(customerName.toLowerCase()))
    .forEach((rcpt) => {
      rawEntries.push({
        date: rcpt.date,
        ref: rcpt.receiptNumber,
        desc: `Customer Payment received via ${rcpt.paymentMethod} (${rcpt.bankName})`,
        debit: 0,
        credit: rcpt.amount,
      });
    });

  // Sort chronological
  rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  let debits = 0;
  let credits = 0;

  const entries = rawEntries.map((e) => {
    running += e.debit - e.credit;
    debits += e.debit;
    credits += e.credit;
    return {
      ...e,
      balance: Number(running.toFixed(2)),
    };
  });

  return {
    customerName,
    totalDebits: Number(debits.toFixed(2)),
    totalCredits: Number(credits.toFixed(2)),
    closingBalance: Number(running.toFixed(2)),
    entries,
  };
}
