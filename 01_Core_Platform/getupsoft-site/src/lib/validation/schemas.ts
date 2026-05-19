/**
 * Form Validation Schemas
 * Using Zod for runtime type safety and validation
 */

import { z } from "zod";

// ============================================================================
// CONTACT FORM SCHEMA
// ============================================================================

export const contactFormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  company: z
    .string({ message: "Company name is required" })
    .min(2, "Company must be at least 2 characters")
    .max(150, "Company must be less than 150 characters")
    .trim(),

  message: z
    .string({ message: "Message is required" })
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),

  language: z
    .enum(["es", "en"])
    .catch("es")
    .default("es"),

  submittedAt: z.string().datetime("Invalid timestamp").optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================================
// DIAGNOSTIC FORM SCHEMA
// ============================================================================

export const diagnosticFormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  company: z
    .string({ message: "Company name is required" })
    .min(2, "Company must be at least 2 characters")
    .max(150, "Company must be less than 150 characters")
    .trim(),

  industry: z
    .string({ message: "Industry is required" })
    .min(2, "Industry must be selected")
    .max(100, "Invalid industry"),

  employees: z
    .enum(["1-10", "11-50", "51-200", "201-500", "500+"])
    .catch("1-10"),

  currentSystems: z
    .array(z.string().min(1))
    .min(1, "At least one current system must be selected")
    .max(10, "Maximum 10 systems allowed"),

  mainPain: z
    .string({ message: "Main pain point is required" })
    .min(10, "Please describe your main challenge (min 10 characters)")
    .max(500, "Main pain point must be less than 500 characters")
    .trim(),

  timeline: z
    .enum(["immediate", "1-3-months", "3-6-months", "6-12-months"])
    .catch("3-6-months"),

  budget: z
    .enum(["under-5k", "5k-20k", "20k-50k", "50k-100k", "100k+"])
    .catch("5k-20k"),

  message: z
    .string()
    .max(2000, "Additional message must be less than 2000 characters")
    .trim()
    .optional()
    .default(""),

  language: z
    .enum(["es", "en"])
    .catch("es")
    .default("es"),

  submittedAt: z.string().datetime("Invalid timestamp").optional(),
});

export type DiagnosticFormData = z.infer<typeof diagnosticFormSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
}

/**
 * Validate contact form data
 */
export function validateContactForm(
  data: unknown
): ValidationResult<ContactFormData> {
  try {
    const validated = contactFormSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      error: "Validation failed due to an unexpected error",
    };
  }
}

/**
 * Validate diagnostic form data
 */
export function validateDiagnosticForm(
  data: unknown
): ValidationResult<DiagnosticFormData> {
  try {
    const validated = diagnosticFormSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      error: "Validation failed due to an unexpected error",
    };
  }
}

/**
 * Validate email (used in multiple forms)
 */
export function validateEmail(email: string): boolean {
  const schema = z.string().email();
  try {
    schema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize email (lowercase, trim)
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize text input (trim, remove extra whitespace)
 */
export function sanitizeText(text: string, maxLength?: number): string {
  let sanitized = text.trim().replace(/\s+/g, " ");
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
}

// ============================================================================
// ERROR MESSAGES (FOR FORMS)
// ============================================================================

export const errorMessages = {
  // Contact form
  name: {
    required: "Name is required",
    minLength: "Name must be at least 2 characters",
    maxLength: "Name must be less than 100 characters",
  },
  email: {
    required: "Email is required",
    invalid: "Please provide a valid email address",
  },
  company: {
    required: "Company name is required",
    minLength: "Company must be at least 2 characters",
    maxLength: "Company must be less than 150 characters",
  },
  message: {
    required: "Message is required",
    minLength: "Message must be at least 10 characters",
    maxLength: "Message must be less than 2000 characters",
  },

  // Diagnostic form
  industry: {
    required: "Industry is required",
  },
  employees: {
    required: "Please select an employee count range",
  },
  currentSystems: {
    required: "At least one current system must be selected",
    maxLength: "Maximum 10 systems allowed",
  },
  mainPain: {
    required: "Main pain point is required",
    minLength: "Please describe your main challenge (min 10 characters)",
    maxLength: "Main pain point must be less than 500 characters",
  },
  timeline: {
    required: "Please select a timeline",
  },
  budget: {
    required: "Please select a budget range",
  },
};

// ============================================================================
// FORM STATE TYPE
// ============================================================================

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Initialize form state
 */
export function initializeFormState(
  initialValues: Record<string, any>
): FormState {
  return {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  };
}
