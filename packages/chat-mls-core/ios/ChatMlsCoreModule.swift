import ExpoModulesCore

// Expo bridge over the UniFFI-generated `ping()` from chat_mls_core. Chunk 0/1
// smoke only — proves the xcframework loads and the Swift→Rust FFI hop
// succeeds end-to-end. Real OpenMLS surface lands in Chunk 2 and replaces
// this module surface in one go.
//
// The generated Swift `func ping()` lives at file scope inside the same
// ChatMlsCore Swift module (see ChatMlsCore.podspec Sources/ glob), so no
// import is needed — direct call resolves.
//
// `definition()` body is a `@DefinitionBuilder` result-builder context — list
// components at the top level. Wrapping in `ModuleDefinition { ... }` is the
// wrong DSL form (and fails to compile because that initialiser is internal
// to ExpoModulesCore).
public class ChatMlsCoreModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ChatMlsCore")

    // Sync Function — UniFFI ping() is a non-blocking pointer load + string
    // copy, sub-microsecond. AsyncFunction would only add bridge overhead.
    Function("ping") { () -> String in
      return ping()
    }
  }
}
