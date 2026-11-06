export interface RoleDefinition {
  id: string;
  name: string;
  roleType: string;
  description: string;
  dataScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN';
  permissions: Record<string, string[]>;
  isSystem: boolean;
  assignedUsersCount?: number;
}

export const ERP_MODULES = [
  'Accounting & General Ledger',
  'Books & ISBN Catalogue',
  'Author Royalties & Advances',
  'Sales & Distribution Orders',
  'Procurement & Vendor Bills',
  'Inventory & Godowns',
  'Publishing & Production',
  'GST & Indian Taxation',
  'Banking & Cash Management',
  'Expenses & Fixed Assets',
  'Returns & Financial Adjustments',
  'Financial Reports & MIS',
  'Notifications & Workflow Alerts',
  'Company & Branch Settings',
  'User Management & Security',
] as const;

export const ALL_ACTIONS = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Post',
  'Cancel',
  'Export',
  'Print',
] as const;

export const DEFAULT_ENTERPRISE_ROLES: RoleDefinition[] = [
  {
    id: 'role_1',
    name: 'Super Administrator',
    roleType: 'SUPER_ADMIN',
    description: 'Unrestricted enterprise control across all publishing entities, branches, and system configurations.',
    dataScope: 'ALL_COMPANIES',
    isSystem: true,
    permissions: ERP_MODULES.reduce((acc, mod) => {
      acc[mod] = [...ALL_ACTIONS];
      return acc;
    }, {} as Record<string, string[]>),
  },
  {
    id: 'role_2',
    name: 'Company Administrator',
    roleType: 'COMPANY_ADMIN',
    description: 'Autonomous administration within a specific publishing company across all branches.',
    dataScope: 'COMPANY',
    isSystem: true,
    permissions: ERP_MODULES.reduce((acc, mod) => {
      acc[mod] = ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'];
      return acc;
    }, {} as Record<string, string[]>),
  },
  {
    id: 'role_3',
    name: 'Finance Manager',
    roleType: 'FINANCE_MANAGER',
    description: 'Supervision of Chart of Accounts, bank reconciliations, GST compliance, and journal approvals.',
    dataScope: 'COMPANY',
    isSystem: true,
    permissions: {
      'Accounting & General Ledger': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Cancel', 'Export', 'Print'],
      'Books & ISBN Catalogue': ['View', 'Export'],
      'Author Royalties & Advances': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Sales & Distribution Orders': ['View', 'Export'],
      'Procurement & Vendor Bills': ['View', 'Approve', 'Post', 'Export', 'Print'],
      'Inventory & Godowns': ['View', 'Export'],
      'GST & Indian Taxation': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Banking & Cash Management': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Expenses & Fixed Assets': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Returns & Financial Adjustments': ['View', 'Approve', 'Post', 'Export'],
      'Financial Reports & MIS': ['View', 'Export', 'Print'],
      'Notifications & Workflow Alerts': ['View', 'Edit'],
      'Company & Branch Settings': ['View'],
      'User Management & Security': ['View'],
    },
  },
  {
    id: 'role_4',
    name: 'Accountant',
    roleType: 'ACCOUNTANT',
    description: 'Day-to-day voucher posting, bill settlements, and branch bank cash reconciliation.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Accounting & General Ledger': ['View', 'Create', 'Edit', 'Post', 'Export', 'Print'],
      'Books & ISBN Catalogue': ['View'],
      'Procurement & Vendor Bills': ['View', 'Create', 'Print'],
      'Banking & Cash Management': ['View', 'Create', 'Edit', 'Post', 'Print'],
      'Expenses & Fixed Assets': ['View', 'Create', 'Post'],
      'Returns & Financial Adjustments': ['View', 'Create'],
      'Financial Reports & MIS': ['View', 'Export', 'Print'],
    },
  },
  {
    id: 'role_5',
    name: 'Purchase Manager',
    roleType: 'PURCHASE_MANAGER',
    description: 'Procurement of paper reels, printer offset contracts, and binding job works.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Procurement & Vendor Bills': ['View', 'Create', 'Edit', 'Approve', 'Export', 'Print'],
      'Inventory & Godowns': ['View', 'Create', 'Edit', 'Export'],
      'Publishing & Production': ['View', 'Create', 'Edit'],
    },
  },
  {
    id: 'role_6',
    name: 'Sales Manager',
    roleType: 'SALES_MANAGER',
    description: 'Wholesale book orders, school textbook supplies, and trade discount approvals.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Sales & Distribution Orders': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Books & ISBN Catalogue': ['View', 'Export', 'Print'],
      'Inventory & Godowns': ['View', 'Export'],
      'Returns & Financial Adjustments': ['View', 'Create', 'Approve'],
    },
  },
  {
    id: 'role_7',
    name: 'Inventory Manager',
    roleType: 'INVENTORY_MANAGER',
    description: 'Depot stock reconciliations, reprint threshold tracking, and book transfers.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Inventory & Godowns': ['View', 'Create', 'Edit', 'Approve', 'Export', 'Print'],
      'Books & ISBN Catalogue': ['View', 'Create', 'Edit', 'Export'],
      'Procurement & Vendor Bills': ['View'],
      'Sales & Distribution Orders': ['View'],
    },
  },
  {
    id: 'role_8',
    name: 'Warehouse Manager',
    roleType: 'WAREHOUSE_MANAGER',
    description: 'Physical godown operations, stock receipts, and consignment packing.',
    dataScope: 'WAREHOUSE',
    isSystem: true,
    permissions: {
      'Inventory & Godowns': ['View', 'Create', 'Edit', 'Print'],
      'Books & ISBN Catalogue': ['View'],
      'Procurement & Vendor Bills': ['View'],
      'Sales & Distribution Orders': ['View', 'Print'],
    },
  },
  {
    id: 'role_9',
    name: 'Publisher',
    roleType: 'PUBLISHER',
    description: 'Title acquisitions, author contract negotiations, and imprint release approvals.',
    dataScope: 'COMPANY',
    isSystem: true,
    permissions: {
      'Books & ISBN Catalogue': ['View', 'Create', 'Edit', 'Approve', 'Export', 'Print'],
      'Publishing & Production': ['View', 'Create', 'Edit', 'Approve', 'Export', 'Print'],
      'Author Royalties & Advances': ['View', 'Create', 'Edit', 'Approve', 'Export'],
      'Financial Reports & MIS': ['View', 'Export'],
    },
  },
  {
    id: 'role_10',
    name: 'Royalty Manager',
    roleType: 'ROYALTY_MANAGER',
    description: 'Author royalty statement runs, slab calculations, advance adjustments, and TDS slips.',
    dataScope: 'COMPANY',
    isSystem: true,
    permissions: {
      'Author Royalties & Advances': ['View', 'Create', 'Edit', 'Approve', 'Post', 'Export', 'Print'],
      'Books & ISBN Catalogue': ['View', 'Export'],
      'Accounting & General Ledger': ['View', 'Create'],
      'Financial Reports & MIS': ['View', 'Export', 'Print'],
    },
  },
  {
    id: 'role_11',
    name: 'Distributor Manager',
    roleType: 'DISTRIBUTOR_MANAGER',
    description: 'Regional book distributor accounts, consignment returns, and depot supplies.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Sales & Distribution Orders': ['View', 'Create', 'Edit', 'Approve', 'Export', 'Print'],
      'Inventory & Godowns': ['View', 'Export'],
      'Returns & Financial Adjustments': ['View', 'Create', 'Export'],
    },
  },
  {
    id: 'role_12',
    name: 'Cashier',
    roleType: 'CASHIER',
    description: 'Retail counter billing and cash receipts reconciliation.',
    dataScope: 'BRANCH',
    isSystem: true,
    permissions: {
      'Accounting & General Ledger': ['View', 'Create', 'Print'],
      'Sales & Distribution Orders': ['View', 'Create', 'Print'],
      'Banking & Cash Management': ['View', 'Create', 'Print'],
    },
  },
  {
    id: 'role_13',
    name: 'Auditor',
    roleType: 'AUDITOR',
    description: 'Statutory compliance and financial statement inspection (strictly read-only).',
    dataScope: 'COMPANY',
    isSystem: true,
    permissions: {
      'Accounting & General Ledger': ['View', 'Export', 'Print'],
      'Financial Reports & MIS': ['View', 'Export', 'Print'],
      'Author Royalties & Advances': ['View', 'Export', 'Print'],
      'Procurement & Vendor Bills': ['View', 'Export', 'Print'],
      'Sales & Distribution Orders': ['View', 'Export', 'Print'],
      'GST & Indian Taxation': ['View', 'Export', 'Print'],
      'Banking & Cash Management': ['View', 'Export', 'Print'],
    },
  },
  {
    id: 'role_14',
    name: 'Viewer',
    roleType: 'VIEWER',
    description: 'Minimal access to book catalog and operational summaries.',
    dataScope: 'OWN',
    isSystem: true,
    permissions: {
      'Books & ISBN Catalogue': ['View', 'Print'],
      'Financial Reports & MIS': ['View'],
    },
  },
];

