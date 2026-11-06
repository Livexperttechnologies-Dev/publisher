import { postDoubleEntryVoucher } from './voucherService';
import { getStoredStocks, saveStoredStocks, recordStockMovement, getStoredWarehouses } from './inventoryService';
import { getStoredBooks } from './catalogueService';

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  category: 'PAPER_MILL' | 'PRINTER_BINDER' | 'LAMINATION_FOIL' | 'CONSUMABLES' | 'GENERAL';
  gstin: string;
  pan: string;
  stateCode: string;
  address: string;
  email: string;
  phone: string;
  paymentTerms: string;
  creditDays: number;
  creditLimit: number;
  currentOutstanding: number;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface PurchaseOrderLineItem {
  id: string;
  bookId?: string;
  title: string;
  sku: string;
  itemType: 'BOOK' | 'RAW_PAPER' | 'BINDING_MATERIAL' | 'CONSUMABLE';
  quantity: number;
  receivedQty: number;
  rate: number;
  total: number;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierId?: string;
  supplierName: string;
  supplierGstin: string;
  orderDate: string;
  expectedDelivery: string;
  warehouseId: string;
  warehouseName: string;
  paymentTerms: string;
  itemsCount: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  freightCharges: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  items: PurchaseOrderLineItem[];
}

export interface GoodsReceiptNoteItem {
  id: string;
  grnNumber: string;
  poId?: string;
  poNumber: string;
  supplierName: string;
  receiptDate: string;
  deliveryChallanNo: string;
  transporterName: string;
  vehicleNumber?: string;
  warehouseId: string;
  warehouseName: string;
  warehouseRack: string;
  batchBarcode: string;
  sku: string;
  title: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitRate: number;
  rejectionReason?: string;
  status: 'POSTED_TO_INVENTORY' | 'PENDING_INSPECTION' | 'CANCELLED';
  notes?: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNo: string;
  supplierName: string;
  supplierGstin: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  grnNumber: string;
  taxableAmount: number;
  taxRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  freightAmount: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  threeWayMatched: boolean;
  matchDiscrepancy?: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'DISPUTED';
  voucherNumber: string;
  notes?: string;
}

export interface DebitNoteItem {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  supplierName: string;
  returnDate: string;
  returnReason: string;
  sku: string;
  title: string;
  returnedQty: number;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  totalReturnAmount: number;
  status: 'CONFIRMED' | 'ADJUSTED_IN_BILL';
  voucherNumber: string;
}

export interface VendorPaymentItem {
  id: string;
  paymentNumber: string;
  supplierName: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'NEFT' | 'RTGS' | 'CHEQUE' | 'UPI';
  bankName: string;
  bankAccountNumber: string;
  transactionRef: string;
  voucherNumber: string;
  notes?: string;
}

const STORAGE_KEYS = {
  SUPPLIERS: 'kibo360_purchase_suppliers_v2',
  ORDERS: 'kibo360_purchase_orders_v2',
  GRNS: 'kibo360_purchase_grns_v2',
  INVOICES: 'kibo360_purchase_invoices_v2',
  RETURNS: 'kibo360_purchase_returns_v2',
  PAYMENTS: 'kibo360_purchase_payments_v2',
};

// Initial Suppliers Master
export const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 'sup_01',
    code: 'SUP-001',
    name: 'Ballarpur Paper & Pulp Mills Ltd.',
    category: 'PAPER_MILL',
    gstin: '06AAACB9876E1Z1',
    pan: 'AAACB9876E',
    stateCode: '06',
    address: 'DLF Cyber City, Tower B, Gurugram, Haryana - 122002',
    email: 'commercial.sales@biltpaper.in',
    phone: '+91 124 4567890',
    paymentTerms: 'Net 45',
    creditDays: 45,
    creditLimit: 2500000,
    currentOutstanding: 325677.5,
    status: 'ACTIVE',
  },
  {
    id: 'sup_02',
    code: 'SUP-002',
    name: 'Century Pulp & Paper Mills Ltd.',
    category: 'PAPER_MILL',
    gstin: '05AAACC1234F1Z8',
    pan: 'AAACC1234F',
    stateCode: '05',
    address: 'Ghanshyamdham, PO Lalkuan, Nainital, Uttarakhand - 262402',
    email: 'marketing@centurypaper.com',
    phone: '+91 5945 268021',
    paymentTerms: 'Net 30',
    creditDays: 30,
    creditLimit: 3000000,
    currentOutstanding: 0.0,
    status: 'ACTIVE',
  },
  {
    id: 'sup_03',
    code: 'SUP-003',
    name: 'JK Paper Ltd. (Songadh Unit)',
    category: 'PAPER_MILL',
    gstin: '24AAACJ1092K1ZF',
    pan: 'AAACJ1092K',
    stateCode: '24',
    address: 'Central Songadh Mills, Tapi, Gujarat - 394660',
    email: 'orders@jkpaper.com',
    phone: '+91 2624 220228',
    paymentTerms: 'Net 30',
    creditDays: 30,
    creditLimit: 2000000,
    currentOutstanding: 0.0,
    status: 'ACTIVE',
  },
  {
    id: 'sup_04',
    code: 'SUP-004',
    name: 'Classic Offset Printers & Book Binders',
    category: 'PRINTER_BINDER',
    gstin: '07AAACG5541L1Z9',
    pan: 'AAACG5541L',
    stateCode: '07',
    address: 'Okhla Industrial Area Phase-II, New Delhi - 110020',
    email: 'press@classicoffset.in',
    phone: '+91 11 26384910',
    paymentTerms: 'Net 30',
    creditDays: 30,
    creditLimit: 1500000,
    currentOutstanding: 0.0,
    status: 'ACTIVE',
  },
];

