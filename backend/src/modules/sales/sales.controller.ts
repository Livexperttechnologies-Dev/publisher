import { Request, Response, NextFunction } from 'express';
import { salesService } from './sales.service';
import {
  createSalesQuotationSchema,
  createSalesOrderSchema,
  createDeliveryChallanSchema,
  createSalesInvoiceSchema,
  posSaleSchema,
  createSalesReturnSchema,
  createCustomerReceiptSchema,
  openPosShiftSchema,
  closePosShiftSchema,
  holdCartSchema,
} from './sales.validator';

export class SalesController {
  // ==========================================================================
  // POS (POINT OF SALE)
  // ==========================================================================
  async scanItem(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q || req.query.query || req.body.query) as string;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Scan query (barcode, SKU, ISBN or title) is required' });
      }
      const item = await salesService.scanItem(query);
      return res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async processPosSale(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = posSaleSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const result = await salesService.processPosSale(validated, companyId, userId);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async holdCart(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = holdCartSchema.parse(req.body);
      const held = await salesService.holdCart(validated);
      return res.status(201).json({ success: true, data: held });
    } catch (err) {
      next(err);
    }
  }

  async getHeldCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const carts = await salesService.getHeldCarts();
      return res.status(200).json({ success: true, data: carts });
    } catch (err) {
      next(err);
    }
  }

  async resumeHeldCart(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const cart = await salesService.resumeHeldCart(id);
      return res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  async openPosShift(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = openPosShiftSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const shift = await salesService.openPosShift(validated, companyId);
      return res.status(201).json({ success: true, data: shift });
    } catch (err) {
      next(err);
    }
  }

  async closePosShift(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = closePosShiftSchema.parse(req.body);
      const shift = await salesService.closePosShift(
        validated.shiftId,
        validated.closingDrawerCash,
        validated.notes
      );
      return res.status(200).json({ success: true, data: shift });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // SALES QUOTATIONS
  // ==========================================================================
  async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getQuotations(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getQuotationById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const quote = await salesService.getQuotationById(id);
      if (!quote) return res.status(404).json({ success: false, message: 'Sales Quotation not found' });
      return res.status(200).json({ success: true, data: quote });
    } catch (err) {
      next(err);
    }
  }

  async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSalesQuotationSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await salesService.createQuotation(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // SALES ORDERS
  // ==========================================================================
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getOrders(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await salesService.getOrderById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Sales Order not found' });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSalesOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await salesService.createOrder(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const reason = req.body.reason || 'Cancelled by user';
      const cancelled = await salesService.cancelOrder(id, reason);
      return res.status(200).json({ success: true, data: cancelled });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // DELIVERY CHALLANS
  // ==========================================================================
  async getDeliveryChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getDeliveryChallans(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const dc = await salesService.getDeliveryChallanById(id);
      if (!dc) return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
      return res.status(200).json({ success: true, data: dc });
    } catch (err) {
      next(err);
    }
  }

  async createDeliveryChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDeliveryChallanSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await salesService.createDeliveryChallan(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // SALES INVOICES (TAX INVOICES / BILLING)
  // ==========================================================================
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getInvoices(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const invoice = await salesService.getInvoiceById(id);
      if (!invoice) return res.status(404).json({ success: false, message: 'Sales Invoice not found' });
      return res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSalesInvoiceSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await salesService.createInvoice(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // SALES RETURNS & CREDIT NOTES
  // ==========================================================================
  async getReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getReturns(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getReturnById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ret = await salesService.getReturnById(id);
      if (!ret) return res.status(404).json({ success: false, message: 'Sales Return / Credit Note not found' });
      return res.status(200).json({ success: true, data: ret });
    } catch (err) {
      next(err);
    }
  }

  async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSalesReturnSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await salesService.createReturn(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // CUSTOMER RECEIPTS
  // ==========================================================================
  async getReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        customerId: req.query.customerId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await salesService.getReceipts(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getReceiptById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const receipt = await salesService.getReceiptById(id);
      if (!receipt) return res.status(404).json({ success: false, message: 'Customer Receipt not found' });
      return res.status(200).json({ success: true, data: receipt });
    } catch (err) {
      next(err);
    }
  }

  async createReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerReceiptSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await salesService.createReceipt(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // RECEIVABLES & CUSTOMER LEDGER
  // ==========================================================================
  async getCustomerAgeing(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await salesService.getCustomerAgeing(companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.params.customerId as string;
      const statement = await salesService.getCustomerStatement(customerId);
      return res.status(200).json({ success: true, data: statement });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================================================
  // SALES REPORTS & ANALYTICS
  // ==========================================================================
  async getDailySalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await salesService.getDailySalesReport(date, companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getChannelWiseSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await salesService.getChannelWiseSalesReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getBookWiseSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await salesService.getBookWiseSalesReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getSalesMarginReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const report = await salesService.getSalesMarginReport(companyId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}

export const salesController = new SalesController();
