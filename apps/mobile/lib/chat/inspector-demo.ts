// Deterministic byte/hex helpers for the crypto inspector's UI shell.
//
// IMPORTANT: these produce ILLUSTRATIVE bytes derived from a message id — they
// are NOT the literal frame that crossed the wire. The real inspector (v1)
// retains the actual { ciphertext, nonce, recipientDeviceId } at send time
// (crypto-inspector/DESIGN.md §11) and renders those. This shell uses stable
// stand-ins so the layout + reveal choreography can be built now; swap the data
// source in `<InspectScreen>` once frame retention lands. Never present these as
// "the exact bytes the server received".

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** Stable pseudo-random bytes for a seed. Illustrative only (see file note). */
export function deterministicBytes(seed: string, n: number): number[] {
  const rand = xmur3(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rand() & 0xff);
  return out;
}

function hex2(b: number): string {
  return b.toString(16).padStart(2, "0");
}

/** Group hex in 3-byte clusters, e.g. "9f2ac4 71bd0e 55..". */
export function groupHex(bytes: number[]): string {
  const clusters: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    clusters.push(
      bytes
        .slice(i, i + 3)
        .map(hex2)
        .join(""),
    );
  }
  return clusters.join(" ");
}

/** Short hex tag, e.g. nonce "c1a4…" or device short-id "3b9f…". */
export function shortHex(seed: string, nBytes = 2): string {
  return deterministicBytes(seed, nBytes).map(hex2).join("") + "…";
}

/** Classic hexdump slice for Pane C, e.g. "00000000: 53 51 4c 43 …". */
export function hexdumpLines(bytes: number[], cols = 8, lines = 3): string[] {
  const out: string[] = [];
  for (let row = 0; row < lines; row++) {
    const offset = (row * cols).toString(16).padStart(8, "0");
    const slice = bytes
      .slice(row * cols, row * cols + cols)
      .map(hex2)
      .join(" ");
    out.push(`${offset}: ${slice}`);
  }
  return out;
}
