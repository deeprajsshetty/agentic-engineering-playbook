import type { Task } from "../types.js";
import type { StoredTask, TaskChanges, TaskFilter, TaskPage, TaskStore } from "./task-store.js";

export function createInMemoryStore(): TaskStore {
  const tasks = new Map<string, StoredTask>();
  let nextSeq = 1;

  return {
    insert(task: Task): StoredTask {
      // Overwriting would give an existing Map entry a new seq and break list()'s seq ordering.
      if (tasks.has(task.id)) throw new Error(`Duplicate task id: ${task.id}`);
      const stored: StoredTask = { ...task, seq: nextSeq++ };
      tasks.set(stored.id, stored);
      return { ...stored };
    },

    list(filter: TaskFilter, afterSeq: number, limit: number): TaskPage {
      const matches: StoredTask[] = [];
      // Map iteration follows insertion order, which is seq order.
      for (const task of tasks.values()) {
        if (task.seq <= afterSeq) continue;
        if (filter.status !== undefined && task.status !== filter.status) continue;
        if (filter.priority !== undefined && task.priority !== filter.priority) continue;
        matches.push({ ...task });
        if (matches.length > limit) break;
      }
      return { items: matches.slice(0, limit), hasMore: matches.length > limit };
    },

    get(id: string): StoredTask | undefined {
      const task = tasks.get(id);
      return task === undefined ? undefined : { ...task };
    },

    update(id: string, changes: TaskChanges): StoredTask | undefined {
      const task = tasks.get(id);
      if (task === undefined) return undefined;
      const updated: StoredTask = { ...task, ...changes };
      tasks.set(id, updated);
      return { ...updated };
    },

    delete(id: string): boolean {
      return tasks.delete(id);
    },
  };
}
