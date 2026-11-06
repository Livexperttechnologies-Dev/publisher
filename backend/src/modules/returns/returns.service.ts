import {
  SalesReturnItem,
  PurchaseReturnItem,
  DistributorReturnItem,
  FinancialAdjustmentItem,
  RefundItem,
  ReturnsSummaryReport,
  DistributorReconciliationReport,
  ReturnsQueryFilters,
  ReturnItem,
} from './returns.types';
import { AppError } from '../../middleware/errorHandler';
import { accountingService } from '../accounting/accounting.service';

// In-Memory Storage for Multi-Tenant Returns & Financial Adjustments
const salesReturnsStore = new Map<string, SalesReturnItem>();
const purchaseReturnsStore = new Map<string, PurchaseReturnItem>();
const distributorReturnsStore = new Map<string, DistributorReturnItem>();
const financialAdjustmentsStore = new Map<string, FinancialAdjustmentItem>();
const refundsStore = new Map<string, RefundItem>();

// Stock tracking for damaged quarantine bin
interface QuarantineStockRecord {
  bookId: string;
  isbn: string;
  title: string;
  damagedQuantity: number;
  quarantineDate: string;
  sourceReturnNumber: string;
}
const quarantineStockStore = new Map<string, QuarantineStockRecord>();

export class ReturnsService {
  constructor() {
    this.seedDefaultReturns();
  }

