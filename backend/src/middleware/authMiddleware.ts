import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AppError } from './errorHandler';
import { AuthUserToken } from '../modules/auth/auth.types';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserToken;
}

export const authenticateJwt = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUserToken;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Session token has expired. Please refresh your session.', 401));
    }
    return next(new AppError('Invalid authentication token', 401));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (req.user.roleType === 'SUPER_ADMIN') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role) && !allowedRoles.includes(req.user.roleType)) {
      return next(
        new AppError(
          `Forbidden: Insufficient privileges. Required roles: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Granular Action-Wise & Module-Wise Permission Guard
 * Example: requirePermission('accounting', 'post')
 */
export const requirePermission = (moduleName: string, actionName: string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Super Admin has unrestricted permissions
    if (req.user.roleType === 'SUPER_ADMIN') {
      return next();
    }

    const permissions = req.user.permissions || {};
    const moduleActions = permissions[moduleName] || permissions['all'] || [];

    if (moduleActions.includes(actionName) || moduleActions.includes('*')) {
      return next();
    }

    return next(
      new AppError(
        `Forbidden: You do not possess the required permission [${moduleName}:${actionName}] for this action.`,
        403
      )
    );
  };
};

/**
 * Multi-Company Isolation Guard (Prevent Cross-Company Data Leaks)
 */
export const preventCrossCompanyAccess = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  // Super Admin can inspect any tenant
  if (req.user.roleType === 'SUPER_ADMIN') return next();

  const targetCompanyId = req.params.companyId || req.query.companyId || req.body.companyId;

  if (targetCompanyId && req.user.companyId && targetCompanyId !== req.user.companyId) {
    return next(
      new AppError(
        'Forbidden: Cross-company access violation. You cannot inspect or modify data belonging to another legal entity.',
        403
      )
    );
  }

  next();
};

/**
 * Multi-Branch Isolation Guard (Prevent Cross-Branch Data Leaks)
 */
export const preventCrossBranchAccess = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  // Super Admin & Company-wide roles (Finance Manager, Publisher) can access all branches in company
  if (req.user.roleType === 'SUPER_ADMIN' || req.user.dataScope === 'ALL_COMPANIES' || req.user.dataScope === 'COMPANY') {
    return next();
  }

  const targetBranchId = req.params.branchId || req.query.branchId || req.body.branchId;

  if (targetBranchId && req.user.branchId && targetBranchId !== req.user.branchId) {
    return next(
      new AppError(
        'Forbidden: Cross-branch access violation. Your permission is restricted to your designated branch.',
        403
      )
    );
  }

  next();
};
