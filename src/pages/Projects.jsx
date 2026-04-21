import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FolderOpen, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CALC_TYPES = [
  { value: 'wall_construction', label: 'Wall Construction' },
  { value: 'stud_walls', label: 'Stud Walls' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'plasterboard', label: 'Plasterboard' },
  { value: 'plaster_skim', label: 'Plaster Skim' },
  { value: 'drainage', label: 'Drainage' },
];

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    calculator_type: 'wall_construction',
    notes: '',
  });

  const createProject = () => {
    if (!newProject.name.trim()) return;

    const project = {
      id: Date.now().toString(),
      name: newProject.name,
      calculator_type: newProject.calculator_type,
      notes: newProject.notes,
      status: 'draft',
      created_date: new Date().toISOString(),
    };

    setProjects((prev) => [project, ...prev]);
    setDialogOpen(false);
    setNewProject({
      name: '',
      calculator_type: 'wall_construction',
      notes: '',
    });
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your construction calculation projects.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Create Project</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="e.g. Kitchen Extension"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Calculator Type</Label>
                <Select
                  value={newProject.calculator_type}
                  onValueChange={(v) =>
                    setNewProject((p) => ({ ...p, calculator_type: v }))
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
                    setNewProject((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>

              <Button
                onClick={createProject}
                disabled={!newProject.name.trim()}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-heading font-semibold text-lg mb-1">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create your first project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-heading font-semibold truncate">{p.name}</p>
                    <Badge variant="secondary" className="capitalize text-xs shrink-0">
                      {p.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="capitalize">
                      {p.calculator_type?.replace(/_/g, ' ')}
                    </span>

                    {p.created_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(p.created_date), 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>

                  {p.notes && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {p.notes}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteProject(p.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}