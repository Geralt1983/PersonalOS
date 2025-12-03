import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const energyLevelSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
  note: z.string().optional(),
});

const brainDumpSchema = z.object({
  text: z.string().min(1, "Text is required"),
  tagIds: z.array(z.number()).optional(),
  category: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  templateId: z.number().optional(),
});

const projectStepSchema = z.object({
  projectId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  effort: z.enum(["quick", "medium", "heavy"]).optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const templateStepSchema = z.object({
  templateId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  effort: z.enum(["quick", "medium", "heavy"]).optional(),
  sortOrder: z.number().optional(),
});

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

const anchorSchema = z.object({
  label: z.string().min(1, "Label is required"),
  icon: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed defaults on startup
  await storage.seedDefaults();

  // ============= ENERGY =============

  app.get("/api/energy", async (_req, res) => {
    try {
      const level = await storage.getCurrentEnergyLevel();
      res.json({ level });
    } catch (error) {
      console.error("Failed to get energy:", error);
      res.status(500).json({ error: "Failed to get energy state" });
    }
  });

  app.post("/api/energy/log", async (req, res) => {
    try {
      const { level, note } = energyLevelSchema.parse(req.body);
      const log = await storage.logEnergy(level, note);
      await storage.updateStreak();
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to log energy:", error);
        res.status(500).json({ error: "Failed to log energy" });
      }
    }
  });

  app.get("/api/energy/logs", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const logs = await storage.getEnergyLogs(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Failed to get energy logs:", error);
      res.status(500).json({ error: "Failed to get energy logs" });
    }
  });

  app.get("/api/energy/patterns", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 14;
      const patterns = await storage.getEnergyPatterns(days);
      res.json(patterns);
    } catch (error) {
      console.error("Failed to get energy patterns:", error);
      res.status(500).json({ error: "Failed to get energy patterns" });
    }
  });

  // ============= ANCHORS =============

  app.get("/api/anchors", async (_req, res) => {
    try {
      const allAnchors = await storage.getAnchors();
      const today = new Date().toISOString().split("T")[0];
      const completedToday = await storage.getAnchorCompletionsForDate(today);
      
      // Add 'active' property based on today's completions
      const anchorsWithStatus = allAnchors.map(a => ({
        ...a,
        active: completedToday.includes(a.id),
      }));
      
      res.json(anchorsWithStatus);
    } catch (error) {
      console.error("Failed to get anchors:", error);
      res.status(500).json({ error: "Failed to get anchors" });
    }
  });

  app.post("/api/anchors", async (req, res) => {
    try {
      const data = anchorSchema.parse(req.body);
      const anchor = await storage.createAnchor(data);
      res.status(201).json(anchor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create anchor:", error);
        res.status(500).json({ error: "Failed to create anchor" });
      }
    }
  });

  app.patch("/api/anchors/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid anchor ID" });
      }
      const isActive = await storage.toggleAnchorToday(id);
      await storage.updateStreak();
      res.json({ id, active: isActive });
    } catch (error) {
      console.error("Failed to toggle anchor:", error);
      res.status(500).json({ error: "Failed to toggle anchor" });
    }
  });

  app.delete("/api/anchors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid anchor ID" });
      }
      await storage.deleteAnchor(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete anchor:", error);
      res.status(500).json({ error: "Failed to delete anchor" });
    }
  });

  // ============= PROJECTS =============

  app.get("/api/projects", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== "false";
      const allProjects = await storage.getProjects(activeOnly);
      res.json(allProjects);
    } catch (error) {
      console.error("Failed to get projects:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = projectSchema.parse(req.body);
      let project;
      
      if (data.templateId) {
        project = await storage.createProjectFromTemplate(data.templateId, data.name);
      } else {
        project = await storage.createProject(data);
      }
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create project:", error);
        res.status(500).json({ error: "Failed to create project" });
      }
    }
  });

  app.patch("/api/projects/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const project = await storage.completeProject(id);
      res.json(project);
    } catch (error) {
      console.error("Failed to complete project:", error);
      res.status(500).json({ error: "Failed to complete project" });
    }
  });

  app.get("/api/projects/:id/steps", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const steps = await storage.getProjectSteps(id);
      res.json(steps);
    } catch (error) {
      console.error("Failed to get project steps:", error);
      res.status(500).json({ error: "Failed to get project steps" });
    }
  });

  app.post("/api/project-steps", async (req, res) => {
    try {
      const data = projectStepSchema.parse(req.body);
      const step = await storage.createProjectStep(data);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create project step:", error);
        res.status(500).json({ error: "Failed to create project step" });
      }
    }
  });

  app.patch("/api/project-steps/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid step ID" });
      }
      const step = await storage.toggleProjectStep(id);
      await storage.updateStreak();
      res.json(step);
    } catch (error) {
      console.error("Failed to toggle project step:", error);
      res.status(500).json({ error: "Failed to toggle project step" });
    }
  });

  // ============= TEMPLATES =============

  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getProjectTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Failed to get templates:", error);
      res.status(500).json({ error: "Failed to get templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const data = templateSchema.parse(req.body);
      const template = await storage.createProjectTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create template:", error);
        res.status(500).json({ error: "Failed to create template" });
      }
    }
  });

  app.get("/api/templates/:id/steps", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid template ID" });
      }
      const steps = await storage.getTemplateSteps(id);
      res.json(steps);
    } catch (error) {
      console.error("Failed to get template steps:", error);
      res.status(500).json({ error: "Failed to get template steps" });
    }
  });

  app.post("/api/template-steps", async (req, res) => {
    try {
      const data = templateStepSchema.parse(req.body);
      const step = await storage.createTemplateStep(data);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create template step:", error);
        res.status(500).json({ error: "Failed to create template step" });
      }
    }
  });

  // ============= TAGS =============

  app.get("/api/tags", async (_req, res) => {
    try {
      const allTags = await storage.getTags();
      res.json(allTags);
    } catch (error) {
      console.error("Failed to get tags:", error);
      res.status(500).json({ error: "Failed to get tags" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const data = tagSchema.parse(req.body);
      const tag = await storage.createTag(data);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create tag:", error);
        res.status(500).json({ error: "Failed to create tag" });
      }
    }
  });

  app.delete("/api/tags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tag ID" });
      }
      await storage.deleteTag(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  // ============= BRAIN DUMP =============

  app.get("/api/brain-dump", async (req, res) => {
    try {
      const { search, category, includeArchived } = req.query;
      const tagIds = req.query.tagIds ? 
        (req.query.tagIds as string).split(",").map(Number) : 
        undefined;
      
      const entries = await storage.getBrainDumpEntries({
        search: search as string | undefined,
        tagIds,
        category: category as string | undefined,
        includeArchived: includeArchived === "true",
      });
      res.json(entries);
    } catch (error) {
      console.error("Failed to get brain dump entries:", error);
      res.status(500).json({ error: "Failed to get brain dump entries" });
    }
  });

  app.post("/api/brain-dump", async (req, res) => {
    try {
      const data = brainDumpSchema.parse(req.body);
      const entry = await storage.createBrainDumpEntry(data);
      await storage.updateStreak();
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to add brain dump entry:", error);
        res.status(500).json({ error: "Failed to add brain dump entry" });
      }
    }
  });

  app.patch("/api/brain-dump/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const entry = await storage.updateBrainDumpEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Failed to update brain dump entry:", error);
      res.status(500).json({ error: "Failed to update brain dump entry" });
    }
  });

  app.patch("/api/brain-dump/:id/archive", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      await storage.archiveBrainDumpEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to archive brain dump entry:", error);
      res.status(500).json({ error: "Failed to archive brain dump entry" });
    }
  });

  app.delete("/api/brain-dump/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      await storage.deleteBrainDumpEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete brain dump entry:", error);
      res.status(500).json({ error: "Failed to delete brain dump entry" });
    }
  });

  // ============= MOMENTUM & STREAKS =============

  app.get("/api/momentum", async (_req, res) => {
    try {
      const momentum = await storage.getMomentumData();
      res.json(momentum);
    } catch (error) {
      console.error("Failed to get momentum:", error);
      res.status(500).json({ error: "Failed to get momentum data" });
    }
  });

  app.get("/api/streak", async (_req, res) => {
    try {
      const streak = await storage.getStreak();
      res.json(streak);
    } catch (error) {
      console.error("Failed to get streak:", error);
      res.status(500).json({ error: "Failed to get streak" });
    }
  });

  // ============= WEEKLY REFLECTION =============

  app.get("/api/reflection", async (req, res) => {
    try {
      const weekStart = req.query.weekStart as string || getStartOfWeek();
      const reflection = await storage.getWeeklyReflection(weekStart);
      res.json(reflection);
    } catch (error) {
      console.error("Failed to get weekly reflection:", error);
      res.status(500).json({ error: "Failed to get weekly reflection" });
    }
  });

  // ============= SETTINGS =============

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to get settings:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ============= DATA EXPORT =============

  app.get("/api/export", async (_req, res) => {
    try {
      const data = await storage.exportAllData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=sanctuary-os-export-${new Date().toISOString().split("T")[0]}.json`);
      res.json(data);
    } catch (error) {
      console.error("Failed to export data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // ============= SANCTUARY (combined endpoint for dashboard) =============

  app.get("/api/sanctuary", async (_req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const [
        energyLevel,
        allAnchors,
        completedAnchors,
        allProjects,
        momentum,
      ] = await Promise.all([
        storage.getCurrentEnergyLevel(),
        storage.getAnchors(),
        storage.getAnchorCompletionsForDate(today),
        storage.getProjects(true),
        storage.getMomentumData(),
      ]);
      
      // Get steps for active project
      const activeProject = allProjects[0];
      let projectStepsData: any[] = [];
      if (activeProject) {
        projectStepsData = await storage.getProjectSteps(activeProject.id);
      }
      
      // Get brain dump entries
      const brainDumpData = await storage.getBrainDumpEntries({ includeArchived: false });
      
      const anchorsWithStatus = allAnchors.map(a => ({
        ...a,
        active: completedAnchors.includes(a.id),
      }));
      
      res.json({
        energyState: {
          id: "current",
          level: energyLevel,
          streak: momentum.streak,
          lastUpdated: new Date().toISOString(),
        },
        anchors: anchorsWithStatus,
        project: activeProject,
        projectSteps: projectStepsData,
        brainDumpEntries: brainDumpData.map(e => ({
          id: e.id,
          text: e.text,
          timestamp: new Date(e.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          category: e.category,
          tagIds: e.tagIds,
        })),
        momentum,
      });
    } catch (error) {
      console.error("Failed to get sanctuary data:", error);
      res.status(500).json({ error: "Failed to get sanctuary data" });
    }
  });

  return httpServer;
}

function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const startOfWeek = new Date(now.setDate(diff));
  return startOfWeek.toISOString().split("T")[0];
}
