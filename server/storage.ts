import { db } from "./db";
import { eq, desc, and, gte, lte, sql, ilike, or } from "drizzle-orm";
import {
  energyLogs,
  anchors,
  anchorCompletions,
  projectTemplates,
  projects,
  projectSteps,
  templateSteps,
  tags,
  brainDumpEntries,
  dailySummaries,
  streaks,
  userSettings,
  type EnergyLog,
  type Anchor,
  type AnchorCompletion,
  type ProjectTemplate,
  type Project,
  type ProjectStep,
  type TemplateStep,
  type Tag,
  type BrainDumpEntry,
  type DailySummary,
  type Streak,
  type UserSettings,
  type InsertEnergyLog,
  type InsertAnchor,
  type InsertAnchorCompletion,
  type InsertProjectTemplate,
  type InsertProject,
  type InsertProjectStep,
  type InsertTemplateStep,
  type InsertTag,
  type InsertBrainDumpEntry,
  type InsertDailySummary,
  type EnergyLevel,
  type MomentumData,
  type EnergyPattern,
  type WeeklyReflection,
} from "@shared/schema";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const startOfWeek = new Date(now.setDate(diff));
  return startOfWeek.toISOString().split("T")[0];
}

export interface IStorage {
  // Energy logs
  logEnergy(level: EnergyLevel, note?: string): Promise<EnergyLog>;
  getEnergyLogs(startDate?: string, endDate?: string): Promise<EnergyLog[]>;
  getCurrentEnergyLevel(): Promise<EnergyLevel>;
  getEnergyPatterns(days?: number): Promise<EnergyPattern[]>;

  // Anchors
  getAnchors(): Promise<Anchor[]>;
  createAnchor(data: InsertAnchor): Promise<Anchor>;
  deleteAnchor(id: number): Promise<void>;
  toggleAnchorToday(anchorId: number): Promise<boolean>;
  getAnchorCompletionsForDate(date: string): Promise<number[]>;

  // Projects & Templates
  getProjectTemplates(): Promise<ProjectTemplate[]>;
  createProjectTemplate(data: InsertProjectTemplate): Promise<ProjectTemplate>;
  getTemplateSteps(templateId: number): Promise<TemplateStep[]>;
  createTemplateStep(data: InsertTemplateStep): Promise<TemplateStep>;
  
  getProjects(activeOnly?: boolean): Promise<Project[]>;
  createProject(data: InsertProject): Promise<Project>;
  createProjectFromTemplate(templateId: number, name: string): Promise<Project>;
  completeProject(id: number): Promise<Project>;
  
  getProjectSteps(projectId: number): Promise<ProjectStep[]>;
  createProjectStep(data: InsertProjectStep): Promise<ProjectStep>;
  toggleProjectStep(id: number): Promise<ProjectStep>;
  reorderProjectSteps(projectId: number, stepIds: number[]): Promise<void>;

  // Tags
  getTags(): Promise<Tag[]>;
  createTag(data: InsertTag): Promise<Tag>;
  deleteTag(id: number): Promise<void>;

  // Brain dump
  getBrainDumpEntries(options?: { 
    search?: string; 
    tagIds?: number[]; 
    category?: string;
    includeArchived?: boolean;
  }): Promise<BrainDumpEntry[]>;
  createBrainDumpEntry(data: InsertBrainDumpEntry): Promise<BrainDumpEntry>;
  updateBrainDumpEntry(id: number, data: Partial<InsertBrainDumpEntry>): Promise<BrainDumpEntry>;
  archiveBrainDumpEntry(id: number): Promise<void>;
  deleteBrainDumpEntry(id: number): Promise<void>;
  categorizeBrainDumpEntry(id: number, category: string): Promise<BrainDumpEntry>;

  // Daily summaries & streaks
  getDailySummary(date: string): Promise<DailySummary | null>;
  updateDailySummary(date: string, data: Partial<InsertDailySummary>): Promise<DailySummary>;
  getStreak(): Promise<Streak>;
  updateStreak(): Promise<Streak>;
  
  // Momentum data
  getMomentumData(): Promise<MomentumData>;
  
