import express, { Router, type Request, type RequestHandler } from "express";
import { AppError } from "../errors.js";
import { createTask, deleteTask, getTask, listTasks, updateTask, type TaskDeps } from "../services/tasks.js";
import { createTaskSchema, listTasksQuerySchema, parseOrThrow, updateTaskSchema } from "../validation.js";

/**
 * Bodies must be `application/json` in UTF-8 (CONTRACT §2). `req.is()` is `false` only when a
 * body is present with another media type; `null` (no body) falls through to validation.
 */
const requireJsonBody: RequestHandler = (req, _res, next) => {
  // A zero-length body is absent, not a wrong media type — let validation report it.
  if (req.get("content-length") === "0") {
    next();
    return;
  }
  if (req.is("application/json") === false) {
    next(new AppError("UNSUPPORTED_MEDIA_TYPE", 415, "Request body must be application/json"));
    return;
  }
  const charset = /;\s*charset=["']?([^;"'\s]+)/i.exec(req.get("content-type") ?? "")?.[1]?.toLowerCase();
  if (charset !== undefined && charset !== "utf-8" && charset !== "utf8") {
    next(new AppError("UNSUPPORTED_MEDIA_TYPE", 415, "Request body must be UTF-8 JSON"));
    return;
  }
  next();
};

/** HTTP layer for /api/v1/tasks: validate → one service call → status code. */
export function tasksRouter(deps: TaskDeps): Router {
  const router = Router({ caseSensitive: true });
  // Parse JSON only where the contract accepts a body (POST, PATCH). `strict: false` lets
  // primitives like `null` or `42` through to validation, which reports them as
  // VALIDATION_ERROR "Body must be a JSON object" — the same as arrays. `inflate: false`
  // rejects compressed bodies (415) so the 100 kB limit is the real wire size.
  const parseJson = express.json({ strict: false, limit: "100kb", inflate: false });
  // One middleware (guard, then parser) keeps Express's route-param typing intact.
  const jsonBody: RequestHandler = (req, res, next) => {
    requireJsonBody(req, res, (err?: unknown) => (err === undefined ? parseJson(req, res, next) : next(err)));
  };

  router.get("/", (req, res) => {
    const query = parseOrThrow(listTasksQuerySchema, req.query);
    res.json(listTasks(deps, query));
  });

  router.post("/", jsonBody, (req, res) => {
    const input = parseOrThrow(createTaskSchema, req.body);
    res.status(201).json(createTask(deps, input));
  });

  router.get("/:id", (req, res) => {
    res.json(getTask(deps, req.params.id));
  });

  router.patch("/:id", jsonBody, (req: Request<{ id: string }>, res) => {
    const input = parseOrThrow(updateTaskSchema, req.body);
    res.json(updateTask(deps, req.params.id, input));
  });

  router.delete("/:id", (req, res) => {
    deleteTask(deps, req.params.id);
    res.status(204).end();
  });

  return router;
}
