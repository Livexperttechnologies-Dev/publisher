import { Request, Response, NextFunction } from 'express';
import { customersService } from './customers.service';
import { sendSuccess } from '../../utils/response';
import { createCustomersSchema } from './customers.validator';

export class CustomersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, total } = await customersService.getAll(req.query);
      return sendSuccess(res, 'Bookstores, Schools & Institutional Buyers items fetched successfully', items, { total, page: 1, limit: 10 });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await customersService.getById(req.params.id as string);
      return sendSuccess(res, 'Bookstores, Schools & Institutional Buyers item fetched successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomersSchema.parse(req.body);
      const created = await customersService.create(validated);
      return sendSuccess(res, 'Bookstores, Schools & Institutional Buyers item created successfully', created, undefined, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const customersController = new CustomersController();
