import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../utils/response';
import { createUserSchema, updateUserSchema, adminResetPasswordSchema } from './users.validator';

export class UsersController {
  async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.roleType === 'SUPER_ADMIN';
      const companyId = req.user?.companyId;

      const { items, total } = await usersService.getAll(req.query, companyId, isSuperAdmin);
      return sendSuccess(res, 'Users retrieved successfully', items, {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.params.id as string);
      return sendSuccess(res, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: any, res: Response, next: NextFunction) {
    try {
      const validated = createUserSchema.parse(req.body);
      const created = await usersService.create(validated, req.user?.companyId);
      return sendSuccess(res, 'User created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateUserSchema.parse(req.body);
      const updated = await usersService.update(req.params.id as string, validated);
      return sendSuccess(res, 'User updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.toggleActive(req.params.id as string);
      return sendSuccess(
        res,
        result.isActive ? 'User account activated' : 'User account deactivated',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  async adminResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = adminResetPasswordSchema.parse(req.body);
      await usersService.adminResetPassword(req.params.id as string, newPassword);
      return sendSuccess(res, 'Password reset successfully by administrator. User sessions revoked.');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
