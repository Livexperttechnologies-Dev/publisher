import { Request, Response, NextFunction } from 'express';
import { purchasesService } from './purchases.service';
import {
  createRequisitionSchema,
  approveRequisitionSchema,
  createQuotationSchema,
  createPurchaseOrderSchema,
  createGRNSchema,
  createPurchaseInvoiceSchema,
  createPurchaseReturnSchema,
  createSupplierPaymentSchema,
} from './purchases.validator';

export class PurchasesController {
  // ==========================================================================
  // REQUISITIONS
  // ==========================================================================
  async getRequisitions(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getRequisitions(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getRequisitionById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const pr = await purchasesService.getRequisitionById(id);
      if (!pr) return res.status(404).json({ success: false, message: 'Purchase Requisition not found' });
      return res.status(200).json({ success: true, data: pr });
    } catch (err) {
      Next(err);
    }
  }

  async createRequisition(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createRequisitionSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_staff';
      const created = await purchasesService.createRequisition(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  async approveRequisition(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { approved, remarks } = approveRequisitionSchema.parse(req.body);
      const userId = (req as any).user?.id || 'usr_super_admin';
      const updated = await purchasesService.approveRequisition(id, approved, remarks, userId);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // QUOTATIONS & COMPARISON
  // ==========================================================================
  async getQuotations(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getQuotations(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getQuotationById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const quotation = await purchasesService.getQuotationById(id);
      if (!quotation) return res.status(404).json({ success: false, message: 'Supplier Quotation not found' });
      return res.status(200).json({ success: true, data: quotation });
    } catch (err) {
      Next(err);
    }
  }

  async createQuotation(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createQuotationSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await purchasesService.createQuotation(validated, companyId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  async compareQuotations(req: Request, res: Response, Next: NextFunction) {
    try {
      const skus = req.query.skus ? (req.query.skus as string).split(',') : undefined;
      const requisitionId = req.query.requisitionId as string;
      const report = await purchasesService.compareQuotations(skus, requisitionId);
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // PURCHASE ORDERS
  // ==========================================================================
  async getOrders(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getOrders(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getOrderById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const po = await purchasesService.getOrderById(id);
      if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
      return res.status(200).json({ success: true, data: po });
    } catch (err) {
      Next(err);
    }
  }

  async createOrder(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createPurchaseOrderSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_super_admin';
      const created = await purchasesService.createOrder(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const reason = req.body.reason || 'Cancelled by manager';
      const cancelled = await purchasesService.cancelOrder(id, reason);
      return res.status(200).json({ success: true, data: cancelled });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // GOODS RECEIPT NOTES (GRN)
  // ==========================================================================
  async getGRNs(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getGRNs(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getGRNById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const grn = await purchasesService.getGRNById(id);
      if (!grn) return res.status(404).json({ success: false, message: 'Goods Receipt Note not found' });
      return res.status(200).json({ success: true, data: grn });
    } catch (err) {
      Next(err);
    }
  }

  async createGRN(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createGRNSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_super_admin';
      const created = await purchasesService.createGRN(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // PURCHASE INVOICES (VENDOR BILLS)
  // ==========================================================================
  async getInvoices(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getInvoices(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getInvoiceById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const invoice = await purchasesService.getInvoiceById(id);
      if (!invoice) return res.status(404).json({ success: false, message: 'Purchase Invoice not found' });
      return res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      Next(err);
    }
  }

  async createInvoice(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createPurchaseInvoiceSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_super_admin';
      const created = await purchasesService.createInvoice(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // PURCHASE RETURNS & DEBIT NOTES
  // ==========================================================================
  async getReturns(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getReturns(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getReturnById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ret = await purchasesService.getReturnById(id);
      if (!ret) return res.status(404).json({ success: false, message: 'Purchase Return not found' });
      return res.status(200).json({ success: true, data: ret });
    } catch (err) {
      Next(err);
    }
  }

  async createReturn(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createPurchaseReturnSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_super_admin';
      const created = await purchasesService.createReturn(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // SUPPLIER PAYMENTS
  // ==========================================================================
  async getPayments(req: Request, res: Response, Next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        search: req.query.search as string,
        supplierId: req.query.supplierId as string,
        companyId: (req as any).user?.companyId || 'cmp_default_publisher',
      };
      const result = await purchasesService.getPayments(filters);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getPaymentById(req: Request, res: Response, Next: NextFunction) {
    try {
      const id = req.params.id as string;
      const payment = await purchasesService.getPaymentById(id);
      if (!payment) return res.status(404).json({ success: false, message: 'Supplier Payment not found' });
      return res.status(200).json({ success: true, data: payment });
    } catch (err) {
      Next(err);
    }
  }

  async createPayment(req: Request, res: Response, Next: NextFunction) {
    try {
      const validated = createSupplierPaymentSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const userId = (req as any).user?.id || 'usr_super_admin';
      const created = await purchasesService.createPayment(validated, companyId, userId);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      Next(err);
    }
  }

  // ==========================================================================
  // PAYABLES, AGEING & REPORTS
  // ==========================================================================
  async getSupplierAgeing(req: Request, res: Response, Next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await purchasesService.getSupplierAgeing(companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getSupplierStatement(req: Request, res: Response, Next: NextFunction) {
    try {
      const supplierId = req.params.supplierId as string;
      const result = await purchasesService.getSupplierStatement(supplierId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getPurchaseRegister(req: Request, res: Response, Next: NextFunction) {
    try {
      const fromDate = req.query.fromDate as string;
      const toDate = req.query.toDate as string;
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await purchasesService.getPurchaseRegister(fromDate, toDate, companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getSupplierWisePurchases(req: Request, res: Response, Next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await purchasesService.getSupplierWisePurchases(companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getBookWisePurchases(req: Request, res: Response, Next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await purchasesService.getBookWisePurchases(companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }

  async getPendingPurchaseOrders(req: Request, res: Response, Next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await purchasesService.getPendingPurchaseOrders(companyId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      Next(err);
    }
  }
}

export const purchasesController = new PurchasesController();
