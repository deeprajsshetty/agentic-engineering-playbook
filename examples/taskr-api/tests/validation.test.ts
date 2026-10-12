import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createInMemoryStore } from "../src/store/in-memory.js";

describe("validation details (CONTRACT §2, §3)", () => {
  let app: Express;
  beforeEach(() => {
    app = createApp({ store: createInMemoryStore() });
  });

  it("names a __proto__ query parameter in details.fields", async () => {
    const res = await request(app).get("/api/v1/tasks?__proto__=x");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(res.body.error.details.fields)).toEqual(["__proto__"]);
  });

  it("names a __proto__ body key in details.fields", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Content-Type", "application/json")
      .send('{"title":"t","__proto__":{"polluted":true}}');
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details.fields)).toEqual(["__proto__"]);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("counts title length in code points, so 200 emoji are accepted and 201 are not", async () => {
    const ok = await request(app).post("/api/v1/tasks").send({ title: "🙂".repeat(200) });
    expect(ok.status).toBe(201);
    const tooLong = await request(app).post("/api/v1/tasks").send({ title: "🙂".repeat(201) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.details.fields.title).toBe("Must be at most 200 characters");
  });
});
