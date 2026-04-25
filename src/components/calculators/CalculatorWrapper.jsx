import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
ArrowLeft,
FileDown,
ClipboardList,
PoundSterling,
Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/lib/subscriptionContext';
import PaywallModal from '@/components/PaywallModal';
import CalculatorResultsTable from './CalculatorResultsTable';
import { addPricing } from '@/lib/pricingEngine';
import { toast } from 'sonner';
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from '@/components/ui/dialog';
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/components/ui/select';

const DIY_PROJECT_LIMIT = 20;

function escapeHtml(value) {
return String(value ?? '')
.replaceAll('&', '&amp;')
.replaceAll('<', '&lt;')
.replaceAll('>', '&gt;')
.replaceAll('"', '&quot;')
.replaceAll("'", '&#039;');
}

function money(value) {
if (value === null || value === undefined || Number.isNaN(Number(value))) {
return '—';
}

return new Intl.NumberFormat('en-GB', {
style: 'currency',
currency: 'GBP',
}).format(Number(value));
}

function getResultGroup(row) {
const material = String(row.material || '').toLowerCase();

if (
material.includes('pack') ||
material.includes('pallet') ||
material.includes('recommended') ||
material.includes('order')
) {
return 'Ordering';
}

if (
material.includes('area') ||
material.includes('volume') ||
material.includes('rise') ||
material.includes('going') ||
material.includes('fall') ||
material.includes('rafter') ||
material.includes('thickness')
) {
return 'Measurements';
}

if (
material.includes('screw') ||
material.includes('tie') ||
material.includes('hanger') ||
material.includes('coupler') ||
material.includes('bead') ||
material.includes('tape') ||
material.includes('fixing') ||
material.includes('membrane') ||
material.includes('dpc') ||
material.includes('tray') ||
material.includes('primer') ||
material.includes('plasticiser')
) {
return 'Fixings & Accessories';
}

return 'Materials';
}

function groupResults(results = []) {
const groups = {
Measurements: [],
Materials: [],
'Fixings & Accessories': [],
Ordering: [],
};

results.forEach((row) => {
const group = getResultGroup(row);
groups[group].push(row);
});

return Object.entries(groups).filter(([, rows]) => rows.length > 0);
}

function hasAccessFromSubscription(subscription) {
if (!subscription) return false;
if (subscription.status === 'active') return true;

if (subscription.status === 'trial' && subscription.trial_end_date) {
return new Date(subscription.trial_end_date) > new Date();
}

return false;
}

function normaliseSavedResults(savedResults) {
if (Array.isArray(savedResults)) return savedResults;

if (savedResults && typeof savedResults === 'object') {
if (Array.isArray(savedResults.items)) return savedResults.items;
}

return null;
}

