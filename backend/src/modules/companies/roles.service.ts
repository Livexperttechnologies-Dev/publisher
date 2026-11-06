import { DEFAULT_ROLE_PERMISSIONS, usersDatabase } from '../auth/auth.service';
import { AppError } from '../../middleware/errorHandler';

export interface DynamicRole {
  id: string;
  name: string;
  roleType: string;
  description: string;
  dataScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
  permissions: Record<string, string[]>;
  isSystem: boolean;
  assignedUsersCount?: number;
  createdAt: string;
  updatedAt: string;
}

const roleDescriptions: Record<string, string> = {
  'Super Administrator': 'Unrestricted enterprise control across all publishing entities, branches, and system configurations.',
  'Company Administrator': 'Autonomous administration within a specific publishing company across all branches.',
  'Finance Manager': 'Supervision of Chart of Accounts, bank reconciliations, GST compliance, and journal approvals.',
  'Accountant': 'Day-to-day voucher posting, bill settlements, and branch bank cash reconciliation.',
  'Purchase Manager': 'Procurement of paper reels, printer offset contracts, and binding job works.',
  'Sales Manager': 'Wholesale book orders, school textbook supplies, and trade discount approvals.',
  'Inventory Manager': 'Depot stock reconciliations, reprint threshold tracking, and book transfers.',
  'Warehouse Manager': 'Physical godown operations, stock receipts, and consignment packing.',
  'Publisher': 'Title acquisitions, author contract negotiations, and imprint release approvals.',
  'Royalty Manager': 'Author royalty statement runs, slab calculations, advance adjustments, and TDS slips.',
  'Distributor Manager': 'Regional book distributor accounts, consignment returns, and depot supplies.',
  'Cashier': 'Retail counter billing and cash receipts reconciliation.',
  'Auditor': 'Statutory compliance and financial statement inspection (strictly read-only).',
  'Viewer': 'Minimal access to book catalog and operational summaries.',
};

class RolesService {
  private rolesStore: Map<string, DynamicRole> = new Map();

  constructor() {
    this.initDefaultRoles();
  }

  private initDefaultRoles() {
    const defaultModules = [
      'Accounting',
      'Books & ISBN',
      'Author Royalties',
      'Sales & Distribution',
      'Procurement & Bills',
      'Inventory & Godowns',
      'Financial Reports',
      'User Management',
    ];

    Object.entries(DEFAULT_ROLE_PERMISSIONS).forEach(([name, config], idx) => {
      const id = `role_${idx + 1}`;
      
      // Standardize permissions object so all modules have explicit arrays
      const standardizedPermissions: Record<string, string[]> = {};
      defaultModules.forEach((mod) => {
        if (config.permissions['all']) {
          standardizedPermissions[mod] = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Post', 'Cancel', 'Export', 'Print'];
        } else if (config.permissions[mod]) {
          standardizedPermissions[mod] = config.permissions[mod].map((a: string) => a.charAt(0).toUpperCase() + a.slice(1).toLowerCase());
        } else {
          standardizedPermissions[mod] = [];
        }
      });

      this.rolesStore.set(id, {
        id,
        name,
        roleType: config.roleType,
        description: roleDescriptions[name] || `${name} responsibilities for publishing operations.`,
        dataScope: config.dataScope,
        permissions: standardizedPermissions,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  getAll(): DynamicRole[] {
    const list = Array.from(this.rolesStore.values());
    const allUsers = Array.from(usersDatabase.values());

    return list.map((role) => {
      const count = allUsers.filter((u) => u.role === role.name || u.roleType === role.roleType).length;
      return {
        ...role,
        assignedUsersCount: count,
      };
    });
  }

  getById(id: string): DynamicRole {
    const role = this.rolesStore.get(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404);
    }
    const allUsers = Array.from(usersDatabase.values());
    const count = allUsers.filter((u) => u.role === role.name || u.roleType === role.roleType).length;
    return {
      ...role,
      assignedUsersCount: count,
    };
  }

  create(data: {
    name: string;
    roleType?: string;
    description?: string;
    dataScope?: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
    permissions?: Record<string, string[]>;
  }): DynamicRole {
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError('Role name is required (min 2 characters)', 400);
    }

    const existing = Array.from(this.rolesStore.values()).find(
      (r) => r.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existing) {
      throw new AppError(`Role with name "${data.name}" already exists`, 409);
    }

    const id = `role_custom_${Date.now()}`;
    const roleType = data.roleType?.trim().toUpperCase().replace(/\s+/g, '_') ||
      `CUSTOM_${data.name.trim().toUpperCase().replace(/\s+/g, '_')}`;

    const newRole: DynamicRole = {
      id,
      name: data.name.trim(),
      roleType,
      description: data.description?.trim() || `Custom dynamic role for ${data.name}.`,
      dataScope: data.dataScope || 'BRANCH',
      permissions: data.permissions || {},
      isSystem: false,
      assignedUsersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.rolesStore.set(id, newRole);
    return newRole;
  }

  update(
    id: string,
    data: {
      name?: string;
      description?: string;
      dataScope?: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
      permissions?: Record<string, string[]>;
    }
  ): DynamicRole {
    const role = this.rolesStore.get(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404);
    }

    if (data.name && data.name.trim() !== role.name) {
      if (role.isSystem && role.roleType === 'SUPER_ADMIN') {
        throw new AppError('Super Administrator role name cannot be renamed', 400);
      }
      role.name = data.name.trim();
    }

    if (data.description !== undefined) {
      role.description = data.description.trim();
    }

    if (data.dataScope) {
      role.dataScope = data.dataScope;
    }

    if (data.permissions) {
      role.permissions = { ...role.permissions, ...data.permissions };
    }

    role.updatedAt = new Date().toISOString();
    this.rolesStore.set(id, role);
    return role;
  }

  delete(id: string): { success: boolean; message: string } {
    const role = this.rolesStore.get(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404);
    }

    if (role.isSystem) {
      throw new AppError(`Built-in system role "${role.name}" cannot be deleted`, 400);
    }

    // Check if users are assigned
    const allUsers = Array.from(usersDatabase.values());
    const assignedUsers = allUsers.filter((u) => u.role === role.name || u.roleType === role.roleType);
    if (assignedUsers.length > 0) {
      throw new AppError(
        `Cannot delete role "${role.name}". It is currently assigned to ${assignedUsers.length} user(s). Reassign them first.`,
        400
      );
    }

    this.rolesStore.delete(id);
    return { success: true, message: `Role "${role.name}" deleted successfully` };
  }

  assignUserToRole(roleId: string, userId: string): { success: boolean; user: any } {
    const role = this.rolesStore.get(roleId);
    if (!role) {
      throw new AppError(`Role with ID ${roleId} not found`, 404);
    }

    const user = usersDatabase.get(userId);
    if (!user) {
      throw new AppError(`User with ID ${userId} not found`, 404);
    }

    user.role = role.name;
    user.roleType = role.roleType;
    user.dataScope = role.dataScope;
    usersDatabase.set(userId, user);

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleType: user.roleType,
      },
    };
  }

  getUsersForRole(roleId: string) {
    const role = this.rolesStore.get(roleId);
    if (!role) {
      throw new AppError(`Role with ID ${roleId} not found`, 404);
    }

    const allUsers = Array.from(usersDatabase.values());
    return allUsers
      .filter((u) => u.role === role.name || u.roleType === role.roleType)
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        username: u.username,
        department: u.department,
        branchId: u.branchId,
        isActive: u.isActive,
      }));
  }
}

export const rolesService = new RolesService();
