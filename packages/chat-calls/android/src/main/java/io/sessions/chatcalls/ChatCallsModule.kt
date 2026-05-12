package io.sessions.chatcalls

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ChatCallsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ChatCalls")

    Function("hello") {
      "ChatCalls native (Android) ready"
    }
  }
}
