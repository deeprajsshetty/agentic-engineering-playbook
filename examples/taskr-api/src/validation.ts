import { z } from "zod";
import { AppError } from "./errors.js";
import { PRIORITIES, STATUSES } from "./types.js";

/** All request input rules live here (CONTRACT.md §3–§4). */

const requiredString = z.string({
  error: (issue) => (issue.input === undefined ? "Required" : "Must be a string"),
});

/** Length in Unicode code points, so "🙂" counts as 1 character, not 2 UTF-16 units (CONTRACT §3). */
const codePoints = (value: string) => [...value].length;

export const titleSchema = requiredString
  .trim()
  .min(1, "Must not be empty")
  .refine((value) => codePoints(value) <= 200, "Must be at most 200 characters");

export const prioritySchema = z.enum(PRIORITIES, { error: "Must be one of: low, medium, high" });

function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const dueDateSchema = z
  .string({ error: "Must be a date string (YYYY-MM-DD) or null" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
  .refine(isRealDate, "Must be a real calendar date");

export const createTaskSchema = z.strictObject(
  {
    title: titleSchema,
    priority: prioritySchema.optional(),
    dueDate: dueDateSchema.nullable().optional(),
  },
  { error: (issue) => (issue.code === "invalid_type" ? "Body must be a JSON object" : undefined) },
);
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .strictObject(
    {
      title: titleSchema.optional(),
      priority: prioritySchema.optional(),
      status: z.enum(STATUSES, { error: "Must be one of: open, done" }).optional(),
      dueDate: dueDateSchema.nullable().optional(),
    },
    { error: (issue) => (issue.code === "invalid_type" ? "Body must be a JSON object" : undefined) },
  )
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one of: title, priority, status, dueDate",
  });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

const LIMIT_MESSAGE = "Must be an integer from 1 to 100";

/** Query strings arrive as strings; a repeated parameter arrives as an array and is rejected. */
export const listTasksQuerySchema = z.strictObject({
  status: z.enum(STATUSES, { error: "Must be one of: open, done" }).optional(),
  priority: prioritySchema.optional(),
  limit: z
    .string({ error: LIMIT_MESSAGE })
    .regex(/^[1-9][0-9]*$/, LIMIT_MESSAGE)
    .transform(Number)
    .refine((n) => n <= 100, LIMIT_MESSAGE)
    .optional(),
  // Content (including empty) is checked by the cursor codec → INVALID_CURSOR.
  cursor: z.string({ error: "Must be a single cursor string" }).optional(),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

/**
 * Field name → first problem, for `details.fields` in VALIDATION_ERROR.
 * Uses a Map so client-controlled keys like "__proto__" are recorded rather than
 * colliding with Object.prototype.
 */
function toFields(error: z.ZodError): Record<string, string> {
  const fields = new Map<string, string>();
  const add = (key: string, message: string) => {
    if (!fields.has(key)) fields.set(key, message);
  };
  for (const issue of error.issues) {
    if (issue.code === "unrecognized_keys") {
      for (const key of issue.keys) add(key, "Unknown field");
      continue;
    }
    add(issue.path.length > 0 ? issue.path.join(".") : "body", issue.message);
  }
  return Object.fromEntries(fields);
}

export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new AppError("VALIDATION_ERROR", 400, "Request validation failed", { fields: toFields(result.error) });
}
