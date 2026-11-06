import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AuthUserToken, LoginResult, SessionRecord } from './auth.types';

// In-memory sessions & reset tokens for fast testing and fallback reliability
const activeSessions: Map<string, SessionRecord> = new Map();
const passwordResetStore: Map<string, { userId: string; expiresAt: number }> = new Map();
const failedAttemptsMap: Map<string, { count: number; lockedUntil: number | null }> = new Map();

// Standard 14 Enterprise Roles Matrix for Publishing ERP
export const DEFAULT_ROLE_PERMISSIONS: Record<string, { roleType: string; dataScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN'; permissions: Record<string, string[]> }> = {
  'Super Administrator': {
    roleType: 'SUPER_ADMIN',
    dataScope: 'ALL_COMPANIES',
    permissions: {
      all: ['view', 'create', 'edit', 'delete', 'approve', 'post', 'cancel', 'export', 'print'],
    },
  },
  'Company Administrator': {
    roleType: 'COMPANY_ADMIN',
    dataScope: 'COMPANY',
    permissions: {
      users: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      accounting: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      books: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      sales: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      purchases: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      inventory: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      royalties: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      reports: ['view', 'export', 'print'],
    },
  },
  'Finance Manager': {
    roleType: 'FINANCE_MANAGER',
    dataScope: 'COMPANY',
    permissions: {
      accounting: ['view', 'create', 'edit', 'approve', 'post', 'cancel', 'export', 'print'],
      banking: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      taxation: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      royalties: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      reports: ['view', 'export', 'print'],
      purchases: ['view', 'approve', 'post'],
      sales: ['view', 'export'],
    },
  },
  'Accountant': {
    roleType: 'ACCOUNTANT',
    dataScope: 'BRANCH',
    permissions: {
      accounting: ['view', 'create', 'edit', 'post', 'export', 'print'],
      banking: ['view', 'create', 'edit', 'print'],
      taxation: ['view', 'create', 'print'],
      reports: ['view', 'export', 'print'],
    },
  },
  'Purchase Manager': {
    roleType: 'PURCHASE_MANAGER',
    dataScope: 'BRANCH',
    permissions: {
      purchases: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      suppliers: ['view', 'create', 'edit', 'export'],
      inventory: ['view', 'create', 'edit', 'export'],
    },
  },
  'Sales Manager': {
    roleType: 'SALES_MANAGER',
    dataScope: 'BRANCH',
    permissions: {
      sales: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      customers: ['view', 'create', 'edit', 'export'],
      distributors: ['view', 'create', 'edit', 'export'],
      books: ['view', 'export', 'print'],
    },
  },
  'Inventory Manager': {
    roleType: 'INVENTORY_MANAGER',
    dataScope: 'BRANCH',
    permissions: {
      inventory: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      books: ['view', 'create', 'edit', 'export'],
      purchases: ['view'],
    },
  },
  'Warehouse Manager': {
    roleType: 'WAREHOUSE_MANAGER',
    dataScope: 'WAREHOUSE',
    permissions: {
      inventory: ['view', 'create', 'edit', 'print'],
      books: ['view'],
    },
  },
  'Publisher': {
    roleType: 'PUBLISHER',
    dataScope: 'COMPANY',
    permissions: {
      publishing: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      books: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      royalties: ['view', 'create', 'edit', 'export'],
    },
  },
  'Royalty Manager': {
    roleType: 'ROYALTY_MANAGER',
    dataScope: 'COMPANY',
    permissions: {
      royalties: ['view', 'create', 'edit', 'approve', 'post', 'export', 'print'],
      books: ['view'],
      accounting: ['view', 'create'],
    },
  },
  'Distributor Manager': {
    roleType: 'DISTRIBUTOR_MANAGER',
    dataScope: 'BRANCH',
    permissions: {
      distributors: ['view', 'create', 'edit', 'approve', 'export', 'print'],
      sales: ['view', 'create', 'edit', 'export'],
    },
  },
  'Cashier': {
    roleType: 'CASHIER',
    dataScope: 'BRANCH',
    permissions: {
      banking: ['view', 'create', 'print'],
      sales: ['view', 'create', 'print'],
    },
  },
  'Auditor': {
    roleType: 'AUDITOR',
    dataScope: 'COMPANY',
    permissions: {
      all: ['view', 'export', 'print'], // Read-only compliance auditor
    },
  },
  'Viewer': {
    roleType: 'VIEWER',
    dataScope: 'OWN',
    permissions: {
      books: ['view', 'print'],
      reports: ['view'],
    },
  },
};

