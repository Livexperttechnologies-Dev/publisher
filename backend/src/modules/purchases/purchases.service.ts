import {
  PurchaseRequisition,
  PurchaseRequisitionItem,
  SupplierQuotation,
  SupplierQuotationItem,
  SupplierComparisonReport,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceiptNote,
  GoodsReceiptNoteItem,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  PurchaseReturn,
  PurchaseReturnItem,
  SupplierPayment,
  SupplierAgeingItem,
  SupplierStatementReport,
  SupplierStatementEntry,
  PurchaseRegisterReport,
  PurchaseRegisterItem,
  PurchasesQueryFilters,
  RequisitionStatus,
  PurchaseOrderStatus,
  GRNStatus,
  PurchaseInvoiceStatus,
} from './purchases.types';
import { accountingService } from '../accounting/accounting.service';
import { booksService } from '../books/books.service';
import { AppError } from '../../middleware/errorHandler';

// In-Memory Storage Maps for High-Performance Multi-Tenant Purchase Hub
const requisitionsStore = new Map<string, PurchaseRequisition>();
const quotationsStore = new Map<string, SupplierQuotation>();
const purchaseOrdersStore = new Map<string, PurchaseOrder>();
const grnStore = new Map<string, GoodsReceiptNote>();
const purchaseInvoicesStore = new Map<string, PurchaseInvoice>();
const purchaseReturnsStore = new Map<string, PurchaseReturn>();
const supplierPaymentsStore = new Map<string, SupplierPayment>();

export class PurchasesService {
  constructor() {
    this.seedDefaultPurchaseData();
  }

  // --------------------------------------------------------------------------
  // SEED INITIAL ENTERPRISE PURCHASE DATA
  // --------------------------------------------------------------------------
  private seedDefaultPurchaseData() {
    const defaultCompanyId = 'cmp_default_publisher';
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Initial Purchase Requisition
    const prId = 'pr_seed_001';
    const initialPr: PurchaseRequisition = {
      id: prId,
      companyId: defaultCompanyId,
      requisitionNo: 'PR/2026/0001',
      department: 'Editorial & Production Depot',
      requestDate: new Date(now.getTime() - 25 * 86400000).toISOString(),
      requiredDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
      priority: 'HIGH',
      requestedBy: 'Production Chief Engineer',
      status: 'PO_RAISED',
      remarks: 'Quarterly academic print run paper replenishment and textbook binding covers.',
      items: [
        {
          bookId: 'bk_math_12_eng_pb',
          title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          isbn: '9788177099859',
          sku: 'BK-MATH-12-ENG-PB',
          quantity: 1500,
          estimatedRate: 350.0,
          estimatedAmount: 525000.0,
        },
        {
          title: 'Cream Wove Maplitho Paper Reels (70 GSM)',
          sku: 'RAW-PAPER-MAP-70',
          quantity: 20, // 20 metric tons
          estimatedRate: 75000.0,
          estimatedAmount: 1500000.0,
        },
      ],
      totalEstimated: 2025000.0,
      approvedBy: 'Managing Director & Publisher',
      approvedAt: new Date(now.getTime() - 24 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 24 * 86400000).toISOString(),
    };
    requisitionsStore.set(prId, initialPr);

    // 2. Initial Supplier Quotations (For Side-by-Side Comparison)
    const quote1: SupplierQuotation = {
      id: 'qt_seed_bilt_001',
      companyId: defaultCompanyId,
      quotationNo: 'QT/2026/0001',
      supplierId: 'pty_supp_papermill',
      supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
      requisitionId: prId,
      quotationDate: new Date(now.getTime() - 22 * 86400000).toISOString(),
      validUntil: new Date(now.getTime() + 30 * 86400000).toISOString(),
      paymentTerms: 'Net 45',
      deliveryTerms: 'Ex-Factory Gurugram',
      leadTimeDays: 7,
      items: [
        {
          bookId: 'bk_math_12_eng_pb',
          description: 'Print & Binding: Class XII Mathematics Complete Set',
          sku: 'BK-MATH-12-ENG-PB',
          quantity: 1500,
          rate: 340.0,
          discountPercent: 5.0,
          taxPercent: 0.0, // Educational books exempt HSN 4901
          lineTotal: 484500.0,
        },
        {
          description: 'Cream Wove Maplitho Paper Reels (70 GSM)',
          sku: 'RAW-PAPER-MAP-70',
          quantity: 20,
          rate: 72000.0,
          discountPercent: 3.0,
          taxPercent: 12.0, // Paper 12% GST
          lineTotal: 1564224.0,
        },
      ],
      subtotal: 1881300.0,
      taxAmount: 167424.0,
      additionalCharges: 15000.0, // Freight & loading
      grandTotal: 2063724.0,
      status: 'ACCEPTED',
      notes: 'Premier mill rate with guaranteed burst factor and opacity.',
      createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 21 * 86400000).toISOString(),
    };
    quotationsStore.set(quote1.id, quote1);

    const quote2: SupplierQuotation = {
      id: 'qt_seed_century_002',
      companyId: defaultCompanyId,
      quotationNo: 'QT/2026/0002',
      supplierId: 'pty_supp_century',
      supplierName: 'Century Pulp & Paper Mills Ltd.',
      requisitionId: prId,
      quotationDate: new Date(now.getTime() - 22 * 86400000).toISOString(),
      validUntil: new Date(now.getTime() + 30 * 86400000).toISOString(),
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOR Delhi Central Godown',
      leadTimeDays: 14,
      items: [
        {
          bookId: 'bk_math_12_eng_pb',
          description: 'Print & Binding: Class XII Mathematics Complete Set',
          sku: 'BK-MATH-12-ENG-PB',
          quantity: 1500,
          rate: 360.0,
          discountPercent: 2.0,
          taxPercent: 0.0,
          lineTotal: 529200.0,
        },
        {
          description: 'Cream Wove Maplitho Paper Reels (70 GSM)',
          sku: 'RAW-PAPER-MAP-70',
          quantity: 20,
          rate: 74500.0,
          discountPercent: 4.0,
          taxPercent: 12.0,
          lineTotal: 1601856.0,
        },
      ],
      subtotal: 1959600.0,
      taxAmount: 171456.0,
      additionalCharges: 0.0,
      grandTotal: 2131056.0,
      status: 'ACTIVE',
      notes: 'Alternate vendor quote with higher lead time.',
      createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
    };
    quotationsStore.set(quote2.id, quote2);

