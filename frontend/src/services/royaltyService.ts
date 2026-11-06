import { postDoubleEntryVoucher } from './voucherService';
import { getStoredBooks, getStoredAuthors } from './catalogueService';

export interface AuthorAgreementItem {
  id: string;
  agreementNumber: string;
  authorId?: string;
  authorName: string;
  authorPan: string;
  authorEmail?: string;
  calculationMethod: 'PERCENTAGE_OF_MRP' | 'PERCENTAGE_OF_NET_SALES' | 'FIXED_AMOUNT_PER_COPY' | 'SLAB_BASED';
  royaltyPercentage: number;
  fixedRatePerCopy: number;
  advanceRoyaltyAmount: number;
  advanceBalanceRemaining: number;
  minimumGuarantee: number;
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bookTitles: string[];
  notes?: string;
}

export interface RoyaltyCalculationItem {
  id: string;
  calculationNumber: string;
  periodName: string;
  agreementId: string;
  agreementNumber: string;
  authorName: string;
  authorPan: string;
  bookTitle: string;
  calculationDate: string;
  calculationMethod: string;
  grossCopiesSold: number;
  copiesReturned: number;
  eligibleNetCopies: number;
  mrp: number;
  grossRoyaltyAmount: number;
  minimumGuaranteeTopup: number;
  advanceRecovered: number;
  tdsRate: number;
  tdsAmount: number;
  netPayableAmount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PAID';
  voucherNumber?: string;
  notes?: string;
}

export interface AdvanceLedgerItem {
  id: string;
  advanceNumber: string;
  agreementId?: string;
  agreementNumber: string;
  authorName: string;
  advanceDate: string;
  initialAdvanceAmount: number;
  totalRecoupedToDate: number;
  unamortizedBalance: number;
  recoveryPercentage: number;
  bankName: string;
  bankAccountNumber?: string;
  transactionRef: string;
  voucherNumber?: string;
  status: 'RECOUPING' | 'FULLY_RECOUPED';
  notes?: string;
}

export interface RoyaltySettlementItem {
  id: string;
  settlementNumber: string;
  calculationId: string;
  agreementNumber: string;
  authorName: string;
  authorPan: string;
  periodName: string;
  settlementDate: string;
  grossAmount: number;
  advanceRecouped: number;
  tdsAmount: number;
  netPaidAmount: number;
  paymentMethod: 'NEFT' | 'RTGS' | 'CHEQUE' | 'UPI';
  bankName: string;
  bankAccountNumber: string;
  transactionRef: string;
  voucherNumber: string;
  status: 'POSTED';
}

const STORAGE_KEYS = {
  AGREEMENTS: 'kibo360_author_agreements_v2',
  CALCULATIONS: 'kibo360_royalty_calculations_v2',
  ADVANCES: 'kibo360_advance_ledgers_v2',
  SETTLEMENTS: 'kibo360_royalty_settlements_v2',
};

