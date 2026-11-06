import { Router } from 'express';
import { login, getCurrentUser } from './authController';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateJwt, getCurrentUser);

export const authRoutes = router;
