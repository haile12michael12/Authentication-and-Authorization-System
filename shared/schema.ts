import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define roles enum for type safety
export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Sessions table to track and manage refresh tokens
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  refreshToken: text("refresh_token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
  replacedByToken: text("replaced_by_token")
});

// Auth Logs table for security audit
export const authLogs = pgTable("auth_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // e.g., login, logout, failed_login, token_refresh
  status: text("status").notNull(), // success, failure
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"), // Additional details like error message or context
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  authLogs: many(authLogs)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const authLogsRelations = relations(authLogs, ({ one }) => ({
  user: one(users, { fields: [authLogs.userId], references: [users.id] })
}));

// Validation Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
  role: (schema) => schema.refine((val) => Object.values(UserRole).includes(val as UserRole), {
    message: "Role must be admin, moderator, or user"
  })
});

export const insertSessionSchema = createInsertSchema(sessions);
export const insertAuthLogSchema = createInsertSchema(authLogs);

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const tokenSettingsSchema = z.object({
  accessTokenExpiration: z.number().int().positive(),
  refreshTokenExpiration: z.number().int().positive(),
  rotateOnUse: z.boolean()
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AuthLog = typeof authLogs.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type TokenSettings = z.infer<typeof tokenSettingsSchema>;