// Initial Seed Data
export const INITIAL_AGREEMENTS: AuthorAgreementItem[] = [
  {
    id: 'agr_01',
    agreementNumber: 'AGR/2026/0001',
    authorName: 'Prof. H. C. Verma',
    authorPan: 'AAAPV1982K',
    authorEmail: 'hcverma.physics@iitk.ac.in',
    calculationMethod: 'SLAB_BASED',
    royaltyPercentage: 10.0,
    fixedRatePerCopy: 0.0,
    advanceRoyaltyAmount: 100000.0,
    advanceBalanceRemaining: 0.0,
    minimumGuarantee: 0.0,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    bankName: 'HDFC Bank (IIT Kanpur Branch)',
    bankAccountNumber: '918020019283741',
    bankIfsc: 'HDFC0001244',
    bookTitles: ['Concepts of Physics (Part 1)', 'Concepts of Physics (Part 2)'],
    notes: 'Volume slab: 1-2000 copies @ 7.5%, 2001-5000 copies @ 10%, >5000 @ 12.5%',
  },
  {
    id: 'agr_02',
    agreementNumber: 'AGR/2026/0002',
    authorName: 'Dr. R. D. Sharma',
    authorPan: 'AAAPS4512R',
    authorEmail: 'rdsharma.maths@du.ac.in',
    calculationMethod: 'PERCENTAGE_OF_NET_SALES',
    royaltyPercentage: 15.0,
    fixedRatePerCopy: 0.0,
    advanceRoyaltyAmount: 50000.0,
    advanceBalanceRemaining: 0.0,
    minimumGuarantee: 0.0,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    bankName: 'State Bank of India (Delhi University Branch)',
    bankAccountNumber: '002910100982341',
    bankIfsc: 'SBIN0000691',
    bookTitles: ['Mathematics for Class XII (Vol 1 & 2)'],
    notes: '15% on net realized wholesale invoice sales after trade discounts',
  },
  {
    id: 'agr_03',
    agreementNumber: 'AGR/2026/0003',
    authorName: 'Munshi Premchand Literary Trust',
    authorPan: 'AAATP8812E',
    authorEmail: 'premchand.trust@literature.org.in',
    calculationMethod: 'FIXED_AMOUNT_PER_COPY',
    royaltyPercentage: 0.0,
    fixedRatePerCopy: 45.0,
    advanceRoyaltyAmount: 0.0,
    advanceBalanceRemaining: 0.0,
    minimumGuarantee: 25000.0,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    bankName: 'Punjab National Bank (Varanasi Branch)',
    bankAccountNumber: '50100293847120',
    bankIfsc: 'PUNB0123400',
    bookTitles: ['गोदान (उपन्यास - मुंशी प्रेमचंद)', 'गबन (उपन्यास)'],
    notes: 'Flat ₹45 per copy with ₹25,000 quarterly minimum guarantee topup',
  },
  {
    id: 'agr_04',
    agreementNumber: 'AGR/2026/0004',
    authorName: 'Dr. A. P. J. Abdul Kalam Trust',
    authorPan: 'AAATK9981F',
    authorEmail: 'kalam.legacy@drdo.gov.in',
    calculationMethod: 'PERCENTAGE_OF_MRP',
    royaltyPercentage: 12.0,
    fixedRatePerCopy: 0.0,
    advanceRoyaltyAmount: 75000.0,
    advanceBalanceRemaining: 75000.0,
    minimumGuarantee: 0.0,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    bankName: 'State Bank of India (Rameswaram Branch)',
    bankAccountNumber: '10928374650192',
    bankIfsc: 'SBIN0001140',
    bookTitles: ['Wings of Fire: An Autobiography', 'Ignited Minds'],
    notes: '12% on printed retail MRP, advance unamortized ₹75,000',
  },
];

