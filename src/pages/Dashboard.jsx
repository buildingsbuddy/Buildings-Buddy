import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, FolderOpen, CreditCard, ArrowRight, Clock, Zap, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/lib/subscriptionContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const sub = useSubscription();

  const user = {
    full_name: 'Local User',
  };

  const projects = [];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          Welcome{user?.full_name ? `, ${user.full_name}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">Your construction calculation dashboard</p>
      </div>

      {(sub.status === 'trial' || sub.status === 'no_subscription' || sub.status === 'expired_trial' || sub.status === 'inactive') && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  {sub.status === 'trial' ? (
                    <Clock className="w-5 h-5 text-accent" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div>
                  {sub.status === 'trial' ? (
                    <>
                      <p className="font-semibold">{sub.trialDaysLeft} days remaining on your free trial</p>
                      <p className="text-sm text-muted-foreground">
                        Upgrade to keep uninterrupted access to all calculators.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">
                        {sub.status === 'no_subscription' ? 'Start your free trial' : 'Your access has expired'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Subscribe to unlock all material calculations.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <Link to="/billing">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold whitespace-nowrap">
                  {sub.status === 'no_subscription' ? 'Start Free Trial' : 'Upgrade Now'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Subscription</span>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <Badge className={`${sc.color} border`}>
              <StatusIcon className="w-3 h-3 mr-1" /> {sc.label}
            </Badge>
            {sub.plan && <p className="text-xs text-muted-foreground mt-2 capitalize">{sub.plan} Plan</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Projects</span>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-heading">{projects.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Saved projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Calculators</span>
              <Calculator className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-heading">11</p>
            <p className="text-xs text-muted-foreground mt-1">Available tools</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Quick Access</h2>
          <Link to="/calculators" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
            All Calculators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Walls', path: '/calculators/wall' },
            { label: 'Roofing', path: '/calculators/roofing' },
            { label: 'Concrete Mix', path: '/calculators/concrete' },
            { label: 'Insulation', path: '/calculators/insulation' },
            { label: 'Flooring', path: '/calculators/flooring' },
            { label: 'Drainage', path: '/calculators/drainage' },
            { label: 'Staircase', path: '/calculators/staircase' },
            { label: 'Painting', path: '/calculators/painting' },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:border-accent/30 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-sm">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 3).map((p) => (
              <Card key={p.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {p.calculator_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {p.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}