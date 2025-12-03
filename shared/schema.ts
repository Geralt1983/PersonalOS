import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Energy levels enum-like type
export type EnergyLevel = "low" | "medium" | "high";
export type EffortLevel = "quick" | "medium" | "heavy";

// ============= DATABASE TABLES =============

// Energy logs for historical tracking
export const energyLogs = pgTable("energy_logs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 10 }).notNull(), // low, medium, high
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
  note: text("note"),
});

// Daily anchors (habits) with completion tracking
export const anchors = pgTable("anchors", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("circle"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily anchor completions - track which anchors completed each day
export const anchorCompletions = pgTable("anchor_completions", {
  id: serial("id").primaryKey(),
  anchorId: integer("anchor_id").references(() => anchors.id).notNull(),
  completedDate: varchar("completed_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Project templates (reusable project blueprints)
export const projectTemplates = pgTable("project_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects (instances of templates or custom)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateId: integer("template_id").references(() => projectTemplates.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Project steps (micro-steps within a project)
export const projectSteps = pgTable("project_steps", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  effort: varchar("effort", { length: 20 }).default("medium"), // quick, medium, heavy
  completed: boolean("completed").default(false),
  sortOrder: integer("sort_order").default(0),
  completedAt: timestamp("completed_at"),
});

// Template steps (reusable step definitions for templates)
export const templateSteps = pgTable("template_steps", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => projectTemplates.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  effort: varchar("effort", { length: 20 }).default("medium"),
  sortOrder: integer("sort_order").default(0),
});

// Tags for brain dump organization
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 20 }).default("nebula-cyan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Brain dump entries with enhanced organization
export const brainDumpEntries = pgTable("brain_dump_entries", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: varchar("category", { length: 50 }), // auto-categorized: task, idea, note, reminder
  tagIds: jsonb("tag_ids").$type<number[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
});

// Daily summaries for reflection
export const dailySummaries = pgTable("daily_summaries", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  dominantEnergy: varchar("dominant_energy", { length: 10 }),
  anchorsCompleted: integer("anchors_completed").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  thoughtsCaptured: integer("thoughts_captured").default(0),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Streak tracking
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: varchar("last_active_date", { length: 10 }), // YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User preferences/settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  weeklyTarget: integer("weekly_target").default(35),
  currentEnergyLevel: varchar("current_energy_level", { length: 10 }).default("medium"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============= RELATIONS =============

export const anchorCompletionsRelations = relations(anchorCompletions, ({ one }) => ({
  anchor: one(anchors, {
    fields: [anchorCompletions.anchorId],
    references: [anchors.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  template: one(projectTemplates, {
    fields: [projects.templateId],
    references: [projectTemplates.id],
  }),
  steps: many(projectSteps),
}));

export const projectStepsRelations = relations(projectSteps, ({ one }) => ({
  project: one(projects, {
    fields: [projectSteps.projectId],
    references: [projects.id],
  }),
}));

export const templateStepsRelations = relations(templateSteps, ({ one }) => ({
  template: one(projectTemplates, {
    fields: [templateSteps.templateId],
    references: [projectTemplates.id],
  }),
}));

// ============= INSERT SCHEMAS =============

export const insertEnergyLogSchema = createInsertSchema(energyLogs).omit({ id: true, loggedAt: true });
export const insertAnchorSchema = createInsertSchema(anchors).omit({ id: true, createdAt: true });
export const insertAnchorCompletionSchema = createInsertSchema(anchorCompletions).omit({ id: true, completedAt: true });
export const insertProjectTemplateSchema = createInsertSchema(projectTemplates).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, completedAt: true });
export const insertProjectStepSchema = createInsertSchema(projectSteps).omit({ id: true, completedAt: true });
export const insertTemplateStepSchema = createInsertSchema(templateSteps).omit({ id: true });
export const insertTagSchema = createInsertSchema(tags).omit({ id: true, createdAt: true });
export const insertBrainDumpEntrySchema = createInsertSchema(brainDumpEntries).omit({ id: true, createdAt: true, archivedAt: true });
export const insertDailySummarySchema = createInsertSchema(dailySummaries).omit({ id: true, createdAt: true });

// ============= INSERT TYPES =============

export type InsertEnergyLog = z.infer<typeof insertEnergyLogSchema>;
export type InsertAnchor = z.infer<typeof insertAnchorSchema>;
export type InsertAnchorCompletion = z.infer<typeof insertAnchorCompletionSchema>;
export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectStep = z.infer<typeof insertProjectStepSchema>;
export type InsertTemplateStep = z.infer<typeof insertTemplateStepSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type InsertBrainDumpEntry = z.infer<typeof insertBrainDumpEntrySchema>;
export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;

// ============= SELECT TYPES =============

export type EnergyLog = typeof energyLogs.$inferSelect;
export type Anchor = typeof anchors.$inferSelect;
export type AnchorCompletion = typeof anchorCompletions.$inferSelect;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectStep = typeof projectSteps.$inferSelect;
export type TemplateStep = typeof templateSteps.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type BrainDumpEntry = typeof brainDumpEntries.$inferSelect;
export type DailySummary = typeof dailySummaries.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;

// ============= FRONTEND TYPES (for compatibility) =============

export interface EnergyTask {
  label: string;
  duration: string;
}

export interface MomentumData {
  completedToday: number;
  weeklyCompletion: number;
  weeklyTarget: number;
  streak: number;
}

// Legacy compatibility types
export interface EnergyState {
  id: string;
  level: EnergyLevel;
  streak: number;
  lastUpdated: string;
}

export interface SanctuaryData {
  energyState: EnergyState;
  anchors: Anchor[];
  projectSteps: ProjectStep[];
  brainDumpEntries: BrainDumpEntry[];
  momentum: MomentumData;
}

// Weekly patterns for energy tracking insights
export interface EnergyPattern {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  hour: number; // 0-23
  dominantLevel: EnergyLevel;
  count: number;
}

export interface WeeklyReflection {
  weekStart: string;
  weekEnd: string;
  totalAnchorsCompleted: number;
  totalTasksCompleted: number;
  totalThoughtsCaptured: number;
  energyPatterns: EnergyPattern[];
  topTags: { tagId: number; name: string; count: number }[];
  streakDays: number;
}
