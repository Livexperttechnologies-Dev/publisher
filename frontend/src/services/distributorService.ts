import { postDoubleEntryVoucher } from './voucherService';
import { getStoredLedgers } from './accountingService';
import { getStoredStocks, saveStoredStocks, recordStockMovement } from './inventoryService';
import { getStoredParties, savePartyItem, PartyItem } from './catalogueService';

export interface DistributorItem {
  id: string;
  distributorCode: string;
  name: string;
  territory: 'NORTH_INDIA' | 'WEST_INDIA' | 'SOUTH_INDIA' | 'EAST_INDIA' | 'CENTRAL_INDIA' | 'NATIONAL';
  city: string;
  state: string;
  address?: string;
  gstin?: string;
  pan?: string;
  creditLimit: number;
  currentOutstanding: number;
  commissionPercentage: number;
  standardDiscountPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  contactPerson: string;
  phone: string;
  email: string;
}

export interface DealerItem {
  id: string;
  dealerCode: string;
  name: string;
  classification: 'RETAIL_BOOKSTORE' | 'INSTITUTIONAL_SUPPLIER' | 'CHAIN_STORE' | 'ONLINE_SELLER';
  distributorName?: string;
  territory: string;
  city: string;
  state: string;
  creditLimit: number;
  currentOutstanding: number;
  discountPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  contactPerson: string;
  phone: string;
  email?: string;
}

export interface DistributionOrderItem {
  id: string;
  orderNumber: string;
  orderType: 'DISTRIBUTOR_BULK' | 'DEALER_WHOLESALE' | 'CONSIGNMENT_REPLENISHMENT';
  partyName: string;
  orderDate: string;
  dispatchDueDate?: string;
  totalQuantityOrdered: number;
  totalQuantityDispatched: number;
  netOrderAmount: number;
  status: 'CONFIRMED' | 'PARTIALLY_DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  transporterInfo?: string;
  lrNumber?: string;
  vehicleNumber?: string;
  warehouseName: string;
  notes?: string;
}

export interface ConsignmentIssueItem {
  id: string;
  issueNumber: string;
  distributorName: string;
  issueDate: string;
  sku: string;
  title: string;
  mrp: number;
  totalIssuedQuantity: number;
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  balanceOnHoldQuantity: number;
  status: 'ISSUED' | 'PARTIALLY_SETTLED' | 'RECONCILED';
  warehouseName: string;
  settlementVoucher?: string;
  notes?: string;
}

export interface CommissionSettlementItem {
  id: string;
  settlementNumber: string;
  distributorName: string;
  period: string;
  settlementDate: string;
  secondaryTurnover: number;
  baseCommissionRate: number;
  baseCommissionAmount: number;
  targetBonusRate: number;
  targetBonusAmount: number;
  totalCommissionPayable: number;
  voucherNumber: string;
  status: 'ACCRUED' | 'PAID';
  notes?: string;
}

