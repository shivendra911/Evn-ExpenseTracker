import type { ZodSchema } from 'zod';
import { ValidationError } from './errors';

// ─── Zod Request Validation ─────────────────────────────
// Utility to validate request body/query against a Zod schema.

/**
 * Validate and parse a request body using a Zod schema.
 * Throws a ValidationError with detailed field errors on failure.
 */
export async function validateBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)[0];
    const message = firstError
      ? `${firstError[0]}: ${(firstError[1] as string[])[0]}`
      : 'Validation failed';

    throw new ValidationError(message, fieldErrors);
  }

  return result.data;
}

/**
 * Validate and parse URL search params using a Zod schema.
 */
export function validateQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)[0];
    const message = firstError
      ? `${firstError[0]}: ${(firstError[1] as string[])[0]}`
      : 'Invalid query parameters';

    throw new ValidationError(message, fieldErrors);
  }

  return result.data;
}
