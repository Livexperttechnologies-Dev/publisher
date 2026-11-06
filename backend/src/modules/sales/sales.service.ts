import {
  SalesChannel,
  SalesOrderStatus,
  SalesInvoiceStatus,
  PaymentMethod,
  SalesQuotation,
  SalesQuotationItem,
  SalesOrder,
  SalesOrderItem,
  DeliveryChallan,
  DeliveryChallanItem,
  SalesInvoice,
  SalesInvoiceItem,
  SalesReturn,
  SalesReturnItem,
  CustomerReceipt,
  PosShift,
  HeldCart,
  CustomerAgeingItem,
  CustomerStatementReport,
  CustomerStatementEntry,
  DailySalesReport,
  ChannelWiseSalesReport,
  SalesMarginReportItem,
  SalesQueryFilters,
  SplitPaymentDetail,
} from './sales.types';
import { accountingService } from '../accounting/accounting.service';
import { booksService } from '../books/books.service';
import { AppError } from '../../middleware/errorHandler';

// In-Memory Multi-Tenant Stores for Sales & Distribution Engine
const quotationsStore = new Map<string, SalesQuotation>();
const salesOrdersStore = new Map<string, SalesOrder>();
const challansStore = new Map<string, DeliveryChallan>();
const salesInvoicesStore = new Map<string, SalesInvoice>();
const salesReturnsStore = new Map<string, SalesReturn>();
const customerReceiptsStore = new Map<string, CustomerReceipt>();
const posShiftsStore = new Map<string, PosShift>();
const heldCartsStore = new Map<string, HeldCart>();

export class SalesService {
  constructor() {
    this.seedDefaultSalesData();
  }

