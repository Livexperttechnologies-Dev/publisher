import { Router } from 'express';
import { companiesController } from './companies.controller';
import { authenticateJwt, requireRole, preventCrossCompanyAccess } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateJwt);

// Company routes
router.get('/', (req, res, next) => companiesController.getAll(req, res, next));
router.get('/:id', preventCrossCompanyAccess, (req, res, next) => companiesController.getById(req, res, next));
router.post('/', requireRole(['Super Administrator', 'SUPER_ADMIN']), (req, res, next) =>
  companiesController.create(req, res, next)
);
router.put('/:id', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), preventCrossCompanyAccess, (req, res, next) =>
  companiesController.update(req, res, next)
);

// Branch routes
router.get('/:companyId/branches', preventCrossCompanyAccess, (req, res, next) =>
  companiesController.getBranches(req, res, next)
);
router.post('/:companyId/branches', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), preventCrossCompanyAccess, (req, res, next) =>
  companiesController.createBranch(req, res, next)
);

// Fiscal Year & Period Lock routes
router.get('/:companyId/fiscal-years', preventCrossCompanyAccess, (req, res, next) =>
  companiesController.getFiscalYears(req, res, next)
);
router.post('/:companyId/fiscal-years', requireRole(['Super Administrator', 'Company Administrator', 'Finance Manager', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'FINANCE_MANAGER']), preventCrossCompanyAccess, (req, res, next) =>
  companiesController.createFiscalYear(req, res, next)
);
router.put('/:companyId/fiscal-years/:fyId/lock', requireRole(['Super Administrator', 'Company Administrator', 'Finance Manager', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'FINANCE_MANAGER']), preventCrossCompanyAccess, (req, res, next) =>
  companiesController.togglePeriodLock(req, res, next)
);

// Accounting Settings Mapping
router.put('/:companyId/accounting-settings', requireRole(['Super Administrator', 'Company Administrator', 'Finance Manager', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'FINANCE_MANAGER']), preventCrossCompanyAccess, (req, res, next) =>
  companiesController.updateAccountingSettings(req, res, next)
);

// Consolidated Reporting
router.get('/:companyId/consolidated-summary', preventCrossCompanyAccess, (req, res, next) =>
  companiesController.getConsolidatedSummary(req, res, next)
);

export const companiesRoutes = router;
