import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, isNull, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  createUser(user: Omit<schema.InsertUser, "id">): Promise<schema.User>;
  updateUser(id: number, user: Partial<schema.InsertUser>): Promise<schema.User | undefined>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Session operations
  createSession(session: Omit<schema.Session, "id" | "createdAt">): Promise<schema.Session>;
  getSessionByToken(token: string): Promise<schema.Session | undefined>;
  revokeSession(token: string, replacedByToken?: string): Promise<void>;
  revokeAllUserSessions(userId: number): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Auth log operations
  createAuthLog(log: Omit<schema.AuthLog, "id" | "createdAt">): Promise<schema.AuthLog>;
  getRecentAuthLogs(limit?: number): Promise<schema.AuthLog[]>;
  getUserAuthLogs(userId: number, limit?: number): Promise<schema.AuthLog[]>;
  
  // Session store
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    return db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  }
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  }
  
  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    return db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  }
  
  async createUser(user: Omit<schema.InsertUser, "id">): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<schema.InsertUser>): Promise<schema.User | undefined> {
    const [updatedUser] = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, id));
  }
  
  // Session operations
  async createSession(sessionData: Omit<schema.Session, "id" | "createdAt">): Promise<schema.Session> {
    const [session] = await db.insert(schema.sessions).values(sessionData).returning();
    return session;
  }
  
  async getSessionByToken(token: string): Promise<schema.Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(schema.sessions.refreshToken, token),
        isNull(schema.sessions.revokedAt),
        gt(schema.sessions.expiresAt, new Date())
      )
    });
  }
  
  async revokeSession(token: string, replacedByToken?: string): Promise<void> {
    await db.update(schema.sessions)
      .set({
        revokedAt: new Date(),
        replacedByToken: replacedByToken
      })
      .where(eq(schema.sessions.refreshToken, token));
  }
  
  async revokeAllUserSessions(userId: number): Promise<void> {
    await db.update(schema.sessions)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(schema.sessions.userId, userId),
        isNull(schema.sessions.revokedAt)
      ));
  }
  
  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    await db.delete(schema.sessions)
      .where(and(
        isNull(schema.sessions.revokedAt),
        gt(now, schema.sessions.expiresAt)
      ));
  }
  
  // Auth log operations
  async createAuthLog(logData: Omit<schema.AuthLog, "id" | "createdAt">): Promise<schema.AuthLog> {
    const [log] = await db.insert(schema.authLogs).values(logData).returning();
    return log;
  }
  
  async getRecentAuthLogs(limit: number = 10): Promise<schema.AuthLog[]> {
    return db.query.authLogs.findMany({
      orderBy: desc(schema.authLogs.createdAt),
      limit
    });
  }
  
  async getUserAuthLogs(userId: number, limit: number = 10): Promise<schema.AuthLog[]> {
    return db.query.authLogs.findMany({
      where: eq(schema.authLogs.userId, userId),
      orderBy: desc(schema.authLogs.createdAt),
      limit
    });
  }
}

// Singleton instance of storage
export const storage = new DatabaseStorage();