  // --------------------------------------------------------------------------
  // SEED INITIAL SALES, POS & BILLING DATA
  // --------------------------------------------------------------------------
  private seedDefaultSalesData() {
    const defaultCompanyId = 'cmp_default_publisher';
    const now = new Date();

    // 1. Initial Wholesale Sales Order (National Book Distributors - 40% Trade Slab)
    const soId = 'so_seed_001';
    const initialSo: SalesOrder = {
      id: soId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      orderNumber: 'SO/2026/0001',
      customerId: 'pty_dist_national',
      customerName: 'National Book Distributors Pvt. Ltd.',
      customerGstin: '07AAACN5432D1Z9',
      customerStateCode: '07', // Delhi (Intra-state)
      salesChannel: 'DISTRIBUTOR',
      orderDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
      deliveryDueDate: new Date(now.getTime() + 15 * 86400000).toISOString(),
      paymentTerms: 'Net 60',
      subtotal: 597000.0,
      discountTotal: 398000.0,
      taxTotal: 0.0, // Educational Books exempt (HSN 4901)
      freightCharges: 3500.0,
      roundOff: 0.0,
      grandTotal: 600500.0,
      status: 'CONFIRMED',
      stockReserved: true,
      notes: 'Quarterly state-wide distributor dispatch of Mathematics Grade 12.',
      items: [
        {
          id: 'soi_001',
          salesOrderId: soId,
          bookId: 'bk_math_12_eng_pb',
          title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          isbn: '9788177099859',
          sku: 'BK-MATH-12-ENG-PB',
          mrp: 995.0,
          quantity: 1000,
          deliveredQuantity: 1000,
          unitRate: 995.0,
          discountPercent: 40.0, // 40% wholesale distributor margin
          taxRate: 0.0,
          cgstRate: 0.0,
          sgstRate: 0.0,
          igstRate: 0.0,
          cgstAmount: 0.0,
          sgstAmount: 0.0,
          igstAmount: 0.0,
          lineTotal: 597000.0,
          createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    };
    salesOrdersStore.set(soId, initialSo);

    // 2. Initial Delivery Challan
    const dcId = 'dc_seed_001';
    const initialDc: DeliveryChallan = {
      id: dcId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      challanNumber: 'DC/2026/0001',
      salesOrderId: soId,
      orderNumber: 'SO/2026/0001',
      customerId: 'pty_dist_national',
      customerName: 'National Book Distributors Pvt. Ltd.',
      deliveryAddress: 'Godown No. 4, Transport Nagar, Azadpur, New Delhi - 110033',
      dispatchDate: new Date(now.getTime() - 8 * 86400000).toISOString(),
      transporterName: 'VRL Logistics Express Ltd.',
      lrNumber: 'VRL-DEL-44192',
      vehicleNumber: 'DL-1L-9041',
      eWayBillNumber: 'EWB-DEL-26-90412856',
      status: 'DELIVERED',
      notes: 'Consignment safely delivered with delivery gate signoff.',
      items: [
        {
          id: 'dci_001',
          deliveryChallanId: dcId,
          bookId: 'bk_math_12_eng_pb',
          sku: 'BK-MATH-12-ENG-PB',
          title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          orderedQuantity: 1000,
          dispatchedQuantity: 1000,
          warehouseRack: 'RACK-A1-03',
          createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    };
    challansStore.set(dcId, initialDc);

    // 3. Initial Wholesale Tax Invoice (SINV/2026/0001) linked to SV/2026/0001
    const sinvId = 'sinv_seed_001';
    const initialInvoice: SalesInvoice = {
      id: sinvId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      invoiceNumber: 'SINV/2026/0001',
      salesChannel: 'DISTRIBUTOR',
      salesOrderId: soId,
      orderNumber: 'SO/2026/0001',
      deliveryChallanId: dcId,
      challanNumber: 'DC/2026/0001',
      customerId: 'pty_dist_national',
      customerName: 'National Book Distributors Pvt. Ltd.',
      customerGstin: '07AAACN5432D1Z9',
      customerStateCode: '07',
      placeOfSupply: '07-Delhi',
      invoiceDate: new Date(now.getTime() - 7 * 86400000).toISOString(),
      dueDate: new Date(now.getTime() + 53 * 86400000).toISOString(),
      paymentMethod: 'CUSTOMER_CREDIT',
      subtotalTaxable: 597000.0,
      cgstAmount: 0.0,
      sgstAmount: 0.0,
      igstAmount: 0.0,
      totalTaxAmount: 0.0,
      freightAmount: 3500.0,
      roundOff: 0.0,
      netPayable: 600500.0,
      paidAmount: 300000.0,
      balanceDue: 300500.0,
      status: 'PARTIALLY_PAID',
      accountingVoucherId: 'vch_sales_invoice_01',
      voucherNumber: 'SV/2026/0001',
      isPosCounterSale: false,
      notes: 'Wholesale distributor dispatch against purchase contract.',
      items: [
        {
          id: 'sini_001',
          salesInvoiceId: sinvId,
          bookId: 'bk_math_12_eng_pb',
          sku: 'BK-MATH-12-ENG-PB',
          barcode: '9788177099859',
          title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          hsnSacCode: '4901',
          mrp: 995.0,
          quantity: 1000,
          unitRate: 995.0,
          discountPercent: 40.0,
          discountAmount: 398000.0,
          taxableAmount: 597000.0,
          taxRate: 0.0,
          cgstRate: 0.0,
          sgstRate: 0.0,
          igstRate: 0.0,
          cgstAmount: 0.0,
          sgstAmount: 0.0,
          igstAmount: 0.0,
          totalAmount: 597000.0,
          purchaseCost: 350.0,
          createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    };
    salesInvoicesStore.set(sinvId, initialInvoice);

    // 4. Initial Active POS Cashier Shift
    const shiftId = 'pos_shift_001';
    const activeShift: PosShift = {
      id: shiftId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      cashierId: 'usr_cashier_01',
      cashierName: 'Rahul Verma (Head Cashier)',
      shiftOpenedAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
      openingFloatCash: 5000.0,
      cashSalesTotal: 12450.0,
      cardSalesTotal: 18500.0,
      upiSalesTotal: 9800.0,
      totalSales: 40750.0,
      closingDrawerCash: 0.0,
      cashVariance: 0.0,
      status: 'OPEN',
      notes: 'Morning counter sales session - Central Bookshop.',
      createdAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    };
    posShiftsStore.set(shiftId, activeShift);

    // 5. Initial Customer Receipt (₹300,000 from National Book Distributors)
    const rcptId = 'rcpt_seed_001';
    const initialReceipt: CustomerReceipt = {
      id: rcptId,
      companyId: defaultCompanyId,
      receiptNumber: 'RV/2026/0002',
      customerId: 'pty_dist_national',
      customerName: 'National Book Distributors Pvt. Ltd.',
      receiptDate: new Date(now.getTime() - 3 * 86400000).toISOString(),
      paymentMethod: 'BANK_TRANSFER_NEFT_RTGS',
      bankLedgerId: 'led_bank_sbi',
      bankLedgerName: 'State Bank of India Operative A/c',
      referenceNumber: 'NEFT-SBI-89412095',
      amount: 300000.0,
      discountAllowed: 0.0,
      tdsDeductedByCustomer: 0.0,
      invoicesSettled: [
        {
          invoiceId: sinvId,
          invoiceNumber: 'SINV/2026/0001',
          allocatedAmount: 300000.0,
        },
      ],
      accountingVoucherId: 'vch_rv_02',
      voucherNumber: 'RV/2026/0002',
      notes: 'On account partial settlement of Invoice SINV/2026/0001.',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    };
    customerReceiptsStore.set(rcptId, initialReceipt);
  }

  // ==========================================================================
  // 1. PRICING & DISCOUNT SLAB ENGINE
  // ==========================================================================
  calculatePricing(book: any, channel: SalesChannel, customerDiscountPercent?: number, quantity: number = 1) {
    const mrp = Number(book.mrp || 0);
    let baseRate = mrp;
    let discountPercent = customerDiscountPercent || 0;

    // Standard Publishing Channel Slabs
    if (customerDiscountPercent === undefined || customerDiscountPercent === 0) {
      switch (channel) {
        case 'DISTRIBUTOR':
        case 'WHOLESALE':
          // Standard wholesale distributor margin (40% discount)
          discountPercent = 40.0;
          break;
        case 'DEALER':
          // Standard book dealer margin (25% discount)
          discountPercent = 25.0;
          break;
        case 'INSTITUTION_SCHOOL':
          // Institutional educational adoption slab (20% discount)
          discountPercent = 20.0;
          break;
        case 'ONLINE_ORDER':
          // Standard e-commerce direct promotional discount (10%)
          discountPercent = 10.0;
          break;
        case 'RETAIL_COUNTER_POS':
        default:
          discountPercent = 0.0;
          break;
      }
    }

    // Additional Bulk Quantity Volume Discounts
    if (quantity >= 1000) {
      discountPercent += 5.0; // Extra 5% for orders of 1000+ copies
    } else if (quantity >= 500) {
      discountPercent += 2.5; // Extra 2.5% for orders of 500+ copies
    }

    discountPercent = Math.min(60.0, discountPercent); // Ceiling max 60%

    const discountAmount = Number(((baseRate * discountPercent) / 100).toFixed(2));
    const netRate = Number((baseRate - discountAmount).toFixed(2));

    return {
      mrp,
      baseRate,
      discountPercent,
      discountAmount,
      netRate,
    };
  }

  // ==========================================================================
  // 2. POS COUNTER ENGINE (BARCODE SCAN, SPLIT PAYMENTS, THERMAL RECEIPT)
  // ==========================================================================
  async scanItem(query: string): Promise<any> {
    const cleanQuery = query.trim().toLowerCase();
    const books = await booksService.getAll({ limit: 1000 });

    const matchedBook = books.items.find(
      (b) =>
        b.sku.toLowerCase() === cleanQuery ||
        (b.barcode && b.barcode.toLowerCase() === cleanQuery) ||
        (b.isbn13 && b.isbn13.replace(/[- ]/g, '').toLowerCase() === cleanQuery.replace(/[- ]/g, '')) ||
        (b.isbn10 && b.isbn10.replace(/[- ]/g, '').toLowerCase() === cleanQuery.replace(/[- ]/g, '')) ||
        b.title.toLowerCase().includes(cleanQuery)
    );

    if (!matchedBook) {
      throw new AppError(`Item not found for barcode / ISBN / SKU query: '${query}'`, 404);
    }

    const pricing = this.calculatePricing(matchedBook, 'RETAIL_COUNTER_POS', 0, 1);

    return {
      bookId: matchedBook.id,
      title: matchedBook.title,
      isbn: matchedBook.isbn13 || matchedBook.isbn10,
      sku: matchedBook.sku,
      barcode: matchedBook.barcode || matchedBook.isbn13,
      mrp: matchedBook.mrp,
      unitRate: pricing.netRate,
      discountPercent: pricing.discountPercent,
      taxRate: matchedBook.taxRate || 0.0,
      currentStock: matchedBook.openingStock || 0,
      warehouseRack: matchedBook.rackShelf || 'COUNTER-SHELF-01',
    };
  }

  async processPosSale(
    data: any,
    companyId: string = 'cmp_default_publisher',
    cashierName: string = 'Central POS Cashier'
  ): Promise<{ invoice: SalesInvoice; thermalReceipt: string }> {
    const year = new Date().getFullYear();
    const count = salesInvoicesStore.size + 1;
    const invoiceNumber = `POS/${year}/${String(count).padStart(5, '0')}`;
    const invoiceId = `pos_inv_${Date.now()}`;

    let subtotalTaxable = 0;
    let totalTaxAmount = 0;
    const invoiceItems: SalesInvoiceItem[] = [];

    for (let idx = 0; idx < data.items.length; idx++) {
      const line = data.items[idx];
      let book: any;
      try {
        book = await this.scanItem(line.sku);
      } catch (e) {
        book = {
          bookId: 'bk_custom',
          title: line.title || line.sku,
          sku: line.sku,
          mrp: line.mrp || 250.0,
          unitRate: line.mrp || 250.0,
          taxRate: 0.0,
          purchaseCost: 100.0,
        };
      }

      const qty = Number(line.quantity || 1);
      const mrp = Number(line.mrp || book.mrp || 0);
      const discountPercent = line.customDiscountPercent !== undefined ? line.customDiscountPercent : book.discountPercent || 0;
      const discountAmount = Number(((mrp * discountPercent) / 100).toFixed(2));
      const netRate = mrp - discountAmount;
      const taxableAmount = Number((qty * netRate).toFixed(2));
      const taxRate = book.taxRate || 0;

      // Intra-state counter sale: Delhi CGST + SGST
      const cgstAmount = Number(((taxableAmount * (taxRate / 2)) / 100).toFixed(2));
      const sgstAmount = Number(((taxableAmount * (taxRate / 2)) / 100).toFixed(2));
      const totalAmount = Number((taxableAmount + cgstAmount + sgstAmount).toFixed(2));

      subtotalTaxable += taxableAmount;
      totalTaxAmount += cgstAmount + sgstAmount;

      invoiceItems.push({
        id: `pos_itm_${Date.now()}_${idx}`,
        salesInvoiceId: invoiceId,
        bookId: book.bookId,
        sku: book.sku,
        barcode: book.barcode,
        title: book.title,
        hsnSacCode: '4901',
        mrp,
        quantity: qty,
        unitRate: mrp,
        discountPercent,
        discountAmount,
        taxableAmount,
        taxRate,
        cgstRate: taxRate / 2,
        sgstRate: taxRate / 2,
        igstRate: 0.0,
        cgstAmount,
        sgstAmount,
        igstAmount: 0.0,
        totalAmount,
        purchaseCost: book.purchaseCost || mrp * 0.4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // OUTWARD STOCK UPDATE: Immediate deduction from inventory
      await booksService.adjustStock(book.bookId || book.sku, -qty);
    }

    const netPayable = Math.round(subtotalTaxable + totalTaxAmount);
    const roundOff = Number((netPayable - (subtotalTaxable + totalTaxAmount)).toFixed(2));

    // Split Payment Processing
    const paymentMethod: PaymentMethod = data.paymentMethod || 'CASH';
    let cashAmount = 0;
    let cardAmount = 0;
    let upiAmount = 0;

    if (paymentMethod === 'SPLIT_PAYMENT' && data.paymentDetails) {
      cashAmount = Number(data.paymentDetails.cashAmount || 0);
      cardAmount = Number(data.paymentDetails.cardAmount || 0);
      upiAmount = Number(data.paymentDetails.upiAmount || 0);
    } else if (paymentMethod === 'CASH') {
      cashAmount = netPayable;
    } else if (paymentMethod === 'CARD') {
      cardAmount = netPayable;
    } else if (paymentMethod === 'UPI') {
      upiAmount = netPayable;
    }

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (POS COUNTER SALE)
    // ========================================================================
    // Dr: Cash in Hand (1001) for cash portion
    // Dr: HDFC Bank / Card (1002) for card/UPI portion
    // Cr: Book Sales Income (3001) for taxable amount + roundOff
    // Cr: Output GST Payable (2010) for tax amount
    const voucherItems: any[] = [];

    if (cashAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_cash',
        debitAmount: cashAmount,
        creditAmount: 0.0,
        description: `POS Counter Cash: Bill #${invoiceNumber}`,
      });
    }
    if (cardAmount + upiAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_bank_hdfc',
        debitAmount: Number((cardAmount + upiAmount).toFixed(2)),
        creditAmount: 0.0,
        description: `POS Card / UPI Settlement: Bill #${invoiceNumber}`,
      });
    }

    voucherItems.push({
      ledgerId: 'led_book_sales',
      debitAmount: 0.0,
      creditAmount: Number((subtotalTaxable + roundOff).toFixed(2)),
      description: `Retail Counter Book Sales: #${invoiceNumber}`,
    });

    if (totalTaxAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_gst_payable',
        debitAmount: 0.0,
        creditAmount: totalTaxAmount,
        description: `Output GST on Bill #${invoiceNumber}`,
      });
    }

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'SALES_INVOICE',
        entryDate: new Date().toISOString(),
        narration: `POS Retail Counter Sale #${invoiceNumber} (Cash: ₹${cashAmount}, Digital: ₹${cardAmount + upiAmount})`,
        items: voucherItems,
      },
      companyId,
      'usr_cashier'
    );

    const newInvoice: SalesInvoice = {
      id: invoiceId,
      companyId,
      branchId: 'brn_main_hq',
      invoiceNumber,
      salesChannel: 'RETAIL_COUNTER_POS',
      customerId: data.customerId || 'pty_walkin_retail',
      customerName: data.customerName || 'Walk-in Retail Customer',
      placeOfSupply: '07-Delhi',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      paymentMethod,
      paymentDetails: {
        cashAmount,
        cardAmount,
        upiAmount,
        cardLast4: data.paymentDetails?.cardLast4,
        upiRef: data.paymentDetails?.upiRef,
      },
      subtotalTaxable: Number(subtotalTaxable.toFixed(2)),
      cgstAmount: Number((totalTaxAmount / 2).toFixed(2)),
      sgstAmount: Number((totalTaxAmount / 2).toFixed(2)),
      igstAmount: 0.0,
      totalTaxAmount,
      freightAmount: 0.0,
      roundOff,
      netPayable,
      paidAmount: netPayable,
      balanceDue: 0.0,
      status: 'PAID',
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      isPosCounterSale: true,
      posShiftId: data.posShiftId || 'pos_shift_001',
      cashierName,
      items: invoiceItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    salesInvoicesStore.set(invoiceId, newInvoice);

    // Update POS Shift Totals
    const shift = posShiftsStore.get(data.posShiftId || 'pos_shift_001');
    if (shift && shift.status === 'OPEN') {
      shift.cashSalesTotal = Number((shift.cashSalesTotal + cashAmount).toFixed(2));
      shift.cardSalesTotal = Number((shift.cardSalesTotal + cardAmount).toFixed(2));
      shift.upiSalesTotal = Number((shift.upiSalesTotal + upiAmount).toFixed(2));
      shift.totalSales = Number((shift.totalSales + netPayable).toFixed(2));
      shift.updatedAt = new Date().toISOString();
      posShiftsStore.set(shift.id, shift);
    }

    // Generate Standard 80mm ESC/POS Printable Thermal String
    const thermalReceipt = this.generateThermalReceipt(newInvoice);

    return { invoice: newInvoice, thermalReceipt };
  }

  private generateThermalReceipt(inv: SalesInvoice): string {
    const pad = (str: string, len: number) => (str.length > len ? str.slice(0, len) : str.padEnd(len));
    const padLeft = (str: string, len: number) => (str.length > len ? str.slice(0, len) : str.padStart(len));

    let receipt = '';
    receipt += '================================================\n';
    receipt += '                  KIBO360                       \n';
    receipt += '       Apex Educational Publishers              \n';
    receipt += '   Central Retail Bookstore & Depot Depot       \n';
    receipt += '          GSTIN: 07AAAAA0000A1Z5                \n';
    receipt += '================================================\n';
    receipt += `Bill No: ${inv.invoiceNumber}  Date: ${inv.invoiceDate.slice(0, 10)}\n`;
    receipt += `Cashier: ${inv.cashierName || 'Rahul Verma'}  Time: ${new Date().toLocaleTimeString()}\n`;
    receipt += `Customer: ${inv.customerName}\n`;
    receipt += '------------------------------------------------\n';
    receipt += 'Item                       Qty    Rate    Amount\n';
    receipt += '------------------------------------------------\n';

    for (const item of inv.items) {
      const title = pad(item.title, 24);
      const qty = padLeft(String(item.quantity), 4);
      const rate = padLeft(item.unitRate.toFixed(2), 8);
      const total = padLeft(item.totalAmount.toFixed(2), 10);
      receipt += `${title} ${qty} ${rate} ${total}\n`;
    }

    receipt += '------------------------------------------------\n';
    receipt += `Subtotal Taxable:                   ₹${inv.subtotalTaxable.toFixed(2)}\n`;
    receipt += `GST Output Tax:                     ₹${inv.totalTaxAmount.toFixed(2)}\n`;
    receipt += `Round Off:                          ₹${inv.roundOff.toFixed(2)}\n`;
    receipt += `NET PAYABLE:                        ₹${inv.netPayable.toFixed(2)}\n`;
    receipt += '------------------------------------------------\n';
    receipt += `Payment Method: ${inv.paymentMethod}\n`;
    if (inv.paymentDetails?.cashAmount) receipt += `Cash Tendered: ₹${inv.paymentDetails.cashAmount.toFixed(2)}\n`;
    if (inv.paymentDetails?.upiAmount) receipt += `UPI Received: ₹${inv.paymentDetails.upiAmount.toFixed(2)} (Ref: ${inv.paymentDetails.upiRef || 'N/A'})\n`;
    if (inv.paymentDetails?.cardAmount) receipt += `Card Swiped: ₹${inv.paymentDetails.cardAmount.toFixed(2)} (Last 4: ${inv.paymentDetails.cardLast4 || 'XXXX'})\n`;
    receipt += `General Ledger Voucher: ${inv.voucherNumber}\n`;
    receipt += '================================================\n';
    receipt += '    Thank you for purchasing with KIBO360!      \n';
    receipt += '   Books once sold cannot be returned without   \n';
    receipt += '       original invoice within 7 days.          \n';
    receipt += '================================================\n';

    return receipt;
  }

  // Hold & Resume Carts
  async holdCart(data: any): Promise<HeldCart> {
    const holdRef = `HOLD-${Date.now().toString().slice(-4)}`;
    const held: HeldCart = {
      id: `hold_${Date.now()}`,
      cartHoldRef: holdRef,
      cashierName: data.cashierName || 'Counter Cashier',
      customerName: data.customerName || 'Counter Customer',
      heldAt: new Date().toISOString(),
      items: data.items,
      totalAmount: data.totalAmount,
    };
    heldCartsStore.set(held.id, held);
    return held;
  }

  async getHeldCarts(): Promise<HeldCart[]> {
    return Array.from(heldCartsStore.values());
  }

  async resumeHeldCart(holdId: string): Promise<HeldCart> {
    const cart = heldCartsStore.get(holdId);
    if (!cart) throw new AppError('Held cart not found or already resumed', 404);
    heldCartsStore.delete(holdId);
    return cart;
  }

  // POS Shift Closing (X/Z Report)
  async openPosShift(data: any, companyId: string = 'cmp_default_publisher'): Promise<PosShift> {
    const id = `pos_shift_${Date.now()}`;
    const newShift: PosShift = {
      id,
      companyId,
      branchId: 'brn_main_hq',
      cashierId: 'usr_cashier_01',
      cashierName: data.cashierName || 'Counter Cashier',
      shiftOpenedAt: new Date().toISOString(),
      openingFloatCash: Number(data.openingFloatCash || 5000),
      cashSalesTotal: 0.0,
      cardSalesTotal: 0.0,
      upiSalesTotal: 0.0,
      totalSales: 0.0,
      closingDrawerCash: 0.0,
      cashVariance: 0.0,
      status: 'OPEN',
      notes: 'Active POS session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    posShiftsStore.set(id, newShift);
    return newShift;
  }

  async closePosShift(shiftId: string, closingDrawerCash: number, notes?: string): Promise<PosShift> {
    const shift = posShiftsStore.get(shiftId);
    if (!shift) throw new AppError('POS Shift not found', 404);
    if (shift.status === 'CLOSED') throw new AppError('POS Shift is already closed', 400);

    const expectedCashInDrawer = Number((shift.openingFloatCash + shift.cashSalesTotal).toFixed(2));
    const cashVariance = Number((closingDrawerCash - expectedCashInDrawer).toFixed(2));

    shift.closingDrawerCash = closingDrawerCash;
    shift.cashVariance = cashVariance;
    shift.shiftClosedAt = new Date().toISOString();
    shift.status = 'CLOSED';
    if (notes) shift.notes = notes;
    shift.updatedAt = new Date().toISOString();

    posShiftsStore.set(shift.id, shift);
    return shift;
  }

  // ==========================================================================
  // 3. SALES QUOTATION ENGINE
  // ==========================================================================
  async getQuotations(filters?: SalesQueryFilters): Promise<{ items: SalesQuotation[]; total: number }> {
    let list = Array.from(quotationsStore.values());

    if (filters?.companyId) list = list.filter((q) => q.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((q) => q.customerId === filters.customerId);
    if (filters?.salesChannel) list = list.filter((q) => q.salesChannel === filters.salesChannel);
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.quotationNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.items.some((i) => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.quotationDate).getTime() - new Date(a.quotationDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getQuotationById(id: string): Promise<SalesQuotation | null> {
    return quotationsStore.get(id) || null;
  }

  async createQuotation(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<SalesQuotation> {
    const year = new Date().getFullYear();
    const count = quotationsStore.size + 1;
    const quotationNumber = `SQ/${year}/${String(count).padStart(4, '0')}`;
    const id = `sq_${Date.now()}`;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const items: SalesQuotationItem[] = data.items.map((i: any) => {
      const gross = i.quantity * i.unitRate;
      const discount = (gross * (i.discountPercent || 0)) / 100;
      const taxable = gross - discount;
      const tax = (taxable * (i.taxRate || 0)) / 100;
      const lineTotal = Number((taxable + tax).toFixed(2));

      subtotal += taxable;
      discountTotal += discount;
      taxTotal += tax;

      return {
        bookId: i.bookId,
        title: i.title,
        isbn: i.isbn,
        sku: i.sku,
        mrp: i.mrp || i.unitRate,
        unitRate: i.unitRate,
        discountPercent: i.discountPercent || 0,
        taxRate: i.taxRate || 0,
        quantity: i.quantity,
        lineTotal,
      };
    });

    const freightCharges = Number(data.freightCharges || 0);
    const grandTotal = Number((subtotal + taxTotal + freightCharges).toFixed(2));

    const newQuotation: SalesQuotation = {
      id,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      quotationNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      salesChannel: data.salesChannel || 'WHOLESALE',
      quotationDate: new Date().toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      paymentTerms: data.paymentTerms || 'Net 30',
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      freightCharges,
      grandTotal,
      status: 'ACTIVE',
      remarks: data.remarks,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotationsStore.set(id, newQuotation);
    return newQuotation;
  }

  // ==========================================================================
  // 4. SALES ORDER ENGINE (STOCK RESERVATION)
  // ==========================================================================
  async getOrders(filters?: SalesQueryFilters): Promise<{ items: SalesOrder[]; total: number }> {
    let list = Array.from(salesOrdersStore.values());

    if (filters?.companyId) list = list.filter((o) => o.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((o) => o.customerId === filters.customerId);
    if (filters?.salesChannel) list = list.filter((o) => o.salesChannel === filters.salesChannel);
    if (filters?.status) list = list.filter((o) => o.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getOrderById(id: string): Promise<SalesOrder | null> {
    return salesOrdersStore.get(id) || null;
  }

  async createOrder(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<SalesOrder> {
    const year = new Date().getFullYear();
    const count = salesOrdersStore.size + 1;
    const orderNumber = `SO/${year}/${String(count).padStart(4, '0')}`;
    const orderId = `so_${Date.now()}`;

    const isInterState = data.customerStateCode ? data.customerStateCode !== '07' : false;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const items: SalesOrderItem[] = data.items.map((i: any, idx: number) => {
      const gross = i.quantity * i.unitRate;
      const discount = (gross * (i.discountPercent || 0)) / 100;
      const taxable = gross - discount;
      const taxRate = i.taxRate || 0;

      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (taxRate > 0) {
        if (isInterState) {
          igstRate = taxRate;
          igstAmount = Number(((taxable * igstRate) / 100).toFixed(2));
        } else {
          cgstRate = taxRate / 2;
          sgstRate = taxRate / 2;
          cgstAmount = Number(((taxable * cgstRate) / 100).toFixed(2));
          sgstAmount = Number(((taxable * sgstRate) / 100).toFixed(2));
        }
      }

      const lineTotal = Number((taxable + cgstAmount + sgstAmount + igstAmount).toFixed(2));

      subtotal += taxable;
      discountTotal += discount;
      taxTotal += cgstAmount + sgstAmount + igstAmount;

      return {
        id: `soi_${Date.now()}_${idx}`,
        salesOrderId: orderId,
        bookId: i.bookId,
        title: i.title,
        isbn: i.isbn,
        sku: i.sku,
        mrp: i.mrp || i.unitRate,
        quantity: i.quantity,
        deliveredQuantity: 0,
        unitRate: i.unitRate,
        discountPercent: i.discountPercent || 0,
        taxRate,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        lineTotal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const freightCharges = Number(data.freightCharges || 0);
    const rawTotal = subtotal + taxTotal + freightCharges;
    const rounded = Math.round(rawTotal);
    const roundOff = Number((rounded - rawTotal).toFixed(2));
    const grandTotal = rounded;

    const newOrder: SalesOrder = {
      id: orderId,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      branchName: data.branchName || 'Headquarters & Central Depot',
      orderNumber,
      quotationRef: data.quotationRef,
      customerId: data.customerId,
      customerName: data.customerName,
      customerGstin: data.customerGstin,
      customerStateCode: data.customerStateCode,
      salesChannel: data.salesChannel || 'WHOLESALE',
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString() : new Date().toISOString(),
      deliveryDueDate: new Date(data.deliveryDueDate).toISOString(),
      paymentTerms: data.paymentTerms || 'Net 30',
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      freightCharges,
      roundOff,
      grandTotal,
      status: 'CONFIRMED',
      stockReserved: true, // Stock allocated
      notes: data.notes,
      createdById: userId,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    salesOrdersStore.set(orderId, newOrder);
    return newOrder;
  }

  async cancelOrder(id: string, reason: string): Promise<SalesOrder> {
    const order = salesOrdersStore.get(id);
    if (!order) throw new AppError('Sales Order not found', 404);
    if (order.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a completed/invoiced sales order', 400);
    }
    order.status = 'CANCELLED';
    order.stockReserved = false;
    order.notes = (order.notes ? order.notes + ' | ' : '') + `Cancelled: ${reason}`;
    order.updatedAt = new Date().toISOString();
    salesOrdersStore.set(id, order);
    return order;
  }

  // ==========================================================================
  // 5. DELIVERY CHALLAN ENGINE
  // ==========================================================================
  async getDeliveryChallans(filters?: SalesQueryFilters): Promise<{ items: DeliveryChallan[]; total: number }> {
    let list = Array.from(challansStore.values());
    if (filters?.companyId) list = list.filter((c) => c.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((c) => c.customerId === filters.customerId);

    list = list.sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getDeliveryChallanById(id: string): Promise<DeliveryChallan | null> {
    return challansStore.get(id) || null;
  }

  async createDeliveryChallan(data: any, companyId: string = 'cmp_default_publisher'): Promise<DeliveryChallan> {
    const year = new Date().getFullYear();
    const count = challansStore.size + 1;
    const challanNumber = `DC/${year}/${String(count).padStart(4, '0')}`;
    const challanId = `dc_${Date.now()}`;

    let orderNumber: string | undefined;
    if (data.salesOrderId) {
      const order = salesOrdersStore.get(data.salesOrderId);
      if (order) {
        orderNumber = order.orderNumber;
        // Update order delivered quantities
        for (const item of data.items) {
          const soItem = order.items.find((i) => i.sku === item.sku);
          if (soItem) {
            soItem.deliveredQuantity = Number((soItem.deliveredQuantity + item.dispatchedQuantity).toFixed(2));
          }
        }
        const allDelivered = order.items.every((i) => i.deliveredQuantity >= i.quantity);
        order.status = allDelivered ? 'COMPLETED' : 'PARTIALLY_DELIVERED';
        order.updatedAt = new Date().toISOString();
        salesOrdersStore.set(order.id, order);
      }
    }

    const items: DeliveryChallanItem[] = data.items.map((i: any, idx: number) => ({
      id: `dci_${Date.now()}_${idx}`,
      deliveryChallanId: challanId,
      bookId: i.bookId,
      sku: i.sku,
      title: i.title,
      orderedQuantity: i.orderedQuantity,
      dispatchedQuantity: i.dispatchedQuantity,
      warehouseRack: i.warehouseRack || 'MAIN-DISPATCH-DOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newChallan: DeliveryChallan = {
      id: challanId,
      companyId,
      branchId: 'brn_main_hq',
      challanNumber,
      salesOrderId: data.salesOrderId,
      orderNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      deliveryAddress: data.deliveryAddress,
      dispatchDate: data.dispatchDate ? new Date(data.dispatchDate).toISOString() : new Date().toISOString(),
      transporterName: data.transporterName,
      lrNumber: data.lrNumber,
      vehicleNumber: data.vehicleNumber,
      eWayBillNumber: data.eWayBillNumber,
      status: 'DISPATCHED',
      notes: data.notes,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    challansStore.set(challanId, newChallan);
    return newChallan;
  }

  // ==========================================================================
  // 6. SALES INVOICE (BILLING) & GENERAL LEDGER POSTING
  // ==========================================================================
  async getInvoices(filters?: SalesQueryFilters): Promise<{ items: SalesInvoice[]; total: number }> {
    let list = Array.from(salesInvoicesStore.values());

    if (filters?.companyId) list = list.filter((i) => i.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((i) => i.customerId === filters.customerId);
    if (filters?.salesChannel) list = list.filter((i) => i.salesChannel === filters.salesChannel);
    if (filters?.status) list = list.filter((i) => i.status === filters.status);
    if (filters?.isPosCounterSale !== undefined) {
      list = list.filter((i) => i.isPosCounterSale === filters.isPosCounterSale);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.items.some((item) => item.title.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getInvoiceById(id: string): Promise<SalesInvoice | null> {
    return salesInvoicesStore.get(id) || null;
  }

  async createInvoice(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<SalesInvoice> {
    const year = new Date().getFullYear();
    const count = salesInvoicesStore.size + 1;
    const prefix = data.isPosCounterSale ? 'POS' : 'SINV';
    const invoiceNumber = `${prefix}/${year}/${String(count).padStart(4, '0')}`;
    const invoiceId = `sinv_${Date.now()}`;

    const isInterState = data.customerStateCode ? data.customerStateCode !== '07' : false;

    let subtotalTaxable = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const items: SalesInvoiceItem[] = [];

    for (let idx = 0; idx < data.items.length; idx++) {
      const i = data.items[idx];
      const mrp = Number(i.mrp);
      const gross = i.quantity * i.unitRate;
      const discount = (gross * (i.discountPercent || 0)) / 100;
      const taxable = Number((gross - discount).toFixed(2));
      const taxRate = i.taxRate || 0;

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;

      if (taxRate > 0) {
        if (isInterState) {
          lineIgst = Number(((taxable * taxRate) / 100).toFixed(2));
        } else {
          lineCgst = Number(((taxable * (taxRate / 2)) / 100).toFixed(2));
          lineSgst = Number(((taxable * (taxRate / 2)) / 100).toFixed(2));
        }
      }

      const totalAmount = Number((taxable + lineCgst + lineSgst + lineIgst).toFixed(2));

      subtotalTaxable += taxable;
      cgstAmount += lineCgst;
      sgstAmount += lineSgst;
      igstAmount += lineIgst;

      items.push({
        id: `sini_${Date.now()}_${idx}`,
        salesInvoiceId: invoiceId,
        bookId: i.bookId,
        sku: i.sku,
        barcode: i.barcode,
        title: i.title,
        hsnSacCode: i.hsnSacCode || '4901',
        mrp,
        quantity: i.quantity,
        unitRate: i.unitRate,
        discountPercent: i.discountPercent || 0,
        discountAmount: discount,
        taxableAmount: taxable,
        taxRate,
        cgstRate: isInterState ? 0 : taxRate / 2,
        sgstRate: isInterState ? 0 : taxRate / 2,
        igstRate: isInterState ? taxRate : 0,
        cgstAmount: lineCgst,
        sgstAmount: lineSgst,
        igstAmount: lineIgst,
        totalAmount,
        purchaseCost: i.purchaseCost || mrp * 0.35,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // OUTWARD STOCK UPDATE: Immediate deduction from warehouse
      await booksService.adjustStock(i.bookId || i.sku, -i.quantity);
    }

    const totalTaxAmount = Number((cgstAmount + sgstAmount + igstAmount).toFixed(2));
    const freightAmount = Number(data.freightAmount || 0);
    const rawTotal = subtotalTaxable + totalTaxAmount + freightAmount;
    const rounded = Math.round(rawTotal);
    const roundOff = Number((rounded - rawTotal).toFixed(2));
    const netPayable = rounded;

    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(invoiceDate.getTime() + 30 * 86400000);

    const isCredit = data.paymentMethod === 'CUSTOMER_CREDIT' || !data.paymentMethod;

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (SALES_INVOICE)
    // ========================================================================
    // Dr: Trade Debtors (1010) if Credit sale, OR Cash (1001) / Bank (1002) if Immediate payment
    // Cr: Book Sales Income (3001) for taxable amount + freight + roundOff
    // Cr: GST Payable (2010) for Output GST (CGST + SGST or IGST)
    const voucherItems: any[] = [];

    const debitLedger = isCredit
      ? 'led_debtors'
      : data.paymentMethod === 'CASH'
      ? 'led_cash'
      : 'led_bank_hdfc';

    voucherItems.push({
      ledgerId: debitLedger,
      debitAmount: netPayable,
      creditAmount: 0.0,
      description: `Sales Invoice #${invoiceNumber} - ${data.customerName}`,
    });

    voucherItems.push({
      ledgerId: 'led_book_sales',
      debitAmount: 0.0,
      creditAmount: Number((subtotalTaxable + freightAmount + (roundOff > 0 ? roundOff : 0)).toFixed(2)),
      description: `Book Sales Revenue: ${data.salesChannel} Bill #${invoiceNumber}`,
    });

    if (totalTaxAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_gst_payable',
        debitAmount: 0.0,
        creditAmount: totalTaxAmount,
        description: `Output GST on Invoice #${invoiceNumber}`,
      });
    }

    if (roundOff < 0) {
      // Debit roundoff expense if roundOff negative
      voucherItems.push({
        ledgerId: 'led_book_sales',
        debitAmount: Math.abs(roundOff),
        creditAmount: 0.0,
        description: 'Invoice Rounding Allowance',
      });
    }

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'SALES_INVOICE',
        entryDate: invoiceDate.toISOString(),
        narration: `Tax Invoice #${invoiceNumber} to ${data.customerName} (${data.salesChannel})`,
        items: voucherItems,
      },
      companyId,
      userId
    );

    const newInvoice: SalesInvoice = {
      id: invoiceId,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      invoiceNumber,
      salesChannel: data.salesChannel || 'WHOLESALE',
      salesOrderId: data.salesOrderId,
      orderNumber: data.orderNumber,
      deliveryChallanId: data.deliveryChallanId,
      challanNumber: data.challanNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerGstin: data.customerGstin,
      customerStateCode: data.customerStateCode,
      placeOfSupply: data.placeOfSupply || '07-Delhi',
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      paymentMethod: data.paymentMethod || 'CUSTOMER_CREDIT',
      paymentDetails: data.paymentDetails,
      subtotalTaxable: Number(subtotalTaxable.toFixed(2)),
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      freightAmount,
      roundOff,
      netPayable,
      paidAmount: isCredit ? 0.0 : netPayable,
      balanceDue: isCredit ? netPayable : 0.0,
      status: isCredit ? 'POSTED' : 'PAID',
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      isPosCounterSale: !!data.isPosCounterSale,
      posShiftId: data.posShiftId,
      cashierName: data.cashierName,
      notes: data.notes,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    salesInvoicesStore.set(invoiceId, newInvoice);
    return newInvoice;
  }

  // ==========================================================================
  // 7. SALES RETURN & CREDIT NOTE ENGINE
  // ==========================================================================
  async getReturns(filters?: SalesQueryFilters): Promise<{ items: SalesReturn[]; total: number }> {
    let list = Array.from(salesReturnsStore.values());
    if (filters?.companyId) list = list.filter((r) => r.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((r) => r.customerId === filters.customerId);

    list = list.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getReturnById(id: string): Promise<SalesReturn | null> {
    return salesReturnsStore.get(id) || null;
  }

  async createReturn(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<SalesReturn> {
    const invoice = salesInvoicesStore.get(data.salesInvoiceId);
    if (!invoice) throw new AppError('Sales Invoice referenced by Return not found', 404);

    const year = new Date().getFullYear();
    const count = salesReturnsStore.size + 1;
    const creditNoteNumber = `CN/${year}/${String(count).padStart(4, '0')}`;
    const returnId = `sret_${Date.now()}`;

    const isInterState = invoice.customerStateCode ? invoice.customerStateCode !== '07' : false;

    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const returnItems: SalesReturnItem[] = [];

    for (const item of data.items) {
      const lineTaxable = Number((item.returnedQty * item.unitRate).toFixed(2));
      const taxRate = item.taxRate || 0;

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;

      if (taxRate > 0) {
        if (isInterState) {
          lineIgst = Number(((lineTaxable * taxRate) / 100).toFixed(2));
        } else {
          lineCgst = Number(((lineTaxable * (taxRate / 2)) / 100).toFixed(2));
          lineSgst = Number(((lineTaxable * (taxRate / 2)) / 100).toFixed(2));
        }
      }

      const totalAmount = lineTaxable + lineCgst + lineSgst + lineIgst;

      taxableAmount += lineTaxable;
      cgstAmount += lineCgst;
      sgstAmount += lineSgst;
      igstAmount += lineIgst;

      returnItems.push({
        bookId: item.bookId,
        sku: item.sku,
        title: item.title,
        returnedQty: item.returnedQty,
        unitRate: item.unitRate,
        taxableAmount: lineTaxable,
        totalAmount,
      });

      // RESTORE INVENTORY STOCK
      await booksService.adjustStock(item.bookId || item.sku, item.returnedQty);
    }

    const totalReturnAmount = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

    // Update invoice balance due
    invoice.balanceDue = Math.max(0, Number((invoice.balanceDue - totalReturnAmount).toFixed(2)));
    if (invoice.balanceDue === 0) invoice.status = 'PAID';
    invoice.updatedAt = new Date().toISOString();
    salesInvoicesStore.set(invoice.id, invoice);

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (CREDIT_NOTE)
    // ========================================================================
    // Dr: Book Sales Income (3001) for taxableAmount (Revenue reduced)
    // Dr: GST Payable (2010) for Output GST reversal
    // Cr: Trade Debtors (1010) for totalReturnAmount (Receivable reduced)
    const voucherItems: any[] = [
      {
        ledgerId: 'led_book_sales',
        debitAmount: taxableAmount,
        creditAmount: 0.0,
        description: `Credit Note ${creditNoteNumber}: Return of books by ${invoice.customerName}`,
      },
    ];

    if (cgstAmount + sgstAmount + igstAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_gst_payable',
        debitAmount: Number((cgstAmount + sgstAmount + igstAmount).toFixed(2)),
        creditAmount: 0.0,
        description: `Output GST Reversal on Credit Note ${creditNoteNumber}`,
      });
    }

    voucherItems.push({
      ledgerId: 'led_debtors',
      debitAmount: 0.0,
      creditAmount: totalReturnAmount,
      description: `Accounts Receivable credit on Return ${creditNoteNumber}`,
    });

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'CREDIT_NOTE',
        entryDate: new Date().toISOString(),
        narration: `Credit Note ${creditNoteNumber} issued to ${invoice.customerName} - Goods Returned (Ref Inv #${invoice.invoiceNumber})`,
        items: voucherItems,
      },
      companyId,
      userId
    );

    const newReturn: SalesReturn = {
      id: returnId,
      companyId,
      creditNoteNumber,
      salesInvoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      returnDate: new Date().toISOString(),
      returnReason: data.returnReason,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalReturnAmount,
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      items: returnItems,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    salesReturnsStore.set(returnId, newReturn);
    return newReturn;
  }

  // ==========================================================================
  // 8. CUSTOMER RECEIPT ENGINE (PAYMENT RECEIPT & INVOICE SETTLEMENT)
  // ==========================================================================
  async getReceipts(filters?: SalesQueryFilters): Promise<{ items: CustomerReceipt[]; total: number }> {
    let list = Array.from(customerReceiptsStore.values());
    if (filters?.companyId) list = list.filter((r) => r.companyId === filters.companyId);
    if (filters?.customerId) list = list.filter((r) => r.customerId === filters.customerId);

    list = list.sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getReceiptById(id: string): Promise<CustomerReceipt | null> {
    return customerReceiptsStore.get(id) || null;
  }

  async createReceipt(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<CustomerReceipt> {
    const totalAmount = Number(data.amount);
    let customerName = '';

    // Apply allocations to open invoices
    for (const alloc of data.invoicesSettled) {
      const inv = salesInvoicesStore.get(alloc.invoiceId);
      if (inv) {
        customerName = inv.customerName;
        inv.paidAmount = Number((inv.paidAmount + alloc.allocatedAmount).toFixed(2));
        inv.balanceDue = Math.max(0, Number((inv.balanceDue - alloc.allocatedAmount).toFixed(2)));
        inv.status = inv.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
        inv.updatedAt = new Date().toISOString();
        salesInvoicesStore.set(inv.id, inv);
      }
    }

    if (!customerName) {
      customerName = data.customerName || 'Trade Debtor Customer';
    }

    const year = new Date().getFullYear();
    const count = customerReceiptsStore.size + 1;
    const receiptNumber = `RV/${year}/${String(count).padStart(4, '0')}`;
    const receiptId = `rcpt_${Date.now()}`;

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (RECEIPT_VOUCHER)
    // ========================================================================
    // Dr: Bank or Cash Ledger (1001 / 1002 / 1003) for amount received
    // Cr: Trade Debtors (1010) for amount (Receivable settled)
    const voucherItems: any[] = [
      {
        ledgerId: data.bankLedgerId || 'led_bank_hdfc',
        debitAmount: totalAmount,
        creditAmount: 0.0,
        description: `Customer Receipt via ${data.paymentMethod} (Ref: ${data.referenceNumber || 'N/A'})`,
      },
      {
        ledgerId: 'led_debtors',
        debitAmount: 0.0,
        creditAmount: totalAmount,
        description: `Settlement of invoices for ${customerName}`,
      },
    ];

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'RECEIPT_VOUCHER',
        entryDate: data.receiptDate ? new Date(data.receiptDate).toISOString() : new Date().toISOString(),
        narration: `Customer Receipt from ${customerName} via ${data.paymentMethod} (Ref: ${data.referenceNumber || receiptNumber})`,
        items: voucherItems,
      },
      companyId,
      userId
    );

    const bankLedgerName =
      data.bankLedgerId === 'led_bank_sbi'
        ? 'State Bank of India Operative A/c'
        : data.bankLedgerId === 'led_cash'
        ? 'Cash in Hand (Central Cashier)'
        : 'HDFC Bank Corporate Current A/c';

    const newReceipt: CustomerReceipt = {
      id: receiptId,
      companyId,
      receiptNumber,
      customerId: data.customerId,
      customerName,
      receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString() : new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER_NEFT_RTGS',
      bankLedgerId: data.bankLedgerId || 'led_bank_hdfc',
      bankLedgerName,
      referenceNumber: data.referenceNumber,
      amount: totalAmount,
      discountAllowed: Number(data.discountAllowed || 0),
      tdsDeductedByCustomer: Number(data.tdsDeductedByCustomer || 0),
      invoicesSettled: data.invoicesSettled,
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customerReceiptsStore.set(receiptId, newReceipt);
    return newReceipt;
  }

  // ==========================================================================
  // 9. CUSTOMER AGEING & DETAILED RUNNING LEDGER STATEMENT
  // ==========================================================================
  async getCustomerAgeing(companyId?: string): Promise<{ items: CustomerAgeingItem[]; totalReceivables: number }> {
    let invoices = Array.from(salesInvoicesStore.values()).filter((i) => i.status !== 'PAID' && i.balanceDue > 0);
    if (companyId) invoices = invoices.filter((i) => i.companyId === companyId);

    const now = new Date();
    const customerMap = new Map<string, CustomerAgeingItem>();

    for (const inv of invoices) {
      if (!customerMap.has(inv.customerId)) {
        customerMap.set(inv.customerId, {
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerGstin: inv.customerGstin,
          creditLimit: 2500000.0,
          creditDays: 60,
          currentNotDue: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90Plus: 0,
          totalOutstanding: 0,
        });
      }

      const ageing = customerMap.get(inv.customerId)!;
      const dueDate = new Date(inv.dueDate);
      const diffMs = now.getTime() - dueDate.getTime();
      const overdueDays = Math.floor(diffMs / 86400000);

      const bal = inv.balanceDue;
      ageing.totalOutstanding = Number((ageing.totalOutstanding + bal).toFixed(2));

      if (overdueDays <= 0) {
        ageing.currentNotDue = Number((ageing.currentNotDue + bal).toFixed(2));
      } else if (overdueDays <= 30) {
        ageing.days1to30 = Number((ageing.days1to30 + bal).toFixed(2));
      } else if (overdueDays <= 60) {
        ageing.days31to60 = Number((ageing.days31to60 + bal).toFixed(2));
      } else if (overdueDays <= 90) {
        ageing.days61to90 = Number((ageing.days61to90 + bal).toFixed(2));
      } else {
        ageing.days90Plus = Number((ageing.days90Plus + bal).toFixed(2));
      }
    }

    const items = Array.from(customerMap.values());
    const totalReceivables = Number(items.reduce((sum, item) => sum + item.totalOutstanding, 0).toFixed(2));

    return { items, totalReceivables };
  }

  async getCustomerStatement(customerId: string): Promise<CustomerStatementReport> {
    const invoices = Array.from(salesInvoicesStore.values()).filter((i) => i.customerId === customerId);
    const receipts = Array.from(customerReceiptsStore.values()).filter((r) => r.customerId === customerId);
    const returns = Array.from(salesReturnsStore.values()).filter((r) => r.customerId === customerId);

    const customerName = invoices[0]?.customerName || receipts[0]?.customerName || 'Customer';
    const customerGstin = invoices[0]?.customerGstin;

    const rawEntries: { date: string; refType: any; refNumber: string; description: string; debit: number; credit: number }[] = [];

    // Sales Invoices Debit the customer (they owe us money)
    for (const inv of invoices) {
      rawEntries.push({
        date: inv.invoiceDate,
        refType: 'SALES_INVOICE',
        refNumber: inv.invoiceNumber,
        description: `Tax Invoice #${inv.invoiceNumber} (${inv.salesChannel})`,
        debit: inv.netPayable,
        credit: 0,
      });
    }

    // Receipts Credit the customer (they paid us money)
    for (const rcpt of receipts) {
      rawEntries.push({
        date: rcpt.receiptDate,
        refType: 'RECEIPT',
        refNumber: rcpt.receiptNumber,
        description: `Payment Receipt via ${rcpt.paymentMethod} (Ref: ${rcpt.referenceNumber || 'N/A'})`,
        debit: 0,
        credit: rcpt.amount,
      });
    }

    // Credit Notes Credit the customer
    for (const ret of returns) {
      rawEntries.push({
        date: ret.returnDate,
        refType: 'CREDIT_NOTE',
        refNumber: ret.creditNoteNumber,
        description: `Credit Note: Goods Returned (${ret.returnReason})`,
        debit: 0,
        credit: ret.totalReturnAmount,
      });
    }

    rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const entries: CustomerStatementEntry[] = rawEntries.map((e) => {
      runningBalance = Number((runningBalance + e.debit - e.credit).toFixed(2));
      return {
        ...e,
        runningBalance,
      };
    });

    return {
      customerId,
      customerName,
      customerGstin,
      openingBalance: 0.0,
      entries,
      closingBalance: runningBalance,
    };
  }

  // ==========================================================================
  // 10. SALES REPORTS & ANALYTICS
  // ==========================================================================
  async getDailySalesReport(date?: string, companyId?: string): Promise<DailySalesReport> {
    const targetDate = date ? date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    let list = Array.from(salesInvoicesStore.values());
    if (companyId) list = list.filter((i) => i.companyId === companyId);

    const daysInvoices = list.filter((i) => i.invoiceDate.slice(0, 10) === targetDate);

    let grossSales = 0;
    let totalDiscount = 0;
    let netSales = 0;
    let taxCollected = 0;
    let cashCollected = 0;
    let cardCollected = 0;
    let upiCollected = 0;
    let creditSales = 0;

    for (const inv of daysInvoices) {
      grossSales += inv.subtotalTaxable;
      netSales += inv.netPayable;
      taxCollected += inv.totalTaxAmount;

      if (inv.paymentMethod === 'CASH') cashCollected += inv.netPayable;
      else if (inv.paymentMethod === 'CARD') cardCollected += inv.netPayable;
      else if (inv.paymentMethod === 'UPI') upiCollected += inv.netPayable;
      else if (inv.paymentMethod === 'SPLIT_PAYMENT' && inv.paymentDetails) {
        cashCollected += inv.paymentDetails.cashAmount || 0;
        cardCollected += inv.paymentDetails.cardAmount || 0;
        upiCollected += inv.paymentDetails.upiAmount || 0;
      } else {
        creditSales += inv.netPayable;
      }

      for (const item of inv.items) {
        totalDiscount += item.discountAmount || 0;
      }
    }

    return {
      date: targetDate,
      totalInvoices: daysInvoices.length,
      grossSales: Number(grossSales.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      netSales: Number(netSales.toFixed(2)),
      taxCollected: Number(taxCollected.toFixed(2)),
      cashCollected: Number(cashCollected.toFixed(2)),
      cardCollected: Number(cardCollected.toFixed(2)),
      upiCollected: Number(upiCollected.toFixed(2)),
      creditSales: Number(creditSales.toFixed(2)),
    };
  }

  async getChannelWiseSalesReport(companyId?: string): Promise<ChannelWiseSalesReport[]> {
    let list = Array.from(salesInvoicesStore.values());
    if (companyId) list = list.filter((i) => i.companyId === companyId);

    const totalTurnover = list.reduce((sum, i) => sum + i.netPayable, 0) || 1;
    const map = new Map<SalesChannel, { count: number; revenue: number }>();

    for (const inv of list) {
      if (!map.has(inv.salesChannel)) map.set(inv.salesChannel, { count: 0, revenue: 0 });
      const ch = map.get(inv.salesChannel)!;
      ch.count++;
      ch.revenue += inv.netPayable;
    }

    const channelNames: Record<SalesChannel, string> = {
      RETAIL_COUNTER_POS: 'Retail Counter POS',
      WHOLESALE: 'Wholesale Trade',
      DISTRIBUTOR: 'National Distributors',
      DEALER: 'Book Dealers & Resellers',
      INSTITUTION_SCHOOL: 'Schools & Institutions',
      ONLINE_ORDER: 'Online Web Store',
      DIRECT_PUBLISHER: 'Direct Publisher Orders',
    };

    return Array.from(map.entries()).map(([channel, val]) => ({
      channel,
      channelName: channelNames[channel] || channel,
      invoiceCount: val.count,
      totalRevenue: Number(val.revenue.toFixed(2)),
      sharePercentage: Number(((val.revenue / totalTurnover) * 100).toFixed(1)),
    }));
  }

  async getBookWiseSalesReport(companyId?: string): Promise<{ sku: string; title: string; quantitySold: number; totalRevenue: number }[]> {
    let list = Array.from(salesInvoicesStore.values());
    if (companyId) list = list.filter((i) => i.companyId === companyId);

    const map = new Map<string, { sku: string; title: string; quantitySold: number; totalRevenue: number }>();

    for (const inv of list) {
      for (const item of inv.items) {
        if (!map.has(item.sku)) {
          map.set(item.sku, { sku: item.sku, title: item.title, quantitySold: 0, totalRevenue: 0 });
        }
        const b = map.get(item.sku)!;
        b.quantitySold += item.quantity;
        b.totalRevenue = Number((b.totalRevenue + item.totalAmount).toFixed(2));
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getSalesMarginReport(companyId?: string): Promise<SalesMarginReportItem[]> {
    let list = Array.from(salesInvoicesStore.values());
    if (companyId) list = list.filter((i) => i.companyId === companyId);

    const map = new Map<string, { sku: string; title: string; quantitySold: number; revenue: number; totalCogs: number }>();

    for (const inv of list) {
      for (const item of inv.items) {
        if (!map.has(item.sku)) {
          map.set(item.sku, { sku: item.sku, title: item.title, quantitySold: 0, revenue: 0, totalCogs: 0 });
        }
        const m = map.get(item.sku)!;
        const cogs = item.quantity * (item.purchaseCost || 0);
        m.quantitySold += item.quantity;
        m.revenue += item.taxableAmount;
        m.totalCogs += cogs;
      }
    }

    return Array.from(map.values()).map((item) => {
      const grossMarginAmount = Number((item.revenue - item.totalCogs).toFixed(2));
      const grossMarginPercentage = item.revenue > 0 ? Number(((grossMarginAmount / item.revenue) * 100).toFixed(1)) : 0;
      return {
        sku: item.sku,
        title: item.title,
        quantitySold: item.quantitySold,
        revenue: Number(item.revenue.toFixed(2)),
        totalCogs: Number(item.totalCogs.toFixed(2)),
        grossMarginAmount,
        grossMarginPercentage,
      };
    });
  }
}

export const salesService = new SalesService();