// Initial Seeds
export const INITIAL_DISTRIBUTORS: DistributorItem[] = [
  {
    id: 'dist_01',
    distributorCode: 'DIST-NORTH-01',
    name: 'Oxford Book House & Educational Distributors Pvt Ltd',
    territory: 'NORTH_INDIA',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Plot 4, Publishers Row, Daryaganj, New Delhi - 110002',
    gstin: '07AAACR1234A1Z1',
    pan: 'AAACR1234A',
    creditLimit: 3500000.0,
    currentOutstanding: 1425000.0,
    commissionPercentage: 8.0,
    standardDiscountPercentage: 40.0,
    status: 'ACTIVE',
    contactPerson: 'Vikramaditya Roy',
    phone: '+91 98110 23489',
    email: 'wholesale@oxfordbooks.in',
  },
  {
    id: 'dist_02',
    distributorCode: 'DIST-WEST-02',
    name: 'Apex Western Booksellers & Distribution Hub Ltd',
    territory: 'WEST_INDIA',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Bldg B-3, Bhiwandi Logistics Corridor, Bhiwandi - 421302',
    gstin: '27AABCO4321A1Z9',
    pan: 'AABCO4321A',
    creditLimit: 2500000.0,
    currentOutstanding: 890000.0,
    commissionPercentage: 7.5,
    standardDiscountPercentage: 40.0,
    status: 'ACTIVE',
    contactPerson: 'Sanjay Deshmukh',
    phone: '+91 98201 88472',
    email: 'distribution@apexwestern.com',
  },
  {
    id: 'dist_03',
    distributorCode: 'DIST-SOUTH-03',
    name: 'Higginbothams Educational Book Distributors Pvt Ltd',
    territory: 'SOUTH_INDIA',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Anna Salai, Mount Road, Chennai - 600002',
    gstin: '33AABCH5566K1Z3',
    pan: 'AABCH5566K',
    creditLimit: 3000000.0,
    currentOutstanding: 297000.0,
    commissionPercentage: 8.5,
    standardDiscountPercentage: 40.0,
    status: 'ACTIVE',
    contactPerson: 'S. Ramanathan',
    phone: '+91 98401 99281',
    email: 'supply@higginbothams.co.in',
  },
];

export const INITIAL_DEALERS: DealerItem[] = [
  {
    id: 'dlr_01',
    dealerCode: 'DLR-DEL-101',
    name: 'Connaught Book Plaza & Academic Retailers',
    classification: 'RETAIL_BOOKSTORE',
    distributorName: 'Oxford Book House & Educational Distributors Pvt Ltd',
    territory: 'NORTH_INDIA',
    city: 'New Delhi',
    state: 'Delhi',
    creditLimit: 500000.0,
    currentOutstanding: 145000.0,
    discountPercentage: 30.0,
    status: 'ACTIVE',
    contactPerson: 'Arun Khandelwal',
    phone: '+91 98102 77162',
    email: 'sales@connaughtbooks.com',
  },
  {
    id: 'dlr_02',
    dealerCode: 'DLR-PUN-202',
    name: 'Pune Vidyarthi Griha & Institutional Suppliers',
    classification: 'INSTITUTIONAL_SUPPLIER',
    distributorName: 'Apex Western Booksellers & Distribution Hub Ltd',
    territory: 'WEST_INDIA',
    city: 'Pune',
    state: 'Maharashtra',
    creditLimit: 800000.0,
    currentOutstanding: 210000.0,
    discountPercentage: 35.0,
    status: 'ACTIVE',
    contactPerson: 'Milind Joshi',
    phone: '+91 98501 33291',
    email: 'academic@punevidyarthi.org',
  },
  {
    id: 'dlr_03',
    dealerCode: 'DLR-BLR-301',
    name: 'Bangalore Academic & Technical Book Suppliers',
    classification: 'INSTITUTIONAL_SUPPLIER',
    distributorName: 'Higginbothams Educational Book Distributors Pvt Ltd',
    territory: 'SOUTH_INDIA',
    city: 'Bangalore',
    state: 'Karnataka',
    creditLimit: 600000.0,
    currentOutstanding: 0.0,
    discountPercentage: 35.0,
    status: 'ACTIVE',
    contactPerson: 'K. Venkatesh',
    phone: '+91 98801 44219',
    email: 'orders@blrbooks.com',
  },
];

