package io.sessions.chatdb

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ChatDbModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ChatDb")

    Function("hello") {
      "ChatDb native (Android) ready"
    }
  }
}
