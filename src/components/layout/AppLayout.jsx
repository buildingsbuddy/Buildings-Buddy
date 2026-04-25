import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/40 z-30"
        />
      )}

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : collapsed ? 'ml-[68px]' : 'ml-[240px]'
        }`}
      >
        {children}
      </main>
    </div>
  );
}