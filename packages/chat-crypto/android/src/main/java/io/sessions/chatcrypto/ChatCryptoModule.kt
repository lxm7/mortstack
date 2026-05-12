package io.sessions.chatcrypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ChatCryptoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ChatCrypto")

    Function("hello") {
      "ChatCrypto native (Android) ready"
    }
  }
}
