// ERP Adapter Architecture
// Defines interfaces for multi-ERP support: Odoo, ERPNext, iSeries, SAP

/**
 * ERPProvider: Abstract interface for ERP system connections
 * Supports: Odoo, ERPNext, SAP, iSeries
 */

export type ERPType = "odoo" | "erp-next" | "sap" | "iseries";

export interface ERPConnectionConfig {
  type: ERPType;
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
  apiKey?: string; // For REST APIs
  timeout?: number;
}

// ============================================================================
// CONTACT FORM SUBMISSION
// ============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
  language: "es" | "en";
  submittedAt: string;
}

export interface ContactFormResponse {
  success: boolean;
  ticketId?: string;
  error?: string;
}

// ============================================================================
// DIAGNOSTIC FORM SUBMISSION
// ============================================================================

export interface DiagnosticFormData {
  name: string;
  email: string;
  company: string;
  industry: string;
  employees: string;
  currentSystems: string[];
  mainPain: string;
  timeline: "immediate" | "1-3-months" | "3-6-months" | "6-12-months";
  budget: "under-5k" | "5k-20k" | "20k-50k" | "50k-100k" | "100k+";
  message: string;
  language: "es" | "en";
  submittedAt: string;
}

export interface DiagnosticFormResponse {
  success: boolean;
  ticketId?: string;
  scheduleLink?: string;
  error?: string;
}

// ============================================================================
// LEAD & TICKET MANAGEMENT
// ============================================================================

export interface Lead {
  id: string;
  email: string;
  company: string;
  source: "contact-form" | "diagnostic-form" | "web-inquiry";
  createdAt: string;
  status: "new" | "contacted" | "qualified" | "lost" | "won";
}

export interface Ticket {
  id: string;
  leadId: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "waiting" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

// ============================================================================
// ERP PROVIDER INTERFACE (Adapter Pattern)
// ============================================================================

export interface IERPProvider {
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Contact form submission → CRM or ticket system
  createLead(data: ContactFormData): Promise<Lead>;
  createTicket(leadId: string, ticket: Partial<Ticket>): Promise<Ticket>;

  // Diagnostic form submission → CRM with additional fields
  createDiagnosticLead(data: DiagnosticFormData): Promise<Lead>;
  createDiagnosticTicket(
    leadId: string,
    data: DiagnosticFormData
  ): Promise<Ticket>;

  // Query
  getLead(email: string): Promise<Lead | null>;
  getTicket(id: string): Promise<Ticket | null>;
  listLeads(filter?: Partial<Lead>): Promise<Lead[]>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ERPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ERPError";
  }
}

export class ConnectionError extends ERPError {
  constructor(message: string) {
    super(message, "CONNECTION_ERROR", 500);
    this.name = "ConnectionError";
  }
}

export class ValidationError extends ERPError {
  constructor(message: string, public fields: Record<string, string> = {}) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ERPError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}
