// chat_mls_core — OpenMLS engine for Sessions chat.
//
// Engine surface lives in `engine.rs`. UniFFI scaffolding is set up here.
// Storage is in-memory (openmls_rust_crypto's MemoryStorage) for Chunk 2 —
// SQLCipher-backed persistence lands in Chunk 2.5 (see ADR-015 + the
// TaskCreate("Chunk 2.5 (future)") backlog item).

uniffi::setup_scaffolding!();

mod error;
mod engine;

pub use error::ChatMlsError;
pub use engine::*;

// Chunk 0/1 smoke — kept as a sanity probe for the native bridge. The mobile
// `ChatMlsCore.ping()` debug panel still calls this; remove once Chunk 6
// replaces the panel with KeyPackage / epoch / tree-hash readouts.
#[uniffi::export]
fn ping() -> String {
    "ok".to_string()
}
