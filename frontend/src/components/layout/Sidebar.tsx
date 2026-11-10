import React, { useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LucideIcon,
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
  sidebarWidth?: number;
  setSidebarWidth?: (width: number) => void;
  isResizing?: boolean;
  setIsResizing?: (resizing: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
  sidebarWidth = 264,
  setSidebarWidth,
  isResizing = false,
  setIsResizing,
}) => {
  const location = useLocation();
  const nonDashboardPaths = [
    '/accounts',
    '/vouchers',
    '/catalogue',
    '/books',
    '/publishing',
    '/inventory',
    '/sales',
    '/pos',
    '/invoicing',
    '/distributors',
    '/royalties',
    '/purchases',
    '/taxation',
    '/banking',
    '/expenses',
    '/returns',
    '/reports',
    '/notifications',
    '/company-config',
    '/users',
    '/roles',
    '/security',
    '/profile',
    '/settings',
  ];
  const isDashboardRoute = !nonDashboardPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  const navGroups: NavGroup[] = [
    {
      items: [{ name: 'Financial Dashboard', path: '/', icon: LayoutDashboard }],
    },
    {
      label: 'Accounting & Ledger',
      items: [
        { name: 'Chart of Accounts', path: '/accounts', icon: Layers },
        { name: 'Journal & Vouchers', path: '/vouchers', icon: Receipt },
        { name: 'Banking & Cash', path: '/banking', icon: Landmark },
        { name: 'Expenses & Assets', path: '/expenses', icon: Wallet },
      ],
    },
    {
      label: 'Publishing & Catalogue',
      items: [
        { name: 'Book Catalogue & ISBN', path: '/catalogue', icon: BookOpen },
        { name: 'Publishing & Production', path: '/publishing', icon: Printer },
        { name: 'Author Royalties', path: '/royalties', icon: Feather },
      ],
    },
    {
      label: 'Inventory & Distribution',
      items: [
        { name: 'Inventory & Godowns', path: '/inventory', icon: PackageCheck },
        { name: 'Sales & Invoicing', path: '/sales', icon: FileSpreadsheet },
        { name: 'Distributors & Dealers', path: '/distributors', icon: Truck },
        { name: 'Purchases & Bills', path: '/purchases', icon: ShoppingCart },
        { name: 'Returns & Adjustments', path: '/returns', icon: RotateCcw },
      ],
    },
    {
      label: 'Compliance & MIS',
      items: [
        { name: 'GST & Indian Taxation', path: '/taxation', icon: Percent },
        { name: 'Financial Reports', path: '/reports', icon: PieChart },
        { name: 'Notifications & Alerts', path: '/notifications', icon: Bell },
      ],
    },
    {
      label: 'Administration',
      items: [
        { name: 'Company & Branches', path: '/company-config', icon: Settings },
        { name: 'User Management', path: '/users', icon: Users },
        { name: 'Roles & Permissions', path: '/roles', icon: ShieldCheck },
        { name: 'Security & Audit', path: '/security', icon: ShieldAlert },
      ],
    },
  ];

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!setIsResizing || !setSidebarWidth) return;
      setIsResizing(true);
    },
    [setIsResizing, setSidebarWidth]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!setSidebarWidth) return;
      const newWidth = e.clientX;
      if (newWidth < 130) {
        if (!collapsed) setCollapsed(true);
      } else {
        if (collapsed) setCollapsed(false);
        const clamped = Math.min(Math.max(newWidth, 210), 420);
        setSidebarWidth(clamped);
      }
    };

    const handleMouseUp = () => {
      if (setIsResizing) setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, collapsed, setCollapsed, setSidebarWidth, setIsResizing]);

  const currentWidth = collapsed ? 80 : sidebarWidth;

  return (
    <aside
      style={{
        width: `${currentWidth}px`,
        background: 'linear-gradient(180deg, #1B0D2C 0%, #140922 55%, #11071D 100%)',
      }}
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/[0.08] shadow-2xl select-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}`}
    >
      {/* Custom Thin Dark Scrollbar Styling */}
      <style>{`
        .kibo-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .kibo-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .kibo-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
        }
        .kibo-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* Top Centered Brand Logo Header (Matching Reference Image) */}
      <div
        className={`relative flex items-center justify-center shrink-0 transition-all ${
          collapsed ? 'h-16 px-2 border-b border-white/[0.08]' : 'pt-6 pb-4 px-4'
        }`}
      >
        {collapsed ? (
          <img
            src="/favicon.png"
            alt="KIBO360"
            className="h-8 w-8 object-contain transition-transform hover:scale-105"
          />
        ) : (
          <img
            src="/kibo360-logo-white.png"
            alt="KIBO360 - One Platform. Every Business."
            className="h-11 w-auto max-w-[155px] object-contain mx-auto transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/kibo360-logo.png';
            }}
          />
        )}

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links with Grouped Sections & Subtle Watermark */}
      <div className={`kibo-sidebar-scroll relative flex-1 overflow-y-auto space-y-1 ${collapsed ? 'px-2 py-3' : 'px-3.5 py-4'}`}>
        {navGroups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={
              groupIdx > 0
                ? collapsed
                  ? 'pt-2 mt-2 border-t border-white/[0.08]'
                  : 'pt-3 mt-3 border-t border-white/[0.07]'
                : ''
            }
          >
            {group.label && !collapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#847799] truncate">
                {group.label}
              </div>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isItemActive =
                  item.path === '/'
                    ? isDashboardRoute
                    : location.pathname === item.path ||
                      location.pathname.startsWith(item.path + '/');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    style={
                      isItemActive
                        ? {
                            background:
                              'linear-gradient(135deg, #D94676 0%, #C83E6B 55%, #E05368 100%)',
                            boxShadow:
                              'inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 4px 14px rgba(217, 70, 118, 0.35)',
                          }
                        : undefined
                    }
                    className={`relative flex items-center transition-all duration-150 group ${
                      collapsed
                        ? 'w-11 h-11 mx-auto justify-center rounded-2xl p-0'
                        : 'w-full px-3.5 py-2.5 justify-between rounded-full text-[13px] font-medium'
                    } ${
                      isItemActive
                        ? 'text-white font-semibold'
                        : 'text-[#D7CFE3] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        collapsed ? 'justify-center' : 'gap-3 min-w-0'
                      }`}
                    >
                      <item.icon
                        size={collapsed ? 20 : 18}
                        className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                          isItemActive ? 'text-white' : 'text-[#B5ABC6] group-hover:text-white'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>
                    {!collapsed && !isItemActive && item.path !== '/' && (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-[#7A6E8F] group-hover:text-white/80 group-hover:translate-x-0.5 transition-all"
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Subtle Bottom Watermark Logo Matching Reference Image */}
        {!collapsed && (
          <div className="pointer-events-none pt-6 pb-2 flex justify-center opacity-[0.06] select-none">
            <img
              src="/kibo360-logo-white.png"
              alt=""
              aria-hidden="true"
              className="w-44 h-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Bottom Collapse Footer Button */}
      <div className="h-14 border-t border-white/[0.08] px-3 flex items-center shrink-0">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center text-xs font-medium text-[#9A8FB0] hover:text-white transition-colors cursor-pointer ${
            collapsed
              ? 'w-11 h-11 mx-auto justify-center rounded-xl hover:bg-white/[0.06]'
              : 'w-full gap-2.5 px-3 py-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Desktop Right-Edge Resizable Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
        className={`hidden lg:flex absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize items-center justify-center group z-50 transition-colors ${
          isResizing ? 'bg-[#E91E63]/60' : 'hover:bg-[#E91E63]/40'
        }`}
      >
        <div
          className={`h-10 w-0.5 rounded-full transition-all ${
            isResizing
              ? 'bg-[#F06A64] opacity-100 scale-y-125'
              : 'bg-white/20 opacity-0 group-hover:opacity-100'
          }`}
        />
      </div>
    </aside>
  );
};
