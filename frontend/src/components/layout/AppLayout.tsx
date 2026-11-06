import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Header
        collapsed={collapsed}
        setMobileOpen={setMobileOpen}
      />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${
          collapsed ? 'lg:pl-20 pl-0' : 'lg:pl-64 pl-0'
        }`}
      >
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