export const INITIAL_CALCULATIONS: RoyaltyCalculationItem[] = [
  {
    id: 'calc_01',
    calculationNumber: 'RCAL/2026/0001',
    periodName: 'Q2 FY26-27 (Jul - Sep 2026)',
    agreementId: 'agr_01',
    agreementNumber: 'AGR/2026/0001',
    authorName: 'Prof. H. C. Verma',
    authorPan: 'AAAPV1982K',
    bookTitle: 'Concepts of Physics (Part 1)',
    calculationDate: '2026-10-01',
    calculationMethod: 'SLAB_BASED',
    grossCopiesSold: 5000,
    copiesReturned: 200,
    eligibleNetCopies: 4800,
    mrp: 495.0,
    grossRoyaltyAmount: 212850.0,
    minimumGuaranteeTopup: 0.0,
    advanceRecovered: 100000.0,
    tdsRate: 10.0,
    tdsAmount: 21285.0,
    netPayableAmount: 91565.0,
    status: 'PAID',
    voucherNumber: 'PV/2026/0772',
    notes: '2,000 @ 7.5% (₹74,250) + 2,800 @ 10% (₹138,600). Advance recouped ₹1,00,000.',
  },
  {
    id: 'calc_02',
    calculationNumber: 'RCAL/2026/0002',
    periodName: 'Q2 FY26-27 (Jul - Sep 2026)',
    agreementId: 'agr_03',
    agreementNumber: 'AGR/2026/0003',
    authorName: 'Munshi Premchand Literary Trust',
    authorPan: 'AAATP8812E',
    bookTitle: 'गोदान (उपन्यास - मुंशी प्रेमचंद)',
    calculationDate: '2026-10-02',
    calculationMethod: 'FIXED_AMOUNT_PER_COPY',
    grossCopiesSold: 300,
    copiesReturned: 0,
    eligibleNetCopies: 300,
    mrp: 295.0,
    grossRoyaltyAmount: 13500.0,
    minimumGuaranteeTopup: 11500.0,
    advanceRecovered: 0.0,
    tdsRate: 10.0,
    tdsAmount: 2500.0,
    netPayableAmount: 22500.0,
    status: 'APPROVED',
    voucherNumber: 'JV/2026/0773',
    notes: '300 copies @ ₹45 = ₹13,500. MG topup ₹11,500 to satisfy ₹25k guarantee.',
  },
  {
    id: 'calc_03',
    calculationNumber: 'RCAL/2026/0003',
    periodName: 'Q2 FY26-27 (Jul - Sep 2026)',
    agreementId: 'agr_02',
    agreementNumber: 'AGR/2026/0002',
    authorName: 'Dr. R. D. Sharma',
    authorPan: 'AAAPS4512R',
    bookTitle: 'Mathematics for Class XII (Vol 1 & 2)',
    calculationDate: '2026-10-02',
    calculationMethod: 'PERCENTAGE_OF_NET_SALES',
    grossCopiesSold: 2200,
    copiesReturned: 50,
    eligibleNetCopies: 2150,
    mrp: 595.0,
    grossRoyaltyAmount: 115025.0,
    minimumGuaranteeTopup: 0.0,
    advanceRecovered: 50000.0,
    tdsRate: 10.0,
    tdsAmount: 11502.5,
    netPayableAmount: 53522.5,
    status: 'APPROVED',
    voucherNumber: 'JV/2026/0774',
    notes: '15% on wholesale net realization (₹766,833.33). Advance recouped ₹50,000.',
  },
];

export const INITIAL_ADVANCES: AdvanceLedgerItem[] = [
  {
    id: 'adv_01',
    advanceNumber: 'ADV/2026/0001',
    agreementId: 'agr_01',
    agreementNumber: 'AGR/2026/0001',
    authorName: 'Prof. H. C. Verma',
    advanceDate: '2026-04-10',
    initialAdvanceAmount: 100000.0,
    totalRecoupedToDate: 100000.0,
    unamortizedBalance: 0.0,
    recoveryPercentage: 100.0,
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '918020019283741',
    transactionRef: 'HDFC-ADV-9921',
    voucherNumber: 'PV/2026/0112',
    status: 'FULLY_RECOUPED',
    notes: 'Disbursed at contract signing for Physics Volume 3 prep. Recouped in full.',
  },
  {
    id: 'adv_02',
    advanceNumber: 'ADV/2026/0002',
    agreementId: 'agr_02',
    agreementNumber: 'AGR/2026/0002',
    authorName: 'Dr. R. D. Sharma',
    advanceDate: '2026-04-15',
    initialAdvanceAmount: 50000.0,
    totalRecoupedToDate: 50000.0,
    unamortizedBalance: 0.0,
    recoveryPercentage: 100.0,
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '002910100982341',
    transactionRef: 'HDFC-ADV-9945',
    voucherNumber: 'PV/2026/0128',
    status: 'FULLY_RECOUPED',
    notes: 'Disbursed for Class 12 revisions. Recouped in Q2 FY26-27.',
  },
  {
    id: 'adv_03',
    advanceNumber: 'ADV/2026/0003',
    agreementId: 'agr_04',
    agreementNumber: 'AGR/2026/0004',
    authorName: 'Dr. A. P. J. Abdul Kalam Trust',
    advanceDate: '2026-07-01',
    initialAdvanceAmount: 75000.0,
    totalRecoupedToDate: 0.0,
    unamortizedBalance: 75000.0,
    recoveryPercentage: 0.0,
    bankName: 'State Bank of India Operative A/c',
    bankAccountNumber: '10928374650192',
    transactionRef: 'SBI-ADV-8831',
    voucherNumber: 'PV/2026/0419',
    status: 'RECOUPING',
    notes: 'Upfront advance for youth scholarship series. Unamortized balance ₹75,000.',
  },
];

