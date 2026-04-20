import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopBar({ onMobileMenuToggle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <button onClick={onMobileMenuToggle} className="md:hidden p-2 rounded-lg hover:bg-muted">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-foreground">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user?.full_name || 'User'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-sm text-muted-foreground">{user?.email}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => base44.auth.logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}