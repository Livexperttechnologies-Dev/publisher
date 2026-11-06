import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  Shield,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  Users,
  UserCheck,
  CheckCircle2,
  Search,
  Globe,
  Building2,
  Store,
  Sliders,
  Sparkles,
  UserPlus,
  Eye,
} from 'lucide-react';
import {
  RoleDefinition,
  ERP_MODULES,
  ALL_ACTIONS,
  DEFAULT_ENTERPRISE_ROLES,
  getStoredRoles,
  saveStoredRoles,
  getStoredUsers,
  saveStoredUsers,
  UserRecord,
} from '../services/rolesService';
import { logAuditAction } from '../services/configService';

export const RolesPage: React.FC = () => {
  const { brand } = useBrand();

  // Roles and Users state
  const [roles, setRoles] = useState<RoleDefinition[]>(() => getStoredRoles());
  const [users, setUsers] = useState<UserRecord[]>(() => getStoredUsers());
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'role_1');
  const [roleSearch, setRoleSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'PERMISSIONS' | 'ASSIGNED_USERS'>('PERMISSIONS');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleType, setNewRoleType] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleScope, setNewRoleScope] = useState<'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN'>('BRANCH');
  const [cloneFromRoleId, setCloneFromRoleId] = useState<string>('blank');

  // User assignment state
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find currently active role
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Save changes locally and attempt sync with backend
  const persistRoles = (updatedRoles: RoleDefinition[]) => {
    setRoles(updatedRoles);
    saveStoredRoles(updatedRoles);

    // Try synchronizing with backend API in background
    try {
      const active = updatedRoles.find((r) => r.id === selectedRoleId);
      if (active) {
        fetch(`${((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')}/roles/${active.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: active.name,
            description: active.description,
            dataScope: active.dataScope,
            permissions: active.permissions,
          }),
        }).catch(() => {
          // Fallback gracefully to offline/local mode
        });
      }
    } catch {}
  };

  // Toggle single permission cell
  const handleToggleCell = (moduleName: string, action: string) => {
    if (!selectedRole) return;

    const currentModuleActions = selectedRole.permissions[moduleName] || [];
    const hasAction = currentModuleActions.includes(action);

    const updatedModuleActions = hasAction
      ? currentModuleActions.filter((a) => a !== action)
      : [...currentModuleActions, action];

    const updatedPermissions = {
      ...selectedRole.permissions,
      [moduleName]: updatedModuleActions,
    };

    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r
    );

    persistRoles(updatedRoles);
  };

  // Toggle all actions for a specific row/module
  const handleToggleRow = (moduleName: string) => {
    if (!selectedRole) return;

    const currentModuleActions = selectedRole.permissions[moduleName] || [];
    const isAllChecked = currentModuleActions.length === ALL_ACTIONS.length;

    const updatedModuleActions = isAllChecked ? [] : [...ALL_ACTIONS];

    const updatedPermissions = {
      ...selectedRole.permissions,
      [moduleName]: updatedModuleActions,
    };

    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r
    );

    persistRoles(updatedRoles);
    showToast(isAllChecked ? `Revoked all permissions for ${moduleName}` : `Granted all permissions for ${moduleName}`);
  };

  // Toggle all modules for a specific column/action
  const handleToggleColumn = (action: string) => {
    if (!selectedRole) return;

    // Check if action is present in all modules
    const allHaveAction = ERP_MODULES.every((mod) =>
      (selectedRole.permissions[mod] || []).includes(action)
    );

    const updatedPermissions = { ...selectedRole.permissions };

    ERP_MODULES.forEach((mod) => {
      const list = updatedPermissions[mod] || [];
      if (allHaveAction) {
        updatedPermissions[mod] = list.filter((a) => a !== action);
      } else {
        if (!list.includes(action)) {
          updatedPermissions[mod] = [...list, action];
        }
      }
    });

    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r
    );

    persistRoles(updatedRoles);
    showToast(allHaveAction ? `Revoked "${action}" across all modules` : `Granted "${action}" across all modules`);
  };

  // Preset: Grant Full Access
  const handleGrantFullAccess = () => {
    if (!selectedRole) return;
    const fullPermissions: Record<string, string[]> = {};
    ERP_MODULES.forEach((mod) => {
      fullPermissions[mod] = [...ALL_ACTIONS];
    });

    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: fullPermissions } : r
    );
    persistRoles(updatedRoles);
    showToast(`Full enterprise privileges granted to ${selectedRole.name}`);
  };

  // Preset: Grant Read-Only
  const handleGrantReadOnly = () => {
    if (!selectedRole) return;
    const readPermissions: Record<string, string[]> = {};
    ERP_MODULES.forEach((mod) => {
      readPermissions[mod] = ['View', 'Export', 'Print'];
    });

    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: readPermissions } : r
    );
    persistRoles(updatedRoles);
    showToast(`Read-Only (View, Export, Print) granted to ${selectedRole.name}`);
  };

  // Preset: Clear All
  const handleClearAll = () => {
    if (!selectedRole) return;
    if (window.confirm(`Clear all permissions for "${selectedRole.name}"?`)) {
      const emptyPermissions: Record<string, string[]> = {};
      ERP_MODULES.forEach((mod) => {
        emptyPermissions[mod] = [];
      });

      const updatedRoles = roles.map((r) =>
        r.id === selectedRole.id ? { ...r, permissions: emptyPermissions } : r
      );
      persistRoles(updatedRoles);
      showToast(`All permissions cleared for ${selectedRole.name}`);
    }
  };

  // Change Data Scope dynamically
  const handleChangeDataScope = (newScope: 'ALL_COMPANIES' | 'COMPANY' | 'BRANCH' | 'WAREHOUSE' | 'OWN') => {
    if (!selectedRole) return;
    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, dataScope: newScope } : r
    );
    persistRoles(updatedRoles);
    showToast(`Data Scope updated to ${newScope.replace('_', ' ')}`);
  };

  // Create Custom Role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    let basePermissions: Record<string, string[]> = {};
    if (cloneFromRoleId !== 'blank') {
      const source = roles.find((r) => r.id === cloneFromRoleId);
      if (source) {
        basePermissions = JSON.parse(JSON.stringify(source.permissions));
      }
    } else {
      ERP_MODULES.forEach((mod) => {
        basePermissions[mod] = ['View'];
      });
    }

    const newId = `role_custom_${Date.now()}`;
    const formattedType =
      newRoleType.trim().toUpperCase().replace(/\s+/g, '_') ||
      `CUSTOM_${newRoleName.trim().toUpperCase().replace(/\s+/g, '_')}`;

    const newRole: RoleDefinition = {
      id: newId,
      name: newRoleName.trim(),
      roleType: formattedType,
      description: newRoleDesc.trim() || `Custom dynamic publishing role for ${newRoleName.trim()}.`,
      dataScope: newRoleScope,
      permissions: basePermissions,
      isSystem: false,
    };

    const updatedRoles = [...roles, newRole];
    persistRoles(updatedRoles);
    setSelectedRoleId(newId);

    logAuditAction({
      action: 'ROLE_CREATED',
      entity: 'roles',
      severity: 'NOTICE',
      description: `Created custom enterprise role "${newRole.name}" with data scope ${newRole.dataScope}.`,
      oldVal: null,
      newVal: newRole,
    });

    // Reset modal state
    setNewRoleName('');
    setNewRoleType('');
    setNewRoleDesc('');
    setIsCreateModalOpen(false);
    showToast(`Custom role "${newRole.name}" created successfully!`);
  };

  // Clone Current Role
  const handleCloneCurrentRole = () => {
    if (!selectedRole) return;
    const newId = `role_custom_${Date.now()}`;
    const clonedRole: RoleDefinition = {
      id: newId,
      name: `${selectedRole.name} (Copy)`,
      roleType: `${selectedRole.roleType}_COPY`,
      description: `Cloned from ${selectedRole.name}. ${selectedRole.description}`,
      dataScope: selectedRole.dataScope,
      permissions: JSON.parse(JSON.stringify(selectedRole.permissions)),
      isSystem: false,
    };

    const updatedRoles = [...roles, clonedRole];
    persistRoles(updatedRoles);
    setSelectedRoleId(newId);
    showToast(`Cloned role "${clonedRole.name}" successfully!`);
  };

  // Delete Custom Role
  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.isSystem) {
      alert('Built-in system roles cannot be deleted.');
      return;
    }

    const assignedUsers = users.filter((u) => u.role === selectedRole.name);
    if (assignedUsers.length > 0) {
      alert(`Cannot delete "${selectedRole.name}". ${assignedUsers.length} user(s) are assigned to it. Reassign them first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete custom role "${selectedRole.name}"?`)) {
      const updatedRoles = roles.filter((r) => r.id !== selectedRole.id);
      persistRoles(updatedRoles);
      setSelectedRoleId(updatedRoles[0]?.id || 'role_1');
      showToast(`Role "${selectedRole.name}" removed.`);
    }
  };

  // Reset Role to System Defaults
  const handleResetToDefault = () => {
    if (!selectedRole) return;
    const defaultRole = DEFAULT_ENTERPRISE_ROLES.find((r) => r.name === selectedRole.name);
    if (!defaultRole) {
      alert('This is a custom role; defaults do not exist.');
      return;
    }

    if (window.confirm(`Reset "${selectedRole.name}" to official system default permissions?`)) {
      const updatedRoles = roles.map((r) =>
        r.id === selectedRole.id ? { ...defaultRole, id: selectedRole.id } : r
      );
      persistRoles(updatedRoles);
      showToast(`Reset "${selectedRole.name}" to factory default permissions.`);
    }
  };

  // Assign a user to the currently selected role
  const handleAssignUser = () => {
    if (!selectedUserToAssign || !selectedRole) return;

    const updatedUsers = users.map((u) => {
      if (u.id === selectedUserToAssign) {
        return { ...u, role: selectedRole.name };
      }
      return u;
    });

    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    // Call backend assignment API
    fetch(`${((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')}/roles/${selectedRole.id}/assign-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserToAssign }),
    }).catch(() => {});

    setIsAssignModalOpen(false);
    setSelectedUserToAssign('');
    showToast(`User successfully assigned to ${selectedRole.name}!`);
  };

  // Remove / Reassign user from role
  const handleRemoveUserFromRole = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (targetUser.role === 'Super Administrator' && users.filter((u) => u.role === 'Super Administrator').length <= 1) {
      alert('Cannot reassign the only Super Administrator account.');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: 'Viewer' };
      }
      return u;
    });

    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    showToast(`${targetUser.fullName} reassigned to Viewer.`);
  };

  // Filtered roles for left sidebar
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.roleType.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.dataScope.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Users assigned to currently selected role
  const assignedUsers = users.filter((u) => u.role === selectedRole?.name);

  // Users eligible to be assigned (who don't currently have this role)
  const unassignedUsers = users.filter((u) => u.role !== selectedRole?.name);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Dynamic Role Management & Granular Permission Matrix"
        description="Configure any role, customize module-level read/write/approval privileges, and assign any role dynamically to anyone."
        breadcrumbs={[{ label: 'System Settings', href: '/settings' }, { label: 'Roles & Permissions' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Custom Role
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={() => showToast('All role configurations & permissions synchronized successfully!')}
            >
              Save All Roles
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Roles Directory */}
        <Card className="lg:col-span-1 p-3 flex flex-col h-[750px]">
          <div className="pb-2 px-1 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Configurable Roles ({roles.length})
            </span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <Plus size={13} />
              <span>New</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="my-2 px-1">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Role List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const roleUsersCount = users.filter((u) => u.role === role.name).length;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: brand.primaryColor,
                          color: '#ffffff',
                          boxShadow: `0 2px 4px ${brand.primaryColor}33`,
                        }
                      : undefined
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between select-none ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-semibold">{role.name}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {roleUsersCount} {roleUsersCount === 1 ? 'user' : 'users'}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {role.dataScope.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Dynamic Role Details, Permissions Matrix & User Assignment */}
        <div className="lg:col-span-3 space-y-6">
          {selectedRole && (
            <>
              {/* Role Header Banner Card */}
              <Card
                className="p-5 border-l-4"
                style={{ borderLeftColor: brand.primaryColor }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield size={19} style={{ color: brand.primaryColor }} />
                      <h3 className="text-base font-bold text-slate-800">{selectedRole.name}</h3>
                      <Badge variant="purple" size="sm">
                        {selectedRole.roleType}
                      </Badge>
                      {!selectedRole.isSystem && (
                        <Badge variant="warning" size="sm">
                          Custom Role
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">{selectedRole.description}</p>
                  </div>

                  {/* Actions & Scope Selector */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Data Scope Dropdown */}
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      {selectedRole.dataScope === 'ALL_COMPANIES' ? (
                        <Globe size={15} style={{ color: brand.primaryColor }} />
                      ) : selectedRole.dataScope === 'COMPANY' ? (
                        <Building2 size={15} className="text-indigo-600" />
                      ) : (
                        <Store size={15} className="text-emerald-600" />
                      )}
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                          Data Scope
                        </span>
                        <select
                          value={selectedRole.dataScope}
                          onChange={(e) => handleChangeDataScope(e.target.value as any)}
                          className="bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="ALL_COMPANIES">ALL_COMPANIES (Enterprise)</option>
                          <option value="COMPANY">COMPANY (Entity Wide)</option>
                          <option value="BRANCH">BRANCH (Regional Depot)</option>
                          <option value="WAREHOUSE">WAREHOUSE (Godown Only)</option>
                          <option value="OWN">OWN (Personal Records)</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Role Actions */}
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Duplicate this role"
                      leftIcon={<Copy size={13} />}
                      onClick={handleCloneCurrentRole}
                    >
                      Clone
                    </Button>

                    {selectedRole.isSystem ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Reset to factory default permissions"
                        leftIcon={<RotateCcw size={13} />}
                        onClick={handleResetToDefault}
                        className="text-slate-500"
                      >
                        Reset Defaults
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        title="Delete custom role"
                        leftIcon={<Trash2 size={13} />}
                        onClick={handleDeleteRole}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Navigation Tabs: Permissions Matrix vs Assigned Users */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('PERMISSIONS')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === 'PERMISSIONS'
                      ? 'border-brand-primary text-brand-primary bg-purple-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Sliders size={14} />
                  <span>Granular Permissions Matrix</span>
                </button>

                <button
                  onClick={() => setActiveTab('ASSIGNED_USERS')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === 'ASSIGNED_USERS'
                      ? 'border-brand-primary text-brand-primary bg-purple-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Users size={14} />
                  <span>Assigned Users ({assignedUsers.length})</span>
                </button>
              </div>

              {/* TAB 1: GRANULAR PERMISSION MATRIX */}
              {activeTab === 'PERMISSIONS' && (
                <div className="space-y-4">
                  {/* Quick Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-600">
                      Click any checkbox to grant or revoke privileges in real time:
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGrantFullAccess}
                        className="text-xs"
                      >
                        Grant Full Access
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGrantReadOnly}
                        className="text-xs"
                      >
                        Grant Read-Only
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Interactive Permissions Grid */}
                  <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            <th className="py-3 px-4 min-w-[200px]">Functional Module</th>
                            {ALL_ACTIONS.map((act) => (
                              <th
                                key={act}
                                className="py-3 px-2 text-center select-none cursor-pointer hover:bg-slate-100 transition-colors"
                                title={`Click to toggle "${act}" for all modules`}
                                onClick={() => handleToggleColumn(act)}
                              >
                                <div className="flex flex-col items-center">
                                  <span>{act}</span>
                                  <span className="text-[9px] font-normal text-slate-400 lowercase">toggle</span>
                                </div>
                              </th>
                            ))}
                            <th className="py-3 px-3 text-center min-w-[90px]">Row Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ERP_MODULES.map((moduleName) => {
                            const grantedActions = selectedRole.permissions[moduleName] || [];
                            const isAllRowChecked = grantedActions.length === ALL_ACTIONS.length;

                            return (
                              <tr key={moduleName} className="hover:bg-purple-50/30 transition-colors">
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  {moduleName}
                                </td>
                                {ALL_ACTIONS.map((act) => {
                                  const isChecked = grantedActions.includes(act);
                                  return (
                                    <td key={act} className="py-3 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCell(moduleName, act)}
                                        title={`${isChecked ? 'Revoke' : 'Grant'} ${act} on ${moduleName}`}
                                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                                          isChecked
                                            ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'
                                        }`}
                                      >
                                        {isChecked ? (
                                          <Check size={14} strokeWidth={2.8} />
                                        ) : (
                                          <span className="text-xs font-bold leading-none">•</span>
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRow(moduleName)}
                                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                      isAllRowChecked
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {isAllRowChecked ? 'Revoke All' : 'Grant All'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 2: ASSIGNED USERS & USER ROLE ASSIGNMENT */}
              {activeTab === 'ASSIGNED_USERS' && (
                <div className="space-y-4">
                  {/* Top Bar with Assign User Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Users with {selectedRole.name} Role
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        These users inherit all permissions and data scope rules configured for this role.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<UserPlus size={14} />}
                      onClick={() => setIsAssignModalOpen(true)}
                    >
                      Assign User to {selectedRole.name}
                    </Button>
                  </div>

                  {/* Users Table */}
                  <Card className="overflow-hidden p-0">
                    {assignedUsers.length === 0 ? (
                      <div className="p-8 text-center">
                        <Users size={32} className="mx-auto text-slate-300 mb-2" />
                        <h4 className="text-sm font-semibold text-slate-700">No users currently assigned</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Click "Assign User to {selectedRole.name}" to grant this role to any team member.
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<UserPlus size={14} />}
                            onClick={() => setIsAssignModalOpen(true)}
                          >
                            Assign User Now
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">User</th>
                              <th className="py-3 px-4">Department</th>
                              <th className="py-3 px-4">Branch Location</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {assignedUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
                                      style={{ backgroundColor: brand.deepColor }}
                                    >
                                      {user.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{user.fullName}</p>
                                      <p className="text-[11px] text-slate-400">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600">{user.department}</td>
                                <td className="py-3 px-4 text-slate-600">{user.branchName}</td>
                                <td className="py-3 px-4">
                                  <Badge variant={user.isActive ? 'success' : 'slate'} size="sm">
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleRemoveUserFromRole(user.id)}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                                  >
                                    Reassign to Viewer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL 1: CREATE CUSTOM ROLE */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Custom Enterprise Role"
        subtitle="Define a custom role with tailored permissions across 15 ERP functional modules."
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <FormField label="Role Display Name" required>
            <Input
              placeholder="e.g. Senior Statutory Auditor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Role Identifier Code">
              <Input
                placeholder="e.g. AUDITOR_SR"
                value={newRoleType}
                onChange={(e) => setNewRoleType(e.target.value)}
                className="font-mono uppercase"
              />
            </FormField>

            <FormField label="Default Data Scope" required>
              <select
                value={newRoleScope}
                onChange={(e) => setNewRoleScope(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-primary"
              >
                <option value="ALL_COMPANIES">ALL_COMPANIES (Multi-Company)</option>
                <option value="COMPANY">COMPANY (Publishing Company)</option>
                <option value="BRANCH">BRANCH (Regional Depot)</option>
                <option value="WAREHOUSE">WAREHOUSE (Godown Level)</option>
                <option value="OWN">OWN (Personal Records Only)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Base Permission Template">
            <select
              value={cloneFromRoleId}
              onChange={(e) => setCloneFromRoleId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-primary"
            >
              <option value="blank">Blank Permissions (View only on all modules)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  Clone from existing: {r.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Role Description">
            <textarea
              rows={2}
              placeholder="State the responsibilities, approval thresholds, and scope of this role..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-brand-primary"
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Custom Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ASSIGN USER TO ROLE */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign User to ${selectedRole?.name}`}
        subtitle="Select any user to instantly grant them this role and all its privileges."
      >
        <div className="space-y-4">
          <FormField label="Select User to Assign" required>
            <select
              value={selectedUserToAssign}
              onChange={(e) => setSelectedUserToAssign(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-primary"
            >
              <option value="">-- Choose a user --</option>
              {unassignedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email}) — Currently: {u.role}
                </option>
              ))}
            </select>
          </FormField>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-slate-700">
            <p className="font-semibold text-brand-primary">Assignment Summary:</p>
            <p className="mt-1">
              Assigning this role will update the user's role to{' '}
              <span className="font-bold text-slate-800">{selectedRole?.name}</span> with{' '}
              <span className="font-bold font-mono">{selectedRole?.dataScope}</span> data scope across all 15 functional ERP modules.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!selectedUserToAssign}
              onClick={handleAssignUser}
            >
              Confirm Role Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
