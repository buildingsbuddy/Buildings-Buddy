import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  FolderOpen,
  CreditCard,
  ArrowRight,
  Clock,
  Zap,
  AlertCircle,
  Calendar,
  Download,
  Smartphone,
  PlayCircle,
  FileText,
  PoundSterling,
  RotateCcw,
} from 'lucide-react';
import { useSubscription } from '@/lib/subscriptionContext';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const CALCULATOR_COUNT = 11;

export default function Dashboard() {
  const sub = useSubscription();
  const { user, profile } = useAuth();

  const [projectCount, setProjectCount] = useState(0);
  const [calculationCount, setCalculationCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentCalculation, setRecentCalculation] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'User';

  const firstName = String(displayName).split(' ')[0];

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setProjectCount(0);
        setCalculationCount(0);
        setRecentProjects([]);
        setRecentCalculation(null);
        setLoadingProjects(false);
        return;
      }

      setLoadingProjects(true);

      try {
        const { count: projectsTotal } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setProjectCount(projectsTotal || 0);

        const { count: calculationsTotal } = await supabase
          .from('calculations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setCalculationCount(calculationsTotal || 0);

        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name, calculator_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentProjects(projectsData || []);

        const { data: calcData } = await supabase
          .from('calculations')
          .select('id, project_id, calculator_type, created_at, projects(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setRecentCalculation(calcData || null);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice?.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsStandalone(true);
    }
  };

  const statusConfig = {
    trial: { color: 'bg-accent/10 text-accent border-accent/20', label: 'Free Trial', icon: Clock },
    active: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Active', icon: Zap },
    no_subscription: { color: 'bg-muted text-muted-foreground border-border', label: 'No Subscription', icon: AlertCircle },
    expired_trial: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Trial Expired', icon: AlertCircle },
    inactive: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Inactive', icon: AlertCircle },
    loading: { color: 'bg-muted text-muted-foreground border-border', label: 'Loading...', icon: Clock },
  };

  const sc = statusConfig[sub.status] || statusConfig.loading;
  const StatusIcon = sc.icon;

  const lastProject = recentProjects?.[0] || null;

  const recentCalculationLabel = useMemo(() => {
    if (!recentCalculation?.calculator_type) return 'No saved calculations yet';
    return recentCalculation.calculator_type.replace(/_/g, ' ');
  }, [recentCalculation]);

  const SummaryCard = ({ to, label, icon: Icon, value, subtext, badge }) => (
    <Link to={to}>
      <Card className="hover:border-accent/30 hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>

          {badge ? (
            <>
              <Badge className={`${sc.color} border`}>
                <StatusIcon className="w-3 h-3 mr-1" /> {sc.label}
              </Badge>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold font-heading">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">

      {/* HERO */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard to="/billing" label="Subscription" icon={CreditCard} badge />
        <SummaryCard to="/projects" label="Projects" icon={FolderOpen} value={projectCount} subtext="Saved" />
        <SummaryCard to="/projects" label="Calculations" icon={FileText} value={calculationCount} subtext="Saved" />
        <SummaryCard to="/calculators" label="Tools" icon={Calculator} value={CALCULATOR_COUNT} subtext="Available" />
      </div>

      {/* INSTALL MOVED HERE */}
      {!isStandalone && (
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">Install Buildings Buddy</p>
              <p className="text-sm text-muted-foreground">Add to home screen for faster access</p>
            </div>

            {installPrompt ? (
              <Button onClick={handleInstallApp}>
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
            ) : (
              <p className="text-xs">Use browser menu → Add to Home Screen</p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}