import { z } from 'zod';

export const reportsFilterQuerySchema = z.object({
  financialYear: z.string().optional().default('2026-2027'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  warehouseId: z.string().optional(),
  customerId: z.string().optional(),
  distributorId: z.string().optional(),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(50),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const createReportsSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  filters: z.record(z.any()).optional(),
});
