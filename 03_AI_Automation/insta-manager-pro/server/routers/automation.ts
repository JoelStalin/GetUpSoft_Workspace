import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { runAutomationEngine } from "../integrations/python_engine";
import { getDb } from "../db";
import { automationJobs } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export const automationRouter = router({
  /**
   * Run the unfollow engine
   */
  startUnfollow: protectedProcedure.mutation(async () => {
    // Start engine in background (don't await full execution for long running tasks)
    runAutomationEngine("unfollow", "main.py");
    return { success: true, message: "Unfollow engine started" };
  }),

  /**
   * Run mass DM engine
   */
  startMassDM: protectedProcedure
    .input(z.object({ targetsFile: z.string().default("targets.json") }))
    .mutation(async ({ input }) => {
      runAutomationEngine("dm_mass", "mass_follow_and_send.py", ["--targets", input.targetsFile]);
      return { success: true, message: "Mass DM engine started" };
    }),

  /**
   * Get job history
   */
  getJobHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select()
        .from(automationJobs)
        .orderBy(desc(automationJobs.createdAt))
        .limit(input.limit);
    }),

  /**
   * Get job status
   */
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.select()
        .from(automationJobs)
        .where(eq(automationJobs.id, input.jobId))
        .limit(1);
        
      return result[0];
    }),
});