export const INITIAL_SETTLEMENTS: RoyaltySettlementItem[] = [
  {
    id: 'roys_01',
    settlementNumber: 'ROYS/2026/0001',
    calculationId: 'calc_01',
    agreementNumber: 'AGR/2026/0001',
    authorName: 'Prof. H. C. Verma',
    authorPan: 'AAAPV1982K',
    periodName: 'Q2 FY26-27 (Jul - Sep 2026)',
    settlementDate: '2026-10-05',
    grossAmount: 212850.0,
    advanceRecouped: 100000.0,
    tdsAmount: 21285.0,
    netPaidAmount: 91565.0,
    paymentMethod: 'NEFT',
    bankName: 'HDFC Bank (IIT Kanpur)',
    bankAccountNumber: '918020019283741',
    transactionRef: 'HDFC-NEFT-2026-991283',
    voucherNumber: 'PV/2026/0772',
    status: 'POSTED',
  },
];

// Helper Functions for LocalStorage
export function getStoredAgreements(): AuthorAgreementItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(INITIAL_AGREEMENTS));
      return INITIAL_AGREEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AGREEMENTS;
  }
}

export function saveStoredAgreements(items: AuthorAgreementItem[]) {
  localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(items));
}

export function saveAgreementItem(item: Partial<AuthorAgreementItem>): AuthorAgreementItem {
  const list = getStoredAgreements();
  if (item.id) {
    const idx = list.findIndex((a) => a.id === item.id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...item } as AuthorAgreementItem;
      list[idx] = updated;
      saveStoredAgreements(list);
      return updated;
    }
  }

  const year = new Date().getFullYear();
  const nextNum = list.length + 1;
  const agreementNumber = item.agreementNumber || `AGR/${year}/${String(nextNum).padStart(4, '0')}`;

  const created: AuthorAgreementItem = {
    id: 'agr_' + Date.now(),
    agreementNumber,
    authorName: item.authorName || 'Unnamed Author',
    authorPan: (item.authorPan || '').toUpperCase(),
    authorEmail: item.authorEmail || '',
    calculationMethod: item.calculationMethod || 'PERCENTAGE_OF_MRP',
    royaltyPercentage: Number(item.royaltyPercentage) || 0,
    fixedRatePerCopy: Number(item.fixedRatePerCopy) || 0,
    advanceRoyaltyAmount: Number(item.advanceRoyaltyAmount) || 0,
    advanceBalanceRemaining: Number(item.advanceRoyaltyAmount) || 0,
    minimumGuarantee: Number(item.minimumGuarantee) || 0,
    paymentFrequency: item.paymentFrequency || 'QUARTERLY',
    status: item.status || 'ACTIVE',
    bankName: item.bankName || 'HDFC Bank Ltd.',
    bankAccountNumber: item.bankAccountNumber || '',
    bankIfsc: (item.bankIfsc || '').toUpperCase(),
    bookTitles: item.bookTitles && item.bookTitles.length ? item.bookTitles : ['Commissioned Work'],
    notes: item.notes || '',
  };

  const updated = [created, ...list];
  saveStoredAgreements(updated);

  // If initial advance is > 0, also register an advance ledger item
  if (created.advanceRoyaltyAmount > 0) {
    issueAdvanceRoyalty({
      agreementId: created.id,
      agreementNumber: created.agreementNumber,
      authorName: created.authorName,
      initialAdvanceAmount: created.advanceRoyaltyAmount,
      bankName: created.bankName,
      bankAccountNumber: created.bankAccountNumber,
      notes: `Initial advance recorded on contract execution: ${created.agreementNumber}`,
    });
  }

  return created;
}

export function deleteAgreementItem(id: string): boolean {
  const list = getStoredAgreements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length !== list.length) {
    saveStoredAgreements(filtered);
    return true;
  }
  return false;
}

export function getStoredCalculations(): RoyaltyCalculationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALCULATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(INITIAL_CALCULATIONS));
      return INITIAL_CALCULATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CALCULATIONS;
  }
}

