import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from '@/components/ui/accordion';
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Trash2, FileText, SquarePen, PoundSterling } from 'lucide-react';
import { format } from 'date-fns';

function formatLabel(key) {
return key
.replace(/_/g, ' ')
.replace(/([a-z])([A-Z])/g, '$1 $2')
.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
if (value === null || value === undefined || value === '') return '—';
return String(value);
}

function money(value) {
if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';

return new Intl.NumberFormat('en-GB', {
style: 'currency',
currency: 'GBP',
}).format(Number(value));
}

function normaliseResults(results) {
if (Array.isArray(results)) {
return {
rows: results,
pricingIncluded: results.some((row) => row.rate !== undefined || row.total !== undefined),
pricingTotal: results.reduce((sum, row) => sum + (Number(row.total) || 0), 0),
};
}

if (results && typeof results === 'object') {
const rows = Array.isArray(results.items) ? results.items : [];

return {
rows,
pricingIncluded:
Boolean(results.pricingIncluded) ||
rows.some((row) => row.rate !== undefined || row.total !== undefined),
pricingTotal:
Number(results.pricingTotal) ||
rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0),
};
}

return {
rows: [],
pricingIncluded: false,
pricingTotal: 0,
};
}

function getCalculatorRoute(calculatorType) {
const routeMap = {
wall_construction: '/calculators/wall',
stud_walls: '/calculators/stud-wall',
roofing: '/calculators/roofing',
flooring: '/calculators/flooring',
plasterboard: '/calculators/plasterboard',
plaster_skim: '/calculators/plaster-skim',
drainage: '/calculators/drainage',
concrete_mix: '/calculators/concrete',
insulation: '/calculators/insulation',
staircase: '/calculators/staircase',
painting: '/calculators/painting',
};

return routeMap[calculatorType] || '/calculators';
}

