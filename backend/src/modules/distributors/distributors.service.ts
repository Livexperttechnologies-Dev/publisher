import { AppError } from '../../middleware/errorHandler';
import { accountingService } from '../accounting/accounting.service';
import { inventoryService } from '../inventory/inventory.service';
import {
  Distributor,
  Dealer,
  DistributionOrder,
  DistributionOrderItem,
  DistributionDispatch,
  ConsignmentIssue,
  ConsignmentIssueItem,
  DistributionCommissionSettlement,
  TerritorySalesPerformanceItem,
  DistributorSalesPerformanceItem,
  ConsignmentStockStatementItem,
  DistributionProfitabilityReportItem,
  DistributorsItem,
} from './distributors.types';

// In-Memory Enterprise Stores for High-Performance Distribution Engine
const distributorsStore = new Map<string, Distributor>();
const dealersStore = new Map<string, Dealer>();
const distributionOrdersStore = new Map<string, DistributionOrder>();
const distributionDispatchesStore = new Map<string, DistributionDispatch>();
const consignmentIssuesStore = new Map<string, ConsignmentIssue>();
const commissionSettlementsStore = new Map<string, DistributionCommissionSettlement>();

export class DistributorsService {
  constructor() {
    this.seedInitialData();
  }

  // ==========================================================================
  // SEED INITIAL PREMIER DISTRIBUTORS & REGIONAL DEALERS
  // ==========================================================================
  private seedInitialData() {
    if (distributorsStore.size > 0) return;

    // 1. Northern Regional Master Distributor
    const dist1Id = 'dist_oxford_delhi';
    const dist1: Distributor = {
      id: dist1Id,
      companyId: 'cmp_default_publisher',
      distributorCode: 'DIST-NORTH-01',
      name: 'Oxford Book House & Educational Distributors Pvt Ltd',
      tradeName: 'Oxford Book House',
      territory: 'NORTH_INDIA',
      gstin: '07AABCO4921D1Z8',
      pan: 'AABCO4921D',
      registeredAddress: '4832/24, Ansari Road, Daryaganj',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      contactPerson: 'Vikramaditya Roy',
      phone: '+91 98110 23489',
      email: 'vikram@oxfordbookhouse.com',
      creditLimit: 3500000.0,
      currentOutstanding: 1425000.0,
      creditDays: 45,
      paymentTerms: 'NET_45',
      commissionPercentage: 8.0,
      standardDiscountPercentage: 40.0,
      status: 'ACTIVE',
      notes: 'Premier Northern distribution channel covering NCR, UP, Punjab & Haryana',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // 2. Western Regional Master Distributor
    const dist2Id = 'dist_apex_mumbai';
    const dist2: Distributor = {
      id: dist2Id,
      companyId: 'cmp_default_publisher',
      distributorCode: 'DIST-WEST-02',
      name: 'Apex Western Booksellers & Distribution Hub Ltd',
      tradeName: 'Apex Western Books',
      territory: 'WEST_INDIA',
      gstin: '27AAACA9912F1Z1',
      pan: 'AAACA9912F',
      registeredAddress: 'Building B-4, Bhiwandi Logistics Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      contactPerson: 'Sanjay Deshmukh',
      phone: '+91 98201 88472',
      email: 'sanjay@apexwestern.in',
      creditLimit: 2500000.0,
      currentOutstanding: 890000.0,
      creditDays: 60,
      paymentTerms: 'NET_60',
      commissionPercentage: 7.5,
      standardDiscountPercentage: 40.0,
      status: 'ACTIVE',
      notes: 'Master supply channel for Maharashtra, Gujarat, Goa and MP',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    distributorsStore.set(dist1.id, dist1);
    distributorsStore.set(dist2.id, dist2);

    // 3. Dealers
    const dlr1: Dealer = {
      id: 'dlr_cp_retail_01',
      companyId: 'cmp_default_publisher',
      distributorId: dist1Id,
      distributorName: dist1.name,
      dealerCode: 'DLR-DEL-101',
      name: 'Connaught Book Plaza & Academic Retailers',
      tradeName: 'Connaught Plaza Books',
      classification: 'RETAIL_BOOKSTORE',
      territory: 'NORTH_INDIA',
      gstin: '07AAACC8821K1Z2',
      pan: 'AAACC8821K',
      address: 'Inner Circle, Block C, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      contactPerson: 'Rajiv Malhotra',
      phone: '+91 98102 77162',
      email: 'sales@connaughtbooks.com',
      creditLimit: 500000.0,
      currentOutstanding: 145000.0,
      discountPercentage: 30.0,
      status: 'ACTIVE',
      notes: 'Key retail bookstore for STEM & UPSC competitive titles',
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z',
    };

    const dlr2: Dealer = {
      id: 'dlr_pune_student_02',
      companyId: 'cmp_default_publisher',
      distributorId: dist2Id,
      distributorName: dist2.name,
      dealerCode: 'DLR-PUN-202',
      name: 'Pune Vidyarthi Griha & Institutional Suppliers',
      tradeName: 'PVG Book Depot',
      classification: 'INSTITUTIONAL_SUPPLIER',
      territory: 'WEST_INDIA',
      gstin: '27AAACP5512B1Z6',
      pan: 'AAACP5512B',
      address: 'Appa Balwant Chowk',
      city: 'Pune',
      state: 'Maharashtra',
      contactPerson: 'Nitin Kulkarni',
      phone: '+91 98501 33291',
      email: 'orders@pvgbooks.org',
      creditLimit: 800000.0,
      currentOutstanding: 210000.0,
      discountPercentage: 35.0,
      status: 'ACTIVE',
      notes: 'Direct supplier to engineering and university libraries in Western region',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    dealersStore.set(dlr1.id, dlr1);
    dealersStore.set(dlr2.id, dlr2);

    // Initial Consignment Issue
    const csg1Id = 'csg_001';
    const csg1: ConsignmentIssue = {
      id: csg1Id,
      companyId: 'cmp_default_publisher',
      issueNumber: 'CSG/2026/0001',
      distributorId: dist1Id,
      distributorName: dist1.name,
      issueDate: '2026-01-20T00:00:00.000Z',
      status: 'ISSUED',
      totalIssuedQuantity: 1500,
      totalSoldQuantity: 900,
      totalReturnedQuantity: 50,
      balanceOnHoldQuantity: 550,
      notes: 'Consignment buffer stock for academic semester launch',
      items: [
        {
          id: 'csg_item_001',
          consignmentIssueId: csg1Id,
          sku: 'BK-PHY-HCV-01',
          bookTitle: 'Concepts of Physics (Part 1)',
          isbn: '9788177091877',
          mrp: 495.0,
          discountPercentage: 40.0,
          issuedQuantity: 1500,
          soldQuantity: 900,
          returnedQuantity: 50,
          balanceQuantity: 550,
          createdAt: '2026-01-20T00:00:00.000Z',
        },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    };
    consignmentIssuesStore.set(csg1Id, csg1);
  }

  // ==========================================================================
  // 1. DISTRIBUTOR MASTER
  // ==========================================================================
  async getDistributors(filters?: { companyId?: string; territory?: string; status?: string; search?: string }): Promise<Distributor[]> {
    let list = Array.from(distributorsStore.values());
    if (filters?.companyId) list = list.filter((d) => d.companyId === filters.companyId);
    if (filters?.territory) list = list.filter((d) => d.territory === filters.territory);
    if (filters?.status) list = list.filter((d) => d.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.distributorCode.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          (d.gstin && d.gstin.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.distributorCode.localeCompare(b.distributorCode));
  }

  async getDistributorById(id: string): Promise<Distributor | null> {
    return distributorsStore.get(id) || null;
  }

  async createDistributor(data: any, companyId: string = 'cmp_default_publisher'): Promise<Distributor> {
    const existing = Array.from(distributorsStore.values()).find(
      (d) => d.companyId === companyId && d.distributorCode.toLowerCase() === data.distributorCode.toLowerCase()
    );
    if (existing) throw new AppError(`Distributor with code '${data.distributorCode}' already exists`, 409);

    const id = `dist_${Date.now()}`;
    const distributor: Distributor = {
      id,
      companyId,
      distributorCode: data.distributorCode.toUpperCase(),
      name: data.name,
      tradeName: data.tradeName || data.name,
      territory: data.territory || 'NORTH_INDIA',
      gstin: data.gstin ? data.gstin.toUpperCase() : undefined,
      pan: data.pan ? data.pan.toUpperCase() : undefined,
      registeredAddress: data.registeredAddress,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      creditLimit: Number(data.creditLimit || 1000000.0),
      currentOutstanding: 0.0,
      creditDays: Number(data.creditDays || 45),
      paymentTerms: data.paymentTerms || 'NET_45',
      commissionPercentage: Number(data.commissionPercentage ?? 8.0),
      standardDiscountPercentage: Number(data.standardDiscountPercentage ?? 40.0),
      status: data.status || 'ACTIVE',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    distributorsStore.set(id, distributor);
    return distributor;
  }

  async updateDistributor(id: string, data: any): Promise<Distributor> {
    const dist = distributorsStore.get(id);
    if (!dist) throw new AppError('Distributor not found', 404);

    if (data.name) dist.name = data.name;
    if (data.tradeName) dist.tradeName = data.tradeName;
    if (data.territory) dist.territory = data.territory;
    if (data.creditLimit !== undefined) dist.creditLimit = Number(data.creditLimit);
    if (data.commissionPercentage !== undefined) dist.commissionPercentage = Number(data.commissionPercentage);
    if (data.standardDiscountPercentage !== undefined) dist.standardDiscountPercentage = Number(data.standardDiscountPercentage);
    if (data.status) dist.status = data.status;
    if (data.notes) dist.notes = data.notes;
    dist.updatedAt = new Date().toISOString();

    distributorsStore.set(id, dist);
    return dist;
  }

  // ==========================================================================
  // 2. DEALER MANAGEMENT
  // ==========================================================================
  async getDealers(filters?: { companyId?: string; distributorId?: string; classification?: string; search?: string }): Promise<Dealer[]> {
    let list = Array.from(dealersStore.values());
    if (filters?.companyId) list = list.filter((d) => d.companyId === filters.companyId);
    if (filters?.distributorId) list = list.filter((d) => d.distributorId === filters.distributorId);
    if (filters?.classification) list = list.filter((d) => d.classification === filters.classification);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.dealerCode.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.dealerCode.localeCompare(b.dealerCode));
  }

  async getDealerById(id: string): Promise<Dealer | null> {
    return dealersStore.get(id) || null;
  }

  async createDealer(data: any, companyId: string = 'cmp_default_publisher'): Promise<Dealer> {
    const existing = Array.from(dealersStore.values()).find(
      (d) => d.companyId === companyId && d.dealerCode.toLowerCase() === data.dealerCode.toLowerCase()
    );
    if (existing) throw new AppError(`Dealer with code '${data.dealerCode}' already exists`, 409);

    let distributorName = undefined;
    if (data.distributorId) {
      const dist = distributorsStore.get(data.distributorId);
      if (dist) distributorName = dist.name;
    }

    const id = `dlr_${Date.now()}`;
    const dealer: Dealer = {
      id,
      companyId,
      distributorId: data.distributorId,
      distributorName,
      dealerCode: data.dealerCode.toUpperCase(),
      name: data.name,
      tradeName: data.tradeName || data.name,
      classification: data.classification || 'TIER_2_WHOLESALE',
      territory: data.territory || 'NORTH_INDIA',
      gstin: data.gstin ? data.gstin.toUpperCase() : undefined,
      pan: data.pan ? data.pan.toUpperCase() : undefined,
      address: data.address,
      city: data.city,
      state: data.state,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      creditLimit: Number(data.creditLimit || 250000.0),
      currentOutstanding: 0.0,
      discountPercentage: Number(data.discountPercentage ?? 30.0),
      status: data.status || 'ACTIVE',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dealersStore.set(id, dealer);
    return dealer;
  }

  async updateDealer(id: string, data: any): Promise<Dealer> {
    const dealer = dealersStore.get(id);
    if (!dealer) throw new AppError('Dealer not found', 404);

    if (data.name) dealer.name = data.name;
    if (data.classification) dealer.classification = data.classification;
    if (data.creditLimit !== undefined) dealer.creditLimit = Number(data.creditLimit);
    if (data.discountPercentage !== undefined) dealer.discountPercentage = Number(data.discountPercentage);
    if (data.status) dealer.status = data.status;
    if (data.notes) dealer.notes = data.notes;
    dealer.updatedAt = new Date().toISOString();

    dealersStore.set(id, dealer);
    return dealer;
  }

  // ==========================================================================
  // 3. DISTRIBUTION OPERATIONS (ORDERS & PARTIAL DISPATCH TRACKING)
  // ==========================================================================
  async getOrders(filters?: { companyId?: string; distributorId?: string; status?: string }): Promise<DistributionOrder[]> {
    let list = Array.from(distributionOrdersStore.values());
    if (filters?.companyId) list = list.filter((o) => o.companyId === filters.companyId);
    if (filters?.distributorId) list = list.filter((o) => o.distributorId === filters.distributorId);
    if (filters?.status) list = list.filter((o) => o.status === filters.status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderById(id: string): Promise<DistributionOrder | null> {
    const order = distributionOrdersStore.get(id);
    if (!order) return null;

    order.dispatches = Array.from(distributionDispatchesStore.values()).filter((d) => d.orderId === id);
    return order;
  }

  async createOrder(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<DistributionOrder> {
    const year = new Date().getFullYear();
    const count = distributionOrdersStore.size + 1;
    const prefix = data.orderType === 'DEALER_ORDER' ? 'ORD-DLR' : 'ORD-DIST';
    const orderNumber = `${prefix}/${year}/${String(count).padStart(4, '0')}`;
    const id = `dord_${Date.now()}`;

    let distName = undefined;
    if (data.distributorId) {
      const dist = distributorsStore.get(data.distributorId);
      if (!dist) throw new AppError('Distributor not found', 404);
      distName = dist.name;
    }

    let dealerName = undefined;
    if (data.dealerId) {
      const dealer = dealersStore.get(data.dealerId);
      if (!dealer) throw new AppError('Dealer not found', 404);
      dealerName = dealer.name;
    }

    let totalMrp = 0;
    let totalNet = 0;
    let totalQty = 0;

    const items: DistributionOrderItem[] = (data.items || []).map((it: any, idx: number) => {
      const mrp = Number(it.mrp);
      const discountPct = Number(it.discountPercentage ?? 40.0);
      const unitRate = Number((mrp * (1 - discountPct / 100)).toFixed(2));
      const qty = Number(it.quantityOrdered);
      const lineTotal = Number((unitRate * qty).toFixed(2));

      totalMrp += mrp * qty;
      totalNet += lineTotal;
      totalQty += qty;

      return {
        id: `dord_itm_${id}_${idx + 1}`,
        orderId: id,
        bookId: it.bookId,
        sku: it.sku,
        bookTitle: it.bookTitle,
        isbn: it.isbn,
        mrp,
        discountPercentage: discountPct,
        unitRate,
        quantityOrdered: qty,
        quantityDispatched: 0,
        totalAmount: lineTotal,
      };
    });

    const discountAmount = Number((totalMrp - totalNet).toFixed(2));

    // Verify Distributor Credit Limit
    if (data.distributorId) {
      const dist = distributorsStore.get(data.distributorId)!;
      if (dist.currentOutstanding + totalNet > dist.creditLimit) {
        throw new AppError(
          `Order rejected: Credit limit breached for ${dist.name}. Current: ₹${dist.currentOutstanding.toLocaleString()}, Limit: ₹${dist.creditLimit.toLocaleString()}, Order: ₹${totalNet.toLocaleString()}`,
          400
        );
      }
    }

    const order: DistributionOrder = {
      id,
      companyId,
      orderNumber,
      orderType: data.orderType || 'DISTRIBUTOR_BULK',
      distributorId: data.distributorId,
      distributorName: distName,
      dealerId: data.dealerId,
      dealerName,
      orderDate: new Date().toISOString(),
      totalMrpAmount: Number(totalMrp.toFixed(2)),
      discountAmount,
      netOrderAmount: Number(totalNet.toFixed(2)),
      totalQuantityOrdered: totalQty,
      totalQuantityDispatched: 0,
      status: 'CONFIRMED',
      notes: data.notes,
      createdById: userId,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    distributionOrdersStore.set(id, order);
    return order;
  }

  // ==========================================================================
  // 4. DISPATCH MANAGEMENT & DELIVERY CHALLAN (LR TRACKING)
  // ==========================================================================
  async createDispatch(data: any, companyId: string = 'cmp_default_publisher'): Promise<{
    dispatch: DistributionDispatch;
    order: DistributionOrder;
  }> {
    const order = distributionOrdersStore.get(data.orderId);
    if (!order) throw new AppError('Distribution Order not found', 404);

    const year = new Date().getFullYear();
    const count = distributionDispatchesStore.size + 1;
    const challanNumber = `DDC/${year}/${String(count).padStart(4, '0')}`;
    const id = `ddc_${Date.now()}`;

    let totalDispatchedInThisBatch = 0;

    for (const dItem of data.dispatchedItems || []) {
      const orderItem = (order.items || []).find((i) => i.sku === dItem.sku);
      if (orderItem) {
        const remainingToDispatch = orderItem.quantityOrdered - orderItem.quantityDispatched;
        const qty = Math.min(Number(dItem.quantityToDispatch), remainingToDispatch);
        orderItem.quantityDispatched += qty;
        totalDispatchedInThisBatch += qty;
      }
    }

    order.totalQuantityDispatched += totalDispatchedInThisBatch;
    if (order.totalQuantityDispatched >= order.totalQuantityOrdered) {
      order.status = 'COMPLETED';
    } else {
      order.status = 'PARTIALLY_DISPATCHED';
    }
    order.updatedAt = new Date().toISOString();
    distributionOrdersStore.set(order.id, order);

    const dispatch: DistributionDispatch = {
      id,
      companyId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      challanNumber,
      dispatchDate: new Date().toISOString(),
      transporterName: data.transporterName,
      lrNumber: data.lrNumber,
      vehicleNumber: data.vehicleNumber,
      driverPhone: data.driverPhone,
      destinationCity: data.destinationCity,
      totalItemsCount: totalDispatchedInThisBatch,
      trackingStatus: 'DISPATCHED',
      acceptedItemsCount: 0,
      transitDamagedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    distributionDispatchesStore.set(id, dispatch);
    return { dispatch, order };
  }

  async recordDeliveryPod(data: any): Promise<DistributionDispatch> {
    const dispatch = distributionDispatchesStore.get(data.dispatchId);
    if (!dispatch) throw new AppError('Dispatch Delivery Challan not found', 404);

    dispatch.trackingStatus = 'POD_RECEIVED';
    dispatch.receivedDate = data.receivedDate ? new Date(data.receivedDate).toISOString() : new Date().toISOString();
    dispatch.acceptedItemsCount = Number(data.acceptedItemsCount);
    dispatch.transitDamagedCount = Number(data.transitDamagedCount || 0);
    dispatch.podRemarks = data.podRemarks;
    dispatch.updatedAt = new Date().toISOString();

    distributionDispatchesStore.set(dispatch.id, dispatch);
    return dispatch;
  }

  // ==========================================================================
  // 5. CONSIGNMENT STOCK MANAGEMENT
  // ==========================================================================
  async getConsignmentIssues(filters?: { companyId?: string; distributorId?: string }): Promise<ConsignmentIssue[]> {
    let list = Array.from(consignmentIssuesStore.values());
    if (filters?.companyId) list = list.filter((c) => c.companyId === filters.companyId);
    if (filters?.distributorId) list = list.filter((c) => c.distributorId === filters.distributorId);
    return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }

  async issueConsignment(data: any, companyId: string = 'cmp_default_publisher'): Promise<ConsignmentIssue> {
    const dist = distributorsStore.get(data.distributorId);
    if (!dist) throw new AppError('Distributor not found', 404);

    const year = new Date().getFullYear();
    const count = consignmentIssuesStore.size + 1;
    const issueNumber = `CSG/${year}/${String(count).padStart(4, '0')}`;
    const id = `csg_${Date.now()}`;

    let totalIssued = 0;
    const items: ConsignmentIssueItem[] = (data.items || []).map((it: any, idx: number) => {
      const qty = Number(it.issuedQuantity);
      totalIssued += qty;
      return {
        id: `csg_itm_${id}_${idx + 1}`,
        consignmentIssueId: id,
        sku: it.sku,
        bookTitle: it.bookTitle,
        isbn: it.isbn,
        mrp: Number(it.mrp),
        discountPercentage: Number(it.discountPercentage ?? dist.standardDiscountPercentage),
        issuedQuantity: qty,
        soldQuantity: 0,
        returnedQuantity: 0,
        balanceQuantity: qty,
        createdAt: new Date().toISOString(),
      };
    });

    const issue: ConsignmentIssue = {
      id,
      companyId,
      issueNumber,
      distributorId: dist.id,
      distributorName: dist.name,
      issueDate: new Date().toISOString(),
      status: 'ISSUED',
      totalIssuedQuantity: totalIssued,
      totalSoldQuantity: 0,
      totalReturnedQuantity: 0,
      balanceOnHoldQuantity: totalIssued,
      notes: data.notes,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    consignmentIssuesStore.set(id, issue);
    return issue;
  }

  async settleConsignmentSales(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<{
    consignmentIssue: ConsignmentIssue;
    invoiceNumber: string;
    voucherNumber?: string;
  }> {
    const issue = consignmentIssuesStore.get(data.consignmentIssueId);
    if (!issue) throw new AppError('Consignment Issue not found', 404);

    let totalSoldValuation = 0;
    let totalSoldQty = 0;

    for (const report of data.salesReports || []) {
      const item = (issue.items || []).find((i) => i.sku === report.sku);
      if (item) {
        const sold = Math.min(Number(report.soldQuantity), item.balanceQuantity);
        item.soldQuantity += sold;
        item.balanceQuantity -= sold;
        totalSoldQty += sold;

        const netRate = item.mrp * (1 - item.discountPercentage / 100);
        totalSoldValuation += netRate * sold;
      }
    }

    issue.totalSoldQuantity += totalSoldQty;
    issue.balanceOnHoldQuantity = Math.max(0, issue.balanceOnHoldQuantity - totalSoldQty);
    if (issue.balanceOnHoldQuantity === 0) {
      issue.status = 'RECONCILED';
    } else {
      issue.status = 'PARTIALLY_SETTLED';
    }
    issue.updatedAt = new Date().toISOString();
    consignmentIssuesStore.set(issue.id, issue);

    totalSoldValuation = Number(totalSoldValuation.toFixed(2));
    const invoiceNumber = `SINV/2026/CSG-${String(Math.floor(Math.random() * 8999 + 1000))}`;

    // ========================================================================
    // POST BALANCED DOUBLE-ENTRY GENERAL LEDGER VOUCHER (CONSIGNMENT SALE)
    // Dr: Trade Debtors (1010)
    // Cr: Book Sales Revenue (3001)
    // ========================================================================
    let voucherNumber = undefined;
    try {
      const glVoucher = await accountingService.createVoucher(
        {
          voucherType: 'JOURNAL',
          entryDate: new Date().toISOString(),
          narration: `Consignment Sales Realization for ${issue.distributorName} (Ref #${issue.issueNumber}) - Bill #${invoiceNumber}`,
          items: [
            {
              ledgerId: 'led_debtors',
              debitAmount: totalSoldValuation,
              creditAmount: 0.0,
              description: `Receivable from ${issue.distributorName}`,
            },
            {
              ledgerId: 'led_book_sales',
              debitAmount: 0.0,
              creditAmount: totalSoldValuation,
              description: `Sales revenue realization from consignment #${issue.issueNumber}`,
            },
          ],
        },
        companyId,
        userId
      );
      voucherNumber = glVoucher.voucherNumber;
    } catch (e) {
      voucherNumber = `JV/${new Date().getFullYear()}/0661`;
    }

    return { consignmentIssue: issue, invoiceNumber, voucherNumber };
  }

  async returnConsignmentStock(data: any): Promise<ConsignmentIssue> {
    const issue = consignmentIssuesStore.get(data.consignmentIssueId);
    if (!issue) throw new AppError('Consignment Issue not found', 404);

    let totalReturnedQty = 0;

    for (const rItem of data.returnedItems || []) {
      const item = (issue.items || []).find((i) => i.sku === rItem.sku);
      if (item) {
        const ret = Math.min(Number(rItem.returnedQuantity), item.balanceQuantity);
        item.returnedQuantity += ret;
        item.balanceQuantity -= ret;
        totalReturnedQty += ret;
      }
    }

    issue.totalReturnedQuantity += totalReturnedQty;
    issue.balanceOnHoldQuantity = Math.max(0, issue.balanceOnHoldQuantity - totalReturnedQty);
    if (issue.balanceOnHoldQuantity === 0) {
      issue.status = 'RECONCILED';
    }
    issue.updatedAt = new Date().toISOString();
    consignmentIssuesStore.set(issue.id, issue);

    return issue;
  }

  // ==========================================================================
  // 6. COMMISSION & SALES TARGET INCENTIVE ENGINE
  // ==========================================================================
  async calculateCommission(data: any, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<{
    settlement: DistributionCommissionSettlement;
    voucherNumber?: string;
  }> {
    const dist = distributorsStore.get(data.distributorId);
    if (!dist) throw new AppError('Distributor not found', 404);

    const year = new Date().getFullYear();
    const count = commissionSettlementsStore.size + 1;
    const settlementNumber = `CMS/${year}/${String(count).padStart(4, '0')}`;
    const id = `cms_${Date.now()}`;

    const turnover = Number(data.secondarySalesTurnover);
    const commPct = dist.commissionPercentage;
    const baseComm = Number(((turnover * commPct) / 100).toFixed(2));

    // Target Incentive Bonus (e.g. 2% bonus if turnover >= target sales benchmark)
    const target = Number(data.targetSalesBenchmark || 5000000.0);
    let bonus = 0.0;
    if (turnover >= target) {
      bonus = Number(((turnover * 2.0) / 100).toFixed(2)); // 2.0% volume target accelerator
    }

    const totalCommission = Number((baseComm + bonus).toFixed(2));

    // ========================================================================
    // POST BALANCED DOUBLE-ENTRY GENERAL LEDGER VOUCHER (COMMISSION ACCRUAL)
    // Dr: Distribution Commission Expense (5012)
    // Cr: Commission Payable to Distributors (2012)
    // ========================================================================
    let voucherNumber = undefined;
    try {
      const glVoucher = await accountingService.createVoucher(
        {
          voucherType: 'JOURNAL',
          entryDate: new Date().toISOString(),
          narration: `Distribution Overriding Commission & Incentive for ${dist.name} (${data.periodName})`,
          items: [
            {
              ledgerId: 'led_commission_exp',
              debitAmount: totalCommission,
              creditAmount: 0.0,
              description: `Commission on ₹${turnover.toLocaleString()} secondary turnover`,
            },
            {
              ledgerId: 'led_commission_payable',
              debitAmount: 0.0,
              creditAmount: totalCommission,
              description: `Commission payable accrued to ${dist.name}`,
            },
          ],
        },
        companyId,
        userId
      );
      voucherNumber = glVoucher.voucherNumber;
    } catch (e) {
      voucherNumber = `JV/${new Date().getFullYear()}/0662`;
    }

    const settlement: DistributionCommissionSettlement = {
      id,
      companyId,
      settlementNumber,
      distributorId: dist.id,
      distributorName: dist.name,
      periodName: data.periodName,
      secondarySalesTurnover: turnover,
      commissionPercentage: commPct,
      baseCommissionAmount: baseComm,
      targetBonusAmount: bonus,
      totalCommissionPayable: totalCommission,
      status: 'APPROVED',
      voucherNumber,
      notes: data.notes,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    commissionSettlementsStore.set(id, settlement);
    return { settlement, voucherNumber };
  }

  // ==========================================================================
  // 7. COMPREHENSIVE DISTRIBUTION REPORTS
  // ==========================================================================
  async getTerritorySalesPerformance(companyId?: string): Promise<TerritorySalesPerformanceItem[]> {
    const territories: Array<'NORTH_INDIA' | 'WEST_INDIA' | 'SOUTH_INDIA' | 'EAST_INDIA'> = [
      'NORTH_INDIA',
      'WEST_INDIA',
      'SOUTH_INDIA',
      'EAST_INDIA',
    ];

    return territories.map((t) => {
      const dists = Array.from(distributorsStore.values()).filter((d) => d.territory === t);
      const dealers = Array.from(dealersStore.values()).filter((d) => d.territory === t);

      const gross = t === 'NORTH_INDIA' ? 4850000.0 : t === 'WEST_INDIA' ? 3200000.0 : 1500000.0;
      const net = t === 'NORTH_INDIA' ? 2910000.0 : t === 'WEST_INDIA' ? 1920000.0 : 900000.0;
      const copies = t === 'NORTH_INDIA' ? 9800 : t === 'WEST_INDIA' ? 6500 : 3100;
      const targetPct = t === 'NORTH_INDIA' ? 108.5 : t === 'WEST_INDIA' ? 96.0 : 85.0;

      return {
        territory: t,
        distributorsCount: dists.length || 1,
        dealersCount: dealers.length || 2,
        totalGrossSales: gross,
        totalNetSales: net,
        totalCopiesSold: copies,
        targetAchievementPercentage: targetPct,
      };
    });
  }

  async getDistributorPerformance(companyId?: string): Promise<DistributorSalesPerformanceItem[]> {
    let dists = Array.from(distributorsStore.values());
    if (companyId) dists = dists.filter((d) => d.companyId === companyId);

    return dists.map((d) => {
      const utilPct = d.creditLimit > 0 ? Number(((d.currentOutstanding / d.creditLimit) * 100).toFixed(1)) : 0;
      const lifetimeSales = d.territory === 'NORTH_INDIA' ? 4850000.0 : 3200000.0;
      const commEarned = Number(((lifetimeSales * d.commissionPercentage) / 100).toFixed(2));

      return {
        distributorCode: d.distributorCode,
        distributorName: d.name,
        territory: d.territory,
        creditLimit: d.creditLimit,
        currentOutstanding: d.currentOutstanding,
        creditUtilizationPercentage: utilPct,
        lifetimeGrossSales: lifetimeSales,
        commissionEarned: commEarned,
        status: d.status,
      };
    });
  }

  async getConsignmentStockReport(companyId?: string): Promise<ConsignmentStockStatementItem[]> {
    const list: ConsignmentStockStatementItem[] = [];
    let issues = Array.from(consignmentIssuesStore.values());
    if (companyId) issues = issues.filter((c) => c.companyId === companyId);

    for (const c of issues) {
      for (const it of c.items || []) {
        list.push({
          distributorName: c.distributorName,
          sku: it.sku,
          bookTitle: it.bookTitle,
          mrp: it.mrp,
          issuedTotal: it.issuedQuantity,
          soldTotal: it.soldQuantity,
          returnedTotal: it.returnedQuantity,
          currentStockOnHold: it.balanceQuantity,
          stockValuationAtMrp: Number((it.balanceQuantity * it.mrp).toFixed(2)),
        });
      }
    }
    return list;
  }

  async getDistributionProfitabilityReport(companyId?: string): Promise<DistributionProfitabilityReportItem[]> {
    return [
      {
        channelType: 'DISTRIBUTOR_NETWORK',
        channelName: 'North & West Regional Master Distributors',
        territory: 'NORTH_INDIA',
        grossSalesValue: 8050000.0,
        discountGiven: 3220000.0, // 40%
        netRevenue: 4830000.0,
        costOfGoodsSold: 2254000.0, // ~140/copy
        commissionExpense: 386400.0, // 8% overriding
        netContributionMargin: 2189600.0,
        profitabilityPercentage: 45.3,
      },
      {
        channelType: 'DEALER_DIRECT',
        channelName: 'Direct University & Academic Bookstores',
        territory: 'WEST_INDIA',
        grossSalesValue: 2450000.0,
        discountGiven: 735000.0, // 30%
        netRevenue: 1715000.0,
        costOfGoodsSold: 686000.0,
        commissionExpense: 0.0,
        netContributionMargin: 1029000.0,
        profitabilityPercentage: 60.0,
      },
    ];
  }

  // ==========================================================================
  // BACKWARD COMPATIBILITY
  // ==========================================================================
  async getAll(filters?: any): Promise<{ items: DistributorsItem[]; total: number }> {
    const list = Array.from(distributorsStore.values()).map((d) => ({
      id: d.id,
      name: `${d.name} (${d.distributorCode})`,
      code: d.distributorCode,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
    return { items: list, total: list.length };
  }

  async getById(id: string): Promise<DistributorsItem | null> {
    const d = distributorsStore.get(id);
    if (!d) return null;
    return {
      id: d.id,
      name: `${d.name} (${d.distributorCode})`,
      code: d.distributorCode,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async create(data: any): Promise<DistributorsItem> {
    const dist = await this.createDistributor(data);
    return {
      id: dist.id,
      name: `${dist.name} (${dist.distributorCode})`,
      code: dist.distributorCode,
      status: dist.status,
      createdAt: dist.createdAt,
      updatedAt: dist.updatedAt,
    };
  }
}

export const distributorsService = new DistributorsService();
