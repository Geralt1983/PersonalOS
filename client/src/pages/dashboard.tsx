import { useQuery, useMutation } from "@tanstack/react-query";
import { VitalityGauge } from "@/components/vitality-gauge";
import { TheAnchor } from "@/components/the-anchor";
import { TheConstruct } from "@/components/the-construct";
import { BrainDump } from "@/components/brain-dump";
import { MomentumWidget } from "@/components/momentum-widget";
import { EnergyHistory } from "@/components/energy-history";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EnergyLevel, MomentumData } from "@shared/schema";

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
  const { data, isLoading, error } = useQuery<SanctuaryData>({
    queryKey: ["/api/sanctuary"],
  });

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
    },
  });

  const addBrainDumpMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/brain-dump", { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
    },
  });

  const deleteBrainDumpMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/brain-dump/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanctuary"] });
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

  const handleAddBrainDump = (text: string) => {
    addBrainDumpMutation.mutate(text);
  };

  const handleDeleteBrainDump = (id: number) => {
    deleteBrainDumpMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-3">
            <Skeleton className="h-[500px] rounded-xl" />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
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

  // Transform data to match component props
  const anchorsForComponent = data.anchors.map(a => ({
    id: a.id,
    label: a.label,
    active: a.active,
  }));

  const stepsForComponent = data.projectSteps.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description || "",
    completed: s.completed || false,
    effort: (s.effort || "medium") as "quick" | "medium" | "heavy",
  }));

  const brainDumpForComponent = data.brainDumpEntries.map(e => ({
    id: e.id,
    text: e.text,
    timestamp: e.timestamp,
  }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nebula-cyan to-glow-purple flex items-center justify-center">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight" data-testid="text-app-title">
              Sanctuary OS
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal energy dashboard
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <VitalityGauge
            energyLevel={data.energyState.level}
            streak={data.energyState.streak}
            onEnergyChange={handleEnergyChange}
            isUpdating={logEnergyMutation.isPending}
          />
          
          <EnergyHistory />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <TheAnchor 
            anchors={anchorsForComponent} 
            onToggle={handleAnchorToggle} 
          />
          
          <TheConstruct 
            steps={stepsForComponent} 
            onToggle={handleStepToggle} 
          />
          
          <BrainDump
            entries={brainDumpForComponent}
            onAdd={handleAddBrainDump}
            onDelete={handleDeleteBrainDump}
          />
          
          <MomentumWidget 
            data={data.momentum} 
          />
        </div>
      </main>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p className="italic">
          "Match tasks to energy levels, not arbitrary ambition."
        </p>
      </footer>
    </div>
  );
}
