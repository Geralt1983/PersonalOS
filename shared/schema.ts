import { z } from "zod";

export type EnergyLevel = "low" | "medium" | "high";

export interface EnergyTask {
  label: string;
  duration: string;
}

export interface EnergyState {
  id: string;
  level: EnergyLevel;
  streak: number;
  lastUpdated: string;
}

export interface Anchor {
  id: number;
  label: string;
  active: boolean;
}

export interface ProjectStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  effort: "quick" | "medium" | "heavy";
}

export interface BrainDumpEntry {
  id: number;
  text: string;
  timestamp: string;
}

export interface MomentumData {
  completedToday: number;
  weeklyCompletion: number;
  weeklyTarget: number;
  streak: number;
}

export interface SanctuaryData {
  energyState: EnergyState;
  anchors: Anchor[];
  projectSteps: ProjectStep[];
  brainDumpEntries: BrainDumpEntry[];
  momentum: MomentumData;
}

export const energyStateSchema = z.object({
  id: z.string(),
  level: z.enum(["low", "medium", "high"]),
  streak: z.number(),
  lastUpdated: z.string(),
});

export const anchorSchema = z.object({
  id: z.number(),
  label: z.string(),
  active: z.boolean(),
});

export const projectStepSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  effort: z.enum(["quick", "medium", "heavy"]),
});

export const brainDumpEntrySchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Entry cannot be empty"),
  timestamp: z.string(),
});

export const insertBrainDumpSchema = brainDumpEntrySchema.omit({ id: true, timestamp: true });

export type InsertBrainDump = z.infer<typeof insertBrainDumpSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
