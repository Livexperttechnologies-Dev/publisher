import { Request, Response, NextFunction } from 'express';
import { accountingService } from './accounting.service';
import {
  createAccountGroupSchema,
  createAccountLedgerSchema,
  createJournalEntrySchema,
  reverseVoucherSchema,
} from './accounting.validator';
import { AccountClassification, VoucherType, JournalEntryStatus } from './accounting.types';

export class AccountingController {
  // --------------------------------------------------------------------------
  // CHART OF ACCOUNTS: GROUPS & LEDGERS
  // --------------------------------------------------------------------------
  async getGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId;
      const groups = await accountingService.getGroups(companyId);
      return res.status(200).json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  }

  async getLedgers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, groupId, classification } = req.query;
      const companyId = (req as any).user?.companyId;

      const result = await accountingService.getLedgers({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 100,
        search: search as string,
        groupId: groupId as string,
        classification: classification as AccountClassification,
        companyId,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 100,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLedgerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ledger = await accountingService.getLedgerById(id);
      if (!ledger) {
        return res.status(404).json({ success: false, message: 'Account Ledger not found' });
      }
      return res.status(200).json({ success: true, data: ledger });
    } catch (error) {
      next(error);
    }
  }

  async createLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAccountLedgerSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await accountingService.createLedger(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Account Ledger created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getLedgerStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { fromDate, toDate } = req.query;
      const statement = await accountingService.getLedgerStatement(id, fromDate as string, toDate as string);
      return res.status(200).json({ success: true, data: statement });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // VOUCHER MANAGEMENT & POSTING
  // --------------------------------------------------------------------------
  async getVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, voucherType, status } = req.query;
      const companyId = (req as any).user?.companyId;

      const result = await accountingService.getVouchers({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
        search: search as string,
        voucherType: voucherType as VoucherType,
        status: status as JournalEntryStatus,
        companyId,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 50,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getVoucherById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const voucher = await accountingService.getVoucherById(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found' });
      }
      return res.status(200).json({ success: true, data: voucher });
    } catch (error) {
      next(error);
    }
  }

  async createVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createJournalEntrySchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_system';

      const voucher = await accountingService.createVoucher(validated, companyId, userId);
      return res.status(201).json({
        success: true,
        data: voucher,
        message: `Voucher ${voucher.voucherNumber} posted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async reverseVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = reverseVoucherSchema.parse(req.body);
      const userId = (req as any).user?.id || 'usr_system';

      const result = await accountingService.reverseVoucher(id, validated.reason, userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Voucher ${result.originalVoucher.voucherNumber} successfully reversed by ${result.reversalVoucher.voucherNumber}.`,
      });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // FINANCIAL STATEMENTS & AUDIT REPORTS
  // --------------------------------------------------------------------------
  async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate } = req.query;
      const report = await accountingService.getTrialBalance(asOfDate as string);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getProfitLoss(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodStart, periodEnd } = req.query;
      const report = await accountingService.getProfitAndLoss(periodStart as string, periodEnd as string);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate } = req.query;
      const report = await accountingService.getBalanceSheet(asOfDate as string);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getDayBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const report = await accountingService.getDayBook(date as string);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getCostCentres(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await accountingService.getCostCentreReport();
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  // Legacy compatibility endpoint for Phase 01 integration tests
  async getAll(req: Request, res: Response, next: NextFunction) {
    return this.getLedgers(req, res, next);
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    return this.getLedgerById(req, res, next);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    return this.createLedger(req, res, next);
  }
}

export const accountingController = new AccountingController();
