import { describe, expect, it } from "vitest";
import { createInMemoryStore } from "../src/store/in-memory.js";
import type { Task } from "../src/types.js";

const task: Task = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Only once",
  priority: "medium",
  status: "open",
  dueDate: null,
  createdAt: "2026-10-12T09:30:00.000Z",
  updatedAt: "2026-10-12T09:30:00.000Z",
};

describe("in-memory TaskStore", () => {
  it("refuses to insert a duplicate id instead of overwriting", () => {
    const store = createInMemoryStore();
    store.insert(task);
    expect(() => store.insert({ ...task, title: "Overwrite" })).toThrow("Duplicate task id");
    expect(store.get(task.id)?.title).toBe("Only once");
  });

  it("returns copies, so callers can't mutate stored state", () => {
    const store = createInMemoryStore();
    const inserted = store.insert(task);
    inserted.title = "mutated";
    expect(store.get(task.id)?.title).toBe("Only once");
  });
});