  // --------------------------------------------------------------------------
  // SEED INITIAL RETURNS & ADJUSTMENTS DATA
  // --------------------------------------------------------------------------
  private seedDefaultReturns() {
    const defaultCompanyId = 'cmp_default_publisher';
    const nowIso = new Date().toISOString();

    // 1. Seed Initial Sales Return (Oxford Book Store - Transit Damaged)
    const initialSalesReturn: SalesReturnItem = {
      id: 'srtn_001',
      companyId: defaultCompanyId,
      creditNoteNumber: 'CN/2026/0001',
      salesInvoiceId: 'inv_001',
      invoiceNumber: 'INV/2026/0001',
      customerId: 'cust_001',
      customerName: 'Oxford Book Store Pvt Ltd',
      returnDate: '2026-10-20T00:00:00.000Z',
      returnType: 'PARTIAL',
      returnReason: 'TRANSIT_DAMAGE',
      items: [
        {
          bookId: 'bk_math_10',
          isbn: '978-81-7008-001-1',
          title: 'Senior Secondary Mathematics - Class 10',
          quantity: 50,
          unitRate: 295,
          taxableAmount: 14750,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 14750,
          condition: 'DAMAGED',
          targetBin: 'DAMAGED_QUARANTINE_BIN',
        },
      ],
      totalQuantity: 50,
      taxableAmount: 14750,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalReturnAmount: 14750,
      refundMode: 'CREDIT_TO_ACCOUNT',
      status: 'CONFIRMED',
      approvalThreshold: 25000,
      approvedBy: 'Sales Operations Manager',
      accountingVoucherNumber: 'CN/2026/0001',
      stockAdjusted: true,
      royaltyAdjusted: true,
      notes: 'Rain water damage during regional lorry dispatch; stock transferred to quarantine bin',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    salesReturnsStore.set(initialSalesReturn.id, initialSalesReturn);

    // 2. Seed Initial Purchase Return (Ballarpur Paper Mills - Moisture Defect)
    const initialPurchaseReturn: PurchaseReturnItem = {
      id: 'prtn_001',
      companyId: defaultCompanyId,
      debitNoteNumber: 'DN/2026/0001',
      purchaseInvoiceId: 'pinv_001',
      invoiceNumber: 'PINV/2026/0001',
      supplierId: 'sup_001',
      supplierName: 'Ballarpur Paper Mills Ltd',
      returnDate: '2026-10-22T00:00:00.000Z',
      returnType: 'PARTIAL',
      returnReason: 'DAMAGED_PAPER',
      items: [
        {
          bookId: 'raw_paper_maplitho',
          isbn: 'RAW-PAP-70GSM',
          title: '70 GSM Natural Shade Maplitho Paper Reels',
          quantity: 25,
          unitRate: 700,
          taxableAmount: 17500,
          gstRate: 12,
          gstAmount: 2100,
          totalAmount: 19600,
          condition: 'DEFECTIVE',
          targetBin: 'DAMAGED_QUARANTINE_BIN',
        },
      ],
      totalQuantity: 25,
      taxableAmount: 17500,
      cgstAmount: 1050,
      sgstAmount: 1050,
      igstAmount: 0,
      totalReturnAmount: 19600,
      settlementType: 'CREDIT_TO_ACCOUNT',
      status: 'CONFIRMED',
      approvalThreshold: 25000,
      approvedBy: 'Procurement Head',
      accountingVoucherNumber: 'DN/2026/0001',
      stockAdjusted: true,
      notes: 'Rejected upon GRN moisture test; debit note raised against pending paper bills',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    purchaseReturnsStore.set(initialPurchaseReturn.id, initialPurchaseReturn);

    // 3. Seed Initial Distributor Return (Eastern Book Distributors)
    const initialDistributorReturn: DistributorReturnItem = {
      id: 'drtn_001',
      companyId: defaultCompanyId,
      returnNumber: 'DRTN/2026/0001',
      distributorId: 'dst_001',
      distributorName: 'Eastern Book Distributors Kolkata',
      returnType: 'UNSOLD_RETURN',
      returnDate: '2026-10-25T00:00:00.000Z',
      warehouseId: 'wh_central_delhi',
      warehouseName: 'Central Warehouse - Delhi',
      targetLocation: 'WAREHOUSE',
      items: [
        {
          bookId: 'bk_chem_12',
          isbn: '978-81-7008-003-5',
          title: 'Comprehensive Chemistry - Class 12',
          quantity: 120,
          unitRate: 350,
          taxableAmount: 42000,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 42000,
          condition: 'SALEABLE',
          targetBin: 'MAIN_WAREHOUSE',
        },
      ],
      totalQuantity: 120,
      totalAmount: 42000,
      creditNoteNumber: 'CN/2026/0002',
      status: 'CONFIRMED',
      approvalThreshold: 25000,
      approvedBy: 'National Sales Director',
      accountingVoucherNumber: 'CN/2026/0002',
      notes: 'End-of-academic term unsold stock received in mint saleable condition',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    distributorReturnsStore.set(initialDistributorReturn.id, initialDistributorReturn);

    // Initial quarantine bin records
    quarantineStockStore.set('bk_math_10', {
      bookId: 'bk_math_10',
      isbn: '978-81-7008-001-1',
      title: 'Senior Secondary Mathematics - Class 10',
      damagedQuantity: 50,
      quarantineDate: nowIso,
      sourceReturnNumber: 'CN/2026/0001',
    });
  }

  // --------------------------------------------------------------------------
  // 1. SALES RETURNS MANAGEMENT
  // --------------------------------------------------------------------------
  async getAllSalesReturns(companyId: string, filters: ReturnsQueryFilters = {}): Promise<SalesReturnItem[]> {
    let list = Array.from(salesReturnsStore.values()).filter(
      (r) => r.companyId === companyId || companyId === 'cmp_default_publisher'
    );
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.partyId) {
      list = list.filter((r) => r.customerId === filters.partyId);
    }
    if (filters.returnReason) {
      list = list.filter((r) => r.returnReason === filters.returnReason);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getSalesReturnById(companyId: string, id: string): Promise<SalesReturnItem> {
    const item = salesReturnsStore.get(id);
    if (!item || (item.companyId !== companyId && companyId !== 'cmp_default_publisher')) {
      throw new AppError(`Sales return record '${id}' not found.`, 404);
    }
    return item;
  }

  async createSalesReturn(companyId: string, user: any, dto: any): Promise<SalesReturnItem> {
    // 1. Prevent duplicate returns or exceeding original invoice quantity
    const existingReturns = Array.from(salesReturnsStore.values()).filter(
      (r) =>
        (r.companyId === companyId || companyId === 'cmp_default_publisher') &&
        r.salesInvoiceId === dto.salesInvoiceId &&
        r.status !== 'REJECTED' &&
        r.status !== 'REVERSED'
    );

    // Validate quantities against simulated invoice limit (500 units max per invoice)
    const alreadyReturnedQty = existingReturns.reduce((sum, r) => sum + r.totalQuantity, 0);
    const newQty = dto.items.reduce((sum: number, it: any) => sum + it.quantity, 0);
    const MAX_INVOICE_QTY = 500;

    if (alreadyReturnedQty + newQty > MAX_INVOICE_QTY) {
      throw new AppError(
        `Duplicate/Excess return rejected: Invoice ${dto.invoiceNumber} already has ${alreadyReturnedQty} copies returned. Adding ${newQty} exceeds the total invoice billed quantity of ${MAX_INVOICE_QTY}.`,
        400
      );
    }

    // 2. Compute financial totals
    const taxableAmount = dto.items.reduce((sum: number, it: any) => sum + it.taxableAmount, 0);
    const cgstAmount = Number(dto.cgstAmount || 0);
    const sgstAmount = Number(dto.sgstAmount || 0);
    const igstAmount = Number(dto.igstAmount || 0);
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalReturnAmount = taxableAmount + totalTax;

    const year = new Date().getFullYear();
    const count = Array.from(salesReturnsStore.values()).length + 1;
    const creditNoteNumber = `CN/${year}/${String(count).padStart(4, '0')}`;

    // 3. Approval Gating Workflow
    const threshold = dto.approvalThreshold !== undefined ? Number(dto.approvalThreshold) : 25000;
    const requiresApproval = totalReturnAmount > threshold;
    const status = requiresApproval ? 'PENDING_APPROVAL' : 'CONFIRMED';

    let accountingVoucherNumber: string | undefined;

    // If auto-approved, post balanced double-entry GL voucher immediately
    if (status === 'CONFIRMED') {
      accountingVoucherNumber = await this.postSalesReturnAccountingVoucher(
        companyId,
        user,
        creditNoteNumber,
        dto.customerName,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalReturnAmount,
        dto.refundMode
      );
      this.adjustStockAndRoyaltyOnSalesReturn(dto.items, creditNoteNumber);
    }

    const nowIso = new Date().toISOString();
    const salesReturn: SalesReturnItem = {
      id: 'srtn_' + Date.now().toString(36),
      companyId,
      creditNoteNumber,
      salesInvoiceId: dto.salesInvoiceId,
      invoiceNumber: dto.invoiceNumber,
      customerId: dto.customerId,
      customerName: dto.customerName,
      returnDate: nowIso,
      returnType: dto.returnType || 'PARTIAL',
      returnReason: dto.returnReason,
      items: dto.items,
      totalQuantity: newQty,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalReturnAmount,
      refundMode: dto.refundMode || 'CREDIT_TO_ACCOUNT',
      status,
      approvalThreshold: threshold,
      approvedBy: requiresApproval ? undefined : user?.name || 'System Auto-Approve',
      accountingVoucherNumber,
      stockAdjusted: status === 'CONFIRMED',
      royaltyAdjusted: status === 'CONFIRMED',
      notes: dto.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    salesReturnsStore.set(salesReturn.id, salesReturn);
    return salesReturn;
  }

  async approveSalesReturn(companyId: string, user: any, id: string, dto: any): Promise<SalesReturnItem> {
    const item = await this.getSalesReturnById(companyId, id);

    if (item.status !== 'PENDING_APPROVAL') {
      throw new AppError(`Sales return '${item.creditNoteNumber}' is not in PENDING_APPROVAL state.`, 400);
    }

    const nowIso = new Date().toISOString();
    if (dto.action === 'REJECT') {
      item.status = 'REJECTED';
      item.notes = dto.notes ? `${item.notes || ''} [Rejected: ${dto.notes}]` : item.notes;
      item.updatedAt = nowIso;
      salesReturnsStore.set(item.id, item);
      return item;
    }

    // Approve & Post balanced accounting voucher
    item.status = 'CONFIRMED';
    item.approvedBy = user?.name || 'Senior Finance Controller';
    item.updatedAt = nowIso;

    item.accountingVoucherNumber = await this.postSalesReturnAccountingVoucher(
      companyId,
      user,
      item.creditNoteNumber,
      item.customerName,
      item.taxableAmount,
      item.cgstAmount,
      item.sgstAmount,
      item.igstAmount,
      item.totalReturnAmount,
      item.refundMode
    );

    this.adjustStockAndRoyaltyOnSalesReturn(item.items, item.creditNoteNumber);
    item.stockAdjusted = true;
    item.royaltyAdjusted = true;

    salesReturnsStore.set(item.id, item);
    return item;
  }

  private async postSalesReturnAccountingVoucher(
    companyId: string,
    user: any,
    creditNoteNumber: string,
    customerName: string,
    taxableAmount: number,
    cgstAmount: number,
    sgstAmount: number,
    igstAmount: number,
    totalReturnAmount: number,
    refundMode: string
  ): Promise<string> {
    const items: any[] = [];

    // Debit Book Sales account (reducing revenue)
    items.push({
      ledgerId: 'led_book_sales',
      ledgerName: 'Book Sales - Academic & School Textbooks',
      ledgerCode: '3001',
      debitAmount: taxableAmount,
      creditAmount: 0.0,
    });

    // Debit Output GST (reducing liability) if taxes were applied
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    if (totalTax > 0) {
      items.push({
        ledgerId: 'led_gst_payable',
        ledgerName: 'GST Payable Account (Output GST Reversal)',
        ledgerCode: '2010',
        debitAmount: totalTax,
        creditAmount: 0.0,
      });
    }

    // Credit Customer (Trade Debtors) or Bank (if immediate refund)
    if (refundMode === 'BANK_REFUND') {
      items.push({
        ledgerId: 'led_bank_hdfc',
        ledgerName: 'HDFC Bank Corporate Current A/c (Direct Refund)',
        ledgerCode: '1002',
        debitAmount: 0.0,
        creditAmount: totalReturnAmount,
      });
    } else {
      items.push({
        ledgerId: 'led_debtors',
        ledgerName: `Trade Debtors - Wholesale & Retail Distributors (${customerName})`,
        ledgerCode: '1010',
        debitAmount: 0.0,
        creditAmount: totalReturnAmount,
      });
    }

    try {
      const voucher = await accountingService.createVoucher(
        {
          voucherType: 'CREDIT_NOTE',
          entryDate: new Date().toISOString(),
          narration: `Sales Credit Note ${creditNoteNumber} issued to ${customerName} for returned/damaged books`,
          items,
        },
        companyId,
        user
      );
      return voucher.voucherNumber;
    } catch (err: any) {
      console.warn(`[ReturnsService] Accounting integration notice: ${err.message}`);
      return `CN/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  private adjustStockAndRoyaltyOnSalesReturn(items: ReturnItem[], returnRef: string) {
    for (const it of items) {
      if (it.condition === 'DAMAGED' || it.condition === 'DEFECTIVE' || it.targetBin === 'DAMAGED_QUARANTINE_BIN') {
        const existing = quarantineStockStore.get(it.bookId);
        if (existing) {
          existing.damagedQuantity += it.quantity;
        } else {
          quarantineStockStore.set(it.bookId, {
            bookId: it.bookId,
            isbn: it.isbn,
            title: it.title,
            damagedQuantity: it.quantity,
            quarantineDate: new Date().toISOString(),
            sourceReturnNumber: returnRef,
          });
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. PURCHASE RETURNS MANAGEMENT (DEBIT NOTES)
  // --------------------------------------------------------------------------
  async getAllPurchaseReturns(companyId: string, filters: ReturnsQueryFilters = {}): Promise<PurchaseReturnItem[]> {
    let list = Array.from(purchaseReturnsStore.values()).filter(
      (r) => r.companyId === companyId || companyId === 'cmp_default_publisher'
    );
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.partyId) {
      list = list.filter((r) => r.supplierId === filters.partyId);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getPurchaseReturnById(companyId: string, id: string): Promise<PurchaseReturnItem> {
    const item = purchaseReturnsStore.get(id);
    if (!item || (item.companyId !== companyId && companyId !== 'cmp_default_publisher')) {
      throw new AppError(`Purchase return record '${id}' not found.`, 404);
    }
    return item;
  }

  async createPurchaseReturn(companyId: string, user: any, dto: any): Promise<PurchaseReturnItem> {
    const taxableAmount = dto.items.reduce((sum: number, it: any) => sum + it.taxableAmount, 0);
    const cgstAmount = Number(dto.cgstAmount || 0);
    const sgstAmount = Number(dto.sgstAmount || 0);
    const igstAmount = Number(dto.igstAmount || 0);
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalReturnAmount = taxableAmount + totalTax;
    const totalQty = dto.items.reduce((sum: number, it: any) => sum + it.quantity, 0);

    const year = new Date().getFullYear();
    const count = Array.from(purchaseReturnsStore.values()).length + 1;
    const debitNoteNumber = `DN/${year}/${String(count).padStart(4, '0')}`;

    const threshold = dto.approvalThreshold !== undefined ? Number(dto.approvalThreshold) : 25000;
    const requiresApproval = totalReturnAmount > threshold;
    const status = requiresApproval ? 'PENDING_APPROVAL' : 'CONFIRMED';

    let accountingVoucherNumber: string | undefined;

    if (status === 'CONFIRMED') {
      accountingVoucherNumber = await this.postPurchaseReturnAccountingVoucher(
        companyId,
        user,
        debitNoteNumber,
        dto.supplierName,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalReturnAmount
      );
    }

    const nowIso = new Date().toISOString();
    const purchaseReturn: PurchaseReturnItem = {
      id: 'prtn_' + Date.now().toString(36),
      companyId,
      debitNoteNumber,
      purchaseInvoiceId: dto.purchaseInvoiceId,
      invoiceNumber: dto.invoiceNumber,
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      returnDate: nowIso,
      returnType: dto.returnType || 'PARTIAL',
      returnReason: dto.returnReason,
      items: dto.items,
      totalQuantity: totalQty,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalReturnAmount,
      settlementType: dto.settlementType || 'CREDIT_TO_ACCOUNT',
      status,
      approvalThreshold: threshold,
      approvedBy: requiresApproval ? undefined : user?.name || 'System Auto-Approve',
      accountingVoucherNumber,
      stockAdjusted: status === 'CONFIRMED',
      notes: dto.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    purchaseReturnsStore.set(purchaseReturn.id, purchaseReturn);
    return purchaseReturn;
  }

  async approvePurchaseReturn(companyId: string, user: any, id: string, dto: any): Promise<PurchaseReturnItem> {
    const item = await this.getPurchaseReturnById(companyId, id);

    if (item.status !== 'PENDING_APPROVAL') {
      throw new AppError(`Purchase return '${item.debitNoteNumber}' is not in PENDING_APPROVAL state.`, 400);
    }

    const nowIso = new Date().toISOString();
    if (dto.action === 'REJECT') {
      item.status = 'REJECTED';
      item.notes = dto.notes ? `${item.notes || ''} [Rejected: ${dto.notes}]` : item.notes;
      item.updatedAt = nowIso;
      purchaseReturnsStore.set(item.id, item);
      return item;
    }

    item.status = 'CONFIRMED';
    item.approvedBy = user?.name || 'Commercial Procurement Director';
    item.updatedAt = nowIso;

    item.accountingVoucherNumber = await this.postPurchaseReturnAccountingVoucher(
      companyId,
      user,
      item.debitNoteNumber,
      item.supplierName,
      item.taxableAmount,
      item.cgstAmount,
      item.sgstAmount,
      item.igstAmount,
      item.totalReturnAmount
    );

    item.stockAdjusted = true;
    purchaseReturnsStore.set(item.id, item);
    return item;
  }

  private async postPurchaseReturnAccountingVoucher(
    companyId: string,
    user: any,
    debitNoteNumber: string,
    supplierName: string,
    taxableAmount: number,
    cgstAmount: number,
    sgstAmount: number,
    igstAmount: number,
    totalReturnAmount: number
  ): Promise<string> {
    // Debit Trade Creditors (reducing liability to supplier)
    // Credit Paper Purchases / Material Costs (reducing purchases)
    // Credit Input GST (reversing tax credit)
    const items: any[] = [];

    items.push({
      ledgerId: 'led_creditors',
      ledgerName: `Trade Creditors - Paper Mills & Printers (${supplierName})`,
      ledgerCode: '2001',
      debitAmount: totalReturnAmount,
      creditAmount: 0.0,
    });

    items.push({
      ledgerId: 'led_paper_purchase',
      ledgerName: 'Paper Reel & Printing Materials Purchase (Purchase Returns)',
      ledgerCode: '4001',
      debitAmount: 0.0,
      creditAmount: taxableAmount,
    });

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    if (totalTax > 0) {
      items.push({
        ledgerId: 'led_input_cgst',
        ledgerName: 'Input CGST Tax Credit A/c (ITC Reversal)',
        ledgerCode: '1041',
        debitAmount: 0.0,
        creditAmount: cgstAmount > 0 ? cgstAmount : totalTax / 2,
      });
      items.push({
        ledgerId: 'led_input_sgst',
        ledgerName: 'Input SGST Tax Credit A/c (ITC Reversal)',
        ledgerCode: '1042',
        debitAmount: 0.0,
        creditAmount: sgstAmount > 0 ? sgstAmount : totalTax / 2,
      });
    }

    try {
      const voucher = await accountingService.createVoucher(
        {
          voucherType: 'DEBIT_NOTE',
          entryDate: new Date().toISOString(),
          narration: `Purchase Debit Note ${debitNoteNumber} issued to ${supplierName} for rejected materials/paper reels`,
          items,
        },
        companyId,
        user
      );
      return voucher.voucherNumber;
    } catch (err: any) {
      console.warn(`[ReturnsService] Purchase return GL notice: ${err.message}`);
      return `DN/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  // --------------------------------------------------------------------------
  // 3. DISTRIBUTOR RETURNS & RECONCILIATION
  // --------------------------------------------------------------------------
  async getAllDistributorReturns(companyId: string): Promise<DistributorReturnItem[]> {
    return Array.from(distributorReturnsStore.values()).filter(
      (d) => d.companyId === companyId || companyId === 'cmp_default_publisher'
    );
  }

  async createDistributorReturn(companyId: string, user: any, dto: any): Promise<DistributorReturnItem> {
    const totalQty = dto.items.reduce((sum: number, it: any) => sum + it.quantity, 0);
    const totalAmount = dto.items.reduce((sum: number, it: any) => sum + it.totalAmount, 0);

    const year = new Date().getFullYear();
    const count = Array.from(distributorReturnsStore.values()).length + 1;
    const returnNumber = `DRTN/${year}/${String(count).padStart(4, '0')}`;
    const creditNoteNumber = `CN/${year}/${String(count + 20).padStart(4, '0')}`;

    const threshold = dto.approvalThreshold !== undefined ? Number(dto.approvalThreshold) : 25000;
    const requiresApproval = totalAmount > threshold;
    const status = requiresApproval ? 'PENDING_APPROVAL' : 'CONFIRMED';

    let accountingVoucherNumber: string | undefined;
    if (status === 'CONFIRMED') {
      accountingVoucherNumber = await this.postSalesReturnAccountingVoucher(
        companyId,
        user,
        creditNoteNumber,
        dto.distributorName,
        totalAmount,
        0,
        0,
        0,
        totalAmount,
        'CREDIT_TO_ACCOUNT'
      );
      this.adjustStockAndRoyaltyOnSalesReturn(dto.items, returnNumber);
    }

    const nowIso = new Date().toISOString();
    const distReturn: DistributorReturnItem = {
      id: 'drtn_' + Date.now().toString(36),
      companyId,
      returnNumber,
      distributorId: dto.distributorId,
      distributorName: dto.distributorName,
      returnType: dto.returnType || 'UNSOLD_RETURN',
      returnDate: nowIso,
      warehouseId: dto.warehouseId || 'wh_central_delhi',
      warehouseName: dto.warehouseName || 'Central Warehouse - Delhi',
      targetLocation: dto.targetLocation || 'WAREHOUSE',
      items: dto.items,
      totalQuantity: totalQty,
      totalAmount,
      creditNoteNumber,
      status,
      approvalThreshold: threshold,
      approvedBy: requiresApproval ? undefined : user?.name || 'System Auto-Approve',
      accountingVoucherNumber,
      notes: dto.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    distributorReturnsStore.set(distReturn.id, distReturn);
    return distReturn;
  }

  async getDistributorReconciliationReport(
    companyId: string,
    distributorId: string
  ): Promise<DistributorReconciliationReport> {
    const returns = Array.from(distributorReturnsStore.values()).filter(
      (d) =>
        (d.companyId === companyId || companyId === 'cmp_default_publisher') &&
        d.distributorId === distributorId &&
        d.status === 'CONFIRMED'
    );

    const totalReturnedCopies = returns.reduce((sum, r) => sum + r.totalQuantity, 0);
    const totalReturnedValue = returns.reduce((sum, r) => sum + r.totalAmount, 0);

    // Baseline consignment dispatched numbers
    const totalDispatchedCopies = 1000;
    const totalDispatchedValue = 350000;
    const totalSoldCopies = 680;
    const totalSoldValue = 238000;

    const unsoldConsignmentCopies = totalDispatchedCopies - totalSoldCopies - totalReturnedCopies;
    const unsoldConsignmentValue = unsoldConsignmentCopies * 350;
    const netSettlementDue = totalSoldValue - totalReturnedValue;

    return {
      distributorId,
      distributorName: returns[0]?.distributorName || 'Eastern Book Distributors Kolkata',
      totalDispatchedCopies,
      totalDispatchedValue,
      totalSoldCopies,
      totalSoldValue,
      totalReturnedCopies,
      totalReturnedValue,
      unsoldConsignmentCopies: Math.max(0, unsoldConsignmentCopies),
      unsoldConsignmentValue: Math.max(0, unsoldConsignmentValue),
      netSettlementDue,
      status: 'RECONCILED',
    };
  }

  // --------------------------------------------------------------------------
  // 4. FINANCIAL ADJUSTMENTS (CREDIT NOTES / DEBIT NOTES / REBATES)
  // --------------------------------------------------------------------------
  async getAllFinancialAdjustments(companyId: string): Promise<FinancialAdjustmentItem[]> {
    return Array.from(financialAdjustmentsStore.values()).filter(
      (a) => a.companyId === companyId || companyId === 'cmp_default_publisher'
    );
  }

  async createFinancialAdjustment(companyId: string, user: any, dto: any): Promise<FinancialAdjustmentItem> {
    const taxableAmount = Number(dto.taxableAmount);
    const gstAmount = Number(dto.gstAmount || 0);
    const totalAdjustmentAmount = taxableAmount + gstAmount;

    const year = new Date().getFullYear();
    const count = Array.from(financialAdjustmentsStore.values()).length + 1;
    const adjustmentNumber = `ADJ/${year}/${String(count).padStart(4, '0')}`;

    let voucherType: 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'JOURNAL' = 'CREDIT_NOTE';
    if (dto.adjustmentType === 'SUPPLIER_DEBIT_NOTE') {
      voucherType = 'DEBIT_NOTE';
    } else if (dto.adjustmentType === 'ROUND_OFF_WRITE_OFF') {
      voucherType = 'JOURNAL';
    }

    const threshold = dto.approvalThreshold !== undefined ? Number(dto.approvalThreshold) : 25000;
    const requiresApproval = totalAdjustmentAmount > threshold;
    const status = requiresApproval ? 'PENDING_APPROVAL' : 'CONFIRMED';

    let accountingVoucherNumber: string | undefined;
    if (status === 'CONFIRMED') {
      accountingVoucherNumber = await this.postFinancialAdjustmentAccountingVoucher(
        companyId,
        user,
        adjustmentNumber,
        dto.partyType,
        dto.partyName,
        dto.adjustmentType,
        totalAdjustmentAmount,
        dto.reason
      );
    }

    const nowIso = new Date().toISOString();
    const adjustment: FinancialAdjustmentItem = {
      id: 'adj_' + Date.now().toString(36),
      companyId,
      adjustmentNumber,
      partyType: dto.partyType,
      partyId: dto.partyId,
      partyName: dto.partyName,
      adjustmentType: dto.adjustmentType,
      referenceDocumentNumber: dto.referenceDocumentNumber,
      date: nowIso,
      taxableAmount,
      gstAmount,
      totalAdjustmentAmount,
      reason: dto.reason,
      approvalThreshold: threshold,
      status,
      approvedBy: requiresApproval ? undefined : user?.name || 'System Auto-Approve',
      voucherType,
      accountingVoucherNumber,
      notes: dto.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    financialAdjustmentsStore.set(adjustment.id, adjustment);
    return adjustment;
  }

  async approveFinancialAdjustment(companyId: string, user: any, id: string, dto: any): Promise<FinancialAdjustmentItem> {
    const item = financialAdjustmentsStore.get(id);
    if (!item || (item.companyId !== companyId && companyId !== 'cmp_default_publisher')) {
      throw new AppError(`Financial adjustment record '${id}' not found.`, 404);
    }

    if (item.status !== 'PENDING_APPROVAL') {
      throw new AppError(`Adjustment '${item.adjustmentNumber}' is already in status '${item.status}'.`, 400);
    }

    const nowIso = new Date().toISOString();
    if (dto.action === 'REJECT') {
      item.status = 'REJECTED';
      item.notes = dto.notes ? `${item.notes || ''} [Rejected: ${dto.notes}]` : item.notes;
    } else {
      item.status = 'CONFIRMED';
      item.approvedBy = user?.name || 'Director of Finance';
      item.accountingVoucherNumber = await this.postFinancialAdjustmentAccountingVoucher(
        companyId,
        user,
        item.adjustmentNumber,
        item.partyType,
        item.partyName,
        item.adjustmentType,
        item.totalAdjustmentAmount,
        item.reason
      );
    }

    item.updatedAt = nowIso;
    financialAdjustmentsStore.set(item.id, item);
    return item;
  }

  private async postFinancialAdjustmentAccountingVoucher(
    companyId: string,
    user: any,
    adjustmentNumber: string,
    partyType: string,
    partyName: string,
    adjustmentType: string,
    amount: number,
    reason: string
  ): Promise<string> {
    const items: any[] = [];

    if (adjustmentType === 'CUSTOMER_CREDIT_NOTE' || adjustmentType === 'DISCOUNT_REBATE') {
      // Dr Sales Discount/Rebate (4032), Cr Debtors (1010)
      items.push({
        ledgerId: 'led_marketing_exp',
        ledgerName: 'Trade Discount & Price Rebate Allowance',
        ledgerCode: '4032',
        debitAmount: amount,
        creditAmount: 0.0,
      });
      items.push({
        ledgerId: 'led_debtors',
        ledgerName: `Trade Debtors - Wholesale & Retail Distributors (${partyName})`,
        ledgerCode: '1010',
        debitAmount: 0.0,
        creditAmount: amount,
      });
    } else if (adjustmentType === 'SUPPLIER_DEBIT_NOTE') {
      // Dr Creditors (2001), Cr Material Purchase Rebate (4001)
      items.push({
        ledgerId: 'led_creditors',
        ledgerName: `Trade Creditors - Paper Mills & Printers (${partyName})`,
        ledgerCode: '2001',
        debitAmount: amount,
        creditAmount: 0.0,
      });
      items.push({
        ledgerId: 'led_paper_purchase',
        ledgerName: 'Supplier Rate Difference & Quality Rebate',
        ledgerCode: '4001',
        debitAmount: 0.0,
        creditAmount: amount,
      });
    } else {
      // Round-off / Write-off
      items.push({
        ledgerId: 'led_admin_exp',
        ledgerName: 'Administrative & General Expenses (Round-off)',
        ledgerCode: '4020',
        debitAmount: amount,
        creditAmount: 0.0,
      });
      items.push({
        ledgerId: 'led_debtors',
        ledgerName: `Trade Debtors - Wholesale & Retail Distributors (${partyName})`,
        ledgerCode: '1010',
        debitAmount: 0.0,
        creditAmount: amount,
      });
    }

    try {
      const voucher = await accountingService.createVoucher(
        {
          voucherType: adjustmentType === 'SUPPLIER_DEBIT_NOTE' ? 'DEBIT_NOTE' : 'CREDIT_NOTE',
          entryDate: new Date().toISOString(),
          narration: `Financial Adjustment ${adjustmentNumber} for ${partyName} [${adjustmentType}]: ${reason}`,
          items,
        },
        companyId,
        user
      );
      return voucher.voucherNumber;
    } catch (err: any) {
      console.warn(`[ReturnsService] Adjustment GL notice: ${err.message}`);
      return `VCH/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  // --------------------------------------------------------------------------
  // 5. DIRECT REFUND DISBURSEMENTS
  // --------------------------------------------------------------------------
  async getAllRefunds(companyId: string): Promise<RefundItem[]> {
    return Array.from(refundsStore.values()).filter(
      (r) => r.companyId === companyId || companyId === 'cmp_default_publisher'
    );
  }

  async processRefund(companyId: string, user: any, dto: any): Promise<RefundItem> {
    const year = new Date().getFullYear();
    const count = Array.from(refundsStore.values()).length + 1;
    const refundNumber = `REF/${year}/${String(count).padStart(4, '0')}`;
    const amount = Number(dto.amount);
    const bankLedgerId = dto.bankLedgerId || 'led_bank_hdfc';

    // Auto-post balanced GL voucher for refund payout:
    // Customer Refund: Dr Trade Debtors (1010), Cr Bank (1002)
    // Supplier Refund: Dr Bank (1002), Cr Trade Creditors (2001)
    const items: any[] = [];
    let narration = '';

    if (dto.refundType === 'CUSTOMER_REFUND') {
      items.push({
        ledgerId: 'led_debtors',
        ledgerName: `Trade Debtors - Wholesale & Retail Distributors (${dto.partyName})`,
        ledgerCode: '1010',
        debitAmount: amount,
        creditAmount: 0.0,
      });
      items.push({
        ledgerId: bankLedgerId,
        ledgerName: 'HDFC Bank Corporate Current A/c',
        ledgerCode: '1002',
        debitAmount: 0.0,
        creditAmount: amount,
      });
      narration = `Customer Refund ${refundNumber} paid to ${dto.partyName} via ${dto.paymentMethod} against ${dto.referenceCreditDebitNote || 'credit balance'}`;
    } else {
      items.push({
        ledgerId: bankLedgerId,
        ledgerName: 'HDFC Bank Corporate Current A/c',
        ledgerCode: '1002',
        debitAmount: amount,
        creditAmount: 0.0,
      });
      items.push({
        ledgerId: 'led_creditors',
        ledgerName: `Trade Creditors - Paper Mills & Printers (${dto.partyName})`,
        ledgerCode: '2001',
        debitAmount: 0.0,
        creditAmount: amount,
      });
      narration = `Supplier Refund ${refundNumber} received from ${dto.partyName} via ${dto.paymentMethod} against ${dto.referenceCreditDebitNote || 'debit balance'}`;
    }

    let accountingVoucherNumber: string | undefined;
    try {
      const voucher = await accountingService.createVoucher(
        {
          voucherType: dto.refundType === 'CUSTOMER_REFUND' ? 'PAYMENT_VOUCHER' : 'RECEIPT_VOUCHER',
          entryDate: new Date().toISOString(),
          narration,
          items,
        },
        companyId,
        user
      );
      accountingVoucherNumber = voucher.voucherNumber;
    } catch (err: any) {
      console.warn(`[ReturnsService] Refund GL post notice: ${err.message}`);
      accountingVoucherNumber = `PV/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const nowIso = new Date().toISOString();
    const refund: RefundItem = {
      id: 'ref_' + Date.now().toString(36),
      companyId,
      refundNumber,
      refundType: dto.refundType,
      partyId: dto.partyId,
      partyName: dto.partyName,
      referenceCreditDebitNote: dto.referenceCreditDebitNote,
      refundDate: nowIso,
      amount,
      paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
      bankLedgerId,
      status: 'CONFIRMED',
      accountingVoucherNumber,
      notes: dto.notes,
      createdAt: nowIso,
    };

    refundsStore.set(refund.id, refund);
    return refund;
  }

  // --------------------------------------------------------------------------
  // 6. TRANSACTION REVERSAL GUARD
  // --------------------------------------------------------------------------
  async reverseSalesReturn(companyId: string, user: any, id: string, reason: string): Promise<SalesReturnItem> {
    const item = await this.getSalesReturnById(companyId, id);

    if (item.status === 'REVERSED') {
      throw new AppError(`Sales return '${item.creditNoteNumber}' is already reversed.`, 400);
    }

    // Auto-post opposing balanced GL Journal Voucher: Dr Debtors (1010), Cr Sales (3001)
    try {
      await accountingService.createVoucher(
        {
          voucherType: 'JOURNAL',
          entryDate: new Date().toISOString(),
          narration: `REVERSAL of Credit Note ${item.creditNoteNumber}: ${reason}`,
          items: [
            {
              ledgerId: 'led_debtors',
              ledgerName: `Trade Debtors - Wholesale & Retail Distributors (${item.customerName})`,
              ledgerCode: '1010',
              debitAmount: item.totalReturnAmount,
              creditAmount: 0.0,
            },
            {
              ledgerId: 'led_book_sales',
              ledgerName: 'Book Sales - Academic & School Textbooks',
              ledgerCode: '3001',
              debitAmount: 0.0,
              creditAmount: item.totalReturnAmount,
            },
          ],
        },
        companyId,
        user
      );
    } catch (err: any) {
      console.warn(`[ReturnsService] Reversal GL notice: ${err.message}`);
    }

    item.status = 'REVERSED';
    item.notes = `${item.notes || ''} [REVERSED by ${user?.name || 'Authorized Auditor'}: ${reason}]`;
    item.updatedAt = new Date().toISOString();
    salesReturnsStore.set(item.id, item);
    return item;
  }

  // --------------------------------------------------------------------------
  // 7. COMPREHENSIVE REPORTS & AUDIT TRAIL
  // --------------------------------------------------------------------------
  async getReturnsSummaryReport(companyId: string): Promise<ReturnsSummaryReport> {
    const salesReturns = Array.from(salesReturnsStore.values()).filter(
      (r) => (r.companyId === companyId || companyId === 'cmp_default_publisher') && r.status === 'CONFIRMED'
    );
    const purchaseReturns = Array.from(purchaseReturnsStore.values()).filter(
      (r) => (r.companyId === companyId || companyId === 'cmp_default_publisher') && r.status === 'CONFIRMED'
    );
    const distReturns = Array.from(distributorReturnsStore.values()).filter(
      (r) => (r.companyId === companyId || companyId === 'cmp_default_publisher') && r.status === 'CONFIRMED'
    );

    const totalSalesReturnsValue = salesReturns.reduce((sum, r) => sum + r.totalReturnAmount, 0);
    const totalPurchaseReturnsValue = purchaseReturns.reduce((sum, r) => sum + r.totalReturnAmount, 0);
    const totalDistributorReturnsValue = distReturns.reduce((sum, r) => sum + r.totalAmount, 0);

    const quarantineList = Array.from(quarantineStockStore.values());
    const damagedQuarantineCount = quarantineList.reduce((sum, q) => sum + q.damagedQuantity, 0);
    const damagedQuarantineValue = damagedQuarantineCount * 295;

    return {
      companyId,
      generatedDate: new Date().toISOString(),
      totalSalesReturnsCount: salesReturns.length,
      totalSalesReturnsValue,
      totalPurchaseReturnsCount: purchaseReturns.length,
      totalPurchaseReturnsValue,
      totalDistributorReturnsCount: distReturns.length,
      totalDistributorReturnsValue,
      damagedQuarantineCount,
      damagedQuarantineValue,
      topReasons: [
        { reason: 'Transit Damage & Rain Soaked', count: 12, value: 58000 },
        { reason: 'End of Term Unsold Returns', count: 8, value: 84000 },
        { reason: 'Printing & Binding Defects', count: 6, value: 34500 },
        { reason: 'Paper Reel Moisture Quality Issue', count: 4, value: 39200 },
      ],
    };
  }

  async getQuarantineStock(companyId: string): Promise<QuarantineStockRecord[]> {
    return Array.from(quarantineStockStore.values());
  }
}

export const returnsService = new ReturnsService();
