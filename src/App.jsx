import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SubscriptionProvider, useSubscription } from '@/lib/subscriptionContext';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Calculators from '@/pages/Calculators';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Billing from '@/pages/Billing';
import Team from '@/pages/Team';
import AppLayout from '@/components/layout/AppLayout';

import WallCalculator from '@/pages/calculators/WallCalculator';
import StudWallCalculator from '@/pages/calculators/StudWallCalculator';
import RoofingCalculator from '@/pages/calculators/RoofingCalculator';
import FlooringCalculator from '@/pages/calculators/FlooringCalculator';
import PlasterboardCalculator from '@/pages/calculators/PlasterboardCalculator';
import PlasterSkimCalculator from '@/pages/calculators/PlasterSkimCalculator';
import DrainageCalculator from '@/pages/calculators/DrainageCalculator';
import ConcreteCalculator from '@/pages/calculators/ConcreteCalculator';
import InsulationCalculator from '@/pages/calculators/InsulationCalculator';
import StaircaseCalculator from '@/pages/calculators/StaircaseCalculator';
import PaintingCalculator from '@/pages/calculators/PaintingCalculator';

function InviteBanner() {
  const {
    user,
    pendingTeamInvites,
    setPendingTeamInvites,
    refreshPendingTeamInvites,
  } = useAuth();

  const sub = useSubscription();
  const [accepting, setAccepting] = useState(false);

  if (!pendingTeamInvites || pendingTeamInvites.length === 0) return null;

  const invite = pendingTeamInvites[0];
  const teamName = invite.teams?.name || 'a company team';

  const handleAcceptInvite = async () => {
    if (!user?.id || !invite?.id || !invite?.team_id) return;

    setAccepting(true);

    try {
      const { error: memberError } = await supabase.from('team_members').insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: 'member',
        status: 'active',
        invited_email: user.email || invite.invited_email,
      });

      if (memberError) {
        console.error('Failed to accept team membership:', memberError);
        return;
      }

      const { error: inviteError } = await supabase
        .from('team_invites')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invite.id);

      if (inviteError) {
        console.error('Failed to mark invite accepted:', inviteError);
        return;
      }

      setPendingTeamInvites((prev) =>
        prev.filter((item) => item.id !== invite.id)
      );

      await refreshPendingTeamInvites();
      await sub.reload();
    } catch (error) {
      console.error('Unexpected accept invite error:', error);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="bg-accent text-accent-foreground px-4 md:px-6 py-3 border-b border-accent/30">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold">
            You’ve been invited to join {teamName}
          </p>
          <p className="text-xs opacity-90">
            Accepting will link your account to this company plan.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleAcceptInvite}
          disabled={accepting}
          className="shrink-0"
        >
          {accepting ? 'Accepting...' : 'Accept Invite'}
        </Button>
      </div>
    </div>
  );
}

function CompanyOnlyRoute({ children }) {
  const sub = useSubscription();
  const hasCompanyAccess =
    sub.plan === 'company' && (sub.status === 'trial' || sub.status === 'active');

  if (sub.status === 'loading') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!hasCompanyAccess) {
    return <Navigate to="/billing" replace />;
  }

  return children;
}

function ProtectedLayout() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SubscriptionProvider>
      <AppLayout topBanner={<InviteBanner />} />
    </SubscriptionProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/wall" element={<WallCalculator />} />
        <Route path="/calculators/stud-wall" element={<StudWallCalculator />} />
        <Route path="/calculators/roofing" element={<RoofingCalculator />} />
        <Route path="/calculators/flooring" element={<FlooringCalculator />} />
        <Route path="/calculators/plasterboard" element={<PlasterboardCalculator />} />
        <Route path="/calculators/plaster-skim" element={<PlasterSkimCalculator />} />
        <Route path="/calculators/drainage" element={<DrainageCalculator />} />
        <Route path="/calculators/concrete" element={<ConcreteCalculator />} />
        <Route path="/calculators/insulation" element={<InsulationCalculator />} />
        <Route path="/calculators/staircase" element={<StaircaseCalculator />} />
        <Route path="/calculators/painting" element={<PaintingCalculator />} />

        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        <Route
          path="/team"
          element={
            <CompanyOnlyRoute>
              <Team />
            </CompanyOnlyRoute>
          }
        />

        <Route path="/billing" element={<Billing />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;