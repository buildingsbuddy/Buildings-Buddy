import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const sidebarWidthClass = collapsed ? 'ml-[68px]' : 'ml-[240px]';

  return (
    <div className="min-h-screen bg-background">
      {isMobile && collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-md flex items-center justify-center"
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {isMobile && !collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/40 z-30"
          aria-label="Close menu"
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-[68px]' : sidebarWidthClass
        }`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}