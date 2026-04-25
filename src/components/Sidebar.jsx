import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  FolderOpen,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/lib/subscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const sub = useSubscription();
  const isMobile = useIsMobile();

  const hasCompanyAccess =
    sub.plan === 'company' && (sub.status === 'trial' || sub.status === 'active');

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Calculators', icon: Calculator, path: '/calculators' },
    { label: 'Projects', icon: FolderOpen, path: '/projects' },
    ...(hasCompanyAccess ? [{ label: 'Team', icon: Users, path: '/team' }] : []),
    { label: 'Billing', icon: CreditCard, path: '/billing' },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // MOBILE CLOSED STATE → SHOW MENU BUTTON ONLY
  if (isMobile && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-lg bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 flex flex-col transition-all duration-300',
        isMobile ? 'w-[240px]' : collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>

        {(!collapsed || isMobile) && (
          <span className="font-heading font-bold text-lg">
            Buildings Buddy
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-4 p-2 rounded-lg hover:bg-sidebar-accent/50"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}
    </aside>
  );
}