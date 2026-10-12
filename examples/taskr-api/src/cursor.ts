import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "./errors.js";

/**
 * Opaque, signed pagination cursors (CONTRACT.md §2, §4.3).
 *
 * Format: base64url(JSON payload) "." base64url(HMAC-SHA256(secret, payload part)).
 * The payload holds the insertion sequence of the last task returned, so pages stay
 * stable when earlier tasks are deleted. The signature makes cursors tamper-evident:
 * clients can't construct, modify, or replay cursors from another server instance.
 */
interface CursorPayload {
  v: 1;
  seq: number;
}

export interface CursorCodec {
  encode(seq: number): string;
  /** Returns the sequence number, or throws AppError INVALID_CURSOR. */
  decode(cursor: string): number;
}

const b64 = (buf: Buffer) => buf.toString("base64url");

/** Rejects anything that isn't canonical base64url (Buffer.from silently drops bad characters). */
function strictBase64url(part: string): Buffer | undefined {
  const bytes = Buffer.from(part, "base64url");
  return part.length > 0 && b64(bytes) === part ? bytes : undefined;
}

export function createCursorCodec(secret: Buffer): CursorCodec {
  const sign = (payloadPart: string) => createHmac("sha256", secret).update(payloadPart).digest();

  return {
    encode(seq: number): string {
      const payload: CursorPayload = { v: 1, seq };
      const payloadPart = b64(Buffer.from(JSON.stringify(payload)));
      return `${payloadPart}.${b64(sign(payloadPart))}`;
    },

    decode(cursor: string): number {
      const invalid = new AppError("INVALID_CURSOR", 400, "Cursor is invalid; use nextCursor from a previous response");
      const parts = cursor.split(".");
      if (parts.length !== 2) throw invalid;
      const [payloadPart, signaturePart] = parts as [string, string];

      const payloadBytes = strictBase64url(payloadPart);
      const signature = strictBase64url(signaturePart);
      if (payloadBytes === undefined || signature === undefined) throw invalid;

      const expected = sign(payloadPart);
      if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) throw invalid;

      let payload: unknown;
      try {
        payload = JSON.parse(payloadBytes.toString("utf8"));
      } catch {
        throw invalid;
      }
      if (typeof payload !== "object" || payload === null || Array.isArray(payload)) throw invalid;
      const { v, seq, ...extra } = payload as Record<string, unknown>;
      if (v !== 1 || !Number.isSafeInteger(seq) || (seq as number) < 1 || Object.keys(extra).length > 0) throw invalid;
      return seq as number;
    },
  };
}