// Initial Seed Data for Purchase Orders
export const INITIAL_ORDERS: PurchaseOrderItem[] = [
  {
    id: 'po_001',
    poNumber: 'PO/2026/0001',
    supplierId: 'sup_01',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    supplierGstin: '06AAACB9876E1Z1',
    orderDate: '2026-10-18',
    expectedDelivery: '2026-10-25',
    warehouseId: 'wh_central_press_depot',
    warehouseName: 'Central Press & Distribution Depot',
    paymentTerms: 'Net 45',
    itemsCount: 1,
    subtotal: 484500.0,
    discountPercent: 5.0,
    discountAmount: 25500.0,
    freightCharges: 5500.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    grandTotal: 490000.0,
    status: 'COMPLETED',
    notes: 'Bulk printing order of Class 12 Math sets. Complete delivery inwarded.',
    items: [
      {
        id: 'po_item_1',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        sku: 'BK-MATH-12-ENG-PB',
        itemType: 'BOOK',
        quantity: 1500,
        receivedQty: 1500,
        rate: 340.0,
        total: 484500.0,
      },
    ],
  },
  {
    id: 'po_002',
    poNumber: 'PO/2026/0002',
    supplierId: 'sup_01',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    supplierGstin: '06AAACB9876E1Z1',
    orderDate: '2026-11-01',
    expectedDelivery: '2026-11-15',
    warehouseId: 'wh_bhiwandi_godown',
    warehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    paymentTerms: 'Net 45',
    itemsCount: 1,
    subtotal: 294500.0,
    discountPercent: 5.0,
    discountAmount: 15500.0,
    freightCharges: 4500.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    grandTotal: 299000.0,
    status: 'PARTIALLY_RECEIVED',
    notes: 'Concepts of Physics batch inwarding. 1,000 received, balance 1,000 in transit.',
    items: [
      {
        id: 'po_item_2',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        itemType: 'BOOK',
        quantity: 2000,
        receivedQty: 1000,
        rate: 155.0,
        total: 294500.0,
      },
    ],
  },
  {
    id: 'po_003',
    poNumber: 'PO/2026/0003',
    supplierId: 'sup_02',
    supplierName: 'Century Pulp & Paper Mills Ltd.',
    supplierGstin: '05AAACC1234F1Z8',
    orderDate: '2026-11-04',
    expectedDelivery: '2026-11-20',
    warehouseId: 'wh_central_press_depot',
    warehouseName: 'Central Press & Distribution Depot',
    paymentTerms: 'Net 30',
    itemsCount: 1,
    subtotal: 540000.0,
    discountPercent: 0.0,
    discountAmount: 0.0,
    freightCharges: 6000.0,
    taxRate: 12.0,
    taxAmount: 64800.0,
    grandTotal: 610800.0,
    status: 'ISSUED',
    notes: 'Cream Wove Maplitho paper reels for upcoming reprint runs.',
    items: [
      {
        id: 'po_item_3',
        title: 'Cream Wove Maplitho Paper Reels (70 GSM)',
        sku: 'RAW-PAPER-MAP-70',
        itemType: 'RAW_PAPER',
        quantity: 15,
        receivedQty: 0,
        rate: 36000.0,
        total: 540000.0,
      },
    ],
  },
];

