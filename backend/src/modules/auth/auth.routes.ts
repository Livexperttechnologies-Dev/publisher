import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// Public auth routes
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Authenticated session & credential management
router.get('/me', authenticateJwt, (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/change-password', authenticateJwt, (req, res, next) => authController.changePassword(req, res, next));
router.post('/logout-all', authenticateJwt, (req, res, next) => authController.logoutAll(req, res, next));
router.get('/sessions', authenticateJwt, (req, res, next) => authController.getSessions(req, res, next));
router.post('/2fa/toggle', authenticateJwt, (req, res, next) => authController.toggle2FA(req, res, next));

export const authRoutes = router;
