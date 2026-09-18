import { eq, and } from "drizzle-orm";
import {
  dailyProposals,
  photos,
  approvals,
  publishedPosts,
  scheduleConfig,
  whatsappNotifications,
  type InsertPhoto,
  type InsertDailyProposal,
  type InsertApproval,
  type InsertPublishedPost,
  type InsertScheduleConfig,
  type InsertWhatsappNotification,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new daily proposal
 */
export async function createDailyProposal(date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(dailyProposals).values({
    date,
    status: "pending",
  });

  return result;
}

/**
 * Get or create today's proposal
 */
export async function getOrCreateTodayProposal() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split("T")[0];
  const existing = await db
    .select()
    .from(dailyProposals)
    .where(eq(dailyProposals.date, today))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(dailyProposals).values({
    date: today,
    status: "pending",
  });

  // Fetch the newly created record
  const created = await db
    .select()
    .from(dailyProposals)
    .where(eq(dailyProposals.date, today))
    .limit(1);

  return created[0];
}

/**
 * Add photos to a daily proposal
 */
export async function addPhotosToProposal(
  dailyProposalId: number,
  photoList: Array<Omit<InsertPhoto, "dailyProposalId">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Handle empty photo list
  if (!photoList || photoList.length === 0) {
    return [];
  }

  const photosWithProposal = photoList.map((photo) => ({
    ...photo,
    dailyProposalId,
  }));

  await db.insert(photos).values(photosWithProposal);
  
  // Fetch and return the inserted photos
  return db
    .select()
    .from(photos)
    .where(eq(photos.dailyProposalId, dailyProposalId));
}

/**
 * Get photos for a daily proposal
 */
export async function getProposalPhotos(dailyProposalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(photos)
    .where(eq(photos.dailyProposalId, dailyProposalId));
}

/**
 * Approve a photo
 */
export async function approvePhoto(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(approvals).values({
    photoId,
    userId,
    approved: 1,
    approvedAt: new Date(),
  });

  return result;
}

/**
 * Reject a photo - delete it from the daily proposal
 */
export async function rejectPhoto(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete the photo from the photos table
  const result = await db.delete(photos).where(eq(photos.id, photoId));

  return result;
}

/**
 * Get approved photos for a daily proposal
 */
export async function getApprovedPhotosForProposal(
  dailyProposalId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(photos)
    .innerJoin(approvals, eq(photos.id, approvals.photoId))
    .where(
      and(
        eq(photos.dailyProposalId, dailyProposalId),
        eq(approvals.userId, userId),
        eq(approvals.approved, 1)
      )
    );
}

/**
 * Record a published post
 */
export async function recordPublishedPost(data: InsertPublishedPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(publishedPosts).values(data);
  return result;
}

/**
 * Get publishing history
 */
export async function getPublishingHistory(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(publishedPosts).orderBy(publishedPosts.publishedAt).limit(limit);
}

/**
 * Update post metrics
 */
export async function updatePostMetrics(
  instagramPostId: string,
  likes: number,
  comments: number,
  shares: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(publishedPosts)
    .set({
      likes,
      comments,
      shares,
      lastMetricsUpdate: new Date(),
    })
    .where(eq(publishedPosts.instagramPostId, instagramPostId));

  return result;
}

/**
 * Get or create schedule config for user
 */
export async function getOrCreateScheduleConfig(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(scheduleConfig)
    .where(eq(scheduleConfig.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default config
  const defaultSlots = ["10:00", "12:00", "15:00", "18:00", "21:00"];
  await db.insert(scheduleConfig).values({
    userId,
    proposalTime: "09:00",
    publishingSlots: JSON.stringify(defaultSlots),
    maxDailyPublish: 5,
    maxDailyProposals: 10,
    timezone: "America/Santo_Domingo",
  });

  // Fetch the newly created record
  const created = await db
    .select()
    .from(scheduleConfig)
    .where(eq(scheduleConfig.userId, userId))
    .limit(1);

  return created[0];
}

/**
 * Update schedule config
 */
export async function updateScheduleConfig(
  userId: number,
  updates: Partial<Omit<InsertScheduleConfig, "userId">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(scheduleConfig)
    .set(updates)
    .where(eq(scheduleConfig.userId, userId));

  // Fetch and return the updated record
  const updated = await db
    .select()
    .from(scheduleConfig)
    .where(eq(scheduleConfig.userId, userId))
    .limit(1);

  return updated[0];
}

/**
 * Record WhatsApp notification
 */
export async function recordWhatsAppNotification(data: InsertWhatsappNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(whatsappNotifications).values(data);
  return result;
}

/**
 * Update WhatsApp notification status
 */
export async function updateWhatsAppNotificationStatus(
  id: number,
  status: "pending" | "sent" | "failed" | "delivered",
  messageId?: string,
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(whatsappNotifications)
    .set({
      status,
      messageId,
      errorMessage,
      sentAt: status === "sent" || status === "delivered" ? new Date() : undefined,
    })
    .where(eq(whatsappNotifications.id, id));

  return result;
}
