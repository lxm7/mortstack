import { NativeModule, requireNativeModule } from "expo";

import type { ChatMlsCoreModuleEvents } from "./ChatMlsCore.types";

declare class ChatMlsCoreModule extends NativeModule<ChatMlsCoreModuleEvents> {
  // Chunk 0/1 smoke. Calls into the UniFFI-generated `ping()` exposed by the
  // chat_mls_core Rust crate. Returns the literal string "ok" iff the native
  // module loaded the xcframework (iOS) or jniLibs (Android) successfully.
  ping(): string;
}

export default requireNativeModule<ChatMlsCoreModule>("ChatMlsCore");
