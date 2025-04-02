import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Flow schema for block coding application
export const flows = pgTable("flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  flowData: jsonb("flow_data").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertFlowSchema = createInsertSchema(flows).pick({
  name: true,
  userId: true,
  flowData: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFlow = z.infer<typeof insertFlowSchema>;
export type Flow = typeof flows.$inferSelect;
