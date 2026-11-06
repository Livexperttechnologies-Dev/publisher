import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Default enterprise seed account for Phase 1 verification
    if (email === 'admin@kibo360.com' && password === 'Admin@123') {
      const token = jwt.sign(
        {
          id: 'usr_enterprise_super_admin',
          email,
          fullName: 'KIBO360 Principal Administrator',
          role: 'SUPER_ADMIN',
          companyId: 'cmp_default_publisher',
          branchId: 'brn_main_hq',
        },
        ENV.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return sendSuccess(res, 'Authentication successful', {
        token,
        user: {
          id: 'usr_enterprise_super_admin',
          email,
          fullName: 'KIBO360 Principal Administrator',
          role: 'SUPER_ADMIN',
          companyId: 'cmp_default_publisher',
          companyName: 'Apex Educational Publishers & Distributors Ltd.',
          branchId: 'brn_main_hq',
          branchName: 'Headquarters & Central Warehouse',
        },
      });
    }

    return next(new AppError('Invalid email or password', 401));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    return sendSuccess(res, 'User session verified', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