// Initial Goods Receipt Notes
export const INITIAL_GRNS: GoodsReceiptNoteItem[] = [
  {
    id: 'grn_001',
    grnNumber: 'GRN/2026/0001',
    poId: 'po_001',
    poNumber: 'PO/2026/0001',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    receiptDate: '2026-10-24',
    deliveryChallanNo: 'DC-BILT-98124',
    transporterName: 'VRL Logistics Express Ltd.',
    vehicleNumber: 'HR-55-AN-4421',
    warehouseId: 'wh_central_press_depot',
    warehouseName: 'Central Press & Distribution Depot',
    warehouseRack: 'RACK-A1-03',
    batchBarcode: 'BC-2026-MATH12-001',
    sku: 'BK-MATH-12-ENG-PB',
    title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
    orderedQty: 1500,
    receivedQty: 1500,
    acceptedQty: 1480,
    rejectedQty: 20,
    unitRate: 340.0,
    rejectionReason: '20 copies spine-damaged during forklift offloading',
    status: 'POSTED_TO_INVENTORY',
    notes: 'Inwarded 1,480 copies to Central Depot. Defective segregated in Damaged Hold.',
  },
  {
    id: 'grn_002',
    grnNumber: 'GRN/2026/0002',
    poId: 'po_002',
    poNumber: 'PO/2026/0002',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    receiptDate: '2026-11-04',
    deliveryChallanNo: 'DC-BILT-99411',
    transporterName: 'VRL Logistics Express Ltd.',
    vehicleNumber: 'MH-04-CP-8812',
    warehouseId: 'wh_bhiwandi_godown',
    warehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    warehouseRack: 'RACK-B2-01',
    batchBarcode: 'BC-2026-BKPHYCONCEPTSENGPB-4086',
    sku: 'BK-PHY-CONCEPTS-ENG-PB',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    orderedQty: 2000,
    receivedQty: 1000,
    acceptedQty: 980,
    rejectedQty: 20,
    unitRate: 155.0,
    rejectionReason: '20 copies missing cover lamination film',
    status: 'POSTED_TO_INVENTORY',
    notes: 'First consignment received and shelf-stocked at Bhiwandi Godown.',
  },
];

// Initial Purchase Invoices (3-Way Matched)
export const INITIAL_INVOICES: PurchaseInvoiceItem[] = [
  {
    id: 'pinv_001',
    invoiceNumber: 'PINV/2026/0001',
    supplierInvoiceNo: 'BILT/INV/9821',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    supplierGstin: '06AAACB9876E1Z1',
    invoiceDate: '2026-10-25',
    dueDate: '2026-12-09',
    poNumber: 'PO/2026/0001',
    grnNumber: 'GRN/2026/0001',
    taxableAmount: 478040.0,
    taxRate: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    igstAmount: 0.0,
    taxAmount: 0.0,
    freightAmount: 5500.0,
    netPayable: 483540.0,
    paidAmount: 200000.0,
    balanceDue: 283540.0,
    threeWayMatched: true,
    status: 'PARTIALLY_PAID',
    voucherNumber: 'PB/2026/0001',
    notes: '1,480 accepted copies matched against PO/2026/0001 & GRN/2026/0001.',
  },
  {
    id: 'pinv_002',
    invoiceNumber: 'PINV/2026/0002',
    supplierInvoiceNo: 'BILT/INV/9942',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    supplierGstin: '06AAACB9876E1Z1',
    invoiceDate: '2026-11-04',
    dueDate: '2026-12-19',
    poNumber: 'PO/2026/0002',
    grnNumber: 'GRN/2026/0002',
    taxableAmount: 144305.0,
    taxRate: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    igstAmount: 0.0,
    taxAmount: 0.0,
    freightAmount: 2250.0,
    netPayable: 146555.0,
    paidAmount: 100000.0,
    balanceDue: 42137.5,
    threeWayMatched: true,
    status: 'PARTIALLY_PAID',
    voucherNumber: 'PB/2026/0002',
    notes: '980 accepted copies billed. Debit note DN/2026/0001 adjusted.',
  },
];

// Initial Debit Notes (Purchase Returns)
export const INITIAL_RETURNS: DebitNoteItem[] = [
  {
    id: 'dn_001',
    returnNumber: 'DN/2026/0001',
    invoiceNumber: 'PINV/2026/0002',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    returnDate: '2026-11-05',
    returnReason: 'Post-inspection missing signature pages 129-144 on 30 copies',
    sku: 'BK-PHY-CONCEPTS-ENG-PB',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    returnedQty: 30,
    rate: 147.25,
    taxableAmount: 4417.5,
    taxAmount: 0.0,
    totalReturnAmount: 4417.5,
    voucherNumber: 'DN/2026/0001',
    status: 'CONFIRMED',
  },
];

// Initial Vendor Payments
export const INITIAL_PAYMENTS: VendorPaymentItem[] = [
  {
    id: 'vpay_01',
    paymentNumber: 'VPAY/2026/0001',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    invoiceNumber: 'PINV/2026/0001',
    paymentDate: '2026-10-31',
    amount: 200000.0,
    paymentMethod: 'NEFT',
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '918010045678912',
    transactionRef: 'NEFT-BILT-9921',
    voucherNumber: 'PV/2026/0003',
    notes: 'Part payment against Invoice PINV/2026/0001',
  },
  {
    id: 'vpay_02',
    paymentNumber: 'VPAY/2026/0002',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    invoiceNumber: 'PINV/2026/0002',
    paymentDate: '2026-11-05',
    amount: 100000.0,
    paymentMethod: 'NEFT',
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '918010045678912',
    transactionRef: 'NEFT-BILT-9988',
    voucherNumber: 'PV/2026/0002',
    notes: 'Part payment against Invoice PINV/2026/0002',
  },
];

