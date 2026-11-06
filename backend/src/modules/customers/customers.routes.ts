import { Router } from 'express';
import { customersController } from './customers.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJwt, (req, res, next) => customersController.getAll(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => customersController.getById(req, res, next));
router.post('/', authenticateJwt, (req, res, next) => customersController.create(req, res, next));

export const customersRoutes = router;
