import { randomUUID } from "crypto";
import type { 
  EnergyState, 
  Anchor, 
  ProjectStep, 
  BrainDumpEntry, 
  MomentumData,
  EnergyLevel
} from "@shared/schema";

export interface IStorage {
  getEnergyState(): Promise<EnergyState>;
  updateEnergyState(level: EnergyLevel): Promise<EnergyState>;
  
  getAnchors(): Promise<Anchor[]>;
  toggleAnchor(id: number): Promise<Anchor[]>;
  
  getProjectSteps(): Promise<ProjectStep[]>;
  toggleProjectStep(id: number): Promise<ProjectStep[]>;
  
  getBrainDumpEntries(): Promise<BrainDumpEntry[]>;
  addBrainDumpEntry(text: string): Promise<BrainDumpEntry>;
  deleteBrainDumpEntry(id: number): Promise<void>;
  
  getMomentum(): Promise<MomentumData>;
  incrementMomentum(): Promise<MomentumData>;
  decrementMomentum(): Promise<MomentumData>;
}

export class MemStorage implements IStorage {
  private energyState: EnergyState;
  private anchors: Anchor[];
  private projectSteps: ProjectStep[];
  private brainDumpEntries: BrainDumpEntry[];
  private momentum: MomentumData;

  constructor() {
    this.energyState = {
      id: randomUUID(),
      level: "medium",
      streak: 7,
      lastUpdated: new Date().toISOString(),
    };

    this.anchors = [
      { id: 1, label: "Hydrate (32oz)", active: false },
      { id: 2, label: "No Phone in Bed", active: false },
      { id: 3, label: "Read Physics (10m)", active: false },
    ];

    this.projectSteps = [
      { id: 1, title: "Clear & Assess", description: "Remove existing items, measure space", completed: true, effort: "quick" },
      { id: 2, title: "Prime Walls", description: "Prep and prime for paint", completed: true, effort: "medium" },
      { id: 3, title: "Paint Sunroom", description: "Two coats of Coastal Blue", completed: false, effort: "heavy" },
      { id: 4, title: "Install Shelving", description: "Mount 3 floating shelves", completed: false, effort: "medium" },
      { id: 5, title: "Style & Decorate", description: "Add plants, books, lighting", completed: false, effort: "quick" },
    ];

    this.brainDumpEntries = [
      { id: 1, text: "Order new sheets for sunroom", timestamp: "11:32 PM" },
      { id: 2, text: "Check paint humidity levels tomorrow", timestamp: "10:15 PM" },
      { id: 3, text: "Call contractor about shelving install", timestamp: "9:08 PM" },
    ];

    this.momentum = {
      completedToday: 5,
      weeklyCompletion: 28,
      weeklyTarget: 35,
      streak: 7,
    };
  }

  async getEnergyState(): Promise<EnergyState> {
    return this.energyState;
  }

  async updateEnergyState(level: EnergyLevel): Promise<EnergyState> {
    this.energyState = {
      ...this.energyState,
      level,
      lastUpdated: new Date().toISOString(),
    };
    return this.energyState;
  }

  async getAnchors(): Promise<Anchor[]> {
    return this.anchors;
  }

  async toggleAnchor(id: number): Promise<Anchor[]> {
    this.anchors = this.anchors.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    return this.anchors;
  }

  async getProjectSteps(): Promise<ProjectStep[]> {
    return this.projectSteps;
  }

  async toggleProjectStep(id: number): Promise<ProjectStep[]> {
    this.projectSteps = this.projectSteps.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    return this.projectSteps;
  }

  async getBrainDumpEntries(): Promise<BrainDumpEntry[]> {
    return this.brainDumpEntries;
  }

  async addBrainDumpEntry(text: string): Promise<BrainDumpEntry> {
    const newEntry: BrainDumpEntry = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    this.brainDumpEntries = [newEntry, ...this.brainDumpEntries];
    return newEntry;
  }

  async deleteBrainDumpEntry(id: number): Promise<void> {
    this.brainDumpEntries = this.brainDumpEntries.filter(e => e.id !== id);
  }

  async getMomentum(): Promise<MomentumData> {
    return this.momentum;
  }

  async incrementMomentum(): Promise<MomentumData> {
    this.momentum = {
      ...this.momentum,
      completedToday: this.momentum.completedToday + 1,
      weeklyCompletion: this.momentum.weeklyCompletion + 1,
    };
    return this.momentum;
  }

  async decrementMomentum(): Promise<MomentumData> {
    this.momentum = {
      ...this.momentum,
      completedToday: Math.max(0, this.momentum.completedToday - 1),
      weeklyCompletion: Math.max(0, this.momentum.weeklyCompletion - 1),
    };
    return this.momentum;
  }
}

export const storage = new MemStorage();