export default function CalculatorWrapper({
title,
icon: Icon,
children,
onCalculate,
calcType,
getSavePayload,
}) {
const navigate = useNavigate();
const location = useLocation();
const { user } = useAuth();
const sub = useSubscription();

const reopenedCalculationId = location.state?.calculationId || null;
const reopenedProjectId = location.state?.projectId || null;
const reopenedProjectName = location.state?.projectName || '';
const reopenedSavedResults = normaliseSavedResults(location.state?.savedResults);

const isCompanyPlan =
sub.plan === 'company' && (sub.status === 'trial' || sub.status === 'active');

const [results, setResults] = useState(() => reopenedSavedResults || null);
const [includePricing, setIncludePricing] = useState(() =>
Boolean(location.state?.prefillInputs?.includePricing)
);
const [showPaywall, setShowPaywall] = useState(false);
const [checkingAccess, setCheckingAccess] = useState(false);

const [projects, setProjects] = useState([]);
const [loadingProjects, setLoadingProjects] = useState(false);
const [saveDialogOpen, setSaveDialogOpen] = useState(false);
const [saveMode, setSaveMode] = useState('existing');
const [selectedProjectId, setSelectedProjectId] = useState(reopenedProjectId || '');
const [savingToProject, setSavingToProject] = useState(false);

const [saveBehavior, setSaveBehavior] = useState(
reopenedCalculationId ? 'update' : 'new'
);

const [newProject, setNewProject] = useState({
name: '',
notes: '',
});

const cameFromSavedCalculation = Boolean(reopenedCalculationId);

useEffect(() => {
if (reopenedCalculationId) {
setSaveBehavior('update');
setSelectedProjectId(reopenedProjectId || '');
}
}, [reopenedCalculationId, reopenedProjectId]);

const pricedData = useMemo(() => {
if (!results) return { items: [], total: 0 };
return addPricing(results);
}, [results]);

const displayResults = includePricing ? pricedData.items : results;
const groupedResults = useMemo(() => groupResults(results || []), [results]);
const projectLimitReached = !isCompanyPlan && projects.length >= DIY_PROJECT_LIMIT;

const handleCalculate = async () => {
setCheckingAccess(true);

try {
const latestSubscription = await sub.reload();

const allowedNow =
sub.canCalculate || hasAccessFromSubscription(latestSubscription);

if (!allowedNow) {
setShowPaywall(true);
return;
}

const calcResults = onCalculate();

if (calcResults) {
setResults(calcResults);
setIncludePricing(false);

if (reopenedCalculationId) {
setSaveBehavior('update');
}
}
} finally {
setCheckingAccess(false);
}
};

const loadProjects = async () => {
if (!user?.id) return;

setLoadingProjects(true);

try {
const { data, error } = await supabase
.from('projects')
.select('id, name, calculator_type')
.eq('user_id', user.id)
.order('created_at', { ascending: false });

if (error) {
console.error('Failed to load projects:', error);
setProjects([]);
return;
}

setProjects(data || []);
} catch (error) {
console.error('Unexpected project load error:', error);
setProjects([]);
} finally {
setLoadingProjects(false);
}
};

useEffect(() => {
if (!saveDialogOpen) return;

if (reopenedProjectId) {
setSelectedProjectId(reopenedProjectId);
}

if (reopenedCalculationId) {
setSaveBehavior('update');
}

loadProjects();
}, [saveDialogOpen, user?.id, reopenedProjectId, reopenedCalculationId]);

const createProjectAndReturnId = async () => {
if (!user?.id || !newProject.name.trim()) return null;

if (!isCompanyPlan && projects.length >= DIY_PROJECT_LIMIT) {
toast.error(
`DIY plan is limited to ${DIY_PROJECT_LIMIT} projects. Upgrade to Company for unlimited projects.`
);
return null;
}

const payload = {
user_id: user.id,
team_id: isCompanyPlan && sub.team?.id ? sub.team.id : null,
name: newProject.name.trim(),
calculator_type: calcType || title,
notes: newProject.notes.trim() || null,
};

const { data, error } = await supabase
.from('projects')
.insert(payload)
.select('id')
.single();

if (error) {
console.error('Failed to create project:', error);
toast.error('Could not create project.');
return null;
}

return data?.id || null;
};

const handleSaveToProject = async () => {
if (!user?.id || !results) return;

setSavingToProject(true);

try {
let projectId = reopenedProjectId || selectedProjectId;

if (saveBehavior === 'new') {
projectId = selectedProjectId;

if (saveMode === 'new') {
projectId = await createProjectAndReturnId();

if (!projectId) {
setSavingToProject(false);
return;
}
}

if (!projectId) {
toast.error('Please choose a project.');
setSavingToProject(false);
return;
}
}

if (saveBehavior === 'update' && !reopenedCalculationId) {
toast.error('No saved calculation selected to update.');
setSavingToProject(false);
return;
}

const payload = typeof getSavePayload === 'function' ? getSavePayload() : null;

const inputsToSave = {
...(payload?.inputs || {}),
includePricing,
pricingTotal: includePricing ? pricedData.total : null,
};

const resultsToSave = includePricing
? pricedData.items
: payload?.results || results;

if (saveBehavior === 'update' && reopenedCalculationId) {
const { error } = await supabase
.from('calculations')
.update({
  project_id: projectId,
  team_id: isCompanyPlan && sub.team?.id ? sub.team.id : null,
  calculator_type: calcType || title,
  inputs: inputsToSave,
  results: resultsToSave,
})
.eq('id', reopenedCalculationId)
.eq('user_id', user.id);

if (error) {
console.error('Failed to update calculation:', error);
toast.error('Could not update calculation.');
setSavingToProject(false);
return;
}

toast.success('Calculation updated.');
} else {
const { error } = await supabase.from('calculations').insert({
project_id: projectId,
user_id: user.id,
team_id: isCompanyPlan && sub.team?.id ? sub.team.id : null,
calculator_type: calcType || title,
inputs: inputsToSave,
results: resultsToSave,
});

if (error) {
console.error('Failed to save calculation:', error);
toast.error('Could not save calculation.');
setSavingToProject(false);
return;
}

toast.success('Calculation saved.');
}

setSaveDialogOpen(false);
setSelectedProjectId(projectId || '');
setSaveMode('existing');
setSaveBehavior(reopenedCalculationId ? 'update' : 'new');
setNewProject({ name: '', notes: '' });

navigate(`/projects/${projectId}`);
} catch (error) {
console.error('Unexpected save error:', error);
toast.error('Could not save calculation.');
} finally {
setSavingToProject(false);
}
};

const handleExportPDF = () => {
if (!results) return;

const rowsForPdf = includePricing ? pricedData.items : results;

const groupedRows = groupResults(rowsForPdf)
.map(([groupName, rows]) => {
const rowsHtml = rows
.map((r) => {
const pricingCells = includePricing
? `
<td style="text-align:right">${escapeHtml(r.rate ? money(r.rate) : '—')}</td>
<td style="text-align:right;font-weight:600">${escapeHtml(r.total ? money(r.total) : '—')}</td>
`
: '';

return `
<tr>
<td>${escapeHtml(r.material)}</td>
<td style="text-align:right;font-weight:600">${escapeHtml(r.quantity)}</td>
<td>${escapeHtml(r.unit)}</td>
${pricingCells}
<td style="color:#555">${escapeHtml(r.notes || '')}</td>
</tr>`;
})
.join('');

return `
<tr class="section-row">
<td colspan="${includePricing ? 6 : 4}">${escapeHtml(groupName)}</td>
</tr>
${rowsHtml}
`;
})
.join('');

const totalBox = includePricing
? `<div class="total-box">Estimated Material Total: <strong>${money(pricedData.total)}</strong></div>`
: '';

const html = `
<html>
<head>
<title>${escapeHtml(title)}</title>
<style>
body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
.brand { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1e2d4d; padding-bottom:14px; margin-bottom:22px; }
h1 { font-size:24px; margin:0 0 6px; }
.sub { color:#666; font-size:13px; margin:0; }
.badge { background:#f1f4f8; padding:8px 12px; border-radius:8px; font-size:12px; color:#333; }
.total-box { margin:0 0 18px; background:#f7fafc; border:1px solid #d8dee8; border-radius:8px; padding:12px 14px; font-size:15px; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { background:#1e2d4d; color:white; padding:9px 12px; text-align:left; }
th:nth-child(2), th:nth-child(4), th:nth-child(5) { text-align:right; }
td { padding:8px 12px; border-bottom:1px solid #e9e9e9; vertical-align:top; }
tr:nth-child(even) td { background:#fafafa; }
.section-row td { background:#edf2f7 !important; color:#1e2d4d; font-weight:700; border-top:18px solid white; border-bottom:1px solid #d8dee8; padding-top:10px; }
.footer { margin-top:28px; padding-top:14px; border-top:1px solid #ddd; font-size:11px; color:#777; line-height:1.5; }
</style>
</head>

<body>
<div class="brand">
<div>
<h1>${escapeHtml(title)}</h1>
<p class="sub">Buildings Buddy — Material Estimate & Cost Guide</p>
</div>
<div class="badge">
${includePricing ? 'Materials + Guide Pricing' : 'Material Estimate'}
</div>
</div>

${totalBox}

<table>
<thead>
<tr>
<th>Material</th>
<th>Qty</th>
<th>Unit</th>
${includePricing ? '<th>Rate</th><th>Est. Cost</th>' : ''}
<th>Notes</th>
</tr>
</thead>
<tbody>${groupedRows}</tbody>
</table>

<div class="footer">
<strong>Important:</strong> Material quantities and costs are provided as estimating guidance only.<br><br>
Quantities may include standard allowances for waste, overlaps and cutting where applicable. Any additional allowance is only applied when selected by the user.<br><br>
Material prices are based on typical UK supply rates and may vary by supplier, region, availability and specification.<br><br>
Labour, plant, delivery, waste removal, profit, overheads and VAT are not included.<br><br>
Always verify quantities, specifications and costs against project drawings, site conditions, supplier quotations and current Building Regulations before ordering or commencing work.
</div>
</body>
</html>`;

const win = window.open('', '_blank');
if (!win) return;

win.document.write(html);
win.document.close();
win.focus();
win.print();
};

const saveButtonLabel =
saveBehavior === 'update' ? 'Update Calculation' : 'Save Calculation';

return (
<div>
<Link
to="/calculators"
className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 gap-1"
>
<ArrowLeft className="w-4 h-4" /> Back to Calculators
</Link>

<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2">
{Icon && <Icon className="w-5 h-5 text-accent" />}
{title}
</CardTitle>
</CardHeader>

<CardContent className="space-y-4">
{children}

{cameFromSavedCalculation && (
<div className="rounded-lg border bg-accent/5 border-accent/20 p-3">
<p className="text-sm font-medium">
Editing saved calculation
{reopenedProjectName ? ` from ${reopenedProjectName}` : ''}
</p>
<p className="text-xs text-muted-foreground mt-1">
Recalculate, then update this saved calculation or save a new copy.
</p>
</div>
)}

<div className="flex flex-wrap gap-2">
<Button onClick={handleCalculate} disabled={checkingAccess}>
{checkingAccess ? 'Checking...' : 'Calculate Materials'}
</Button>

{results && (
<>
<Button
onClick={() => setIncludePricing((prev) => !prev)}
variant={includePricing ? 'default' : 'outline'}
className="gap-2"
>
<PoundSterling className="w-4 h-4" />
{includePricing ? 'Hide Pricing' : 'Include Pricing'}
</Button>

<Button variant="outline" onClick={handleExportPDF}>
<FileDown className="w-4 h-4 mr-1" /> Export PDF
</Button>

<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
<DialogTrigger asChild>
<Button variant="outline" className="gap-2">
<Save className="w-4 h-4" /> Save to Project
</Button>
</DialogTrigger>

<DialogContent>
<DialogHeader>
<DialogTitle>Save Calculation</DialogTitle>
<DialogDescription>
Save this calculator result to a project.
</DialogDescription>
</DialogHeader>

<div className="space-y-4 pt-2">
{!isCompanyPlan && (
<div className="rounded-lg border bg-muted/30 p-3 text-sm">
DIY project usage: {projects.length} / {DIY_PROJECT_LIMIT}
</div>
)}

{includePricing && (
<div className="rounded-lg border bg-accent/10 border-accent/20 p-3 text-sm">
This save will include guide material pricing and estimated total.
</div>
)}

{cameFromSavedCalculation && (
<div className="space-y-2">
<Label>Save Method</Label>
<div className="flex gap-2">
<Button
type="button"
variant={saveBehavior === 'update' ? 'default' : 'outline'}
onClick={() => setSaveBehavior('update')}
className="flex-1"
>
Update Existing
</Button>

<Button
type="button"
variant={saveBehavior === 'new' ? 'default' : 'outline'}
onClick={() => setSaveBehavior('new')}
className="flex-1"
>
Save as New
</Button>
</div>
</div>
)}

{saveBehavior === 'update' ? (
<div className="rounded-lg border bg-muted/30 p-3">
<p className="text-sm font-medium">
Updating existing calculation
</p>
<p className="text-xs text-muted-foreground mt-1">
{reopenedProjectName
? `This will update the saved calculation in project: ${reopenedProjectName}`
: 'This will update the saved calculation in its current project.'}
</p>
</div>
) : (
<>
<div className="flex gap-2">
<Button
type="button"
variant={saveMode === 'existing' ? 'default' : 'outline'}
onClick={() => setSaveMode('existing')}
className="flex-1"
>
Existing Project
</Button>

<Button
type="button"
variant={saveMode === 'new' ? 'default' : 'outline'}
onClick={() => setSaveMode('new')}
disabled={projectLimitReached}
className="flex-1"
>
New Project
</Button>
</div>

{saveMode === 'existing' ? (
<div className="space-y-2">
<Label>Select Project</Label>
<Select
value={selectedProjectId}
onValueChange={setSelectedProjectId}
>
<SelectTrigger>
<SelectValue placeholder="Choose a project" />
</SelectTrigger>

<SelectContent>
{loadingProjects ? (
<SelectItem value="loading" disabled>
Loading projects...
</SelectItem>
) : projects.length === 0 ? (
<SelectItem value="none" disabled>
No projects available
</SelectItem>
) : (
projects.map((project) => (
<SelectItem key={project.id} value={project.id}>
{project.name}
</SelectItem>
))
)}
</SelectContent>
</Select>
</div>
) : (
<>
<div className="space-y-2">
<Label>Project Name</Label>
<Input
placeholder="e.g. Kitchen Extension"
value={newProject.name}
onChange={(e) =>
setNewProject((prev) => ({
...prev,
name: e.target.value,
}))
}
/>
</div>

<div className="space-y-2">
<Label>Notes optional</Label>
<Input
placeholder="Add any notes..."
value={newProject.notes}
onChange={(e) =>
setNewProject((prev) => ({
...prev,
notes: e.target.value,
}))
}
/>
</div>
</>
)}
</>
)}

<Button
onClick={handleSaveToProject}
disabled={
savingToProject ||
(saveBehavior === 'new' &&
saveMode === 'existing' &&
!selectedProjectId) ||
(saveBehavior === 'new' &&
saveMode === 'new' &&
(!newProject.name.trim() || projectLimitReached))
}
className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
>
{savingToProject ? 'Saving...' : saveButtonLabel}
</Button>
</div>
</DialogContent>
</Dialog>
</>
)}
</div>
</CardContent>
</Card>

{results && (
<Card className="mt-6 border-accent/20">
<CardHeader>
<CardTitle className="flex items-center gap-2 font-heading text-lg">
<ClipboardList className="w-5 h-5 text-accent" />
Estimate Summary
</CardTitle>
</CardHeader>

<CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
{groupedResults.map(([groupName, rows]) => (
<div key={groupName} className="rounded-lg border bg-muted/20 p-3">
<p className="text-sm font-semibold">{groupName}</p>
<p className="text-xs text-muted-foreground mt-1">
{rows.length} item{rows.length === 1 ? '' : 's'}
</p>
</div>
))}

{includePricing && (
<div className="rounded-lg border bg-accent/10 border-accent/20 p-3">
<p className="text-sm font-semibold">Estimated Total</p>
<p className="text-lg font-bold mt-1">
{money(pricedData.total)}
</p>
</div>
)}
</CardContent>
</Card>
)}

<CalculatorResultsTable
results={displayResults}
showPricing={includePricing}
pricingTotal={pricedData.total}
/>

{results && (
<p className="mt-3 text-xs text-muted-foreground">
Estimate guidance only. Labour, plant, delivery, waste removal, profit,
overheads and VAT are not included.
</p>
)}

<PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
</div>
);
}