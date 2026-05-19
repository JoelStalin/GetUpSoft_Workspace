import {
  IERPProvider,
  ContactFormData,
  DiagnosticFormData,
  Lead,
  Ticket,
  ValidationError,
} from "./types";

/**
 * MockERPProvider: In-memory implementation for development/testing
 * Simulates Odoo or any ERP without requiring a backend connection
 */

export class MockERPProvider implements IERPProvider {
  private connected = false;
  private leads: Map<string, Lead> = new Map();
  private tickets: Map<string, Ticket> = new Map();
  private leadCounter = 0;
  private ticketCounter = 0;

  async connect(): Promise<void> {
    console.log("[MockERP] Connecting...");
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.connected = true;
    console.log("[MockERP] Connected");
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log("[MockERP] Disconnected");
  }

  isConnected(): boolean {
    return this.connected;
  }

  async createLead(data: ContactFormData): Promise<Lead> {
    this.validateConnected();

    // Validate email
    if (!this.isValidEmail(data.email)) {
      throw new ValidationError("Invalid email address", {
        email: "Email must be valid",
      });
    }

    // Check if lead exists
    const existing = this.leads.get(data.email);
    if (existing) {
      return existing;
    }

    // Create new lead
    const lead: Lead = {
      id: `LEAD-${++this.leadCounter}`,
      email: data.email,
      company: data.company,
      source: "contact-form",
      createdAt: new Date().toISOString(),
      status: "new",
    };

    this.leads.set(data.email, lead);
    console.log("[MockERP] Lead created:", lead.id);

    return lead;
  }

  async createTicket(leadId: string, ticket: Partial<Ticket>): Promise<Ticket> {
    this.validateConnected();

    if (!ticket.subject || !ticket.description) {
      throw new ValidationError("Missing required fields", {
        subject: "Subject is required",
        description: "Description is required",
      });
    }

    const newTicket: Ticket = {
      id: `TICKET-${++this.ticketCounter}`,
      leadId,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority || "medium",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets.set(newTicket.id, newTicket);
    console.log("[MockERP] Ticket created:", newTicket.id);

    return newTicket;
  }

  async createDiagnosticLead(data: DiagnosticFormData): Promise<Lead> {
    this.validateConnected();

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError("Invalid email address", {
        email: "Email must be valid",
      });
    }

    const existing = this.leads.get(data.email);
    if (existing) {
      return existing;
    }

    const lead: Lead = {
      id: `LEAD-${++this.leadCounter}`,
      email: data.email,
      company: data.company,
      source: "diagnostic-form",
      createdAt: new Date().toISOString(),
      status: "new",
    };

    this.leads.set(data.email, lead);
    console.log("[MockERP] Diagnostic lead created:", lead.id);

    return lead;
  }

  async createDiagnosticTicket(
    leadId: string,
    data: DiagnosticFormData
  ): Promise<Ticket> {
    this.validateConnected();

    const ticket: Ticket = {
      id: `TICKET-${++this.ticketCounter}`,
      leadId,
      subject: `Diagnostic Request: ${data.company}`,
      description: `
Industry: ${data.industry}
Employees: ${data.employees}
Current Systems: ${data.currentSystems.join(", ")}
Main Pain Point: ${data.mainPain}
Timeline: ${data.timeline}
Budget: ${data.budget}
Message: ${data.message}
      `.trim(),
      priority: this.determinePriority(data.timeline, data.budget),
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets.set(ticket.id, ticket);
    console.log("[MockERP] Diagnostic ticket created:", ticket.id);

    return ticket;
  }

  async getLead(email: string): Promise<Lead | null> {
    this.validateConnected();
    return this.leads.get(email) || null;
  }

  async getTicket(id: string): Promise<Ticket | null> {
    this.validateConnected();
    return this.tickets.get(id) || null;
  }

  async listLeads(filter?: Partial<Lead>): Promise<Lead[]> {
    this.validateConnected();
    let results = Array.from(this.leads.values());

    if (filter?.status) {
      results = results.filter((lead) => lead.status === filter.status);
    }

    if (filter?.source) {
      results = results.filter((lead) => lead.source === filter.source);
    }

    return results;
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private validateConnected(): void {
    if (!this.connected) {
      throw new Error("Not connected to ERP provider");
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private determinePriority(
    timeline: string,
    budget: string
  ): "low" | "medium" | "high" | "urgent" {
    if (timeline === "immediate" || budget === "100k+") {
      return "urgent";
    }
    if (timeline === "1-3-months" || budget === "50k-100k") {
      return "high";
    }
    if (budget === "20k-50k") {
      return "medium";
    }
    return "low";
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createERPProvider(): IERPProvider {
  // In production, this would check environment variables
  // and instantiate the appropriate provider (Odoo, SAP, etc.)
  // For now, we always use mock
  return new MockERPProvider();
}