// Helper Functions for LocalStorage
export function getStoredSuppliers(): SupplierItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveStoredSuppliers(items: SupplierItem[]) {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(items));
}

export function saveSupplierItem(item: Partial<SupplierItem>): SupplierItem {
  const list = getStoredSuppliers();
  if (item.id) {
    const idx = list.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...item } as SupplierItem;
      list[idx] = updated;
      saveStoredSuppliers(list);
      return updated;
    }
  }

  const nextCode = `SUP-${String(list.length + 1).padStart(3, '0')}`;
  const created: SupplierItem = {
    id: 'sup_' + Date.now(),
    code: item.code || nextCode,
    name: item.name || 'Unnamed Supplier',
    category: item.category || 'PAPER_MILL',
    gstin: (item.gstin || '').toUpperCase(),
    pan: (item.pan || '').toUpperCase(),
    stateCode: item.stateCode || '07',
    address: item.address || '',
    email: item.email || '',
    phone: item.phone || '',
    paymentTerms: item.paymentTerms || 'Net 30',
    creditDays: Number(item.creditDays) || 30,
    creditLimit: Number(item.creditLimit) || 1000000,
    currentOutstanding: Number(item.currentOutstanding) || 0,
    status: item.status || 'ACTIVE',
  };

  const updated = [created, ...list];
  saveStoredSuppliers(updated);
  return created;
}

export function getStoredOrders(): PurchaseOrderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(items: PurchaseOrderItem[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(items));
}

export function createPurchaseOrder(data: {
  supplierName: string;
  expectedDelivery: string;
  warehouseId?: string;
  paymentTerms?: string;
  bookTitle: string;
  sku: string;
  quantity: number;
  unitRate: number;
  discountPercent?: number;
  freightCharges?: number;
  taxRate?: number;
  notes?: string;
}): PurchaseOrderItem {
  const orders = getStoredOrders();
  const suppliers = getStoredSuppliers();
  const supplier = suppliers.find((s) => s.name === data.supplierName) || suppliers[0];
  const warehouses = getStoredWarehouses();
  const wh = warehouses.find((w) => w.id === data.warehouseId) || warehouses[0];

  const year = new Date().getFullYear();
  const nextNum = orders.length + 1;
  const poNumber = `PO/${year}/${String(nextNum).padStart(4, '0')}`;

  const qty = Math.max(1, Number(data.quantity) || 1);
  const rate = Math.max(0, Number(data.unitRate) || 0);
  const gross = qty * rate;
  const discPct = Number(data.discountPercent) || 0;
  const discountAmount = Math.round(gross * (discPct / 100) * 100) / 100;
  const subtotal = Math.round((gross - discountAmount) * 100) / 100;
  const freight = Number(data.freightCharges) || 0;
  const taxRate = Number(data.taxRate) || 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + freight + taxAmount) * 100) / 100;

  const created: PurchaseOrderItem = {
    id: 'po_' + Date.now(),
    poNumber,
    supplierId: supplier?.id,
    supplierName: supplier?.name || data.supplierName,
    supplierGstin: supplier?.gstin || '07AAACK1234D1Z5',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDelivery: data.expectedDelivery || new Date().toISOString().slice(0, 10),
    warehouseId: wh?.id || 'wh_central_press_depot',
    warehouseName: wh?.name || 'Central Press & Distribution Depot',
    paymentTerms: data.paymentTerms || supplier?.paymentTerms || 'Net 30',
    itemsCount: 1,
    subtotal,
    discountPercent: discPct,
    discountAmount,
    freightCharges: freight,
    taxRate,
    taxAmount,
    grandTotal,
    status: 'ISSUED',
    notes: data.notes || '',
    items: [
      {
        id: 'po_line_' + Date.now(),
        title: data.bookTitle,
        sku: data.sku,
        itemType: data.sku.startsWith('RAW') ? 'RAW_PAPER' : 'BOOK',
        quantity: qty,
        receivedQty: 0,
        rate,
        total: subtotal,
      },
    ],
  };

  const updated = [created, ...orders];
  saveStoredOrders(updated);
  return created;
}

export function getStoredGrns(): GoodsReceiptNoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GRNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GRNS, JSON.stringify(INITIAL_GRNS));
      return INITIAL_GRNS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GRNS;
  }
}

export function saveStoredGrns(items: GoodsReceiptNoteItem[]) {
  localStorage.setItem(STORAGE_KEYS.GRNS, JSON.stringify(items));
}

