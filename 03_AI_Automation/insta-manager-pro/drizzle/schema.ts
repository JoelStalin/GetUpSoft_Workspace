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

/**
 * Daily photo proposals from Google Drive
 */
export const dailyProposals = mysqlTable("daily_proposals", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyProposal = typeof dailyProposals.$inferSelect;
export type InsertDailyProposal = typeof dailyProposals.$inferInsert;

/**
 * Individual photos from Google Drive with AI analysis
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  dailyProposalId: int("dailyProposalId").notNull(),
  googleDriveFileId: varchar("googleDriveFileId", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  driveUrl: text("driveUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  caption: text("caption").notNull(), // Spanish caption
  hashtags: text("hashtags"), // JSON array of hashtags
  analysisData: text("analysisData"), // JSON with vision AI analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * User approvals for daily photo proposals
 */
export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(),
  userId: int("userId").notNull(),
  approved: int("approved").default(0).notNull(), // 0 = rejected, 1 = approved
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = typeof approvals.$inferInsert;

/**
 * Published posts to Instagram
 */
export const publishedPosts = mysqlTable("published_posts", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(),
  instagramPostId: varchar("instagramPostId", { length: 255 }).notNull().unique(),
  caption: text("caption").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  lastMetricsUpdate: timestamp("lastMetricsUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PublishedPost = typeof publishedPosts.$inferSelect;
export type InsertPublishedPost = typeof publishedPosts.$inferInsert;

/**
 * Publishing schedule configuration
 */
export const scheduleConfig = mysqlTable("schedule_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  proposalTime: varchar("proposalTime", { length: 5 }).default("09:00").notNull(), // HH:MM
  publishingSlots: text("publishingSlots").notNull(), // JSON array of times
  maxDailyPublish: int("maxDailyPublish").default(5).notNull(),
  maxDailyProposals: int("maxDailyProposals").default(10).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Santo_Domingo").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduleConfig = typeof scheduleConfig.$inferSelect;
export type InsertScheduleConfig = typeof scheduleConfig.$inferInsert;

/**
 * WhatsApp notification logs
 */
export const whatsappNotifications = mysqlTable("whatsapp_notifications", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(),
  messageId: varchar("messageId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "sent", "failed", "delivered"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type InsertWhatsappNotification = typeof whatsappNotifications.$inferInsert;

/**
 * Automation jobs for Python engines
 */
export const automationJobs = mysqlTable("automation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobType: mysqlEnum("jobType", ["unfollow", "follow", "dm_mass", "scrape"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  logOutput: text("logOutput"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationJob = typeof automationJobs.$inferSelect;
export type InsertAutomationJob = typeof automationJobs.$inferInsert;