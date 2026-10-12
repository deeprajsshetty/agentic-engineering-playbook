/** Every error code the API may return — CONTRACT.md §5. Add a code there first. */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "INVALID_CURSOR"
  | "TASK_NOT_FOUND"
  | "NOT_FOUND"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "INTERNAL_ERROR";

export interface ErrorBody {
  error: { code: ErrorCode; message: string; details?: Record<string, unknown> };
}

/** Thrown by services and middleware; mapped to the envelope by the error handler. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: Record<string, unknown> | undefined;

  constructor(code: ErrorCode, status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** The CONTRACT.md §2 error envelope. `details` is omitted when absent. */
export function errorBody(code: ErrorCode, message: string, details?: Record<string, unknown>): ErrorBody {
  return { error: details === undefined ? { code, message } : { code, message, details } };
}
