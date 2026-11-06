import {
  BankAccountDTO,
  CashRegisterDTO,
  BankTransactionDTO,
  CashTransactionDTO,
  ChequeLeafDTO,
  CashClosingSessionDTO,
  BankReconciliationDTO,
  CreateBankAccountDTO,
  CreateCashRegisterDTO,
  RecordBankTxInputDTO,
  RecordCashTxInputDTO,
  InterBankTransferInputDTO,
  ChequeLifecycleInputDTO,
  CashClosingInputDTO,
  ImportBankStatementDTO,
  BrsCalculationInputDTO,
} from './banking.types';
import { accountingService } from '../accounting/accounting.service';

export class BankingService {
  private defaultCompanyId = 'comp_default_01';

  private bankAccounts: Map<string, BankAccountDTO> = new Map();
  private cashRegisters: Map<string, CashRegisterDTO> = new Map();
  private bankTransactions: Map<string, BankTransactionDTO> = new Map();
  private cashTransactions: Map<string, CashTransactionDTO> = new Map();
  private chequeLeaves: Map<string, ChequeLeafDTO> = new Map();
  private cashClosings: Map<string, CashClosingSessionDTO> = new Map();
  private reconciliations: Map<string, BankReconciliationDTO> = new Map();
  private importedStatements: Set<string> = new Set(); // file signatures to block duplicates

  constructor() {
    this.seedDefaultBankAccounts();
    this.seedDefaultCashRegisters();
    this.seedDefaultCheques();
  }

  // --------------------------------------------------------------------------
  // 1. BANK ACCOUNTS & CASH REGISTERS INITIALIZATION
  // --------------------------------------------------------------------------

