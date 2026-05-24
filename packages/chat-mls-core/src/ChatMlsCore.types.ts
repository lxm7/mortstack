// Type-only contracts for the native ChatMlsCore module. Surface intentionally
// minimal in Chunk 0/1 — only ping() is wired. Chunk 2 extends this once the
// OpenMLS engine is exposed via UniFFI.
export type ChatMlsCoreModuleEvents = Record<string, never>;
