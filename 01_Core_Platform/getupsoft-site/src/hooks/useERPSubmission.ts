import { useState, useCallback, useEffect } from "react";
import {
  ContactFormData,
  DiagnosticFormData,
  IERPProvider,
  ValidationError,
  ERPError,
} from "../lib/erp/types";
import { getERPProvider } from "../lib/erp";
import { sendEmail, isEmailEnabled } from "../lib/email";

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

  const [provider, setProvider] = useState<IERPProvider | null>(null);

  // Initialize ERP provider on mount
  useEffect(() => {
    getERPProvider()
      .then((p) => {
        setProvider(p);
        console.log("[useERPSubmission] Provider initialized");
      })
      .catch((error) => {
        console.error("[useERPSubmission] Failed to initialize provider:", error);
      });
  }, []);

  const submitContact = useCallback(
    async (data: ContactFormData) => {
      if (!provider) {
        setState({
          isLoading: false,
          error: "ERP provider not initialized",
          success: false,
          ticketId: null,
        });
        return;
      }

      setState({ isLoading: true, error: null, success: false, ticketId: null });

      try {
        // Connect to ERP if needed
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

        // Send confirmation email
        if (isEmailEnabled()) {
          sendEmail({
            type: "contact-form",
            to: data.email,
            name: data.name,
            email: data.email,
            company: data.company,
            message: data.message,
            language: data.language,
            ticketId: ticket.id,
          }).catch((err) => {
            console.warn("[useERPSubmission] Failed to send confirmation email:", err);
          });
        }

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
      if (!provider) {
        setState({
          isLoading: false,
          error: "ERP provider not initialized",
          success: false,
          ticketId: null,
        });
        return;
      }

      setState({ isLoading: true, error: null, success: false, ticketId: null });

      try {
        // Connect to ERP if needed
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

        // Send confirmation email
        if (isEmailEnabled()) {
          sendEmail({
            type: "diagnostic-form",
            to: data.email,
            name: data.name,
            email: data.email,
            company: data.company,
            industry: data.industry,
            timeline: data.timeline,
            budget: data.budget,
            language: data.language,
            ticketId: ticket.id,
          }).catch((err) => {
            console.warn("[useERPSubmission] Failed to send confirmation email:", err);
          });
        }

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
