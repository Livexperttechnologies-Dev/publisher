import {
  LedgerItem,
  getStoredLedgers,
  saveStoredLedgers,
  saveLedgerItem,
  getStatementsMap,
  saveStatementsMap,
  StatementEntry,
} from './accountingService';

export interface VoucherLineItem {
  id: string;
  ledgerId: string;
  ledgerName: string;
  ledgerCode: string;
  costCentreName?: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface VoucherRecord {
  id: string;
  voucherNumber: string;
  voucherType:
    | 'JOURNAL'
    | 'PAYMENT_VOUCHER'
    | 'RECEIPT_VOUCHER'
    | 'CONTRA_VOUCHER'
    | 'DEBIT_NOTE'
    | 'CREDIT_NOTE'
    | 'SALES_INVOICE'
    | 'PURCHASE_BILL'
    | 'ROYALTY_ACCRUAL';
  date: string;
  narration: string;
  totalAmount: number;
  status: 'POSTED' | 'REVERSED';
  isReversal: boolean;
  reversedFromId?: string;
  reversalReason?: string;
  branchName: string;
  createdByName: string;
  items: VoucherLineItem[];
}

export const INITIAL_VOUCHERS: VoucherRecord[] = [
  {
    id: 'vch_contra_01',
    voucherNumber: 'CV/2026/0001',
    voucherType: 'CONTRA_VOUCHER',
    date: '2026-11-03',
    narration: 'Cash deposit from central depot cash chest into HDFC Bank Corporate A/c',
    totalAmount: 200000,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Central Cashier',
    items: [
      { id: '1', ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank Corporate Current A/c', ledgerCode: '1002', debitAmount: 200000, creditAmount: 0 },
      { id: '2', ledgerId: 'led_cash', ledgerName: 'Cash in Hand (Central Cashier)', ledgerCode: '1001', debitAmount: 0, creditAmount: 200000 },
    ],
  },
  {
    id: 'vch_sales_01',
    voucherNumber: 'SV/2026/0001',
    voucherType: 'SALES_INVOICE',
    date: '2026-11-04',
    narration: 'Wholesale sales of Class 12 Mathematics Complete Sets against Dispatch #DISP-9921',
    totalAmount: 590000,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Billing Desk',
    items: [
      { id: '3', ledgerId: 'led_debtors', ledgerName: 'Trade Debtors - Wholesale & Retail Distributors', ledgerCode: '1010', costCentreName: 'Wholesale Trade & Distribution Sales', debitAmount: 590000, creditAmount: 0 },
      { id: '4', ledgerId: 'led_book_sales', ledgerName: 'Book Sales - Academic & School Textbooks', ledgerCode: '3001', costCentreName: 'Wholesale Trade & Distribution Sales', debitAmount: 0, creditAmount: 590000 },
    ],
  },
  {
    id: 'vch_purch_01',
    voucherNumber: 'PB/2026/0001',
    voucherType: 'PURCHASE_BILL',
    date: '2026-11-03',
    narration: 'Purchase of 70 GSM Super Maplitho Cream Paper Reels (Bill #BILT/INV/4412)',
    totalAmount: 350000,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Procurement Officer',
    items: [
      { id: '5', ledgerId: 'led_paper_purchase', ledgerName: 'Paper Reel & Printing Materials Purchase', ledgerCode: '4001', costCentreName: 'Book Printing & Pre-Press Production', debitAmount: 350000, creditAmount: 0 },
      { id: '6', ledgerId: 'led_creditors', ledgerName: 'Trade Creditors - Paper Mills & Printers', ledgerCode: '2001', debitAmount: 0, creditAmount: 350000 },
    ],
  },
  {
    id: 'vch_pay_01',
    voucherNumber: 'PV/2026/0001',
    voucherType: 'PAYMENT_VOUCHER',
    date: '2026-11-04',
    narration: 'NEFT settlement to Ballarpur Paper Mills against Bill #BILT/INV/4412',
    totalAmount: 350000,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Accounts Head',
    items: [
      { id: '7', ledgerId: 'led_creditors', ledgerName: 'Trade Creditors - Paper Mills & Printers', ledgerCode: '2001', debitAmount: 350000, creditAmount: 0 },
      { id: '8', ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank Corporate Current A/c', ledgerCode: '1002', debitAmount: 0, creditAmount: 350000 },
    ],
  },
  {
    id: 'vch_rec_01',
    voucherNumber: 'RV/2026/0001',
    voucherType: 'RECEIPT_VOUCHER',
    date: '2026-11-05',
    narration: 'RTGS clearance from National Book Distributors against Inv #SV/2026/0001',
    totalAmount: 342500,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Senior Accountant',
    items: [
      { id: '9', ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank Corporate Current A/c', ledgerCode: '1002', debitAmount: 342500, creditAmount: 0 },
      { id: '10', ledgerId: 'led_debtors', ledgerName: 'Trade Debtors - Wholesale & Retail Distributors', ledgerCode: '1010', debitAmount: 0, creditAmount: 342500 },
    ],
  },
  {
    id: 'vch_jv_01',
    voucherNumber: 'JV/2026/0001',
    voucherType: 'ROYALTY_ACCRUAL',
    date: '2026-11-02',
    narration: 'Author Royalty Accrual for Prof. R. K. Sharma net of 10% TDS and Advance offset',
    totalAmount: 100000,
    status: 'POSTED',
    isReversal: false,
    branchName: 'Headquarters & Central Depot',
    createdByName: 'Royalty Manager',
    items: [
      { id: '11', ledgerId: 'led_royalty_exp', ledgerName: 'Author Royalty Expenses', ledgerCode: '4050', costCentreName: 'Author Contracts & Editorial Desk', debitAmount: 100000, creditAmount: 0 },
      { id: '12', ledgerId: 'led_tds_payable', ledgerName: 'TDS Payable (Sec 194J on Royalties)', ledgerCode: '2020', debitAmount: 0, creditAmount: 10000 },
      { id: '13', ledgerId: 'led_author_advances', ledgerName: 'Unadjusted Advances to Authors', ledgerCode: '1050', debitAmount: 0, creditAmount: 90000 },
    ],
  },
];

const VOUCHERS_KEY = 'kibo360_vouchers_v2';

export function getStoredVouchers(): VoucherRecord[] {
  try {
    const raw = localStorage.getItem(VOUCHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredVouchers(INITIAL_VOUCHERS);
  return INITIAL_VOUCHERS;
}

export function saveStoredVouchers(vouchers: VoucherRecord[]): void {
  try {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
  } catch {}
}

export function getNextVoucherNumber(voucherType: VoucherRecord['voucherType'], dateStr: string): string {
  const prefixMap: Record<string, string> = {
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
  const prefix = prefixMap[voucherType] || 'VCH';
  const year = new Date(dateStr || new Date()).getFullYear();
  const existing = getStoredVouchers();
  const count = existing.filter((v) => v.voucherType === voucherType).length + 1;
  return `${prefix}/${year}/${String(count).padStart(4, '0')}`;
}

export function postDoubleEntryVoucher(
  voucherData: Omit<VoucherRecord, 'id' | 'voucherNumber' | 'status' | 'isReversal'>
): VoucherRecord {
  const vouchers = getStoredVouchers();
  const voucherNumber = getNextVoucherNumber(voucherData.voucherType, voucherData.date);

  const createdVoucher: VoucherRecord = {
    ...voucherData,
    id: 'vch_' + Date.now(),
    voucherNumber,
    status: 'POSTED',
    isReversal: false,
  };

  // Update Ledgers Balances & Record Statement Entries
  const ledgers = getStoredLedgers();
  const statementsMap = getStatementsMap();

  voucherData.items.forEach((item) => {
    const targetLedgerIndex = ledgers.findIndex((l) => l.id === item.ledgerId);
    if (targetLedgerIndex >= 0) {
      const ledger = ledgers[targetLedgerIndex];
      const isDebitNormal = ledger.isDebitBalance;
      
      // Calculate change
      let delta = 0;
      if (isDebitNormal) {
        delta = item.debitAmount - item.creditAmount;
      } else {
        delta = item.creditAmount - item.debitAmount;
      }

      const updatedBalance = Math.round((ledger.currentBalance + delta) * 100) / 100;
      ledgers[targetLedgerIndex] = {
        ...ledger,
        currentBalance: updatedBalance,
      };

      // Append to Statement
      const list = statementsMap[ledger.id] || [];
      const opposingItem = voucherData.items.find((i) => i.ledgerId !== item.ledgerId);
      
      const statementEntry: StatementEntry = {
        id: 'stmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ledgerId: ledger.id,
        date: voucherData.date,
        voucherNumber,
        voucherType: mapVoucherTypeToStatementType(voucherData.voucherType),
        narration: voucherData.narration,
        opposingLedgerName: opposingItem ? opposingItem.ledgerName : undefined,
        costCentreName: item.costCentreName,
        debit: item.debitAmount,
        credit: item.creditAmount,
        runningBalance: Math.abs(updatedBalance),
        isDebit: updatedBalance >= 0 ? isDebitNormal : !isDebitNormal,
      };

      statementsMap[ledger.id] = [...list, statementEntry];
    }
  });

  // Save everything atomically
  saveStoredLedgers(ledgers);
  saveStatementsMap(statementsMap);
  saveStoredVouchers([createdVoucher, ...vouchers]);

  return createdVoucher;
}

export function reversePostedVoucher(voucherId: string, reason: string): { original: VoucherRecord; reversal: VoucherRecord } | null {
  const vouchers = getStoredVouchers();
  const targetIndex = vouchers.findIndex((v) => v.id === voucherId);
  if (targetIndex < 0) return null;

  const original = vouchers[targetIndex];
  if (original.status === 'REVERSED') return null;

  // Mark original as REVERSED
  const updatedOriginal: VoucherRecord = {
    ...original,
    status: 'REVERSED',
    reversalReason: reason,
  };

  const year = new Date().getFullYear();
  const revCount = vouchers.filter((v) => v.isReversal).length + 1;
  const reversalVoucherNumber = `REV/${year}/${String(revCount).padStart(4, '0')}`;

  // Invert lines: debits become credits, credits become debits
  const invertedItems: VoucherLineItem[] = original.items.map((i, idx) => ({
    ...i,
    id: 'rev_itm_' + Date.now() + '_' + idx,
    debitAmount: i.creditAmount,
    creditAmount: i.debitAmount,
  }));

  const reversalVoucher: VoucherRecord = {
    id: 'vch_rev_' + Date.now(),
    voucherNumber: reversalVoucherNumber,
    voucherType: original.voucherType,
    date: new Date().toISOString().slice(0, 10),
    narration: `REVERSAL of ${original.voucherNumber} - Audit Reason: ${reason}`,
    totalAmount: original.totalAmount,
    status: 'POSTED',
    isReversal: true,
    reversedFromId: original.id,
    branchName: original.branchName,
    createdByName: 'Senior Auditor / Controller',
    items: invertedItems,
  };

  // Invert balances in ledgers and statements
  const ledgers = getStoredLedgers();
  const statementsMap = getStatementsMap();

  invertedItems.forEach((item) => {
    const targetLedgerIndex = ledgers.findIndex((l) => l.id === item.ledgerId);
    if (targetLedgerIndex >= 0) {
      const ledger = ledgers[targetLedgerIndex];
      const isDebitNormal = ledger.isDebitBalance;

      let delta = 0;
      if (isDebitNormal) {
        delta = item.debitAmount - item.creditAmount;
      } else {
        delta = item.creditAmount - item.debitAmount;
      }

      const updatedBalance = Math.round((ledger.currentBalance + delta) * 100) / 100;
      ledgers[targetLedgerIndex] = {
        ...ledger,
        currentBalance: updatedBalance,
      };

      const list = statementsMap[ledger.id] || [];
      const opposingItem = invertedItems.find((i) => i.ledgerId !== item.ledgerId);

      const statementEntry: StatementEntry = {
        id: 'stmt_rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ledgerId: ledger.id,
        date: reversalVoucher.date,
        voucherNumber: reversalVoucherNumber,
        voucherType: 'JOURNAL',
        narration: reversalVoucher.narration,
        opposingLedgerName: opposingItem ? opposingItem.ledgerName : undefined,
        costCentreName: item.costCentreName,
        debit: item.debitAmount,
        credit: item.creditAmount,
        runningBalance: Math.abs(updatedBalance),
        isDebit: updatedBalance >= 0 ? isDebitNormal : !isDebitNormal,
      };

      statementsMap[ledger.id] = [...list, statementEntry];
    }
  });

  saveStoredLedgers(ledgers);
  saveStatementsMap(statementsMap);

  const updatedVouchers = [
    reversalVoucher,
    ...vouchers.map((v) => (v.id === original.id ? updatedOriginal : v)),
  ];
  saveStoredVouchers(updatedVouchers);

  return { original: updatedOriginal, reversal: reversalVoucher };
}

export function resetVouchersToDefault(): void {
  saveStoredVouchers(INITIAL_VOUCHERS);
}

function mapVoucherTypeToStatementType(type: VoucherRecord['voucherType']): StatementEntry['voucherType'] {
  switch (type) {
    case 'CONTRA_VOUCHER':
      return 'CONTRA';
    case 'PAYMENT_VOUCHER':
      return 'PAYMENT';
    case 'RECEIPT_VOUCHER':
      return 'RECEIPT';
    case 'SALES_INVOICE':
      return 'SALES';
    case 'PURCHASE_BILL':
      return 'PURCHASE';
    case 'ROYALTY_ACCRUAL':
      return 'ROYALTY';
    default:
      return 'JOURNAL';
  }
}
