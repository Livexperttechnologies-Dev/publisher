import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  meta?: ApiResponse['meta'],
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
