import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/lib/subscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
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
    if (isMobile) setCollapsed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isMobile && collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-lg bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center"
        aria-label="Open menu"
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
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>

        {(!collapsed || isMobile) && (
          <span className="font-heading font-bold text-lg text-sidebar-foreground whitespace-nowrap">
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  isActive && 'text-sidebar-primary'
                )}
              />

              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {(!collapsed || isMobile) && sub.status === 'trial' && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-sidebar-primary/10 border border-sidebar-primary/20">
          <p className="text-xs font-semibold text-sidebar-primary">
            {sub.trialDaysLeft} days left on trial
          </p>

          <Link
            to="/billing"
            onClick={handleNavClick}
            className="text-xs text-sidebar-foreground/60 hover:text-sidebar-primary mt-1 block"
          >
            Upgrade now →
          </Link>
        </div>
      )}

      <div className="px-3 mb-3 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>

        {!isMobile && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}