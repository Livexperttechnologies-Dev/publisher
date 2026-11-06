import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  email: z.string().email('Valid corporate email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.string().min(2, 'Role is required'),
  department: z.string().min(2, 'Department is required'),
  companyId: z.string().optional(),
  branchId: z.string().min(2, 'Branch assignment is required'),
  assignedWarehouses: z.array(z.string()).default([]),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  branchId: z.string().optional(),
  assignedWarehouses: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
