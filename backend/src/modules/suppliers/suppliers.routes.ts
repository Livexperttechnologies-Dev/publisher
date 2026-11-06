import { Router } from 'express';
import { suppliersController } from './suppliers.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJwt, (req, res, next) => suppliersController.getAll(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => suppliersController.getById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => suppliersController.create(req, res, next));

export const suppliersRoutes = router;
