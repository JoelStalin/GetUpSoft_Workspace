/**
 * MockEmailProvider: Development-only email service
 * Logs emails to console instead of sending them
 */

import {
  IEmailProvider,
  EmailData,
  EmailTemplate,
  SendEmailResult,
} from "./types";

export class MockEmailProvider implements IEmailProvider {
  private sentEmails: EmailData[] = [];

  async send(data: EmailData): Promise<SendEmailResult> {
    this.sentEmails.push(data);
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log("[MockEmailProvider] Email sent", {
      to: data.to,
      type: data.type,
      messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId,
    };
  }

  generateTemplate(data: EmailData): EmailTemplate {
    if (data.type === "contact-form") {
      return this.generateContactTemplate(data);
    } else {
      return this.generateDiagnosticTemplate(data);
    }
  }

  /**
   * Get all sent emails (useful for testing)
   */
  getSentEmails(): EmailData[] {
    return [...this.sentEmails];
  }

  /**
   * Clear sent emails log
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }

  private generateContactTemplate(data: any): EmailTemplate {
    const isSpanish = data.language === "es";

    const subject = isSpanish
      ? "Confirmación de tu solicitud de contacto"
      : "Confirmation of your contact request";

    const title = isSpanish
      ? "¡Gracias por contactarnos!"
      : "Thank you for contacting us!";

    const message = isSpanish
      ? `Hemos recibido tu solicitud y nos pondremos en contacto pronto. Tu número de referencia es: ${data.ticketId || "pending"}`
      : `We have received your request and will be in touch soon. Your reference number is: ${data.ticketId || "pending"}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5EEAD4;">${title}</h1>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <h3>${isSpanish ? "Detalles de tu solicitud:" : "Request details:"}</h3>
          <ul style="color: #666;">
            <li><strong>${isSpanish ? "Nombre:" : "Name:"}</strong> ${data.name}</li>
            <li><strong>${isSpanish ? "Empresa:" : "Company:"}</strong> ${data.company}</li>
            <li><strong>${isSpanish ? "Email:" : "Email:"}</strong> ${data.email}</li>
          </ul>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            ${isSpanish ? "Este es un mensaje automático. Por favor, no respondas a este correo." : "This is an automated message. Please do not reply to this email."}
          </p>
        </body>
      </html>
    `;

    const text = `${title}\n\n${message}\n\nRequest details:\nName: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}`;

    return { subject, html, text };
  }

  private generateDiagnosticTemplate(data: any): EmailTemplate {
    const isSpanish = data.language === "es";

    const subject = isSpanish
      ? "Tu diagnóstico empresarial ha sido enviado"
      : "Your business diagnostic has been submitted";

    const title = isSpanish
      ? "¡Tu diagnóstico ha sido recibido!"
      : "Your diagnostic has been received!";

    const message = isSpanish
      ? `Gracias por completar el diagnóstico empresarial. Nuestro equipo lo analizará y te contactaremos en breve. Tu número de referencia es: ${data.ticketId || "pending"}`
      : `Thank you for completing the business diagnostic. Our team will analyze it and contact you soon. Your reference number is: ${data.ticketId || "pending"}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5EEAD4;">${title}</h1>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <h3>${isSpanish ? "Resumen del diagnóstico:" : "Diagnostic summary:"}</h3>
          <ul style="color: #666;">
            <li><strong>${isSpanish ? "Empresa:" : "Company:"}</strong> ${data.company}</li>
            <li><strong>${isSpanish ? "Industria:" : "Industry:"}</strong> ${data.industry}</li>
            <li><strong>${isSpanish ? "Plazo:" : "Timeline:"}</strong> ${data.timeline}</li>
            <li><strong>${isSpanish ? "Presupuesto:" : "Budget:"}</strong> ${data.budget}</li>
          </ul>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            ${isSpanish ? "Este es un mensaje automático. Por favor, no respondas a este correo." : "This is an automated message. Please do not reply to this email."}
          </p>
        </body>
      </html>
    `;

    const text = `${title}\n\n${message}\n\nDiagnostic summary:\nCompany: ${data.company}\nIndustry: ${data.industry}\nTimeline: ${data.timeline}\nBudget: ${data.budget}`;

    return { subject, html, text };
  }
}
