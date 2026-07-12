/**
 * lib/validations.ts
 *
 * Central Zod schema definitions for all API inputs.
 *
 * Keeping schemas in one place ensures consistency between routes, makes it
 * easy to reuse schemas on the client for form validation, and provides a
 * single location to tighten rules as the app grows.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared field definitions — reused across multiple schemas
// ---------------------------------------------------------------------------

const emailField = z
  .string()
  .trim()
  .email("Must be a valid email address")
  .max(255, "Email must not exceed 255 characters");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL (include https://)")
  .max(2048)
  .optional()
  .or(z.literal("").transform(() => undefined));

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"), // Don't enforce complexity on login
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Client schemas
// ---------------------------------------------------------------------------

export const createClientSchema = z.object({
  // Required fields
  name: z
    .string()
    .trim()
    .min(1, "Client name is required")
    .max(255, "Client name must not exceed 255 characters"),

  portalEmail: emailField,

  portalPassword: passwordField,

  // Optional contact info
  email: emailField.optional().or(z.literal("").transform(() => undefined)),

  phone: z
    .string()
    .trim()
    .max(50, "Phone must not exceed 50 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  industry: z
    .string()
    .trim()
    .max(100, "Industry must not exceed 100 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  website: optionalUrl,
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial().extend({
  // portalPassword is truly optional on update — omitting it means "no change"
  portalPassword: passwordField.optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "PAUSED"], {
      errorMap: () => ({ message: "status must be ACTIVE, INACTIVE, or PAUSED" }),
    })
    .optional(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ---------------------------------------------------------------------------
// Meta Account schemas
// ---------------------------------------------------------------------------

export const createMetaAccountSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  adAccountId: z
    .string()
    .trim()
    .min(1, "Ad Account ID is required")
    .max(100),
  adAccountName: z.string().trim().max(255).optional(),
  accessToken: z.string().min(1, "Access token is required"),
  businessId: z.string().trim().max(100).optional(),
  tokenExpiry: z.coerce.date().optional(),
});

export type CreateMetaAccountInput = z.infer<typeof createMetaAccountSchema>;

// ---------------------------------------------------------------------------
// Google Account schemas
// ---------------------------------------------------------------------------

export const createGoogleAccountSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  customerId: z
    .string()
    .trim()
    .min(1, "Customer ID is required")
    .max(100),
  customerName: z.string().trim().max(255).optional(),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
  tokenExpiry: z.coerce.date().optional(),
});

export type CreateGoogleAccountInput = z.infer<typeof createGoogleAccountSchema>;

// ---------------------------------------------------------------------------
// Helper — parse request body and return a typed result or an error payload
// ---------------------------------------------------------------------------

/**
 * Parses `req.json()` against the provided Zod schema.
 *
 * Returns `{ data, error: null }` on success or `{ data: null, error }` on
 * failure, where `error` is a pre-formatted object ready to pass to
 * NextResponse.json().
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { data: T; error: null }
  | { data: null; error: { error: string; details: z.ZodIssue[] } }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      data: null,
      error: { error: "Request body is not valid JSON.", details: [] },
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      data: null,
      error: {
        error: "Validation failed.",
        details: result.error.issues,
      },
    };
  }

  return { data: result.data, error: null };
}
