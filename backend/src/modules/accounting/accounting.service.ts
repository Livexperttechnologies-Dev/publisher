import {
  AccountGroupItem,
  AccountLedgerItem,
  JournalEntryDto,
  JournalEntryItemDto,
  LedgerStatement,
  LedgerTransactionEntry,
  TrialBalanceReport,
  TrialBalanceItem,
  ProfitLossReport,
  ProfitLossItem,
  BalanceSheetReport,
  BalanceSheetGroup,
  DayBookReport,
  CostCentreReport,
  AccountingQueryFilters,
  VoucherType,
} from './accounting.types';
import { AppError } from '../../middleware/errorHandler';

// In-Memory Storage for Multi-Tenant Accounting Engine
const accountGroupsStore = new Map<string, AccountGroupItem>();
const accountLedgersStore = new Map<string, AccountLedgerItem>();
const journalEntriesStore = new Map<string, JournalEntryDto>();

export class AccountingService {
  constructor() {
    this.seedChartOfAccountsAndVouchers();
  }

  // --------------------------------------------------------------------------
  // 1. SEED CHART OF ACCOUNTS & INITIAL VOUCHERS
  // --------------------------------------------------------------------------
  private seedChartOfAccountsAndVouchers() {
    const defaultCompanyId = 'cmp_default_publisher';

    // 1. Account Groups (Assets, Liabilities, Income, Expenses, Equity)
    const defaultGroups: AccountGroupItem[] = [
      // Assets
      { id: 'grp_curr_assets', companyId: defaultCompanyId, name: 'Current Assets', code: 'GRP-100', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_cash_bank', companyId: defaultCompanyId, parentGroupId: 'grp_curr_assets', name: 'Cash and Bank Balances', code: 'GRP-101', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_debtors', companyId: defaultCompanyId, parentGroupId: 'grp_curr_assets', name: 'Accounts Receivable (Trade Debtors)', code: 'GRP-102', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_inventory', companyId: defaultCompanyId, parentGroupId: 'grp_curr_assets', name: 'Inventories (Books & Paper)', code: 'GRP-103', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_gst_credit', companyId: defaultCompanyId, parentGroupId: 'grp_curr_assets', name: 'GST Input Tax Credit (CGST/SGST/IGST)', code: 'GRP-104', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_fixed_assets', companyId: defaultCompanyId, name: 'Fixed Assets (Plant & Equipment)', code: 'GRP-110', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_deposits_adv', companyId: defaultCompanyId, name: 'Loans & Advances (Author Advances)', code: 'GRP-120', classification: 'ASSET', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Liabilities
      { id: 'grp_curr_liab', companyId: defaultCompanyId, name: 'Current Liabilities', code: 'GRP-200', classification: 'LIABILITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_creditors', companyId: defaultCompanyId, parentGroupId: 'grp_curr_liab', name: 'Accounts Payable (Trade Creditors)', code: 'GRP-201', classification: 'LIABILITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_duties_taxes', companyId: defaultCompanyId, parentGroupId: 'grp_curr_liab', name: 'Duties & Taxes (GST & TDS)', code: 'GRP-202', classification: 'LIABILITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_loans', companyId: defaultCompanyId, name: 'Bank Borrowings & Term Loans', code: 'GRP-210', classification: 'LIABILITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_provisions', companyId: defaultCompanyId, name: 'Provisions & Outstanding Expenses', code: 'GRP-220', classification: 'LIABILITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Income / Revenue
      { id: 'grp_direct_income', companyId: defaultCompanyId, name: 'Book Sales & Publishing Revenue', code: 'GRP-300', classification: 'REVENUE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_other_income', companyId: defaultCompanyId, name: 'Other Operating Income & Licensing', code: 'GRP-310', classification: 'REVENUE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Expenses
      { id: 'grp_direct_exp', companyId: defaultCompanyId, name: 'Direct Production & Printing Expenses', code: 'GRP-400', classification: 'EXPENSE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_royalties', companyId: defaultCompanyId, name: 'Author Royalty Expenses', code: 'GRP-410', classification: 'EXPENSE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_admin_exp', companyId: defaultCompanyId, name: 'Administrative, Rent & Staff Costs', code: 'GRP-420', classification: 'EXPENSE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'grp_selling_exp', companyId: defaultCompanyId, name: 'Freight, Logistics & Packaging', code: 'GRP-430', classification: 'EXPENSE', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Equity
      { id: 'grp_equity', companyId: defaultCompanyId, name: 'Shareholders Equity & Capital', code: 'GRP-500', classification: 'EQUITY', isSystemGroup: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    defaultGroups.forEach((g) => accountGroupsStore.set(g.id, g));

    // 2. Account Ledgers
    const defaultLedgers: AccountLedgerItem[] = [
      // Assets
      {
        id: 'led_cash',
        companyId: defaultCompanyId,
        groupId: 'grp_cash_bank',
        groupName: 'Cash and Bank Balances',
        name: 'Cash in Hand (Central Cashier)',
        code: '1001',
        classification: 'ASSET',
        openingBalance: 500000.0,
        currentBalance: 300000.0,
        isDebitBalance: true,
        isBankOrCash: true,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_bank_hdfc',
        companyId: defaultCompanyId,
        groupId: 'grp_cash_bank',
        groupName: 'Cash and Bank Balances',
        name: 'HDFC Bank Corporate Current A/c',
        code: '1002',
        classification: 'ASSET',
        openingBalance: 3500000.0,
        currentBalance: 3350000.0,
        isDebitBalance: true,
        isBankOrCash: true,
        bankAccountNumber: '918010045678912',
        bankName: 'HDFC Bank Ltd.',
        ifscCode: 'HDFC0000123',
        isReconciliationRequired: true,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_bank_sbi',
        companyId: defaultCompanyId,
        groupId: 'grp_cash_bank',
        groupName: 'Cash and Bank Balances',
        name: 'State Bank of India Operative A/c',
        code: '1003',
        classification: 'ASSET',
        openingBalance: 1200000.0,
        currentBalance: 1790000.0,
        isDebitBalance: true,
        isBankOrCash: true,
        bankAccountNumber: '10892345098',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001161',
        isReconciliationRequired: true,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_debtors',
        companyId: defaultCompanyId,
        groupId: 'grp_debtors',
        groupName: 'Accounts Receivable (Trade Debtors)',
        name: 'Trade Debtors - Wholesale & Retail Distributors',
        code: '1010',
        classification: 'ASSET',
        openingBalance: 2500000.0,
        currentBalance: 2500000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_inv_books',
        companyId: defaultCompanyId,
        groupId: 'grp_inventory',
        groupName: 'Inventories (Books & Paper)',
        name: 'Inventory of Finished Bound Books',
        code: '1020',
        classification: 'ASSET',
        openingBalance: 4800000.0,
        currentBalance: 4800000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_inv_paper',
        companyId: defaultCompanyId,
        groupId: 'grp_inventory',
        groupName: 'Inventories (Books & Paper)',
        name: 'Raw Paper Reels & Maplitho Inventory',
        code: '1021',
        classification: 'ASSET',
        openingBalance: 1800000.0,
        currentBalance: 1800000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_input_cgst',
        companyId: defaultCompanyId,
        groupId: 'grp_gst_credit',
        groupName: 'GST Input Tax Credit (CGST/SGST/IGST)',
        name: 'Input CGST Tax Credit A/c',
        code: '1041',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_input_sgst',
        companyId: defaultCompanyId,
        groupId: 'grp_gst_credit',
        groupName: 'GST Input Tax Credit (CGST/SGST/IGST)',
        name: 'Input SGST Tax Credit A/c',
        code: '1042',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_input_igst',
        companyId: defaultCompanyId,
        groupId: 'grp_gst_credit',
        groupName: 'GST Input Tax Credit (CGST/SGST/IGST)',
        name: 'Input IGST Tax Credit A/c',
        code: '1043',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_author_advances',
        companyId: defaultCompanyId,
        groupId: 'grp_deposits_adv',
        groupName: 'Loans & Advances (Author Advances)',
        name: 'Unadjusted Advances to Authors',
        code: '1050',
        classification: 'ASSET',
        openingBalance: 450000.0,
        currentBalance: 360000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Liabilities
      {
        id: 'led_creditors',
        companyId: defaultCompanyId,
        groupId: 'grp_creditors',
        groupName: 'Accounts Payable (Trade Creditors)',
        name: 'Trade Creditors - Paper Mills & Printers',
        code: '2001',
        classification: 'LIABILITY',
        openingBalance: 2200000.0,
        currentBalance: 2200000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_gst_payable',
        companyId: defaultCompanyId,
        groupId: 'grp_duties_taxes',
        groupName: 'Duties & Taxes (GST & TDS)',
        name: 'GST Payable Account (Output GST)',
        code: '2010',
        classification: 'LIABILITY',
        openingBalance: 180000.0,
        currentBalance: 180000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_tds_payable',
        companyId: defaultCompanyId,
        groupId: 'grp_duties_taxes',
        groupName: 'Duties & Taxes (GST & TDS)',
        name: 'TDS Payable (Sec 194J on Royalties & Professional)',
        code: '2020',
        classification: 'LIABILITY',
        openingBalance: 45000.0,
        currentBalance: 55000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_bank_loan',
        companyId: defaultCompanyId,
        groupId: 'grp_loans',
        groupName: 'Bank Borrowings & Term Loans',
        name: 'Working Capital Term Loan - HDFC Bank',
        code: '2030',
        classification: 'LIABILITY',
        openingBalance: 2000000.0,
        currentBalance: 2000000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Income / Revenue
      {
        id: 'led_book_sales',
        companyId: defaultCompanyId,
        groupId: 'grp_direct_income',
        groupName: 'Book Sales & Publishing Revenue',
        name: 'Book Sales - Academic & School Textbooks',
        code: '3001',
        classification: 'REVENUE',
        openingBalance: 0.0,
        currentBalance: 590000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_licensing_income',
        companyId: defaultCompanyId,
        groupId: 'grp_other_income',
        groupName: 'Other Operating Income & Licensing',
        name: 'Publishing Rights & Content Licensing Income',
        code: '3010',
        classification: 'REVENUE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Expenses
      {
        id: 'led_paper_purchase',
        companyId: defaultCompanyId,
        groupId: 'grp_direct_exp',
        groupName: 'Direct Production & Printing Expenses',
        name: 'Paper Reel & Printing Materials Purchase',
        code: '4001',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 350000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_purchase_return',
        companyId: defaultCompanyId,
        groupId: 'grp_direct_exp',
        groupName: 'Direct Production & Printing Expenses',
        name: 'Purchase Returns & Allowances Outward',
        code: '4010',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_royalty_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_royalties',
        groupName: 'Author Royalty Expenses',
        name: 'Author Royalty Expenses',
        code: '4050',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 100000.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Equity
      {
        id: 'led_share_capital',
        companyId: defaultCompanyId,
        groupId: 'grp_equity',
        groupName: 'Shareholders Equity & Capital',
        name: 'Paid-up Equity Share Capital',
        code: '5001',
        classification: 'EQUITY',
        openingBalance: 10325000.0,
        currentBalance: 10325000.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Phase 14: Fixed Assets Ledgers
      {
        id: 'led_plant_machinery',
        companyId: defaultCompanyId,
        groupId: 'grp_fixed_assets',
        groupName: 'Fixed Assets (Plant & Equipment)',
        name: 'Plant & Printing Machinery',
        code: '1101',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_office_equip',
        companyId: defaultCompanyId,
        groupId: 'grp_fixed_assets',
        groupName: 'Fixed Assets (Plant & Equipment)',
        name: 'Office Equipment & Computers',
        code: '1102',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_furniture',
        companyId: defaultCompanyId,
        groupId: 'grp_fixed_assets',
        groupName: 'Fixed Assets (Plant & Equipment)',
        name: 'Furniture & Warehouse Fixtures',
        code: '1103',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_accum_depreciation',
        companyId: defaultCompanyId,
        groupId: 'grp_fixed_assets',
        groupName: 'Fixed Assets (Plant & Equipment)',
        name: 'Accumulated Depreciation Provision',
        code: '1199',
        classification: 'ASSET',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Phase 14: Operating & Departmental Expense Ledgers
      {
        id: 'led_admin_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_admin_exp',
        groupName: 'Administrative, Rent & Staff Costs',
        name: 'Administrative & General Expenses',
        code: '4020',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_rent_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_admin_exp',
        groupName: 'Administrative, Rent & Staff Costs',
        name: 'Office & Warehouse Rent',
        code: '4021',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_utilities_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_admin_exp',
        groupName: 'Administrative, Rent & Staff Costs',
        name: 'Utilities, Electricity & Cloud Hosting',
        code: '4022',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_editorial_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_direct_exp',
        groupName: 'Direct Production & Printing Expenses',
        name: 'Editorial, Proofreading & DTP Charges',
        code: '4005',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_logistics_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_selling_exp',
        groupName: 'Freight, Logistics & Packaging',
        name: 'Freight, Courier & Distribution Logistics',
        code: '4031',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_marketing_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_selling_exp',
        groupName: 'Freight, Logistics & Packaging',
        name: 'Marketing, Book Fairs & Promotions',
        code: '4032',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_depreciation_exp',
        companyId: defaultCompanyId,
        groupId: 'grp_admin_exp',
        groupName: 'Administrative, Rent & Staff Costs',
        name: 'Depreciation & Amortization Expense',
        code: '4040',
        classification: 'EXPENSE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: true,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_gain_loss_disposal',
        companyId: defaultCompanyId,
        groupId: 'grp_other_income',
        groupName: 'Other Operating Income & Licensing',
        name: 'Gain / Loss on Fixed Asset Disposal',
        code: '3015',
        classification: 'REVENUE',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'led_employee_payable',
        companyId: defaultCompanyId,
        groupId: 'grp_curr_liab',
        groupName: 'Current Liabilities',
        name: 'Employee Reimbursements & Claims Payable',
        code: '2025',
        classification: 'LIABILITY',
        openingBalance: 0.0,
        currentBalance: 0.0,
        isDebitBalance: false,
        isBankOrCash: false,
        isReconciliationRequired: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultLedgers.forEach((l) => accountLedgersStore.set(l.id, l));

    // 3. Initial Seed Journal Entries
    const nowIso = new Date().toISOString();
    const defaultVouchers: JournalEntryDto[] = [
      // 1. Contra: Cash deposited into HDFC Bank (₹200,000)
      {
        id: 'vch_contra_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'CV/2026/0001',
        voucherType: 'CONTRA_VOUCHER',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'Cash deposit from central depot cash chest into HDFC Bank Corporate A/c',
        status: 'POSTED',
        totalAmount: 200000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank Corporate Current A/c', ledgerCode: '1002', debitAmount: 200000.0, creditAmount: 0.0 },
          { ledgerId: 'led_cash', ledgerName: 'Cash in Hand (Central Cashier)', ledgerCode: '1001', debitAmount: 0.0, creditAmount: 200000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      // 2. Sales: Wholesale sales of mathematics textbooks to National Book Distributors (₹590,000)
      {
        id: 'vch_sales_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'SV/2026/0001',
        voucherType: 'SALES_INVOICE',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'Wholesale sales of Class 12 Mathematics Complete Sets against Dispatch #DISP-9921',
        status: 'POSTED',
        totalAmount: 590000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_debtors', ledgerName: 'Trade Debtors - Wholesale & Retail Distributors', ledgerCode: '1010', debitAmount: 590000.0, creditAmount: 0.0 },
          { ledgerId: 'led_book_sales', ledgerName: 'Book Sales - Academic & School Textbooks', ledgerCode: '3001', debitAmount: 0.0, creditAmount: 590000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      // 3. Purchase: Paper Purchase from Ballarpur Paper Mills (₹350,000)
      {
        id: 'vch_purch_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'PB/2026/0001',
        voucherType: 'PURCHASE_BILL',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'Purchase of 70 GSM Super Maplitho Cream Paper Reels (Bill #BILT/INV/4412)',
        status: 'POSTED',
        totalAmount: 350000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_paper_purchase', ledgerName: 'Paper Reel & Printing Materials Purchase', ledgerCode: '4001', debitAmount: 350000.0, creditAmount: 0.0 },
          { ledgerId: 'led_creditors', ledgerName: 'Trade Creditors - Paper Mills & Printers', ledgerCode: '2001', debitAmount: 0.0, creditAmount: 350000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      // 4. Payment: Payment to Ballarpur Paper Mills via HDFC Bank (₹350,000)
      {
        id: 'vch_pay_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'PV/2026/0001',
        voucherType: 'PAYMENT_VOUCHER',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'NEFT settlement to Ballarpur Paper Mills against Bill #BILT/INV/4412',
        status: 'POSTED',
        totalAmount: 350000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_creditors', ledgerName: 'Trade Creditors - Paper Mills & Printers', ledgerCode: '2001', debitAmount: 350000.0, creditAmount: 0.0 },
          { ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank Corporate Current A/c', ledgerCode: '1002', debitAmount: 0.0, creditAmount: 350000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      // 5. Receipt: Customer payment received in SBI Bank (₹590,000)
      {
        id: 'vch_rec_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'RV/2026/0001',
        voucherType: 'RECEIPT_VOUCHER',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'RTGS clearance from National Book Distributors against Inv #SV/2026/0001',
        status: 'POSTED',
        totalAmount: 590000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_bank_sbi', ledgerName: 'State Bank of India Operative A/c', ledgerCode: '1003', debitAmount: 590000.0, creditAmount: 0.0 },
          { ledgerId: 'led_debtors', ledgerName: 'Trade Debtors - Wholesale & Retail Distributors', ledgerCode: '1010', debitAmount: 0.0, creditAmount: 590000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      // 6. Journal: Author Royalty Accrual for Dr. R. D. Sharma (₹100,000, TDS ₹10,000, Advance offset ₹90,000)
      {
        id: 'vch_jv_01',
        companyId: defaultCompanyId,
        branchId: 'brn_main_hq',
        branchName: 'Headquarters & Central Depot',
        fiscalYearId: 'fy_current_2026_2027',
        voucherNumber: 'JV/2026/0001',
        voucherType: 'ROYALTY_ACCRUAL',
        entryDate: nowIso,
        postingDate: nowIso,
        narration: 'Q1 Author Royalty Accrual for Dr. R. D. Sharma net of 10% TDS and Advance offset',
        status: 'POSTED',
        totalAmount: 100000.0,
        isReversal: false,
        createdById: 'usr_super_admin',
        items: [
          { ledgerId: 'led_royalty_exp', ledgerName: 'Author Royalty Expenses', ledgerCode: '4050', costCentreName: 'Author Contracts & Editorial', debitAmount: 100000.0, creditAmount: 0.0 },
          { ledgerId: 'led_tds_payable', ledgerName: 'TDS Payable (Sec 194J on Royalties & Professional)', ledgerCode: '2020', debitAmount: 0.0, creditAmount: 10000.0 },
          { ledgerId: 'led_author_advances', ledgerName: 'Unadjusted Advances to Authors', ledgerCode: '1050', debitAmount: 0.0, creditAmount: 90000.0 },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];

    defaultVouchers.forEach((v) => journalEntriesStore.set(v.id, v));
  }

  // --------------------------------------------------------------------------
  // 2. CHART OF ACCOUNTS (GROUPS & LEDGERS)
  // --------------------------------------------------------------------------
  async getGroups(companyId?: string): Promise<AccountGroupItem[]> {
    let list = Array.from(accountGroupsStore.values());
    if (companyId) list = list.filter((g) => g.companyId === companyId);
    return list;
  }

  async getLedgers(filters?: AccountingQueryFilters): Promise<{ items: AccountLedgerItem[]; total: number }> {
    let list = Array.from(accountLedgersStore.values()).filter((l) => !l.isDeleted);

    if (filters?.companyId) {
      list = list.filter((l) => l.companyId === filters.companyId);
    }
    if (filters?.groupId) {
      list = list.filter((l) => l.groupId === filters.groupId);
    }
    if (filters?.classification) {
      list = list.filter((l) => l.classification === filters.classification);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.groupName.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  async getLedgerById(id: string): Promise<AccountLedgerItem | null> {
    const ledger = accountLedgersStore.get(id);
    if (!ledger || ledger.isDeleted) return null;
    return ledger;
  }

  async createLedger(data: Partial<AccountLedgerItem>, companyId: string = 'cmp_default_publisher'): Promise<AccountLedgerItem> {
    const existing = Array.from(accountLedgersStore.values()).find(
      (l) => !l.isDeleted && l.companyId === companyId && l.code.toLowerCase() === (data.code || '').toLowerCase()
    );
    if (existing) {
      throw new AppError(`An account ledger with code '${data.code}' already exists.`, 409);
    }

    const group = accountGroupsStore.get(data.groupId || '');
    if (!group) {
      throw new AppError(`Account Group '${data.groupId}' does not exist.`, 400);
    }

    const id = 'led_' + Date.now();
    const newLedger: AccountLedgerItem = {
      id,
      companyId,
      groupId: group.id,
      groupName: group.name,
      name: data.name!,
      code: data.code!,
      classification: group.classification,
      openingBalance: data.openingBalance || 0.0,
      currentBalance: data.openingBalance || 0.0,
      isDebitBalance: data.isDebitBalance !== undefined ? data.isDebitBalance : (group.classification === 'ASSET' || group.classification === 'EXPENSE'),
      isBankOrCash: data.isBankOrCash || false,
      bankAccountNumber: data.bankAccountNumber,
      bankName: data.bankName,
      ifscCode: data.ifscCode,
      taxRegistration: data.taxRegistration,
      isReconciliationRequired: data.isReconciliationRequired || false,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accountLedgersStore.set(id, newLedger);
    return newLedger;
  }

  // --------------------------------------------------------------------------
  // 3. VOUCHER CREATION & DOUBLE-ENTRY POSTING ENGINE
  // --------------------------------------------------------------------------
  async createVoucher(
    data: {
      fiscalYearId?: string;
      branchId?: string;
      branchName?: string;
      voucherType: VoucherType;
      entryDate?: string;
      narration: string;
      sourceRefId?: string;
      items: JournalEntryItemDto[];
    },
    companyId: string = 'cmp_default_publisher',
    userId: string = 'usr_system'
  ): Promise<JournalEntryDto> {
    // 1. Double-Entry Balancing Verification
    const totalDebit = Number(data.items.reduce((sum, item) => sum + (Number(item.debitAmount) || 0), 0).toFixed(2));
    const totalCredit = Number(data.items.reduce((sum, item) => sum + (Number(item.creditAmount) || 0), 0).toFixed(2));

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new AppError(
        `Double-entry imbalance: Total Debit (₹${totalDebit.toFixed(2)}) must equal Total Credit (₹${totalCredit.toFixed(2)}). Difference: ₹${(totalDebit - totalCredit).toFixed(2)}`,
        422
      );
    }

    if (totalDebit <= 0) {
      throw new AppError('Voucher total amount must be greater than zero.', 422);
    }

    // 2. Closed-Period Checking
    const entryDate = data.entryDate ? new Date(data.entryDate) : new Date();
    const month = String(entryDate.getMonth() + 1).padStart(2, '0');
    const year = entryDate.getFullYear();
    const periodKey = `${month}/${year}`;

    // Verify against locked periods (simulating period lock for 04/2027)
    if (periodKey === '04/2027') {
      throw new AppError(
        `Posting rejected: Accounting period ${periodKey} is locked against back-dated financial entries. Contact your company administrator to request an authorization unlock.`,
        423
      );
    }

    // 3. Sequential Voucher Number Generation
    const prefixMap: Record<VoucherType, string> = {
      JOURNAL: 'JV',
      PAYMENT_VOUCHER: 'PV',
      RECEIPT_VOUCHER: 'RV',
      CONTRA_VOUCHER: 'CV',
      DEBIT_NOTE: 'DN',
      CREDIT_NOTE: 'CN',
      SALES_INVOICE: 'SV',
      PURCHASE_BILL: 'PB',
      ROYALTY_ACCRUAL: 'RA',
    };
    const prefix = prefixMap[data.voucherType] || 'VCH';
    const existingCount = Array.from(journalEntriesStore.values()).filter((v) => v.voucherType === data.voucherType).length + 1;
    const voucherNumber = `${prefix}/${year}/${String(existingCount).padStart(4, '0')}`;

    // 4. Enrich Line Items with Ledger Names & Codes
    const enrichedItems: JournalEntryItemDto[] = [];
    for (const item of data.items) {
      const ledger = accountLedgersStore.get(item.ledgerId);
      if (!ledger || ledger.isDeleted) {
        throw new AppError(`Ledger ID '${item.ledgerId}' not found in Chart of Accounts.`, 400);
      }
      enrichedItems.push({
        id: 'itm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ledgerId: ledger.id,
        ledgerName: ledger.name,
        ledgerCode: ledger.code,
        costCentreId: item.costCentreId,
        costCentreName: item.costCentreName,
        branchId: item.branchId || data.branchId,
        debitAmount: Number(item.debitAmount) || 0,
        creditAmount: Number(item.creditAmount) || 0,
        description: item.description,
      });
    }

    // 5. Atomic Ledger Balances Update
    for (const item of enrichedItems) {
      const ledger = accountLedgersStore.get(item.ledgerId)!;
      if (ledger.isDebitBalance) {
        // Debit normal accounts: Assets, Expenses
        ledger.currentBalance = Number((ledger.currentBalance + item.debitAmount - item.creditAmount).toFixed(2));
      } else {
        // Credit normal accounts: Liabilities, Income, Equity
        ledger.currentBalance = Number((ledger.currentBalance + item.creditAmount - item.debitAmount).toFixed(2));
      }
      ledger.updatedAt = new Date().toISOString();
      accountLedgersStore.set(ledger.id, ledger);
    }

    // 6. Create Posted Journal Entry
    const id = 'vch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newVoucher: JournalEntryDto = {
      id,
      companyId,
      branchId: data.branchId || 'brn_main_hq',
      branchName: data.branchName || 'Headquarters & Central Depot',
      fiscalYearId: data.fiscalYearId || `fy_${year}_${year + 1}`,
      voucherNumber,
      voucherType: data.voucherType,
      entryDate: entryDate.toISOString(),
      postingDate: new Date().toISOString(),
      narration: data.narration,
      status: 'POSTED',
      totalAmount: totalDebit,
      isReversal: false,
      sourceRefId: data.sourceRefId,
      createdById: userId,
      items: enrichedItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore.set(id, newVoucher);
    return newVoucher;
  }

  // --------------------------------------------------------------------------
  // 4. IMMUTABLE VOUCHER REVERSAL ENGINE
  // --------------------------------------------------------------------------
  async reverseVoucher(voucherId: string, reason: string, userId: string = 'usr_system'): Promise<{
    originalVoucher: JournalEntryDto;
    reversalVoucher: JournalEntryDto;
  }> {
    const original = journalEntriesStore.get(voucherId);
    if (!original) {
      throw new AppError('Voucher record not found.', 404);
    }

    if (original.status === 'REVERSED') {
      throw new AppError(`Voucher ${original.voucherNumber} has already been reversed.`, 400);
    }

    if (original.status !== 'POSTED') {
      throw new AppError(`Only POSTED vouchers can be reversed. Current status: ${original.status}`, 400);
    }

    // 1. Mark original as REVERSED
    original.status = 'REVERSED';
    original.updatedAt = new Date().toISOString();
    journalEntriesStore.set(original.id, original);

    // 2. Create Inverse Items (Debit becomes Credit, Credit becomes Debit)
    const inverseItems: JournalEntryItemDto[] = original.items.map((item) => ({
      ledgerId: item.ledgerId,
      ledgerName: item.ledgerName,
      ledgerCode: item.ledgerCode,
      costCentreId: item.costCentreId,
      costCentreName: item.costCentreName,
      branchId: item.branchId,
      debitAmount: item.creditAmount, // Inverted!
      creditAmount: item.debitAmount, // Inverted!
      description: `Reversal of ${original.voucherNumber}: ${item.description || ''}`,
    }));

    // 3. Atomically Rollback Ledger Balances
    for (const item of inverseItems) {
      const ledger = accountLedgersStore.get(item.ledgerId);
      if (ledger) {
        if (ledger.isDebitBalance) {
          ledger.currentBalance = Number((ledger.currentBalance + item.debitAmount - item.creditAmount).toFixed(2));
        } else {
          ledger.currentBalance = Number((ledger.currentBalance + item.creditAmount - item.debitAmount).toFixed(2));
        }
        ledger.updatedAt = new Date().toISOString();
        accountLedgersStore.set(ledger.id, ledger);
      }
    }

    // 4. Generate Reversal Voucher Record
    const year = new Date().getFullYear();
    const revCount = Array.from(journalEntriesStore.values()).length + 1;
    const reversalVoucherNumber = `REV/${year}/${String(revCount).padStart(4, '0')}`;

    const reversalId = 'vch_rev_' + Date.now();
    const reversalVoucher: JournalEntryDto = {
      id: reversalId,
      companyId: original.companyId,
      branchId: original.branchId,
      branchName: original.branchName,
      fiscalYearId: original.fiscalYearId,
      voucherNumber: reversalVoucherNumber,
      voucherType: original.voucherType,
      entryDate: new Date().toISOString(),
      postingDate: new Date().toISOString(),
      narration: `REVERSAL of ${original.voucherNumber} - Reason: ${reason}`,
      status: 'POSTED',
      totalAmount: original.totalAmount,
      isReversal: true,
      reversedFromId: original.id,
      createdById: userId,
      items: inverseItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore.set(reversalId, reversalVoucher);

    return {
      originalVoucher: original,
      reversalVoucher,
    };
  }

  // --------------------------------------------------------------------------
  // 5. GENERAL LEDGER ACCOUNT STATEMENT
  // --------------------------------------------------------------------------
  async getLedgerStatement(ledgerId: string, fromDate?: string, toDate?: string): Promise<LedgerStatement> {
    const ledger = accountLedgersStore.get(ledgerId);
    if (!ledger || ledger.isDeleted) {
      throw new AppError('Ledger not found.', 404);
    }

    const entries: LedgerTransactionEntry[] = [];
    let runningBalance = ledger.openingBalance;
    let totalDebit = 0.0;
    let totalCredit = 0.0;

    // Filter relevant vouchers containing this ledger
    const sortedVouchers = Array.from(journalEntriesStore.values())
      .filter((v) => v.status === 'POSTED')
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    for (const voucher of sortedVouchers) {
      if (fromDate && new Date(voucher.entryDate) < new Date(fromDate)) continue;
      if (toDate && new Date(voucher.entryDate) > new Date(toDate)) continue;

      const item = voucher.items.find((i) => i.ledgerId === ledger.id);
      if (item) {
        const debit = item.debitAmount;
        const credit = item.creditAmount;
        totalDebit += debit;
        totalCredit += credit;

        if (ledger.isDebitBalance) {
          runningBalance = Number((runningBalance + debit - credit).toFixed(2));
        } else {
          runningBalance = Number((runningBalance + credit - debit).toFixed(2));
        }

        // Find opposing ledger name for narration
        const opposing = voucher.items.find((i) => i.ledgerId !== ledger.id);

        entries.push({
          id: item.id || voucher.id,
          voucherId: voucher.id,
          date: voucher.entryDate,
          voucherNumber: voucher.voucherNumber,
          voucherType: voucher.voucherType,
          narration: voucher.narration,
          opposingLedgerName: opposing?.ledgerName,
          costCentreName: item.costCentreName,
          debit,
          credit,
          runningBalance: Math.abs(runningBalance),
          isDebit: runningBalance >= 0 ? ledger.isDebitBalance : !ledger.isDebitBalance,
        });
      }
    }

    return {
      ledger,
      fromDate,
      toDate,
      openingBalance: ledger.openingBalance,
      isOpeningDebit: ledger.isDebitBalance,
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
      closingBalance: Math.abs(runningBalance),
      isClosingDebit: runningBalance >= 0 ? ledger.isDebitBalance : !ledger.isDebitBalance,
      entries,
    };
  }

  // --------------------------------------------------------------------------
  // 6. FINANCIAL STATEMENTS & AUDIT REPORTS
  // --------------------------------------------------------------------------

  // A. TRIAL BALANCE
  async getTrialBalance(asOfDate?: string): Promise<TrialBalanceReport> {
    const items: TrialBalanceItem[] = [];
    let grandTotalDebit = 0.0;
    let grandTotalCredit = 0.0;

    for (const ledger of accountLedgersStore.values()) {
      if (ledger.isDeleted) continue;

      let debit = 0.0;
      let credit = 0.0;

      if (ledger.isDebitBalance) {
        if (ledger.currentBalance >= 0) {
          debit = ledger.currentBalance;
        } else {
          credit = Math.abs(ledger.currentBalance);
        }
      } else {
        if (ledger.currentBalance >= 0) {
          credit = ledger.currentBalance;
        } else {
          debit = Math.abs(ledger.currentBalance);
        }
      }

      grandTotalDebit += debit;
      grandTotalCredit += credit;

      items.push({
        ledgerId: ledger.id,
        ledgerCode: ledger.code,
        ledgerName: ledger.name,
        groupName: ledger.groupName,
        classification: ledger.classification,
        debit: Number(debit.toFixed(2)),
        credit: Number(credit.toFixed(2)),
      });
    }

    const totalDebit = Number(grandTotalDebit.toFixed(2));
    const totalCredit = Number(grandTotalCredit.toFixed(2));
    const difference = Number((totalDebit - totalCredit).toFixed(2));

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      items: items.sort((a, b) => a.ledgerCode.localeCompare(b.ledgerCode)),
      totalDebit,
      totalCredit,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
    };
  }

  // B. PROFIT & LOSS ACCOUNT
  async getProfitAndLoss(periodStart?: string, periodEnd?: string): Promise<ProfitLossReport> {
    const incomeItems: ProfitLossItem[] = [];
    const directExpenseItems: ProfitLossItem[] = [];
    const indirectExpenseItems: ProfitLossItem[] = [];

    let totalIncome = 0.0;
    let totalDirect = 0.0;
    let totalIndirect = 0.0;

    for (const ledger of accountLedgersStore.values()) {
      if (ledger.isDeleted) continue;

      if (ledger.classification === 'REVENUE') {
        const amount = ledger.currentBalance;
        if (amount > 0) {
          totalIncome += amount;
          incomeItems.push({ ledgerId: ledger.id, ledgerName: ledger.name, amount });
        }
      } else if (ledger.classification === 'EXPENSE') {
        const amount = ledger.currentBalance;
        if (amount > 0) {
          // Direct expenses: paper, printing, binding
          if (ledger.groupId === 'grp_direct_exp') {
            totalDirect += amount;
            directExpenseItems.push({ ledgerId: ledger.id, ledgerName: ledger.name, amount });
          } else {
            totalIndirect += amount;
            indirectExpenseItems.push({ ledgerId: ledger.id, ledgerName: ledger.name, amount });
          }
        }
      }
    }

    const grossProfit = Number((totalIncome - totalDirect).toFixed(2));
    const netProfit = Number((grossProfit - totalIndirect).toFixed(2));

    return {
      periodStart: periodStart || '2026-04-01T00:00:00.000Z',
      periodEnd: periodEnd || new Date().toISOString(),
      incomeItems,
      totalIncome: Number(totalIncome.toFixed(2)),
      directExpenseItems,
      totalDirectExpenses: Number(totalDirect.toFixed(2)),
      grossProfit,
      indirectExpenseItems,
      totalIndirectExpenses: Number(totalIndirect.toFixed(2)),
      netProfit,
    };
  }

  // C. BALANCE SHEET
  async getBalanceSheet(asOfDate?: string): Promise<BalanceSheetReport> {
    const pnl = await this.getProfitAndLoss();
    const retainedEarningsFromPnl = pnl.netProfit;

    const assetGroupsMap = new Map<string, { groupName: string; total: number; ledgers: Array<{ id: string; name: string; amount: number }> }>();
    const liabilityGroupsMap = new Map<string, { groupName: string; total: number; ledgers: Array<{ id: string; name: string; amount: number }> }>();
    const equityGroupsMap = new Map<string, { groupName: string; total: number; ledgers: Array<{ id: string; name: string; amount: number }> }>();

    let totalAssets = 0.0;
    let totalLiabilities = 0.0;
    let totalEquity = 0.0;

    for (const ledger of accountLedgersStore.values()) {
      if (ledger.isDeleted) continue;

      if (ledger.classification === 'ASSET') {
        totalAssets += ledger.currentBalance;
        if (!assetGroupsMap.has(ledger.groupName)) {
          assetGroupsMap.set(ledger.groupName, { groupName: ledger.groupName, total: 0, ledgers: [] });
        }
        const g = assetGroupsMap.get(ledger.groupName)!;
        g.total += ledger.currentBalance;
        g.ledgers.push({ id: ledger.id, name: ledger.name, amount: ledger.currentBalance });
      } else if (ledger.classification === 'LIABILITY') {
        totalLiabilities += ledger.currentBalance;
        if (!liabilityGroupsMap.has(ledger.groupName)) {
          liabilityGroupsMap.set(ledger.groupName, { groupName: ledger.groupName, total: 0, ledgers: [] });
        }
        const g = liabilityGroupsMap.get(ledger.groupName)!;
        g.total += ledger.currentBalance;
        g.ledgers.push({ id: ledger.id, name: ledger.name, amount: ledger.currentBalance });
      } else if (ledger.classification === 'EQUITY') {
        totalEquity += ledger.currentBalance;
        if (!equityGroupsMap.has(ledger.groupName)) {
          equityGroupsMap.set(ledger.groupName, { groupName: ledger.groupName, total: 0, ledgers: [] });
        }
        const g = equityGroupsMap.get(ledger.groupName)!;
        g.total += ledger.currentBalance;
        g.ledgers.push({ id: ledger.id, name: ledger.name, amount: ledger.currentBalance });
      }
    }

    const totalEquityAndLiabilities = Number((totalLiabilities + totalEquity + retainedEarningsFromPnl).toFixed(2));
    const roundedAssets = Number(totalAssets.toFixed(2));
    const difference = Number((roundedAssets - totalEquityAndLiabilities).toFixed(2));

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      assets: Array.from(assetGroupsMap.values()),
      totalAssets: roundedAssets,
      liabilities: Array.from(liabilityGroupsMap.values()),
      totalLiabilities: Number(totalLiabilities.toFixed(2)),
      equity: Array.from(equityGroupsMap.values()),
      retainedEarnings: retainedEarningsFromPnl,
      totalEquityAndLiabilities,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
    };
  }

  // D. DAY BOOK
  async getDayBook(dateStr?: string): Promise<DayBookReport> {
    const targetDate = dateStr ? new Date(dateStr).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    const dayVouchers = Array.from(journalEntriesStore.values()).filter(
      (v) => v.status === 'POSTED' && v.entryDate.slice(0, 10) === targetDate
    );

    let totalDebit = 0.0;
    let totalCredit = 0.0;

    for (const v of dayVouchers) {
      for (const item of v.items) {
        totalDebit += item.debitAmount;
        totalCredit += item.creditAmount;
      }
    }

    return {
      date: targetDate,
      vouchers: dayVouchers,
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
    };
  }

  // E. COST CENTRE ACCOUNTING REPORT
  async getCostCentreReport(): Promise<CostCentreReport> {
    const costCentresMap = new Map<string, { id: string; code: string; name: string; totalExpense: number; totalRevenue: number; netAmount: number; entries: any[] }>();

    // Seed Standard Cost Centres
    const stdCentres = [
      { id: 'cc_editorial', code: 'CC-EDIT', name: 'Author Contracts & Editorial' },
      { id: 'cc_production', code: 'CC-PROD', name: 'Book Printing & Pre-Press Production' },
      { id: 'cc_sales', code: 'CC-SALES', name: 'Wholesale Trade & Distribution Sales' },
      { id: 'cc_warehouse', code: 'CC-WH', name: 'Delhi Central Depot Logistics' },
    ];

    stdCentres.forEach((c) => {
      costCentresMap.set(c.name, { ...c, totalExpense: 0, totalRevenue: 0, netAmount: 0, entries: [] });
    });

    for (const voucher of journalEntriesStore.values()) {
      if (voucher.status !== 'POSTED') continue;
      for (const item of voucher.items) {
        if (item.costCentreName && costCentresMap.has(item.costCentreName)) {
          const cc = costCentresMap.get(item.costCentreName)!;
          if (item.debitAmount > 0) {
            cc.totalExpense += item.debitAmount;
            cc.entries.push({
              date: voucher.entryDate,
              voucherNumber: voucher.voucherNumber,
              ledgerName: item.ledgerName,
              amount: item.debitAmount,
              description: item.description || voucher.narration,
            });
          }
          if (item.creditAmount > 0) {
            cc.totalRevenue += item.creditAmount;
          }
          cc.netAmount = Number((cc.totalExpense - cc.totalRevenue).toFixed(2));
        }
      }
    }

    return {
      costCentres: Array.from(costCentresMap.values()),
    };
  }

  // F. ALL VOUCHERS LIST
  async getVouchers(filters?: AccountingQueryFilters): Promise<{ items: JournalEntryDto[]; total: number }> {
    let list = Array.from(journalEntriesStore.values());

    if (filters?.voucherType) {
      list = list.filter((v) => v.voucherType === filters.voucherType);
    }
    if (filters?.status) {
      list = list.filter((v) => v.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.voucherNumber.toLowerCase().includes(q) ||
          v.narration.toLowerCase().includes(q) ||
          v.items.some((i) => i.ledgerName?.toLowerCase().includes(q))
      );
    }

    list = list.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  async getVoucherById(id: string): Promise<JournalEntryDto | null> {
    const voucher = journalEntriesStore.get(id);
    if (!voucher) return null;
    return voucher;
  }
}

export const accountingService = new AccountingService();
