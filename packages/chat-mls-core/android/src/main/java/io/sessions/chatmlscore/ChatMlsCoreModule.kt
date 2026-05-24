package io.sessions.chatmlscore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.chat_mls_core.ping as nativePing

// Expo bridge over the UniFFI-generated `ping()` from chat_mls_core. Chunk 0/1
// smoke only — proves the .so loads via JNA and the Kotlin→Rust FFI hop
// succeeds end-to-end. Real OpenMLS surface lands in Chunk 2.
//
// Aliasing `uniffi.chat_mls_core.ping` as `nativePing` avoids the generated
// symbol shadowing this class's own method name.
class ChatMlsCoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ChatMlsCore")

    // Sync Function — UniFFI ping() is a JNA call + small string copy, well
    // under a millisecond. AsyncFunction would only add bridge overhead.
    Function("ping") {
      nativePing()
    }
  }
}
