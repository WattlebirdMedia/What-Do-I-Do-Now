import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getStripeClient } from "./stripeClient";
import { insertTaskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Get all pending tasks
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  // Get completed tasks
  app.get("/api/tasks/completed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getCompletedTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      console.error('Get completed tasks error:', error);
      res.status(500).json({ error: 'Failed to get completed tasks' });
    }
  });

  // Create a new task
  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingTasks = await storage.getTasks(userId);
      const position = existingTasks.length;
      
      const validatedData = insertTaskSchema.parse({
        text: req.body.text,
        position: position
      });
      
      const task = await storage.createTask(validatedData, userId);
      res.json(task);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid task data', details: error.errors });
      }
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Complete a task
  app.patch("/api/tasks/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.completeTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error: any) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteTask(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Reorder tasks (for skip functionality)
  app.post("/api/tasks/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskIds } = req.body;
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ error: 'taskIds must be an array' });
      }
      await storage.reorderTasks(taskIds, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Reorder tasks error:', error);
      res.status(500).json({ error: 'Failed to reorder tasks' });
    }
  });

  // Archive completed tasks (move to bin)
  app.post("/api/tasks/archive", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.archiveCompletedTasks(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Archive completed tasks error:', error);
      res.status(500).json({ error: 'Failed to archive completed tasks' });
    }
  });

  // Get archived tasks (bin)
  app.get("/api/tasks/bin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const archivedTasks = await storage.getArchivedTasks(userId);
      res.json(archivedTasks);
    } catch (error: any) {
      console.error('Get archived tasks error:', error);
      res.status(500).json({ error: 'Failed to get archived tasks' });
    }
  });

  // Restore task from bin
  app.patch("/api/tasks/:id/restore", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.restoreTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error: any) {
      console.error('Restore task error:', error);
      res.status(500).json({ error: 'Failed to restore task' });
    }
  });

  // Permanently delete task from bin
  app.delete("/api/tasks/:id/permanent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.permanentlyDeleteTask(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Permanent delete task error:', error);
      res.status(500).json({ error: 'Failed to permanently delete task' });
    }
  });

  // Empty bin (permanently delete all archived tasks)
  app.delete("/api/tasks/bin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.emptyBin(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Empty bin error:', error);
      res.status(500).json({ error: 'Failed to empty bin' });
    }
  });

  // Tip jar checkout endpoint
  app.post("/api/tip-checkout", async (req, res) => {
    try {
      const { amount } = req.body;
      const tipAmount = amount || 500; // Default $5.00

      const stripe = await getStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support What Do I Do Now?',
              description: 'Thank you for supporting this app!',
            },
            unit_amount: tipAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}?tip=success`,
        cancel_url: `${baseUrl}?tip=cancelled`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Tip checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  return httpServer;
}
