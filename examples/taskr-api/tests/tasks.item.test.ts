import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";
import type { Task } from "../src/types.js";

const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

describe("GET and PATCH /api/v1/tasks/:id", () => {
  let app: Express;
  let clock: number;
  let task: Task;

  beforeEach(async () => {
    clock = Date.parse("2026-10-12T09:00:00.000Z");
    app = createApp({ store: createInMemoryStore(), now: () => new Date(clock) });
    const res = await request(app)
      .post("/api/v1/tasks")
      .send({ title: "Original", priority: "low", dueDate: "2026-11-01" });
    task = res.body;
    clock += 60_000; // later requests happen one minute after creation
  });

  describe("GET", () => {
    it("returns 200 with the task", async () => {
      const res = await request(app).get(`/api/v1/tasks/${task.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(task);
    });

    it("returns 404 TASK_NOT_FOUND for an unknown id", async () => {
      const res = await request(app).get(`/api/v1/tasks/${UNKNOWN_ID}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: { code: "TASK_NOT_FOUND", message: "Task not found" } });
    });

    it("returns 404 TASK_NOT_FOUND for an id that isn't a UUID", async () => {
      const res = await request(app).get("/api/v1/tasks/not-a-uuid");
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("TASK_NOT_FOUND");
    });
  });

  describe("PATCH", () => {
    const patch = (id: string, body: unknown) => request(app).patch(`/api/v1/tasks/${id}`).send(body as object);

    it("updates the given fields, keeps the others, and bumps updatedAt", async () => {
      const res = await patch(task.id, { title: "Renamed", status: "done" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...task,
        title: "Renamed",
        status: "done",
        updatedAt: "2026-10-12T09:01:00.000Z",
      });
      expect(res.body.createdAt).toBe(task.createdAt);
    });

    it("persists the change for later reads", async () => {
      await patch(task.id, { priority: "high" });
      const res = await request(app).get(`/api/v1/tasks/${task.id}`);
      expect(res.body.priority).toBe("high");
    });

    it("clears dueDate when it is set to null", async () => {
      const res = await patch(task.id, { dueDate: null });
      expect(res.status).toBe(200);
      expect(res.body.dueDate).toBeNull();
    });

    it("makes a status change visible to the list filter", async () => {
      await patch(task.id, { status: "done" });
      const res = await request(app).get("/api/v1/tasks?status=done");
      expect(res.body.items.map((t: Task) => t.id)).toEqual([task.id]);
    });

    it("returns 400 VALIDATION_ERROR for an empty body", async () => {
      const res = await patch(task.id, {});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        details: { fields: { body: "Provide at least one of: title, priority, status, dueDate" } },
      });
    });

    it("returns 400 VALIDATION_ERROR for unknown or server-managed fields", async () => {
      const res = await patch(task.id, { title: "ok", createdAt: "2020-01-01T00:00:00.000Z" });
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual({ createdAt: "Unknown field" });
    });

    it("returns 400 VALIDATION_ERROR for invalid values", async () => {
      const res = await patch(task.id, { status: "archived", title: "" });
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual({
        status: "Must be one of: open, done",
        title: "Must not be empty",
      });
    });

    it("trims the title on update", async () => {
      const res = await patch(task.id, { title: "  Tidy  " });
      expect(res.body.title).toBe("Tidy");
    });

    it("returns 400 VALIDATION_ERROR for an impossible dueDate", async () => {
      const res = await patch(task.id, { dueDate: "2026-02-30" });
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual({ dueDate: "Must be a real calendar date" });
    });

    it("returns 400 VALIDATION_ERROR when the body is not an object", async () => {
      const res = await patch(task.id, ["title"]);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        details: { fields: { body: "Body must be a JSON object" } },
      });
    });

    it("returns 404 TASK_NOT_FOUND for an unknown id with a valid body", async () => {
      const res = await patch(UNKNOWN_ID, { title: "Nobody home" });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("TASK_NOT_FOUND");
    });

    it("does not change the task when validation fails", async () => {
      await patch(task.id, { title: "x".repeat(201) });
      const res = await request(app).get(`/api/v1/tasks/${task.id}`);
      expect(res.body).toEqual(task);
    });
  });
});
