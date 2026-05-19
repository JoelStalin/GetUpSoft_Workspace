/**
 * Email Provider Factory & Configuration
 * Selects appropriate provider based on environment
 */

import { IEmailProvider, EmailData, SendEmailResult } from "./types";
import { MockEmailProvider } from "./mock-provider";
import { SMTPEmailProvider } from "./smtp-provider";

let cachedProvider: IEmailProvider | null = null;

/**
 * Get or create email provider instance
 * Follows singleton pattern for connection reuse
 */
export function getEmailProvider(): IEmailProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = getProviderType();

  if (providerType === "mock") {
    cachedProvider = new MockEmailProvider();
    console.log("[Email] Using MOCK provider");
  } else {
    cachedProvider = new SMTPEmailProvider({
      host: getEnv("VITE_SMTP_HOST", "smtp.gmail.com"),
      port: parseInt(getEnv("VITE_SMTP_PORT", "587")),
      secure: getEnv("VITE_SMTP_SECURE", "false") === "true",
      auth: {
        user: getEnv("VITE_SMTP_USER", ""),
        pass: getEnv("VITE_SMTP_PASS", ""),
      },
      from: getEnv("VITE_SMTP_FROM", "noreply@getupsoft.com"),
    });
    console.log("[Email] Using SMTP provider");
  }

  return cachedProvider;
}

/**
 * Reset cached provider (useful for testing)
 */
export function resetEmailProvider(): void {
  cachedProvider = null;
}

/**
 * Determine which provider to use
 * Priority:
 * 1. VITE_USE_MOCK_EMAIL=true forces mock
 * 2. Development defaults to Mock
 * 3. Production defaults to SMTP
 */
function getProviderType(): "mock" | "smtp" {
  if (getEnv("VITE_USE_MOCK_EMAIL") === "true") {
    return "mock";
  }

  if (import.meta.env.DEV) {
    return "mock";
  }

  return "smtp";
}

/**
 * Check if email notifications are enabled
 */
export function isEmailEnabled(): boolean {
  return getEnv("VITE_DISABLE_EMAIL") !== "true";
}

/**
 * Send email notification
 */
export async function sendEmail(data: EmailData): Promise<SendEmailResult> {
  if (!isEmailEnabled()) {
    return { success: true, messageId: "disabled" };
  }

  const provider = getEmailProvider();
  return provider.send(data);
}

// ============================================================================
// HELPERS
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
  return import.meta.env[key] || defaultValue || "";
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { IEmailProvider, EmailData, EmailTemplate, SendEmailResult } from "./types";
export { MockEmailProvider } from "./mock-provider";
export { SMTPEmailProvider } from "./smtp-provider";

/**
 * Usage in components:
 *
 * import { sendEmail, isEmailEnabled } from '@/lib/email'
 *
 * if (isEmailEnabled()) {
 *   const result = await sendEmail({
 *     type: 'contact-form',
 *     to: data.email,
 *     name: data.name,
 *     email: data.email,
 *     company: data.company,
 *     message: data.message,
 *     language: currentLanguage,
 *     ticketId: lead.id,
 *   })
 * }
 */
