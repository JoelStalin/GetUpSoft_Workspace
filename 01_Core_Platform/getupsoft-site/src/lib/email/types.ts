/**
 * Email Service Types & Interfaces
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ContactFormEmail {
  type: "contact-form";
  to: string;
  name: string;
  email: string;
  company: string;
  message: string;
  language: "es" | "en";
  ticketId?: string;
}

export interface DiagnosticFormEmail {
  type: "diagnostic-form";
  to: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  timeline: string;
  budget: string;
  language: "es" | "en";
  ticketId?: string;
}

export type EmailData = ContactFormEmail | DiagnosticFormEmail;

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  /**
   * Send email notification
   */
  send(data: EmailData): Promise<SendEmailResult>;

  /**
   * Generate email template
   */
  generateTemplate(data: EmailData): EmailTemplate;
}

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailError";
  }
}
