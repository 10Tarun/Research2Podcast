import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

export const conversions = mysqlTable("conversions", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  userId: int("userId").notNull(),
  rawText: text("rawText"),
  script: text("script"),
  selectedVoice: varchar("selectedVoice", { length: 64 }),
  audioUrl: varchar("audioUrl", { length: 512 }),
  status: mysqlEnum("status", ["uploaded", "parsing", "scripting", "synthesizing", "completed", "failed"]).default("uploaded").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

export const voices = mysqlTable("voices", {
  id: int("id").autoincrement().primaryKey(),
  voiceId: varchar("voiceId", { length: 64 }).notNull().unique(),
  voiceName: varchar("voiceName", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 32 }),
  accent: varchar("accent", { length: 64 }),
  description: text("description"),
});

export type Voice = typeof voices.$inferSelect;
export type InsertVoice = typeof voices.$inferInsert;