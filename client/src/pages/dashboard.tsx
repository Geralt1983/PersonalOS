import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { VitalityGauge } from "@/components/vitality-gauge";
import { TheAnchor } from "@/components/the-anchor";
import { TheConstruct } from "@/components/the-construct";
import { BrainDump } from "@/components/brain-dump";
import { MomentumWidget } from "@/components/momentum-widget";
import { EnergyHistory } from "@/components/energy-history";
import { WeeklyReflections } from "@/components/weekly-reflections";
import { SystemHUD } from "@/components/system-hud";
import { TheDeck, DeckView } from "@/components/the-deck";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EnergyLevel, MomentumData, Project, ProjectStep, Tag, BrainDumpEntry } from "@shared/schema";

interface AnchorWithStatus {
  id: number;
  label: string;
  icon: string | null;
  sortOrder: number | null;
  createdAt: Date;
  active: boolean;
}

interface ProjectStepData {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  effort: string | null;
  completed: boolean | null;
  sortOrder: number | null;
  completedAt: Date | null;
}

interface BrainDumpEntryData {
  id: number;
  text: string;
  timestamp: string;
  category: string | null;
  tagIds: number[] | null;
}

interface SanctuaryData {
  energyState: {
    id: string;
    level: EnergyLevel;
    streak: number;
    lastUpdated: string;
  };
  anchors: AnchorWithStatus[];
  project: { id: number; name: string } | null;
  projectSteps: ProjectStepData[];
  brainDumpEntries: BrainDumpEntryData[];
  momentum: MomentumData;
}

export default function Dashboard() {
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<DeckView>("gauge");
  
  const gaugeRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const constructRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);

  const refs: Record<DeckView, React.RefObject<HTMLDivElement>> = {
    gauge: gaugeRef,
    anchor: anchorRef,
    brain: brainRef,
    construct: constructRef,
    history: historyRef,
    momentum: momentumRef,
    reflection: reflectionRef,
  };

  const handleViewChange = useCallback((view: DeckView) => {
    setCurrentView(view);
    const ref = refs[view];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  
  const { data, isLoading, error } = useQuery<SanctuaryData>({
    queryKey: ["/api/sanctuary"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: projectSteps = [] } = useQuery<ProjectStep[]>({
    queryKey: ["/api/projects", activeProjectId, "steps"],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const res = await fetch(`/api/projects/${activeProjectId}/steps`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch steps");
      return res.json();
    },
    enabled: !!activeProjectId,
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const { data: brainDumpEntries = [] } = useQuery<BrainDumpEntry[]>({
    queryKey: ["/api/brain-dump"],
  });

  useEffect(() => {
    if (data?.project && !activeProjectId) {
      setActiveProjectId(data.project.id);
    } else if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [data?.project, projects, activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || data?.project || null;

  const logEnergyMutation = useMutation({
    mutationFn: async (level: EnergyLevel) => {
      return apiRequest("POST", "/api/energy/log", { level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          query.queryKey[0] === "/api/energy/logs"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/energy/patterns"] });
    },
  });

  const toggleAnchorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/anchors/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
    },
  });

  const toggleStepMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/project-steps/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", activeProjectId, "steps"] });
      }
    },
  });

  const addBrainDumpMutation = useMutation({
    mutationFn: async ({ text, category, tagIds }: { text: string; category?: string; tagIds?: number[] }) => {
      return apiRequest("POST", "/api/brain-dump", { text, category, tagIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brain-dump"] });
    },
  });

  const deleteBrainDumpMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/brain-dump/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brain-dump"] });
    },
  });

  const updateBrainDumpMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: { tagIds?: number[]; category?: string } }) => {
      return apiRequest("PATCH", `/api/brain-dump/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brain-dump"] });
    },
  });

  const archiveBrainDumpMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/brain-dump/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brain-dump"] });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/tags", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
    },
  });

  const handleEnergyChange = (level: EnergyLevel) => {
    logEnergyMutation.mutate(level);
  };

  const handleAnchorToggle = (id: number) => {
    toggleAnchorMutation.mutate(id);
  };

  const handleStepToggle = (id: number) => {
    toggleStepMutation.mutate(id);
  };

  const handleAddBrainDump = (text: string, category?: string, tagIds?: number[]) => {
    addBrainDumpMutation.mutate({ text, category, tagIds });
  };

  const handleDeleteBrainDump = (id: number) => {
    deleteBrainDumpMutation.mutate(id);
  };

  const handleUpdateBrainDump = (id: number, updates: { tagIds?: number[]; category?: string }) => {
    updateBrainDumpMutation.mutate({ id, updates });
  };

  const handleArchiveBrainDump = (id: number) => {
    archiveBrainDumpMutation.mutate(id);
  };

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-xl" />
        <main className="pt-16 pb-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const handleProjectChange = (projectId: number) => {
    setActiveProjectId(projectId);
    queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "steps"] });
  };

  const anchorsForComponent = data.anchors.map(a => ({
    id: a.id,
    label: a.label,
    active: a.active,
  }));

  const stepsForComponent = (activeProjectId && projectSteps.length > 0 ? projectSteps : data.projectSteps).map(s => ({
    id: s.id,
    title: s.title,
    description: (s as any).description || "",
    completed: s.completed || false,
    effort: (s.effort || "medium") as "quick" | "medium" | "heavy",
  }));

  const brainDumpEntriesFiltered = brainDumpEntries.length > 0 
    ? brainDumpEntries.filter(e => !e.archivedAt)
    : data.brainDumpEntries.filter(e => !(e as any).archivedAt);

  return (
    <div className="min-h-screen bg-background selection:bg-cyan-500/30 overflow-x-hidden">
      <SystemHUD streak={data.energyState.streak} />

      <main className="pt-16 pb-40 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.section
          ref={gaugeRef}
          id="gauge"
          className="min-h-[70vh] flex flex-col justify-center py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VitalityGauge
            energyLevel={data.energyState.level}
            streak={data.energyState.streak}
            onEnergyChange={handleEnergyChange}
            isUpdating={logEnergyMutation.isPending}
          />
        </motion.section>

        <motion.section
          ref={anchorRef}
          id="anchor"
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <TheAnchor 
            anchors={anchorsForComponent} 
            onToggle={handleAnchorToggle} 
          />
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <motion.section
            ref={brainRef}
            id="brain"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <BrainDump
              entries={brainDumpEntriesFiltered}
              tags={tags}
              onAdd={handleAddBrainDump}
              onDelete={handleDeleteBrainDump}
              onUpdate={handleUpdateBrainDump}
              onArchive={handleArchiveBrainDump}
              onCreateTag={handleCreateTag}
            />
          </motion.section>

          <motion.section
            ref={constructRef}
            id="construct"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TheConstruct 
              project={activeProject}
              steps={stepsForComponent} 
              onToggle={handleStepToggle}
              onProjectChange={handleProjectChange}
            />
          </motion.section>
        </div>

        <motion.section
          ref={historyRef}
          id="history"
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <EnergyHistory />
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <motion.section
            ref={momentumRef}
            id="momentum"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <MomentumWidget data={data.momentum} />
          </motion.section>

          <motion.section
            ref={reflectionRef}
            id="reflection"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WeeklyReflections />
          </motion.section>
        </div>

        <footer className="py-12 text-center">
          <p className="text-xs text-muted-foreground italic font-mono">
            "Match tasks to energy levels, not arbitrary ambition."
          </p>
        </footer>
      </main>

      <TheDeck currentView={currentView} onChangeView={handleViewChange} />
    </div>
  );
}
