import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation error', 422, formattedErrors);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Something went wrong';

  return sendError(res, message, statusCode);
};
