import type { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";
import type { TaskStore } from "../src/store/task-store.js";

describe("GET /health", () => {
  let app: Express;
  beforeEach(() => {
    app = createApp({ store: createInMemoryStore() });
  });

  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 NOT_FOUND in the error envelope for an unknown path", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  it("returns 404 NOT_FOUND for an unsupported method on a known path", async () => {
    const res = await request(app).post("/health");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("unexpected failures", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns 500 INTERNAL_ERROR through the real app without leaking the cause", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing: TaskStore = {
      ...createInMemoryStore(),
      list: () => {
        throw new Error("connection to db-primary:5432 refused");
      },
    };
    const res = await request(createApp({ store: failing })).get("/api/v1/tasks");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
    expect(JSON.stringify(res.body)).not.toContain("5432");
    expect(logged).toHaveBeenCalledOnce();
  });
});
