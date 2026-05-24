// chat_mls_core — OpenMLS engine for Sessions chat.
//
// Chunk 0 scope: UniFFI bindgen smoke only. The single exported `ping()`
// proves that Rust → UniFFI → Swift/Kotlin works end-to-end on both
// platforms via scripts/build-mls.sh. OpenMLS is added in Chunk 2 once the
// binding pipeline is green.

uniffi::setup_scaffolding!();

#[uniffi::export]
fn ping() -> String {
    "ok".to_string()
}