export function saveStoredCalculations(items: RoyaltyCalculationItem[]) {
  localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(items));
}

export function saveCalculationRun(data: {
  agreementId: string;
  periodName: string;
  grossCopiesSold: number;
  copiesReturned: number;
  bookTitle?: string;
  mrp?: number;
  notes?: string;
}): RoyaltyCalculationItem {
  const agreements = getStoredAgreements();
  const agreement = agreements.find((a) => a.id === data.agreementId);
  if (!agreement) {
    throw new Error('Author agreement not found');
  }

  const calculations = getStoredCalculations();
  const year = new Date().getFullYear();
  const nextNum = calculations.length + 1;
  const calculationNumber = `RCAL/${year}/${String(nextNum).padStart(4, '0')}`;

  const grossSold = Math.max(0, Number(data.grossCopiesSold) || 0);
  const returns = Math.max(0, Number(data.copiesReturned) || 0);
  const netCopies = Math.max(0, grossSold - returns);
  const mrp = Number(data.mrp) || 450;

  let grossRoyalty = 0;
  if (agreement.calculationMethod === 'PERCENTAGE_OF_MRP') {
    grossRoyalty = Math.round((netCopies * mrp * (agreement.royaltyPercentage / 100)) * 100) / 100;
  } else if (agreement.calculationMethod === 'PERCENTAGE_OF_NET_SALES') {
    // Net sales after ~40% trade discount
    const netSaleValue = netCopies * mrp * 0.60;
    grossRoyalty = Math.round((netSaleValue * (agreement.royaltyPercentage / 100)) * 100) / 100;
  } else if (agreement.calculationMethod === 'FIXED_AMOUNT_PER_COPY') {
    grossRoyalty = Math.round((netCopies * agreement.fixedRatePerCopy) * 100) / 100;
  } else if (agreement.calculationMethod === 'SLAB_BASED') {
    // Slabs: 0-2000 @ 7.5%, 2001-5000 @ 10%, >5000 @ 12.5%
    if (netCopies <= 2000) {
      grossRoyalty = netCopies * mrp * 0.075;
    } else if (netCopies <= 5000) {
      grossRoyalty = 2000 * mrp * 0.075 + (netCopies - 2000) * mrp * 0.10;
    } else {
      grossRoyalty = 2000 * mrp * 0.075 + 3000 * mrp * 0.10 + (netCopies - 5000) * mrp * 0.125;
    }
    grossRoyalty = Math.round(grossRoyalty * 100) / 100;
  }

  // Minimum Guarantee check
  let mgTopup = 0;
  if (agreement.minimumGuarantee > 0 && grossRoyalty < agreement.minimumGuarantee) {
    mgTopup = Math.round((agreement.minimumGuarantee - grossRoyalty) * 100) / 100;
  }

  const totalEarnedBeforeDeductions = grossRoyalty + mgTopup;

  // Advance recoupment calculation
  let advanceRecouped = 0;
  if (agreement.advanceBalanceRemaining > 0 && totalEarnedBeforeDeductions > 0) {
    advanceRecouped = Math.min(agreement.advanceBalanceRemaining, totalEarnedBeforeDeductions);
    advanceRecouped = Math.round(advanceRecouped * 100) / 100;
  }

  // TDS Calculation (Section 194J - 10% standard rate if PAN is valid, else 20% Section 206AA rate)
  const isPanValid = agreement.authorPan && agreement.authorPan.length === 10;
  const tdsRate = isPanValid ? 10.0 : 20.0;
  const tdsAmount = Math.round((totalEarnedBeforeDeductions * (tdsRate / 100)) * 100) / 100;

  const netPayable = Math.max(0, Math.round((totalEarnedBeforeDeductions - advanceRecouped - tdsAmount) * 100) / 100);

  // Post Double-Entry Journal Voucher in General Ledger for Royalty Accrual
  let voucherNum = `RA/${year}/${String(nextNum + 800).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'ROYALTY_ACCRUAL',
      date: new Date().toISOString().slice(0, 10),
      narration: `Quarterly Author Royalty Accrual for ${agreement.authorName} (${data.periodName}) - Net Copies: ${netCopies}`,
      totalAmount: totalEarnedBeforeDeductions,
      branchName: 'Headquarters & Publishing Division',
      createdByName: 'Royalty & Contracts Manager',
      items: [
        {
          id: '1',
          ledgerId: 'led_royalty_exp',
          ledgerName: 'Author Royalty Expenses',
          ledgerCode: '4050',
          costCentreName: 'Editorial & Content Development',
          debitAmount: totalEarnedBeforeDeductions,
          creditAmount: 0,
          description: `Gross author royalty earned by ${agreement.authorName}`,
        },
        ...(advanceRecouped > 0
          ? [
              {
                id: '2',
                ledgerId: 'led_author_advances',
                ledgerName: 'Unadjusted Advances to Authors',
                ledgerCode: '1050',
                debitAmount: 0,
                creditAmount: advanceRecouped,
                description: `Recoupment of upfront advance from ${agreement.authorName}`,
              },
            ]
          : []),
        {
          id: '3',
          ledgerId: 'led_tds_payable',
          ledgerName: 'TDS Payable (Sec 194J on Royalties)',
          ledgerCode: '2020',
          debitAmount: 0,
          creditAmount: tdsAmount,
          description: `10% TDS withheld on author royalty u/s 194J (${agreement.authorPan})`,
        },
        {
          id: '4',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors - Authors & Royalty Payable',
          ledgerCode: '2001',
          debitAmount: 0,
          creditAmount: netPayable,
          description: `Net royalty payable to ${agreement.authorName}`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNum = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for royalty accrual:', err);
  }

  // Update Agreement Advance Balance
  if (advanceRecouped > 0) {
    agreement.advanceBalanceRemaining = Math.max(0, agreement.advanceBalanceRemaining - advanceRecouped);
    saveStoredAgreements(agreements);

    // Update Advance Ledger
    const advances = getStoredAdvances();
    const adv = advances.find((a) => a.agreementNumber === agreement.agreementNumber && a.status === 'RECOUPING');
    if (adv) {
      adv.totalRecoupedToDate = Math.round((adv.totalRecoupedToDate + advanceRecouped) * 100) / 100;
      adv.unamortizedBalance = Math.max(0, Math.round((adv.initialAdvanceAmount - adv.totalRecoupedToDate) * 100) / 100);
      adv.recoveryPercentage = Math.min(100, Math.round((adv.totalRecoupedToDate / adv.initialAdvanceAmount) * 100));
      if (adv.unamortizedBalance === 0) {
        adv.status = 'FULLY_RECOUPED';
      }
      saveStoredAdvances(advances);
    }
  }

  const created: RoyaltyCalculationItem = {
    id: 'calc_' + Date.now(),
    calculationNumber,
    periodName: data.periodName,
    agreementId: agreement.id,
    agreementNumber: agreement.agreementNumber,
    authorName: agreement.authorName,
    authorPan: agreement.authorPan,
    bookTitle: data.bookTitle || (agreement.bookTitles[0] || 'Academic Work'),
    calculationDate: new Date().toISOString().slice(0, 10),
    calculationMethod: agreement.calculationMethod,
    grossCopiesSold: grossSold,
    copiesReturned: returns,
    eligibleNetCopies: netCopies,
    mrp,
    grossRoyaltyAmount: grossRoyalty,
    minimumGuaranteeTopup: mgTopup,
    advanceRecovered: advanceRecouped,
    tdsRate,
    tdsAmount,
    netPayableAmount: netPayable,
    status: 'APPROVED',
    voucherNumber: voucherNum,
    notes: data.notes || '',
  };

  const updatedCalcs = [created, ...calculations];
  saveStoredCalculations(updatedCalcs);
  return created;
}

export function deleteCalculationRun(id: string): boolean {
  const list = getStoredCalculations();
  const filtered = list.filter((c) => c.id !== id);
  if (filtered.length !== list.length) {
    saveStoredCalculations(filtered);
    return true;
  }
  return false;
}

export function getStoredAdvances(): AdvanceLedgerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADVANCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(INITIAL_ADVANCES));
      return INITIAL_ADVANCES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADVANCES;
  }
}

export function saveStoredAdvances(items: AdvanceLedgerItem[]) {
  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(items));
}

export function issueAdvanceRoyalty(data: {
  agreementId?: string;
  agreementNumber: string;
  authorName: string;
  initialAdvanceAmount: number;
  bankName?: string;
  bankAccountNumber?: string;
  transactionRef?: string;
  notes?: string;
}): AdvanceLedgerItem {
  const advances = getStoredAdvances();
  const year = new Date().getFullYear();
  const nextNum = advances.length + 1;
  const advanceNumber = `ADV/${year}/${String(nextNum).padStart(4, '0')}`;
  const amount = Number(data.initialAdvanceAmount) || 0;

  // Post Payment Voucher in GL: Debit Author Advances (Asset 1050), Credit Bank (Asset 1002)
  let voucherNum = `PV/${year}/${String(nextNum + 400).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'PAYMENT_VOUCHER',
      date: new Date().toISOString().slice(0, 10),
      narration: `Author Upfront Advance Payment to ${data.authorName} against ${data.agreementNumber}`,
      totalAmount: amount,
      branchName: 'Headquarters & Publishing Division',
      createdByName: 'Treasury & Royalty Disbursement',
      items: [
        {
          id: '1',
          ledgerId: 'led_author_advances',
          ledgerName: 'Unadjusted Advances to Authors',
          ledgerCode: '1050',
          debitAmount: amount,
          creditAmount: 0,
          description: `Disbursed advance to ${data.authorName}`,
        },
        {
          id: '2',
          ledgerId: 'led_bank_hdfc',
          ledgerName: 'HDFC Bank Corporate Current A/c',
          ledgerCode: '1002',
          debitAmount: 0,
          creditAmount: amount,
          description: `NEFT Outward Remittance Ref: ${data.transactionRef || 'NEFT-' + Date.now()}`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNum = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for advance payout:', err);
  }

  const created: AdvanceLedgerItem = {
    id: 'adv_' + Date.now(),
    advanceNumber,
    agreementId: data.agreementId,
    agreementNumber: data.agreementNumber,
    authorName: data.authorName,
    advanceDate: new Date().toISOString().slice(0, 10),
    initialAdvanceAmount: amount,
    totalRecoupedToDate: 0,
    unamortizedBalance: amount,
    recoveryPercentage: 0,
    bankName: data.bankName || 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: data.bankAccountNumber || '',
    transactionRef: data.transactionRef || `NEFT-ADV-${Date.now().toString().slice(-6)}`,
    voucherNumber: voucherNum,
    status: 'RECOUPING',
    notes: data.notes || '',
  };

  const updated = [created, ...advances];
  saveStoredAdvances(updated);

  // Also update Agreement advance balance if exists
  if (data.agreementNumber) {
    const agreements = getStoredAgreements();
    const target = agreements.find((a) => a.agreementNumber === data.agreementNumber);
    if (target) {
      target.advanceRoyaltyAmount = (target.advanceRoyaltyAmount || 0) + amount;
      target.advanceBalanceRemaining = (target.advanceBalanceRemaining || 0) + amount;
      saveStoredAgreements(agreements);
    }
  }

  return created;
}

export function getStoredSettlements(): RoyaltySettlementItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
      return INITIAL_SETTLEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTLEMENTS;
  }
}

