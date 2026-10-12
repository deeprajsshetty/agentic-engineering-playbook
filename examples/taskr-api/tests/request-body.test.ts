import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";

const SOME_ID = "00000000-0000-4000-8000-000000000000";

describe("request bodies (CONTRACT §2, §4.2, §4.5, §4.7)", () => {
  let app: Express;
  beforeEach(() => {
    app = createApp({ store: createInMemoryStore() });
  });

  it.each([
    ["POST", "/api/v1/tasks"],
    ["PATCH", `/api/v1/tasks/${SOME_ID}`],
  ])("returns 400 INVALID_JSON for a malformed body on %s %s", async (method, path) => {
    const req = method === "POST" ? request(app).post(path) : request(app).patch(path);
    const res = await req.set("Content-Type", "application/json").send('{"title":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "INVALID_JSON", message: "Request body is not valid JSON" } });
  });

  it("returns 413 PAYLOAD_TOO_LARGE for a body over 100 kB, without logging a server error", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ title: "x".repeat(200_000) }));
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds 100 kB" } });
    expect(logged).not.toHaveBeenCalled();
    logged.mockRestore();
  });

  it("returns 415 UNSUPPORTED_MEDIA_TYPE for a non-UTF-8 charset", async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${SOME_ID}`)
      .set("Content-Type", "application/json; charset=latin9")
      .send('{"title":"a"}');
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 415 UNSUPPORTED_MEDIA_TYPE for an unsupported Content-Encoding", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "bogus")
      .send('{"title":"a"}');
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 413 PAYLOAD_TOO_LARGE on PATCH too", async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${SOME_ID}`)
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ title: "x".repeat(200_000) }));
    expect(res.status).toBe(413);
    expect(res.body.error).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
  });

  it.each([
    ["text/plain", "text/plain", "title=a"],
    ["form-urlencoded", "application/x-www-form-urlencoded", "title=a"],
    ["a JSON-suffixed vendor type", "application/vnd.api+json", '{"title":"a"}'],
    ["UTF-16 JSON", "application/json; charset=utf-16", '{"title":"a"}'],
  ])("returns 415 UNSUPPORTED_MEDIA_TYPE for %s", async (_label, type, body) => {
    const res = await request(app).post("/api/v1/tasks").set("Content-Type", type).send(body);
    expect(res.status).toBe(415);
    expect(res.body.error).toMatchObject({ code: "UNSUPPORTED_MEDIA_TYPE" });
  });

  it("returns 415 UNSUPPORTED_MEDIA_TYPE for a gzip-encoded body", async () => {
    const { gzipSync } = await import("node:zlib");
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "gzip")
      .send(gzipSync('{"title":"a"}'));
    expect(res.status).toBe(415);
    expect(res.body.error).toMatchObject({ code: "UNSUPPORTED_MEDIA_TYPE" });
  });

  it("accepts an explicit utf-8 charset", async () => {
    const res = await request(app).post("/api/v1/tasks").set("Content-Type", "application/json; charset=UTF-8").send('{"title":"a"}');
    expect(res.status).toBe(201);
  });

  it("reports an absent body (no Content-Type) under details.fields.body", async () => {
    const res = await request(app).post("/api/v1/tasks");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { fields: { body: "Body must be a JSON object" } } });
  });

  it.each(["null", "42", '"a string"'])("returns 400 VALIDATION_ERROR for the JSON primitive %s", async (body) => {
    const res = await request(app).post("/api/v1/tasks").set("Content-Type", "application/json").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { fields: { body: "Body must be a JSON object" } } });
  });

  it("ignores bodies on routes that don't accept one (unknown route stays 404 NOT_FOUND)", async () => {
    const res = await request(app).post("/nope").set("Content-Type", "application/json").send("{");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("ignores a malformed body on GET /api/v1/tasks", async () => {
    const res = await request(app).get("/api/v1/tasks").set("Content-Type", "application/json").send("{");
    expect(res.status).toBe(200);
  });
});