export const INITIAL_DIST_ORDERS: DistributionOrderItem[] = [
  {
    id: 'ord_01',
    orderNumber: 'ORD-DIST/2026/0001',
    orderType: 'DISTRIBUTOR_BULK',
    partyName: 'Higginbothams Educational Book Distributors Pvt Ltd',
    orderDate: '2026-11-04',
    dispatchDueDate: '2026-11-18',
    totalQuantityOrdered: 1000,
    totalQuantityDispatched: 600,
    netOrderAmount: 297000.0,
    status: 'PARTIALLY_DISPATCHED',
    transporterInfo: 'VRL Logistics India Ltd.',
    lrNumber: 'VRL-BLR-908122',
    vehicleNumber: 'MH-04-AZ-4521',
    warehouseName: 'Central Press & Distribution Depot',
    notes: 'South regional university campus bulk supply',
  },
  {
    id: 'ord_02',
    orderNumber: 'ORD-DIST/2026/0002',
    orderType: 'DISTRIBUTOR_BULK',
    partyName: 'Oxford Book House & Educational Distributors Pvt Ltd',
    orderDate: '2026-10-25',
    dispatchDueDate: '2026-11-05',
    totalQuantityOrdered: 2500,
    totalQuantityDispatched: 2500,
    netOrderAmount: 742500.0,
    status: 'COMPLETED',
    transporterInfo: 'TCI Freight Logistics',
    lrNumber: 'TCI-DEL-11928',
    vehicleNumber: 'DL-01-EA-8899',
    warehouseName: 'Central Press & Distribution Depot',
    notes: 'CBSE textbook season pre-order stock',
  },
];

export const INITIAL_CONSIGNMENTS: ConsignmentIssueItem[] = [
  {
    id: 'csg_01',
    issueNumber: 'CSG/2026/0001',
    distributorName: 'Oxford Book House & Educational Distributors Pvt Ltd',
    issueDate: '2026-10-20',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1 - Classic Edition)',
    mrp: 495.0,
    totalIssuedQuantity: 1500,
    totalSoldQuantity: 900,
    totalReturnedQuantity: 50,
    balanceOnHoldQuantity: 550,
    status: 'PARTIALLY_SETTLED',
    warehouseName: 'Central Press & Distribution Depot',
    notes: 'Delhi NCR university exhibition display consignment',
  },
  {
    id: 'csg_02',
    issueNumber: 'CSG/2026/0002',
    distributorName: 'Higginbothams Educational Book Distributors Pvt Ltd',
    issueDate: '2026-11-04',
    sku: 'BK-MATH-12-ENG-PB',
    title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
    mrp: 795.0,
    totalIssuedQuantity: 2000,
    totalSoldQuantity: 1200,
    totalReturnedQuantity: 100,
    balanceOnHoldQuantity: 700,
    status: 'PARTIALLY_SETTLED',
    warehouseName: 'Western Regional Hub & Godown (Bhiwandi)',
    notes: 'South zone school book fair stock loan',
  },
];

export const INITIAL_COMMISSIONS: CommissionSettlementItem[] = [
  {
    id: 'cms_01',
    settlementNumber: 'CMS/2026/0001',
    distributorName: 'Higginbothams Educational Book Distributors Pvt Ltd',
    period: 'Q2 FY26-27 Commission Cycle',
    settlementDate: '2026-11-05',
    secondaryTurnover: 6000000.0,
    baseCommissionRate: 8.5,
    baseCommissionAmount: 510000.0,
    targetBonusRate: 2.0,
    targetBonusAmount: 120000.0,
    totalCommissionPayable: 630000.0,
    voucherNumber: 'JV/2026/0662',
    status: 'ACCRUED',
    notes: 'Annual volume incentive accelerator achieved for South territory',
  },
];

// LocalStorage Keys
const DISTRIBUTORS_KEY = 'kibo360_distributors_v2';
const DEALERS_KEY = 'kibo360_dealers_v2';
const DIST_ORDERS_KEY = 'kibo360_dist_orders_v2';
const CONSIGNMENTS_KEY = 'kibo360_consignments_v2';
const COMMISSIONS_KEY = 'kibo360_commissions_v2';