const ROLES_STORAGE_KEY = 'kibo360_dynamic_roles_v2';
const USERS_STORAGE_KEY = 'kibo360_users_list_v2';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  branchName: string;
  isActive: boolean;
  twoFactorEnabled?: boolean;
}

export const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'usr_enterprise_super_admin',
    fullName: 'KIBO360 Principal Administrator',
    email: 'admin@kibo360.com',
    username: 'admin',
    role: 'Super Administrator',
    department: 'Executive Board',
    branchName: 'Headquarters & Central Depot',
    isActive: true,
    twoFactorEnabled: true,
  },
  {
    id: 'usr_finance_controller',
    fullName: 'Dr. Alok Verma, CA',
    email: 'finance@apexpublishers.com',
    username: 'finance_head',
    role: 'Finance Manager',
    department: 'Finance & Accounts',
    branchName: 'Headquarters & Central Depot',
    isActive: true,
    twoFactorEnabled: false,
  },
  {
    id: 'usr_senior_accountant',
    fullName: 'Sunita Mehra',
    email: 'accountant@apexpublishers.com',
    username: 'accountant_hq',
    role: 'Accountant',
    department: 'Finance & Accounts',
    branchName: 'Headquarters & Central Depot',
    isActive: true,
    twoFactorEnabled: false,
  },
  {
    id: 'usr_royalty_manager',
    fullName: 'Vikramaditya Sengupta',
    email: 'royalties@apexpublishers.com',
    username: 'royalty_exec',
    role: 'Royalty Manager',
    department: 'Author Contracts & Editorial',
    branchName: 'Headquarters & Central Depot',
    isActive: true,
    twoFactorEnabled: false,
  },
  {
    id: 'usr_branch_mumbai_sales',
    fullName: 'Rajesh K. Patil',
    email: 'mumbai.sales@apexpublishers.com',
    username: 'mumbai_sales',
    role: 'Sales Manager',
    department: 'Trade Sales & Distribution',
    branchName: 'Western Zonal Depot (Bhiwandi)',
    isActive: true,
    twoFactorEnabled: false,
  },
  {
    id: 'usr_competitor_corp',
    fullName: 'Kiran Patel & Associates',
    email: 'auditor@nationalbooks.in',
    username: 'auditor_national',
    role: 'Auditor',
    department: 'Statutory Audit',
    branchName: 'Mumbai Central Depot',
    isActive: true,
    twoFactorEnabled: false,
  },
];

// Helper functions for reading/writing dynamic roles
export function getStoredRoles(): RoleDefinition[] {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored roles:', err);
  }
  return DEFAULT_ENTERPRISE_ROLES;
}

export function saveStoredRoles(roles: RoleDefinition[]): void {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (err) {
    console.error('Could not save roles to localStorage:', err);
  }
}

// Helper functions for reading/writing users
export function getStoredUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored users:', err);
  }
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: UserRecord[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Could not save users to localStorage:', err);
  }
}

export function assignUserRole(userId: string, newRoleName: string): UserRecord[] {
  const users = getStoredUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, role: newRoleName };
    }
    return u;
  });
  saveStoredUsers(updated);
  return updated;
}
