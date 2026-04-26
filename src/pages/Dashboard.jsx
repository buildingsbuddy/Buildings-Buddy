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
const { count: projectsTotal, error: projectCountError } = await supabase
.from('projects')
.select('*', { count: 'exact', head: true })
.eq('user_id', user.id);

if (projectCountError) {
console.error('Failed to count projects:', projectCountError);
} else {
setProjectCount(projectsTotal || 0);
}

const { count: calculationsTotal, error: calculationCountError } =
await supabase
.from('calculations')
.select('*', { count: 'exact', head: true })
.eq('user_id', user.id);

if (calculationCountError) {
console.error('Failed to count calculations:', calculationCountError);
} else {
setCalculationCount(calculationsTotal || 0);
}

const { data: projectsData, error: projectsError } = await supabase
.from('projects')
.select('id, name, calculator_type, created_at')
.eq('user_id', user.id)
.order('created_at', { ascending: false })
.limit(3);

if (projectsError) {
console.error('Failed to load recent projects:', projectsError);
setRecentProjects([]);
} else {
setRecentProjects(projectsData || []);
}

const { data: calcData, error: calcError } = await supabase
.from('calculations')
.select('id, project_id, calculator_type, created_at, projects(name)')
.eq('user_id', user.id)
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle();

if (calcError) {
console.error('Failed to load recent calculation:', calcError);
setRecentCalculation(null);
} else {
setRecentCalculation(calcData || null);
}
} catch (error) {
console.error('Unexpected dashboard load error:', error);
setProjectCount(0);
setCalculationCount(0);
setRecentProjects([]);
setRecentCalculation(null);
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
trial: {
color: 'bg-accent/10 text-accent border-accent/20',
label: 'Free Trial',
icon: Clock,
},
active: {
color: 'bg-green-50 text-green-700 border-green-200',
label: 'Active',
icon: Zap,
},
no_subscription: {
color: 'bg-muted text-muted-foreground border-border',
label: 'No Subscription',
icon: AlertCircle,
},
expired_trial: {
color: 'bg-destructive/10 text-destructive border-destructive/20',
label: 'Trial Expired',
icon: AlertCircle,
},
inactive: {
color: 'bg-destructive/10 text-destructive border-destructive/20',
label: 'Inactive',
icon: AlertCircle,
},
loading: {
color: 'bg-muted text-muted-foreground border-border',
label: 'Loading...',
icon: Clock,
},
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
{sub.plan && (
<p className="text-xs text-muted-foreground mt-2 capitalize">
{sub.plan} Plan
</p>
)}
</>
) : (
<>
<p className="text-2xl font-bold font-heading">
{loadingProjects ? '...' : value}
</p>
<p className="text-xs text-muted-foreground mt-1">{subtext}</p>
</>
)}
</CardContent>
</Card>
</Link>
);

