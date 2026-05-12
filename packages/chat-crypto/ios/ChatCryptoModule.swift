import ExpoModulesCore

public class ChatCryptoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ChatCrypto")

    Function("hello") {
      return "ChatCrypto native (iOS) ready"
    }
  }
}
