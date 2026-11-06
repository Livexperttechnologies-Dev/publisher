import { Request, Response, NextFunction } from 'express';
import { suppliersService } from './suppliers.service';
import { sendSuccess } from '../../utils/response';
import { createSuppliersSchema } from './suppliers.validator';

export class SuppliersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, total } = await suppliersService.getAll(req.query);
      return sendSuccess(res, 'Paper Mills, Binders & Printing Presses items fetched successfully', items, { total, page: 1, limit: 10 });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await suppliersService.getById(req.params.id as string);
      return sendSuccess(res, 'Paper Mills, Binders & Printing Presses item fetched successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSuppliersSchema.parse(req.body);
      const created = await suppliersService.create(validated);
      return sendSuccess(res, 'Paper Mills, Binders & Printing Presses item created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const suppliersController = new SuppliersController();
