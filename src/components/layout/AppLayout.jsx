import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';

export default function AppLayout({ topBanner = null }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={cn('hidden md:block')}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <div className={cn('md:hidden', mobileOpen ? 'block' : 'hidden')}>
        <Sidebar collapsed={false} setCollapsed={() => {}} />
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'
        )}
      >
        <TopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

        {topBanner}

        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}