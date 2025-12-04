import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Hammer, Check, Plus, FolderOpen, BookTemplate, ChevronDown, X, Layers, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, ProjectTemplate, TemplateStep } from "@shared/schema";

const effortLabels: Record<string, { label: string; color: string }> = {
  quick: { label: "Quick win", color: "text-green-400" },
  medium: { label: "Medium effort", color: "text-nebula-blue" },
  heavy: { label: "Deep work", color: "text-glow-purple" },
};

interface StepItem {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  effort: "quick" | "medium" | "heavy";
}

interface TheConstructProps {
  project?: { id: number; name: string } | null;
  steps: StepItem[];
  onToggle: (id: number) => void;
  onProjectChange?: (projectId: number) => void;
  onAddStep?: (data: { title: string; effort: string }) => void;
}

export function TheConstruct({ project, steps, onToggle, onProjectChange, onAddStep }: TheConstructProps) {
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepEffort, setNewStepEffort] = useState("medium");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [newSteps, setNewSteps] = useState<{ title: string; effort: string }[]>([]);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: templates = [] } = useQuery<ProjectTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; templateId?: number }) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: async (newProject) => {
      if (!selectedTemplateId && newSteps.length > 0) {
        for (let i = 0; i < newSteps.length; i++) {
          await apiRequest("POST", "/api/project-steps", {
            projectId: newProject.id,
            title: newSteps[i].title,
            effort: newSteps[i].effort,
            sortOrder: i,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      setIsNewProjectOpen(false);
      resetNewProjectForm();
      if (onProjectChange) onProjectChange(newProject.id);
    },
  });

  const addStepMutation = useMutation({
    mutationFn: async (data: { title: string; effort: string }) => {
      if (!project) return;
      return apiRequest("POST", "/api/project-steps", {
        projectId: project.id,
        title: data.title,
        effort: data.effort,
        sortOrder: steps.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      setNewStepTitle("");
      setNewStepEffort("medium");
      setIsAddStepOpen(false);
    },
  });

  const saveAsTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const res = await apiRequest("POST", "/api/templates", {
        name: `${project.name} Template`,
        description: `Template created from ${project.name}`,
      });
      const template = await res.json();
      
      for (let i = 0; i < steps.length; i++) {
        await apiRequest("POST", "/api/template-steps", {
          templateId: template.id,
          title: steps[i].title,
          description: steps[i].description || "",
          effort: steps[i].effort || "medium",
          sortOrder: i,
        });
      }
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });

  const resetNewProjectForm = () => {
    setProjectName("");
    setProjectDescription("");
    setSelectedTemplateId("");
    setNewSteps([]);
  };

  const addNewStep = () => {
    setNewSteps([...newSteps, { title: "", effort: "medium" }]);
  };

  const updateNewStep = (index: number, field: "title" | "effort", value: string) => {
    const updated = [...newSteps];
    updated[index][field] = value;
    setNewSteps(updated);
  };

  const removeNewStep = (index: number) => {
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    createProjectMutation.mutate({
      name: projectName,
      description: projectDescription || undefined,
      templateId: selectedTemplateId ? parseInt(selectedTemplateId) : undefined,
    });
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    addStepMutation.mutate({ title: newStepTitle, effort: newStepEffort });
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <SpotlightCard className="steel-card border-glow-purple/20 h-fit flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Hammer className="w-4 h-4 text-glow-purple shrink-0" />
            
            <Popover open={isProjectSelectorOpen} onOpenChange={setIsProjectSelectorOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto py-0.5 px-1 font-semibold text-sm hover:bg-steel-light/30 truncate max-w-[140px]"
                  data-testid="button-select-project"
                >
                  <span className="truncate">{project?.name || "Select Project"}</span>
                  <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-card" align="start">
                <div className="space-y-1">
                  {projects.map((p) => (
                    <Button
                      key={p.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm h-8 ${p.id === project?.id ? "bg-steel-light/30" : ""}`}
                      onClick={() => {
                        if (onProjectChange) onProjectChange(p.id);
                        setIsProjectSelectorOpen(false);
                      }}
                      data-testid={`button-project-${p.id}`}
                    >
                      {p.name}
                    </Button>
                  ))}
                  <div className="border-t border-border/40 pt-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-8 text-nebula-cyan"
                      onClick={() => {
                        setIsProjectSelectorOpen(false);
                        setIsNewProjectOpen(true);
                      }}
                      data-testid="button-new-project-inline"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      New Project
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            {project && steps.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-glow-purple"
                onClick={() => saveAsTemplateMutation.mutate()}
                disabled={saveAsTemplateMutation.isPending}
                title="Save as template"
                data-testid="button-save-template"
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
            <CardDescription className="text-xs">{progress}% complete</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4">
        <div className="relative h-2 rounded-full bg-steel-light/50 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-glow-purple to-nebula-cyan transition-all duration-500 progress-glow"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar-construct"
          />
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {steps.map((step) => {
            const effort = effortLabels[step.effort];
            
            return (
              <div 
                key={step.id} 
                onClick={() => onToggle(step.id)} 
                className="cursor-pointer group"
                data-testid={`toggle-step-${step.id}`}
              >
                <div className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${step.completed ? "opacity-60" : "hover:bg-steel-light/30"}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                        ${step.completed 
                          ? "bg-glow-purple border-glow-purple" 
                          : "border-border/60 group-hover:border-glow-purple/60"
                        }
                      `}
                    >
                      {step.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium transition-all ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {step.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{step.description}</span>
                      <span className={`text-xs ${effort.color}`}>{effort.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {project && (
          <Popover open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-8 text-nebula-cyan border border-dashed border-border/40 hover:border-nebula-cyan/40"
                data-testid="button-add-step"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add micro-step
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 bg-card" align="start">
              <div className="space-y-3">
                <Input
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Step description..."
                  className="bg-steel-light/20 h-8"
                  data-testid="input-new-step"
                />
                <div className="flex items-center gap-2">
                  <Select value={newStepEffort} onValueChange={setNewStepEffort}>
                    <SelectTrigger className="flex-1 h-8 bg-steel-light/20" data-testid="select-step-effort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick win</SelectItem>
                      <SelectItem value="medium">Medium effort</SelectItem>
                      <SelectItem value="heavy">Deep work</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAddStep}
                    disabled={!newStepTitle.trim() || addStepMutation.isPending}
                    className="bg-nebula-cyan hover:bg-nebula-cyan/80 h-8"
                    data-testid="button-confirm-add-step"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {progress === 100 && steps.length > 0 && (
          <div className="text-center text-xs text-glow-purple italic pt-2 border-t border-border/30">
            Project complete. You built something real.
          </div>
        )}

        {!project && (
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No project selected</p>
            <p className="text-xs mt-1">Select or create a project to track</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-nebula-cyan" />
              New Project
            </DialogTitle>
            <DialogDescription>
              Create a new project to track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My new project..."
                className="bg-steel-light/20"
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="What are you building?"
                className="bg-steel-light/20 resize-none"
                rows={2}
                data-testid="input-project-description"
              />
            </div>

            {templates.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Use Template (optional)</label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="bg-steel-light/20" data-testid="select-template">
                    <SelectValue placeholder="Start from scratch..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Start from scratch</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(!selectedTemplateId || selectedTemplateId === "none") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Micro-steps</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addNewStep}
                    className="text-nebula-cyan h-7"
                    data-testid="button-add-new-step"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Step
                  </Button>
                </div>
                
                {newSteps.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No steps yet. You can add them now or later.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {newSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={step.title}
                          onChange={(e) => updateNewStep(index, "title", e.target.value)}
                          placeholder={`Step ${index + 1}...`}
                          className="flex-1 bg-steel-light/20 h-8 text-sm"
                          data-testid={`input-new-step-${index}`}
                        />
                        <Select
                          value={step.effort}
                          onValueChange={(v) => updateNewStep(index, "effort", v)}
                        >
                          <SelectTrigger className="w-24 h-8 bg-steel-light/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quick">Quick</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="heavy">Heavy</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeNewStep(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsNewProjectOpen(false);
                resetNewProjectForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || createProjectMutation.isPending}
              className="bg-nebula-cyan hover:bg-nebula-cyan/80"
              data-testid="button-create-project"
            >
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SpotlightCard>
  );
}
