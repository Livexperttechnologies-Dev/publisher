export interface AuthUserToken {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  roleType: string;
  dataScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
  companyId?: string | null;
  branchId?: string | null;
  department?: string | null;
  permissions: Record<string, string[]>;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
    roleType: string;
    dataScope: string;
    companyId?: string | null;
    companyName?: string | null;
    branchId?: string | null;
    branchName?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
    twoFactorRequired?: boolean;
    permissions: Record<string, string[]>;
  };
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
  isCurrent?: boolean;
}