export default function ProjectDetail() {
const navigate = useNavigate();
const { id } = useParams();
const { user } = useAuth();

const [project, setProject] = useState(null);
const [calculations, setCalculations] = useState([]);
const [loading, setLoading] = useState(true);
const [deletingCalculationId, setDeletingCalculationId] = useState(null);

const [editingProject, setEditingProject] = useState(false);
const [editName, setEditName] = useState('');
const [editNotes, setEditNotes] = useState('');
const [savingProject, setSavingProject] = useState(false);

const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
const [deletingProject, setDeletingProject] = useState(false);

const loadProjectData = async () => {
if (!user?.id || !id) return;

setLoading(true);

try {
const { data: projectData, error: projectError } = await supabase
.from('projects')
.select('*')
.eq('id', id)
.eq('user_id', user.id)
.maybeSingle();

if (projectError) {
console.error('Failed to load project:', projectError);
setProject(null);
setCalculations([]);
return;
}

setProject(projectData || null);

if (projectData) {
setEditName(projectData.name || '');
setEditNotes(projectData.notes || '');
}

const { data: calcData, error: calcError } = await supabase
.from('calculations')
.select('*')
.eq('project_id', id)
.eq('user_id', user.id)
.order('created_at', { ascending: false });

if (calcError) {
console.error('Failed to load calculations:', calcError);
setCalculations([]);
return;
}

setCalculations(calcData || []);
} catch (error) {
console.error('Unexpected project detail load error:', error);
setProject(null);
setCalculations([]);
} finally {
setLoading(false);
}
};

useEffect(() => {
loadProjectData();
}, [user?.id, id]);

const updateProject = async () => {
if (!user?.id || !project?.id || !editName.trim()) return;

setSavingProject(true);

try {
const { error } = await supabase
.from('projects')
.update({
name: editName.trim(),
notes: editNotes.trim() || null,
})
.eq('id', project.id)
.eq('user_id', user.id);

if (error) {
console.error('Failed to update project:', error);
return;
}

setProject((prev) => ({
...prev,
name: editName.trim(),
notes: editNotes.trim() || null,
}));
setEditingProject(false);
} catch (error) {
console.error('Unexpected update project error:', error);
} finally {
setSavingProject(false);
}
};

const handleDeleteProject = async () => {
if (!project?.id || !user?.id) return;

setDeletingProject(true);

try {
const { error } = await supabase
.from('projects')
.delete()
.eq('id', project.id)
.eq('user_id', user.id);

if (error) {
console.error('Failed to delete project:', error);
return;
}

navigate('/projects');
} catch (error) {
console.error('Unexpected delete project error:', error);
} finally {
setDeletingProject(false);
setDeleteProjectDialogOpen(false);
}
};

const deleteCalculation = async (calculationId) => {
setDeletingCalculationId(calculationId);

try {
const { error } = await supabase
.from('calculations')
.delete()
.eq('id', calculationId)
.eq('user_id', user.id);

if (error) {
console.error('Failed to delete calculation:', error);
return;
}

setCalculations((prev) => prev.filter((item) => item.id !== calculationId));
} catch (error) {
console.error('Unexpected delete calculation error:', error);
} finally {
setDeletingCalculationId(null);
}
};

const handleOpenInCalculator = (calc) => {
const route = getCalculatorRoute(calc.calculator_type);
const normalised = normaliseResults(calc.results);

navigate(route, {
state: {
prefillInputs: calc.inputs || {},
calculationId: calc.id,
projectId: calc.project_id,
calculatorType: calc.calculator_type,
projectName: project?.name || '',
savedResults: normalised.rows,
},
});
};

const calculationCountLabel = useMemo(() => {
if (calculations.length === 1) return '1 saved calculation';
return `${calculations.length} saved calculations`;
}, [calculations.length]);

return (
<div className="space-y-6">
<Link
to="/projects"
className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1"
>
<ArrowLeft className="w-4 h-4" /> Back to Projects
</Link>

<Dialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
<DialogContent>
<DialogHeader>
<DialogTitle>Delete Project</DialogTitle>
<DialogDescription>
Are you sure you want to delete this project? This will also remove all saved calculations inside it.
</DialogDescription>
</DialogHeader>

<DialogFooter>
<Button
variant="outline"
onClick={() => setDeleteProjectDialogOpen(false)}
disabled={deletingProject}
>
Cancel
</Button>
<Button
variant="destructive"
onClick={handleDeleteProject}
disabled={deletingProject}
>
{deletingProject ? 'Deleting...' : 'Delete Project'}
</Button>
</DialogFooter>
</DialogContent>
</Dialog>

{loading ? (
<Card>
<CardContent className="py-16 text-center">
<p className="text-sm text-muted-foreground">Loading project...</p>
</CardContent>
</Card>
) : !project ? (
<Card>
<CardContent className="py-16 text-center">
<p className="font-semibold mb-1">Project not found</p>
<p className="text-sm text-muted-foreground">
This project does not exist or you do not have access to it.
</p>
</CardContent>
</Card>
) : (
<>
<Card>
<CardHeader className="space-y-4">
{!editingProject ? (
<div className="flex items-start justify-between gap-4 flex-wrap">
<CardTitle className="font-heading text-2xl">
{project.name}
</CardTitle>

<div className="flex gap-2">
<Button
size="sm"
variant="outline"
onClick={() => setEditingProject(true)}
>
Edit Project
</Button>

<Button
size="sm"
variant="destructive"
onClick={() => setDeleteProjectDialogOpen(true)}
>
Delete Project
</Button>
</div>
</div>
) : (
<div className="space-y-3">
<Input
value={editName}
onChange={(e) => setEditName(e.target.value)}
placeholder="Project name"
/>

<Input
value={editNotes}
onChange={(e) => setEditNotes(e.target.value)}
placeholder="Project notes"
/>

<div className="flex gap-2">
<Button
size="sm"
onClick={updateProject}
disabled={savingProject || !editName.trim()}
>
{savingProject ? 'Saving...' : 'Save Changes'}
</Button>

<Button
size="sm"
variant="outline"
onClick={() => {
setEditingProject(false);
setEditName(project.name || '');
setEditNotes(project.notes || '');
}}
>
Cancel
</Button>
</div>
</div>
)}

<div className="space-y-3">
<div className="flex items-center gap-3 flex-wrap">
<Badge variant="secondary" className="capitalize">
{project.calculator_type?.replace(/_/g, ' ')}
</Badge>

{project.created_at && (
<span className="flex items-center gap-1 text-sm text-muted-foreground">
<Calendar className="w-4 h-4" />
{format(new Date(project.created_at), 'dd MMM yyyy')}
</span>
)}

<span className="text-sm text-muted-foreground">
{calculationCountLabel}
</span>
</div>

{project.notes && (
<p className="text-sm text-muted-foreground">{project.notes}</p>
)}
</div>
</CardHeader>
</Card>

<div className="space-y-3">
<h2 className="font-heading text-xl font-semibold">Saved Calculations</h2>

{calculations.length === 0 ? (
<Card>
<CardContent className="py-12 text-center">
<FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
<p className="font-medium mb-1">No saved calculations yet</p>
<p className="text-sm text-muted-foreground">
Run a calculator and save the result into this project.
</p>
</CardContent>
</Card>
) : (
<Accordion type="single" collapsible className="space-y-3">
{calculations.map((calc, index) => {
const normalised = normaliseResults(calc.results);

return (
<Card key={calc.id}>
<AccordionItem value={calc.id} className="border-none">
<AccordionTrigger className="px-4 py-4 hover:no-underline">
<div className="flex flex-col items-start text-left">
<div className="flex items-center gap-2 flex-wrap">
<p className="font-semibold capitalize">
{calc.calculator_type?.replace(/_/g, ' ')}
</p>

<Badge variant="outline">
Calculation {calculations.length - index}
</Badge>

{normalised.pricingIncluded && (
<Badge className="bg-accent/10 text-accent border-0">
<PoundSterling className="w-3 h-3 mr-1" />
Pricing Included
</Badge>
)}
</div>

{calc.created_at && (
<p className="text-xs text-muted-foreground mt-1">
Saved {format(new Date(calc.created_at), 'dd MMM yyyy HH:mm')}
</p>
)}
</div>
</AccordionTrigger>

<AccordionContent className="px-4 pb-4">
<div className="space-y-4">
{calc.inputs && typeof calc.inputs === 'object' && (
<div>
<p className="text-sm font-medium mb-2">Inputs</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
{Object.entries(calc.inputs).map(([key, value]) => (
<div
key={key}
className="rounded-lg border bg-muted/30 p-3"
>
<p className="text-xs text-muted-foreground mb-1">
{formatLabel(key)}
</p>
<p className="text-sm font-medium">
{formatValue(value)}
</p>
</div>
))}
</div>
</div>
)}

<div>
<div className="flex items-center justify-between gap-3 mb-2">
<p className="text-sm font-medium">Results</p>

{normalised.pricingIncluded && (
<p className="text-sm font-semibold">
Estimated Total: {money(normalised.pricingTotal)}
</p>
)}
</div>

<div className="space-y-2">
{normalised.rows.length > 0 ? (
normalised.rows.map((row, rowIndex) => (
<div
key={rowIndex}
className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
>
<div>
<p className="font-medium">{row.material}</p>
{row.notes && (
<p className="text-xs text-muted-foreground">
{row.notes}
</p>
)}
</div>

<div className="text-sm sm:text-right">
<p className="font-semibold">
{row.quantity} {row.unit}
</p>

{normalised.pricingIncluded && (
<p className="text-xs text-muted-foreground">
{row.rate ? `${money(row.rate)} rate` : 'No rate'} ·{' '}
{row.total ? money(row.total) : '—'}
</p>
)}
</div>
</div>
))
) : (
<div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
No result rows available.
</div>
)}
</div>
</div>

<div className="pt-2 flex flex-wrap gap-2">
<Button
variant="outline"
size="sm"
onClick={() => handleOpenInCalculator(calc)}
>
<SquarePen className="w-4 h-4 mr-2" />
Open in Calculator
</Button>

<Button
variant="ghost"
size="sm"
onClick={() => deleteCalculation(calc.id)}
disabled={deletingCalculationId === calc.id}
className="text-muted-foreground hover:text-destructive"
>
<Trash2 className="w-4 h-4 mr-2" />
{deletingCalculationId === calc.id
? 'Deleting...'
: 'Delete Calculation'}
</Button>
</div>
</div>
</AccordionContent>
</AccordionItem>
</Card>
);
})}
</Accordion>
)}
</div>
</>
)}
</div>
);
}