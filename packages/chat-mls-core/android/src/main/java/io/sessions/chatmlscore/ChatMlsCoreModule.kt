package io.sessions.chatmlscore

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.chat_mls_core.AddMembersResult
import uniffi.chat_mls_core.MlsEngine
import uniffi.chat_mls_core.ProcessedKind
import uniffi.chat_mls_core.ping as nativePing

// Expo bridge over the UniFFI-generated MlsEngine. Holds a singleton engine
// instance — Function calls dispatch through it. Mirrors the Swift module's
// surface 1:1 so the shared TS contract typechecks against both platforms.

private class ChatMlsBridgeException(message: String) :
  CodedException("ERR_CHAT_MLS_CORE", message, null)

class ChatMlsCoreModule : Module() {
  // Singleton engine for the active account on this install. Lazily set by
  // initEngine(); cleared by resetEngine(). Not thread-safe by itself —
  // Expo's Function handlers serialise calls onto the module queue, so we
  // don't need an extra lock here.
  private var engine: MlsEngine? = null

  override fun definition() = ModuleDefinition {
    Name("ChatMlsCore")

    // ── Smoke probe (Chunk 0/1) ───────────────────────────────────────────
    Function("ping") {
      nativePing()
    }

    // ── Engine lifecycle ──────────────────────────────────────────────────

    Function("initEngine") { accountId: String, identitySeed: ByteArray ->
      val existing = engine
      if (existing != null) {
        val bound = existing.accountId()
        if (bound == accountId) return@Function  // idempotent
        throw ChatMlsBridgeException(
          "engine bound to '$bound', requested '$accountId' — call resetEngine() first",
        )
      }
      engine = MlsEngine(accountId, identitySeed)
    }

    Function("engineAccountId") {
      val e = engine ?: throw ChatMlsBridgeException(
        "engine not initialised — call initEngine(accountId) first",
      )
      e.accountId()
    }

    Function("resetEngine") {
      engine?.close()
      engine = null
    }

    // ── KeyPackage publish ────────────────────────────────────────────────

    Function("createKeyPackage") {
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.createKeyPackage()
    }

    // ── Group lifecycle ───────────────────────────────────────────────────

    Function("createGroup") { groupId: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.createGroup(groupId)
    }

    Function("addMembers") { groupId: ByteArray, keyPackages: List<ByteArray> ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      val result: AddMembersResult = e.addMembers(groupId, keyPackages)
      mapOf("commit" to result.commit, "welcome" to result.welcome)
    }

    Function("removeMembersByAccounts") { groupId: ByteArray, accountIds: List<String> ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.removeMembersByAccounts(groupId, accountIds)
    }

    Function("joinFromWelcome") { welcomeBytes: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.joinFromWelcome(welcomeBytes)
    }

    // ── Application messages ──────────────────────────────────────────────

    Function("encryptApp") { groupId: ByteArray, plaintext: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.encryptApp(groupId, plaintext)
    }

    // processMessage returns a tagged map so the JS side can discriminate on
    // `kind` without parsing UniFFI's encoded sealed class. Mirrors the
    // ProcessedKind TS union in ChatMlsCore.types.ts.
    Function("processMessage") { groupId: ByteArray, msgBytes: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      when (val processed = e.processMessage(groupId, msgBytes)) {
        is ProcessedKind.Application -> mapOf(
          "kind" to "application",
          "plaintext" to processed.plaintext,
        )
        is ProcessedKind.CommitApplied -> mapOf("kind" to "commitApplied")
        is ProcessedKind.ProposalQueued -> mapOf("kind" to "proposalQueued")
      }
    }

    // ── Group state introspection ─────────────────────────────────────────
    //
    // currentEpoch is ULong in UniFFI; widen to Double for JS Number safety
    // (practical epochs stay well under 2^53).

    Function("currentEpoch") { groupId: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.currentEpoch(groupId).toDouble()
    }

    Function("memberCount") { groupId: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.memberCount(groupId).toInt()
    }

    // ── State persistence (Chunk 2.5) ──────────────────────────────────────

    Function("dumpState") {
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.dumpState()
    }

    Function("loadState") { snapshot: ByteArray ->
      val e = engine ?: throw ChatMlsBridgeException("engine not initialised")
      e.loadState(snapshot)
    }
  }
}
