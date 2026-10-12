import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";
import type { TaskStore } from "../src/store/task-store.js";
import type { Priority, Status, Task } from "../src/types.js";

const NOW = "2026-10-12T09:30:00.000Z";

/** A seeder with its own counter, created per test so ids never depend on test order. */
function makeSeeder(store: TaskStore) {
  let counter = 0;
  return (overrides: Partial<Task> = {}): Task => {
    counter += 1;
    const { seq: _seq, ...task } = store.insert({
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    title: `Task ${counter}`,
    priority: "medium",
    status: "open",
    dueDate: null,
    createdAt: NOW,
    updatedAt: NOW,
      ...overrides,
    });
    return task;
  };
}

async function walk(app: Express, query: string): Promise<{ ids: string[]; pages: number }> {
  const ids: string[] = [];
  let cursor: string | null = null;
  let pages = 0;
  do {
    const qs: string = cursor === null ? query : `${query}&cursor=${encodeURIComponent(cursor)}`;
    const res = await request(app).get(`/api/v1/tasks?${qs}`);
    expect(res.status).toBe(200);
    ids.push(...res.body.items.map((t: Task) => t.id));
    cursor = res.body.nextCursor;
    pages += 1;
  } while (cursor !== null);
  return { ids, pages };
}

describe("GET /api/v1/tasks", () => {
  let store: TaskStore;
  let app: Express;
  let seed: ReturnType<typeof makeSeeder>;
  beforeEach(() => {
    store = createInMemoryStore();
    app = createApp({ store });
    seed = makeSeeder(store);
  });

  it("returns an empty list with a null nextCursor when there are no tasks", async () => {
    const res = await request(app).get("/api/v1/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], nextCursor: null });
  });

  it("returns tasks oldest first in the contract shape", async () => {
    const a = seed();
    const b = seed({ priority: "high", dueDate: "2026-12-01" });
    const res = await request(app).get("/api/v1/tasks");
    expect(res.body.items).toEqual([a, b]);
    expect(res.body.nextCursor).toBeNull();
  });

  it("defaults to pages of 20", async () => {
    for (let i = 0; i < 25; i++) seed();
    const res = await request(app).get("/api/v1/tasks");
    expect(res.body.items).toHaveLength(20);
    expect(typeof res.body.nextCursor).toBe("string");
  });

  it("accepts the maximum limit of 100", async () => {
    for (let i = 0; i < 101; i++) seed();
    const res = await request(app).get("/api/v1/tasks?limit=100");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(100);
    expect(typeof res.body.nextCursor).toBe("string");
  });

  it("visits every task exactly once when following nextCursor", async () => {
    const created = Array.from({ length: 7 }, () => seed().id);
    const { ids, pages } = await walk(app, "limit=3");
    expect(ids).toEqual(created);
    expect(pages).toBe(3);
  });

  it("applies status and priority filters before paginating", async () => {
    const wanted: string[] = [];
    const shapes: Array<[Status, Priority]> = [
      ["open", "high"], ["done", "high"], ["open", "low"], ["open", "high"], ["done", "low"], ["open", "high"],
    ];
    for (const [status, priority] of shapes) {
      const t = seed({ status, priority });
      if (status === "open" && priority === "high") wanted.push(t.id);
    }
    const { ids } = await walk(app, "status=open&priority=high&limit=1");
    expect(ids).toEqual(wanted);
  });

  it.each([
    ["limit=0", "limit", "Must be an integer from 1 to 100"],
    ["limit=101", "limit", "Must be an integer from 1 to 100"],
    ["limit=ten", "limit", "Must be an integer from 1 to 100"],
    ["status=archived", "status", "Must be one of: open, done"],
    ["priority=urgent", "priority", "Must be one of: low, medium, high"],
    ["sort=title", "sort", "Unknown field"],
    ["limit=5&limit=6", "limit", "Must be an integer from 1 to 100"],
    ["status=open&status=done", "status", "Must be one of: open, done"],
    ["cursor=a&cursor=b", "cursor", "Must be a single cursor string"],
  ])("returns 400 VALIDATION_ERROR for ?%s", async (qs, field, message) => {
    const res = await request(app).get(`/api/v1/tasks?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.fields[field]).toBe(message);
  });

  it.each([
    ["empty", ""],
    ["not base64 JSON", "%%%"],
    ["an unsigned payload a client built", Buffer.from(JSON.stringify({ v: 1, seq: 1 })).toString("base64url")],
    ["signed with a different secret", "eyJ2IjoxLCJzZXEiOjF9.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"],
  ])("returns 400 INVALID_CURSOR in the error envelope for a cursor that is %s", async (_label, cursor) => {
    const res = await request(app).get(`/api/v1/tasks?cursor=${encodeURIComponent(cursor)}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: "INVALID_CURSOR", message: "Cursor is invalid; use nextCursor from a previous response" },
    });
  });

  it("returns 400 INVALID_CURSOR for a genuine cursor with trailing junk appended", async () => {
    for (let i = 0; i < 3; i++) seed();
    const first = await request(app).get("/api/v1/tasks?limit=1");
    const res = await request(app).get(`/api/v1/tasks?cursor=${encodeURIComponent(`${first.body.nextCursor}!!!`)}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_CURSOR");
  });

  it("rejects a cursor issued by a different server instance", async () => {
    for (let i = 0; i < 3; i++) seed();
    const other = createApp({ store });
    const first = await request(other).get("/api/v1/tasks?limit=1");
    const res = await request(app).get(`/api/v1/tasks?cursor=${encodeURIComponent(first.body.nextCursor)}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_CURSOR");
  });

  it("accepts cursors across instances that share a cursorSecret", async () => {
    const secret = Buffer.alloc(32, 7);
    const a = createApp({ store, cursorSecret: secret });
    const b = createApp({ store, cursorSecret: secret });
    for (let i = 0; i < 3; i++) seed();
    const first = await request(a).get("/api/v1/tasks?limit=1");
    const res = await request(b).get(`/api/v1/tasks?limit=1&cursor=${encodeURIComponent(first.body.nextCursor)}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });
});
