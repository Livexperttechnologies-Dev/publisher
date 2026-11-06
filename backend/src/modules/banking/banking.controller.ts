import { Request, Response, NextFunction } from 'express';
import { bankingService } from './banking.service';
import {
  createBankAccountSchema,
  createCashRegisterSchema,
  recordBankTxSchema,
  recordCashTxSchema,
  interBankTransferSchema,
  chequeLifecycleSchema,
  cashClosingSchema,
  importStatementSchema,
  brsCalculationSchema,
} from './banking.validator';

export class BankingController {
  // --------------------------------------------------------------------------
  // BANK ACCOUNTS
  // --------------------------------------------------------------------------

  public async getAllBankAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = bankingService.getAllBankAccounts();
      res.status(200).json({ success: true, count: accounts.length, data: accounts });
    } catch (err) {
      next(err);
    }
  }

  public async getBankAccountById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const account = bankingService.getBankAccountById(id);
      if (!account) {
        res.status(404).json({ success: false, message: `Bank account ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, data: account });
    } catch (err) {
      next(err);
    }
  }

  public async createBankAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createBankAccountSchema.parse(req.body);
      const account = bankingService.createBankAccount(parsed as any);
      res.status(201).json({
        success: true,
        message: `Bank account ${account.accountName} (#${account.accountNumber}) created successfully`,
        data: account,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // CASH REGISTERS
  // --------------------------------------------------------------------------

  public async getAllCashRegisters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registers = bankingService.getAllCashRegisters();
      res.status(200).json({ success: true, count: registers.length, data: registers });
    } catch (err) {
      next(err);
    }
  }

  public async createCashRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createCashRegisterSchema.parse(req.body);
      const register = bankingService.createCashRegister(parsed as any);
      res.status(201).json({
        success: true,
        message: `Cash register ${register.name} (${register.code}) created successfully`,
        data: register,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // BANK TRANSACTIONS
  // --------------------------------------------------------------------------

  public async getAllBankTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bankAccountId = req.query.bankAccountId as string;
      const txs = bankingService.getAllBankTransactions(bankAccountId);
      res.status(200).json({ success: true, count: txs.length, data: txs });
    } catch (err) {
      next(err);
    }
  }

  public async recordBankTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = recordBankTxSchema.parse(req.body);
      const user = (req as any).user?.name || 'Treasury Officer';
      const tx = await bankingService.recordBankTransaction(parsed as any, user);
      res.status(201).json({
        success: true,
        message: `Bank ${tx.transactionType} of ₹${tx.debitAmount || tx.creditAmount} recorded via ${tx.paymentMethod}`,
        data: tx,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // CHEQUES
  // --------------------------------------------------------------------------

  public async getAllCheques(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cheques = bankingService.getAllCheques();
      res.status(200).json({ success: true, count: cheques.length, data: cheques });
    } catch (err) {
      next(err);
    }
  }

  public async processChequeLifecycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = chequeLifecycleSchema.parse(req.body);
      const user = (req as any).user?.name || 'Bank Operations Officer';
      const cheque = await bankingService.processChequeLifecycle(parsed, user);
      res.status(200).json({
        success: true,
        message: `Cheque #${cheque.chequeNumber} status updated to ${cheque.status}`,
        data: cheque,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // TRANSFERS (CONTRA)
  // --------------------------------------------------------------------------

  public async transferFunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = interBankTransferSchema.parse(req.body);
      const user = (req as any).user?.name || 'Treasury Manager';
      const result = await bankingService.transferFunds(parsed as any, user);
      res.status(200).json({
        success: true,
        message: `Transfer of ₹${parsed.amount.toLocaleString()} processed with Contra Voucher #${result.voucherNumber}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // CASH TRANSACTIONS & PETTY CASH
  // --------------------------------------------------------------------------

  public async getAllCashTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerId = req.query.cashRegisterId as string;
      const txs = bankingService.getAllCashTransactions(registerId);
      res.status(200).json({ success: true, count: txs.length, data: txs });
    } catch (err) {
      next(err);
    }
  }

  public async recordCashTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = recordCashTxSchema.parse(req.body);
      const user = (req as any).user?.name || 'Cashier';
      const tx = await bankingService.recordCashTransaction(parsed as any, user);
      res.status(201).json({
        success: true,
        message: `Cash ${tx.transactionType} of ₹${tx.debitAmount || tx.creditAmount} recorded`,
        data: tx,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // CASH CLOSING
  // --------------------------------------------------------------------------

  public async closeCashRegisterShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = cashClosingSchema.parse(req.body);
      const session = bankingService.closeCashRegisterShift(parsed);
      res.status(201).json({
        success: true,
        message: `Cash shift closed #${session.closingNumber}. Discrepancy: ₹${session.discrepancy.toLocaleString()}`,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAllCashClosings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const closings = bankingService.getAllCashClosings();
      res.status(200).json({ success: true, count: closings.length, data: closings });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // BANK RECONCILIATION & STATEMENT IMPORT
  // --------------------------------------------------------------------------

  public async importBankStatement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = importStatementSchema.parse(req.body);
      const result = bankingService.importBankStatement(parsed);
      res.status(200).json({
        success: true,
        message: `Imported ${result.importedCount} statement lines from "${result.fileName}" (${result.matchedCount} matched automatically)`,
        data: result,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('Duplicate bank statement import')) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  public async calculateBrs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = brsCalculationSchema.parse(req.body);
      const brs = bankingService.calculateBrs(parsed);
      res.status(200).json({
        success: true,
        message: `Bank Reconciliation Statement calculated. Balanced: ${brs.isBalanced} (Difference: ₹${brs.difference.toLocaleString()})`,
        data: brs,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // REPORTS
  // --------------------------------------------------------------------------

  public async getCashBookReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerId = req.query.cashRegisterId as string;
      const report = bankingService.getCashBookReport(registerId);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async getBankBookReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bankAccountId = req.query.bankAccountId as string;
      const report = bankingService.getBankBookReport(bankAccountId);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async getDailyCollectionReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = bankingService.getDailyCollectionReport();
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}

export const bankingController = new BankingController();
