import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const energyLevelSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
});

const brainDumpSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/energy", async (_req, res) => {
    try {
      const state = await storage.getEnergyState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to get energy state" });
    }
  });

  app.patch("/api/energy", async (req, res) => {
    try {
      const { level } = energyLevelSchema.parse(req.body);
      const state = await storage.updateEnergyState(level);
      res.json(state);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update energy state" });
      }
    }
  });

  app.get("/api/anchors", async (_req, res) => {
    try {
      const anchors = await storage.getAnchors();
      res.json(anchors);
    } catch (error) {
      res.status(500).json({ error: "Failed to get anchors" });
    }
  });

  app.patch("/api/anchors/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid anchor ID" });
      }
      const anchors = await storage.toggleAnchor(id);
      await storage.incrementMomentum();
      res.json(anchors);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle anchor" });
    }
  });

  app.get("/api/project-steps", async (_req, res) => {
    try {
      const steps = await storage.getProjectSteps();
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project steps" });
    }
  });

  app.patch("/api/project-steps/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid step ID" });
      }
      const steps = await storage.toggleProjectStep(id);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle project step" });
    }
  });

  app.get("/api/brain-dump", async (_req, res) => {
    try {
      const entries = await storage.getBrainDumpEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to get brain dump entries" });
    }
  });

  app.post("/api/brain-dump", async (req, res) => {
    try {
      const { text } = brainDumpSchema.parse(req.body);
      const entry = await storage.addBrainDumpEntry(text);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add brain dump entry" });
      }
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
      res.status(500).json({ error: "Failed to delete brain dump entry" });
    }
  });

  app.get("/api/momentum", async (_req, res) => {
    try {
      const momentum = await storage.getMomentum();
      res.json(momentum);
    } catch (error) {
      res.status(500).json({ error: "Failed to get momentum data" });
    }
  });

  app.get("/api/sanctuary", async (_req, res) => {
    try {
      const [energyState, anchors, projectSteps, brainDumpEntries, momentum] = await Promise.all([
        storage.getEnergyState(),
        storage.getAnchors(),
        storage.getProjectSteps(),
        storage.getBrainDumpEntries(),
        storage.getMomentum(),
      ]);
      
      res.json({
        energyState,
        anchors,
        projectSteps,
        brainDumpEntries,
        momentum,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get sanctuary data" });
    }
  });

  return httpServer;
}
