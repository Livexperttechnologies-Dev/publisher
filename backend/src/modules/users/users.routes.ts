import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateJwt, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', (req, res, next) => usersController.getAll(req, res, next));
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));
router.post('/', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) =>
  usersController.create(req, res, next)
);
router.patch('/:id', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) =>
  usersController.update(req, res, next)
);
router.post('/:id/toggle-active', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) =>
  usersController.toggleActive(req, res, next)
);
router.post('/:id/admin-reset-password', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) =>
  usersController.adminResetPassword(req, res, next)
);

export const usersRoutes = router;
