import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AppError } from "../src/errors.js";
import { createCursorCodec } from "../src/cursor.js";

const SECRET = Buffer.alloc(32, 1);
const codec = createCursorCodec(SECRET);

/** Build a correctly signed cursor around an arbitrary payload, as an attacker who stole the secret could. */
function signed(payload: unknown): string {
  const part = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(part).digest("base64url");
  return `${part}.${sig}`;
}

function rejects(cursor: string): void {
  expect(() => codec.decode(cursor)).toThrow(AppError);
  try {
    codec.decode(cursor);
  } catch (err) {
    expect((err as AppError).code).toBe("INVALID_CURSOR");
  }
}

describe("cursor codec", () => {
  it("round-trips a sequence number", () => {
    expect(codec.decode(codec.encode(42))).toBe(42);
  });

  it("rejects a cursor whose signature was modified", () => {
    const c = codec.encode(5);
    rejects(`${c.slice(0, -2)}AA`);
  });

  it("rejects a cursor whose payload was modified", () => {
    const [, sig] = codec.encode(5).split(".");
    rejects(`${Buffer.from(JSON.stringify({ v: 1, seq: 1 })).toString("base64url")}.${sig}`);
  });

  it.each([
    ["extra keys", { v: 1, seq: 1, evil: true }],
    ["a wrong version", { v: 2, seq: 1 }],
    ["seq 0 (never issued)", { v: 1, seq: 0 }],
    ["a negative seq", { v: 1, seq: -1 }],
    ["a fractional seq", { v: 1, seq: 1.5 }],
    ["an array payload", [1, 1]],
  ])("rejects a correctly signed payload with %s", (_label, payload) => {
    rejects(signed(payload));
  });

  it("rejects non-canonical base64url", () => {
    rejects(`${codec.encode(3)}=`);
  });
});