    // 3. Initial Purchase Order (PO/2026/0001)
    const poId = 'po_seed_001';
    const initialPo: PurchaseOrder = {
      id: poId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      poNumber: 'PO/2026/0001',
      orderDate: new Date(now.getTime() - 20 * 86400000).toISOString(),
      expectedDelivery: new Date(now.getTime() - 12 * 86400000).toISOString(),
      supplierId: 'pty_supp_papermill',
      supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
      supplierGstin: '06AAACB9876E1Z1',
      supplierAddress: 'First India Place, MG Road, Gurugram, Haryana - 122002',
      supplierStateCode: '06', // Haryana (Inter-State IGST from Delhi '07')
      quotationRef: 'QT/2026/0001',
      requisitionRef: 'PR/2026/0001',
      items: [
        {
          id: 'poi_001',
          purchaseOrderId: poId,
          bookId: 'bk_math_12_eng_pb',
          bookTitle: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          isbn: '9788177099859',
          sku: 'BK-MATH-12-ENG-PB',
          quantity: 1500,
          receivedQuantity: 1500, // Fully received via GRN
          unitRate: 340.0,
          discountPercent: 5.0,
          taxPercent: 0.0,
          cgstRate: 0.0,
          sgstRate: 0.0,
          igstRate: 0.0,
          cgstAmount: 0.0,
          sgstAmount: 0.0,
          igstAmount: 0.0,
          lineTotal: 484500.0, // (1500 * 340 * 0.95)
          createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
        },
      ],
      subtotal: 484500.0,
      discountTotal: 25500.0,
      taxTotal: 0.0,
      freightCharges: 5500.0,
      additionalCharges: 0.0,
      roundOff: 0.0,
      grandTotal: 490000.0,
      paymentTerms: 'Net 45',
      deliveryTerms: 'Door Delivery Central Godown',
      status: 'COMPLETED',
      notes: 'Urgent print run requirement for school academic year commencement.',
      createdById: 'usr_super_admin',
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    };
    purchaseOrdersStore.set(poId, initialPo);