  // Weekly reflection
  getWeeklyReflection(weekStart: string): Promise<WeeklyReflection>;

  // User settings
  getSettings(): Promise<UserSettings>;
  updateSettings(data: Partial<UserSettings>): Promise<UserSettings>;

  // Data export
  exportAllData(): Promise<object>;

  // Seed defaults
  seedDefaults(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  // ============= ENERGY LOGS =============
  
  async logEnergy(level: EnergyLevel, note?: string): Promise<EnergyLog> {
    const [log] = await db.insert(energyLogs).values({ level, note }).returning();
    
    // Update user settings with current energy level
    await this.updateSettings({ currentEnergyLevel: level });
    
    return log;
  }

  async getEnergyLogs(startDate?: string, endDate?: string): Promise<EnergyLog[]> {
    let query = db.select().from(energyLogs).orderBy(desc(energyLogs.loggedAt));
    
    if (startDate && endDate) {
      return await db.select().from(energyLogs)
        .where(and(
          gte(energyLogs.loggedAt, new Date(startDate)),
          lte(energyLogs.loggedAt, new Date(endDate + "T23:59:59"))
        ))
        .orderBy(desc(energyLogs.loggedAt));
    }
    
    return await query.limit(100);
  }

  async getCurrentEnergyLevel(): Promise<EnergyLevel> {
    const settings = await this.getSettings();
    return (settings.currentEnergyLevel as EnergyLevel) || "medium";
  }

  async getEnergyPatterns(days: number = 14): Promise<EnergyPattern[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await db.select().from(energyLogs)
      .where(gte(energyLogs.loggedAt, startDate))
      .orderBy(energyLogs.loggedAt);
    
    // Group by day of week and hour
    const patterns: Map<string, { levels: EnergyLevel[], count: number }> = new Map();
    
    for (const log of logs) {
      const date = new Date(log.loggedAt);
      const key = `${date.getDay()}-${date.getHours()}`;
      
      if (!patterns.has(key)) {
        patterns.set(key, { levels: [], count: 0 });
      }
      
      const pattern = patterns.get(key)!;
      pattern.levels.push(log.level as EnergyLevel);
      pattern.count++;
    }
    
    // Calculate dominant level for each pattern
    const result: EnergyPattern[] = [];
    patterns.forEach((value, key) => {
      const [dayOfWeek, hour] = key.split("-").map(Number);
      
      // Find most common level
      const levelCounts = { low: 0, medium: 0, high: 0 };
      value.levels.forEach(l => levelCounts[l]++);
      
      const dominantLevel = (Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0]) as EnergyLevel;
      
      result.push({
        dayOfWeek,
        hour,
        dominantLevel,
        count: value.count,
      });
    });
    
    return result;
  }

  // ============= ANCHORS =============

  async getAnchors(): Promise<Anchor[]> {
    return await db.select().from(anchors).orderBy(anchors.sortOrder);
  }

  async createAnchor(data: InsertAnchor): Promise<Anchor> {
    const [anchor] = await db.insert(anchors).values(data).returning();
    return anchor;
  }

  async deleteAnchor(id: number): Promise<void> {
    await db.delete(anchorCompletions).where(eq(anchorCompletions.anchorId, id));
    await db.delete(anchors).where(eq(anchors.id, id));
  }

  async toggleAnchorToday(anchorId: number): Promise<boolean> {
    const today = getTodayDate();
    
    // Check if already completed today
    const existing = await db.select().from(anchorCompletions)
      .where(and(
        eq(anchorCompletions.anchorId, anchorId),
        eq(anchorCompletions.completedDate, today)
      ));
    
    if (existing.length > 0) {
      // Remove completion
      await db.delete(anchorCompletions)
        .where(and(
          eq(anchorCompletions.anchorId, anchorId),
          eq(anchorCompletions.completedDate, today)
        ));
      return false;
    } else {
      // Add completion
      await db.insert(anchorCompletions).values({
        anchorId,
        completedDate: today,
      });
      return true;
    }
  }

