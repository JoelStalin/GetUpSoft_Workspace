import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getOrCreateTodayProposal,
  getProposalPhotos,
  approvePhoto,
  rejectPhoto,
  getApprovedPhotosForProposal,
  recordPublishedPost,
  getPublishingHistory,
  updatePostMetrics,
  getOrCreateScheduleConfig,
  updateScheduleConfig,
  recordWhatsAppNotification,
  addPhotosToProposal,
} from "../db.helpers";

import { fetchPhotosFromDrive, getPhotoDownloadUrl, movePhotoToPublished } from "../integrations/googleDrive";
import { generateInstagramCaption } from "../integrations/aiCaption";
import { getMockPhotos, getMockSpanishCaptions } from "../integrations/googleDriveMock";
import { uploadPhotoToInstagram, getPostMetrics } from "../integrations/instagram";
import { sendPhotoProposalToWhatsApp } from "../integrations/whatsappWeb";

export const instaaiRouter = router({
  /**
   * Get today's photo proposals
   */
  getTodayProposals: protectedProcedure.query(async ({ ctx }) => {
    try {
      const proposal = await getOrCreateTodayProposal();
      const proposalPhotos = await getProposalPhotos(proposal.id);

      return {
        proposal,
        photos: proposalPhotos,
      };
    } catch (error) {
      console.error("Error getting today's proposals:", error);
      throw new Error("Failed to get today's proposals");
    }
  }),

  /**
   * Generate daily photo proposals from Google Drive
   */
  generateDailyProposals: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const proposal = await getOrCreateTodayProposal();
      const config = await getOrCreateScheduleConfig(ctx.user.id);

      // Fetch photos from Google Drive (with fallback to mock for testing)
      let drivePhotos = await fetchPhotosFromDrive().catch(() => {
        console.log("⚠️ Google Drive not accessible, using mock photos for testing");
        return getMockPhotos();
      });
      const maxProposals = config.maxDailyProposals || 10;
      const selectedPhotos = drivePhotos.slice(0, maxProposals);

      // Generate captions for each photo using mock data
      const mockCaptions = getMockSpanishCaptions();
      const photosWithCaptions = selectedPhotos.map((photo) => {
        try {
          // Use mock caption - always available for mock photos
          const mockData = mockCaptions[photo.id as keyof typeof mockCaptions] || {
            caption: `Beautiful moment captured: ${photo.name}`,
            hashtags: ["#instaai", "#automated", "#photography"],
          };

          return {
            googleDriveFileId: photo.id,
            fileName: photo.name,
            driveUrl: photo.webViewLink,
            thumbnailUrl: photo.thumbnailLink || getPhotoDownloadUrl(photo.id),
            caption: mockData.caption,
            hashtags: JSON.stringify(mockData.hashtags),
            analysisData: JSON.stringify(mockData),
          };
        } catch (error) {
          console.error(`Failed to process photo ${photo.name}:`, error);
          return null;
        }
      });

      // Filter out failed photos
      const validPhotos = photosWithCaptions.filter((p) => p !== null);

      // Persist photos to database
      const insertedPhotos = await addPhotosToProposal(proposal.id, validPhotos);

      // Send WhatsApp notifications for each photo (non-blocking)
      if (insertedPhotos && insertedPhotos.length > 0) {
        try {
          await Promise.all(
            insertedPhotos.map(async (photo) => {
              try {
                await sendPhotoProposalToWhatsApp(
                  photo.fileName,
                  photo.caption,
                  photo.thumbnailUrl || photo.driveUrl
                );
                await recordWhatsAppNotification({
                  photoId: photo.id,
                  status: "sent",
                });
              } catch (error) {
                console.error(`Failed to send WhatsApp notification for photo ${photo.id}:`, error);
                await recordWhatsAppNotification({
                  photoId: photo.id,
                  status: "failed",
                });
              }
            })
          );
        } catch (error) {
          console.error("Error sending WhatsApp notifications:", error);
          // Don't throw - notifications are non-critical
        }
      }

      return {
        proposal,
        photosGenerated: validPhotos.length,
        photos: insertedPhotos || [],
      };
    } catch (error) {
      console.error("Error generating daily proposals:", error);
      throw new Error(`Failed to generate daily proposals: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }),

  /**
   * Approve a photo for publishing
   */
  approvePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await approvePhoto(input.photoId, ctx.user.id);
        return { success: true };
      } catch (error) {
        console.error("Error approving photo:", error);
        throw new Error("Failed to approve photo");
      }
    }),

  /**
   * Reject a photo
   */
  rejectPhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await rejectPhoto(input.photoId, ctx.user.id);
        return { success: true };
      } catch (error) {
        console.error("Error rejecting photo:", error);
        throw new Error("Failed to reject photo");
      }
    }),

  /**
   * Get approved photos for today
   */
  getApprovedPhotos: protectedProcedure.query(async ({ ctx }) => {
    try {
      const proposal = await getOrCreateTodayProposal();
      const approved = await getApprovedPhotosForProposal(proposal.id, ctx.user.id);

      return {
        count: approved.length,
        photos: approved,
      };
    } catch (error) {
      console.error("Error getting approved photos:", error);
      throw new Error("Failed to get approved photos");
    }
  }),

  /**
   * Publish approved photos to Instagram
   */
  publishApprovedPhotos: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const proposal = await getOrCreateTodayProposal();
      const approved = await getApprovedPhotosForProposal(proposal.id, ctx.user.id);

      const config = await getOrCreateScheduleConfig(ctx.user.id);
      const maxPublish = config.maxDailyPublish || 5;

      const toPublish = approved.slice(0, maxPublish);
      const results = [];

      for (const item of toPublish) {
        try {
          const photo = item.photos;
          const downloadUrl = getPhotoDownloadUrl(photo.googleDriveFileId);

          // Publish to Instagram
          const igResult = await uploadPhotoToInstagram(
            downloadUrl,
            photo.caption,
            process.env.INSTAGRAM_ACCESS_TOKEN || ""
          );

          // Record in database
          await recordPublishedPost({
            photoId: photo.id,
            instagramPostId: igResult.instagramPostId,
            caption: photo.caption,
            publishedAt: new Date(),
          });

          // Move photo to Published folder
          await movePhotoToPublished(photo.googleDriveFileId);

          results.push({
            photoId: photo.id,
            success: true,
            instagramPostId: igResult.instagramPostId,
          });
        } catch (error) {
          console.error("Error publishing photo:", error);
          results.push({
            photoId: item.photos.id,
            success: false,
            error: String(error),
          });
        }
      }

      return {
        published: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };
    } catch (error) {
      console.error("Error publishing approved photos:", error);
      throw new Error("Failed to publish approved photos");
    }
  }),

  /**
   * Get publishing history
   */
  getPublishingHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const history = await getPublishingHistory(input.limit);
        return history;
      } catch (error) {
        console.error("Error getting publishing history:", error);
        throw new Error("Failed to get publishing history");
      }
    }),

  /**
   * Update post metrics
   */
  updatePostMetrics: protectedProcedure
    .input(
      z.object({
        instagramPostId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const metrics = await getPostMetrics(
          input.instagramPostId,
          process.env.INSTAGRAM_ACCESS_TOKEN || ""
        );

        await updatePostMetrics(
          input.instagramPostId,
          metrics.likes,
          metrics.comments,
          metrics.shares
        );

        return metrics;
      } catch (error) {
        console.error("Error updating post metrics:", error);
        throw new Error("Failed to update post metrics");
      }
    }),

  /**
   * Get schedule configuration
   */
  getScheduleConfig: protectedProcedure.query(async ({ ctx }) => {
    try {
      const config = await getOrCreateScheduleConfig(ctx.user.id);
      return {
        ...config,
        publishingSlots: JSON.parse(config.publishingSlots),
      };
    } catch (error) {
      console.error("Error getting schedule config:", error);
      throw new Error("Failed to get schedule config");
    }
  }),

  /**
   * Update schedule configuration
   */
  updateScheduleConfig: protectedProcedure
    .input(
      z.object({
        proposalTime: z.string().optional(),
        publishingSlots: z.array(z.string()).optional(),
        maxDailyPublish: z.number().optional(),
        maxDailyProposals: z.number().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updates: Record<string, unknown> = {};

        if (input.proposalTime) updates.proposalTime = input.proposalTime;
        if (input.publishingSlots) updates.publishingSlots = JSON.stringify(input.publishingSlots);
        if (input.maxDailyPublish) updates.maxDailyPublish = input.maxDailyPublish;
        if (input.maxDailyProposals) updates.maxDailyProposals = input.maxDailyProposals;
        if (input.timezone) updates.timezone = input.timezone;

        const result = await updateScheduleConfig(ctx.user.id, updates);

        return result;
      } catch (error) {
        console.error("Error updating schedule config:", error);
        throw new Error("Failed to update schedule config");
      }
    }),

  /**
   * Send WhatsApp notification for a photo
   */
  sendWhatsAppNotification: protectedProcedure
    .input(
      z.object({
        photoId: z.number(),
        imageUrl: z.string(),
        caption: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await sendPhotoProposalToWhatsApp(
          "Photo Proposal",
          input.caption,
          input.imageUrl
        );

        await recordWhatsAppNotification({
          photoId: input.photoId,
          status: result.success ? "sent" : "failed",
        });

        return { ...result };
      } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
        throw new Error("Failed to send WhatsApp notification");
      }
    }),
});
