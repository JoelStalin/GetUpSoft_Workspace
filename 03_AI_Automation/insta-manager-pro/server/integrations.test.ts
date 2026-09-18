import { describe, it, expect } from "vitest";

describe("API Token Validation", () => {
  it("should have INSTAGRAM_ACCESS_TOKEN configured", () => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    expect(token).toBeDefined();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token?.length).toBeGreaterThan(50);
  });

  it("should have WHATSAPP_ACCESS_TOKEN configured", () => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    expect(token).toBeDefined();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token?.length).toBeGreaterThan(50);
  });

  it("should have GOOGLE_DRIVE_FOLDER_ID configured", () => {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    expect(folderId).toBeDefined();
    expect(folderId).toBe("1eWWGLmsT2V5D5BLVbzQ_-Au-FXa-Fyz_");
  });

  it("should have WHATSAPP_PHONE_NUMBER_ID configured", () => {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    expect(phoneId).toBeDefined();
    expect(phoneId).toBe("1049633724904893");
  });

  it("should have WHATSAPP_BUSINESS_ACCOUNT_ID configured", () => {
    const accountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    expect(accountId).toBeDefined();
    expect(accountId).toBe("35255445117403054");
  });

  it("should validate Instagram token format", async () => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    // Instagram tokens are typically long alphanumeric strings
    expect(token).toBeDefined();
    if (token) {
      expect(token.length).toBeGreaterThan(100);
      expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
    }
  });

  it("should validate WhatsApp token format", async () => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    // WhatsApp tokens are typically long alphanumeric strings
    expect(token).toBeDefined();
    if (token) {
      expect(token.length).toBeGreaterThan(100);
      expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
    }
  });
});
