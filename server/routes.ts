import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get user's flows
  app.get('/api/flows', async (req, res) => {
    try {
      // For this implementation, we'll use local storage on the client side
      // So this endpoint is just a placeholder in case we implement server-side storage later
      res.json({ success: true, message: "Flows API endpoint" });
    } catch (error) {
      console.error("Error fetching flows:", error);
      res.status(500).json({ error: "Failed to fetch flows" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
