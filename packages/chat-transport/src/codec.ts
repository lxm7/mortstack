import { decode, encode } from "@msgpack/msgpack";

import type { Envelope } from "./envelope";

// Centralised codec so the Worker and RN client never disagree on framing.
// Debug-friendly JSON mode is opt-in via env / build flag — production must
// use msgpack for size + speed.

export function encodeFrame(env: Envelope): Uint8Array {
  return encode(env);
}

export function decodeFrame(data: Uint8Array | ArrayBuffer): Envelope {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return decode(bytes) as Envelope;
}
