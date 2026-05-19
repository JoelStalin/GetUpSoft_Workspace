import {
  IERPProvider,
  ContactFormData,
  DiagnosticFormData,
  Lead,
  Ticket,
  ERPConnectionConfig,
  ConnectionError,
  AuthenticationError,
  ValidationError,
} from "./types";

/**
 * OdooProvider: Real Odoo ERP integration via XML-RPC
 * Supports: Odoo 14+
 * Protocol: XML-RPC over HTTP/HTTPS
 */

interface OdooConfig extends ERPConnectionConfig {
  type: "odoo";
  url?: string; // Alternative to host:port
}

interface OdooSession {
  sessionId: string;
  userId: number;
  timestamp: number;
}

export class OdooProvider implements IERPProvider {
  private config: OdooConfig;
  private session: OdooSession | null = null;
  private baseUrl: string;
  private rpcUrl: string;

  constructor(config: OdooConfig) {
    this.config = config;

    // Build base URL
    if (config.url) {
      this.baseUrl = config.url;
    } else {
      const protocol = config.port === 443 ? "https" : "http";
      this.baseUrl = `${protocol}://${config.host}:${config.port}`;
    }

    this.rpcUrl = `${this.baseUrl}/jsonrpc`;
  }

  async connect(): Promise<void> {
    console.log("[OdooProvider] Connecting to", this.baseUrl);

    try {
      // Authenticate and get session
      const result = await this.callRPC("call", {
        service: "common",
        method: "authenticate",
        args: [
          this.config.database,
          this.config.username,
          this.config.password,
          {},
        ],
      });

      if (!result || !result.uid) {
        throw new AuthenticationError("Odoo authentication failed");
      }

      this.session = {
        sessionId: result.sessionId || "default",
        userId: result.uid,
        timestamp: Date.now(),
      };

      console.log("[OdooProvider] Connected as user", this.session.userId);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new ConnectionError(
        `Failed to connect to Odoo: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async disconnect(): Promise<void> {
    this.session = null;
    console.log("[OdooProvider] Disconnected");
  }

  isConnected(): boolean {
    return this.session !== null;
  }

  async createLead(data: ContactFormData): Promise<Lead> {
    this.validateConnected();

    try {
      // Create lead in Odoo CRM
      const leadId = await this.callRPC("execute", {
        model: "crm.lead",
        method: "create",
        args: [
          {
            name: data.company || data.name,
            contact_name: data.name,
            email_from: data.email,
            description: data.message,
            type: "lead",
            source_id: this.getSourceId("contact-form"),
            lang: data.language === "es" ? "es_ES" : "en_US",
          },
        ],
      });

      const lead: Lead = {
        id: `LEAD-${leadId}`,
        email: data.email,
        company: data.company,
        source: "contact-form",
        createdAt: new Date().toISOString(),
        status: "new",
      };

      console.log("[OdooProvider] Lead created:", lead.id);
      return lead;
    } catch (error) {
      throw new Error(
        `Failed to create lead: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createTicket(leadId: string, ticket: Partial<Ticket>): Promise<Ticket> {
    this.validateConnected();

    if (!ticket.subject || !ticket.description) {
      throw new ValidationError("Missing required fields", {
        subject: "Subject is required",
        description: "Description is required",
      });
    }

    try {
      // Extract lead ID from LEAD-123 format
      const odooLeadId = parseInt(leadId.replace("LEAD-", ""));

      // Create support ticket (helpdesk)
      const ticketId = await this.callRPC("execute", {
        model: "helpdesk.ticket",
        method: "create",
        args: [
          {
            name: ticket.subject,
            description: ticket.description,
            partner_id: odooLeadId,
            priority: this.mapPriority(ticket.priority || "medium"),
            tag_ids: [[6, 0, [this.getTagId("contact-form")]]],
          },
        ],
      });

      const newTicket: Ticket = {
        id: `TICKET-${ticketId}`,
        leadId,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority || "medium",
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("[OdooProvider] Ticket created:", newTicket.id);
      return newTicket;
    } catch (error) {
      throw new Error(
        `Failed to create ticket: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createDiagnosticLead(data: DiagnosticFormData): Promise<Lead> {
    this.validateConnected();

    try {
      const leadId = await this.callRPC("execute", {
        model: "crm.lead",
        method: "create",
        args: [
          {
            name: data.company,
            contact_name: data.name,
            email_from: data.email,
            description: `
Industry: ${data.industry}
Employees: ${data.employees}
Current Systems: ${data.currentSystems.join(", ")}
Main Challenge: ${data.mainPain}
Timeline: ${data.timeline}
Budget: ${data.budget}
Message: ${data.message}
            `.trim(),
            type: "opportunity",
            source_id: this.getSourceId("diagnostic-form"),
            lang: data.language === "es" ? "es_ES" : "en_US",
            expected_revenue: this.estimateRevenue(data.budget),
          },
        ],
      });

      const lead: Lead = {
        id: `LEAD-${leadId}`,
        email: data.email,
        company: data.company,
        source: "diagnostic-form",
        createdAt: new Date().toISOString(),
        status: "new",
      };

      console.log("[OdooProvider] Diagnostic lead created:", lead.id);
      return lead;
    } catch (error) {
      throw new Error(
        `Failed to create diagnostic lead: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createDiagnosticTicket(
    leadId: string,
    data: DiagnosticFormData
  ): Promise<Ticket> {
    this.validateConnected();

    try {
      const odooLeadId = parseInt(leadId.replace("LEAD-", ""));

      const ticketId = await this.callRPC("execute", {
        model: "helpdesk.ticket",
        method: "create",
        args: [
          {
            name: `Diagnostic Request: ${data.company}`,
            description: `
Industry: ${data.industry}
Employees: ${data.employees}
Current Systems: ${data.currentSystems.join(", ")}
Main Challenge: ${data.mainPain}
Timeline: ${data.timeline}
Budget: ${data.budget}
Message: ${data.message}
            `.trim(),
            partner_id: odooLeadId,
            priority: this.mapPriority(this.determinePriority(data.timeline, data.budget)),
            tag_ids: [[6, 0, [this.getTagId("diagnostic"), this.getTagId(data.industry)]]],
          },
        ],
      });

      const ticket: Ticket = {
        id: `TICKET-${ticketId}`,
        leadId,
        subject: `Diagnostic: ${data.company}`,
        description: `Industry: ${data.industry}, Timeline: ${data.timeline}, Budget: ${data.budget}`,
        priority: this.determinePriority(data.timeline, data.budget),
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("[OdooProvider] Diagnostic ticket created:", ticket.id);
      return ticket;
    } catch (error) {
      throw new Error(
        `Failed to create diagnostic ticket: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getLead(email: string): Promise<Lead | null> {
    this.validateConnected();

    try {
      const leads = await this.callRPC("execute", {
        model: "crm.lead",
        method: "search_read",
        args: [
          [["email_from", "=", email]],
          ["id", "name", "email_from", "type", "create_date"],
        ],
      });

      if (!leads || leads.length === 0) {
        return null;
      }

      const odooLead = leads[0];
      return {
        id: `LEAD-${odooLead.id}`,
        email: odooLead.email_from,
        company: odooLead.name,
        source: odooLead.type === "opportunity" ? "diagnostic-form" : "contact-form",
        createdAt: odooLead.create_date,
        status: "new",
      };
    } catch (error) {
      console.error("[OdooProvider] Error fetching lead:", error);
      return null;
    }
  }

  async getTicket(id: string): Promise<Ticket | null> {
    this.validateConnected();

    try {
      const ticketId = parseInt(id.replace("TICKET-", ""));
      const tickets = await this.callRPC("execute", {
        model: "helpdesk.ticket",
        method: "search_read",
        args: [
          [["id", "=", ticketId]],
          [
            "id",
            "name",
            "description",
            "priority",
            "stage_id",
            "create_date",
            "write_date",
          ],
        ],
      });

      if (!tickets || tickets.length === 0) {
        return null;
      }

      const odooTicket = tickets[0];
      return {
        id: `TICKET-${odooTicket.id}`,
        leadId: "", // Would need to fetch from relationship
        subject: odooTicket.name,
        description: odooTicket.description,
        priority: this.unmapPriority(odooTicket.priority),
        status: odooTicket.stage_id[1].toLowerCase(),
        createdAt: odooTicket.create_date,
        updatedAt: odooTicket.write_date,
      };
    } catch (error) {
      console.error("[OdooProvider] Error fetching ticket:", error);
      return null;
    }
  }

  async listLeads(filter?: Partial<Lead>): Promise<Lead[]> {
    this.validateConnected();

    try {
      const domain: any[] = [];

      if (filter?.status) {
        // Map status to Odoo stage
        domain.push(["stage_id.name", "=", filter.status]);
      }

      const leads = await this.callRPC("execute", {
        model: "crm.lead",
        method: "search_read",
        args: [domain, ["id", "email_from", "name", "type", "create_date"]],
      });

      return leads.map((lead: any) => ({
        id: `LEAD-${lead.id}`,
        email: lead.email_from,
        company: lead.name,
        source: lead.type === "opportunity" ? "diagnostic-form" : "contact-form",
        createdAt: lead.create_date,
        status: "new",
      }));
    } catch (error) {
      console.error("[OdooProvider] Error listing leads:", error);
      return [];
    }
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private validateConnected(): void {
    if (!this.session) {
      throw new Error("Not connected to Odoo");
    }
  }

  private async callRPC(method: string, params: any): Promise<any> {
    const payload = {
      jsonrpc: "2.0",
      method,
      params,
      id: Math.random(),
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.session) {
        headers["Cookie"] = `session_id=${this.session.sessionId}`;
      }

      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "RPC error");
      }

      return data.result;
    } catch (error) {
      throw new ConnectionError(
        `Odoo RPC call failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getSourceId(source: string): number {
    // Map form sources to Odoo source IDs
    // These would be fetched from crm.lead.source in a real implementation
    const sourceMap: Record<string, number> = {
      "contact-form": 1,
      "diagnostic-form": 2,
      "web-inquiry": 3,
    };
    return sourceMap[source] || 1;
  }

  private getTagId(tag: string): number {
    // Map tags to Odoo tag IDs
    // These would be fetched from crm.tag in a real implementation
    const tagMap: Record<string, number> = {
      "contact-form": 1,
      diagnostic: 2,
      "retail": 3,
      "restaurant": 4,
      "distribution": 5,
      "professional-services": 6,
    };
    return tagMap[tag] || 1;
  }

  private mapPriority(priority: string): number {
    // Map our priority to Odoo (0=low, 1=medium, 2=high, 3=urgent)
    const priorityMap: Record<string, number> = {
      low: 0,
      medium: 1,
      high: 2,
      urgent: 3,
    };
    return priorityMap[priority] || 1;
  }

  private unmapPriority(priority: number): "low" | "medium" | "high" | "urgent" {
    const priorityMap: Record<number, "low" | "medium" | "high" | "urgent"> = {
      0: "low",
      1: "medium",
      2: "high",
      3: "urgent",
    };
    return priorityMap[priority] || "medium";
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

  private estimateRevenue(budget: string): number {
    // Estimate revenue for sales opportunity
    const budgetMap: Record<string, number> = {
      "under-5k": 2500,
      "5k-20k": 12500,
      "20k-50k": 35000,
      "50k-100k": 75000,
      "100k+": 150000,
    };
    return budgetMap[budget] || 0;
  }
}
