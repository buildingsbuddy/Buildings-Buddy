import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { SubscriptionProvider } from '@/lib/subscriptionContext';

import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Calculators from '@/pages/Calculators';
import Projects from '@/pages/Projects';
import Billing from '@/pages/Billing';
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

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SubscriptionProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route element={<AppLayout />}>
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
                <Route path="/billing" element={<Billing />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </SubscriptionProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;