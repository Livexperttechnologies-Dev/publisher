import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kibo360_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 200 && parsed <= 420) return parsed;
      }
    } catch {}
    return 264;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const effectiveSidebarWidth = collapsed ? 80 : sidebarWidth;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
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
        sidebarWidth={sidebarWidth}
        setSidebarWidth={(w) => {
          setSidebarWidth(w);
          try {
            localStorage.setItem('kibo360_sidebar_width', String(w));
          } catch {}
        }}
        isResizing={isResizing}
        setIsResizing={setIsResizing}
      />
      <Header
        collapsed={collapsed}
        setMobileOpen={setMobileOpen}
        sidebarWidth={effectiveSidebarWidth}
        isResizing={isResizing}
      />

      <main
        style={{
          paddingLeft: isDesktop ? `${effectiveSidebarWidth}px` : undefined,
        }}
        className={`flex-1 pt-16 ${
          isResizing ? '' : 'transition-all duration-300 ease-in-out'
        }`}
      >
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
