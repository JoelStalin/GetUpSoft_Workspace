/**
 * SMTPEmailProvider: Production email service via SMTP
 * Sends emails through a configured SMTP server
 */

import {
  IEmailProvider,
  EmailData,
  EmailTemplate,
  SendEmailResult,
  EmailError,
} from "./types";

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class SMTPEmailProvider implements IEmailProvider {
  private config: SMTPConfig;

  constructor(config: SMTPConfig) {
    this.config = config;
  }

  async send(data: EmailData): Promise<SendEmailResult> {
    try {
      const template = this.generateTemplate(data);

      // In a real implementation, this would use nodemailer or similar
      // For now, we'll make an API call to a backend email service
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.to,
          subject: template.subject,
          html: template.html,
          text: template.text,
          from: this.config.from,
        }),
      });

      if (!response.ok) {
        throw new EmailError(`Failed to send email: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[SMTPEmailProvider] Error sending email:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send email",
      };
    }
  }

  generateTemplate(data: EmailData): EmailTemplate {
    if (data.type === "contact-form") {
      return this.generateContactTemplate(data);
    } else {
      return this.generateDiagnosticTemplate(data);
    }
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
