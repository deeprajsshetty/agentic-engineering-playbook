import { randomUUID } from "node:crypto";
import type { CursorCodec } from "../cursor.js";
import { AppError } from "../errors.js";
import type { StoredTask, TaskChanges, TaskFilter, TaskStore } from "../store/task-store.js";
import type { Task } from "../types.js";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "../validation.js";

export interface TaskDeps {
  store: TaskStore;
  now: () => Date;
  cursors: CursorCodec;
}

/** Strip internal fields so responses match CONTRACT.md §3 exactly. */
function toTask(stored: StoredTask): Task {
  const { seq: _seq, ...task } = stored;
  return task;
}

export function createTask(deps: TaskDeps, input: CreateTaskInput): Task {
  const timestamp = deps.now().toISOString();
  const stored = deps.store.insert({
    id: randomUUID(),
    title: input.title,
    priority: input.priority ?? "medium",
    status: "open",
    dueDate: input.dueDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return toTask(stored);
}

const DEFAULT_LIMIT = 20;

export interface TaskList {
  items: Task[];
  nextCursor: string | null;
}

export function listTasks(deps: TaskDeps, query: ListTasksQuery): TaskList {
  const afterSeq = query.cursor === undefined ? 0 : deps.cursors.decode(query.cursor);
  const filter: TaskFilter = {};
  if (query.status !== undefined) filter.status = query.status;
  if (query.priority !== undefined) filter.priority = query.priority;

  const page = deps.store.list(filter, afterSeq, query.limit ?? DEFAULT_LIMIT);
  const last = page.items.at(-1);
  return {
    items: page.items.map(toTask),
    nextCursor: page.hasMore && last !== undefined ? deps.cursors.encode(last.seq) : null,
  };
}

function notFound(): AppError {
  return new AppError("TASK_NOT_FOUND", 404, "Task not found");
}

export function getTask(deps: TaskDeps, id: string): Task {
  const stored = deps.store.get(id);
  if (stored === undefined) throw notFound();
  return toTask(stored);
}

export function updateTask(deps: TaskDeps, id: string, input: UpdateTaskInput): Task {
  const changes: TaskChanges = { updatedAt: deps.now().toISOString() };
  if (input.title !== undefined) changes.title = input.title;
  if (input.priority !== undefined) changes.priority = input.priority;
  if (input.status !== undefined) changes.status = input.status;
  if (input.dueDate !== undefined) changes.dueDate = input.dueDate;

  const stored = deps.store.update(id, changes);
  if (stored === undefined) throw notFound();
  return toTask(stored);
}

export function deleteTask(deps: TaskDeps, id: string): void {
  if (!deps.store.delete(id)) throw notFound();
}