export function saveStoredSettlements(items: RoyaltySettlementItem[]) {
  localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(items));
}

export function settleRoyaltyPayment(data: {
  calculationId: string;
  paymentMethod: 'NEFT' | 'RTGS' | 'CHEQUE' | 'UPI';
  bankName: string;
  bankAccountNumber: string;
  transactionRef: string;
}): RoyaltySettlementItem {
  const calculations = getStoredCalculations();
  const calc = calculations.find((c) => c.id === data.calculationId);
  if (!calc) {
    throw new Error('Royalty calculation record not found');
  }

  const settlements = getStoredSettlements();
  const year = new Date().getFullYear();
  const nextNum = settlements.length + 1;
  const settlementNumber = `ROYS/${year}/${String(nextNum).padStart(4, '0')}`;

  // Post Double-Entry Payment Voucher in GL: Debit Trade Creditors / Royalty Payable, Credit Bank
  let voucherNum = `PV/${year}/${String(nextNum + 770).padStart(4, '0')}`;
  try {
    const posted = postDoubleEntryVoucher({
      voucherType: 'PAYMENT_VOUCHER',
      date: new Date().toISOString().slice(0, 10),
      narration: `Net Royalty Bank Settlement to ${calc.authorName} (${calc.periodName}) - Ref: ${data.transactionRef}`,
      totalAmount: calc.netPayableAmount,
      branchName: 'Headquarters & Publishing Division',
      createdByName: 'Treasury & Royalty Disbursement',
      items: [
        {
          id: '1',
          ledgerId: 'led_creditors',
          ledgerName: 'Trade Creditors - Authors & Royalty Payable',
          ledgerCode: '2001',
          debitAmount: calc.netPayableAmount,
          creditAmount: 0,
          description: `Settlement of net royalty payable to ${calc.authorName}`,
        },
        {
          id: '2',
          ledgerId: 'led_bank_hdfc',
          ledgerName: 'HDFC Bank Corporate Current A/c',
          ledgerCode: '1002',
          debitAmount: 0,
          creditAmount: calc.netPayableAmount,
          description: `${data.paymentMethod} Remittance to A/c ${data.bankAccountNumber} (${data.bankName}) Ref: ${data.transactionRef}`,
        },
      ],
    });
    if (posted?.voucherNumber) {
      voucherNum = posted.voucherNumber;
    }
  } catch (err) {
    console.warn('Could not post auto GL voucher for royalty settlement:', err);
  }

  // Mark calculation as PAID
  calc.status = 'PAID';
  calc.voucherNumber = voucherNum;
  saveStoredCalculations(calculations);

  const created: RoyaltySettlementItem = {
    id: 'roys_' + Date.now(),
    settlementNumber,
    calculationId: calc.id,
    agreementNumber: calc.agreementNumber,
    authorName: calc.authorName,
    authorPan: calc.authorPan,
    periodName: calc.periodName,
    settlementDate: new Date().toISOString().slice(0, 10),
    grossAmount: calc.grossRoyaltyAmount + calc.minimumGuaranteeTopup,
    advanceRecouped: calc.advanceRecovered,
    tdsAmount: calc.tdsAmount,
    netPaidAmount: calc.netPayableAmount,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName,
    bankAccountNumber: data.bankAccountNumber,
    transactionRef: data.transactionRef,
    voucherNumber: voucherNum,
    status: 'POSTED',
  };

  const updatedSettlements = [created, ...settlements];
  saveStoredSettlements(updatedSettlements);
  return created;
}

