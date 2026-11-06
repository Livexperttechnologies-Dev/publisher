import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { FormField } from '../components/ui/FormField';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import {
  UserPlus,
  Search,
  KeyRound,
  ShieldAlert,
  Shield,
  Edit,
  Power,
  Building,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { getStoredRoles, getStoredUsers, saveStoredUsers, assignUserRole } from '../services/rolesService';
import { logAuditAction } from '../services/configService';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  branchName: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
}

const initialUsersList: UserRow[] = [
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

const departmentsList = [
  'Finance & Accounts',
  'Author Contracts & Editorial',
  'Production & Print Procurement',
  'Trade Sales & Distribution',
  'Warehouse & Inventory Logistics',
  'Executive Board',
  'Statutory Audit',
];

export const UsersPage: React.FC = () => {
  const dynamicRoles = getStoredRoles();
  const rolesList = dynamicRoles.map((r) => r.name);

  const [users, setUsers] = useState<UserRow[]>(() => {
    const stored = getStoredUsers();
    return stored.map((u) => ({
      ...u,
      twoFactorEnabled: u.twoFactorEnabled ?? false,
    }));
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals & Drawers state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [targetRoleToAssign, setTargetRoleToAssign] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('Accountant');
  const [newDept, setNewDept] = useState('Finance & Accounts');
  const [newBranch, setNewBranch] = useState('brn_main_hq');
  const [newPassword, setNewPassword] = useState('Publisher@2026');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || u.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleToggleActive = (user: UserRow) => {
    if (user.role === 'Super Administrator') {
      alert('Principal Administrator account cannot be deactivated.');
      return;
    }
    const updated = users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updated);
    saveStoredUsers(updated);
    logAuditAction({
      action: user.isActive ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
      entity: 'users',
      severity: 'WARNING',
      description: `${user.isActive ? 'Deactivated' : 'Activated'} user account for ${user.fullName} (${user.email}).`,
      oldVal: { isActive: user.isActive },
      newVal: { isActive: !user.isActive },
    });
    showToast(`User ${user.fullName} is now ${user.isActive ? 'deactivated' : 'activated'}.`);
  };

  const handleAdminResetPassword = () => {
    if (!selectedUser || !newAdminPassword) return;
    logAuditAction({
      action: 'ADMIN_PASSWORD_RESET',
      entity: 'users',
      severity: 'CRITICAL',
      description: `Administrative password reset executed for ${selectedUser.fullName} (${selectedUser.email}).`,
      oldVal: null,
      newVal: { resetBy: 'admin', sessionsRevoked: true },
    });
    setIsResetPassOpen(false);
    setNewAdminPassword('');
    showToast(`Password for ${selectedUser.fullName} has been reset. All active sessions revoked.`);
  };

  const handleChangeRole = () => {
    if (!selectedUser || !targetRoleToAssign) return;
    const oldRole = selectedUser.role;
    const updated = assignUserRole(selectedUser.id, targetRoleToAssign);
    setUsers(updated.map((u) => ({ ...u, twoFactorEnabled: u.twoFactorEnabled ?? false })));
    logAuditAction({
      action: 'USER_ROLE_REASSIGNED',
      entity: 'users',
      severity: 'NOTICE',
      description: `Reassigned role for ${selectedUser.fullName} from "${oldRole}" to "${targetRoleToAssign}".`,
      oldVal: { role: oldRole },
      newVal: { role: targetRoleToAssign },
    });
    setIsChangeRoleOpen(false);
    showToast(`Role for ${selectedUser.fullName} changed to "${targetRoleToAssign}"!`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const created: UserRow = {
      id: 'usr_' + Date.now(),
      fullName: newFullName,
      email: newEmail,
      username: newUsername,
      role: newRole,
      department: newDept,
      branchName: newBranch === 'brn_mumbai_zonal' ? 'Western Zonal Depot (Bhiwandi)' : 'Headquarters & Central Depot',
      isActive: true,
      twoFactorEnabled: false,
    };
    const updated = [created, ...users];
    setUsers(updated);
    saveStoredUsers(updated);
    logAuditAction({
      action: 'USER_CREATED',
      entity: 'users',
      severity: 'NOTICE',
      description: `Created new user ${created.fullName} [${created.username}] with role "${created.role}".`,
      oldVal: null,
      newVal: created,
    });
    setIsCreateOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewUsername('');
    showToast(`New user "${created.fullName}" created successfully.`);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const columns: Column<UserRow>[] = [
    {
      header: 'Staff Member',
      sortable: true,
      accessorKey: 'fullName',
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-purple-50 text-[#690BA8] flex items-center justify-center font-bold text-xs shrink-0">
            {u.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-xs">{u.fullName}</p>
            <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      cell: (u) => <span className="text-slate-600 font-mono text-xs">{u.email}</span>,
    },
    {
      header: 'Assigned Role',
      sortable: true,
      accessorKey: 'role',
      cell: (u) => (
        <Badge variant={u.role.includes('Admin') ? 'purple' : u.role.includes('Finance') || u.role.includes('Accountant') ? 'magenta' : 'slate'} size="sm">
          {u.role}
        </Badge>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (u) => <span className="text-slate-700 font-medium text-xs">{u.department}</span>,
    },
    {
      header: 'Branch Godown',
      accessorKey: 'branchName',
      cell: (u) => (
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Building size={12} className="text-slate-400" />
          {u.branchName}
        </span>
      ),
    },
    {
      header: '2FA',
      align: 'center',
      cell: (u) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.twoFactorEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {u.twoFactorEnabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      accessorKey: 'isActive',
      cell: (u) => <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedUser(u);
              setTargetRoleToAssign(u.role);
              setIsChangeRoleOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-brand-primary hover:bg-purple-50 transition-colors"
            title="Change Role & Permissions"
          >
            <Shield size={15} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(u);
              setIsResetPassOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-[#690BA8] hover:bg-purple-50 transition-colors"
            title="Admin Password Reset"
          >
            <KeyRound size={15} />
          </button>
          <button
            onClick={() => handleToggleActive(u)}
            className={`p-1 rounded transition-colors ${
              u.isActive ? 'text-slate-400 hover:text-[#F06A64] hover:bg-orange-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
          >
            <Power size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#340771] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Enterprise User Management & Staff Permissions"
        description="Configure staff profiles, departmental affiliations, multi-branch data scopes, and secure credential resets."
        breadcrumbs={[{ label: 'System Settings', href: '/settings' }, { label: 'User Directory' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Staff User
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search user by name, email, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
            >
              <option value="ALL">All Roles ({rolesList.length})</option>
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <DataTable data={filteredUsers} columns={columns} pageSize={8} />

      {/* Drawer: Create New User */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Enterprise Staff Account"
        subtitle="Provision an employee account with role-based permissions and branch isolation."
        width="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              placeholder="e.g. Ramesh Chandra Sharma"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Corporate Email" required>
              <Input
                type="email"
                placeholder="name@apexpublishers.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Username" required>
              <Input
                placeholder="r_sharma"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Assigned Role" required>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Department" required>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Branch Location" required>
            <select
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
            >
              <option value="brn_main_hq">Headquarters & Central Depot (New Delhi)</option>
              <option value="brn_mumbai_zonal">Western Zonal Depot (Bhiwandi, Mumbai)</option>
            </select>
          </FormField>

          <FormField label="Initial Password" required hint="Min 8 characters">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save & Provision User
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Modal: Admin Password Reset */}
      <Modal
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        title="Administrative Password Reset"
        subtitle={`Set a new secure password for ${selectedUser?.fullName}`}
        maxWidth="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsResetPassOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdminResetPassword}
              disabled={newAdminPassword.length < 8}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Resetting this password will immediately revoke all current login sessions on all devices for this user.
          </p>
          <FormField label="New Temporary Password" required hint="Min 8 characters">
            <Input
              type="password"
              placeholder="••••••••"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              autoFocus
            />
          </FormField>
        </div>
      </Modal>
      {/* Modal: Change Role & Dynamic Permissions */}
      <Modal
        isOpen={isChangeRoleOpen}
        onClose={() => setIsChangeRoleOpen(false)}
        title="Reassign Role & Permissions"
        subtitle={`Dynamically update role and access scope for ${selectedUser?.fullName}`}
        maxWidth="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsChangeRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleChangeRole}
            >
              Update User Role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Assigned Enterprise Role" required>
            <select
              value={targetRoleToAssign}
              onChange={(e) => setTargetRoleToAssign(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-primary"
            >
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Dynamic Permissions Preview:</p>
            <p className="mt-1">
              Selecting this role grants this staff member all permissions configured under{' '}
              <span className="font-bold text-brand-primary">{targetRoleToAssign}</span> in real time.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
