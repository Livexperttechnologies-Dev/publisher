export interface UserItem {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  role: string;
  roleType: string;
  dataScope: string;
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  department: string;
  assignedWarehouses: string[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  branchId?: string;
  department?: string;
  isActive?: boolean;
}