return (
<div className="space-y-8">
<div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
<Card className="border-accent/20 bg-gradient-to-br from-accent/10 via-card to-card overflow-hidden">
<CardContent className="p-6 md:p-7">
<Badge className="bg-accent text-accent-foreground border-0 mb-4">
Buildings Buddy
</Badge>

<h1 className="font-heading text-2xl md:text-4xl font-bold leading-tight">
Welcome back, {firstName}
</h1>

<p className="text-muted-foreground mt-2 max-w-2xl">
Calculate materials, include UK guide pricing, save estimates to
projects and export clean PDFs from one place.
</p>

<div className="flex flex-col sm:flex-row gap-3 mt-6">
<Link to="/calculators">
<Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold w-full sm:w-auto">
<PlayCircle className="w-4 h-4 mr-2" />
Start New Calculation
</Button>
</Link>

<Link to={lastProject ? `/projects/${lastProject.id}` : '/projects'}>
<Button variant="outline" className="w-full sm:w-auto">
<FolderOpen className="w-4 h-4 mr-2" />
{lastProject ? 'Resume Last Project' : 'Create First Project'}
</Button>
</Link>
</div>
</CardContent>
</Card>

<Card>
<CardContent className="p-5 h-full flex flex-col justify-between gap-5">
<div>
<p className="text-sm text-muted-foreground">Latest activity</p>
<p className="font-heading text-lg font-semibold capitalize mt-1">
{recentCalculationLabel}
</p>

{recentCalculation?.created_at ? (
<p className="text-xs text-muted-foreground mt-1">
Saved{' '}
{format(new Date(recentCalculation.created_at), 'dd MMM yyyy HH:mm')}
</p>
) : (
<p className="text-xs text-muted-foreground mt-1">
Run and save your first calculation to see it here.
</p>
)}
</div>

<div className="flex flex-col gap-2">
{recentCalculation?.project_id && (
<Link to={`/projects/${recentCalculation.project_id}`}>
<Button variant="outline" className="w-full justify-between">
Continue Project
<ArrowRight className="w-4 h-4" />
</Button>
</Link>
)}

<Link to="/calculators">
<Button
variant={recentCalculation?.project_id ? 'ghost' : 'outline'}
className="w-full justify-between"
>
Open Calculators
<ArrowRight className="w-4 h-4" />
</Button>
</Link>
</div>
</CardContent>
</Card>
</div>

{(sub.status === 'trial' ||
sub.status === 'no_subscription' ||
sub.status === 'expired_trial' ||
sub.status === 'inactive') && (
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
<p className="font-semibold">
{sub.trialDaysLeft} days remaining on your free trial
</p>
<p className="text-sm text-muted-foreground">
Upgrade to keep uninterrupted access to calculators, guide
pricing and saved projects.
</p>
</>
) : (
<>
<p className="font-semibold">
{sub.status === 'no_subscription'
? 'Start your free trial'
: 'Your access has expired'}
</p>
<p className="text-sm text-muted-foreground">
Subscribe to unlock material calculations, pricing, PDFs and
project saves.
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

<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
<SummaryCard to="/billing" label="Subscription" icon={CreditCard} badge />

<SummaryCard
to="/projects"
label="Projects"
icon={FolderOpen}
value={projectCount}
subtext="Saved projects"
/>

<SummaryCard
to="/projects"
label="Saved Calculations"
icon={FileText}
value={calculationCount}
subtext="Calculation history"
/>

<SummaryCard
to="/calculators"
label="Calculators"
icon={Calculator}
value={CALCULATOR_COUNT}
subtext="Available tools"
/>
</div>

<div className="grid lg:grid-cols-[1fr_320px] gap-6">
<div>
<div className="flex items-center justify-between mb-4">
<h2 className="font-heading text-lg font-semibold">Quick Access</h2>
<Link
to="/calculators"
className="text-sm text-accent font-medium hover:underline flex items-center gap-1"
>
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

<Card className="border-accent/20">
<CardContent className="p-5">
<div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
<PoundSterling className="w-5 h-5 text-accent" />
</div>

<p className="font-heading font-semibold">Guide pricing included</p>
<p className="text-sm text-muted-foreground mt-2">
Turn on pricing after calculating to estimate material supply costs.
Labour, VAT, delivery and overheads are not included.
</p>

<Link to="/calculators" className="block mt-4">
<Button variant="outline" className="w-full justify-between">
Start Estimate
<ArrowRight className="w-4 h-4" />
</Button>
</Link>
</CardContent>
</Card>
</div>

{recentProjects.length > 0 ? (
<div>
<div className="flex items-center justify-between mb-4">
<h2 className="font-heading text-lg font-semibold">Recent Projects</h2>
<Link
to="/projects"
className="text-sm text-accent font-medium hover:underline flex items-center gap-1"
>
View All <ArrowRight className="w-4 h-4" />
</Link>
</div>

<div className="space-y-2">
{recentProjects.map((project) => (
<Link key={project.id} to={`/projects/${project.id}`}>
<Card className="hover:bg-muted/30 hover:border-accent/20 transition-colors">
<CardContent className="p-4 flex items-center justify-between gap-4">
<div className="min-w-0">
<p className="font-medium truncate">{project.name}</p>
<p className="text-xs text-muted-foreground capitalize">
{project.calculator_type?.replace(/_/g, ' ')}
</p>
</div>

<div className="flex items-center gap-3 shrink-0">
{project.created_at && (
<span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
<Calendar className="w-3 h-3" />
{format(new Date(project.created_at), 'dd MMM yyyy')}
</span>
)}
<Badge variant="secondary" className="capitalize text-xs">
Draft
</Badge>
</div>
</CardContent>
</Card>
</Link>
))}
</div>
</div>
) : (
<Card className="border-dashed">
<CardContent className="p-8 text-center">
<FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
<p className="font-heading font-semibold">No projects yet</p>
<p className="text-sm text-muted-foreground mt-1">
Save your calculations into projects so you can reopen, update and
export them later.
</p>
<Link to="/calculators" className="inline-block mt-4">
<Button className="bg-accent text-accent-foreground hover:bg-accent/90">
<RotateCcw className="w-4 h-4 mr-2" />
Run First Calculation
</Button>
</Link>
</CardContent>
</Card>
)}

{!isStandalone && (
<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
<Card className="border-primary/20 bg-primary/5">
<CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
<Smartphone className="w-5 h-5 text-primary" />
</div>

<div>
<p className="font-semibold">Install Buildings Buddy</p>
<p className="text-sm text-muted-foreground">
Add the app to your home screen for quicker access on site.
</p>
</div>
</div>

{installPrompt ? (
<Button onClick={handleInstallApp} className="whitespace-nowrap">
<Download className="w-4 h-4 mr-2" />
Install App
</Button>
) : (
<p className="text-xs text-muted-foreground max-w-sm">
On iPhone, tap Share in Safari, then choose Add to Home Screen.
</p>
)}
</CardContent>
</Card>
</motion.div>
)}
</div>
);
}