import type { Priority, Status, Task } from "../types.js";

/** A task plus its insertion sequence number. `seq` is internal and never leaves the service layer. */
export interface StoredTask extends Task {
  seq: number;
}

export interface TaskFilter {
  status?: Status;
  priority?: Priority;
}

/** Fields a client may change (CONTRACT §4.5) plus the server-maintained updatedAt. */
export type TaskChanges = Partial<Pick<Task, "title" | "priority" | "status" | "dueDate">> & { updatedAt: string };

export interface TaskPage {
  items: StoredTask[];
  hasMore: boolean;
}

/** Storage boundary. Swap the implementation (e.g. Postgres) without touching routes or services. */
export interface TaskStore {
  /** Precondition: `task.id` is new. Implementations must throw on a duplicate id rather than overwrite. */
  insert(task: Task): StoredTask;
  /** Tasks matching `filter` with seq > afterSeq, in seq order, at most `limit`. */
  list(filter: TaskFilter, afterSeq: number, limit: number): TaskPage;
  get(id: string): StoredTask | undefined;
  /** Returns the updated task, or undefined if no task has this id. */
  update(id: string, changes: TaskChanges): StoredTask | undefined;
  /** Returns true if a task was deleted, false if no task has this id. */
  delete(id: string): boolean;
}
