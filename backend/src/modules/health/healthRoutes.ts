import { Router } from 'express';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/', (_req, res) => {
  return sendSuccess(res, 'KIBO360 Financial Accounting API is healthy and operational', {
    system: 'KIBO360 Enterprise ERP',
    module: 'Core Accounting & Bookseller Suite',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedSectors: [
      'Book Publishers',
      'Book Wholesalers',
      'Book Distributors',
      'Book Retailers',
      'Bookstores',
      'Educational Book Suppliers',
      'Printing & Publishing Companies',
      'Institutional Book Suppliers',
    ],
  });
});

export const healthRoutes = router;
