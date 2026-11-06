import { Request, Response, NextFunction } from 'express';
import { taxationService } from './taxation.service';
import {
  gstRateConfigSchema,
  taxCalculateSchema,
  createTaxInvoiceSchema,
  tdsConfigSchema,
  deductTdsSchema,
  generateIrnSchema,
  cancelIrnSchema,
  generateEwayBillSchema,
  cancelEwayBillSchema,
} from './taxation.validator';

export class TaxationController {
  // --------------------------------------------------------------------------
  // GST RATES
  // --------------------------------------------------------------------------

  public async getAllGstRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = taxationService.getAllGstRates();
      res.status(200).json({ success: true, count: rates.length, data: rates });
    } catch (err) {
      next(err);
    }
  }

  public async getGstRateByHsn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hsn = Array.isArray(req.params.hsn) ? req.params.hsn[0] : req.params.hsn;
      const rate = taxationService.getGstRateByHsn(hsn);
      if (!rate) {
        res.status(404).json({ success: false, message: `HSN/SAC ${hsn} not found` });
        return;
      }
      res.status(200).json({ success: true, data: rate });
    } catch (err) {
      next(err);
    }
  }

  public async configureGstRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = gstRateConfigSchema.parse(req.body);
      const user = (req as any).user?.name || 'Administrator';
      const result = taxationService.configureGstRate(parsed as any, user);
      res.status(200).json({
        success: true,
        message: `GST rate for HSN ${result.hsnSacCode} configured successfully`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // TAX CALCULATION ENGINE
  // --------------------------------------------------------------------------

  public async calculateTax(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = taxCalculateSchema.parse(req.body);
      const result = taxationService.calculateTax(parsed as any);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // TAX INVOICES & CREDIT / DEBIT NOTES
  // --------------------------------------------------------------------------

  public async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createTaxInvoiceSchema.parse(req.body);
      const user = (req as any).user?.name || 'Tax Officer';
      const record = await taxationService.createTaxInvoice(parsed as any, user);
      res.status(201).json({
        success: true,
        message: `${record.docType} #${record.invoiceNumber} created and posted to General Ledger`,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAllInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoices = taxationService.getAllInvoices();
      res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (err) {
      next(err);
    }
  }

  public async getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const invoice = taxationService.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: 'Tax invoice not found' });
        return;
      }
      res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // E-INVOICE & E-WAY BILL
  // --------------------------------------------------------------------------

  public async generateIrn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = generateIrnSchema.parse(req.body);
      const user = (req as any).user?.name || 'E-Invoice System';
      const invoice = taxationService.generateIrn(parsed, user);
      res.status(200).json({
        success: true,
        message: `IRN generated successfully for #${invoice.invoiceNumber}`,
        data: {
          irn: invoice.irn,
          signedQrCode: invoice.signedQrCode,
          irnStatus: invoice.irnStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async cancelIrn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = cancelIrnSchema.parse(req.body);
      const user = (req as any).user?.name || 'Tax Officer';
      const invoice = taxationService.cancelIrn(parsed, user);
      res.status(200).json({
        success: true,
        message: `IRN cancelled successfully for #${invoice.invoiceNumber}`,
        data: { irn: invoice.irn, irnStatus: invoice.irnStatus },
      });
    } catch (err) {
      next(err);
    }
  }

  public async generateEwayBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = generateEwayBillSchema.parse(req.body);
      const user = (req as any).user?.name || 'Logistics Officer';
      const ewb = taxationService.generateEwayBill(parsed, user);
      res.status(201).json({
        success: true,
        message: `E-Way Bill #${ewb.ewbNumber} generated successfully`,
        data: ewb,
      });
    } catch (err) {
      next(err);
    }
  }

  public async cancelEwayBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = cancelEwayBillSchema.parse(req.body);
      const user = (req as any).user?.name || 'Logistics Officer';
      const ewb = taxationService.cancelEwayBill(parsed, user);
      res.status(200).json({
        success: true,
        message: `E-Way Bill #${ewb.ewbNumber} cancelled successfully`,
        data: ewb,
      });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // TDS (TAX DEDUCTED AT SOURCE)
  // --------------------------------------------------------------------------

  public async getAllTdsConfigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = taxationService.getAllTdsConfigs();
      res.status(200).json({ success: true, count: configs.length, data: configs });
    } catch (err) {
      next(err);
    }
  }

  public async deductTds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = deductTdsSchema.parse(req.body);
      const user = (req as any).user?.name || 'Tax Officer';
      const record = await taxationService.deductTds(parsed as any, user);
      res.status(201).json({
        success: true,
        message: `TDS deducted successfully (₹${record.tdsAmount} @ ${record.tdsRate}%)`,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAllTdsDeductions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deductions = taxationService.getAllTdsDeductions();
      res.status(200).json({ success: true, count: deductions.length, data: deductions });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------------------------
  // GST REPORTS & FILINGS
  // --------------------------------------------------------------------------

  public async getGstr1Report(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fy = (req.query.fy as string) || '2026-2027';
      const period = (req.query.period as string) || '2026-10';
      const report = taxationService.getGstr1Report(fy, period);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async getGstr3bReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fy = (req.query.fy as string) || '2026-2027';
      const period = (req.query.period as string) || '2026-10';
      const report = taxationService.getGstr3bReport(fy, period);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async getForm26qSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fy = (req.query.fy as string) || '2026-2027';
      const quarter = (req.query.quarter as string) || 'Q2';
      const report = taxationService.getForm26qSummary(fy, quarter);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async getTaxAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = taxationService.getTaxAuditLogs();
      res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  }

  public async getTaxApiLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = taxationService.getTaxApiLogs();
      res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

export const taxationController = new TaxationController();