  async getAnchorCompletionsForDate(date: string): Promise<number[]> {
    const completions = await db.select().from(anchorCompletions)
      .where(eq(anchorCompletions.completedDate, date));
    return completions.map((c: AnchorCompletion) => c.anchorId);
  }

  // ============= PROJECTS & TEMPLATES =============

  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    return await db.select().from(projectTemplates).orderBy(projectTemplates.createdAt);
  }

  async createProjectTemplate(data: InsertProjectTemplate): Promise<ProjectTemplate> {
    const [template] = await db.insert(projectTemplates).values(data).returning();
    return template;
  }

  async getTemplateSteps(templateId: number): Promise<TemplateStep[]> {
    return await db.select().from(templateSteps)
      .where(eq(templateSteps.templateId, templateId))
      .orderBy(templateSteps.sortOrder);
  }

  async createTemplateStep(data: InsertTemplateStep): Promise<TemplateStep> {
    const [step] = await db.insert(templateSteps).values(data).returning();
    return step;
  }

  async getProjects(activeOnly: boolean = true): Promise<Project[]> {
    if (activeOnly) {
      return await db.select().from(projects)
        .where(eq(projects.isActive, true))
        .orderBy(desc(projects.createdAt));
    }
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async createProjectFromTemplate(templateId: number, name: string): Promise<Project> {
    const template = await db.select().from(projectTemplates)
      .where(eq(projectTemplates.id, templateId))
      .limit(1);
    
    if (!template.length) {
      throw new Error("Template not found");
    }

    const [project] = await db.insert(projects).values({
      name,
      description: template[0].description,
      templateId,
    }).returning();

    // Copy template steps to project
    const steps = await this.getTemplateSteps(templateId);
    for (const step of steps) {
      await db.insert(projectSteps).values({
        projectId: project.id,
        title: step.title,
        description: step.description,
        effort: step.effort,
        sortOrder: step.sortOrder,
      });
    }

    return project;
  }

  async completeProject(id: number): Promise<Project> {
    const [project] = await db.update(projects)
      .set({ isActive: false, completedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async getProjectSteps(projectId: number): Promise<ProjectStep[]> {
    return await db.select().from(projectSteps)
      .where(eq(projectSteps.projectId, projectId))
      .orderBy(projectSteps.sortOrder);
  }

  async createProjectStep(data: InsertProjectStep): Promise<ProjectStep> {
    const [step] = await db.insert(projectSteps).values(data).returning();
    return step;
  }

  async toggleProjectStep(id: number): Promise<ProjectStep> {
    const [current] = await db.select().from(projectSteps).where(eq(projectSteps.id, id));
    
    const [step] = await db.update(projectSteps)
      .set({ 
        completed: !current.completed,
        completedAt: !current.completed ? new Date() : null,
      })
      .where(eq(projectSteps.id, id))
      .returning();
    return step;
  }

  async reorderProjectSteps(projectId: number, stepIds: number[]): Promise<void> {
    for (let i = 0; i < stepIds.length; i++) {
      await db.update(projectSteps)
        .set({ sortOrder: i })
        .where(and(eq(projectSteps.id, stepIds[i]), eq(projectSteps.projectId, projectId)));
    }
  }

  // ============= TAGS =============

  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }

  async createTag(data: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  }

  async deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  // ============= BRAIN DUMP =============

  async getBrainDumpEntries(options?: { 
    search?: string; 
    tagIds?: number[]; 
    category?: string;
    includeArchived?: boolean;
  }): Promise<BrainDumpEntry[]> {
    let query = db.select().from(brainDumpEntries);
    
    const conditions = [];
    
    if (!options?.includeArchived) {
      conditions.push(sql`${brainDumpEntries.archivedAt} IS NULL`);
    }
    
    if (options?.search) {
      conditions.push(ilike(brainDumpEntries.text, `%${options.search}%`));
    }
    
    if (options?.category) {
      conditions.push(eq(brainDumpEntries.category, options.category));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(brainDumpEntries)
        .where(and(...conditions))
        .orderBy(desc(brainDumpEntries.createdAt));
    }
    
    return await db.select().from(brainDumpEntries)
      .orderBy(desc(brainDumpEntries.createdAt));
  }

  async createBrainDumpEntry(data: InsertBrainDumpEntry): Promise<BrainDumpEntry> {
    // Auto-categorize based on content
    const category = this.autoCategorize(data.text || "");
    
    const [entry] = await db.insert(brainDumpEntries)
      .values({ ...data, category })
      .returning();
    return entry;
  }

  async updateBrainDumpEntry(id: number, data: Partial<InsertBrainDumpEntry>): Promise<BrainDumpEntry> {
    const [entry] = await db.update(brainDumpEntries)
      .set(data)
      .where(eq(brainDumpEntries.id, id))
      .returning();
    return entry;
  }

  async archiveBrainDumpEntry(id: number): Promise<void> {
    await db.update(brainDumpEntries)
      .set({ archivedAt: new Date() })
      .where(eq(brainDumpEntries.id, id));
  }

  async deleteBrainDumpEntry(id: number): Promise<void> {
    await db.delete(brainDumpEntries).where(eq(brainDumpEntries.id, id));
  }

  async categorizeBrainDumpEntry(id: number, category: string): Promise<BrainDumpEntry> {
    const [entry] = await db.update(brainDumpEntries)
      .set({ category })
      .where(eq(brainDumpEntries.id, id))
      .returning();
    return entry;
  }

  private autoCategorize(text: string): string {
    const lower = text.toLowerCase();
    
    // Task indicators
    if (/^(need to|should|must|have to|todo|do|fix|call|email|buy|order|schedule|book)/i.test(lower)) {
      return "task";
    }
    
    // Reminder indicators
    if (/^(remember|don't forget|remind|note to self)/i.test(lower) || /tomorrow|next week|later/i.test(lower)) {
      return "reminder";
    }
    
    // Idea indicators
    if (/^(what if|maybe|idea|could|might|thought about)/i.test(lower) || /\?$/.test(text.trim())) {
      return "idea";
    }
    
    // Default to note
    return "note";
  }

  // ============= DAILY SUMMARIES & STREAKS =============

  async getDailySummary(date: string): Promise<DailySummary | null> {
    const [summary] = await db.select().from(dailySummaries)
      .where(eq(dailySummaries.date, date));
    return summary || null;
  }

  async updateDailySummary(date: string, data: Partial<InsertDailySummary>): Promise<DailySummary> {
    const existing = await this.getDailySummary(date);
    
    if (existing) {
      const [summary] = await db.update(dailySummaries)
        .set(data)
        .where(eq(dailySummaries.date, date))
        .returning();
      return summary;
    } else {
      const [summary] = await db.insert(dailySummaries)
        .values({ date, ...data })
        .returning();
      return summary;
    }
  }

  async getStreak(): Promise<Streak> {
    const [streak] = await db.select().from(streaks).limit(1);
    
    if (!streak) {
      const [newStreak] = await db.insert(streaks).values({
        currentStreak: 0,
        longestStreak: 0,
      }).returning();
      return newStreak;
    }
    
    return streak;
  }

  async updateStreak(): Promise<Streak> {
    const today = getTodayDate();
    const streak = await this.getStreak();
    
    // Check if already updated today
    if (streak.lastActiveDate === today) {
      return streak;
    }
    
    // Check if continuing streak (yesterday was active)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    let newStreak = 1;
    if (streak.lastActiveDate === yesterdayStr) {
      newStreak = (streak.currentStreak || 0) + 1;
    }
    
    const longestStreak = Math.max(streak.longestStreak || 0, newStreak);
    
    const [updated] = await db.update(streaks)
      .set({
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(streaks.id, streak.id))
      .returning();
    
    return updated;
  }

  // ============= MOMENTUM DATA =============

  async getMomentumData(): Promise<MomentumData> {
    const today = getTodayDate();
    const weekStart = getStartOfWeek();
    const streak = await this.getStreak();
    const settings = await this.getSettings();
    
    // Count today's completions
    const todayAnchors = await db.select().from(anchorCompletions)
      .where(eq(anchorCompletions.completedDate, today));
    
    const todaySteps = await db.select().from(projectSteps)
      .where(and(
        eq(projectSteps.completed, true),
        gte(projectSteps.completedAt, new Date(today))
      ));
    
    const completedToday = todayAnchors.length + todaySteps.length;
    
    // Count week's completions
    const weekAnchors = await db.select().from(anchorCompletions)
      .where(gte(anchorCompletions.completedDate, weekStart));
    
    const weekSteps = await db.select().from(projectSteps)
      .where(and(
        eq(projectSteps.completed, true),
        gte(projectSteps.completedAt, new Date(weekStart))
      ));
    
    const weeklyCompletion = weekAnchors.length + weekSteps.length;
    
    return {
      completedToday,
      weeklyCompletion,
      weeklyTarget: settings.weeklyTarget || 35,
      streak: streak.currentStreak || 0,
    };
  }

  // ============= WEEKLY REFLECTION =============

  async getWeeklyReflection(weekStart: string): Promise<WeeklyReflection> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];
    
    // Get anchors completed this week
    const weekAnchors = await db.select().from(anchorCompletions)
      .where(and(
        gte(anchorCompletions.completedDate, weekStart),
        lte(anchorCompletions.completedDate, weekEndStr)
      ));
    
    // Get tasks completed this week
    const weekSteps = await db.select().from(projectSteps)
      .where(and(
        eq(projectSteps.completed, true),
        gte(projectSteps.completedAt, new Date(weekStart)),
        lte(projectSteps.completedAt, new Date(weekEndStr + "T23:59:59"))
      ));
    
    // Get thoughts this week
    const weekThoughts = await db.select().from(brainDumpEntries)
      .where(and(
        gte(brainDumpEntries.createdAt, new Date(weekStart)),
        lte(brainDumpEntries.createdAt, new Date(weekEndStr + "T23:59:59"))
      ));
    
    // Get energy patterns for the week
    const energyPatterns = await this.getEnergyPatterns(7);
    
    // Get streak
    const streak = await this.getStreak();
    
    // Get top tags (simplified - would need more complex query for real implementation)
    const allTags = await this.getTags();
    const topTags = allTags.slice(0, 5).map(t => ({
      tagId: t.id,
      name: t.name,
      count: 0, // Would need to count tag usage
    }));
    
    return {
      weekStart,
      weekEnd: weekEndStr,
      totalAnchorsCompleted: weekAnchors.length,
      totalTasksCompleted: weekSteps.length,
      totalThoughtsCaptured: weekThoughts.length,
      energyPatterns,
      topTags,
      streakDays: streak.currentStreak || 0,
    };
  }

  // ============= USER SETTINGS =============

  async getSettings(): Promise<UserSettings> {
    const [settings] = await db.select().from(userSettings).limit(1);
    
    if (!settings) {
      const [newSettings] = await db.insert(userSettings).values({
        weeklyTarget: 35,
        currentEnergyLevel: "medium",
      }).returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const settings = await this.getSettings();
    
    const [updated] = await db.update(userSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSettings.id, settings.id))
      .returning();
    
    return updated;
  }

  // ============= DATA EXPORT =============

  async exportAllData(): Promise<object> {
    const [
      allEnergyLogs,
      allAnchors,
      allAnchorCompletions,
      allProjectTemplates,
      allProjects,
      allProjectSteps,
      allTemplateSteps,
      allTags,
      allBrainDump,
      allDailySummaries,
      streakData,
      settingsData,
    ] = await Promise.all([
      db.select().from(energyLogs),
      db.select().from(anchors),
      db.select().from(anchorCompletions),
      db.select().from(projectTemplates),
      db.select().from(projects),
      db.select().from(projectSteps),
      db.select().from(templateSteps),
      db.select().from(tags),
      db.select().from(brainDumpEntries),
      db.select().from(dailySummaries),
      this.getStreak(),
      this.getSettings(),
    ]);
    
    return {
      exportedAt: new Date().toISOString(),
      energyLogs: allEnergyLogs,
      anchors: allAnchors,
      anchorCompletions: allAnchorCompletions,
      projectTemplates: allProjectTemplates,
      projects: allProjects,
      projectSteps: allProjectSteps,
      templateSteps: allTemplateSteps,
      tags: allTags,
      brainDumpEntries: allBrainDump,
      dailySummaries: allDailySummaries,
      streak: streakData,
      settings: settingsData,
    };
  }

  // ============= SEED DEFAULTS =============

  async seedDefaults(): Promise<void> {
    // Check if already seeded
    const existingAnchors = await db.select().from(anchors).limit(1);
    if (existingAnchors.length > 0) {
      return; // Already seeded
    }

    // Default anchors
    await db.insert(anchors).values([
      { label: "Hydrate (32oz)", icon: "droplets", sortOrder: 0 },
      { label: "No Phone in Bed", icon: "smartphone", sortOrder: 1 },
      { label: "Read Physics (10m)", icon: "book", sortOrder: 2 },
    ]);

    // Default project template: Sunroom
    const [sunroomTemplate] = await db.insert(projectTemplates).values({
      name: "Sunroom Renovation",
      description: "Transform the sunroom into a cozy reading space",
      isDefault: true,
    }).returning();

    // Template steps
    await db.insert(templateSteps).values([
      { templateId: sunroomTemplate.id, title: "Clear & Assess", description: "Remove existing items, measure space", effort: "quick", sortOrder: 0 },
      { templateId: sunroomTemplate.id, title: "Prime Walls", description: "Prep and prime for paint", effort: "medium", sortOrder: 1 },
      { templateId: sunroomTemplate.id, title: "Paint Sunroom", description: "Two coats of Coastal Blue", effort: "heavy", sortOrder: 2 },
      { templateId: sunroomTemplate.id, title: "Install Shelving", description: "Mount 3 floating shelves", effort: "medium", sortOrder: 3 },
      { templateId: sunroomTemplate.id, title: "Style & Decorate", description: "Add plants, books, lighting", effort: "quick", sortOrder: 4 },
    ]);

    // Create default project from template
    const [sunroomProject] = await db.insert(projects).values({
      name: "Sunroom Project",
      description: "Transform the sunroom into a cozy reading space",
      templateId: sunroomTemplate.id,
    }).returning();

    // Create project steps (copying from template)
    await db.insert(projectSteps).values([
      { projectId: sunroomProject.id, title: "Clear & Assess", description: "Remove existing items, measure space", effort: "quick", sortOrder: 0, completed: true, completedAt: new Date() },
      { projectId: sunroomProject.id, title: "Prime Walls", description: "Prep and prime for paint", effort: "medium", sortOrder: 1, completed: true, completedAt: new Date() },
      { projectId: sunroomProject.id, title: "Paint Sunroom", description: "Two coats of Coastal Blue", effort: "heavy", sortOrder: 2 },
      { projectId: sunroomProject.id, title: "Install Shelving", description: "Mount 3 floating shelves", effort: "medium", sortOrder: 3 },
      { projectId: sunroomProject.id, title: "Style & Decorate", description: "Add plants, books, lighting", effort: "quick", sortOrder: 4 },
    ]);

    // Default tags
    await db.insert(tags).values([
      { name: "urgent", color: "red" },
      { name: "sunroom", color: "purple" },
      { name: "self-care", color: "cyan" },
      { name: "family", color: "blue" },
      { name: "work", color: "yellow" },
    ]);

    // Initialize streak
    await db.insert(streaks).values({
      currentStreak: 7,
      longestStreak: 7,
      lastActiveDate: getTodayDate(),
    });

    // Initialize settings
    await db.insert(userSettings).values({
      weeklyTarget: 35,
      currentEnergyLevel: "medium",
    });

    // Sample brain dump entries
    await db.insert(brainDumpEntries).values([
      { text: "Order new sheets for sunroom", category: "task", tagIds: [2] },
      { text: "Check paint humidity levels tomorrow", category: "reminder", tagIds: [2] },
      { text: "Call contractor about shelving install", category: "task", tagIds: [2] },
    ]);
  }
}

export const storage = new DatabaseStorage();
