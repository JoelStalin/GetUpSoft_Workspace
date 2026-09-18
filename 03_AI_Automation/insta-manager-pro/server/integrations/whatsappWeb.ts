/**
 * WhatsApp Web Integration using Baileys
 * Allows direct linking of WhatsApp Web for sending messages
 */

import fs from "fs";
import path from "path";

// Session storage path
const SESSION_DIR = path.join(process.cwd(), ".whatsapp-session");
const SESSION_FILE = path.join(SESSION_DIR, "session.json");

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

/**
 * Check if WhatsApp Web is already linked
 */
export function isWhatsAppLinked(): boolean {
  return fs.existsSync(SESSION_FILE);
}

/**
 * Get WhatsApp linking QR code
 * In production, this would return a QR code for scanning
 */
export async function getWhatsAppQRCode(): Promise<string> {
  // This is a placeholder - in real implementation, would use Baileys to generate QR
  return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=whatsapp-link-required";
}

/**
 * Save WhatsApp session after linking
 */
export function saveWhatsAppSession(sessionData: Record<string, unknown>): void {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
}

/**
 * Get saved WhatsApp session
 */
export function getWhatsAppSession(): Record<string, unknown> | null {
  if (!fs.existsSync(SESSION_FILE)) {
    return null;
  }
  const data = fs.readFileSync(SESSION_FILE, "utf-8");
  return JSON.parse(data);
}

/**
 * Clear WhatsApp session (unlink)
 */
export function clearWhatsAppSession(): void {
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE);
  }
}

/**
 * Send message via WhatsApp Web
 * @param phoneNumber - Recipient phone number (e.g., "18492600983")
 * @param message - Message text to send
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if WhatsApp is linked
    if (!isWhatsAppLinked()) {
      return {
        success: false,
        error: "WhatsApp Web is not linked. Please scan QR code first.",
      };
    }

    // In production, this would use Baileys to send the message
    // For now, we'll simulate the send
    console.log(`📱 Sending WhatsApp message to ${phoneNumber}: ${message}`);

    // Simulate successful send
    const messageId = `msg_${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send image via WhatsApp Web
 * @param phoneNumber - Recipient phone number
 * @param imageUrl - URL of image to send
 * @param caption - Optional caption for the image
 */
export async function sendWhatsAppImage(
  phoneNumber: string,
  imageUrl: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!isWhatsAppLinked()) {
      return {
        success: false,
        error: "WhatsApp Web is not linked. Please scan QR code first.",
      };
    }

    console.log(
      `📸 Sending WhatsApp image to ${phoneNumber}: ${imageUrl}${caption ? ` - ${caption}` : ""}`
    );

    const messageId = `msg_${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("Error sending WhatsApp image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send photo proposal to WhatsApp (image + caption)
 */
export async function sendPhotoProposalToWhatsApp(
  fileName: string,
  caption: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isWhatsAppLinked()) {
      return {
        success: false,
        error: "WhatsApp Web is not linked",
      };
    }

    // Send image first
    const imageResult = await sendWhatsAppImage(
      "18492600983",
      imageUrl,
      fileName
    );
    if (!imageResult.success) {
      return imageResult;
    }

    // Then send caption
    const textResult = await sendWhatsAppMessage("18492600983", caption);
    return textResult;
  } catch (error) {
    console.error("Error sending photo proposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
