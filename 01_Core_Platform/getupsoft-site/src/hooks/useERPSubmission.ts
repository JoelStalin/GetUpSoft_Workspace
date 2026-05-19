import { useState, useCallback } from "react";
import {
  ContactFormData,
  DiagnosticFormData,
  IERPProvider,
  ValidationError,
  ERPError,
} from "../lib/erp/types";
import { createERPProvider } from "../lib/erp/mock-provider";

interface SubmissionState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  ticketId: string | null;
}

interface UseERPSubmissionReturn {
  state: SubmissionState;
  submitContact: (data: ContactFormData) => Promise<void>;
  submitDiagnostic: (data: DiagnosticFormData) => Promise<void>;
  reset: () => void;
}

/**
 * useERPSubmission: Hook for form submissions to ERP system
 * Handles loading, error, and success states
 */
export function useERPSubmission(): UseERPSubmissionReturn {
  const [state, setState] = useState<SubmissionState>({
    isLoading: false,
    error: null,
    success: false,
    ticketId: null,
  });

  // Initialize ERP provider (in production, this would be a singleton)
  const provider = useState<IERPProvider>(() => createERPProvider())[0];

  const submitContact = useCallback(
    async (data: ContactFormData) => {
      setState({ isLoading: true, error: null, success: false, ticketId: null });

      try {
        // Connect to ERP
        if (!provider.isConnected()) {
          await provider.connect();
        }

        // Create lead from contact form
        const lead = await provider.createLead(data);

        // Create ticket for follow-up
        const ticket = await provider.createTicket(lead.id, {
          subject: `Contact Form Inquiry from ${data.company || data.name}`,
          description: data.message,
        });

        setState({
          isLoading: false,
          error: null,
          success: true,
          ticketId: ticket.id,
        });

        console.log("[useERPSubmission] Contact form submitted:", ticket.id);
      } catch (error) {
        const errorMessage =
          error instanceof ValidationError
            ? error.message
            : error instanceof ERPError
              ? error.message
              : "Failed to submit form. Please try again.";

        setState({
          isLoading: false,
          error: errorMessage,
          success: false,
          ticketId: null,
        });

        console.error("[useERPSubmission] Contact submission failed:", error);
      }
    },
    [provider]
  );

  const submitDiagnostic = useCallback(
    async (data: DiagnosticFormData) => {
      setState({ isLoading: true, error: null, success: false, ticketId: null });

      try {
        // Connect to ERP
        if (!provider.isConnected()) {
          await provider.connect();
        }

        // Create diagnostic lead
        const lead = await provider.createDiagnosticLead(data);

        // Create diagnostic ticket with structured data
        const ticket = await provider.createDiagnosticTicket(lead.id, data);

        setState({
          isLoading: false,
          error: null,
          success: true,
          ticketId: ticket.id,
        });

        console.log("[useERPSubmission] Diagnostic form submitted:", ticket.id);
      } catch (error) {
        const errorMessage =
          error instanceof ValidationError
            ? error.message
            : error instanceof ERPError
              ? error.message
              : "Failed to submit form. Please try again.";

        setState({
          isLoading: false,
          error: errorMessage,
          success: false,
          ticketId: null,
        });

        console.error("[useERPSubmission] Diagnostic submission failed:", error);
      }
    },
    [provider]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      ticketId: null,
    });
  }, []);

  return {
    state,
    submitContact,
    submitDiagnostic,
    reset,
  };
}