// Compute dynamic KPI metrics
export function computeRoyaltyKpis() {
  const agreements = getStoredAgreements();
  const calculations = getStoredCalculations();
  const advances = getStoredAdvances();
  const settlements = getStoredSettlements();

  const totalAuthors = agreements.length;
  const panCompliantCount = agreements.filter((a) => a.authorPan && a.authorPan.length === 10).length;
  const panComplianceRate = totalAuthors > 0 ? Math.round((panCompliantCount / totalAuthors) * 100) : 100;

  const totalGrossAccrued = calculations.reduce(
    (sum, c) => sum + (c.grossRoyaltyAmount + c.minimumGuaranteeTopup),
    0
  );
  const totalNetCopiesSold = calculations.reduce((sum, c) => sum + c.eligibleNetCopies, 0);

  const totalAdvancesRecouped = calculations.reduce((sum, c) => sum + c.advanceRecovered, 0);
  const totalAdvancesRemaining = advances.reduce((sum, a) => sum + a.unamortizedBalance, 0);

  const totalTdsWithheld = calculations.reduce((sum, c) => sum + c.tdsAmount, 0);
  const totalNetPaid = settlements.reduce((sum, s) => sum + s.netPaidAmount, 0);

  return {
    totalAuthors,
    panCompliantCount,
    panComplianceRate,
    totalGrossAccrued,
    totalNetCopiesSold,
    totalAdvancesRecouped,
    totalAdvancesRemaining,
    totalTdsWithheld,
    totalNetPaid,
  };
}
