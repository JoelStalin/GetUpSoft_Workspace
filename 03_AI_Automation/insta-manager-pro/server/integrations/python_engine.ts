import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { getDb } from "../db";
import { automationJobs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const execAsync = promisify(exec);

type JobType = "unfollow" | "follow" | "dm_mass" | "scrape";

/**
 * Utility to execute Python automation engines and log to DB.
 */
export async function runAutomationEngine(jobType: JobType, scriptName: string, args: string[] = []) {
  const db = await getDb();
  const enginePath = path.resolve(process.cwd(), "engines", scriptName);
  const command = `python "${enginePath}" ${args.join(" ")}`;
  
  let jobId: number | null = null;

  if (db) {
    try {
      const [result] = await db.insert(automationJobs).values({
        jobType,
        status: "running",
        startedAt: new Date(),
      });
      jobId = (result as any).insertId;
    } catch (error) {
      console.error("[PythonEngine] Failed to create job record:", error);
    }
  }

  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (db && jobId) {
      await db.update(automationJobs)
        .set({
          status: "completed",
          finishedAt: new Date(),
          logOutput: stdout + (stderr ? `\nSTDERR:\n${stderr}` : ""),
        })
        .where(eq(automationJobs.id, jobId));
    }

    if (stderr) {
      console.error(`Engine Stderr [${scriptName}]:`, stderr);
    }
    return { success: true, output: stdout, jobId };
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error(`Engine Error [${scriptName}]:`, error);

    if (db && jobId) {
      await db.update(automationJobs)
        .set({
          status: "failed",
          finishedAt: new Date(),
          error: errorMsg,
        })
        .where(eq(automationJobs.id, jobId));
    }

    return { success: false, error: errorMsg, jobId };
  }
}
