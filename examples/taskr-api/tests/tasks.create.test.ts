import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";

const NOW = new Date("2026-10-12T09:30:00.000Z");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("POST /api/v1/tasks", () => {
  let app: Express;
  beforeEach(() => {
    app = createApp({ store: createInMemoryStore(), now: () => NOW });
  });

  const create = (body: unknown) => request(app).post("/api/v1/tasks").send(body as object);

  it("creates a task and returns 201 with the full contract shape", async () => {
    const res = await create({ title: "Write the contract", priority: "high", dueDate: "2026-10-31" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.stringMatching(UUID),
      title: "Write the contract",
      priority: "high",
      status: "open",
      dueDate: "2026-10-31",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
  });

  it("applies defaults: priority medium, dueDate null, status open", async () => {
    const res = await create({ title: "Defaults" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ priority: "medium", dueDate: null, status: "open" });
  });

  it("trims the title", async () => {
    const res = await create({ title: "  padded  " });
    expect(res.body.title).toBe("padded");
  });

  it("trims before checking length: a padded 200-character title is accepted, 201 is not", async () => {
    const ok = await create({ title: `  ${"x".repeat(200)}  ` });
    expect(ok.status).toBe(201);
    expect(ok.body.title).toHaveLength(200);
    const tooLong = await create({ title: `  ${"x".repeat(201)}  ` });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("accepts an explicit null dueDate", async () => {
    const res = await create({ title: "No deadline", dueDate: null });
    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeNull();
  });

  it("never returns internal store fields", async () => {
    const res = await create({ title: "No leaks" });
    expect(Object.keys(res.body).sort()).toEqual(
      ["createdAt", "dueDate", "id", "priority", "status", "title", "updatedAt"],
    );
  });

  it("returns 400 VALIDATION_ERROR when title is missing", async () => {
    const res = await create({ priority: "low" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { fields: { title: "Required" } } });
  });

  it("returns 400 VALIDATION_ERROR when title is blank or longer than 200 characters", async () => {
    const blank = await create({ title: "   " });
    expect(blank.body.error.details.fields.title).toBe("Must not be empty");
    const long = await create({ title: "x".repeat(201) });
    expect(long.status).toBe(400);
    expect(long.body.error.details.fields.title).toBe("Must be at most 200 characters");
  });

  it("returns 400 VALIDATION_ERROR for an unknown priority", async () => {
    const res = await create({ title: "t", priority: "urgent" });
    expect(res.status).toBe(400);
    expect(res.body.error.details.fields.priority).toBe("Must be one of: low, medium, high");
  });

  it("returns 400 VALIDATION_ERROR for a malformed or impossible dueDate", async () => {
    const malformed = await create({ title: "t", dueDate: "31/10/2026" });
    expect(malformed.body.error.details.fields.dueDate).toBe("Must be YYYY-MM-DD");
    const impossible = await create({ title: "t", dueDate: "2026-02-30" });
    expect(impossible.status).toBe(400);
    expect(impossible.body.error.details.fields.dueDate).toBe("Must be a real calendar date");
  });

  it("returns 400 VALIDATION_ERROR for unknown fields, including server-managed ones", async () => {
    const res = await create({ title: "t", status: "done", id: "mine" });
    expect(res.status).toBe(400);
    expect(res.body.error.details.fields).toEqual({ status: "Unknown field", id: "Unknown field" });
  });

  it("returns 400 VALIDATION_ERROR when the body is not an object", async () => {
    const res = await create(["not", "an", "object"]);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { fields: { body: "Body must be a JSON object" } } });
  });
});