export function inwardGoodsReceiptNote(data: {
  poNumber: string;
  deliveryChallanNo: string;
  transporterName: string;
  vehicleNumber?: string;
  warehouseRack?: string;
  batchBarcode?: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  rejectionReason?: string;
  notes?: string;
}): GoodsReceiptNoteItem {
  const orders = getStoredOrders();
  const order = orders.find((o) => o.poNumber === data.poNumber);
  if (!order) {
    throw new Error(`Purchase Order ${data.poNumber} not found`);
  }

  const grns = getStoredGrns();
  const year = new Date().getFullYear();
  const nextNum = grns.length + 1;
  const grnNumber = `GRN/${year}/${String(nextNum).padStart(4, '0')}`;

  const lineItem = order.items[0];
  const accepted = Math.max(0, Number(data.acceptedQty) || 0);
  const rejected = Math.max(0, Number(data.rejectedQty) || 0);
  const received = Math.max(accepted + rejected, Number(data.receivedQty) || accepted + rejected);

  const barcode = data.batchBarcode || `BC-${year}-${lineItem.sku.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const rack = data.warehouseRack || 'RACK-A1-01';

  // 1. Inward Stock into Inventory Service
  try {
    const stocks = getStoredStocks();
    const existingStock = stocks.find((s) => s.sku === lineItem.sku && s.warehouseName === order.warehouseName);
    if (existingStock) {
      existingStock.onHand += accepted;
      existingStock.available += accepted;
      existingStock.fifoLots.push({
        lotId: `LOT-${year}-${nextNum}`,
        date: new Date().toISOString().slice(0, 10),
        qty: accepted,
        unitCost: lineItem.rate,
      });
      existingStock.status = 'IN_STOCK';
      saveStoredStocks(stocks);
    } else {
      stocks.push({
        id: 'stk_' + Date.now(),
        sku: lineItem.sku,
        title: lineItem.title,
        isbn: '978817709' + Date.now().toString().slice(-4),
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        rackShelf: rack,
        batchNo: `BATCH-${year}-${String(nextNum).padStart(2, '0')}`,
        onHand: accepted,
        reserved: 0,
        available: accepted,
        reorderLevel: 200,
        wacCost: lineItem.rate,
        fifoLots: [
          {
            lotId: `LOT-${year}-${nextNum}`,
            date: new Date().toISOString().slice(0, 10),
            qty: accepted,
            unitCost: lineItem.rate,
          },
        ],
        mrp: Math.round(lineItem.rate * 2.2),
        status: 'IN_STOCK',
        inwardDate: new Date().toISOString().slice(0, 10),
      });
      saveStoredStocks(stocks);
    }

    // Record Inward Movement Log
    recordStockMovement({
      sku: lineItem.sku,
      title: lineItem.title,
      wh: order.warehouseName,
      type: 'INWARD_PURCHASE',
      ref: grnNumber,
      in: accepted,
      out: 0,
      bal: (existingStock ? existingStock.onHand : accepted),
      rate: lineItem.rate,
      notes: `GRN inward against ${order.poNumber} (${data.deliveryChallanNo})`,
    });
  } catch (err) {
    console.warn('Could not auto update inventory for GRN:', err);
  }

  // 2. Update Purchase Order Received Qty
  lineItem.receivedQty = (lineItem.receivedQty || 0) + accepted;
  if (lineItem.receivedQty >= lineItem.quantity) {
    order.status = 'COMPLETED';
  } else {
    order.status = 'PARTIALLY_RECEIVED';
  }
  saveStoredOrders(orders);

  const created: GoodsReceiptNoteItem = {
    id: 'grn_' + Date.now(),
    grnNumber,
    poId: order.id,
    poNumber: order.poNumber,
    supplierName: order.supplierName,
    receiptDate: new Date().toISOString().slice(0, 10),
    deliveryChallanNo: data.deliveryChallanNo,
    transporterName: data.transporterName,
    vehicleNumber: data.vehicleNumber,
    warehouseId: order.warehouseId,
    warehouseName: order.warehouseName,
    warehouseRack: rack,
    batchBarcode: barcode,
    sku: lineItem.sku,
    title: lineItem.title,
    orderedQty: lineItem.quantity,
    receivedQty: received,
    acceptedQty: accepted,
    rejectedQty: rejected,
    unitRate: lineItem.rate,
    rejectionReason: data.rejectionReason,
    status: 'POSTED_TO_INVENTORY',
    notes: data.notes,
  };

  const updatedGrns = [created, ...grns];
  saveStoredGrns(updatedGrns);
  return created;
}

export function getStoredInvoices(): PurchaseInvoiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVOICES;
  }
}

export function saveStoredInvoices(items: PurchaseInvoiceItem[]) {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(items));
}

export function createPurchaseInvoice(data: {
  supplierInvoiceNo: string;
  poNumber: string;
  grnNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  freightAmount?: number;
  notes?: string;
}): PurchaseInvoiceItem {
  const grns = getStoredGrns();
  const grn = grns.find((g) => g.grnNumber === data.grnNumber);
  const orders = getStoredOrders();
  const order = orders.find((o) => o.poNumber === data.poNumber);

  if (!grn && !order) {
    throw new Error('Valid PO or GRN reference is required');
  }

  const suppliers = getStoredSuppliers();
  const supplierName = grn ? grn.supplierName : order!.supplierName;
  const supplier = suppliers.find((s) => s.name === supplierName);

  const invoices = getStoredInvoices();
  const year = new Date().getFullYear();
  const nextNum = invoices.length + 1;
  const invoiceNumber = `PINV/${year}/${String(nextNum).padStart(4, '0')}`;

  const acceptedQty = grn ? grn.acceptedQty : (order ? order.items[0].quantity : 100);
  const unitRate = grn ? grn.unitRate : (order ? order.items[0].rate : 150);
  const taxable = Math.round(acceptedQty * unitRate * 100) / 100;
  const freight = Number(data.freightAmount) || (order ? order.freightCharges : 0);
  const taxRate = order ? order.taxRate : 0;
  const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;

  // Split GST: Intrastate (CGST+SGST) or Interstate (IGST)
  const isInterstate = supplier && supplier.stateCode !== '07'; // Company in Delhi 07
  const cgstAmount = !isInterstate ? Math.round(taxAmount / 2 * 100) / 100 : 0;
  const sgstAmount = !isInterstate ? Math.round(taxAmount / 2 * 100) / 100 : 0;
  const igstAmount = isInterstate ? taxAmount : 0;

  const netPayable = Math.round((taxable + taxAmount + freight) * 100) / 100;

  // 3-Way Match Verification
  let threeWayMatched = true;
  let discrepancy: string | undefined;
  if (order && grn) {
    if (grn.acceptedQty > order.items[0].quantity) {
      threeWayMatched = false;
      discrepancy = `GRN accepted qty (${grn.acceptedQty}) exceeds PO ordered qty (${order.items[0].quantity})`;
    }
  }

  // Post Double-Entry General Ledger Voucher (PURCHASE_BILL)
  let voucherNumber = `PB/${year}/${String(nextNum).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'PURCHASE_BILL',
      date: data.invoiceDate || new Date().toISOString().slice(0, 10),
      narration: `Purchase Bill ${data.supplierInvoiceNo} from ${supplierName} against ${data.poNumber} & ${data.grnNumber}`,
      totalAmount: netPayable,
      branchName: 'Headquarters & Central Depot',
      createdByName: 'Purchase Accounting Officer',
      items: [
        {
          id: '1',
          ledgerId: 'led_paper_purchase',
          ledgerName: 'Paper Reel & Printing Materials Purchase',
          ledgerCode: '4001',
          costCentreName: 'Production & Manufacturing',
          debitAmount: taxable + freight,
          creditAmount: 0,
          description: `Purchase of ${grn?.title || 'Materials'} - Taxable: ₹${taxable}`,
        },
        ...(taxAmount > 0
          ? [
              {
                id: '2',
                ledgerId: 'led_gst_itc_cgst',
                ledgerName: 'Input CGST Receivable Account',
                ledgerCode: '1040',
                debitAmount: cgstAmount + igstAmount,
                creditAmount: 0,
                description: `GST Input Tax Credit on ${data.supplierInvoiceNo}`,
              },
            ]
          : []),
        {
          id: '3',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors - Paper Mills & Printers',
          ledgerCode: '2001',
          debitAmount: 0,
          creditAmount: netPayable,
          description: `Payable to ${supplierName} for Bill #${data.supplierInvoiceNo}`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNumber = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for purchase invoice:', err);
  }

  // Update Supplier Outstanding
  if (supplier) {
    supplier.currentOutstanding = Math.round((supplier.currentOutstanding + netPayable) * 100) / 100;
    saveStoredSuppliers(suppliers);
  }

  const created: PurchaseInvoiceItem = {
    id: 'pinv_' + Date.now(),
    invoiceNumber,
    supplierInvoiceNo: data.supplierInvoiceNo,
    supplierName,
    supplierGstin: supplier?.gstin || '07AAACK1234D1Z5',
    invoiceDate: data.invoiceDate || new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate || new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    poNumber: data.poNumber,
    grnNumber: data.grnNumber,
    taxableAmount: taxable,
    taxRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    freightAmount: freight,
    netPayable,
    paidAmount: 0,
    balanceDue: netPayable,
    threeWayMatched,
    matchDiscrepancy: discrepancy,
    status: 'PENDING',
    voucherNumber,
    notes: data.notes,
  };

  const updatedInvoices = [created, ...invoices];
  saveStoredInvoices(updatedInvoices);
  return created;
}

export function getStoredReturns(): DebitNoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RETURNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
      return INITIAL_RETURNS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RETURNS;
  }
}