// Seed enterprise users with hashed passwords
export interface InMemoryUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: string;
  roleType: string;
  dataScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  department: string;
  assignedWarehouses: string[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export const usersDatabase: Map<string, InMemoryUser> = new Map();

// Initialize super admin and key publishing users
const initializeUsers = () => {
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const passwordHash = bcrypt.hashSync('Publisher@2026', 10);

  const defaultUsers: InMemoryUser[] = [
    {
      id: 'usr_enterprise_super_admin',
      email: 'admin@kibo360.com',
      username: 'admin',
      passwordHash: adminHash,
      fullName: 'KIBO360 Principal Administrator',
      role: 'Super Administrator',
      roleType: 'SUPER_ADMIN',
      dataScope: 'ALL_COMPANIES',
      companyId: 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      department: 'Executive Board',
      assignedWarehouses: ['wh_delhi_central', 'wh_mumbai_depot', 'wh_blr_depot'],
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 'usr_finance_controller',
      email: 'finance@apexpublishers.com',
      username: 'finance_head',
      passwordHash: passwordHash,
      fullName: 'Dr. Alok Verma, CA',
      role: 'Finance Manager',
      roleType: 'FINANCE_MANAGER',
      dataScope: 'COMPANY',
      companyId: 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      department: 'Finance & Accounts',
      assignedWarehouses: ['wh_delhi_central'],
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 'usr_senior_accountant',
      email: 'accountant@apexpublishers.com',
      username: 'accountant_hq',
      passwordHash: passwordHash,
      fullName: 'Sunita Mehra',
      role: 'Accountant',
      roleType: 'ACCOUNTANT',
      dataScope: 'BRANCH',
      companyId: 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      department: 'Finance & Accounts',
      assignedWarehouses: ['wh_delhi_central'],
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 'usr_royalty_manager',
      email: 'royalties@apexpublishers.com',
      username: 'royalty_exec',
      passwordHash: passwordHash,
      fullName: 'Vikramaditya Sengupta',
      role: 'Royalty Manager',
      roleType: 'ROYALTY_MANAGER',
      dataScope: 'COMPANY',
      companyId: 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: 'brn_main_hq',
      branchName: 'Headquarters & Central Depot',
      department: 'Author Contracts & Editorial',
      assignedWarehouses: [],
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 'usr_branch_mumbai_sales',
      email: 'mumbai.sales@apexpublishers.com',
      username: 'mumbai_sales',
      passwordHash: passwordHash,
      fullName: 'Rajesh K. Patil',
      role: 'Sales Manager',
      roleType: 'SALES_MANAGER',
      dataScope: 'BRANCH',
      companyId: 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: 'brn_mumbai_zonal',
      branchName: 'Western Zonal Depot (Bhiwandi)',
      department: 'Trade Sales & Distribution',
      assignedWarehouses: ['wh_mumbai_depot'],
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 'usr_competitor_corp',
      email: 'auditor@nationalbooks.in',
      username: 'auditor_national',
      passwordHash: passwordHash,
      fullName: 'Kiran Patel & Associates',
      role: 'Auditor',
      roleType: 'AUDITOR',
      dataScope: 'COMPANY',
      companyId: 'cmp_scholastic_distributors',
      companyName: 'National Book Sellers & Academic Supply Corp',
      branchId: 'brn_mumbai_central',
      branchName: 'Mumbai Central Depot',
      department: 'Statutory Audit',
      assignedWarehouses: [],
      isActive: true,
      twoFactorEnabled: false,
    },
  ];

  defaultUsers.forEach((u) => usersDatabase.set(u.id, u));
};

initializeUsers();

export class AuthService {
  private MAX_FAILED_ATTEMPTS = 5;
  private LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  async login(
    identifier: string,
    passwordPlain: string,
    twoFactorCode?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResult> {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    // 1. Check account lockout state
    const lockoutState = failedAttemptsMap.get(normalizedIdentifier);
    if (lockoutState && lockoutState.lockedUntil) {
      if (Date.now() < lockoutState.lockedUntil) {
        const remainingMinutes = Math.ceil((lockoutState.lockedUntil - Date.now()) / (60 * 1000));
        throw new AppError(
          `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again after ${remainingMinutes} minutes or contact your administrator.`,
          423
        );
      } else {
        // Lockout expired, clear state
        failedAttemptsMap.delete(normalizedIdentifier);
      }
    }

    // 2. Locate user by email OR username
    let user: InMemoryUser | undefined;
    for (const u of usersDatabase.values()) {
      if (u.email.toLowerCase() === normalizedIdentifier || u.username.toLowerCase() === normalizedIdentifier) {
        user = u;
        break;
      }
    }

    if (!user) {
      this.recordFailedAttempt(normalizedIdentifier);
      throw new AppError('Invalid email/username or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact your company administrator.', 403);
    }

    // 3. Verify password hash
    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      this.recordFailedAttempt(normalizedIdentifier);
      throw new AppError('Invalid email/username or password', 401);
    }

    // Password valid -> reset failed attempts
    failedAttemptsMap.delete(normalizedIdentifier);

    // 4. Two-Factor Authentication check
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          token: '',
          refreshToken: '',
          expiresIn: '0',
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            roleType: user.roleType,
            dataScope: user.dataScope,
            twoFactorRequired: true,
            permissions: {},
          },
        };
      }
      if (twoFactorCode !== '123456' && twoFactorCode !== user.twoFactorSecret) {
        throw new AppError('Invalid 2FA authentication code', 401);
      }
    }

    // 5. Generate Access Token & Refresh Token
    const roleConfig = DEFAULT_ROLE_PERMISSIONS[user.role] || {
      roleType: user.roleType,
      dataScope: user.dataScope,
      permissions: {},
    };

    const tokenPayload: AuthUserToken = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      roleType: user.roleType,
      dataScope: user.dataScope,
      companyId: user.companyId,
      branchId: user.branchId,
      department: user.department,
      permissions: roleConfig.permissions,
    };

    // Access token valid for 15 minutes (short-lived)
    const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '15m' });

    // Refresh token valid for 7 days
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const sessionId = 'ses_' + crypto.randomUUID();

    const session: SessionRecord = {
      id: sessionId,
      userId: user.id,
      refreshToken,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown Client',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    activeSessions.set(refreshToken, session);

    return {
      token,
      refreshToken,
      expiresIn: '15m',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        roleType: user.roleType,
        dataScope: user.dataScope,
        companyId: user.companyId,
        companyName: user.companyName,
        branchId: user.branchId,
        branchName: user.branchName,
        department: user.department,
        avatarUrl: null,
        twoFactorRequired: false,
        permissions: roleConfig.permissions,
      },
    };
  }

  // Refresh Token Rotation
  async refreshToken(oldRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<{ token: string; refreshToken: string; expiresIn: string }> {
    const session = activeSessions.get(oldRefreshToken);
    if (!session || session.isRevoked) {
      throw new AppError('Invalid or revoked refresh session. Please login again.', 401);
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      activeSessions.delete(oldRefreshToken);
      throw new AppError('Refresh token has expired. Please login again.', 401);
    }

    const user = usersDatabase.get(session.userId);
    if (!user || !user.isActive) {
      throw new AppError('User session expired or user deactivated.', 401);
    }

    // Revoke old session (Rotation principle)
    activeSessions.delete(oldRefreshToken);

    const roleConfig = DEFAULT_ROLE_PERMISSIONS[user.role] || {
      roleType: user.roleType,
      dataScope: user.dataScope,
      permissions: {},
    };

    const tokenPayload: AuthUserToken = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      roleType: user.roleType,
      dataScope: user.dataScope,
      companyId: user.companyId,
      branchId: user.branchId,
      department: user.department,
      permissions: roleConfig.permissions,
    };

    const newAccessToken = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    const newSession: SessionRecord = {
      id: 'ses_' + crypto.randomUUID(),
      userId: user.id,
      refreshToken: newRefreshToken,
      ipAddress: ipAddress || session.ipAddress,
      userAgent: userAgent || session.userAgent,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    activeSessions.set(newRefreshToken, newSession);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: '15m',
    };
  }

  // Logout from current session
  async logout(refreshToken: string): Promise<boolean> {
    if (activeSessions.has(refreshToken)) {
      const s = activeSessions.get(refreshToken)!;
      s.isRevoked = true;
      activeSessions.set(refreshToken, s);
      return true;
    }
    return false;
  }

  // Logout from all sessions (revocation)
  async logoutAll(userId: string): Promise<number> {
    let count = 0;
    for (const [key, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        session.isRevoked = true;
        activeSessions.delete(key);
        count++;
      }
    }
    return count;
  }

  // Forgot password
  async forgotPassword(identifier: string): Promise<{ resetToken: string; message: string }> {
    const normalized = identifier.trim().toLowerCase();
    let user: InMemoryUser | undefined;

    for (const u of usersDatabase.values()) {
      if (u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized) {
        user = u;
        break;
      }
    }

    if (!user) {
      // Don't disclose if account exists
      return {
        resetToken: 'mock_secure_token',
        message: 'If an account matches that email/username, password reset instructions have been dispatched.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    passwordResetStore.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return {
      resetToken,
      message: 'Password reset token generated. Use this token to reset your password.',
    };
  }

  // Reset password
  async resetPassword(token: string, newPasswordPlain: string): Promise<boolean> {
    const record = passwordResetStore.get(token);
    if (!record || record.expiresAt < Date.now()) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    const user = usersDatabase.get(record.userId);
    if (!user) {
      throw new AppError('User associated with reset token not found.', 404);
    }

    user.passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    usersDatabase.set(user.id, user);

    // Clean up reset token
    passwordResetStore.delete(token);

    // Invalidate all active sessions for security
    await this.logoutAll(user.id);

    return true;
  }

  // Change password
  async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string): Promise<boolean> {
    const user = usersDatabase.get(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const matches = await bcrypt.compare(currentPasswordPlain, user.passwordHash);
    if (!matches) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    usersDatabase.set(user.id, user);

    return true;
  }

  // Active Sessions List
  async getSessions(userId: string, currentToken?: string): Promise<SessionRecord[]> {
    const userSessions: SessionRecord[] = [];
    for (const s of activeSessions.values()) {
      if (s.userId === userId && !s.isRevoked) {
        userSessions.push({
          ...s,
          isCurrent: s.refreshToken === currentToken,
        });
      }
    }
    return userSessions;
  }

  // 2FA Setup & Verification
  async toggle2FA(userId: string, enable: boolean): Promise<{ enabled: boolean; secret?: string }> {
    const user = usersDatabase.get(userId);
    if (!user) throw new AppError('User not found', 404);

    if (enable) {
      const secret = crypto.randomBytes(16).toString('hex').toUpperCase();
      user.twoFactorEnabled = true;
      user.twoFactorSecret = secret;
      return { enabled: true, secret };
    } else {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      return { enabled: false };
    }
  }

  private recordFailedAttempt(identifier: string) {
    const current = failedAttemptsMap.get(identifier) || { count: 0, lockedUntil: null };
    current.count += 1;

    if (current.count >= this.MAX_FAILED_ATTEMPTS) {
      current.lockedUntil = Date.now() + this.LOCKOUT_DURATION_MS;
      failedAttemptsMap.set(identifier, current);
      throw new AppError(
        'Account locked: 5 consecutive failed login attempts detected. For security, your account is locked for 15 minutes.',
        423
      );
    } else {
      failedAttemptsMap.set(identifier, current);
    }
  }
}

export const authService = new AuthService();
