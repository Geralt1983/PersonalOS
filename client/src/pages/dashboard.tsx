import { useState, useEffect, useCallback } from "react";
import { VitalityGauge } from "@/components/vitality-gauge";
import { TheAnchor } from "@/components/the-anchor";
import { TheConstruct } from "@/components/the-construct";
import { BrainDump } from "@/components/brain-dump";
import { MomentumWidget } from "@/components/momentum-widget";
import type { EnergyLevel, Anchor, ProjectStep, BrainDumpEntry, MomentumData } from "@shared/schema";

const STORAGE_KEY = "sanctuary-os-data";

interface SanctuaryState {
  energyLevel: EnergyLevel;
  streak: number;
  anchors: Anchor[];
  projectSteps: ProjectStep[];
  brainDumpEntries: BrainDumpEntry[];
  momentum: MomentumData;
  lastVisit: string;
}

const defaultState: SanctuaryState = {
  energyLevel: "medium",
  streak: 7,
  anchors: [
    { id: 1, label: "Hydrate (32oz)", active: false },
    { id: 2, label: "No Phone in Bed", active: false },
    { id: 3, label: "Read Physics (10m)", active: false },
  ],
  projectSteps: [
    { id: 1, title: "Clear & Assess", description: "Remove existing items, measure space", completed: true, effort: "quick" },
    { id: 2, title: "Prime Walls", description: "Prep and prime for paint", completed: true, effort: "medium" },
    { id: 3, title: "Paint Sunroom", description: "Two coats of Coastal Blue", completed: false, effort: "heavy" },
    { id: 4, title: "Install Shelving", description: "Mount 3 floating shelves", completed: false, effort: "medium" },
    { id: 5, title: "Style & Decorate", description: "Add plants, books, lighting", completed: false, effort: "quick" },
  ],
  brainDumpEntries: [
    { id: 1, text: "Order new sheets for sunroom", timestamp: "11:32 PM" },
    { id: 2, text: "Check paint humidity levels tomorrow", timestamp: "10:15 PM" },
    { id: 3, text: "Call contractor about shelving install", timestamp: "9:08 PM" },
  ],
  momentum: {
    completedToday: 5,
    weeklyCompletion: 28,
    weeklyTarget: 35,
    streak: 7,
  },
  lastVisit: new Date().toDateString(),
};

function loadState(): SanctuaryState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      
      if (parsed.lastVisit !== today) {
        return {
          ...parsed,
          anchors: parsed.anchors.map((a: Anchor) => ({ ...a, active: false })),
          momentum: {
            ...parsed.momentum,
            completedToday: 0,
          },
          lastVisit: today,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state:", e);
  }
  return defaultState;
}

function saveState(state: SanctuaryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export default function Dashboard() {
  const [state, setState] = useState<SanctuaryState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleEnergyChange = useCallback((level: EnergyLevel) => {
    setState(prev => ({ ...prev, energyLevel: level }));
  }, []);

  const handleAnchorToggle = useCallback((id: number) => {
    setState(prev => {
      const newAnchors = prev.anchors.map(a => 
        a.id === id ? { ...a, active: !a.active } : a
      );
      const wasActive = prev.anchors.find(a => a.id === id)?.active;
      const completedDelta = wasActive ? -1 : 1;
      
      return {
        ...prev,
        anchors: newAnchors,
        momentum: {
          ...prev.momentum,
          completedToday: Math.max(0, prev.momentum.completedToday + completedDelta),
          weeklyCompletion: Math.max(0, prev.momentum.weeklyCompletion + completedDelta),
        },
      };
    });
  }, []);

  const handleStepToggle = useCallback((id: number) => {
    setState(prev => {
      const step = prev.projectSteps.find(s => s.id === id);
      if (!step) return prev;
      
      const wasCompleted = step.completed;
      const completedDelta = wasCompleted ? -1 : 1;
      
      return {
        ...prev,
        projectSteps: prev.projectSteps.map(s => 
          s.id === id ? { ...s, completed: !s.completed } : s
        ),
        momentum: {
          ...prev.momentum,
          completedToday: Math.max(0, prev.momentum.completedToday + completedDelta),
          weeklyCompletion: Math.max(0, prev.momentum.weeklyCompletion + completedDelta),
        },
      };
    });
  }, []);

  const handleAddBrainDump = useCallback((text: string) => {
    const newEntry: BrainDumpEntry = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    
    setState(prev => ({
      ...prev,
      brainDumpEntries: [newEntry, ...prev.brainDumpEntries],
    }));
  }, []);

  const handleDeleteBrainDump = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      brainDumpEntries: prev.brainDumpEntries.filter(e => e.id !== id),
    }));
  }, []);

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
        <div className="lg:col-span-3">
          <VitalityGauge
            energyLevel={state.energyLevel}
            streak={state.streak}
            onEnergyChange={handleEnergyChange}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <TheAnchor 
            anchors={state.anchors} 
            onToggle={handleAnchorToggle} 
          />
          
          <TheConstruct 
            steps={state.projectSteps} 
            onToggle={handleStepToggle} 
          />
          
          <BrainDump
            entries={state.brainDumpEntries}
            onAdd={handleAddBrainDump}
            onDelete={handleDeleteBrainDump}
          />
          
          <MomentumWidget 
            data={state.momentum} 
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
