import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { authenticate, authorize } from "./middleware";
import * as schema from "@shared/schema";
import { eq, desc, like } from "drizzle-orm";
import { db } from "@db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // User management routes (protected with role-based access)
  
  // Get all users (admin and moderator only)
  app.get("/api/users", authenticate, authorize([schema.UserRole.ADMIN, schema.UserRole.MODERATOR]), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      
      let query = db.select().from(schema.users);
      
      if (search) {
        query = query.where(
          like(schema.users.username, `%${search}%`)
        );
      }
      
      const users = await query
        .limit(limit)
        .offset(offset)
        .orderBy(desc(schema.users.createdAt));
      
      // Count total users for pagination
      const countResult = await db.select({ count: db.fn.count() }).from(schema.users);
      const totalCount = parseInt(countResult[0].count as string);
      
      return res.json({
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        })),
        meta: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Get user by ID (admin and moderator, or the user themselves)
  app.get("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Allow access if user is requesting their own data or is an admin/moderator
      if (req.user.userId !== userId && 
          ![schema.UserRole.ADMIN, schema.UserRole.MODERATOR].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Update user (admin only for role changes, users can update their own details)
  app.patch("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permissions
      const isAdmin = req.user.role === schema.UserRole.ADMIN;
      const isOwnAccount = req.user.userId === userId;
      
      if (!isAdmin && !isOwnAccount) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Non-admins can't change roles or status
      if (!isAdmin && (req.body.role || req.body.status)) {
        return res.status(403).json({ message: "Cannot update role or status" });
      }
      
      // Hash password if provided
      const updateData: any = { ...req.body };
      if (updateData.password) {
        const scrypt = await import('crypto');
        const util = await import('util');
        const scryptAsync = util.promisify(scrypt.scrypt);
        
        const salt = scrypt.randomBytes(16).toString('hex');
        const buf = (await scryptAsync(updateData.password, salt, 64)) as Buffer;
        updateData.password = `${buf.toString('hex')}.${salt}`;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      return res.json({
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        role: updatedUser!.role,
        status: updatedUser!.status
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Error updating user" });
    }
  });
  
  // Get authentication logs (admin only)
  app.get("/api/auth-logs", authenticate, authorize([schema.UserRole.ADMIN]), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let logs;
      if (userId) {
        logs = await storage.getUserAuthLogs(userId, limit);
      } else {
        logs = await storage.getRecentAuthLogs(limit);
      }
      
      return res.json(logs);
    } catch (error) {
      console.error("Error fetching auth logs:", error);
      return res.status(500).json({ message: "Error fetching auth logs" });
    }
  });
  
  // Get dashboard stats (admin only)
  app.get("/api/dashboard/stats", authenticate, authorize([schema.UserRole.ADMIN]), async (req, res) => {
    try {
      // Count total users
      const userCountResult = await db.select({ count: db.fn.count() }).from(schema.users);
      const userCount = parseInt(userCountResult[0].count as string);
      
      // Count active sessions
      const sessionCountResult = await db.select({ count: db.fn.count() })
        .from(schema.sessions)
        .where(eq(schema.sessions.revokedAt, null));
      const sessionCount = parseInt(sessionCountResult[0].count as string);
      
      // Count successful logins in last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const successfulLoginCountResult = await db.select({ count: db.fn.count() })
        .from(schema.authLogs)
        .where(eq(schema.authLogs.action, 'login'))
        .where(eq(schema.authLogs.status, 'success'));
      const successfulLoginCount = parseInt(successfulLoginCountResult[0].count as string);
      
      // Count failed login attempts
      const failedLoginCountResult = await db.select({ count: db.fn.count() })
        .from(schema.authLogs)
        .where(eq(schema.authLogs.action, 'login'))
        .where(eq(schema.authLogs.status, 'failure'));
      const failedLoginCount = parseInt(failedLoginCountResult[0].count as string);
      
      return res.json({
        userCount,
        sessionCount,
        successfulLoginCount,
        failedLoginCount
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
