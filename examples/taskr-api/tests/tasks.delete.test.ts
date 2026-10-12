import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";
import type { Task } from "../src/types.js";

describe("DELETE /api/v1/tasks/:id", () => {
  let app: Express;
  let ids: string[];

  beforeEach(async () => {
    app = createApp({ store: createInMemoryStore() });
    ids = [];
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post("/api/v1/tasks").send({ title: `Task ${i}` });
      ids.push(res.body.id);
    }
  });

  it("returns 204 with an empty body", async () => {
    const res = await request(app).delete(`/api/v1/tasks/${ids[0]}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
  });

  it("removes the task from reads and from the list", async () => {
    await request(app).delete(`/api/v1/tasks/${ids[1]}`);
    const get = await request(app).get(`/api/v1/tasks/${ids[1]}`);
    expect(get.status).toBe(404);
    const list = await request(app).get("/api/v1/tasks");
    expect(list.body.items.map((t: Task) => t.id)).toEqual(ids.filter((_, i) => i !== 1));
  });

  it("returns 404 TASK_NOT_FOUND when deleting the same task twice", async () => {
    await request(app).delete(`/api/v1/tasks/${ids[2]}`);
    const res = await request(app).delete(`/api/v1/tasks/${ids[2]}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "TASK_NOT_FOUND", message: "Task not found" } });
  });

  it("keeps pagination stable when tasks are deleted mid-walk (CONTRACT AC4)", async () => {
    const first = await request(app).get("/api/v1/tasks?limit=2");
    expect(first.body.items.map((t: Task) => t.id)).toEqual([ids[0], ids[1]]);

    // Delete the last task already seen and the next task not yet seen.
    await request(app).delete(`/api/v1/tasks/${ids[1]}`);
    await request(app).delete(`/api/v1/tasks/${ids[2]}`);

    const seen: string[] = [];
    let cursor: string | null = first.body.nextCursor;
    while (cursor !== null) {
      const res = await request(app).get(`/api/v1/tasks?limit=2&cursor=${encodeURIComponent(cursor)}`);
      expect(res.status).toBe(200);
      seen.push(...res.body.items.map((t: Task) => t.id));
      cursor = res.body.nextCursor;
    }
    expect(seen).toEqual([ids[3], ids[4]]);
  });
});
