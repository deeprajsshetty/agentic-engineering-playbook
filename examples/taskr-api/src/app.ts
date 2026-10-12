import { randomBytes } from "node:crypto";
import express, { type ErrorRequestHandler, type Express, type RequestHandler } from "express";
import { createCursorCodec } from "./cursor.js";
import { AppError, errorBody } from "./errors.js";
import { tasksRouter } from "./routes/tasks.js";
import { createInMemoryStore } from "./store/in-memory.js";
import type { TaskStore } from "./store/task-store.js";

const routeNotFound = () => new AppError("NOT_FOUND", 404, "Route not found");

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(routeNotFound());
};

/**
 * CONTRACT §2: OPTIONS is unsupported (no CORS), and paths are exact — no trailing slash.
 * Runs before routers so Express's auto-OPTIONS and lenient matching never answer.
 */
const rejectUnsupported: RequestHandler = (req, _res, next) => {
  const trailingSlash = req.path.length > 1 && req.path.endsWith("/");
  next(req.method === "OPTIONS" || trailingSlash ? routeNotFound() : undefined);
};

/**
 * express.json() reports client-side body problems as errors carrying a `type`.
 * Map them to contract errors (CONTRACT §4.2, §4.5, §5) instead of a 500.
 */
const BODY_ERRORS: Record<string, AppError> = {
  "entity.parse.failed": new AppError("INVALID_JSON", 400, "Request body is not valid JSON"),
  "entity.too.large": new AppError("PAYLOAD_TOO_LARGE", 413, "Request body exceeds 100 kB"),
  "charset.unsupported": new AppError("UNSUPPORTED_MEDIA_TYPE", 415, "Request body must be UTF-8 JSON"),
  "encoding.unsupported": new AppError("UNSUPPORTED_MEDIA_TYPE", 415, "Unsupported Content-Encoding"),
};

function bodyError(err: unknown): AppError | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const type = (err as { type?: unknown }).type;
  return typeof type === "string" && Object.hasOwn(BODY_ERRORS, type) ? BODY_ERRORS[type] : undefined;
}

/** Express throws URIError for path parameters that can't be percent-decoded — such paths don't exist (CONTRACT §4.7). */
function knownError(err: unknown): AppError | undefined {
  if (err instanceof AppError) return err;
  if (err instanceof URIError) return routeNotFound();
  return bodyError(err);
}

// Express recognises error middleware by its four parameters.
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // If a response is already streaming we can't send an envelope; let Express close the connection.
  if (res.headersSent) {
    next(err);
    return;
  }
  const known = knownError(err);
  if (known !== undefined) {
    res.status(known.status).json(errorBody(known.code, known.message, known.details));
    return;
  }
  console.error(err);
  res.status(500).json(errorBody("INTERNAL_ERROR", "Something went wrong"));
};

export interface AppOptions {
  store?: TaskStore;
  now?: () => Date;
  /** Signs pagination cursors. Defaults to a random per-app secret; share one across instances behind a load balancer. */
  cursorSecret?: Buffer;
}

export function createApp(options: AppOptions = {}): Express {
  const store = options.store ?? createInMemoryStore();
  const now = options.now ?? (() => new Date());
  const cursors = createCursorCodec(options.cursorSecret ?? randomBytes(32));

  const app = express();
  // Settings must precede the first app.use(): Express 5 builds its router lazily from them.
  app.disable("x-powered-by");
  app.set("etag", false); // no conditional requests in v1 (CONTRACT §2)
  app.set("case sensitive routing", true);
  app.use(rejectUnsupported);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1/tasks", tasksRouter({ store, now, cursors }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
