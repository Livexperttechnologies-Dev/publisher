import bcrypt from 'bcryptjs';
import { UserItem, UserFilters } from './users.types';
import { usersDatabase, InMemoryUser, DEFAULT_ROLE_PERMISSIONS, authService } from '../auth/auth.service';
import { AppError } from '../../middleware/errorHandler';

export class UsersService {
  async getAll(filters?: UserFilters, currentUserCompanyId?: string, isSuperAdmin = false): Promise<{ items: UserItem[]; total: number }> {
    let list = Array.from(usersDatabase.values());

    // Multi-company isolation filter
    if (!isSuperAdmin && currentUserCompanyId) {
      list = list.filter((u) => u.companyId === currentUserCompanyId);
    }

    // Filter by search (name, email, username)
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }

    // Filter by role
    if (filters?.role && filters.role !== 'ALL') {
      list = list.filter((u) => u.role === filters.role || u.roleType === filters.role);
    }

    // Filter by department
    if (filters?.department && filters.department !== 'ALL') {
      list = list.filter((u) => u.department === filters.department);
    }

    // Filter by branch
    if (filters?.branchId && filters.branchId !== 'ALL') {
      list = list.filter((u) => u.branchId === filters.branchId);
    }

    // Filter by active status
    if (filters?.isActive !== undefined) {
      list = list.filter((u) => u.isActive === filters.isActive);
    }

    const items: UserItem[] = list.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      phone: null,
      role: u.role,
      roleType: u.roleType,
      dataScope: u.dataScope,
      companyId: u.companyId,
      companyName: u.companyName,
      branchId: u.branchId,
      branchName: u.branchName,
      department: u.department,
      assignedWarehouses: u.assignedWarehouses,
      isActive: u.isActive,
      twoFactorEnabled: u.twoFactorEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return {
      items,
      total: items.length,
    };
  }

  async getById(id: string): Promise<UserItem | null> {
    const u = usersDatabase.get(id);
    if (!u) return null;

    return {
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      phone: null,
      role: u.role,
      roleType: u.roleType,
      dataScope: u.dataScope,
      companyId: u.companyId,
      companyName: u.companyName,
      branchId: u.branchId,
      branchName: u.branchName,
      department: u.department,
      assignedWarehouses: u.assignedWarehouses,
      isActive: u.isActive,
      twoFactorEnabled: u.twoFactorEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async create(data: any, creatorCompanyId?: string): Promise<UserItem> {
    // Check if email or username already exists
    for (const u of usersDatabase.values()) {
      if (u.email.toLowerCase() === data.email.toLowerCase()) {
        throw new AppError('User with this email already exists', 400);
      }
      if (u.username.toLowerCase() === data.username.toLowerCase()) {
        throw new AppError('User with this username already exists', 400);
      }
    }

    const roleConfig = DEFAULT_ROLE_PERMISSIONS[data.role] || {
      roleType: 'ACCOUNTANT',
      dataScope: 'BRANCH',
    };

    const newUser: InMemoryUser = {
      id: 'usr_' + Date.now(),
      email: data.email,
      username: data.username,
      passwordHash: await bcrypt.hash(data.password, 10),
      fullName: data.fullName,
      role: data.role,
      roleType: roleConfig.roleType,
      dataScope: roleConfig.dataScope,
      companyId: data.companyId || creatorCompanyId || 'cmp_default_publisher',
      companyName: 'Apex Educational Publishers & Distributors Ltd.',
      branchId: data.branchId || 'brn_main_hq',
      branchName: data.branchId === 'brn_mumbai_zonal' ? 'Western Zonal Depot (Bhiwandi)' : 'Headquarters & Central Depot',
      department: data.department || 'Finance & Accounts',
      assignedWarehouses: data.assignedWarehouses || [],
      isActive: true,
      twoFactorEnabled: false,
    };

    usersDatabase.set(newUser.id, newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      phone: data.phone || null,
      role: newUser.role,
      roleType: newUser.roleType,
      dataScope: newUser.dataScope,
      companyId: newUser.companyId,
      companyName: newUser.companyName,
      branchId: newUser.branchId,
      branchName: newUser.branchName,
      department: newUser.department,
      assignedWarehouses: newUser.assignedWarehouses,
      isActive: newUser.isActive,
      twoFactorEnabled: newUser.twoFactorEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async update(id: string, data: any): Promise<UserItem> {
    const user = usersDatabase.get(id);
    if (!user) throw new AppError('User not found', 404);

    if (data.fullName) user.fullName = data.fullName;
    if (data.department) user.department = data.department;
    if (data.branchId) user.branchId = data.branchId;
    if (data.assignedWarehouses) user.assignedWarehouses = data.assignedWarehouses;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    if (data.role && data.role !== user.role) {
      user.role = data.role;
      const roleConfig = DEFAULT_ROLE_PERMISSIONS[data.role];
      if (roleConfig) {
        user.roleType = roleConfig.roleType;
        user.dataScope = roleConfig.dataScope;
      }
    }

    usersDatabase.set(id, user);

    return this.getById(id) as Promise<UserItem>;
  }

  async toggleActive(id: string): Promise<{ id: string; isActive: boolean }> {
    const user = usersDatabase.get(id);
    if (!user) throw new AppError('User not found', 404);

    if (user.roleType === 'SUPER_ADMIN') {
      throw new AppError('Principal Administrator account cannot be deactivated.', 403);
    }

    user.isActive = !user.isActive;
    usersDatabase.set(id, user);

    if (!user.isActive) {
      // Invalidate all active sessions for deactivated user
      await authService.logoutAll(user.id);
    }

    return { id: user.id, isActive: user.isActive };
  }

  async adminResetPassword(id: string, newPasswordPlain: string): Promise<boolean> {
    const user = usersDatabase.get(id);
    if (!user) throw new AppError('User not found', 404);

    user.passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    usersDatabase.set(id, user);

    // Invalidate sessions
    await authService.logoutAll(user.id);
    return true;
  }
}

export const usersService = new UsersService();
