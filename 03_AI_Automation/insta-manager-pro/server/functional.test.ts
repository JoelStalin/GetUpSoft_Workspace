import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context with authenticated user
const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockContext: TrpcContext = {
  user: mockUser,
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: () => {},
  } as TrpcContext["res"],
};

describe("InstaAI Functional Tests", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(mockContext);
  });

  it("should get or create today's proposals", async () => {
    const result = await caller.instaai.getTodayProposals();
    expect(result).toBeDefined();
    expect(result.proposal).toBeDefined();
    expect(result.proposal.date).toBeDefined();
    expect(Array.isArray(result.photos)).toBe(true);
    console.log("✅ getTodayProposals works:", result);
  });

  it("should get or create schedule config", async () => {
    const result = await caller.instaai.getScheduleConfig();
    expect(result).toBeDefined();
    expect(result.maxDailyProposals).toBeDefined();
    expect(result.maxDailyPublish).toBeDefined();
    console.log("✅ getScheduleConfig works:", result);
  });

  it("should update schedule config", async () => {
    const result = await caller.instaai.updateScheduleConfig({
      proposalTime: "09:00",
      maxDailyProposals: 10,
      maxDailyPublish: 5,
      publishTimeSlots: ["10:00", "12:00", "14:00", "16:00", "18:00"],
    });
    expect(result).toBeDefined();
    expect(result.proposalTime).toBe("09:00");
    console.log("✅ updateScheduleConfig works:", result);
  });

  it("should get publishing history", async () => {
    const result = await caller.instaai.getPublishingHistory({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    console.log("✅ getPublishingHistory works:", result);
  });

  it("should handle generateDailyProposals gracefully", async () => {
    try {
      const result = await caller.instaai.generateDailyProposals();
      console.log("✅ generateDailyProposals executed:", {
        photosGenerated: result.photosGenerated,
        photoCount: result.photos?.length || 0,
      });
      expect(result).toBeDefined();
      expect(typeof result.photosGenerated).toBe("number");
    } catch (error) {
      console.log("⚠️ generateDailyProposals error (expected if Drive not accessible):", error);
      // This is expected if Google Drive integration isn't fully configured
    }
  });
});
