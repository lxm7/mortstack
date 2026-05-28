import ExpoModulesCore

public class ChatCallsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ChatCalls")

    Function("hello") {
      return "ChatCalls native (iOS) ready"
    }
  }
}
