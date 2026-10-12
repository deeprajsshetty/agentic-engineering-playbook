import type { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";

const NOT_FOUND = { error: { code: "NOT_FOUND", message: "Route not found" } };

describe("routing edge cases (CONTRACT §2, §4.7)", () => {
  let app: Express;
  beforeEach(() => {
    app = createApp({ store: createInMemoryStore() });
  });
  afterEach(() => vi.restoreAllMocks());

  it.each(["/health", "/api/v1/tasks", "/api/v1/tasks/00000000-0000-4000-8000-000000000000"])(
    "returns 404 NOT_FOUND for OPTIONS %s",
    async (path) => {
      const res = await request(app).options(path);
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND);
    },
  );

  it("answers HEAD for every GET route with an empty body", async () => {
    const created = await request(app).post("/api/v1/tasks").send({ title: "Head me" });
    for (const path of ["/health", "/api/v1/tasks", `/api/v1/tasks/${created.body.id}`]) {
      const res = await request(app).head(path);
      expect(res.status, path).toBe(200);
      expect(res.text, path).toBeUndefined();
    }
  });

  it("answers HEAD for an unknown task id with 404 and no body", async () => {
    const res = await request(app).head("/api/v1/tasks/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
    expect(res.text).toBeUndefined();
  });

  it.each(["/HEALTH", "/health/", "/API/V1/TASKS", "/api/v1/tasks/", "/Api/v1/tasks"])(
    "returns 404 NOT_FOUND for the non-exact path %s",
    async (path) => {
      const res = await request(app).get(path);
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND);
    },
  );

  it("sends no ETag and ignores If-None-Match", async () => {
    const first = await request(app).get("/api/v1/tasks");
    expect(first.headers.etag).toBeUndefined();
    const again = await request(app).get("/api/v1/tasks").set("If-None-Match", 'W/"anything"');
    expect(again.status).toBe(200);
  });

  it.each(["GET", "PATCH", "DELETE"] as const)(
    "returns 404 NOT_FOUND, not 500, for an undecodable id on %s",
    async (method) => {
      const logged = vi.spyOn(console, "error").mockImplementation(() => {});
      const path = "/api/v1/tasks/%E0%A4%A";
      const req = method === "GET" ? request(app).get(path) : method === "PATCH" ? request(app).patch(path).send({ title: "x" }) : request(app).delete(path);
      const res = await req;
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND);
      expect(logged).not.toHaveBeenCalled();
    },
  );
});