export function saveStoredReturns(items: DebitNoteItem[]) {
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(items));
}

export function createDebitNote(data: {
  invoiceNumber: string;
  returnReason: string;
  returnedQty: number;
}): DebitNoteItem {
  const invoices = getStoredInvoices();
  const invoice = invoices.find((i) => i.invoiceNumber === data.invoiceNumber);
  if (!invoice) {
    throw new Error(`Invoice ${data.invoiceNumber} not found`);
  }

  const returns = getStoredReturns();
  const year = new Date().getFullYear();
  const nextNum = returns.length + 1;
  const returnNumber = `DN/${year}/${String(nextNum).padStart(4, '0')}`;

  const qty = Math.max(1, Number(data.returnedQty) || 1);
  const grns = getStoredGrns();
  const grn = grns.find((g) => g.grnNumber === invoice.grnNumber);
  const unitRate = grn ? grn.unitRate : 150;

  const taxable = Math.round(qty * unitRate * 100) / 100;
  const tax = Math.round(taxable * (invoice.taxRate / 100) * 100) / 100;
  const totalReturn = Math.round((taxable + tax) * 100) / 100;

  // Post Double-Entry General Ledger Voucher (DEBIT_NOTE)
  let voucherNumber = `DN/${year}/${String(nextNum).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'DEBIT_NOTE',
      date: new Date().toISOString().slice(0, 10),
      narration: `Debit Note against ${invoice.invoiceNumber} (${invoice.supplierInvoiceNo}) - ${data.returnReason}`,
      totalAmount: totalReturn,
      branchName: 'Headquarters & Central Depot',
      createdByName: 'Purchase Accounting Officer',
      items: [
        {
          id: '1',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors - Paper Mills & Printers',
          ledgerCode: '2001',
          debitAmount: totalReturn,
          creditAmount: 0,
          description: `Debit to ${invoice.supplierName} (Reducing liability)`,
        },
        {
          id: '2',
          ledgerId: 'led_paper_purchase',
          ledgerName: 'Paper Reel & Printing Materials Purchase',
          ledgerCode: '4001',
          costCentreName: 'Production & Manufacturing',
          debitAmount: 0,
          creditAmount: taxable,
          description: `Reversal of purchase cost for ${qty} returned copies`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNumber = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for debit note:', err);
  }

  // Adjust Invoice Balance Due
  invoice.balanceDue = Math.max(0, Math.round((invoice.balanceDue - totalReturn) * 100) / 100);
  saveStoredInvoices(invoices);

  // Adjust Supplier Outstanding
  const suppliers = getStoredSuppliers();
  const supplier = suppliers.find((s) => s.name === invoice.supplierName);
  if (supplier) {
    supplier.currentOutstanding = Math.max(0, Math.round((supplier.currentOutstanding - totalReturn) * 100) / 100);
    saveStoredSuppliers(suppliers);
  }

  // Decrement Stock in Inventory
  try {
    const stocks = getStoredStocks();
    const stock = stocks.find((s) => s.sku === grn?.sku);
    if (stock) {
      stock.onHand = Math.max(0, stock.onHand - qty);
      stock.available = Math.max(0, stock.available - qty);
      saveStoredStocks(stocks);

      recordStockMovement({
        sku: stock.sku,
        title: stock.title,
        wh: stock.warehouseName,
        type: 'DAMAGE_WRITEOFF',
        ref: returnNumber,
        in: 0,
        out: qty,
        bal: stock.onHand,
        rate: unitRate,
        notes: `Returned to vendor: ${data.returnReason}`,
      });
    }
  } catch (err) {
    console.warn('Could not update stock for debit note:', err);
  }

  const created: DebitNoteItem = {
    id: 'dn_' + Date.now(),
    returnNumber,
    invoiceNumber: invoice.invoiceNumber,
    supplierName: invoice.supplierName,
    returnDate: new Date().toISOString().slice(0, 10),
    returnReason: data.returnReason,
    sku: grn ? grn.sku : 'PROD-BOOK-01',
    title: grn ? grn.title : 'Purchased Books/Material',
    returnedQty: qty,
    rate: unitRate,
    taxableAmount: taxable,
    taxAmount: tax,
    totalReturnAmount: totalReturn,
    status: 'CONFIRMED',
    voucherNumber,
  };

  const updatedReturns = [created, ...returns];
  saveStoredReturns(updatedReturns);
  return created;
}

export function getStoredPayments(): VendorPaymentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function saveStoredPayments(items: VendorPaymentItem[]) {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(items));
}

export function recordVendorPayment(data: {
  invoiceNumber: string;
  amount: number;
  paymentMethod: 'NEFT' | 'RTGS' | 'CHEQUE' | 'UPI';
  bankName: string;
  bankAccountNumber?: string;
  transactionRef: string;
  notes?: string;
}): VendorPaymentItem {
  const invoices = getStoredInvoices();
  const invoice = invoices.find((i) => i.invoiceNumber === data.invoiceNumber);
  if (!invoice) {
    throw new Error(`Invoice ${data.invoiceNumber} not found`);
  }

  const payments = getStoredPayments();
  const year = new Date().getFullYear();
  const nextNum = payments.length + 1;
  const paymentNumber = `VPAY/${year}/${String(nextNum).padStart(4, '0')}`;
  const amount = Math.min(invoice.balanceDue, Math.max(1, Number(data.amount) || 1));

  // Post Double-Entry Payment Voucher in GL
  let voucherNumber = `PV/${year}/${String(nextNum + 500).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'PAYMENT_VOUCHER',
      date: new Date().toISOString().slice(0, 10),
      narration: `Payment to ${invoice.supplierName} against ${invoice.invoiceNumber} (${invoice.supplierInvoiceNo}) - Ref: ${data.transactionRef}`,
      totalAmount: amount,
      branchName: 'Headquarters & Central Depot',
      createdByName: 'Treasury & Vendor Disbursements',
      items: [
        {
          id: '1',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors - Paper Mills & Printers',
          ledgerCode: '2001',
          debitAmount: amount,
          creditAmount: 0,
          description: `Debit Trade Creditors - ${invoice.supplierName}`,
        },
        {
          id: '2',
          ledgerId: 'led_bank_hdfc',
          ledgerName: 'HDFC Bank Corporate Current A/c',
          ledgerCode: '1002',
          debitAmount: 0,
          creditAmount: amount,
          description: `${data.paymentMethod} Remittance to ${invoice.supplierName} (Ref: ${data.transactionRef})`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNumber = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for vendor payment:', err);
  }

  // Update Invoice Balances
  invoice.paidAmount = Math.round((invoice.paidAmount + amount) * 100) / 100;
  invoice.balanceDue = Math.max(0, Math.round((invoice.balanceDue - amount) * 100) / 100);
  if (invoice.balanceDue === 0) {
    invoice.status = 'PAID';
  } else {
    invoice.status = 'PARTIALLY_PAID';
  }
  saveStoredInvoices(invoices);

  // Update Supplier Outstanding
  const suppliers = getStoredSuppliers();
  const supplier = suppliers.find((s) => s.name === invoice.supplierName);
  if (supplier) {
    supplier.currentOutstanding = Math.max(0, Math.round((supplier.currentOutstanding - amount) * 100) / 100);
    saveStoredSuppliers(suppliers);
  }

  const created: VendorPaymentItem = {
    id: 'vpay_' + Date.now(),
    paymentNumber,
    supplierName: invoice.supplierName,
    invoiceNumber: invoice.invoiceNumber,
    paymentDate: new Date().toISOString().slice(0, 10),
    amount,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName,
    bankAccountNumber: data.bankAccountNumber || '918010045678912',
    transactionRef: data.transactionRef,
    voucherNumber,
    notes: data.notes,
  };

  const updatedPayments = [created, ...payments];
  saveStoredPayments(updatedPayments);
  return created;
}

// Dynamic KPI computations
export function computePurchaseKpis() {
  const orders = getStoredOrders();
  const grns = getStoredGrns();
  const invoices = getStoredInvoices();
  const suppliers = getStoredSuppliers();

  const activeOrdersCount = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'COMPLETED').length;
  const committedPoValue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const totalGrnReceivedQty = grns.reduce((sum, g) => sum + g.receivedQty, 0);
  const totalGrnAcceptedQty = grns.reduce((sum, g) => sum + g.acceptedQty, 0);
  const totalGrnRejectedQty = grns.reduce((sum, g) => sum + g.rejectedQty, 0);

  const matchedInvoicesTotal = invoices
    .filter((i) => i.threeWayMatched)
    .reduce((sum, i) => sum + i.netPayable, 0);

  const totalOutstandingPayables = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Ageing Buckets calculation based on invoice due date
  const today = new Date().getTime();
  let currentNotDue = 0;
  let overdue1to30 = 0;
  let overdue31to60 = 0;
  let overdue61to90 = 0;
  let overdue90Plus = 0;

  invoices.forEach((inv) => {
    if (inv.balanceDue > 0) {
      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((today - dueTime) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        currentNotDue += inv.balanceDue;
      } else if (diffDays <= 30) {
        overdue1to30 += inv.balanceDue;
      } else if (diffDays <= 60) {
        overdue31to60 += inv.balanceDue;
      } else if (diffDays <= 90) {
        overdue61to90 += inv.balanceDue;
      } else {
        overdue90Plus += inv.balanceDue;
      }
    }
  });

  return {
    activeOrdersCount,
    committedPoValue,
    totalGrnReceivedQty,
    totalGrnAcceptedQty,
    totalGrnRejectedQty,
    matchedInvoicesTotal,
    totalOutstandingPayables,
    ageing: {
      currentNotDue,
      overdue1to30,
      overdue31to60,
      overdue61to90,
      overdue90Plus,
    },
  };
}
