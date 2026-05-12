import ExpoModulesCore

public class ChatDbModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ChatDb")

    Function("hello") {
      return "ChatDb native (iOS) ready"
    }
  }
}