// --- DISTRIBUTOR HELPERS ---
export function getStoredDistributors(): DistributorItem[] {
  try {
    const raw = localStorage.getItem(DISTRIBUTORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredDistributors(INITIAL_DISTRIBUTORS);
  return INITIAL_DISTRIBUTORS;
}

export function saveStoredDistributors(distributors: DistributorItem[]): void {
  try {
    localStorage.setItem(DISTRIBUTORS_KEY, JSON.stringify(distributors));
  } catch {}
}

export function saveDistributorItem(
  dist: Partial<DistributorItem> & { name: string; city: string }
): DistributorItem {
  const current = getStoredDistributors();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const territoryCode = (dist.territory || 'NORTH').slice(0, 4);
  const distributorCode =
    dist.distributorCode || `DIST-${territoryCode}-${String(count).padStart(2, '0')}`;

  if (dist.id) {
    const updated = current.map((d) =>
      d.id === dist.id ? ({ ...d, ...dist } as DistributorItem) : d
    );
    saveStoredDistributors(updated);
    return updated.find((d) => d.id === dist.id)!;
  } else {
    const created: DistributorItem = {
      id: 'dist_' + Date.now(),
      distributorCode,
      name: dist.name,
      territory: dist.territory || 'NORTH_INDIA',
      city: dist.city,
      state: dist.state || 'Delhi',
      address: dist.address,
      gstin: dist.gstin || '07AAAAA0000A1Z5',
      pan: dist.pan || 'AAAAA0000A',
      creditLimit: Number(dist.creditLimit) || 2500000.0,
      currentOutstanding: Number(dist.currentOutstanding) || 0,
      commissionPercentage: Number(dist.commissionPercentage) || 8.0,
      standardDiscountPercentage: Number(dist.standardDiscountPercentage) || 40.0,
      status: dist.status || 'ACTIVE',
      contactPerson: dist.contactPerson || 'Regional Lead',
      phone: dist.phone || '+91 98000 00000',
      email: dist.email || 'partner@publisher.in',
    };

    saveStoredDistributors([created, ...current]);

    // Also register in universal Party catalogue
    savePartyItem({
      name: created.name,
      code: created.distributorCode,
      partyType: 'DISTRIBUTOR',
      contactPerson: created.contactPerson,
      phone: created.phone,
      email: created.email,
      gstin: created.gstin || '',
      pan: created.pan || '',
      city: created.city,
      state: created.state,
      creditLimit: created.creditLimit,
      creditDays: 45,
      discountRate: created.standardDiscountPercentage,
      paymentTerms: '45 Days Net Credit',
    });

    return created;
  }
}

export function deleteDistributorItem(id: string): void {
  const current = getStoredDistributors();
  saveStoredDistributors(current.filter((d) => d.id !== id));
}

// --- DEALER HELPERS ---
export function getStoredDealers(): DealerItem[] {
  try {
    const raw = localStorage.getItem(DEALERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredDealers(INITIAL_DEALERS);
  return INITIAL_DEALERS;
}

export function saveStoredDealers(dealers: DealerItem[]): void {
  try {
    localStorage.setItem(DEALERS_KEY, JSON.stringify(dealers));
  } catch {}
}

export function saveDealerItem(
  dealer: Partial<DealerItem> & { name: string; city: string }
): DealerItem {
  const current = getStoredDealers();
  const count = current.length + 1;
  const dealerCode =
    dealer.dealerCode ||
    `DLR-${dealer.city.toUpperCase().slice(0, 3)}-${String(count + 100)}`;

  if (dealer.id) {
    const updated = current.map((d) =>
      d.id === dealer.id ? ({ ...d, ...dealer } as DealerItem) : d
    );
    saveStoredDealers(updated);
    return updated.find((d) => d.id === dealer.id)!;
  } else {
    const created: DealerItem = {
      id: 'dlr_' + Date.now(),
      dealerCode,
      name: dealer.name,
      classification: dealer.classification || 'RETAIL_BOOKSTORE',
      distributorName: dealer.distributorName,
      territory: dealer.territory || 'NORTH_INDIA',
      city: dealer.city,
      state: dealer.state || 'Delhi',
      creditLimit: Number(dealer.creditLimit) || 500000.0,
      currentOutstanding: Number(dealer.currentOutstanding) || 0,
      discountPercentage: Number(dealer.discountPercentage) || 30.0,
      status: dealer.status || 'ACTIVE',
      contactPerson: dealer.contactPerson || 'Store Manager',
      phone: dealer.phone || '+91 98000 00000',
      email: dealer.email,
    };

    saveStoredDealers([created, ...current]);

    // Also register in universal Party catalogue
    savePartyItem({
      name: created.name,
      code: created.dealerCode,
      partyType: 'DEALER',
      contactPerson: created.contactPerson,
      phone: created.phone,
      email: created.email || '',
      gstin: '07AAAAA0000A1Z5',
      pan: 'AAAAA0000A',
      city: created.city,
      state: created.state,
      creditLimit: created.creditLimit,
      creditDays: 30,
      discountRate: created.discountPercentage,
      paymentTerms: '30 Days Net Credit',
    });

    return created;
  }
}

export function deleteDealerItem(id: string): void {
  const current = getStoredDealers();
  saveStoredDealers(current.filter((d) => d.id !== id));
}

// --- DISTRIBUTION ORDERS HELPERS ---
export function getStoredDistOrders(): DistributionOrderItem[] {
  try {
    const raw = localStorage.getItem(DIST_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredDistOrders(INITIAL_DIST_ORDERS);
  return INITIAL_DIST_ORDERS;
}

export function saveStoredDistOrders(orders: DistributionOrderItem[]): void {
  try {
    localStorage.setItem(DIST_ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export function saveDistOrderItem(
  order: Partial<DistributionOrderItem> & {
    partyName: string;
    totalQuantityOrdered: number;
    netOrderAmount: number;
  }
): DistributionOrderItem {
  const current = getStoredDistOrders();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const orderNumber = order.orderNumber || `ORD-DIST/${year}/${String(count).padStart(4, '0')}`;

  const created: DistributionOrderItem = {
    id: order.id || 'ord_' + Date.now(),
    orderNumber,
    orderType: order.orderType || 'DISTRIBUTOR_BULK',
    partyName: order.partyName,
    orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
    dispatchDueDate:
      order.dispatchDueDate ||
      new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    totalQuantityOrdered: Number(order.totalQuantityOrdered) || 1000,
    totalQuantityDispatched: Number(order.totalQuantityDispatched) || 0,
    netOrderAmount: Number(order.netOrderAmount) || 0,
    status: order.status || 'CONFIRMED',
    transporterInfo: order.transporterInfo || 'VRL Logistics India Ltd.',
    lrNumber: order.lrNumber || `LR-${Math.floor(100000 + Math.random() * 900000)}`,
    vehicleNumber: order.vehicleNumber || 'MH-04-AZ-4521',
    warehouseName: order.warehouseName || 'Central Press & Distribution Depot',
    notes: order.notes,
  };

  saveStoredDistOrders([created, ...current]);
  return created;
}

// --- CONSIGNMENTS HELPERS ---
export function getStoredConsignments(): ConsignmentIssueItem[] {
  try {
    const raw = localStorage.getItem(CONSIGNMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredConsignments(INITIAL_CONSIGNMENTS);
  return INITIAL_CONSIGNMENTS;
}

export function saveStoredConsignments(consignments: ConsignmentIssueItem[]): void {
  try {
    localStorage.setItem(CONSIGNMENTS_KEY, JSON.stringify(consignments));
  } catch {}
}

export function saveConsignmentItem(
  csg: Partial<ConsignmentIssueItem> & {
    distributorName: string;
    sku: string;
    totalIssuedQuantity: number;
    mrp: number;
  }
): ConsignmentIssueItem {
  const current = getStoredConsignments();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const issueNumber = csg.issueNumber || `CSG/${year}/${String(count).padStart(4, '0')}`;
  const issued = Number(csg.totalIssuedQuantity) || 1000;
  const sold = Number(csg.totalSoldQuantity) || 0;
  const returned = Number(csg.totalReturnedQuantity) || 0;
  const balanceOnHold = Math.max(0, issued - sold - returned);

  const created: ConsignmentIssueItem = {
    id: csg.id || 'csg_' + Date.now(),
    issueNumber,
    distributorName: csg.distributorName,
    issueDate: csg.issueDate || new Date().toISOString().slice(0, 10),
    sku: csg.sku,
    title: csg.title || 'Book Title',
    mrp: Number(csg.mrp) || 495.0,
    totalIssuedQuantity: issued,
    totalSoldQuantity: sold,
    totalReturnedQuantity: returned,
    balanceOnHoldQuantity: balanceOnHold,
    status: balanceOnHold === 0 ? 'RECONCILED' : sold > 0 ? 'PARTIALLY_SETTLED' : 'ISSUED',
    warehouseName: csg.warehouseName || 'Central Press & Distribution Depot',
    notes: csg.notes,
  };

  saveStoredConsignments([created, ...current]);

  // Deduct from warehouse inventory
  try {
    const stocks = getStoredStocks();
    const stock = stocks.find((s) => s.sku === created.sku);
    if (stock) {
      stock.onHand = Math.max(0, stock.onHand - issued);
      stock.available = Math.max(0, stock.onHand - stock.reserved);
      saveStoredStocks(stocks);

      recordStockMovement({
        sku: created.sku,
        title: created.title,
        wh: created.warehouseName,
        type: 'OUTWARD_TRANSFER',
        ref: issueNumber,
        in: 0,
        out: issued,
        bal: stock.onHand,
        rate: stock.wacCost,
        notes: `Consignment issue loan to ${created.distributorName}`,
      });
    }
  } catch (e) {
    console.error('Error recording consignment stock transfer:', e);
  }

  return created;
}

export function settleConsignmentItem(
  id: string,
  soldQty: number,
  returnedQty: number
): ConsignmentIssueItem | null {
  const current = getStoredConsignments();
  const csg = current.find((c) => c.id === id);
  if (!csg) return null;

  const totalSold = csg.totalSoldQuantity + soldQty;
  const totalReturned = csg.totalReturnedQuantity + returnedQty;
  const balanceOnHold = Math.max(0, csg.totalIssuedQuantity - totalSold - totalReturned);
  const status: ConsignmentIssueItem['status'] =
    balanceOnHold === 0 ? 'RECONCILED' : 'PARTIALLY_SETTLED';

  const updated: ConsignmentIssueItem = {
    ...csg,
    totalSoldQuantity: totalSold,
    totalReturnedQuantity: totalReturned,
    balanceOnHoldQuantity: balanceOnHold,
    status,
  };

  saveStoredConsignments(current.map((c) => (c.id === id ? updated : c)));

  // If returned copies, restock them
  if (returnedQty > 0) {
    try {
      const stocks = getStoredStocks();
      const stock = stocks.find((s) => s.sku === csg.sku);
      if (stock) {
        stock.onHand += returnedQty;
        stock.available += returnedQty;
        saveStoredStocks(stocks);

        recordStockMovement({
          sku: csg.sku,
          title: csg.title,
          wh: csg.warehouseName,
          type: 'TRANSFER_RECEIPT',
          ref: csg.issueNumber,
          in: returnedQty,
          out: 0,
          bal: stock.onHand,
          rate: stock.wacCost,
          notes: `Consignment return restored from ${csg.distributorName}`,
        });
      }
    } catch (e) {
      console.error('Error restocking consignment returns:', e);
    }
  }

  return updated;
}

// --- COMMISSIONS HELPERS ---
export function getStoredCommissions(): CommissionSettlementItem[] {
  try {
    const raw = localStorage.getItem(COMMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredCommissions(INITIAL_COMMISSIONS);
  return INITIAL_COMMISSIONS;
}

export function saveStoredCommissions(commissions: CommissionSettlementItem[]): void {
  try {
    localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(commissions));
  } catch {}
}

export function saveCommissionItem(
  comm: Partial<CommissionSettlementItem> & {
    distributorName: string;
    secondaryTurnover: number;
    baseCommissionRate: number;
    targetBonusRate: number;
  }
): CommissionSettlementItem {
  const current = getStoredCommissions();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const settlementNumber =
    comm.settlementNumber || `CMS/${year}/${String(count).padStart(4, '0')}`;
  const voucherNumber = comm.voucherNumber || `JV/${year}/${String(count + 660).padStart(4, '0')}`;

  const turnover = Number(comm.secondaryTurnover) || 0;
  const baseRate = Number(comm.baseCommissionRate) || 8.0;
  const bonusRate = Number(comm.targetBonusRate) || 0;
  const baseAmount = Number(((turnover * baseRate) / 100).toFixed(2));
  const bonusAmount = Number(((turnover * bonusRate) / 100).toFixed(2));
  const totalPayable = Number((baseAmount + bonusAmount).toFixed(2));

  const created: CommissionSettlementItem = {
    id: comm.id || 'cms_' + Date.now(),
    settlementNumber,
    distributorName: comm.distributorName,
    period: comm.period || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} FY${year}-${String(year + 1).slice(-2)} Commission Cycle`,
    settlementDate: comm.settlementDate || new Date().toISOString().slice(0, 10),
    secondaryTurnover: turnover,
    baseCommissionRate: baseRate,
    baseCommissionAmount: baseAmount,
    targetBonusRate: bonusRate,
    targetBonusAmount: bonusAmount,
    totalCommissionPayable: totalPayable,
    voucherNumber,
    status: 'ACCRUED',
    notes: comm.notes,
  };

  saveStoredCommissions([created, ...current]);

  // Post Double-Entry Journal Voucher in General Ledger
  try {
    const ledgers = getStoredLedgers();
    const expenseLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('commission') || l.name.toLowerCase().includes('discount')) ||
      ledgers.find((l) => l.classification === 'EXPENSE') ||
      ledgers[0];

    const payableLedger =
      ledgers.find((l) => l.name.toLowerCase().includes('payable') || l.name.toLowerCase().includes('creditor')) ||
      ledgers.find((l) => l.classification === 'LIABILITY') ||
      ledgers[1] ||
      ledgers[0];

    postDoubleEntryVoucher({
      voucherType: 'JOURNAL',
      date: created.settlementDate,
      branchName: 'Delhi HQ',
      createdByName: 'Channel Accounts Manager',
      narration: `Overriding Commission settlement ${settlementNumber} for ${created.distributorName} on turnover ₹${created.secondaryTurnover.toLocaleString('en-IN')}`,
      totalAmount: totalPayable,
      items: [
        {
          id: 'cvli_' + Date.now() + '_1',
          ledgerId: expenseLedger.id,
          ledgerName: 'Distributor Overriding Commission Expense',
          ledgerCode: expenseLedger.code,
          debitAmount: totalPayable,
          creditAmount: 0,
          description: `Base ${baseRate}% + Target ${bonusRate}% Bonus per ${settlementNumber}`,
        },
        {
          id: 'cvli_' + Date.now() + '_2',
          ledgerId: payableLedger.id,
          ledgerName: `${created.distributorName} (Commission Payable)`,
          ledgerCode: payableLedger.code,
          debitAmount: 0,
          creditAmount: totalPayable,
          description: `Commission Accrual payable for ${created.period}`,
        },
      ],
    });
  } catch (e) {
    console.error('Error posting GL voucher for commission settlement:', e);
  }

  return created;
}
