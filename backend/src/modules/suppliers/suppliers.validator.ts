import { z } from 'zod';

export const createSuppliersSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  code: z.string().optional(),
  status: z.string().default('ACTIVE'),
  description: z.string().optional(),
});

export const updateSuppliersSchema = createSuppliersSchema.partial();
