import { postDoubleEntryVoucher } from './voucherService';

export interface ExpenseVoucher {
  id: string;
  voucherNumber: string;
  categoryName: string;
  department: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CREDIT_CARD' | 'CHEQUE';
  vendorName?: string;
  date: string;
  notes?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
  accountingVoucherNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface FixedAsset {
  id: string;
  assetCode: string;
  assetName: string;
  category: 'PLANT_AND_MACHINERY' | 'COMPUTERS' | 'FURNITURE' | 'OFFICE_EQUIPMENT' | 'VEHICLES';
  purchaseDate: string;
  purchaseValue: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'SLM' | 'WDV';
  annualDepreciationRate: number; // in percentage e.g. 10 or 25
  accumulatedDepreciation: number;
  netBookValue: number;
  location: string;
  serialNumber?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'DISPOSED' | 'FULLY_DEPRECIATED';
  lastDepreciationDate?: string;
  lastDepreciationAmount?: number;
}

export interface ReimbursementClaim {
  id: string;
  claimNumber: string;
  employeeName: string;
  department: string;
  purpose: string;
  amount: number;
  receiptAttached?: boolean;
  claimDate: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  accountingVoucherNumber?: string;
  paidDate?: string;
  paymentMethod?: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  categoryName: string;
  department: string;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
  nextDueDate: string;
  vendorName: string;
  paymentMethod: string;
  status: 'ACTIVE' | 'PAUSED';
  autoGenerateVoucher: boolean;
  lastGeneratedDate?: string;
}

export interface BudgetPlan {
  id: string;
  budgetCode: string;
  financialYear: string;
  department: string;
  totalAllocatedExpense: number;
  actualExpenseIncurred: number;
  varianceAmount: number;
  variancePercentage: number;
  varianceStatus: 'FAVOURABLE' | 'ADVERSE';
}

const STORAGE_KEYS = {
  VOUCHERS: 'kibo360_expense_vouchers_v2',
  ASSETS: 'kibo360_fixed_assets_v2',
  REIMBURSEMENTS: 'kibo360_reimbursement_claims_v2',
  RECURRING: 'kibo360_recurring_expenses_v2',
  BUDGETS: 'kibo360_budget_plans_v2',
};

// Seed Data
const INITIAL_VOUCHERS: ExpenseVoucher[] = [
  {
    id: 'exp_001',
    voucherNumber: 'EXP/2026/0001',
    categoryName: 'Freight & Logistics',
    department: 'Logistics',
    amount: 18500,
    taxAmount: 925,
    totalAmount: 19425,
    paymentMethod: 'BANK_TRANSFER',
    vendorName: 'SafeXpress Logistics Pvt Ltd',
    status: 'APPROVED',
    accountingVoucherNumber: 'PV/2026/0101',
    date: '2026-10-15',
    notes: 'Warehouse transfer charges for North Indian distributor consignment',
    approvedBy: 'Head of Operations',
    approvedAt: '2026-10-15',
  },
  {
    id: 'exp_002',
    voucherNumber: 'EXP/2026/0002',
    categoryName: 'Marketing & Book Fairs',
    department: 'Marketing',
    amount: 85000,
    taxAmount: 15300,
    totalAmount: 100300,
    paymentMethod: 'BANK_TRANSFER',
    vendorName: 'National Book Trust India',
    status: 'APPROVED',
    accountingVoucherNumber: 'PV/2026/0102',
    date: '2026-10-18',
    notes: 'Stall advance for World Book Fair New Delhi 2027',
    approvedBy: 'Managing Director',
    approvedAt: '2026-10-18',
  },
  {
    id: 'exp_003',
    voucherNumber: 'EXP/2026/0003',
    categoryName: 'Editorial & Proofreading',
    department: 'Editorial',
    amount: 25000,
    taxAmount: 4500,
    totalAmount: 29500,
    paymentMethod: 'BANK_TRANSFER',
    vendorName: 'Apex Proofreading & Editorial Services',
    status: 'APPROVED',
    accountingVoucherNumber: 'PV/2026/0103',
    date: '2026-10-25',
    notes: 'Manuscript indexing and linguistic review for 4 Higher-Ed titles',
    approvedBy: 'Editorial Director',
    approvedAt: '2026-10-25',
  },
  {
    id: 'exp_004',
    voucherNumber: 'EXP/2026/0004',
    categoryName: 'Marketing & Book Fairs',
    department: 'Marketing',
    amount: 175000,
    taxAmount: 31500,
    totalAmount: 206500,
    paymentMethod: 'BANK_TRANSFER',
    vendorName: 'Frankfurt Book Fair GmbH',
    status: 'PENDING_APPROVAL',
    date: '2026-11-02',
    notes: 'International Rights Collective Stand booking and digital catalogue listing',
  },
  {
    id: 'exp_005',
    voucherNumber: 'EXP/2026/0005',
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Administration',
    amount: 42000,
    taxAmount: 7560,
    totalAmount: 49560,
    paymentMethod: 'BANK_TRANSFER',
    vendorName: 'BSES Rajdhani Power Ltd',
    status: 'APPROVED',
    accountingVoucherNumber: 'PV/2026/0104',
    date: '2026-11-03',
    notes: 'Electricity utility charges for printing press and warehouse facility',
    approvedBy: 'Admin Lead',
    approvedAt: '2026-11-03',
  },
];

const INITIAL_ASSETS: FixedAsset[] = [
  {
    id: 'ast_001',
    assetCode: 'AST/2026/0001',
    assetName: 'Heidelberg Speedmaster 4-Color Offset Press',
    category: 'PLANT_AND_MACHINERY',
    purchaseDate: '2024-04-01',
    purchaseValue: 12500000,
    salvageValue: 500000,
    usefulLifeYears: 10,
    depreciationMethod: 'SLM',
    annualDepreciationRate: 10,
    accumulatedDepreciation: 1850000,
    netBookValue: 10650000,
    location: 'Press Bay 1, Okhla Central Depot',
    serialNumber: 'HD-SM-74-9921',
    status: 'ACTIVE',
    lastDepreciationDate: '2026-03-31',
    lastDepreciationAmount: 1200000,
  },
  {
    id: 'ast_002',
    assetCode: 'AST/2026/0002',
    assetName: 'Dell PowerEdge ERP Production Server Cluster',
    category: 'COMPUTERS',
    purchaseDate: '2025-01-15',
    purchaseValue: 850000,
    salvageValue: 50000,
    usefulLifeYears: 4,
    depreciationMethod: 'WDV',
    annualDepreciationRate: 25,
    accumulatedDepreciation: 212500,
    netBookValue: 637500,
    location: 'Server Room, 3rd Floor Corporate Office',
    serialNumber: 'DELL-R750-X8841',
    status: 'ACTIVE',
    lastDepreciationDate: '2026-03-31',
    lastDepreciationAmount: 212500,
  },
  {
    id: 'ast_003',
    assetCode: 'AST/2026/0003',
    assetName: 'Heavy-Duty Industrial Cantilever Warehouse Racks',
    category: 'FURNITURE',
    purchaseDate: '2024-08-10',
    purchaseValue: 650000,
    salvageValue: 50000,
    usefulLifeYears: 8,
    depreciationMethod: 'SLM',
    annualDepreciationRate: 12.5,
    accumulatedDepreciation: 75000,
    netBookValue: 575000,
    location: 'Depot Section C, Aisle 1-8',
    serialNumber: 'RACK-CANT-2024',
    status: 'ACTIVE',
    lastDepreciationDate: '2026-03-31',
    lastDepreciationAmount: 75000,
  },
];

const INITIAL_CLAIMS: ReimbursementClaim[] = [
  {
    id: 'clm_001',
    claimNumber: 'CLM/2026/0001',
    employeeName: 'Rajesh Sharma',
    department: 'Editorial',
    purpose: 'Author manuscript discussion dinner & local conveyance (South Delhi)',
    amount: 4500,
    receiptAttached: true,
    status: 'SUBMITTED',
    claimDate: '2026-10-28',
  },
  {
    id: 'clm_002',
    claimNumber: 'CLM/2026/0002',
    employeeName: 'Ananya Deshmukh',
    department: 'Marketing',
    purpose: 'Delhi Book Fair local logistics & volunteer refreshments',
    amount: 6850,
    receiptAttached: true,
    status: 'PAID',
    accountingVoucherNumber: 'PV/2026/0105',
    paidDate: '2026-11-01',
    paymentMethod: 'UPI',
    claimDate: '2026-10-29',
  },
];

const INITIAL_RECURRING: RecurringExpense[] = [
  {
    id: 'rec_001',
    title: 'Central Depot Warehouse Lease',
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Logistics',
    amount: 120000,
    frequency: 'MONTHLY',
    nextDueDate: '2026-12-01',
    vendorName: 'DDA Commercial Properties Ltd',
    paymentMethod: 'BANK_TRANSFER',
    status: 'ACTIVE',
    autoGenerateVoucher: true,
    lastGeneratedDate: '2026-11-01',
  },
  {
    id: 'rec_002',
    title: 'AWS Cloud ERP Hosting & Automated Daily S3 Backup',
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Administration',
    amount: 35000,
    frequency: 'MONTHLY',
    nextDueDate: '2026-12-01',
    vendorName: 'Amazon Web Services India',
    paymentMethod: 'CREDIT_CARD',
    status: 'ACTIVE',
    autoGenerateVoucher: true,
    lastGeneratedDate: '2026-11-01',
  },
  {
    id: 'rec_003',
    title: 'Broadband Leased Line & Central Depot Wi-Fi',
    categoryName: 'Administrative, Rent & Utilities',
    department: 'Administration',
    amount: 14500,
    frequency: 'MONTHLY',
    nextDueDate: '2026-12-01',
    vendorName: 'Tata Tele Business Services',
    paymentMethod: 'BANK_TRANSFER',
    status: 'ACTIVE',
    autoGenerateVoucher: false,
    lastGeneratedDate: '2026-11-01',
  },
];

const INITIAL_BUDGETS: BudgetPlan[] = [
  {
    id: 'bdg_001',
    budgetCode: 'BDG/2026/0001',
    financialYear: '2026-2027',
    department: 'Production',
    totalAllocatedExpense: 15000000,
    actualExpenseIncurred: 4850000,
    varianceAmount: -10150000,
    variancePercentage: -67.67,
    varianceStatus: 'FAVOURABLE',
  },
  {
    id: 'bdg_002',
    budgetCode: 'BDG/2026/0002',
    financialYear: '2026-2027',
    department: 'Marketing',
    totalAllocatedExpense: 4500000,
    actualExpenseIncurred: 1850000,
    varianceAmount: -2650000,
    variancePercentage: -58.89,
    varianceStatus: 'FAVOURABLE',
  },
  {
    id: 'bdg_003',
    budgetCode: 'BDG/2026/0003',
    financialYear: '2026-2027',
    department: 'Editorial',
    totalAllocatedExpense: 3000000,
    actualExpenseIncurred: 1200000,
    varianceAmount: -1800000,
    variancePercentage: -60.0,
    varianceStatus: 'FAVOURABLE',
  },
  {
    id: 'bdg_004',
    budgetCode: 'BDG/2026/0004',
    financialYear: '2026-2027',
    department: 'Logistics',
    totalAllocatedExpense: 5000000,
    actualExpenseIncurred: 1850000,
    varianceAmount: -3150000,
    variancePercentage: -63.0,
    varianceStatus: 'FAVOURABLE',
  },
  {
    id: 'bdg_005',
    budgetCode: 'BDG/2026/0005',
    financialYear: '2026-2027',
    department: 'Administration',
    totalAllocatedExpense: 3500000,
    actualExpenseIncurred: 950000,
    varianceAmount: -2550000,
    variancePercentage: -72.86,
    varianceStatus: 'FAVOURABLE',
  },
];

// Helper to safe parse
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to store key ${key}`, err);
  }
}

// ==========================================
// EXPENSE VOUCHERS API
// ==========================================
export function getStoredExpenseVouchers(): ExpenseVoucher[] {
  return getFromStorage<ExpenseVoucher[]>(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS);
}

export function saveExpenseVoucher(voucher: Partial<ExpenseVoucher>): { voucher: ExpenseVoucher; glVoucherNumber?: string } {
  const current = getStoredExpenseVouchers();
  const amt = Number(voucher.amount) || 0;
  const tax = Number(voucher.taxAmount) || 0;
  const total = amt + tax;
  const isOverThreshold = total > 50000;

  const id = voucher.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const voucherNumber = voucher.voucherNumber || `EXP/2026/${String(current.length + 1).padStart(4, '0')}`;
  const status = voucher.status || (isOverThreshold ? 'PENDING_APPROVAL' : 'APPROVED');

  let accountingVoucherNumber = voucher.accountingVoucherNumber;

  // If approved and not yet posted to GL, create GL Payment Voucher
  if (status === 'APPROVED' && !accountingVoucherNumber) {
    const glRecord = postDoubleEntryVoucher({
      voucherType: 'PAYMENT_VOUCHER',
      date: voucher.date || new Date().toISOString().substring(0, 10),
      narration: `Expense Settlement: ${voucher.categoryName} - ${voucher.vendorName || 'Direct Vendor'} (${voucher.notes || voucherNumber})`,
      totalAmount: total,
      branchName: 'Headquarters & Central Depot',
      createdByName: 'Expense Operations',
      items: [
        {
          id: 'exp_dr_' + Date.now(),
          ledgerId: 'led_admin_exp',
          ledgerName: voucher.categoryName || 'Administrative & General Expenses',
          ledgerCode: '4010',
          costCentreName: `${voucher.department || 'General'} Department`,
          debitAmount: total,
          creditAmount: 0,
        },
        {
          id: 'exp_cr_' + Date.now(),
          ledgerId: voucher.paymentMethod === 'CASH' ? 'led_cash' : 'led_bank_hdfc',
          ledgerName: voucher.paymentMethod === 'CASH' ? 'Central Depot Cash Chest' : 'HDFC Bank Corporate Current A/c',
          ledgerCode: voucher.paymentMethod === 'CASH' ? '1001' : '1002',
          debitAmount: 0,
          creditAmount: total,
        },
      ],
    });
    accountingVoucherNumber = glRecord.voucherNumber;
  }

  const finalVoucher: ExpenseVoucher = {
    id,
    voucherNumber,
    categoryName: voucher.categoryName || 'Administrative, Rent & Utilities',
    department: voucher.department || 'Administration',
    amount: amt,
    taxAmount: tax,
    totalAmount: total,
    paymentMethod: voucher.paymentMethod || 'BANK_TRANSFER',
    vendorName: voucher.vendorName,
    date: voucher.date || new Date().toISOString().substring(0, 10),
    notes: voucher.notes,
    status,
    accountingVoucherNumber,
    approvedBy: status === 'APPROVED' ? (voucher.approvedBy || 'Operations Lead') : undefined,
    approvedAt: status === 'APPROVED' ? (voucher.approvedAt || new Date().toISOString().substring(0, 10)) : undefined,
  };

  const existingIndex = current.findIndex((v) => v.id === id);
  let updatedList: ExpenseVoucher[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalVoucher;
  } else {
    updatedList = [finalVoucher, ...current];
  }

  setToStorage(STORAGE_KEYS.VOUCHERS, updatedList);
  syncBudgetWithExpenses();
  return { voucher: finalVoucher, glVoucherNumber: accountingVoucherNumber };
}

export function approveExpenseVoucher(id: string, approvedBy: string = 'Finance Manager'): ExpenseVoucher | null {
  const vouchers = getStoredExpenseVouchers();
  const index = vouchers.findIndex((v) => v.id === id);
  if (index < 0) return null;

  const voucher = vouchers[index];
  if (voucher.status === 'APPROVED') return voucher;

  const today = new Date().toISOString().substring(0, 10);
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'PAYMENT_VOUCHER',
    date: today,
    narration: `Expense Approval & Payment: ${voucher.categoryName} - ${voucher.vendorName || 'Vendor'} (${voucher.voucherNumber})`,
    totalAmount: voucher.totalAmount,
    branchName: 'Headquarters & Central Depot',
    createdByName: approvedBy,
    items: [
      {
        id: 'exp_dr_' + Date.now(),
        ledgerId: 'led_admin_exp',
        ledgerName: voucher.categoryName,
        ledgerCode: '4010',
        costCentreName: `${voucher.department} Department`,
        debitAmount: voucher.totalAmount,
        creditAmount: 0,
      },
      {
        id: 'exp_cr_' + Date.now(),
        ledgerId: voucher.paymentMethod === 'CASH' ? 'led_cash' : 'led_bank_hdfc',
        ledgerName: voucher.paymentMethod === 'CASH' ? 'Central Depot Cash Chest' : 'HDFC Bank Corporate Current A/c',
        ledgerCode: voucher.paymentMethod === 'CASH' ? '1001' : '1002',
        debitAmount: 0,
        creditAmount: voucher.totalAmount,
      },
    ],
  });

  const updated: ExpenseVoucher = {
    ...voucher,
    status: 'APPROVED',
    accountingVoucherNumber: glRecord.voucherNumber,
    approvedBy,
    approvedAt: today,
  };

  vouchers[index] = updated;
  setToStorage(STORAGE_KEYS.VOUCHERS, vouchers);
  syncBudgetWithExpenses();
  return updated;
}

export function deleteExpenseVoucher(id: string): void {
  const vouchers = getStoredExpenseVouchers().filter((v) => v.id !== id);
  setToStorage(STORAGE_KEYS.VOUCHERS, vouchers);
  syncBudgetWithExpenses();
}

// ==========================================
// FIXED ASSETS API
// ==========================================
export function getStoredFixedAssets(): FixedAsset[] {
  return getFromStorage<FixedAsset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
}

export function saveFixedAsset(asset: Partial<FixedAsset>): FixedAsset {
  const current = getStoredFixedAssets();
  const id = asset.id || 'ast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const assetCode = asset.assetCode || `AST/2026/${String(current.length + 1).padStart(4, '0')}`;
  const cost = Number(asset.purchaseValue) || 0;
  const salvage = Number(asset.salvageValue) || 0;
  const life = Number(asset.usefulLifeYears) || 5;
  const accDep = Number(asset.accumulatedDepreciation) || 0;
  const nbv = Math.max(0, cost - accDep);
  const method = asset.depreciationMethod || 'SLM';
  const defaultRate = method === 'SLM' ? (life > 0 ? (100 / life) : 10) : 25;

  const finalAsset: FixedAsset = {
    id,
    assetCode,
    assetName: asset.assetName || 'New Capital Equipment',
    category: asset.category || 'PLANT_AND_MACHINERY',
    purchaseDate: asset.purchaseDate || new Date().toISOString().substring(0, 10),
    purchaseValue: cost,
    salvageValue: salvage,
    usefulLifeYears: life,
    depreciationMethod: method,
    annualDepreciationRate: Number(asset.annualDepreciationRate) || defaultRate,
    accumulatedDepreciation: accDep,
    netBookValue: nbv,
    location: asset.location || 'Headquarters Central Depot',
    serialNumber: asset.serialNumber,
    status: asset.status || 'ACTIVE',
    lastDepreciationDate: asset.lastDepreciationDate,
    lastDepreciationAmount: asset.lastDepreciationAmount,
  };

  const existingIndex = current.findIndex((a) => a.id === id);
  let updatedList: FixedAsset[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalAsset;
  } else {
    updatedList = [...current, finalAsset];
  }

  setToStorage(STORAGE_KEYS.ASSETS, updatedList);
  return finalAsset;
}

export function runAssetDepreciation(assetId: string): { asset: FixedAsset; glVoucherNumber: string; depreciationAmount: number } | null {
  const assets = getStoredFixedAssets();
  const index = assets.findIndex((a) => a.id === assetId);
  if (index < 0) return null;

  const asset = assets[index];
  if (asset.netBookValue <= asset.salvageValue) {
    return null; // Already fully depreciated to salvage
  }

  let depAmount = 0;
  if (asset.depreciationMethod === 'SLM') {
    const depreciableBase = Math.max(0, asset.purchaseValue - asset.salvageValue);
    depAmount = Math.round(depreciableBase / (asset.usefulLifeYears || 10));
  } else {
    // WDV
    const rate = (asset.annualDepreciationRate || 25) / 100;
    depAmount = Math.round(asset.netBookValue * rate);
  }

  // Cap at remaining net book value above salvage
  const maxAllowable = Math.max(0, asset.netBookValue - asset.salvageValue);
  if (depAmount > maxAllowable) {
    depAmount = maxAllowable;
  }

  if (depAmount <= 0) return null;

  const today = new Date().toISOString().substring(0, 10);
  const newAccDep = asset.accumulatedDepreciation + depAmount;
  const newNbv = Math.max(0, asset.purchaseValue - newAccDep);

  // Post Journal Voucher to GL
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'JOURNAL',
    date: today,
    narration: `Depreciation Provision for ${asset.assetName} [${asset.assetCode}] (${asset.depreciationMethod} method)`,
    totalAmount: depAmount,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Fixed Assets Accountant',
    items: [
      {
        id: 'dep_dr_' + Date.now(),
        ledgerId: 'led_deprec_exp',
        ledgerName: 'Depreciation & Amortization Expenses',
        ledgerCode: '4040',
        costCentreName: 'Capital Asset Depreciations',
        debitAmount: depAmount,
        creditAmount: 0,
      },
      {
        id: 'dep_cr_' + Date.now(),
        ledgerId: 'led_acc_deprec',
        ledgerName: 'Accumulated Depreciation Provision',
        ledgerCode: '1199',
        debitAmount: 0,
        creditAmount: depAmount,
      },
    ],
  });

  const updatedAsset: FixedAsset = {
    ...asset,
    accumulatedDepreciation: newAccDep,
    netBookValue: newNbv,
    lastDepreciationDate: today,
    lastDepreciationAmount: depAmount,
    status: newNbv <= asset.salvageValue ? 'FULLY_DEPRECIATED' : 'ACTIVE',
  };

  assets[index] = updatedAsset;
  setToStorage(STORAGE_KEYS.ASSETS, assets);

  return { asset: updatedAsset, glVoucherNumber: glRecord.voucherNumber, depreciationAmount: depAmount };
}

export function deleteFixedAsset(id: string): void {
  const assets = getStoredFixedAssets().filter((a) => a.id !== id);
  setToStorage(STORAGE_KEYS.ASSETS, assets);
}

// ==========================================
// REIMBURSEMENTS API
// ==========================================
export function getStoredReimbursements(): ReimbursementClaim[] {
  return getFromStorage<ReimbursementClaim[]>(STORAGE_KEYS.REIMBURSEMENTS, INITIAL_CLAIMS);
}

export function saveReimbursementClaim(claim: Partial<ReimbursementClaim>): ReimbursementClaim {
  const current = getStoredReimbursements();
  const id = claim.id || 'clm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const claimNumber = claim.claimNumber || `CLM/2026/${String(current.length + 1).padStart(4, '0')}`;

  const finalClaim: ReimbursementClaim = {
    id,
    claimNumber,
    employeeName: claim.employeeName || 'Staff Member',
    department: claim.department || 'Editorial',
    purpose: claim.purpose || 'Official conveyance and client engagement',
    amount: Number(claim.amount) || 0,
    receiptAttached: claim.receiptAttached ?? true,
    claimDate: claim.claimDate || new Date().toISOString().substring(0, 10),
    status: claim.status || 'SUBMITTED',
    accountingVoucherNumber: claim.accountingVoucherNumber,
    paidDate: claim.paidDate,
    paymentMethod: claim.paymentMethod,
  };

  const existingIndex = current.findIndex((c) => c.id === id);
  let updatedList: ReimbursementClaim[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalClaim;
  } else {
    updatedList = [finalClaim, ...current];
  }

  setToStorage(STORAGE_KEYS.REIMBURSEMENTS, updatedList);
  return finalClaim;
}

export function approveReimbursementClaim(id: string): ReimbursementClaim | null {
  const claims = getStoredReimbursements();
  const index = claims.findIndex((c) => c.id === id);
  if (index < 0) return null;

  claims[index] = { ...claims[index], status: 'APPROVED' };
  setToStorage(STORAGE_KEYS.REIMBURSEMENTS, claims);
  return claims[index];
}

export function payReimbursementClaim(id: string, paymentMethod: string = 'BANK_TRANSFER'): { claim: ReimbursementClaim; glVoucherNumber: string } | null {
  const claims = getStoredReimbursements();
  const index = claims.findIndex((c) => c.id === id);
  if (index < 0) return null;

  const claim = claims[index];
  const today = new Date().toISOString().substring(0, 10);

  // Post Payment Voucher to GL
  const glRecord = postDoubleEntryVoucher({
    voucherType: 'PAYMENT_VOUCHER',
    date: today,
    narration: `Reimbursement Settlement to ${claim.employeeName} for ${claim.purpose} (${claim.claimNumber})`,
    totalAmount: claim.amount,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Cashier & Staff Accounts',
    items: [
      {
        id: 'clm_dr_' + Date.now(),
        ledgerId: 'led_staff_exp',
        ledgerName: 'Staff Travel, Boarding & Conveyance',
        ledgerCode: '4020',
        costCentreName: `${claim.department} Staff Claims`,
        debitAmount: claim.amount,
        creditAmount: 0,
      },
      {
        id: 'clm_cr_' + Date.now(),
        ledgerId: paymentMethod === 'CASH' ? 'led_cash' : 'led_bank_hdfc',
        ledgerName: paymentMethod === 'CASH' ? 'Central Depot Cash Chest' : 'HDFC Bank Corporate Current A/c',
        ledgerCode: paymentMethod === 'CASH' ? '1001' : '1002',
        debitAmount: 0,
        creditAmount: claim.amount,
      },
    ],
  });

  const updatedClaim: ReimbursementClaim = {
    ...claim,
    status: 'PAID',
    accountingVoucherNumber: glRecord.voucherNumber,
    paidDate: today,
    paymentMethod,
  };

  claims[index] = updatedClaim;
  setToStorage(STORAGE_KEYS.REIMBURSEMENTS, claims);
  syncBudgetWithExpenses();

  return { claim: updatedClaim, glVoucherNumber: glRecord.voucherNumber };
}

// ==========================================
// RECURRING EXPENSES API
// ==========================================
export function getStoredRecurringExpenses(): RecurringExpense[] {
  return getFromStorage<RecurringExpense[]>(STORAGE_KEYS.RECURRING, INITIAL_RECURRING);
}

export function saveRecurringExpense(item: Partial<RecurringExpense>): RecurringExpense {
  const current = getStoredRecurringExpenses();
  const id = item.id || 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const finalItem: RecurringExpense = {
    id,
    title: item.title || 'Scheduled Recurring Subscription',
    categoryName: item.categoryName || 'Administrative, Rent & Utilities',
    department: item.department || 'Administration',
    amount: Number(item.amount) || 0,
    frequency: item.frequency || 'MONTHLY',
    nextDueDate: item.nextDueDate || new Date().toISOString().substring(0, 10),
    vendorName: item.vendorName || 'Vendor Entity',
    paymentMethod: item.paymentMethod || 'BANK_TRANSFER',
    status: item.status || 'ACTIVE',
    autoGenerateVoucher: item.autoGenerateVoucher ?? true,
    lastGeneratedDate: item.lastGeneratedDate,
  };

  const existingIndex = current.findIndex((r) => r.id === id);
  let updatedList: RecurringExpense[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = finalItem;
  } else {
    updatedList = [...current, finalItem];
  }

  setToStorage(STORAGE_KEYS.RECURRING, updatedList);
  return finalItem;
}

export function processRecurringExpenses(): { generatedCount: number; vouchers: ExpenseVoucher[] } {
  const recurringList = getStoredRecurringExpenses().filter((r) => r.status === 'ACTIVE');
  const today = new Date().toISOString().substring(0, 10);
  const createdVouchers: ExpenseVoucher[] = [];

  recurringList.forEach((r) => {
    const { voucher } = saveExpenseVoucher({
      categoryName: r.categoryName,
      department: r.department,
      amount: r.amount,
      taxAmount: 0,
      paymentMethod: r.paymentMethod as any,
      vendorName: r.vendorName,
      date: today,
      notes: `Scheduled Recurring run: ${r.title} (${r.frequency})`,
      status: 'APPROVED',
    });
    createdVouchers.push(voucher);
  });

  return { generatedCount: createdVouchers.length, vouchers: createdVouchers };
}

export function toggleRecurringStatus(id: string): RecurringExpense | null {
  const list = getStoredRecurringExpenses();
  const index = list.findIndex((r) => r.id === id);
  if (index < 0) return null;

  list[index] = {
    ...list[index],
    status: list[index].status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
  };
  setToStorage(STORAGE_KEYS.RECURRING, list);
  return list[index];
}

// ==========================================
// BUDGET PLANS API
// ==========================================
export function getStoredBudgets(): BudgetPlan[] {
  return getFromStorage<BudgetPlan[]>(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);
}

export function syncBudgetWithExpenses(): void {
  const budgets = getStoredBudgets();
  const vouchers = getStoredExpenseVouchers().filter((v) => v.status === 'APPROVED' || v.status === 'PAID');
  const claims = getStoredReimbursements().filter((c) => c.status === 'PAID');

  const updatedBudgets = budgets.map((b) => {
    // Sum department vouchers + claims
    const deptVoucherSum = vouchers
      .filter((v) => v.department.toLowerCase() === b.department.toLowerCase())
      .reduce((sum, v) => sum + v.totalAmount, 0);

    const deptClaimSum = claims
      .filter((c) => c.department.toLowerCase() === b.department.toLowerCase())
      .reduce((sum, c) => sum + c.amount, 0);

    // Baseline minimum expense for FY to maintain realistic figures
    const baselineDeptMap: Record<string, number> = {
      production: 4500000,
      marketing: 1500000,
      editorial: 1000000,
      logistics: 1600000,
      administration: 800000,
    };
    const baseline = baselineDeptMap[b.department.toLowerCase()] || 500000;

    const actual = baseline + deptVoucherSum + deptClaimSum;
    const variance = actual - b.totalAllocatedExpense;
    const pct = b.totalAllocatedExpense > 0 ? (variance / b.totalAllocatedExpense) * 100 : 0;
    const status = actual <= b.totalAllocatedExpense ? 'FAVOURABLE' : 'ADVERSE';

    return {
      ...b,
      actualExpenseIncurred: actual,
      varianceAmount: variance,
      variancePercentage: Math.round(pct * 100) / 100,
      varianceStatus: status as 'FAVOURABLE' | 'ADVERSE',
    };
  });

  setToStorage(STORAGE_KEYS.BUDGETS, updatedBudgets);
}

// ==========================================
// KPIS & REPORT AGGREGATIONS
// ==========================================
export interface ExpenseKpis {
  approvedExpensesMtd: number;
  approvedVouchersCount: number;
  pendingApprovalsCount: number;
  grossAssetValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  totalAssetsCount: number;
  overallBudgetAllocated: number;
  overallBudgetIncurred: number;
  overallBudgetVariancePct: number;
  reimbursementsPendingCount: number;
}

export function computeExpenseKpis(): ExpenseKpis {
  const vouchers = getStoredExpenseVouchers();
  const assets = getStoredFixedAssets().filter((a) => a.status === 'ACTIVE' || a.status === 'FULLY_DEPRECIATED');
  const budgets = getStoredBudgets();
  const claims = getStoredReimbursements();

  const approvedVouchers = vouchers.filter((v) => v.status === 'APPROVED' || v.status === 'PAID');
  const approvedTotal = approvedVouchers.reduce((s, v) => s + v.totalAmount, 0);
  const pendingCount = vouchers.filter((v) => v.status === 'PENDING_APPROVAL').length;

  const grossAsset = assets.reduce((s, a) => s + a.purchaseValue, 0);
  const accDep = assets.reduce((s, a) => s + a.accumulatedDepreciation, 0);
  const nbv = assets.reduce((s, a) => s + a.netBookValue, 0);

  const totalAllocated = budgets.reduce((s, b) => s + b.totalAllocatedExpense, 0);
  const totalIncurred = budgets.reduce((s, b) => s + b.actualExpenseIncurred, 0);
  const varPct = totalAllocated > 0 ? ((totalIncurred - totalAllocated) / totalAllocated) * 100 : 0;

  const pendingClaims = claims.filter((c) => c.status === 'SUBMITTED').length;

  return {
    approvedExpensesMtd: approvedTotal,
    approvedVouchersCount: approvedVouchers.length,
    pendingApprovalsCount: pendingCount,
    grossAssetValue: grossAsset,
    accumulatedDepreciation: accDep,
    netBookValue: nbv,
    totalAssetsCount: assets.length,
    overallBudgetAllocated: totalAllocated,
    overallBudgetIncurred: totalIncurred,
    overallBudgetVariancePct: Math.round(varPct * 10) / 10,
    reimbursementsPendingCount: pendingClaims,
  };
}

export function computeCategoryBreakdown(): Array<{ name: string; amount: number; pct: number }> {
  const vouchers = getStoredExpenseVouchers().filter((v) => v.status === 'APPROVED' || v.status === 'PAID');
  const map: Record<string, number> = {
    'Direct Production & Printing': 4850000,
    'Marketing & Book Fairs': 1850000,
    'Freight & Logistics': 980000,
    'Editorial & Proofreading': 750000,
    'Administrative, Rent & Utilities': 540000,
  };

  vouchers.forEach((v) => {
    map[v.categoryName] = (map[v.categoryName] || 0) + v.totalAmount;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return Object.entries(map).map(([name, amount]) => ({
    name,
    amount,
    pct: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}

export function computeDepreciationSummary(): { slmAnnual: number; wdvAnnual: number; totalNbv: number } {
  const assets = getStoredFixedAssets().filter((a) => a.status === 'ACTIVE');
  let slmAnnual = 0;
  let wdvAnnual = 0;
  let totalNbv = 0;

  assets.forEach((a) => {
    totalNbv += a.netBookValue;
    if (a.depreciationMethod === 'SLM') {
      const depreciable = Math.max(0, a.purchaseValue - a.salvageValue);
      slmAnnual += Math.round(depreciable / (a.usefulLifeYears || 10));
    } else {
      const rate = (a.annualDepreciationRate || 25) / 100;
      wdvAnnual += Math.round(a.netBookValue * rate);
    }
  });

  return { slmAnnual, wdvAnnual, totalNbv };
}
