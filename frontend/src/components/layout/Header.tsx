import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../../contexts/BrandContext';
import {
  Search,
  Bell,
  Building2,
  Calendar,
  UserCheck,
  LogOut,
  User,
  Settings,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Menu,
  Palette,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  collapsed: boolean;
  pageTitle?: string;
  setMobileOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  pageTitle = 'Financial Accounting Overview',
  setMobileOpen,
}) => {
  const navigate = useNavigate();
  const { brand } = useBrand();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);

  // Active tenant and branch state
  const [activeCompany, setActiveCompany] = useState('Apex Educational Publishers');
  const [activeBranch, setActiveBranch] = useState('Delhi HQ');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanySwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kibo360_auth');
    navigate('/login');
  };

  const notifications = [
    {
      id: 1,
      title: 'Quarterly Author Royalty Due',
      desc: 'Q2 calculations ready for 98 contracts (₹3,410,500.00)',
      time: '12m ago',
      icon: AlertCircle,
      color: 'text-[#E91E63]',
      bg: 'bg-pink-50',
    },
    {
      id: 2,
      title: 'Bulk Sales Invoice Posted',
      desc: 'Inv #891 (Oxford Book Store) posted to General Ledger',
      time: '1h ago',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 3,
      title: 'Paper Stock Re-order Alert',
      desc: '80 GSM Maplitho reels below minimum threshold in Delhi Godown',
      time: '3h ago',
      icon: FileText,
      color: 'text-[#F06A64]',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6 left-0 ${
        collapsed ? 'lg:left-20' : 'lg:left-64'
      }`}
    >
      {/* Left: Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight truncate max-w-[180px] sm:max-w-none">
          {pageTitle}
        </h1>
        <Badge variant="purple" size="sm" className="hidden sm:inline-flex">
          Enterprise v1.0
        </Badge>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search size={15} className="absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search accounts, ISBN, vouchers, or ledgers... (Ctrl+K)"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm"
        />
      </div>

      {/* Right Actions: Company Switcher, Fiscal Year, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Company & Branch Switcher Dropdown */}
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100/80 transition-colors shadow-sm"
          >
            <Building2 size={14} style={{ color: brand.primaryColor }} />
            <span className="font-semibold text-slate-800 truncate max-w-[130px]">{brand.companyName || activeCompany}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium truncate max-w-[90px]">{activeBranch}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {companySwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Select Publishing Entity</span>
                <div className="mt-1 space-y-1">
                  {[
                    'Apex Educational Publishers & Distributors Ltd.',
                    'National Book Sellers & Academic Supply Corp',
                    'Cambridge Academic Publishing India Ltd.',
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setActiveCompany(c.split(' ')[0] + ' ' + c.split(' ')[1]);
                        setCompanySwitcherOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-purple-50 text-slate-700 truncate"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-3 py-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Select Branch Depot</span>
                <div className="mt-1 space-y-1">
                  {[
                    { label: 'Delhi HQ (Headquarters & Central)', code: 'HQ-DELHI' },
                    { label: 'Bhiwandi Depot (Western Zonal)', code: 'BHW-MUM' },
                    { label: 'Bengaluru Hub (Southern Hub)', code: 'STH-BLR' },
                  ].map((b) => (
                    <button
                      key={b.code}
                      onClick={() => {
                        setActiveBranch(b.label.split(' ')[0]);
                        setCompanySwitcherOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-purple-50 text-slate-700 flex justify-between"
                    >
                      <span>{b.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">{b.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Menu */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E91E63] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E91E63]"></span>
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] text-[#690BA8] font-semibold hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3">
                    <div className={`h-8 w-8 rounded-lg ${n.bg} ${n.color} flex items-center justify-center shrink-0`}>
                      <n.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 focus:outline-none"
          >
            <div
              className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm transition-colors"
              style={{ backgroundColor: brand.deepColor || '#340771' }}
            >
              KA
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Admin User</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <UserCheck size={10} className="text-emerald-500" /> Super Admin
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">KIBO360 Principal Admin</p>
                <p className="text-[11px] text-slate-400 truncate">admin@kibo360.com</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Palette size={14} style={{ color: brand.primaryColor }} />
                  <span className="font-semibold text-slate-800">Dynamic Branding & Theme</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={14} className="text-slate-400" />
                  <span>Enterprise Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#E91E63] font-medium hover:bg-pink-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