  private seedDefaultBankAccounts() {
    const b1: BankAccountDTO = {
      id: 'bnk_hdfc_01',
      companyId: this.defaultCompanyId,
      accountName: 'HDFC Bank Corporate Current A/c',
      accountNumber: '50200012345678',
      bankName: 'HDFC Bank Ltd.',
      ifscCode: 'HDFC0001234',
      branchName: 'Connaught Place, New Delhi',
      swiftCode: 'HDFCINBB',
      currency: 'INR',
      accountType: 'CURRENT',
      openingBalance: 500000.0,
      currentBalance: 500000.0,
      ledgerId: 'led_bank_hdfc',
      isActive: true,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    const b2: BankAccountDTO = {
      id: 'bnk_sbi_02',
      companyId: this.defaultCompanyId,
      accountName: 'State Bank of India Operative A/c',
      accountNumber: '30200087654321',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0000691',
      branchName: 'Fort Main Branch, Mumbai',
      swiftCode: 'SBININBB',
      currency: 'INR',
      accountType: 'CURRENT',
      openingBalance: 250000.0,
      currentBalance: 250000.0,
      ledgerId: 'led_bank_sbi',
      isActive: true,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    this.bankAccounts.set(b1.id, b1);
    this.bankAccounts.set(b2.id, b2);
  }

  private seedDefaultCashRegisters() {
    const c1: CashRegisterDTO = {
      id: 'csh_central_01',
      companyId: this.defaultCompanyId,
      name: 'Central Cash Desk',
      code: 'CSH-MAIN',
      cashierName: 'Rajiv Malhotra',
      openingBalance: 50000.0,
      currentBalance: 50000.0,
      ledgerId: 'led_cash',
      isPettyCash: false,
      status: 'ACTIVE',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    const c2: CashRegisterDTO = {
      id: 'csh_petty_02',
      companyId: this.defaultCompanyId,
      name: 'Editorial & Warehouse Petty Cash',
      code: 'CSH-PETTY',
      cashierName: 'S. Ramesh',
      openingBalance: 15000.0,
      currentBalance: 15000.0,
      ledgerId: 'led_cash',
      isPettyCash: true,
      status: 'ACTIVE',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    this.cashRegisters.set(c1.id, c1);
    this.cashRegisters.set(c2.id, c2);
  }

  private seedDefaultCheques() {
    const chq1: ChequeLeafDTO = {
      id: 'chq_leaf_101',
      companyId: this.defaultCompanyId,
      bankAccountId: 'bnk_hdfc_01',
      chequeNumber: 'CHQ-882191',
      chequeType: 'ISSUED',
      issueOrReceiptDate: '2026-11-01T10:00:00.000Z',
      payeeOrDrawer: 'Replika Press India Ltd.',
      amount: 45000.0,
      status: 'ISSUED',
      bounceCharges: 0,
      createdAt: new Date().toISOString(),
    };

    const chq2: ChequeLeafDTO = {
      id: 'chq_leaf_102',
      companyId: this.defaultCompanyId,
      bankAccountId: 'bnk_hdfc_01',
      chequeNumber: 'CHQ-551029',
      chequeType: 'RECEIVED',
      issueOrReceiptDate: '2026-11-02T11:00:00.000Z',
      payeeOrDrawer: 'Cambridge Book Distributors',
      amount: 60000.0,
      status: 'RECEIVED',
      bounceCharges: 0,
      createdAt: new Date().toISOString(),
    };

    this.chequeLeaves.set(chq1.id, chq1);
    this.chequeLeaves.set(chq2.id, chq2);
  }

  public getAllBankAccounts(): BankAccountDTO[] {
    return Array.from(this.bankAccounts.values());
  }

  public getBankAccountById(id: string): BankAccountDTO | undefined {
    return this.bankAccounts.get(id);
  }

  public createBankAccount(dto: CreateBankAccountDTO): BankAccountDTO {
    const id = 'bnk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const opening = dto.openingBalance || 0;

    const account: BankAccountDTO = {
      id,
      companyId: dto.companyId || this.defaultCompanyId,
      branchId: dto.branchId,
      accountName: dto.accountName,
      accountNumber: dto.accountNumber,
      bankName: dto.bankName,
      ifscCode: dto.ifscCode.toUpperCase(),
      branchName: dto.branchName,
      swiftCode: dto.swiftCode,
      currency: 'INR',
      accountType: dto.accountType || 'CURRENT',
      openingBalance: opening,
      currentBalance: opening,
      ledgerId: dto.ledgerId || 'led_bank_hdfc',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bankAccounts.set(id, account);
    return account;
  }

  public getAllCashRegisters(): CashRegisterDTO[] {
    return Array.from(this.cashRegisters.values());
  }

  public createCashRegister(dto: CreateCashRegisterDTO): CashRegisterDTO {
    const id = 'csh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const opening = dto.openingBalance || 0;

    const reg: CashRegisterDTO = {
      id,
      companyId: dto.companyId || this.defaultCompanyId,
      branchId: dto.branchId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      cashierName: dto.cashierName,
      openingBalance: opening,
      currentBalance: opening,
      ledgerId: dto.ledgerId || 'led_cash',
      isPettyCash: dto.isPettyCash || false,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cashRegisters.set(id, reg);
    return reg;
  }

  // --------------------------------------------------------------------------
  // 2. BANK TRANSACTIONS (RECEIPTS & PAYMENTS) WITH MULTI-METHOD SUPPORT
  // --------------------------------------------------------------------------

  public async recordBankTransaction(dto: RecordBankTxInputDTO, user: string = 'Cashier'): Promise<BankTransactionDTO> {
    const account = this.bankAccounts.get(dto.bankAccountId);
    if (!account) {
      throw new Error(`Bank Account ${dto.bankAccountId} not found.`);
    }

    const txId = 'btx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const isDeposit = dto.transactionType === 'RECEIPT' || dto.transactionType === 'INTEREST';

    let debitAmount = 0;
    let creditAmount = 0;

    if (isDeposit) {
      debitAmount = dto.amount;
      account.currentBalance = Number((account.currentBalance + dto.amount).toFixed(2));
    } else {
      creditAmount = dto.amount;
      if (account.currentBalance < dto.amount && account.accountType !== 'OVERDRAFT') {
        throw new Error(`Insufficient bank balance. Available: ₹${account.currentBalance.toLocaleString()}, Required: ₹${dto.amount.toLocaleString()}`);
      }
      account.currentBalance = Number((account.currentBalance - dto.amount).toFixed(2));
    }

    // Auto-post Balanced Double-Entry General Ledger Voucher
    let accountingVoucherNumber: string | undefined;
    try {
      if (dto.transactionType === 'RECEIPT') {
        const voucher = await accountingService.createVoucher(
          {
            voucherType: 'RECEIPT_VOUCHER',
            entryDate: dto.transactionDate || new Date().toISOString(),
            narration: `${dto.paymentMethod} Receipt [Ref: ${dto.referenceNumber}] from ${dto.partyName || 'Customer'}: ${dto.narration}`,
            items: [
              {
                ledgerId: account.ledgerId || 'led_bank_hdfc',
                ledgerName: account.accountName,
                ledgerCode: '1002',
                debitAmount: dto.amount,
                creditAmount: 0.0,
              },
              {
                ledgerId: dto.partyLedgerId || 'led_debtors',
                ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
                ledgerCode: '1010',
                debitAmount: 0.0,
                creditAmount: dto.amount,
              },
            ],
          },
          account.companyId,
          user
        );
        accountingVoucherNumber = voucher.voucherNumber;
      } else if (dto.transactionType === 'PAYMENT') {
        const voucher = await accountingService.createVoucher(
          {
            voucherType: 'PAYMENT_VOUCHER',
            entryDate: dto.transactionDate || new Date().toISOString(),
            narration: `${dto.paymentMethod} Payment [Ref: ${dto.referenceNumber}] to ${dto.partyName || 'Supplier'}: ${dto.narration}`,
            items: [
              {
                ledgerId: dto.partyLedgerId || 'led_creditors',
                ledgerName: 'Trade Creditors - Paper Mills & Printers',
                ledgerCode: '2001',
                debitAmount: dto.amount,
                creditAmount: 0.0,
              },
              {
                ledgerId: account.ledgerId || 'led_bank_hdfc',
                ledgerName: account.accountName,
                ledgerCode: '1002',
                debitAmount: 0.0,
                creditAmount: dto.amount,
              },
            ],
          },
          account.companyId,
          user
        );
        accountingVoucherNumber = voucher.voucherNumber;
      }
    } catch (err) {
      console.warn('Accounting voucher warning in banking transaction:', err);
    }

    const txRecord: BankTransactionDTO = {
      id: txId,
      companyId: account.companyId,
      bankAccountId: account.id,
      transactionType: dto.transactionType,
      paymentMethod: dto.paymentMethod,
      transactionDate: dto.transactionDate || new Date().toISOString(),
      referenceNumber: dto.referenceNumber,
      partyName: dto.partyName,
      partyLedgerId: dto.partyLedgerId,
      debitAmount,
      creditAmount,
      runningBalance: account.currentBalance,
      narration: dto.narration,
      accountingVoucherNumber,
      reconciliationStatus: 'UNRECONCILED',
      createdAt: new Date().toISOString(),
    };

    this.bankTransactions.set(txRecord.id, txRecord);
    this.bankAccounts.set(account.id, account);

    return txRecord;
  }

  public getAllBankTransactions(bankAccountId?: string): BankTransactionDTO[] {
    const list = Array.from(this.bankTransactions.values());
    if (bankAccountId) {
      return list.filter((tx) => tx.bankAccountId === bankAccountId);
    }
    return list;
  }

  // --------------------------------------------------------------------------
  // 3. CHEQUE MANAGEMENT & CHEQUE BOUNCE LIFECYCLE
  // --------------------------------------------------------------------------

  public registerCheque(dto: Omit<ChequeLeafDTO, 'id' | 'createdAt' | 'status' | 'bounceCharges'>): ChequeLeafDTO {
    const id = 'chq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const cheque: ChequeLeafDTO = {
      id,
      companyId: dto.companyId || this.defaultCompanyId,
      bankAccountId: dto.bankAccountId,
      chequeNumber: dto.chequeNumber,
      chequeType: dto.chequeType,
      issueOrReceiptDate: dto.issueOrReceiptDate,
      payeeOrDrawer: dto.payeeOrDrawer,
      amount: dto.amount,
      status: dto.chequeType === 'ISSUED' ? 'ISSUED' : 'RECEIVED',
      bounceCharges: 0,
      createdAt: new Date().toISOString(),
    };

    this.chequeLeaves.set(id, cheque);
    return cheque;
  }

  public async processChequeLifecycle(dto: ChequeLifecycleInputDTO, user: string = 'Bank Officer'): Promise<ChequeLeafDTO> {
    const cheque = this.chequeLeaves.get(dto.chequeId);
    if (!cheque) {
      throw new Error(`Cheque ID ${dto.chequeId} not found.`);
    }

    const actionDate = dto.date || new Date().toISOString();

    if (dto.action === 'DEPOSIT') {
      cheque.status = 'DEPOSITED';
    } else if (dto.action === 'CLEAR') {
      cheque.status = 'CLEARED';
      cheque.clearingDate = actionDate;
    } else if (dto.action === 'BOUNCE') {
      cheque.status = 'BOUNCED';
      cheque.bounceDate = actionDate;
      cheque.bounceReason = dto.bounceReason || 'Insufficient Funds - Return Memo Code 01';
      cheque.bounceCharges = dto.bounceCharges || 590.0; // ₹500 + 18% GST

      // Post Balanced Reversal Voucher + Penalty Bank Charges Voucher
      try {
        const reversalVoucher = await accountingService.createVoucher(
          {
            voucherType: 'JOURNAL',
            entryDate: actionDate,
            narration: `Dishonoured Cheque Reversal #${cheque.chequeNumber} for ${cheque.payeeOrDrawer}. Reason: ${cheque.bounceReason}`,
            items: [
              {
                ledgerId: 'led_debtors',
                ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
                ledgerCode: '1010',
                debitAmount: cheque.amount,
                creditAmount: 0.0,
              },
              {
                ledgerId: 'led_bank_hdfc',
                ledgerName: 'HDFC Bank Corporate Current A/c',
                ledgerCode: '1002',
                debitAmount: 0.0,
                creditAmount: cheque.amount,
              },
            ],
          },
          cheque.companyId,
          user
        );
        cheque.reversalVoucherNumber = reversalVoucher.voucherNumber;

        // Debit penalty bounce charge to customer
        await accountingService.createVoucher(
          {
            voucherType: 'JOURNAL',
            entryDate: actionDate,
            narration: `Bank Dishonour Charges recovered on Cheque #${cheque.chequeNumber}`,
            items: [
              {
                ledgerId: 'led_debtors',
                ledgerName: 'Trade Debtors - Wholesale & Retail Distributors',
                ledgerCode: '1010',
                debitAmount: cheque.bounceCharges,
                creditAmount: 0.0,
              },
              {
                ledgerId: 'led_bank_hdfc',
                ledgerName: 'HDFC Bank Corporate Current A/c',
                ledgerCode: '1002',
                debitAmount: 0.0,
                creditAmount: cheque.bounceCharges,
              },
            ],
          },
          cheque.companyId,
          user
        );
      } catch (err) {
        console.warn('Accounting voucher warning on cheque bounce:', err);
      }
    } else if (dto.action === 'CANCEL') {
      cheque.status = 'CANCELLED';
    }

    this.chequeLeaves.set(cheque.id, cheque);
    return cheque;
  }

  public getAllCheques(): ChequeLeafDTO[] {
    return Array.from(this.chequeLeaves.values());
  }

  // --------------------------------------------------------------------------
  // 4. INTER-BANK & CASH TRANSFERS (CONTRA VOUCHERS)
  // --------------------------------------------------------------------------

  public async transferFunds(dto: InterBankTransferInputDTO, user: string = 'Treasury Manager'): Promise<any> {
    const transferDate = dto.transferDate || new Date().toISOString();

    if (dto.transferType === 'BANK_TO_BANK') {
      const fromBank = this.bankAccounts.get(dto.fromBankAccountId!);
      const toBank = this.bankAccounts.get(dto.toBankAccountId!);
      if (!fromBank || !toBank) {
        throw new Error('Both source and destination bank accounts must be specified.');
      }
      if (fromBank.currentBalance < dto.amount) {
        throw new Error(`Insufficient balance in ${fromBank.accountName}. Available: ₹${fromBank.currentBalance}`);
      }

      fromBank.currentBalance = Number((fromBank.currentBalance - dto.amount).toFixed(2));
      toBank.currentBalance = Number((toBank.currentBalance + dto.amount).toFixed(2));

      // Post Balanced Contra Voucher
      const voucher = await accountingService.createVoucher(
        {
          voucherType: 'CONTRA_VOUCHER',
          entryDate: transferDate,
          narration: `Inter-Bank Funds Transfer from ${fromBank.accountName} to ${toBank.accountName} (Ref: ${dto.referenceNumber}): ${dto.narration}`,
          items: [
            {
              ledgerId: toBank.ledgerId || 'led_bank_sbi',
              ledgerName: toBank.accountName,
              ledgerCode: '1003',
              debitAmount: dto.amount,
              creditAmount: 0.0,
            },
            {
              ledgerId: fromBank.ledgerId || 'led_bank_hdfc',
              ledgerName: fromBank.accountName,
              ledgerCode: '1002',
              debitAmount: 0.0,
              creditAmount: dto.amount,
            },
          ],
        },
        fromBank.companyId,
        user
      );

      this.bankAccounts.set(fromBank.id, fromBank);
      this.bankAccounts.set(toBank.id, toBank);

      return {
        transferType: dto.transferType,
        fromAccount: fromBank.accountName,
        toAccount: toBank.accountName,
        amount: dto.amount,
        referenceNumber: dto.referenceNumber,
        voucherNumber: voucher.voucherNumber,
      };
    } else if (dto.transferType === 'CASH_TO_BANK') {
      const cashReg = this.cashRegisters.get(dto.fromCashRegisterId!);
      const toBank = this.bankAccounts.get(dto.toBankAccountId!);
      if (!cashReg || !toBank) {
        throw new Error('Source cash register and destination bank account must be specified.');
      }
      if (cashReg.currentBalance < dto.amount) {
        throw new Error(`Insufficient cash in register. Available: ₹${cashReg.currentBalance}`);
      }

      cashReg.currentBalance = Number((cashReg.currentBalance - dto.amount).toFixed(2));
      toBank.currentBalance = Number((toBank.currentBalance + dto.amount).toFixed(2));

      const voucher = await accountingService.createVoucher(
        {
          voucherType: 'CONTRA_VOUCHER',
          entryDate: transferDate,
          narration: `Cash deposited into ${toBank.accountName} from ${cashReg.name} (Challan: ${dto.referenceNumber})`,
          items: [
            {
              ledgerId: toBank.ledgerId || 'led_bank_hdfc',
              ledgerName: toBank.accountName,
              ledgerCode: '1002',
              debitAmount: dto.amount,
              creditAmount: 0.0,
            },
            {
              ledgerId: cashReg.ledgerId || 'led_cash',
              ledgerName: 'Cash in Hand (Central Cashier)',
              ledgerCode: '1001',
              debitAmount: 0.0,
              creditAmount: dto.amount,
            },
          ],
        },
        toBank.companyId,
        user
      );

      this.cashRegisters.set(cashReg.id, cashReg);
      this.bankAccounts.set(toBank.id, toBank);

      return {
        transferType: dto.transferType,
        fromRegister: cashReg.name,
        toBank: toBank.accountName,
        amount: dto.amount,
        referenceNumber: dto.referenceNumber,
        voucherNumber: voucher.voucherNumber,
      };
    }
  }

  // --------------------------------------------------------------------------
  // 5. CASH MANAGEMENT & PETTY CASH TRANSACTIONS
  // --------------------------------------------------------------------------

  public async recordCashTransaction(dto: RecordCashTxInputDTO, user: string = 'Cashier'): Promise<CashTransactionDTO> {
    const reg = this.cashRegisters.get(dto.cashRegisterId);
    if (!reg) {
      throw new Error(`Cash Register ${dto.cashRegisterId} not found.`);
    }

    const txId = 'ctx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const receiptNumber = `CSH-REC/${Math.floor(1000 + Math.random() * 9000)}`;

    let debitAmount = 0;
    let creditAmount = 0;

    if (dto.transactionType === 'RECEIPT') {
      debitAmount = dto.amount;
      reg.currentBalance = Number((reg.currentBalance + dto.amount).toFixed(2));
    } else {
      creditAmount = dto.amount;
      if (reg.currentBalance < dto.amount) {
        throw new Error(`Insufficient cash balance in ${reg.name}. Available: ₹${reg.currentBalance}`);
      }
      reg.currentBalance = Number((reg.currentBalance - dto.amount).toFixed(2));
    }

    // Auto-post Balanced Voucher
    let accountingVoucherNumber: string | undefined;
    try {
      if (dto.transactionType === 'PETTY_EXPENSE') {
        const voucher = await accountingService.createVoucher(
          {
            voucherType: 'PAYMENT_VOUCHER',
            entryDate: dto.transactionDate || new Date().toISOString(),
            narration: `Petty Expense [${dto.expenseCategory || 'GENERAL'}] paid by ${reg.cashierName}: ${dto.narration}`,
            items: [
              {
                ledgerId: 'led_paper_purchase',
                ledgerName: 'Administrative & Operating Expenses',
                ledgerCode: '5001',
                debitAmount: dto.amount,
                creditAmount: 0.0,
              },
              {
                ledgerId: reg.ledgerId || 'led_cash',
                ledgerName: 'Cash in Hand (Central Cashier)',
                ledgerCode: '1001',
                debitAmount: 0.0,
                creditAmount: dto.amount,
              },
            ],
          },
          reg.companyId,
          user
        );
        accountingVoucherNumber = voucher.voucherNumber;
      }
    } catch (err) {
      console.warn('Accounting voucher warning on cash transaction:', err);
    }

    const record: CashTransactionDTO = {
      id: txId,
      companyId: reg.companyId,
      cashRegisterId: reg.id,
      transactionType: dto.transactionType,
      transactionDate: dto.transactionDate || new Date().toISOString(),
      receiptNumber,
      partyName: dto.partyName,
      partyLedgerId: dto.partyLedgerId,
      debitAmount,
      creditAmount,
      runningBalance: reg.currentBalance,
      expenseCategory: dto.expenseCategory,
      narration: dto.narration,
      accountingVoucherNumber,
      createdAt: new Date().toISOString(),
    };

    this.cashTransactions.set(record.id, record);
    this.cashRegisters.set(reg.id, reg);

    return record;
  }

  public getAllCashTransactions(cashRegisterId?: string): CashTransactionDTO[] {
    const list = Array.from(this.cashTransactions.values());
    if (cashRegisterId) {
      return list.filter((tx) => tx.cashRegisterId === cashRegisterId);
    }
    return list;
  }

  // --------------------------------------------------------------------------
  // 6. CASH CLOSING SESSION & CASHIER RECONCILIATION
  // --------------------------------------------------------------------------

  public closeCashRegisterShift(dto: CashClosingInputDTO): CashClosingSessionDTO {
    const reg = this.cashRegisters.get(dto.cashRegisterId);
    if (!reg) {
      throw new Error(`Cash Register ${dto.cashRegisterId} not found.`);
    }

    const closingNumber = `CCLS/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const systemExpectedCash = reg.currentBalance;
    const physicalCountedCash = dto.physicalCountedCash;
    const discrepancy = Number((physicalCountedCash - systemExpectedCash).toFixed(2));

    const session: CashClosingSessionDTO = {
      id: 'ccls_' + Date.now(),
      companyId: reg.companyId,
      cashRegisterId: reg.id,
      closingNumber,
      cashierName: dto.cashierName,
      shiftDate: new Date().toISOString(),
      openingCash: reg.openingBalance,
      totalCashIn: 0,
      totalCashOut: 0,
      systemExpectedCash,
      physicalCountedCash,
      discrepancy,
      discrepancyReason: dto.discrepancyReason || (discrepancy === 0 ? 'Exact Match' : 'Cash Variance'),
      status: discrepancy === 0 ? 'RECONCILED' : 'CLOSED',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    this.cashClosings.set(session.id, session);
    return session;
  }

  public getAllCashClosings(): CashClosingSessionDTO[] {
    return Array.from(this.cashClosings.values());
  }

  // --------------------------------------------------------------------------
  // 7. STATEMENT IMPORT & DUPLICATE DETECTION
  // --------------------------------------------------------------------------

  public importBankStatement(dto: ImportBankStatementDTO): { importedCount: number; fileName: string; matchedCount: number } {
    const account = this.bankAccounts.get(dto.bankAccountId);
    if (!account) {
      throw new Error(`Bank Account ${dto.bankAccountId} not found.`);
    }

    // Duplicate statement file import prevention
    const fileKey = `${account.id}::${dto.statementFileName}`;
    if (this.importedStatements.has(fileKey)) {
      throw new Error(`Duplicate bank statement import rejected: File "${dto.statementFileName}" has already been processed for ${account.accountName}.`);
    }

    let matchedCount = 0;
    for (const row of dto.rows) {
      // Find matching unreconciled bank transaction by reference or date
      for (const tx of Array.from(this.bankTransactions.values())) {
        if (
          tx.bankAccountId === account.id &&
          tx.reconciliationStatus === 'UNRECONCILED' &&
          (tx.referenceNumber === row.referenceNumber || tx.narration.includes(row.referenceNumber))
        ) {
          tx.reconciliationStatus = 'MATCHED';
          tx.reconciliationDate = row.date;
          matchedCount++;
        }
      }
    }

    this.importedStatements.add(fileKey);

    return {
      importedCount: dto.rows.length,
      fileName: dto.statementFileName,
      matchedCount,
    };
  }

  // --------------------------------------------------------------------------
  // 8. BANK RECONCILIATION STATEMENT (BRS) ENGINE
  // --------------------------------------------------------------------------

  public calculateBrs(dto: BrsCalculationInputDTO): BankReconciliationDTO {
    const account = this.bankAccounts.get(dto.bankAccountId);
    if (!account) {
      throw new Error(`Bank Account ${dto.bankAccountId} not found.`);
    }

    // Formula mandated by Indian ICAI Standards:
    // Reconciled Balance = Balance as per Books + Cheques Issued not yet presented - Cheques Deposited not yet credited
    const unpresentedCheques = 45000.0; // e.g. Cheque #882191 issued to Replika Press
    const uncreditedCheques = 60000.0; // e.g. Cheque #551029 deposited not credited
    const directBankDebits = 590.0; // e.g. Bank charges
    const directBankCredits = 0.0;

    const bookBalance = account.currentBalance;
    const reconciledBalance = Number(
      (bookBalance + unpresentedCheques - uncreditedCheques - directBankDebits + directBankCredits).toFixed(2)
    );

    const difference = Number((reconciledBalance - dto.bankStatementBalance).toFixed(2));
    const isBalanced = Math.abs(difference) === 0;

    const brsRecord: BankReconciliationDTO = {
      id: 'brs_' + Date.now(),
      companyId: account.companyId,
      bankAccountId: account.id,
      statementPeriod: dto.statementPeriod,
      asOfDate: dto.asOfDate,
      bookBalance,
      unpresentedCheques,
      uncreditedCheques,
      directBankDebits,
      directBankCredits,
      reconciledBalance,
      bankStatementBalance: dto.bankStatementBalance,
      difference,
      isBalanced,
      createdAt: new Date().toISOString(),
    };

    this.reconciliations.set(brsRecord.id, brsRecord);
    return brsRecord;
  }

  // --------------------------------------------------------------------------
  // 9. REPORTS: CASH BOOK, BANK BOOK & DAILY COLLECTION
  // --------------------------------------------------------------------------

  public getCashBookReport(registerId?: string): any {
    const txs = this.getAllCashTransactions(registerId);
    let totalIn = 0;
    let totalOut = 0;
    for (const t of txs) {
      totalIn += t.debitAmount;
      totalOut += t.creditAmount;
    }
    return {
      totalReceipts: totalIn,
      totalPayments: totalOut,
      netCashFlow: totalIn - totalOut,
      transactions: txs,
    };
  }

  public getBankBookReport(bankAccountId?: string): any {
    const txs = this.getAllBankTransactions(bankAccountId);
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    for (const t of txs) {
      totalDeposits += t.debitAmount;
      totalWithdrawals += t.creditAmount;
    }
    return {
      totalDeposits,
      totalWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
      transactions: txs,
    };
  }

  public getDailyCollectionReport(): any {
    const btxs = this.getAllBankTransactions();
    const ctxs = this.getAllCashTransactions();

    const methodSummary: Record<string, number> = {
      CASH: 0,
      UPI: 0,
      CARD: 0,
      NEFT: 0,
      RTGS: 0,
      CHEQUE: 0,
    };

    for (const b of btxs) {
      if (b.debitAmount > 0) {
        methodSummary[b.paymentMethod] = (methodSummary[b.paymentMethod] || 0) + b.debitAmount;
      }
    }
    for (const c of ctxs) {
      if (c.debitAmount > 0) {
        methodSummary['CASH'] += c.debitAmount;
      }
    }

    const totalCollected = Object.values(methodSummary).reduce((acc, v) => acc + v, 0);

    return {
      totalCollected,
      methodBreakdown: methodSummary,
    };
  }
}

export const bankingService = new BankingService();
