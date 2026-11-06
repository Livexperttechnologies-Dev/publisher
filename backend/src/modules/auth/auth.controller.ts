import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';
import {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validator';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password, twoFactorCode } = loginSchema.parse(req.body);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      const result = await authService.login(identifier, password, twoFactorCode, ip, ua);
      return sendSuccess(res, 'Authentication successful', result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      const result = await authService.refreshToken(refreshToken, ip, ua);
      return sendSuccess(res, 'Token refreshed successfully with session rotation', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      return sendSuccess(res, 'Session terminated successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const revokedCount = await authService.logoutAll(req.user.id);
      return sendSuccess(res, `All ${revokedCount} active sessions have been revoked.`);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(identifier);
      return sendSuccess(res, result.message, { resetToken: result.resetToken });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);
      return sendSuccess(res, 'Password has been securely reset. Please login with your new credentials.');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return sendSuccess(res, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      return sendSuccess(res, 'Session verified', { user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const sessions = await authService.getSessions(req.user.id);
      return sendSuccess(res, 'Active sessions retrieved', sessions);
    } catch (error) {
      next(error);
    }
  }

  async toggle2FA(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { enable } = req.body;
      const result = await authService.toggle2FA(req.user.id, Boolean(enable));
      return sendSuccess(
        res,
        result.enabled ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.',
        result
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