    // 4. Initial Goods Receipt Note (GRN/2026/0001)
    const grnId = 'grn_seed_001';
    const initialGrn: GoodsReceiptNote = {
      id: grnId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      grnNumber: 'GRN/2026/0001',
      purchaseOrderId: poId,
      poNumber: 'PO/2026/0001',
      supplierId: 'pty_supp_papermill',
      supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
      receiptDate: new Date(now.getTime() - 14 * 86400000).toISOString(),
      warehouseId: 'tax_wh_01',
      warehouseName: 'Central Godown / Main Depot',
      deliveryChallanNo: 'DC-BILT-98124',
      transporterName: 'VRL Logistics Express Ltd.',
      lrNumber: 'VRL-DEL-89412',
      vehicleNumber: 'HR-55-AJ-1298',
      status: 'POSTED_TO_INVENTORY',
      notes: 'Shipment delivered in good order. 1,480 units accepted, 20 defective binding units rejected at dock.',
      receivedBy: 'Warehouse Dock Supervisor',
      inspectedBy: 'Chief Quality Officer',
      items: [
        {
          id: 'grni_001',
          goodsReceiptNoteId: grnId,
          bookId: 'bk_math_12_eng_pb',
          bookTitle: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
          isbn: '9788177099859',
          sku: 'BK-MATH-12-ENG-PB',
          orderedQuantity: 1500,
          receivedQuantity: 1500,
          acceptedQuantity: 1480,
          rejectedQuantity: 20,
          damagedQuantity: 0,
          pendingQuantity: 0,
          warehouseRack: 'RACK-A1-03',
          batchBarcode: 'BC-2026-MATH12-001',
          rejectionReason: 'Creased cover lamination and trimmed margin defect on 20 copies',
          createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    };
    grnStore.set(grnId, initialGrn);

    // 5. Initial Purchase Invoice (PINV/2026/0001) with 3-Way Match Verified
    const pinvId = 'pinv_seed_001';
    const initialInvoice: PurchaseInvoice = {
      id: pinvId,
      companyId: defaultCompanyId,
      branchId: 'brn_main_hq',
      invoiceNumber: 'PINV/2026/0001',
      supplierInvoiceNo: 'BILT/INV/9821',
      invoiceDate: new Date(now.getTime() - 12 * 86400000).toISOString(),
      dueDate: new Date(now.getTime() + 33 * 86400000).toISOString(),
      purchaseOrderId: poId,
      poNumber: 'PO/2026/0001',
      goodsReceiptNoteId: grnId,
      grnNumber: 'GRN/2026/0001',
      supplierId: 'pty_supp_papermill',
      supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
      supplierGstin: '06AAACB9876E1Z1',
      supplierStateCode: '06',
      placeOfSupply: '07-Delhi',
      subtotalTaxable: 478040.0, // 1480 accepted units * 323 net rate
      cgstAmount: 0.0,
      sgstAmount: 0.0,
      igstAmount: 0.0, // Books exempt
      totalTaxAmount: 0.0,
      freightAmount: 5500.0,
      roundOff: 0.0,
      netPayable: 483540.0,
      paidAmount: 200000.0,
      balanceDue: 283540.0,
      status: 'PARTIALLY_PAID',
      accountingVoucherId: 'vch_purchase_bill_01',
      voucherNumber: 'PB/2026/0001',
      threeWayMatched: true,
      paymentTerms: 'Net 45',
      notes: 'Verified 3-way match against PO/2026/0001 and GRN/2026/0001.',
      items: [
        {
          id: 'pini_001',
          purchaseInvoiceId: pinvId,
          bookId: 'bk_math_12_eng_pb',
          description: 'Class XII Mathematics Complete 2-Vol Set (Billed 1,480 Accepted Copies)',
          sku: 'BK-MATH-12-ENG-PB',
          hsnSacCode: '4901',
          quantity: 1480,
          unitRate: 340.0,
          discountAmount: 25160.0,
          taxableAmount: 478040.0,
          taxRate: 0.0,
          cgstRate: 0.0,
          sgstRate: 0.0,
          igstRate: 0.0,
          cgstAmount: 0.0,
          sgstAmount: 0.0,
          igstAmount: 0.0,
          totalAmount: 478040.0,
          createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
          updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    };
    purchaseInvoicesStore.set(pinvId, initialInvoice);

    // 6. Initial Supplier Payment
    const paymentId = 'pay_seed_001';
    const initialPayment: SupplierPayment = {
      id: paymentId,
      companyId: defaultCompanyId,
      paymentNumber: 'PV/2026/0003',
      supplierId: 'pty_supp_papermill',
      supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
      paymentDate: new Date(now.getTime() - 5 * 86400000).toISOString(),
      paymentMode: 'BANK_TRANSFER_NEFT_RTGS',
      bankLedgerId: 'led_bank_hdfc',
      bankLedgerName: 'HDFC Bank Corporate Current A/c',
      referenceNumber: 'NEFT-HDFC-90812456',
      amount: 200000.0,
      discountReceived: 0.0,
      tdsDeducted: 0.0,
      invoicesSettled: [
        {
          invoiceId: pinvId,
          invoiceNumber: 'PINV/2026/0001',
          allocatedAmount: 200000.0,
        },
      ],
      accountingVoucherId: 'vch_pv_03',
      voucherNumber: 'PV/2026/0003',
      notes: 'Part-payment against Invoice BILT/INV/9821 via corporate net banking.',
      status: 'PAID',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    };
    supplierPaymentsStore.set(paymentId, initialPayment);
  }

  // ==========================================================================
  // 1. PURCHASE REQUISITION ENGINE
  // ==========================================================================
  async getRequisitions(filters?: PurchasesQueryFilters): Promise<{ items: PurchaseRequisition[]; total: number }> {
    let list = Array.from(requisitionsStore.values());

    if (filters?.companyId) {
      list = list.filter((r) => r.companyId === filters.companyId);
    }
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.requisitionNo.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.requestedBy.toLowerCase().includes(q) ||
          r.items.some((i) => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getRequisitionById(id: string): Promise<PurchaseRequisition | null> {
    return requisitionsStore.get(id) || null;
  }

  async createRequisition(data: any, companyId: string = 'cmp_default_publisher', requestedBy: string = 'Editorial Staff'): Promise<PurchaseRequisition> {
    const year = new Date().getFullYear();
    const count = requisitionsStore.size + 1;
    const requisitionNo = `PR/${year}/${String(count).padStart(4, '0')}`;

    let totalEstimated = 0;
    const items: PurchaseRequisitionItem[] = data.items.map((item: any, idx: number) => {
      const estimatedAmount = Number((item.quantity * (item.estimatedRate || 0)).toFixed(2));
      totalEstimated += estimatedAmount;
      return {
        id: `pri_${Date.now()}_${idx}`,
        bookId: item.bookId,
        title: item.title,
        isbn: item.isbn,
        sku: item.sku,
        quantity: item.quantity,
        estimatedRate: item.estimatedRate || 0,
        estimatedAmount,
      };
    });

    const id = `pr_${Date.now()}`;
    const newPr: PurchaseRequisition = {
      id,
      companyId,
      requisitionNo,
      department: data.department || 'Editorial & Production',
      requestDate: new Date().toISOString(),
      requiredDate: new Date(data.requiredDate).toISOString(),
      priority: data.priority || 'MEDIUM',
      requestedBy: data.requestedBy || requestedBy,
      status: 'PENDING_APPROVAL',
      remarks: data.remarks,
      items,
      totalEstimated: Number(totalEstimated.toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requisitionsStore.set(id, newPr);
    return newPr;
  }

  async approveRequisition(id: string, approved: boolean, remarks?: string, userId: string = 'usr_super_admin'): Promise<PurchaseRequisition> {
    const pr = requisitionsStore.get(id);
    if (!pr) throw new AppError('Purchase Requisition not found', 404);

    pr.status = approved ? 'APPROVED' : 'REJECTED';
    pr.approvedBy = userId;
    pr.approvedAt = new Date().toISOString();
    if (remarks) pr.remarks = (pr.remarks ? pr.remarks + ' | ' : '') + remarks;
    pr.updatedAt = new Date().toISOString();

    requisitionsStore.set(id, pr);
    return pr;
  }

  // ==========================================================================
  // 2. SUPPLIER QUOTATION & COMPARISON ENGINE
  // ==========================================================================
  async getQuotations(filters?: PurchasesQueryFilters): Promise<{ items: SupplierQuotation[]; total: number }> {
    let list = Array.from(quotationsStore.values());

    if (filters?.companyId) {
      list = list.filter((q) => q.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((q) => q.supplierId === filters.supplierId);
    }
    if (filters?.status) {
      list = list.filter((q) => q.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.quotationNo.toLowerCase().includes(q) ||
          item.supplierName.toLowerCase().includes(q) ||
          item.items.some((i) => i.description.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.quotationDate).getTime() - new Date(a.quotationDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getQuotationById(id: string): Promise<SupplierQuotation | null> {
    return quotationsStore.get(id) || null;
  }

  async createQuotation(data: any, companyId: string = 'cmp_default_publisher'): Promise<SupplierQuotation> {
    let subtotal = 0;
    let taxAmount = 0;

    const items: SupplierQuotationItem[] = data.items.map((i: any) => {
      const netRate = i.rate * (1 - (i.discountPercent || 0) / 100);
      const lineTaxable = i.quantity * netRate;
      const lineTax = (lineTaxable * (i.taxPercent || 0)) / 100;
      const lineTotal = Number((lineTaxable + lineTax).toFixed(2));

      subtotal += lineTaxable;
      taxAmount += lineTax;

      return {
        bookId: i.bookId,
        description: i.description,
        sku: i.sku,
        quantity: i.quantity,
        rate: i.rate,
        discountPercent: i.discountPercent || 0,
        taxPercent: i.taxPercent || 0,
        lineTotal,
      };
    });

    const additionalCharges = Number(data.additionalCharges || 0);
    const grandTotal = Number((subtotal + taxAmount + additionalCharges).toFixed(2));

    const id = `qt_${Date.now()}`;
    const newQuote: SupplierQuotation = {
      id,
      companyId,
      quotationNo: data.quotationNo,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      requisitionId: data.requisitionId,
      quotationDate: data.quotationDate ? new Date(data.quotationDate).toISOString() : new Date().toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      paymentTerms: data.paymentTerms || 'Net 45',
      deliveryTerms: data.deliveryTerms || 'Ex-Factory',
      leadTimeDays: data.leadTimeDays !== undefined ? data.leadTimeDays : 14,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      additionalCharges,
      grandTotal,
      status: 'ACTIVE',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotationsStore.set(id, newQuote);
    return newQuote;
  }

  async compareQuotations(skuList?: string[], requisitionId?: string): Promise<SupplierComparisonReport> {
    let quotes = Array.from(quotationsStore.values()).filter((q) => q.status === 'ACTIVE' || q.status === 'ACCEPTED');

    if (requisitionId) {
      quotes = quotes.filter((q) => q.requisitionId === requisitionId);
    }

    // Map all unique SKUs across quotations
    const skusToCompare = new Set<string>();
    quotes.forEach((q) => q.items.forEach((item) => skusToCompare.add(item.sku)));

    if (skuList && skuList.length > 0) {
      const filterSet = new Set(skuList);
      for (const s of Array.from(skusToCompare)) {
        if (!filterSet.has(s)) skusToCompare.delete(s);
      }
    }

    const comparisonItems: SupplierComparisonReport['items'] = [];
    let totalPotentialSavings = 0;

    for (const sku of Array.from(skusToCompare)) {
      const offers: any[] = [];
      let itemDescription = '';
      let quantity = 0;

      for (const q of quotes) {
        const line = q.items.find((i) => i.sku === sku);
        if (line) {
          itemDescription = line.description;
          quantity = Math.max(quantity, line.quantity);
          const netRate = line.rate * (1 - line.discountPercent / 100);
          const landedCostPerUnit = netRate * (1 + line.taxPercent / 100);

          offers.push({
            supplierId: q.supplierId,
            supplierName: q.supplierName,
            quotationNo: q.quotationNo,
            unitRate: line.rate,
            discountPercent: line.discountPercent,
            landedCostPerUnit: Number(landedCostPerUnit.toFixed(2)),
            lineTotal: line.lineTotal,
            leadTimeDays: q.leadTimeDays,
            paymentTerms: q.paymentTerms,
            isLowestRate: false,
          });
        }
      }

      if (offers.length > 0) {
        offers.sort((a, b) => a.landedCostPerUnit - b.landedCostPerUnit);
        offers[0].isLowestRate = true;

        if (offers.length > 1) {
          const savingsPerUnit = offers[offers.length - 1].landedCostPerUnit - offers[0].landedCostPerUnit;
          totalPotentialSavings += savingsPerUnit * quantity;
        }

        comparisonItems.push({
          sku,
          itemDescription,
          quantity,
          supplierOffers: offers,
          recommendedSupplierId: offers[0].supplierId,
          recommendedSupplierName: offers[0].supplierName,
        });
      }
    }

    return {
      comparisonDate: new Date().toISOString(),
      requisitionId,
      suppliersComparedCount: quotes.length,
      items: comparisonItems,
      totalPotentialSavings: Number(totalPotentialSavings.toFixed(2)),
    };
  }

  // ==========================================================================
  // 3. PURCHASE ORDER ENGINE
  // ==========================================================================
  async getOrders(filters?: PurchasesQueryFilters): Promise<{ items: PurchaseOrder[]; total: number }> {
    let list = Array.from(purchaseOrdersStore.values());

    if (filters?.companyId) {
      list = list.filter((p) => p.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((p) => p.supplierId === filters.supplierId);
    }
    if (filters?.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.poNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getOrderById(id: string): Promise<PurchaseOrder | null> {
    return purchaseOrdersStore.get(id) || null;
  }

  async createOrder(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_super_admin'): Promise<PurchaseOrder> {
    const year = new Date().getFullYear();
    const count = purchaseOrdersStore.size + 1;
    const poNumber = `PO/${year}/${String(count).padStart(4, '0')}`;
    const poId = `po_${Date.now()}`;

    // GST Rule: Company is Delhi (State Code 07). If supplier state is 07, apply Intra-State CGST+SGST, otherwise Inter-State IGST.
    const isInterState = data.supplierStateCode ? data.supplierStateCode !== '07' : true;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const items: PurchaseOrderItem[] = data.items.map((i: any, idx: number) => {
      const grossAmount = i.quantity * i.unitRate;
      const discountAmount = grossAmount * ((i.discountPercent || 0) / 100);
      const taxableAmount = grossAmount - discountAmount;

      const taxRate = i.taxPercent || 0;
      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (taxRate > 0) {
        if (isInterState) {
          igstRate = taxRate;
          igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
        } else {
          cgstRate = taxRate / 2;
          sgstRate = taxRate / 2;
          cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
          sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
        }
      }

      const lineTotal = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

      subtotal += taxableAmount;
      discountTotal += discountAmount;
      taxTotal += cgstAmount + sgstAmount + igstAmount;

      return {
        id: `poi_${Date.now()}_${idx}`,
        purchaseOrderId: poId,
        bookId: i.bookId,
        bookTitle: i.bookTitle,
        isbn: i.isbn,
        sku: i.sku,
        quantity: i.quantity,
        receivedQuantity: 0,
        unitRate: i.unitRate,
        discountPercent: i.discountPercent || 0,
        taxPercent: taxRate,
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
    const additionalCharges = Number(data.additionalCharges || 0);
    const rawTotal = subtotal + taxTotal + freightCharges + additionalCharges;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Number((roundedTotal - rawTotal).toFixed(2));
    const grandTotal = roundedTotal;

    const newPo: PurchaseOrder = {
      id: poId,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      branchName: data.branchName || 'Headquarters & Central Depot',
      poNumber,
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString() : new Date().toISOString(),
      expectedDelivery: new Date(data.expectedDelivery).toISOString(),
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierGstin: data.supplierGstin,
      supplierAddress: data.supplierAddress,
      supplierStateCode: data.supplierStateCode,
      quotationRef: data.quotationRef,
      requisitionRef: data.requisitionRef,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      freightCharges,
      additionalCharges,
      roundOff,
      grandTotal,
      paymentTerms: data.paymentTerms || 'Net 45',
      deliveryTerms: data.deliveryTerms,
      status: 'ISSUED',
      notes: data.notes,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    purchaseOrdersStore.set(poId, newPo);

    // If Requisition Ref exists, update Requisition Status
    if (data.requisitionRef) {
      const pr = Array.from(requisitionsStore.values()).find((r) => r.requisitionNo === data.requisitionRef);
      if (pr) {
        pr.status = 'PO_RAISED';
        pr.updatedAt = new Date().toISOString();
        requisitionsStore.set(pr.id, pr);
      }
    }

    return newPo;
  }

  async cancelOrder(id: string, reason: string): Promise<PurchaseOrder> {
    const po = purchaseOrdersStore.get(id);
    if (!po) throw new AppError('Purchase Order not found', 404);
    if (po.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a fully fulfilled Purchase Order', 400);
    }

    po.status = 'CANCELLED';
    po.notes = (po.notes ? po.notes + ' | ' : '') + `Cancelled: ${reason}`;
    po.updatedAt = new Date().toISOString();
    purchaseOrdersStore.set(id, po);
    return po;
  }

  // ==========================================================================
  // 4. GOODS RECEIPT NOTE (GRN) & INWARD STOCK ENGINE
  // ==========================================================================
  async getGRNs(filters?: PurchasesQueryFilters): Promise<{ items: GoodsReceiptNote[]; total: number }> {
    let list = Array.from(grnStore.values());

    if (filters?.companyId) {
      list = list.filter((g) => g.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((g) => g.supplierId === filters.supplierId);
    }
    if (filters?.status) {
      list = list.filter((g) => g.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.grnNumber.toLowerCase().includes(q) ||
          g.poNumber.toLowerCase().includes(q) ||
          g.supplierName.toLowerCase().includes(q) ||
          g.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getGRNById(id: string): Promise<GoodsReceiptNote | null> {
    return grnStore.get(id) || null;
  }

  async createGRN(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_super_admin'): Promise<GoodsReceiptNote> {
    const po = purchaseOrdersStore.get(data.purchaseOrderId);
    if (!po) throw new AppError('Purchase Order referenced by GRN does not exist', 404);
    if (po.status === 'CANCELLED') throw new AppError('Cannot create GRN for cancelled Purchase Order', 400);

    const year = new Date().getFullYear();
    const count = grnStore.size + 1;
    const grnNumber = `GRN/${year}/${String(count).padStart(4, '0')}`;
    const grnId = `grn_${Date.now()}`;

    const grnItems: GoodsReceiptNoteItem[] = [];

    for (let idx = 0; idx < data.items.length; idx++) {
      const itemInput = data.items[idx];
      const poItem = po.items.find((pi) => pi.sku === itemInput.sku || pi.bookId === itemInput.bookId);
      if (!poItem) {
        throw new AppError(`Item SKU '${itemInput.sku}' is not part of Purchase Order ${po.poNumber}`, 400);
      }

      const receivedQuantity = Number(itemInput.receivedQuantity || 0);
      const rejectedQuantity = Number(itemInput.rejectedQuantity || 0);
      const damagedQuantity = Number(itemInput.damagedQuantity || 0);
      const acceptedQuantity = Math.max(0, receivedQuantity - rejectedQuantity - damagedQuantity);

      // Remaining on PO item
      const previouslyReceived = poItem.receivedQuantity || 0;
      const newTotalReceived = previouslyReceived + acceptedQuantity;
      const pendingQuantity = Math.max(0, poItem.quantity - newTotalReceived);

      // Barcode generation for accepted batch inward
      const batchBarcode = `BC-${year}-${itemInput.sku.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

      // Update PO item
      poItem.receivedQuantity = newTotalReceived;
      poItem.updatedAt = new Date().toISOString();

      // INWARD STOCK UPDATE: Immediate Book stock increment in BooksService
      if (acceptedQuantity > 0) {
        await booksService.adjustStock(poItem.bookId || poItem.sku, acceptedQuantity);
      }

      grnItems.push({
        id: `grni_${Date.now()}_${idx}`,
        goodsReceiptNoteId: grnId,
        bookId: poItem.bookId,
        bookTitle: poItem.bookTitle,
        isbn: poItem.isbn,
        sku: poItem.sku,
        orderedQuantity: poItem.quantity,
        receivedQuantity,
        acceptedQuantity,
        rejectedQuantity,
        damagedQuantity,
        pendingQuantity,
        warehouseRack: itemInput.warehouseRack || 'RACK-A1-03',
        batchBarcode,
        rejectionReason: itemInput.rejectionReason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Check if entire PO is completed
    const allCompleted = po.items.every((pi) => pi.receivedQuantity >= pi.quantity);
    po.status = allCompleted ? 'COMPLETED' : 'PARTIALLY_RECEIVED';
    po.updatedAt = new Date().toISOString();
    purchaseOrdersStore.set(po.id, po);

    const newGrn: GoodsReceiptNote = {
      id: grnId,
      companyId,
      branchId: po.branchId,
      grnNumber,
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString() : new Date().toISOString(),
      warehouseId: data.warehouseId || 'tax_wh_01',
      warehouseName: data.warehouseName || 'Central Godown / Main Depot',
      deliveryChallanNo: data.deliveryChallanNo,
      transporterName: data.transporterName,
      lrNumber: data.lrNumber,
      vehicleNumber: data.vehicleNumber,
      items: grnItems,
      status: 'POSTED_TO_INVENTORY',
      notes: data.notes,
      receivedBy: data.receivedBy || userId,
      inspectedBy: data.inspectedBy || 'Quality Assurance Controller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    grnStore.set(grnId, newGrn);
    return newGrn;
  }

  // ==========================================================================
  // 5. PURCHASE INVOICE (VENDOR BILL) & GENERAL LEDGER INTEGRATION
  // ==========================================================================
  async getInvoices(filters?: PurchasesQueryFilters): Promise<{ items: PurchaseInvoice[]; total: number }> {
    let list = Array.from(purchaseInvoicesStore.values());

    if (filters?.companyId) {
      list = list.filter((i) => i.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((i) => i.supplierId === filters.supplierId);
    }
    if (filters?.status) {
      list = list.filter((i) => i.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.supplierInvoiceNo.toLowerCase().includes(q) ||
          i.supplierName.toLowerCase().includes(q) ||
          i.items.some((item) => item.description.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getInvoiceById(id: string): Promise<PurchaseInvoice | null> {
    return purchaseInvoicesStore.get(id) || null;
  }

  async createInvoice(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_super_admin'): Promise<PurchaseInvoice> {
    const year = new Date().getFullYear();
    const count = purchaseInvoicesStore.size + 1;
    const invoiceNumber = `PINV/${year}/${String(count).padStart(4, '0')}`;
    const invoiceId = `pinv_${Date.now()}`;

    // Duplicate Supplier Bill Number Check
    const existingBill = Array.from(purchaseInvoicesStore.values()).find(
      (inv) => inv.companyId === companyId && inv.supplierId === data.supplierId && inv.supplierInvoiceNo.toLowerCase() === data.supplierInvoiceNo.toLowerCase()
    );
    if (existingBill) {
      throw new AppError(`Supplier Bill #${data.supplierInvoiceNo} has already been registered for this vendor.`, 409);
    }

    // 3-Way Match Verification against PO and GRN
    let threeWayMatched = false;
    let poNumber: string | undefined;
    let grnNumber: string | undefined;

    if (data.purchaseOrderId) {
      const po = purchaseOrdersStore.get(data.purchaseOrderId);
      if (po) poNumber = po.poNumber;
    }
    if (data.goodsReceiptNoteId) {
      const grn = grnStore.get(data.goodsReceiptNoteId);
      if (grn) {
        grnNumber = grn.grnNumber;
        if (grn.status === 'POSTED_TO_INVENTORY') threeWayMatched = true;
      }
    } else if (data.purchaseOrderId) {
      threeWayMatched = true;
    }

    // State & Tax logic (Intra vs Inter state)
    const isInterState = data.supplierStateCode ? data.supplierStateCode !== '07' : true;

    let subtotalTaxable = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const invoiceItems: PurchaseInvoiceItem[] = data.items.map((i: any, idx: number) => {
      const grossAmount = i.quantity * i.unitRate;
      const discountAmount = Number(i.discountAmount || 0);
      const taxableAmount = grossAmount - discountAmount;

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
          igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
        } else {
          cgstRate = taxRate / 2;
          sgstRate = taxRate / 2;
          cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
          sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
        }
      }

      const totalAmount = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

      subtotalTaxable += taxableAmount;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;

      return {
        id: `pini_${Date.now()}_${idx}`,
        purchaseInvoiceId: invoiceId,
        bookId: i.bookId,
        description: i.description,
        sku: i.sku,
        hsnSacCode: i.hsnSacCode || '4901',
        quantity: i.quantity,
        unitRate: i.unitRate,
        discountAmount,
        taxableAmount: Number(taxableAmount.toFixed(2)),
        taxRate,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const totalTaxAmount = Number((cgstTotal + sgstTotal + igstTotal).toFixed(2));
    const freightAmount = Number(data.freightAmount || 0);
    const rawTotal = subtotalTaxable + totalTaxAmount + freightAmount;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Number((roundedTotal - rawTotal).toFixed(2));
    const netPayable = roundedTotal;

    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
    // Payment due date calculation (e.g. + 45 days)
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(invoiceDate.getTime() + 45 * 86400000);

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (PURCHASE_BILL VOUCHER)
    // ========================================================================
    // Dr: Purchase Expense / Inventory (4001): subtotalTaxable + freightAmount + roundOff (if positive)
    // Dr: Input CGST (1041): cgstTotal
    // Dr: Input SGST (1042): sgstTotal
    // Dr: Input IGST (1043): igstTotal
    // Cr: Trade Creditors (2001): netPayable
    const expenseDebit = Number((subtotalTaxable + freightAmount + (roundOff > 0 ? roundOff : 0)).toFixed(2));
    const creditorCredit = netPayable;

    const voucherItems: any[] = [
      {
        ledgerId: 'led_paper_purchase',
        debitAmount: expenseDebit,
        creditAmount: 0.0,
        description: `Direct Purchase: ${data.supplierName} - Bill #${data.supplierInvoiceNo}`,
      },
    ];

    if (cgstTotal > 0) {
      voucherItems.push({
        ledgerId: 'led_input_cgst',
        debitAmount: cgstTotal,
        creditAmount: 0.0,
        description: `Input CGST Credit on Bill #${data.supplierInvoiceNo}`,
      });
    }
    if (sgstTotal > 0) {
      voucherItems.push({
        ledgerId: 'led_input_sgst',
        debitAmount: sgstTotal,
        creditAmount: 0.0,
        description: `Input SGST Credit on Bill #${data.supplierInvoiceNo}`,
      });
    }
    if (igstTotal > 0) {
      voucherItems.push({
        ledgerId: 'led_input_igst',
        debitAmount: igstTotal,
        creditAmount: 0.0,
        description: `Input IGST Credit on Bill #${data.supplierInvoiceNo}`,
      });
    }

    if (roundOff < 0) {
      // Credit round off difference if negative
      voucherItems.push({
        ledgerId: 'led_paper_purchase',
        debitAmount: 0.0,
        creditAmount: Math.abs(roundOff),
        description: 'Round-off allowance',
      });
    }

    voucherItems.push({
      ledgerId: 'led_creditors',
      debitAmount: 0.0,
      creditAmount: creditorCredit,
      description: `Accounts Payable: ${data.supplierName} - Bill #${data.supplierInvoiceNo}`,
    });

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'PURCHASE_BILL',
        entryDate: invoiceDate.toISOString(),
        narration: `Purchase Bill #${data.supplierInvoiceNo} from ${data.supplierName} for Books & Materials (System Ref: ${invoiceNumber})`,
        items: voucherItems,
      },
      companyId,
      userId
    );

    const newInvoice: PurchaseInvoice = {
      id: invoiceId,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      invoiceNumber,
      supplierInvoiceNo: data.supplierInvoiceNo,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      purchaseOrderId: data.purchaseOrderId,
      poNumber,
      goodsReceiptNoteId: data.goodsReceiptNoteId,
      grnNumber,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierGstin: data.supplierGstin,
      supplierStateCode: data.supplierStateCode,
      placeOfSupply: data.placeOfSupply || '07-Delhi',
      subtotalTaxable: Number(subtotalTaxable.toFixed(2)),
      cgstAmount: cgstTotal,
      sgstAmount: sgstTotal,
      igstAmount: igstTotal,
      totalTaxAmount,
      freightAmount,
      roundOff,
      netPayable,
      paidAmount: 0.0,
      balanceDue: netPayable,
      status: 'CONFIRMED',
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      threeWayMatched,
      paymentTerms: data.paymentTerms || 'Net 45',
      notes: data.notes,
      items: invoiceItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    purchaseInvoicesStore.set(invoiceId, newInvoice);
    return newInvoice;
  }

  // ==========================================================================
  // 6. PURCHASE RETURN & SUPPLIER DEBIT NOTE ENGINE
  // ==========================================================================
  async getReturns(filters?: PurchasesQueryFilters): Promise<{ items: PurchaseReturn[]; total: number }> {
    let list = Array.from(purchaseReturnsStore.values());

    if (filters?.companyId) {
      list = list.filter((r) => r.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((r) => r.supplierId === filters.supplierId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.invoiceNumber.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q)
      );
    }

    list = list.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getReturnById(id: string): Promise<PurchaseReturn | null> {
    return purchaseReturnsStore.get(id) || null;
  }

  async createReturn(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_super_admin'): Promise<PurchaseReturn> {
    const invoice = purchaseInvoicesStore.get(data.purchaseInvoiceId);
    if (!invoice) throw new AppError('Purchase Invoice referenced by Return not found', 404);

    const year = new Date().getFullYear();
    const count = purchaseReturnsStore.size + 1;
    const returnNumber = `DN/${year}/${String(count).padStart(4, '0')}`;
    const returnId = `pret_${Date.now()}`;

    const isInterState = invoice.supplierStateCode ? invoice.supplierStateCode !== '07' : true;

    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const returnItems: PurchaseReturnItem[] = [];

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

      // OUTWARD STOCK UPDATE: Decrement book inventory in BooksService
      await booksService.adjustStock(item.bookId || item.sku, -item.returnedQty);
    }

    const totalReturnAmount = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

    // Update invoice balance due
    invoice.balanceDue = Math.max(0, Number((invoice.balanceDue - totalReturnAmount).toFixed(2)));
    if (invoice.balanceDue === 0) invoice.status = 'PAID';
    invoice.updatedAt = new Date().toISOString();
    purchaseInvoicesStore.set(invoice.id, invoice);

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (DEBIT_NOTE VOUCHER)
    // ========================================================================
    // Dr: Trade Creditors (2001): totalReturnAmount (Liability reduced)
    // Cr: Purchase Returns & Allowances Outward (4010): taxableAmount
    // Cr: Input Tax Reversal (1041 / 1042 / 1043)
    const voucherItems: any[] = [
      {
        ledgerId: 'led_creditors',
        debitAmount: totalReturnAmount,
        creditAmount: 0.0,
        description: `Debit Note issued to ${invoice.supplierName} for Return against Bill #${invoice.supplierInvoiceNo}`,
      },
      {
        ledgerId: 'led_purchase_return',
        debitAmount: 0.0,
        creditAmount: taxableAmount,
        description: `Purchase Return Outward: ${data.returnReason}`,
      },
    ];

    if (cgstAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_input_cgst',
        debitAmount: 0.0,
        creditAmount: cgstAmount,
        description: `Input CGST Reversal on Return ${returnNumber}`,
      });
    }
    if (sgstAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_input_sgst',
        debitAmount: 0.0,
        creditAmount: sgstAmount,
        description: `Input SGST Reversal on Return ${returnNumber}`,
      });
    }
    if (igstAmount > 0) {
      voucherItems.push({
        ledgerId: 'led_input_igst',
        debitAmount: 0.0,
        creditAmount: igstAmount,
        description: `Input IGST Reversal on Return ${returnNumber}`,
      });
    }

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'DEBIT_NOTE',
        entryDate: new Date().toISOString(),
        narration: `Debit Note ${returnNumber} to ${invoice.supplierName} - Return of Defective Goods (Invoice Ref: ${invoice.invoiceNumber})`,
        items: voucherItems,
      },
      companyId,
      userId
    );

    const newReturn: PurchaseReturn = {
      id: returnId,
      companyId,
      returnNumber,
      purchaseInvoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      supplierInvoiceNo: invoice.supplierInvoiceNo,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplierName,
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

    purchaseReturnsStore.set(returnId, newReturn);
    return newReturn;
  }

  // ==========================================================================
  // 7. SUPPLIER PAYMENT ENGINE & AUTO-ALLOCATION
  // ==========================================================================
  async getPayments(filters?: PurchasesQueryFilters): Promise<{ items: SupplierPayment[]; total: number }> {
    let list = Array.from(supplierPaymentsStore.values());

    if (filters?.companyId) {
      list = list.filter((p) => p.companyId === filters.companyId);
    }
    if (filters?.supplierId) {
      list = list.filter((p) => p.supplierId === filters.supplierId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async getPaymentById(id: string): Promise<SupplierPayment | null> {
    return supplierPaymentsStore.get(id) || null;
  }

  async createPayment(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_super_admin'): Promise<SupplierPayment> {
    const totalAmount = Number(data.amount);
    let supplierName = '';

    // Apply allocations to invoices
    for (const alloc of data.invoicesSettled) {
      const inv = purchaseInvoicesStore.get(alloc.invoiceId);
      if (inv) {
        supplierName = inv.supplierName;
        inv.paidAmount = Number((inv.paidAmount + alloc.allocatedAmount).toFixed(2));
        inv.balanceDue = Math.max(0, Number((inv.balanceDue - alloc.allocatedAmount).toFixed(2)));
        inv.status = inv.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
        inv.updatedAt = new Date().toISOString();
        purchaseInvoicesStore.set(inv.id, inv);
      }
    }

    if (!supplierName) {
      supplierName = data.supplierName || 'Trade Creditor Supplier';
    }

    const year = new Date().getFullYear();
    const count = supplierPaymentsStore.size + 1;
    const paymentNumber = `PV/${year}/${String(count).padStart(4, '0')}`;
    const paymentId = `pay_${Date.now()}`;

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (PAYMENT_VOUCHER)
    // ========================================================================
    // Dr: Trade Creditors (2001): totalAmount (Liability reduced)
    // Cr: Bank or Cash Ledger (1002 / 1001): totalAmount
    const voucherItems: any[] = [
      {
        ledgerId: 'led_creditors',
        debitAmount: totalAmount,
        creditAmount: 0.0,
        description: `Settlement of invoices for ${supplierName}`,
      },
      {
        ledgerId: data.bankLedgerId || 'led_bank_hdfc',
        debitAmount: 0.0,
        creditAmount: totalAmount,
        description: `Cheque / NEFT Payment: Ref ${data.referenceNumber || 'N/A'}`,
      },
    ];

    const accountingVoucher = await accountingService.createVoucher(
      {
        voucherType: 'PAYMENT_VOUCHER',
        entryDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
        narration: `Supplier Payment to ${supplierName} via ${data.paymentMode} (Ref: ${data.referenceNumber || paymentNumber})`,
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

    const newPayment: SupplierPayment = {
      id: paymentId,
      companyId,
      paymentNumber,
      supplierId: data.supplierId,
      supplierName,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
      paymentMode: data.paymentMode || 'BANK_TRANSFER_NEFT_RTGS',
      bankLedgerId: data.bankLedgerId || 'led_bank_hdfc',
      bankLedgerName,
      referenceNumber: data.referenceNumber,
      amount: totalAmount,
      discountReceived: Number(data.discountReceived || 0),
      tdsDeducted: Number(data.tdsDeducted || 0),
      invoicesSettled: data.invoicesSettled,
      accountingVoucherId: accountingVoucher.id,
      voucherNumber: accountingVoucher.voucherNumber,
      notes: data.notes,
      status: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    supplierPaymentsStore.set(paymentId, newPayment);
    return newPayment;
  }

  // ==========================================================================
  // 8. SUPPLIER AGEING & DETAILED RUNNING STATEMENT
  // ==========================================================================
  async getSupplierAgeing(companyId?: string): Promise<{ items: SupplierAgeingItem[]; totalOutstanding: number }> {
    let invoices = Array.from(purchaseInvoicesStore.values()).filter((i) => i.status !== 'PAID' && i.balanceDue > 0);
    if (companyId) invoices = invoices.filter((i) => i.companyId === companyId);

    const now = new Date();
    const supplierMap = new Map<string, SupplierAgeingItem>();

    for (const inv of invoices) {
      if (!supplierMap.has(inv.supplierId)) {
        supplierMap.set(inv.supplierId, {
          supplierId: inv.supplierId,
          supplierName: inv.supplierName,
          supplierGstin: inv.supplierGstin,
          creditDays: 45,
          currentNotDue: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90Plus: 0,
          totalOutstanding: 0,
        });
      }

      const ageing = supplierMap.get(inv.supplierId)!;
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

    const items = Array.from(supplierMap.values());
    const totalOutstanding = Number(items.reduce((sum, item) => sum + item.totalOutstanding, 0).toFixed(2));

    return { items, totalOutstanding };
  }

  async getSupplierStatement(supplierId: string): Promise<SupplierStatementReport> {
    const invoices = Array.from(purchaseInvoicesStore.values()).filter((i) => i.supplierId === supplierId);
    const payments = Array.from(supplierPaymentsStore.values()).filter((p) => p.supplierId === supplierId);
    const returns = Array.from(purchaseReturnsStore.values()).filter((r) => r.supplierId === supplierId);

    const supplierName = invoices[0]?.supplierName || payments[0]?.supplierName || returns[0]?.supplierName || 'Vendor';
    const supplierGstin = invoices[0]?.supplierGstin;

    const rawEntries: { date: string; refType: any; refNumber: string; description: string; debit: number; credit: number }[] = [];

    // Purchase Invoices credit the supplier's balance (Liability increases)
    for (const inv of invoices) {
      rawEntries.push({
        date: inv.invoiceDate,
        refType: 'PURCHASE_INVOICE',
        refNumber: inv.invoiceNumber,
        description: `Purchase Bill #${inv.supplierInvoiceNo} (PO: ${inv.poNumber || 'Direct'})`,
        debit: 0,
        credit: inv.netPayable,
      });
    }

    // Payments debit the supplier's balance (Liability decreases)
    for (const pay of payments) {
      rawEntries.push({
        date: pay.paymentDate,
        refType: 'PAYMENT',
        refNumber: pay.paymentNumber,
        description: `Payment via ${pay.paymentMode} (Ref #${pay.referenceNumber || 'N/A'})`,
        debit: pay.amount,
        credit: 0,
      });
    }

    // Debit Notes / Returns debit the supplier's balance
    for (const ret of returns) {
      rawEntries.push({
        date: ret.returnDate,
        refType: 'DEBIT_NOTE',
        refNumber: ret.returnNumber,
        description: `Debit Note: Return of Goods (${ret.returnReason})`,
        debit: ret.totalReturnAmount,
        credit: 0,
      });
    }

    // Sort chronologically
    rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const entries: SupplierStatementEntry[] = rawEntries.map((e) => {
      runningBalance = Number((runningBalance + e.credit - e.debit).toFixed(2));
      return {
        ...e,
        runningBalance,
      };
    });

    return {
      supplierId,
      supplierName,
      supplierGstin,
      openingBalance: 0.0,
      entries,
      closingBalance: runningBalance,
    };
  }

  // ==========================================================================
  // 9. PURCHASE REPORTS & REGISTERS
  // ==========================================================================
  async getPurchaseRegister(fromDate?: string, toDate?: string, companyId?: string): Promise<PurchaseRegisterReport> {
    let invoices = Array.from(purchaseInvoicesStore.values());

    if (companyId) invoices = invoices.filter((i) => i.companyId === companyId);
    if (fromDate) invoices = invoices.filter((i) => new Date(i.invoiceDate) >= new Date(fromDate));
    if (toDate) invoices = invoices.filter((i) => new Date(i.invoiceDate) <= new Date(toDate));

    invoices.sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalFreight = 0;
    let grandTotal = 0;

    const items: PurchaseRegisterItem[] = invoices.map((inv) => {
      totalTaxable += inv.subtotalTaxable;
      totalCgst += inv.cgstAmount;
      totalSgst += inv.sgstAmount;
      totalIgst += inv.igstAmount;
      totalFreight += inv.freightAmount;
      grandTotal += inv.netPayable;

      return {
        invoiceNumber: inv.invoiceNumber,
        supplierInvoiceNo: inv.supplierInvoiceNo,
        date: inv.invoiceDate,
        supplierName: inv.supplierName,
        supplierGstin: inv.supplierGstin,
        placeOfSupply: inv.placeOfSupply || '07-Delhi',
        taxableAmount: inv.subtotalTaxable,
        cgstAmount: inv.cgstAmount,
        sgstAmount: inv.sgstAmount,
        igstAmount: inv.igstAmount,
        totalTax: inv.totalTaxAmount,
        freightAmount: inv.freightAmount,
        netAmount: inv.netPayable,
        voucherNumber: inv.voucherNumber,
      };
    });

    return {
      fromDate,
      toDate,
      items,
      totalTaxable: Number(totalTaxable.toFixed(2)),
      totalCgst: Number(totalCgst.toFixed(2)),
      totalSgst: Number(totalSgst.toFixed(2)),
      totalIgst: Number(totalIgst.toFixed(2)),
      totalFreight: Number(totalFreight.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    };
  }

  async getSupplierWisePurchases(companyId?: string): Promise<{ supplierId: string; supplierName: string; invoiceCount: number; totalTaxable: number; totalSpend: number }[]> {
    let invoices = Array.from(purchaseInvoicesStore.values());
    if (companyId) invoices = invoices.filter((i) => i.companyId === companyId);

    const map = new Map<string, { supplierId: string; supplierName: string; invoiceCount: number; totalTaxable: number; totalSpend: number }>();

    for (const inv of invoices) {
      if (!map.has(inv.supplierId)) {
        map.set(inv.supplierId, {
          supplierId: inv.supplierId,
          supplierName: inv.supplierName,
          invoiceCount: 0,
          totalTaxable: 0,
          totalSpend: 0,
        });
      }
      const item = map.get(inv.supplierId)!;
      item.invoiceCount++;
      item.totalTaxable = Number((item.totalTaxable + inv.subtotalTaxable).toFixed(2));
      item.totalSpend = Number((item.totalSpend + inv.netPayable).toFixed(2));
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }

  async getBookWisePurchases(companyId?: string): Promise<{ sku: string; title: string; totalQuantity: number; totalAmount: number; averageCost: number }[]> {
    let invoices = Array.from(purchaseInvoicesStore.values());
    if (companyId) invoices = invoices.filter((i) => i.companyId === companyId);

    const map = new Map<string, { sku: string; title: string; totalQuantity: number; totalAmount: number; averageCost: number }>();

    for (const inv of invoices) {
      for (const item of inv.items) {
        if (!map.has(item.sku)) {
          map.set(item.sku, {
            sku: item.sku,
            title: item.description,
            totalQuantity: 0,
            totalAmount: 0,
            averageCost: 0,
          });
        }
        const b = map.get(item.sku)!;
        b.totalQuantity += item.quantity;
        b.totalAmount = Number((b.totalAmount + item.taxableAmount).toFixed(2));
        b.averageCost = Number((b.totalAmount / b.totalQuantity).toFixed(2));
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }

  async getPendingPurchaseOrders(companyId?: string): Promise<PurchaseOrder[]> {
    let list = Array.from(purchaseOrdersStore.values()).filter(
      (po) => po.status === 'ISSUED' || po.status === 'PARTIALLY_RECEIVED'
    );
    if (companyId) list = list.filter((po) => po.companyId === companyId);
    return list;
  }
}

export const purchasesService = new PurchasesService();
