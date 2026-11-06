import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorCode: z.string().length(6, '2FA Code must be 6 digits').optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or username is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Two-factor authentication code must be 6 digits'),
});
