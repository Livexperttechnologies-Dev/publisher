import { CompanyItem, BranchItem, FiscalYearItem, AccountingSettings, CostCentreItem, ProfitCentreItem, PaymentTermItem } from './companies.types';
import { AppError } from '../../middleware/errorHandler';

// Seeded Companies Store
const companiesStore: Map<string, CompanyItem> = new Map();
const branchesStore: Map<string, BranchItem[]> = new Map();
const fiscalYearsStore: Map<string, FiscalYearItem[]> = new Map();

// Initialize Primary Publishing Entity
const defaultCompany: CompanyItem = {
  id: 'cmp_default_publisher',
  name: 'Apex Educational Publishers & Distributors Ltd.',
  code: 'AEPD',
  legalName: 'Apex Educational Publishers & Distributors Limited',
  businessType: 'BOOK_PUBLISHER',
  taxId: '07AAAAA0000A1Z5',
  pan: 'AAACA1234D',
  cin: 'U22110DL2010PLC123456',
  currency: 'INR',
  currencySymbol: '₹',
  decimalPrecision: 2,
  fiscalYearStart: 4,
  email: 'finance@apexpublishers.com',
  phone: '+91 11 4567 8900',
  website: 'https://www.apexpublishers.com',
  registeredAddress: 'Publishers Enclave, Daryaganj',
  billingAddress: 'Publishers Enclave, Daryaganj, New Delhi',
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  postalCode: '110002',
  logoUrl: '/kibo360-logo.png',
  invoicePrefix: 'AEPD',
  invoiceNumberingRule: {
    format: '{PREFIX}/{YEAR}/{NUM}',
    padding: 4,
    resetAnnually: true,
    nextNumber: 892,
  },
  bankDetails: {
    accountName: 'Apex Educational Publishers & Distributors Ltd',
    accountNumber: '50200012345678',
    bankName: 'HDFC Bank Ltd',
    ifscCode: 'HDFC0000123',
    branchName: 'Daryaganj Branch, New Delhi',
    swiftCode: 'HDFCINBB',
    upiId: 'apexpublishers@hdfcbank',
  },
  accountingSettings: {
    defaultSalesAccountId: 'led_sales_school',
    defaultSalesAccountName: 'Curriculum & School Textbook Sales (3010)',
    defaultPurchaseAccountId: 'led_exp_paper',
    defaultPurchaseAccountName: 'Paper & Reel Consumption (4020)',
    inventoryValuationMethod: 'FIFO',
    defaultReceivableAccountId: 'led_debtors',
    defaultReceivableAccountName: 'Trade Receivables / Sundry Debtors (1030)',
    defaultPayableAccountId: 'led_creditors',
    defaultPayableAccountName: 'Trade Payables / Sundry Creditors (2010)',
    defaultCashAccountId: 'led_cash',
    defaultCashAccountName: 'Main Godown Cash in Hand (1020)',
    defaultBankAccountId: 'led_bank_hdfc',
    defaultBankAccountName: 'HDFC Operational Account - A/C 9871 (1010)',
    roundOffAccountId: 'led_round_off',
    roundOffAccountName: 'Rounding Off Difference Account (4090)',
    discountAllowedAccountId: 'led_discount_allowed',
    discountAllowedAccountName: 'Trade Discount Allowed (4080)',
    discountReceivedAccountId: 'led_discount_received',
    discountReceivedAccountName: 'Purchase Cash Discount Received (3090)',
  },
  costCentres: [
    { id: 'cc_1', code: 'CC-EXH', name: 'New Delhi World Book Fair Exhibition', category: 'EXHIBITION', isActive: true },
    { id: 'cc_2', code: 'CC-OFFSET', name: 'Senior Math Offset Press Run', category: 'PRODUCTION', isActive: true },
    { id: 'cc_3', code: 'CC-EDIT', name: 'Curriculum Revision Editorial Commission', category: 'EDITORIAL', isActive: true },
  ],
  profitCentres: [
    { id: 'pc_1', code: 'PC-SCHOOL', name: 'School Curriculum & Textbooks Division', division: 'SCHOOL_CURRICULUM', isActive: true },
    { id: 'pc_2', code: 'PC-HIGHER', name: 'Higher Education Academic Press', division: 'HIGHER_EDUCATION', isActive: true },
    { id: 'pc_3', code: 'PC-TRADE', name: 'Trade & General Literature Imprints', division: 'TRADE_FICTION', isActive: true },
  ],
  paymentTerms: [
    { id: 'pt_1', name: 'Immediate / Cash Against Delivery', days: 0 },
    { id: 'pt_2', name: 'Net 15 Days', days: 15 },
    { id: 'pt_3', name: 'Net 30 Days (Institutional Default)', days: 30, isDefault: true },
    { id: 'pt_4', name: 'Net 45 Days (Trade Wholesale)', days: 45 },
    { id: 'pt_5', name: 'Net 60 Days (Consignment)', days: 60 },
  ],
  defaultCreditLimit: '500000.00',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

companiesStore.set(defaultCompany.id, defaultCompany);

// Initialize Branches for Default Company
const defaultBranches: BranchItem[] = [
  {
    id: 'brn_main_hq',
    companyId: defaultCompany.id,
    name: 'Headquarters & Central Depot',
    code: 'HQ-DELHI',
    isMain: true,
    registeredAddress: 'Publishers Enclave, Daryaganj, New Delhi',
    billingAddress: 'Publishers Enclave, Daryaganj, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    postalCode: '110002',
    phone: '+91 11 4567 8901',
    email: 'delhi.depot@apexpublishers.com',
    gstin: '07AAAAA0000A1Z5',
    branchManagerId: 'usr_enterprise_super_admin',
    branchManagerName: 'KIBO360 Principal Administrator',
    invoicePrefix: 'DEL-INV',
    interBranchTransfersEnabled: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brn_mumbai_zonal',
    companyId: defaultCompany.id,
    name: 'Western Zonal Depot (Bhiwandi)',
    code: 'BHW-MUM',
    isMain: false,
    registeredAddress: 'Warehouse Block B, Indian Corporation, Bhiwandi',
    billingAddress: 'Warehouse Block B, Indian Corporation, Bhiwandi, Thane, MH',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '421302',
    phone: '+91 22 2345 6789',
    email: 'mumbai.depot@apexpublishers.com',
    gstin: '27AAAAA0000A1Z2', // Maharashtra State GSTIN
    branchManagerId: 'usr_branch_mumbai_sales',
    branchManagerName: 'Rajesh K. Patil',
    invoicePrefix: 'MUM-INV',
    interBranchTransfersEnabled: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brn_blr_hub',
    companyId: defaultCompany.id,
    name: 'Southern Distribution Hub',
    code: 'STH-BLR',
    isMain: false,
    registeredAddress: 'Commercial Logistics Park, Peenya 2nd Stage',
    billingAddress: 'Commercial Logistics Park, Peenya 2nd Stage, Bengaluru, KA',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560058',
    phone: '+91 80 2839 0011',
    email: 'bangalore.depot@apexpublishers.com',
    gstin: '29AAAAA0000A1Z8', // Karnataka State GSTIN
    branchManagerName: 'N. Chandrasekharan',
    invoicePrefix: 'BLR-INV',
    interBranchTransfersEnabled: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

branchesStore.set(defaultCompany.id, defaultBranches);

// Initialize Fiscal Years for Default Company
const defaultFiscalYears: FiscalYearItem[] = [
  {
    id: 'fy_2026_2027',
    companyId: defaultCompany.id,
    name: 'FY 2026-2027',
    startDate: '2026-04-01T00:00:00.000Z',
    endDate: '2027-03-31T23:59:59.000Z',
    accountingStartDate: '2026-04-01T00:00:00.000Z',
    isClosed: false,
    isCurrent: true,
    lockedPeriods: [
      { month: 4, year: 2026, isLocked: true, lockedAt: '2026-05-10T00:00:00.000Z', lockedBy: 'Dr. Alok Verma, CA' },
      { month: 5, year: 2026, isLocked: true, lockedAt: '2026-06-10T00:00:00.000Z', lockedBy: 'Dr. Alok Verma, CA' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fy_2025_2026',
    companyId: defaultCompany.id,
    name: 'FY 2025-2026',
    startDate: '2025-04-01T00:00:00.000Z',
    endDate: '2026-03-31T23:59:59.000Z',
    accountingStartDate: '2025-04-01T00:00:00.000Z',
    isClosed: true, // Fully closed period - immutable
    isCurrent: false,
    lockedPeriods: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

fiscalYearsStore.set(defaultCompany.id, defaultFiscalYears);

export class CompaniesService {
  // 1. Company Operations
  async getAllCompanies(userCompanyId?: string, isSuperAdmin = false): Promise<CompanyItem[]> {
    const all = Array.from(companiesStore.values());
    if (isSuperAdmin) {
      return all;
    }
    return all.filter((c) => c.id === userCompanyId);
  }

  async getCompanyById(id: string): Promise<CompanyItem | null> {
    return companiesStore.get(id) || null;
  }

  async createCompany(data: any): Promise<CompanyItem> {
    const companyId = 'cmp_' + Date.now();
    const newCompany: CompanyItem = {
      id: companyId,
      name: data.name,
      code: data.code,
      legalName: data.legalName || data.name,
      businessType: data.businessType || 'BOOK_PUBLISHER',
      taxId: data.taxId,
      pan: data.pan,
      cin: data.cin || null,
      currency: data.currency || 'INR',
      currencySymbol: data.currencySymbol || '₹',
      decimalPrecision: data.decimalPrecision || 2,
      fiscalYearStart: 4,
      email: data.email,
      phone: data.phone,
      website: data.website || null,
      registeredAddress: data.registeredAddress,
      billingAddress: data.billingAddress,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      postalCode: data.postalCode,
      invoicePrefix: data.invoicePrefix || data.code,
      invoiceNumberingRule: {
        format: '{PREFIX}/{YEAR}/{NUM}',
        padding: 4,
        resetAnnually: true,
        nextNumber: 1,
      },
      bankDetails: data.bankDetails || {
        accountName: data.name,
        accountNumber: '0000000000',
        bankName: 'National Bank',
        ifscCode: 'NBIN000001',
        branchName: data.city,
      },
      accountingSettings: { ...defaultCompany.accountingSettings },
      costCentres: [],
      profitCentres: [],
      paymentTerms: [...defaultCompany.paymentTerms],
      defaultCreditLimit: String(data.defaultCreditLimit || '500000.00'),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    companiesStore.set(companyId, newCompany);

    // Auto-create Main Headquarters Branch
    const mainBranch: BranchItem = {
      id: 'brn_' + Date.now(),
      companyId,
      name: 'Main Headquarters',
      code: 'HQ-' + data.code,
      isMain: true,
      registeredAddress: data.registeredAddress,
      billingAddress: data.billingAddress,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      postalCode: data.postalCode,
      phone: data.phone,
      email: data.email,
      gstin: data.taxId,
      invoicePrefix: data.invoicePrefix || data.code,
      interBranchTransfersEnabled: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    branchesStore.set(companyId, [mainBranch]);

    // Auto-create Current Fiscal Year
    const currentYear = new Date().getFullYear();
    const currentFY: FiscalYearItem = {
      id: 'fy_' + Date.now(),
      companyId,
      name: `FY ${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-04-01T00:00:00.000Z`,
      endDate: `${currentYear + 1}-03-31T23:59:59.000Z`,
      accountingStartDate: `${currentYear}-04-01T00:00:00.000Z`,
      isClosed: false,
      isCurrent: true,
      lockedPeriods: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fiscalYearsStore.set(companyId, [currentFY]);

    return newCompany;
  }

  async updateCompany(id: string, data: any): Promise<CompanyItem> {
    const company = companiesStore.get(id);
    if (!company) throw new AppError('Company not found', 404);

    const updated = { ...company, ...data, updatedAt: new Date().toISOString() };
    companiesStore.set(id, updated);
    return updated;
  }

  // 2. Branch Operations
  async getBranchesByCompany(companyId: string): Promise<BranchItem[]> {
    return branchesStore.get(companyId) || [];
  }

  async createBranch(companyId: string, data: any): Promise<BranchItem> {
    const company = companiesStore.get(companyId);
    if (!company) throw new AppError('Company not found', 404);

    const existing = branchesStore.get(companyId) || [];
    if (existing.some((b) => b.code === data.code)) {
      throw new AppError(`Branch code '${data.code}' already exists in this company`, 400);
    }

    const newBranch: BranchItem = {
      id: 'brn_' + Date.now(),
      companyId,
      name: data.name,
      code: data.code,
      isMain: data.isMain || false,
      registeredAddress: data.registeredAddress,
      billingAddress: data.billingAddress,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      postalCode: data.postalCode,
      phone: data.phone,
      email: data.email,
      gstin: data.gstin,
      branchManagerName: data.branchManagerName || null,
      invoicePrefix: data.invoicePrefix || `${data.code}-INV`,
      interBranchTransfersEnabled: data.interBranchTransfersEnabled !== undefined ? data.interBranchTransfersEnabled : true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    branchesStore.set(companyId, [...existing, newBranch]);
    return newBranch;
  }

  // 3. Fiscal Year Operations & Period Locking
  async getFiscalYears(companyId: string): Promise<FiscalYearItem[]> {
    return fiscalYearsStore.get(companyId) || [];
  }

  async createFiscalYear(companyId: string, data: any): Promise<FiscalYearItem> {
    const existing = fiscalYearsStore.get(companyId) || [];
    if (existing.some((fy) => fy.name === data.name)) {
      throw new AppError(`Fiscal year '${data.name}' already exists`, 400);
    }

    const newFY: FiscalYearItem = {
      id: 'fy_' + Date.now(),
      companyId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      accountingStartDate: data.accountingStartDate || data.startDate,
      isClosed: false,
      isCurrent: data.isCurrent || false,
      lockedPeriods: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fiscalYearsStore.set(companyId, [...existing, newFY]);
    return newFY;
  }

  async togglePeriodLock(companyId: string, fyId: string, month: number, year: number, isLocked: boolean, lockedBy: string): Promise<FiscalYearItem> {
    const list = fiscalYearsStore.get(companyId) || [];
    const fyIndex = list.findIndex((f) => f.id === fyId);
    if (fyIndex === -1) throw new AppError('Fiscal year not found', 404);

    const fy = list[fyIndex];
    if (fy.isClosed) {
      throw new AppError('Cannot alter period lock in a closed financial year.', 400);
    }

    const lockedPeriods = fy.lockedPeriods || [];
    const pIndex = lockedPeriods.findIndex((p) => p.month === month && p.year === year);

    if (pIndex >= 0) {
      lockedPeriods[pIndex].isLocked = isLocked;
      lockedPeriods[pIndex].lockedAt = new Date().toISOString();
      lockedPeriods[pIndex].lockedBy = lockedBy;
    } else {
      lockedPeriods.push({
        month,
        year,
        isLocked,
        lockedAt: new Date().toISOString(),
        lockedBy,
      });
    }

    fy.lockedPeriods = lockedPeriods;
    list[fyIndex] = fy;
    fiscalYearsStore.set(companyId, list);
    return fy;
  }

  // 4. Accounting Defaults Mapping
  async updateAccountingSettings(companyId: string, settings: AccountingSettings): Promise<AccountingSettings> {
    const company = companiesStore.get(companyId);
    if (!company) throw new AppError('Company not found', 404);

    company.accountingSettings = { ...company.accountingSettings, ...settings };
    companiesStore.set(companyId, company);
    return company.accountingSettings;
  }

  // 5. Authorized Consolidated Reporting Summary
  async getConsolidatedSummary(companyId: string): Promise<any> {
    const company = companiesStore.get(companyId);
    if (!company) throw new AppError('Company not found', 404);

    const branches = branchesStore.get(companyId) || [];
    const fiscalYears = fiscalYearsStore.get(companyId) || [];
    const currentFY = fiscalYears.find((f) => f.isCurrent) || fiscalYears[0];

    return {
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
        taxId: company.taxId,
        currency: company.currency,
        currencySymbol: company.currencySymbol,
        decimalPrecision: company.decimalPrecision,
      },
      currentFiscalYear: currentFY?.name || 'FY 2026-2027',
      totalBranches: branches.length,
      branchesBreakdown: branches.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        state: b.state,
        gstin: b.gstin,
        manager: b.branchManagerName,
        isMain: b.isMain,
        allocatedTurnover: b.isMain ? '₹58,400,000.00' : b.code.includes('MUM') ? '₹14,800,000.00' : '₹6,300,000.00',
        activeStockUnits: b.isMain ? '98,400 Copies' : b.code.includes('MUM') ? '32,100 Copies' : '19,000 Copies',
      })),
      consolidatedRevenue: '₹79,500,000.00',
      consolidatedReceivables: '₹8,745,200.00',
      consolidatedStockValuation: '₹29,770,000.00',
    };
  }
}

export const companiesService = new CompaniesService();
