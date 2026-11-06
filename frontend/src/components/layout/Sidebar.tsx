import React from 'react';
import { NavLink } from 'react-router-dom';
import { useBrand } from '../../contexts/BrandContext';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  PackageCheck,
  Printer,
  Feather,
  Truck,
  ShoppingCart,
  Percent,
  Landmark,
  Wallet,
  RotateCcw,
  PieChart,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { brand } = useBrand();
  const navItems = [
    { name: 'Financial Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Chart of Accounts', path: '/accounts', icon: Layers },
    { name: 'Journal & Vouchers', path: '/vouchers', icon: Receipt },
    { name: 'Book Catalogue & ISBN', path: '/catalogue', icon: BookOpen },
    { name: 'Publishing & Production', path: '/publishing', icon: Printer },
    { name: 'Inventory & Godowns', path: '/inventory', icon: PackageCheck },
    { name: 'Sales & Invoicing', path: '/sales', icon: FileSpreadsheet },
    { name: 'Distributors & Dealers', path: '/distributors', icon: Truck },
    { name: 'Author Royalties', path: '/royalties', icon: Feather },
    { name: 'Purchases & Bills', path: '/purchases', icon: ShoppingCart },
    { name: 'GST & Indian Taxation', path: '/taxation', icon: Percent },
    { name: 'Banking & Cash', path: '/banking', icon: Landmark },
    { name: 'Expenses & Assets', path: '/expenses', icon: Wallet },
    { name: 'Returns & Adjustments', path: '/returns', icon: RotateCcw },
    { name: 'Financial Reports', path: '/reports', icon: PieChart },
    { name: 'Notifications & Alerts', path: '/notifications', icon: Bell },
    { name: 'Company & Branches', path: '/company-config', icon: Settings },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Roles & Permissions', path: '/roles', icon: ShieldCheck },
    { name: 'Security & Audit', path: '/security', icon: ShieldAlert },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200 shadow-lg lg:shadow-none transition-all duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header with Dynamic Logo & ERP Subtitle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src={brand.logoUrl || '/kibo360-logo.png'}
            alt={brand.companyName || 'KIBO360'}
            style={{ height: `${brand.logoHeight || 34}px` }}
            className="w-auto object-contain shrink-0 transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/kibo360-logo.png';
            }}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span
                className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[120px]"
                style={{ color: brand.primaryColor }}
              >
                {brand.tagline || 'Publishing ERP'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close navigation"
          >
            <X size={18} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!collapsed ? 'Accounting & Publishing' : '•••'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            style={({ isActive }) =>
              isActive
                ? {
                    backgroundColor: brand.primaryColor,
                    color: '#ffffff',
                    boxShadow: `0 2px 4px ${brand.primaryColor}33`,
                  }
                : undefined
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group select-none ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            <item.icon
              size={19}
              className={`shrink-0 transition-transform group-hover:scale-105`}
            />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Organization Badge Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 m-2 rounded-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: brand.primaryColor }} />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-700 truncate">{brand.companyName || 'Apex Publishers'}</p>
              <p className="text-[10px] text-slate-400">Headquarters Branch</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
