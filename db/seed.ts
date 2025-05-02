import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // 1. Create initial admin user if it doesn't exist
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.username, "admin")
    });

    if (!existingAdmin) {
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("Admin@123"); // Strong default password
      
      const [admin] = await db.insert(schema.users).values({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        createdAt: new Date()
      }).returning();
      
      console.log(`Admin user created with ID: ${admin.id}`);
    } else {
      console.log("Admin user already exists, skipping creation");
    }

    // 2. Create moderator user if it doesn't exist
    const existingModerator = await db.query.users.findFirst({
      where: eq(schema.users.username, "moderator")
    });

    if (!existingModerator) {
      console.log("Creating moderator user...");
      const hashedPassword = await hashPassword("Moderator@123");
      
      const [moderator] = await db.insert(schema.users).values({
        username: "moderator",
        email: "moderator@example.com",
        password: hashedPassword,
        role: "moderator",
        status: "active",
        createdAt: new Date()
      }).returning();
      
      console.log(`Moderator user created with ID: ${moderator.id}`);
    } else {
      console.log("Moderator user already exists, skipping creation");
    }

    // 3. Create regular user if it doesn't exist
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, "user")
    });

    if (!existingUser) {
      console.log("Creating regular user...");
      const hashedPassword = await hashPassword("User@123");
      
      const [user] = await db.insert(schema.users).values({
        username: "user",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        createdAt: new Date()
      }).returning();
      
      console.log(`Regular user created with ID: ${user.id}`);
    } else {
      console.log("Regular user already exists, skipping creation");
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
