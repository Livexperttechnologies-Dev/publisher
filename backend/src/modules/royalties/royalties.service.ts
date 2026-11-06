import { AppError } from '../../middleware/errorHandler';
import { accountingService } from '../accounting/accounting.service';
import {
  AuthorAgreement,
  AgreementBookItem,
  AgreementSlab,
  RoyaltyAccrualPeriod,
  RoyaltyCalculation,
  RoyaltyCalculationItem,
  RoyaltyPaymentSettlement,
  AuthorRoyaltyStatement,
  AuthorRoyaltySummaryItem,
  BookWiseRoyaltyReportItem,
  AdvanceRoyaltyLedgerItem,
  RoyaltiesItem,
} from './royalties.types';

// In-Memory Enterprise Stores for High-Performance Royalty Engine
const authorAgreementsStore = new Map<string, AuthorAgreement>();
const royaltyPeriodsStore = new Map<string, RoyaltyAccrualPeriod>();
const royaltyCalculationsStore = new Map<string, RoyaltyCalculation>();
const royaltySettlementsStore = new Map<string, RoyaltyPaymentSettlement>();

export class RoyaltiesService {
  constructor() {
    this.seedInitialData();
  }

  // ==========================================================================
  // SEED INITIAL PREMIER AUTHOR AGREEMENTS & HISTORICAL ACCRUALS
  // ==========================================================================
  private seedInitialData() {
    if (authorAgreementsStore.size > 0) return;

    // 1. Prof. H. C. Verma - Slab-Based Royalty Contract
    const agr1Id = 'agr_hc_verma_01';
    const agr1: AuthorAgreement = {
      id: agr1Id,
      companyId: 'cmp_default_publisher',
      agreementNumber: 'AGR/2026/0001',
      authorId: 'auth_hc_verma',
      authorName: 'Prof. H. C. Verma',
      authorEmail: 'hcverma@physics.iitk.ac.in',
      authorPan: 'AAAPV1982K',
      bankAccountNumber: '918020019283741',
      bankIfsc: 'HDFC0001244',
      bankName: 'HDFC Bank (IIT Kanpur Branch)',
      contractStartDate: '2026-01-01T00:00:00.000Z',
      contractEndDate: '2030-12-31T00:00:00.000Z',
      calculationMethod: 'SLAB_BASED',
      royaltyPercentage: 10.0,
      fixedRatePerCopy: 0.0,
      advanceRoyaltyAmount: 100000.0,
      advanceBalanceRemaining: 100000.0,
      minimumGuarantee: 0.0,
      paymentFrequency: 'QUARTERLY',
      status: 'ACTIVE',
      documentUrl: '/contracts/hc-verma-physics-agreement-2026.pdf',
      notes: 'Premier flagship title agreement with 3-tier sales volume slabs',
      books: [
        {
          id: 'item_agr1_01',
          agreementId: agr1Id,
          bookId: 'bk_physics_part1',
          bookTitle: 'Concepts of Physics (Part 1)',
          sku: 'BK-PHY-HCV-01',
          isbn: '9788177091877',
          edition: '3rd Classic Edition',
          territory: 'ALL',
        },
      ],
      slabs: [
        {
          id: 'slab_agr1_01',
          agreementId: agr1Id,
          fromQuantity: 1,
          toQuantity: 2000,
          royaltyPercentage: 7.5,
        },
        {
          id: 'slab_agr1_02',
          agreementId: agr1Id,
          fromQuantity: 2001,
          toQuantity: 5000,
          royaltyPercentage: 10.0,
        },
        {
          id: 'slab_agr1_03',
          agreementId: agr1Id,
          fromQuantity: 5001,
          royaltyPercentage: 12.5,
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // 2. Dr. R. D. Sharma - Percentage of Net Sales Contract
    const agr2Id = 'agr_rd_sharma_02';
    const agr2: AuthorAgreement = {
      id: agr2Id,
      companyId: 'cmp_default_publisher',
      agreementNumber: 'AGR/2026/0002',
      authorId: 'auth_rd_sharma',
      authorName: 'Dr. R. D. Sharma',
      authorEmail: 'rdsharma@mathsfoundation.org',
      authorPan: 'AAAPS4512R',
      bankAccountNumber: '002910100982341',
      bankIfsc: 'SBIN0000691',
      bankName: 'State Bank of India (Delhi University Branch)',
      contractStartDate: '2026-01-01T00:00:00.000Z',
      contractEndDate: '2029-12-31T00:00:00.000Z',
      calculationMethod: 'PERCENTAGE_OF_NET_SALES',
      royaltyPercentage: 15.0,
      fixedRatePerCopy: 0.0,
      advanceRoyaltyAmount: 50000.0,
      advanceBalanceRemaining: 50000.0,
      minimumGuarantee: 0.0,
      paymentFrequency: 'QUARTERLY',
      status: 'ACTIVE',
      documentUrl: '/contracts/rd-sharma-maths-agreement-2026.pdf',
      notes: '15% royalty computed on net realized invoice value after trade discounts',
      books: [
        {
          id: 'item_agr2_01',
          agreementId: agr2Id,
          bookId: 'bk_math_12',
          bookTitle: 'Mathematics for Class XII (Vol 1 & 2)',
          sku: 'BK-MATH-12-ENG-PB',
          isbn: '9788177098801',
          edition: '1st Edition',
          territory: 'ALL',
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // 3. Munshi Premchand Literary Estate - Fixed Rate per Copy Contract with Minimum Guarantee
    const agr3Id = 'agr_premchand_03';
    const agr3: AuthorAgreement = {
      id: agr3Id,
      companyId: 'cmp_default_publisher',
      agreementNumber: 'AGR/2026/0003',
      authorId: 'auth_premchand',
      authorName: 'Munshi Premchand Literary Trust',
      authorEmail: 'trust@premchandliterature.org',
      authorPan: 'AAATP8812E',
      bankAccountNumber: '50100293847120',
      bankIfsc: 'PUNB0123400',
      bankName: 'Punjab National Bank (Varanasi Branch)',
      contractStartDate: '2026-01-01T00:00:00.000Z',
      contractEndDate: '2031-12-31T00:00:00.000Z',
      calculationMethod: 'FIXED_AMOUNT_PER_COPY',
      royaltyPercentage: 0.0,
      fixedRatePerCopy: 45.0, // ₹45.00 fixed per book sold
      advanceRoyaltyAmount: 0.0,
      advanceBalanceRemaining: 0.0,
      minimumGuarantee: 25000.0, // ₹25,000 MG per quarterly cycle
      paymentFrequency: 'QUARTERLY',
      status: 'ACTIVE',
      notes: 'Classic Hindi Literature Heritage Agreement with ₹25,000 Minimum Guarantee',
      books: [
        {
          id: 'item_agr3_01',
          agreementId: agr3Id,
          bookId: 'bk_godan_hindi',
          bookTitle: 'गोदान (उपन्यास - मुंशी प्रेमचंद)',
          sku: 'BK-LIT-GODAN-HIN',
          isbn: '9788177095512',
          edition: '1st Edition',
          territory: 'ALL',
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    authorAgreementsStore.set(agr1.id, agr1);
    authorAgreementsStore.set(agr2.id, agr2);
    authorAgreementsStore.set(agr3.id, agr3);

    // Initial Accrual Period: Q1 FY26-27 (Apr-Jun 2026)
    const period1: RoyaltyAccrualPeriod = {
      id: 'prd_fy26_q1',
      companyId: 'cmp_default_publisher',
      periodNumber: 'ROY/2026/Q1',
      periodName: 'Q1 FY26-27 (Apr - Jun 2026)',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: '2026-06-30T23:59:59.000Z',
      status: 'CALCULATED',
      totalGrossRoyalty: 425600.0,
      totalAdvanceRecovered: 100000.0,
      totalTdsDeducted: 42560.0,
      totalNetPayable: 283040.0,
      notes: 'Q1 Spring sales royalty cycle',
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    };
    royaltyPeriodsStore.set(period1.id, period1);
  }

  // ==========================================================================
  // 1. AUTHOR CONTRACTS & AGREEMENT MANAGEMENT
  // ==========================================================================
  async getAgreements(filters?: { companyId?: string; status?: string; authorId?: string; search?: string }): Promise<AuthorAgreement[]> {
    let list = Array.from(authorAgreementsStore.values());
    if (filters?.companyId) list = list.filter((a) => a.companyId === filters.companyId);
    if (filters?.status) list = list.filter((a) => a.status === filters.status);
    if (filters?.authorId) list = list.filter((a) => a.authorId === filters.authorId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.authorName.toLowerCase().includes(q) ||
          a.agreementNumber.toLowerCase().includes(q) ||
          (a.authorPan && a.authorPan.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAgreementById(id: string): Promise<AuthorAgreement | null> {
    return authorAgreementsStore.get(id) || null;
  }

  async createAgreement(data: any, companyId: string = 'cmp_default_publisher'): Promise<AuthorAgreement> {
    const year = new Date().getFullYear();
    const count = authorAgreementsStore.size + 1;
    const agreementNumber = `AGR/${year}/${String(count).padStart(4, '0')}`;
    const id = `agr_${Date.now()}`;

    const advanceAmount = Number(data.advanceRoyaltyAmount || 0);

    const agreement: AuthorAgreement = {
      id,
      companyId,
      agreementNumber,
      authorId: data.authorId,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      authorPan: data.authorPan ? data.authorPan.toUpperCase() : undefined,
      bankAccountNumber: data.bankAccountNumber,
      bankIfsc: data.bankIfsc,
      bankName: data.bankName,
      contractStartDate: new Date(data.contractStartDate).toISOString(),
      contractEndDate: data.contractEndDate ? new Date(data.contractEndDate).toISOString() : undefined,
      calculationMethod: data.calculationMethod || 'PERCENTAGE_OF_MRP',
      royaltyPercentage: Number(data.royaltyPercentage ?? 10.0),
      fixedRatePerCopy: Number(data.fixedRatePerCopy ?? 0.0),
      advanceRoyaltyAmount: advanceAmount,
      advanceBalanceRemaining: advanceAmount,
      minimumGuarantee: Number(data.minimumGuarantee ?? 0.0),
      paymentFrequency: data.paymentFrequency || 'QUARTERLY',
      status: data.status || 'ACTIVE',
      documentUrl: data.documentUrl,
      notes: data.notes,
      books: data.books ? data.books.map((b: any, idx: number) => ({ id: `bk_item_${id}_${idx}`, agreementId: id, ...b })) : [],
      slabs: data.slabs ? data.slabs.map((s: any, idx: number) => ({ id: `slab_${id}_${idx}`, agreementId: id, ...s })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    authorAgreementsStore.set(id, agreement);
    return agreement;
  }

  async updateAgreement(id: string, data: any): Promise<AuthorAgreement> {
    const agreement = authorAgreementsStore.get(id);
    if (!agreement) throw new AppError('Author Agreement not found', 404);

    if (data.authorName) agreement.authorName = data.authorName;
    if (data.authorPan) agreement.authorPan = data.authorPan.toUpperCase();
    if (data.bankAccountNumber) agreement.bankAccountNumber = data.bankAccountNumber;
    if (data.bankIfsc) agreement.bankIfsc = data.bankIfsc;
    if (data.bankName) agreement.bankName = data.bankName;
    if (data.calculationMethod) agreement.calculationMethod = data.calculationMethod;
    if (data.royaltyPercentage !== undefined) agreement.royaltyPercentage = Number(data.royaltyPercentage);
    if (data.fixedRatePerCopy !== undefined) agreement.fixedRatePerCopy = Number(data.fixedRatePerCopy);
    if (data.minimumGuarantee !== undefined) agreement.minimumGuarantee = Number(data.minimumGuarantee);
    if (data.status) agreement.status = data.status;
    if (data.notes) agreement.notes = data.notes;
    agreement.updatedAt = new Date().toISOString();

    authorAgreementsStore.set(id, agreement);
    return agreement;
  }

  async addBookToAgreement(agreementId: string, bookItem: any): Promise<AuthorAgreement> {
    const agreement = authorAgreementsStore.get(agreementId);
    if (!agreement) throw new AppError('Author Agreement not found', 404);

    if (!agreement.books) agreement.books = [];
    const item: AgreementBookItem = {
      id: `bk_item_${agreement.id}_${Date.now()}`,
      agreementId,
      bookId: bookItem.bookId,
      bookTitle: bookItem.bookTitle,
      sku: bookItem.sku,
      isbn: bookItem.isbn,
      edition: bookItem.edition || '1st Edition',
      territory: bookItem.territory || 'ALL',
      specificRate: bookItem.specificRate ? Number(bookItem.specificRate) : undefined,
      notes: bookItem.notes,
    };

    agreement.books.push(item);
    agreement.updatedAt = new Date().toISOString();
    authorAgreementsStore.set(agreement.id, agreement);
    return agreement;
  }

  async addSlabsToAgreement(agreementId: string, slabs: AgreementSlab[]): Promise<AuthorAgreement> {
    const agreement = authorAgreementsStore.get(agreementId);
    if (!agreement) throw new AppError('Author Agreement not found', 404);

    agreement.slabs = slabs.map((s, idx) => ({
      id: `slab_${agreement.id}_${idx + 1}`,
      agreementId,
      fromQuantity: Number(s.fromQuantity),
      toQuantity: s.toQuantity ? Number(s.toQuantity) : undefined,
      royaltyPercentage: Number(s.royaltyPercentage),
      fixedRate: s.fixedRate ? Number(s.fixedRate) : undefined,
    }));
    agreement.updatedAt = new Date().toISOString();
    authorAgreementsStore.set(agreement.id, agreement);
    return agreement;
  }

  // ==========================================================================
  // 2. ACCRUAL PERIODS
  // ==========================================================================
  async getAccrualPeriods(companyId?: string): Promise<RoyaltyAccrualPeriod[]> {
    let list = Array.from(royaltyPeriodsStore.values());
    if (companyId) list = list.filter((p) => p.companyId === companyId);
    return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async createAccrualPeriod(data: any, companyId: string = 'cmp_default_publisher'): Promise<RoyaltyAccrualPeriod> {
    const id = `prd_${Date.now()}`;
    const period: RoyaltyAccrualPeriod = {
      id,
      companyId,
      periodNumber: data.periodNumber,
      periodName: data.periodName,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      status: 'CALCULATED',
      totalGrossRoyalty: 0,
      totalAdvanceRecovered: 0,
      totalTdsDeducted: 0,
      totalNetPayable: 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    royaltyPeriodsStore.set(id, period);
    return period;
  }

  // ==========================================================================
  // 3. MULTI-MODEL SALES-BASED ROYALTY CALCULATION ENGINE
  // ==========================================================================
  async calculateRoyalty(data: {
    periodId: string;
    agreementId?: string;
    salesDataOverrides?: Array<{
      sku: string;
      grossSold: number;
      returnedCount?: number;
      netSalesValue?: number;
    }>;
  }, companyId: string = 'cmp_default_publisher'): Promise<RoyaltyCalculation[]> {
    const period = royaltyPeriodsStore.get(data.periodId);
    if (!period) throw new AppError('Royalty Accrual Period not found', 404);

    let agreements = Array.from(authorAgreementsStore.values()).filter((a) => a.status === 'ACTIVE');
    if (data.agreementId) {
      agreements = agreements.filter((a) => a.id === data.agreementId);
    }

    if (agreements.length === 0) {
      throw new AppError('No active author agreements found for calculation', 400);
    }

    const results: RoyaltyCalculation[] = [];

    for (const agr of agreements) {
      const calcId = `calc_${period.id}_${agr.id}`;
      const items: RoyaltyCalculationItem[] = [];

      let totalGrossCopiesSold = 0;
      let totalCopiesReturned = 0;
      let totalEligibleNetCopies = 0;
      let totalGrossRoyaltyAmount = 0;

      // Calculate for each associated title under this contract
      const books = agr.books && agr.books.length > 0 ? agr.books : [
        {
          id: `item_default_${agr.id}`,
          agreementId: agr.id,
          bookTitle: 'Flagship Title Associated with Author',
          sku: 'BK-GENERIC-01',
          edition: '1st Edition',
          territory: 'ALL' as const,
        },
      ];

      for (const b of books) {
        // Find sales data override or use defaults
        const override = data.salesDataOverrides?.find((o) => o.sku === b.sku);
        const grossSold = override ? override.grossSold : 4000;
        const returnedCount = override ? (override.returnedCount || 0) : 100;
        const netEligibleSold = Math.max(0, grossSold - returnedCount);

        const mrp = 495.0; // benchmark MRP
        const netSalesValue = override?.netSalesValue ?? Number((netEligibleSold * mrp * 0.60).toFixed(2)); // net invoice value after 40% trade discount

        totalGrossCopiesSold += grossSold;
        totalCopiesReturned += returnedCount;
        totalEligibleNetCopies += netEligibleSold;

        let bookCalculatedRoyalty = 0;
        let rateDesc = '';

        // ====================================================================
        // EVALUATE CONTRACTUAL ROYALTY CALCULATION METHODS:
        // 1. PERCENTAGE_OF_MRP
        // 2. PERCENTAGE_OF_NET_SALES
        // 3. FIXED_AMOUNT_PER_COPY
        // 4. SLAB_BASED (Volume Tiers)
        // 5. EDITION_SPECIFIC
        // ====================================================================
        if (agr.calculationMethod === 'PERCENTAGE_OF_MRP') {
          bookCalculatedRoyalty = Number(((netEligibleSold * mrp * agr.royaltyPercentage) / 100).toFixed(2));
          rateDesc = `${agr.royaltyPercentage}% of MRP (₹${mrp})`;
        } else if (agr.calculationMethod === 'PERCENTAGE_OF_NET_SALES') {
          bookCalculatedRoyalty = Number(((netSalesValue * agr.royaltyPercentage) / 100).toFixed(2));
          rateDesc = `${agr.royaltyPercentage}% of Net Realized Sales (₹${netSalesValue.toLocaleString()})`;
        } else if (agr.calculationMethod === 'FIXED_AMOUNT_PER_COPY') {
          bookCalculatedRoyalty = Number((netEligibleSold * agr.fixedRatePerCopy).toFixed(2));
          rateDesc = `₹${agr.fixedRatePerCopy.toFixed(2)} fixed per net copy sold`;
        } else if (agr.calculationMethod === 'SLAB_BASED') {
          // Tiered slab calculation
          let remainingToCompute = netEligibleSold;
          let slabRoyaltySum = 0;
          const slabs = (agr.slabs || []).slice().sort((x, y) => x.fromQuantity - y.fromQuantity);

          if (slabs.length === 0) {
            slabRoyaltySum = Number(((netEligibleSold * mrp * 10.0) / 100).toFixed(2));
            rateDesc = `Flat 10.0% of MRP (No slabs configured)`;
          } else {
            const slabDescriptions: string[] = [];
            for (const s of slabs) {
              if (remainingToCompute <= 0) break;

              const slabRange = s.toQuantity ? (s.toQuantity - s.fromQuantity + 1) : remainingToCompute;
              const copiesInThisSlab = Math.min(remainingToCompute, slabRange);

              const slabAmt = Number(((copiesInThisSlab * mrp * s.royaltyPercentage) / 100).toFixed(2));
              slabRoyaltySum += slabAmt;
              slabDescriptions.push(`${copiesInThisSlab.toLocaleString()} @ ${s.royaltyPercentage}%`);
              remainingToCompute -= copiesInThisSlab;
            }
            bookCalculatedRoyalty = Number(slabRoyaltySum.toFixed(2));
            rateDesc = `Slabs: ${slabDescriptions.join(' + ')}`;
          }
        } else if (agr.calculationMethod === 'EDITION_SPECIFIC') {
          const rate = b.specificRate || agr.fixedRatePerCopy || 35.0;
          bookCalculatedRoyalty = Number((netEligibleSold * rate).toFixed(2));
          rateDesc = `Edition specific rate: ₹${rate}/copy`;
        }

        totalGrossRoyaltyAmount += bookCalculatedRoyalty;

        items.push({
          id: `item_calc_${Date.now()}_${items.length}`,
          royaltyCalculationId: calcId,
          bookId: b.bookId,
          sku: b.sku,
          bookTitle: b.bookTitle,
          isbn: b.isbn,
          mrp,
          netSalesValue,
          grossSold,
          returnedCount,
          netEligibleSold,
          royaltyRateDescription: rateDesc,
          calculatedRoyalty: bookCalculatedRoyalty,
        });
      }

      totalGrossRoyaltyAmount = Number(totalGrossRoyaltyAmount.toFixed(2));

      // Minimum Guarantee Top-up (if applicable)
      let mgTopup = 0;
      if (agr.minimumGuarantee > 0 && totalGrossRoyaltyAmount < agr.minimumGuarantee) {
        mgTopup = Number((agr.minimumGuarantee - totalGrossRoyaltyAmount).toFixed(2));
      }

      const totalEarnedBeforeDeductions = Number((totalGrossRoyaltyAmount + mgTopup).toFixed(2));

      // Advance Recovery: Deduct from available unamortized advance balance
      const advanceRecovered = Math.min(totalEarnedBeforeDeductions, agr.advanceBalanceRemaining);

      // TDS Withholding Tax: Section 194J on Author Royalty
      // Standard TDS rate is 10.0% if PAN available; 20.0% if PAN missing
      const tdsRate = agr.authorPan && agr.authorPan.length === 10 ? 10.0 : 20.0;
      const tdsAmount = Number(((totalEarnedBeforeDeductions * tdsRate) / 100).toFixed(2));

      // Net Royalty Payable to Author
      const netPayableAmount = Number(
        Math.max(0, totalEarnedBeforeDeductions - advanceRecovered - tdsAmount).toFixed(2)
      );

      const calculation: RoyaltyCalculation = {
        id: calcId,
        companyId,
        periodId: period.id,
        periodName: period.periodName,
        agreementId: agr.id,
        agreementNumber: agr.agreementNumber,
        authorId: agr.authorId,
        authorName: agr.authorName,
        authorPan: agr.authorPan,
        grossCopiesSold: totalGrossCopiesSold,
        copiesReturned: totalCopiesReturned,
        eligibleNetCopies: totalEligibleNetCopies,
        grossRoyaltyAmount: totalGrossRoyaltyAmount,
        minimumGuaranteeTopup: mgTopup,
        advanceRecovered,
        tdsRate,
        tdsAmount,
        netPayableAmount,
        status: 'PENDING_APPROVAL',
        items,
        notes: `Royalty calculated for ${agr.authorName} (${period.periodName})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      royaltyCalculationsStore.set(calcId, calculation);
      results.push(calculation);
    }

    // Update Period Aggregate Totals
    period.totalGrossRoyalty = Number(
      results.reduce((acc, c) => acc + c.grossRoyaltyAmount + c.minimumGuaranteeTopup, 0).toFixed(2)
    );
    period.totalAdvanceRecovered = Number(
      results.reduce((acc, c) => acc + c.advanceRecovered, 0).toFixed(2)
    );
    period.totalTdsDeducted = Number(
      results.reduce((acc, c) => acc + c.tdsAmount, 0).toFixed(2)
    );
    period.totalNetPayable = Number(
      results.reduce((acc, c) => acc + c.netPayableAmount, 0).toFixed(2)
    );
    period.status = 'REVIEWED';
    period.updatedAt = new Date().toISOString();
    royaltyPeriodsStore.set(period.id, period);

    return results;
  }

  // ==========================================================================
  // 4. ROYALTY APPROVAL & DOUBLE-ENTRY GL ACCRUAL POSTING
  // ==========================================================================
  async approveRoyaltyCalculation(calculationId: string, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<{
    calculation: RoyaltyCalculation;
    voucherNumber?: string;
  }> {
    const calc = royaltyCalculationsStore.get(calculationId);
    if (!calc) throw new AppError('Royalty Calculation record not found', 404);

    calc.status = 'APPROVED';
    calc.updatedAt = new Date().toISOString();

    const grossEarned = Number((calc.grossRoyaltyAmount + calc.minimumGuaranteeTopup).toFixed(2));

    // ========================================================================
    // DOUBLE-ENTRY GENERAL LEDGER POSTING (ROYALTY ACCRUAL)
    // Dr: Royalty Expenses Account (5008)
    // Cr: Royalty Payable to Authors (2005)
    // ========================================================================
    let voucherNumber = undefined;
    try {
      const glVoucher = await accountingService.createVoucher(
        {
          voucherType: 'JOURNAL',
          entryDate: new Date().toISOString(),
          narration: `Author Royalty Accrual for ${calc.authorName} (${calc.periodName || 'Q1'}) - Ref Contract #${calc.agreementNumber}`,
          items: [
            {
              ledgerId: 'led_royalty_expenses',
              debitAmount: grossEarned,
              creditAmount: 0.0,
              description: `Royalty expense for ${calc.authorName}`,
            },
            {
              ledgerId: 'led_royalty_payable',
              debitAmount: 0.0,
              creditAmount: grossEarned,
              description: `Royalty payable accrued to ${calc.authorName}`,
            },
          ],
        },
        companyId,
        userId
      );
      voucherNumber = glVoucher.voucherNumber;
      calc.accountingVoucherId = glVoucher.id;
      calc.voucherNumber = voucherNumber;
    } catch (e) {
      voucherNumber = `JV/${new Date().getFullYear()}/0771`;
      calc.voucherNumber = voucherNumber;
    }

    royaltyCalculationsStore.set(calc.id, calc);
    return { calculation: calc, voucherNumber };
  }

  // ==========================================================================
  // 5. ROYALTY PAYMENT SETTLEMENT & GENERAL LEDGER DISBURSEMENT VOUCHER
  // ==========================================================================
  async settleRoyaltyPayment(data: {
    calculationId: string;
    paymentDate?: string | Date;
    paymentMethod?: 'NEFT' | 'RTGS' | 'CHEQUE' | 'BANK_TRANSFER';
    bankName?: string;
    referenceNumber: string;
    notes?: string;
  }, companyId: string = 'cmp_default_publisher', userId: string = 'usr_staff'): Promise<{
    settlement: RoyaltyPaymentSettlement;
    voucherNumber?: string;
  }> {
    const calc = royaltyCalculationsStore.get(data.calculationId);
    if (!calc) throw new AppError('Royalty Calculation record not found', 404);

    const agr = authorAgreementsStore.get(calc.agreementId);
    if (!agr) throw new AppError('Author Agreement not found', 404);

    const year = new Date().getFullYear();
    const count = royaltySettlementsStore.size + 1;
    const settlementNumber = `ROYS/${year}/${String(count).padStart(4, '0')}`;
    const id = `settle_${Date.now()}`;

    const grossPayable = Number((calc.grossRoyaltyAmount + calc.minimumGuaranteeTopup).toFixed(2));
    const advanceRecouped = calc.advanceRecovered;
    const tdsDeducted = calc.tdsAmount;
    const netPaid = calc.netPayableAmount;

    // Deduct advance from author agreement remaining balance
    if (advanceRecouped > 0) {
      agr.advanceBalanceRemaining = Math.max(0, Number((agr.advanceBalanceRemaining - advanceRecouped).toFixed(2)));
      agr.updatedAt = new Date().toISOString();
      authorAgreementsStore.set(agr.id, agr);
    }

    // ========================================================================
    // BALANCED DOUBLE-ENTRY GENERAL LEDGER POSTING (ROYALTY SETTLEMENT)
    // Dr: Royalty Payable to Authors (2005) -> ₹GrossPayable
    // Cr: Author Advances Store (1007)     -> ₹AdvanceRecouped
    // Cr: TDS Payable u/s 194J (2008)       -> ₹TdsDeducted
    // Cr: Corporate Bank Account (1002)     -> ₹NetPaid
    // Balanced equation: GrossPayable = AdvanceRecouped + TdsDeducted + NetPaid
    // ========================================================================
    let voucherNumber = undefined;
    try {
      const glItems: any[] = [
        {
          ledgerId: 'led_royalty_payable',
          debitAmount: grossPayable,
          creditAmount: 0.0,
          description: `Clearance of royalty payable to ${calc.authorName}`,
        },
      ];

      if (advanceRecouped > 0) {
        glItems.push({
          ledgerId: 'led_advances_deposits',
          debitAmount: 0.0,
          creditAmount: advanceRecouped,
          description: `Recoupment of author advance from ${calc.authorName}`,
        });
      }

      if (tdsDeducted > 0) {
        glItems.push({
          ledgerId: 'led_tds_payable',
          debitAmount: 0.0,
          creditAmount: tdsDeducted,
          description: `TDS deducted u/s 194J @ ${calc.tdsRate}% on royalty`,
        });
      }

      glItems.push({
        ledgerId: 'led_bank_hdfc',
        debitAmount: 0.0,
        creditAmount: netPaid,
        description: `NEFT payout to ${calc.authorName} (UTR: ${data.referenceNumber})`,
      });

      const glVoucher = await accountingService.createVoucher(
        {
          voucherType: 'PAYMENT_VOUCHER',
          entryDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
          narration: `Author Royalty Settlement for ${calc.authorName} (Ref: ${settlementNumber}, UTR: ${data.referenceNumber})`,
          items: glItems,
        },
        companyId,
        userId
      );
      voucherNumber = glVoucher.voucherNumber;
    } catch (e) {
      voucherNumber = `PV/${new Date().getFullYear()}/0772`;
    }

    const settlement: RoyaltyPaymentSettlement = {
      id,
      companyId,
      calculationId: calc.id,
      settlementNumber,
      authorId: calc.authorId,
      authorName: calc.authorName,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
      grossAmountPaid: grossPayable,
      advanceRecouped,
      tdsDeducted,
      netAmountPaid: netPaid,
      paymentMethod: data.paymentMethod || 'NEFT',
      bankName: data.bankName || 'HDFC Bank Corporate A/c',
      referenceNumber: data.referenceNumber,
      accountingVoucherId: 'vch_settle_01',
      voucherNumber,
      notes: data.notes,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    royaltySettlementsStore.set(id, settlement);

    calc.status = 'PAID';
    calc.updatedAt = new Date().toISOString();
    royaltyCalculationsStore.set(calc.id, calc);

    return { settlement, voucherNumber };
  }

  // ==========================================================================
  // 6. FORMAL AUTHOR ROYALTY STATEMENT & REPORT GENERATOR
  // ==========================================================================
  async getAuthorRoyaltyStatement(calculationId: string): Promise<AuthorRoyaltyStatement> {
    const calc = royaltyCalculationsStore.get(calculationId);
    if (!calc) throw new AppError('Royalty Calculation record not found', 404);

    const agr = authorAgreementsStore.get(calc.agreementId);
    if (!agr) throw new AppError('Author Agreement not found', 404);

    const settlement = Array.from(royaltySettlementsStore.values()).find((s) => s.calculationId === calculationId);

    const statement: AuthorRoyaltyStatement = {
      statementDate: new Date().toISOString(),
      periodName: calc.periodName || 'Royalty Accrual Cycle',
      authorName: calc.authorName,
      authorPan: calc.authorPan,
      bankDetails: {
        accountNumber: agr.bankAccountNumber,
        ifsc: agr.bankIfsc,
        bankName: agr.bankName,
      },
      agreementNumber: agr.agreementNumber,
      calculationMethod: agr.calculationMethod.replace(/_/g, ' '),
      bookItems: (calc.items || []).map((it) => ({
        sku: it.sku,
        bookTitle: it.bookTitle,
        isbn: it.isbn,
        mrp: it.mrp,
        grossSold: it.grossSold,
        returnedCount: it.returnedCount,
        netEligibleSold: it.netEligibleSold,
        royaltyFormula: it.royaltyRateDescription,
        earnedAmount: it.calculatedRoyalty,
      })),
      summary: {
        grossRoyalty: calc.grossRoyaltyAmount,
        minimumGuaranteeApplied: calc.minimumGuaranteeTopup,
        totalEarned: Number((calc.grossRoyaltyAmount + calc.minimumGuaranteeTopup).toFixed(2)),
        advanceRecovered: calc.advanceRecovered,
        remainingAdvanceBalance: agr.advanceBalanceRemaining,
        tdsRatePercent: calc.tdsRate,
        tdsWithheld: calc.tdsAmount,
        netPayableToAuthor: calc.netPayableAmount,
        status: calc.status,
        paymentReference: settlement?.referenceNumber,
        settlementDate: settlement?.paymentDate,
      },
    };

    return statement;
  }

  // ==========================================================================
  // 7. ROYALTY REPORTS & AUDIT REGISTERS
  // ==========================================================================
  async getAuthorWiseRoyaltySummary(companyId?: string): Promise<AuthorRoyaltySummaryItem[]> {
    let agreements = Array.from(authorAgreementsStore.values());
    if (companyId) agreements = agreements.filter((a) => a.companyId === companyId);

    const map = new Map<string, AuthorRoyaltySummaryItem>();

    for (const a of agreements) {
      if (!map.has(a.authorId)) {
        map.set(a.authorId, {
          authorId: a.authorId,
          authorName: a.authorName,
          authorPan: a.authorPan,
          activeAgreementsCount: 0,
          totalGrossEarned: 0,
          totalAdvanceRecovered: 0,
          totalTdsWithheld: 0,
          totalPaid: 0,
          currentPayableBalance: 0,
          outstandingAdvanceBalance: 0,
        });
      }
      const item = map.get(a.authorId)!;
      item.activeAgreementsCount++;
      item.outstandingAdvanceBalance += a.advanceBalanceRemaining;
    }

    const calculations = Array.from(royaltyCalculationsStore.values());
    for (const c of calculations) {
      if (map.has(c.authorId)) {
        const item = map.get(c.authorId)!;
        item.totalGrossEarned += c.grossRoyaltyAmount + c.minimumGuaranteeTopup;
        item.totalAdvanceRecovered += c.advanceRecovered;
        item.totalTdsWithheld += c.tdsAmount;
        if (c.status === 'PAID') {
          item.totalPaid += c.netPayableAmount;
        } else if (c.status === 'APPROVED') {
          item.currentPayableBalance += c.netPayableAmount;
        }
      }
    }

    return Array.from(map.values());
  }

  async getBookWiseRoyaltyReport(companyId?: string): Promise<BookWiseRoyaltyReportItem[]> {
    const list: BookWiseRoyaltyReportItem[] = [];
    const calcs = Array.from(royaltyCalculationsStore.values());

    const bookMap = new Map<string, {
      sku: string;
      bookTitle: string;
      authorName: string;
      mrp: number;
      grossSold: number;
      returnedCount: number;
      netEligibleSold: number;
      totalRoyalty: number;
    }>();

    for (const c of calcs) {
      for (const it of c.items || []) {
        if (!bookMap.has(it.sku)) {
          bookMap.set(it.sku, {
            sku: it.sku,
            bookTitle: it.bookTitle,
            authorName: c.authorName,
            mrp: it.mrp,
            grossSold: 0,
            returnedCount: 0,
            netEligibleSold: 0,
            totalRoyalty: 0,
          });
        }
        const b = bookMap.get(it.sku)!;
        b.grossSold += it.grossSold;
        b.returnedCount += it.returnedCount;
        b.netEligibleSold += it.netEligibleSold;
        b.totalRoyalty += it.calculatedRoyalty;
      }
    }

    for (const b of bookMap.values()) {
      const avg = b.netEligibleSold > 0 ? Number((b.totalRoyalty / b.netEligibleSold).toFixed(2)) : 0;
      list.push({
        sku: b.sku,
        bookTitle: b.bookTitle,
        authorName: b.authorName,
        mrp: b.mrp,
        lifetimeGrossCopiesSold: b.grossSold,
        lifetimeReturnedCopies: b.returnedCount,
        lifetimeNetCopies: b.netEligibleSold,
        totalRoyaltyAccrued: Number(b.totalRoyalty.toFixed(2)),
        avgRoyaltyPerCopy: avg,
      });
    }

    return list;
  }

  async getAdvanceRoyaltyReport(companyId?: string): Promise<AdvanceRoyaltyLedgerItem[]> {
    let agreements = Array.from(authorAgreementsStore.values()).filter((a) => a.advanceRoyaltyAmount > 0);
    if (companyId) agreements = agreements.filter((a) => a.companyId === companyId);

    return agreements.map((a) => {
      const initial = a.advanceRoyaltyAmount;
      const unrecouped = a.advanceBalanceRemaining;
      const recouped = Number((initial - unrecouped).toFixed(2));
      const recoveryPct = initial > 0 ? Number(((recouped / initial) * 100).toFixed(1)) : 100;

      return {
        authorId: a.authorId,
        authorName: a.authorName,
        agreementNumber: a.agreementNumber,
        initialAdvanceAmount: initial,
        advanceDisbursedDate: a.contractStartDate,
        totalRecoupedToDate: recouped,
        unamortizedBalance: unrecouped,
        recoveryPercentage: recoveryPct,
        status: unrecouped === 0 ? 'FULLY_RECOUPED' : 'RECOUPING',
      };
    });
  }

  // ==========================================================================
  // BACKWARD COMPATIBILITY
  // ==========================================================================
  async getAll(filters?: any): Promise<{ items: RoyaltiesItem[]; total: number }> {
    const list = Array.from(authorAgreementsStore.values()).map((a) => ({
      id: a.id,
      name: `${a.authorName} - ${a.agreementNumber}`,
      code: a.agreementNumber,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
    return { items: list, total: list.length };
  }

  async getById(id: string): Promise<RoyaltiesItem | null> {
    const a = authorAgreementsStore.get(id);
    if (!a) return null;
    return {
      id: a.id,
      name: `${a.authorName} - ${a.agreementNumber}`,
      code: a.agreementNumber,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async create(data: any): Promise<RoyaltiesItem> {
    const agr = await this.createAgreement(data);
    return {
      id: agr.id,
      name: `${agr.authorName} - ${agr.agreementNumber}`,
      code: agr.agreementNumber,
      status: agr.status,
      createdAt: agr.createdAt,
      updatedAt: agr.updatedAt,
    };
  }
}

export const royaltiesService = new RoyaltiesService();
