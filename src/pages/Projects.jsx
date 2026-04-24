import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/subscriptionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FolderOpen, Trash2, Calendar, FileText, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DIY_PROJECT_LIMIT = 20;

const CALC_TYPES = [
  { value: 'wall_construction', label: 'Wall Construction' },
  { value: 'stud_walls', label: 'Stud Walls' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'plasterboard', label: 'Plasterboard' },
  { value: 'plaster_skim', label: 'Plaster Skim' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'concrete_mix', label: 'Concrete Mix' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'staircase', label: 'Staircase' },
  { value: 'painting', label: 'Painting' },
];

export default function Projects() {
  const { user } = useAuth();
  const sub = useSubscription();

  const isCompanyPlan = sub.plan === 'company' && (sub.status === 'trial' || sub.status === 'active');
  const isDiyLimited = !isCompanyPlan;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const [newProject, setNewProject] = useState({
    name: '',
    calculator_type: 'wall_construction',
    notes: '',
  });

  const projectLimitReached = isDiyLimited && projects.length >= DIY_PROJECT_LIMIT;

  const loadProjectCounts = async () => {
    if (!user?.id) return;

    setLoadingCounts(true);

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to load calculation counts:', error);
        return;
      }

      const countsByProject = (data || []).reduce((acc, row) => {
        acc[row.project_id] = (acc[row.project_id] || 0) + 1;
        return acc;
      }, {});

      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          calculation_count: countsByProject[project.id] || 0,
        }))
      );
    } catch (error) {
      console.error('Unexpected calculation count load error:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  const loadProjects = async () => {
    if (!user?.id) {
      setProjects([]);
      setLoadingProjects(false);
      return;
    }

    setLoadingProjects(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, calculator_type, notes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
        return;
      }

      const initialProjects = (data || []).map((project) => ({
        ...project,
        calculation_count: 0,
      }));

      setProjects(initialProjects);
      setLoadingProjects(false);

      if (initialProjects.length > 0) {
        loadProjectCounts();
      }
    } catch (error) {
      console.error('Unexpected project load error:', error);
      setProjects([]);
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const createProject = async () => {
    if (!user?.id || !newProject.name.trim()) return;

    if (projectLimitReached) {
      toast.error(`DIY plan is limited to ${DIY_PROJECT_LIMIT} projects. Upgrade to Company for unlimited projects.`);
      return;
    }

    setCreatingProject(true);

    try {
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        team_id: isCompanyPlan && sub.team?.id ? sub.team.id : null,
        name: newProject.name.trim(),
        calculator_type: newProject.calculator_type,
        notes: newProject.notes.trim() || null,
      });

      if (error) {
        console.error('Failed to create project:', error);
        toast.error('Could not create project.');
        return;
      }

      setDialogOpen(false);
      setNewProject({
        name: '',
        calculator_type: 'wall_construction',
        notes: '',
      });

      await loadProjects();
      toast.success('Project created.');
    } catch (error) {
      console.error('Unexpected create project error:', error);
      toast.error('Could not create project.');
    } finally {
      setCreatingProject(false);
    }
  };

  const deleteProject = async (id) => {
    if (!id || !user?.id) return;

    setDeletingProjectId(id);

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete project:', error);
        toast.error('Could not delete project.');
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted.');
    } catch (error) {
      console.error('Unexpected delete project error:', error);
      toast.error('Could not delete project.');
    } finally {
      setDeletingProjectId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your construction calculation projects.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={projectLimitReached}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              {projectLimitReached ? (
                <Lock className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Project
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Create Project</DialogTitle>
              <DialogDescription>
                Create a new project to store your calculations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {projectLimitReached && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  DIY plan is limited to {DIY_PROJECT_LIMIT} projects. Upgrade to Company for unlimited projects.
                </div>
              )}

              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="e.g. Kitchen Extension"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Calculator Type</Label>
                <Select
                  value={newProject.calculator_type}
                  onValueChange={(value) =>
                    setNewProject((prev) => ({ ...prev, calculator_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALC_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Add any notes..."
                  value={newProject.notes}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <Button
                onClick={createProject}
                disabled={!newProject.name.trim() || creatingProject || projectLimitReached}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isDiyLimited && (
        <Card className="mb-4 border-accent/20 bg-accent/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">
                DIY project usage: {projects.length} / {DIY_PROJECT_LIMIT}
              </p>
              <p className="text-sm text-muted-foreground">
                Upgrade to Company for unlimited projects and team access.
              </p>
            </div>
            <Link to="/billing">
              <Button variant="outline">Upgrade</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {loadingProjects ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-heading font-semibold text-lg mb-1">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first project to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {loadingCounts && (
            <p className="text-xs text-muted-foreground mb-3">
              Updating calculation counts...
            </p>
          )}

          <div className="space-y-3">
            {projects.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <Link to={`/projects/${p.id}`} className="min-w-0 flex-1 block">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-heading font-semibold truncate">{p.name}</p>
                        <Badge variant="secondary" className="capitalize text-xs shrink-0">
                          draft
                        </Badge>
                        <Badge variant="outline" className="text-xs shrink-0">
                          <FileText className="w-3 h-3 mr-1" />
                          {p.calculation_count} {p.calculation_count === 1 ? 'calc' : 'calcs'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="capitalize">
                          {p.calculator_type?.replace(/_/g, ' ')}
                        </span>

                        {p.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(p.created_at), 'dd MMM yyyy')}
                          </span>
                        )}
                      </div>

                      {p.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProject(p.id)}
                    disabled={deletingProjectId === p.id}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}