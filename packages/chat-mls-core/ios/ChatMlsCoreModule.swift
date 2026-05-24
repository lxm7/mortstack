import ExpoModulesCore

// Expo bridge over the UniFFI-generated `MlsEngine` from chat_mls_core.
// Holds a singleton `engine` instance — Function() calls dispatch through it.
//
// `definition()` body is a `@DefinitionBuilder` result-builder context — list
// components at the top level. Wrapping in `ModuleDefinition { ... }` is the
// wrong DSL form (and fails to compile because that initialiser is internal
// to ExpoModulesCore).
//
// The UniFFI-generated Swift surface (`MlsEngine`, `AddMembersResult`,
// `ProcessedKind`, `ChatMlsError`) lives at file scope inside this Swift
// module — see ChatMlsCore.podspec's Sources/ glob. Direct references resolve
// without explicit import.

private enum BridgeError: Error, LocalizedError {
  case engineNotInitialized
  case engineAccountMismatch(want: String, got: String)

  var errorDescription: String? {
    switch self {
    case .engineNotInitialized:
      return "ChatMlsCore: engine not initialised — call initEngine(accountId) first"
    case let .engineAccountMismatch(want, got):
      return "ChatMlsCore: engine bound to '\(got)', requested '\(want)' — call resetEngine() first"
    }
  }
}

public class ChatMlsCoreModule: Module {
  // Singleton engine for the active account on this install. Lazily set by
  // initEngine(); cleared by resetEngine(). Not thread-safe by itself —
  // Expo's Function() handlers serialise calls onto the module queue, so we
  // don't need an extra lock here.
  private var engine: MlsEngine?

  public func definition() -> ModuleDefinition {
    Name("ChatMlsCore")

    // ── Smoke probe (Chunk 0/1) ───────────────────────────────────────────
    Function("ping") { () -> String in
      return ping()
    }

    // ── Engine lifecycle ──────────────────────────────────────────────────

    Function("initEngine") {
      (accountId: String, identitySeed: Data) throws -> Void in
      if let existing = self.engine {
        let bound = existing.accountId()
        if bound == accountId { return }  // idempotent
        throw BridgeError.engineAccountMismatch(want: accountId, got: bound)
      }
      self.engine = try MlsEngine(accountId: accountId, identitySeed: identitySeed)
    }

    Function("engineAccountId") { () throws -> String in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      return e.accountId()
    }

    Function("resetEngine") { () -> Void in
      self.engine = nil
    }

    // ── KeyPackage publish ────────────────────────────────────────────────

    Function("createKeyPackage") { () throws -> Data in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      return try e.createKeyPackage()
    }

    // ── Group lifecycle ───────────────────────────────────────────────────

    Function("createGroup") { (groupId: Data) throws -> Void in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      try e.createGroup(groupId: groupId)
    }

    Function("addMembers") {
      (groupId: Data, keyPackages: [Data]) throws -> [String: Data] in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      let result = try e.addMembers(groupId: groupId, keyPackages: keyPackages)
      return ["commit": result.commit, "welcome": result.welcome]
    }

    Function("joinFromWelcome") { (welcomeBytes: Data) throws -> Data in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      return try e.joinFromWelcome(welcomeBytes: welcomeBytes)
    }

    // ── Application messages ──────────────────────────────────────────────

    Function("encryptApp") { (groupId: Data, plaintext: Data) throws -> Data in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      return try e.encryptApp(groupId: groupId, plaintext: plaintext)
    }

    // processMessage returns a tagged dictionary so the JS side can
    // discriminate on `kind` without parsing UniFFI's encoded enum. Mirrors
    // the ProcessedKind TS union in ChatMlsCore.types.ts.
    Function("processMessage") {
      (groupId: Data, msgBytes: Data) throws -> [String: Any] in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      let processed = try e.processMessage(groupId: groupId, msgBytes: msgBytes)
      switch processed {
      case let .application(plaintext):
        return ["kind": "application", "plaintext": plaintext]
      case .commitApplied:
        return ["kind": "commitApplied"]
      case .proposalQueued:
        return ["kind": "proposalQueued"]
      }
    }

    // ── Group state introspection ─────────────────────────────────────────
    //
    // currentEpoch is UInt64 in UniFFI; we widen to Double for JS Number
    // safety. Practical epochs stay well under 2^53.

    Function("currentEpoch") { (groupId: Data) throws -> Double in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      let n = try e.currentEpoch(groupId: groupId)
      return Double(n)
    }

    Function("memberCount") { (groupId: Data) throws -> Int in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      let n = try e.memberCount(groupId: groupId)
      return Int(n)
    }

    // ── State persistence (Chunk 2.5) ──────────────────────────────────────

    Function("dumpState") { () throws -> Data in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      return try e.dumpState()
    }

    Function("loadState") { (snapshot: Data) throws -> Void in
      guard let e = self.engine else { throw BridgeError.engineNotInitialized }
      try e.loadState(bytes: snapshot)
    }
  }
}
