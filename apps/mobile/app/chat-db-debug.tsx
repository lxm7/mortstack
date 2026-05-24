import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Crypto from "expo-crypto";
import { Button, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { getChatDb, outbox, type PendingOutboxRow } from "@repo/chat-db";
import {
  ChatCrypto,
  ED25519_PUBLIC_KEY_BYTES,
  SEED_BYTES,
  X25519_PUBLIC_KEY_BYTES,
} from "@repo/chat-crypto";
import { ChatMlsCore } from "@repo/chat-mls-core";
import {
  decryptInbound,
  encryptOutbound,
  type EncryptedIncomingMessage,
  type FanoutTarget,
  type OutboundEnvelope,
} from "@repo/chat";

import {
  getOrCreateChatIdentity,
  type ChatIdentity,
} from "@/lib/chat/identity";
import { getPeerDevices, type PeerDevice } from "@/lib/chat/peer-keys";
import { getMyAccount, type MyAccount } from "@/lib/account/me";
import { useChatConnectionState, useChatTransport } from "@/lib/chat/transport";

const CHAT_ID_TEST = "debug-chat";

function encodeUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function hex(bytes: Uint8Array | undefined, max = 16): string {
  if (!bytes) return "?";
  let s = "";
  const n = Math.min(bytes.length, max);
  for (let i = 0; i < n; i++) {
    s += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return bytes.length > max
    ? `${s}…(${bytes.length}B)`
    : `${s} (${bytes.length}B)`;
}

// Fingerprint convention for visual comparison across devices: first 8 bytes
// of the ed25519 pub. Matches what users would read off a contact-verify
// screen in the M4 chat UI.
function fp(pub: Uint8Array | undefined): string {
  return hex(pub, 8);
}

interface CipherSnapshot {
  envelope: OutboundEnvelope;
  text: string;
  textBytes: number;
}

interface WrongKeyOutcome {
  attempted: boolean;
  threw: boolean;
  message: string;
}

interface InboxEntry extends EncryptedIncomingMessage {
  receivedAt: number;
}

// Chunk 0/1 smoke harness — calls ChatMlsCore.ping() and renders the result.
// "ok" = the UniFFI XCFramework (iOS) / jniLibs (Android) loaded and the
// Swift/Kotlin → Rust FFI hop works end-to-end. Anything else = native module
// loaded but bridge fault; an exception = native module didn't load at all.
function MlsPingPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$1">
      <Text color="$color" fontSize="$4" fontWeight="600">
        chat-mls-core ping
      </Text>
      {result != null ? (
        <Text color="$color" fontSize="$2" selectable>
          ping() → {JSON.stringify(result)}{" "}
          {result === "ok" ? "✓" : "(unexpected payload)"}
        </Text>
      ) : (
        <Text color="$color" fontSize="$2">
          (tap to call)
        </Text>
      )}
      {err && (
        <Text color="red" fontSize="$2" selectable>
          {err}
        </Text>
      )}
      <XStack>
        <Button
          size="$2"
          onPress={() => {
            try {
              setErr(null);
              setResult(ChatMlsCore.ping());
            } catch (e) {
              setResult(null);
              setErr(String(e));
            }
          }}
        >
          Call ChatMlsCore.ping()
        </Button>
      </XStack>
    </YStack>
  );
}

export default function ChatDbDebug() {
  // ── Outbox panel (M2 — kept) ────────────────────────────────────────────
  const [rows, setRows] = useState<PendingOutboxRow[]>([]);
  const [keySource, setKeySource] = useState<string>("?");
  const [lastError, setLastError] = useState<string | null>(null);

  // ── M3 acceptance state ─────────────────────────────────────────────────
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);
  const [me, setMe] = useState<MyAccount | null>(null);
  const [meErr, setMeErr] = useState<string | null>(null);
  const [peerInput, setPeerInput] = useState("");
  const [peerDevices, setPeerDevices] = useState<PeerDevice[] | null>(null);
  const [peerErr, setPeerErr] = useState<string | null>(null);
  const [text, setText] = useState("hello bob from alice");
  const [chatId, setChatId] = useState(CHAT_ID_TEST);
  const [lastCipher, setLastCipher] = useState<CipherSnapshot | null>(null);
  const [wrongKey, setWrongKey] = useState<WrongKeyOutcome>({
    attempted: false,
    threw: false,
    message: "",
  });
  const [sendResults, setSendResults] = useState<string[]>([]);
  const [inbox, setInbox] = useState<InboxEntry[]>([]);

  const transport = useChatTransport();
  const connState = useChatConnectionState();
  const seenInbox = useRef(new Set<string>());

  // ── Loaders ────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    try {
      const { db, keySource: src } = await getChatDb();
      setKeySource(src);
      const due = await outbox.due(db, 100);
      setRows(due);
      setLastError(null);
    } catch (err) {
      setLastError(String(err));
    }
  }, []);

  const loadIdentity = useCallback(() => {
    getOrCreateChatIdentity()
      .then(setIdentity)
      .catch(() => setIdentity(null));
  }, []);

  const loadMe = useCallback(() => {
    setMeErr(null);
    getMyAccount()
      .then(setMe)
      .catch((err: unknown) => {
        setMe(null);
        setMeErr(String(err));
      });
  }, []);

  useEffect(() => {
    refresh();
    loadIdentity();
    loadMe();
  }, [refresh, loadIdentity, loadMe]);

  // Live inbox — subscribe to decrypted message stream. The encrypted
  // transport already wires resolveSenderX25519Pubs to getPeerDevices so the
  // sender's pub lookup is automatic.
  useEffect(() => {
    return transport.onMessage((m) => {
      if (seenInbox.current.has(m.serverMsgId)) return;
      seenInbox.current.add(m.serverMsgId);
      setInbox((prev) =>
        [{ ...m, receivedAt: Date.now() }, ...prev].slice(0, 50),
      );
    });
  }, [transport]);

  // Ensure subscription updates when chatId changes.
  useEffect(() => {
    if (!chatId) return;
    transport.subscribe([chatId]);
  }, [chatId, transport]);

  // ── Outbox handlers (M2 — kept) ─────────────────────────────────────────
  const onEnqueue = useCallback(async () => {
    try {
      const { db } = await getChatDb();
      const id = Crypto.randomUUID();
      await outbox.enqueue(db, {
        id,
        chatId: CHAT_ID_TEST,
        payload: encodeUtf8(`hello-${Date.now()}`),
        idempotencyKey: id,
      });
      await refresh();
    } catch (err) {
      setLastError(String(err));
    }
  }, [refresh]);

  const onMarkFirstSent = useCallback(async () => {
    if (!rows[0]) return;
    try {
      const { db } = await getChatDb();
      await outbox.markSent(db, rows[0].id);
      await refresh();
    } catch (err) {
      setLastError(String(err));
    }
  }, [rows, refresh]);

  // ── M3 handlers ─────────────────────────────────────────────────────────

  const onLookupPeer = useCallback(async () => {
    setPeerErr(null);
    setPeerDevices(null);
    const id = peerInput.trim();
    if (!id) return;
    try {
      const map = await getPeerDevices([id]);
      setPeerDevices(map.get(id) ?? []);
    } catch (err) {
      setPeerErr(String(err));
    }
  }, [peerInput]);

  const peerTargets = useMemo<FanoutTarget[]>(() => {
    if (!peerDevices) return [];
    const id = peerInput.trim();
    if (!id) return [];
    return [{ accountId: id, devices: peerDevices }];
  }, [peerDevices, peerInput]);

  // Encrypt-only: shows the bytes that WOULD go over the wire, without
  // actually sending. Lets the harness prove ciphertext + nonce are opaque
  // and lets the wrong-key button operate on a known-good envelope.
  const onEncryptPreview = useCallback(() => {
    if (!identity) return;
    if (peerTargets.length === 0 || peerTargets[0]?.devices.length === 0) {
      setLastCipher(null);
      setWrongKey({ attempted: false, threw: false, message: "" });
      return;
    }
    const envs = encryptOutbound({
      text,
      seed: identity.seed,
      targets: peerTargets,
    });
    const first = envs[0];
    if (!first) return;
    setLastCipher({ envelope: first, text, textBytes: text.length });
    setWrongKey({ attempted: false, threw: false, message: "" });
  }, [identity, peerTargets, text]);

  const onWrongKeyDecrypt = useCallback(() => {
    if (!lastCipher) {
      setWrongKey({
        attempted: true,
        threw: false,
        message: "no cipher captured — run Encrypt preview first",
      });
      return;
    }
    const wrongSeed = ChatCrypto.generateIdentitySeed();
    try {
      decryptInbound({
        ciphertext: lastCipher.envelope.ciphertext,
        nonce: lastCipher.envelope.nonce,
        senderAccountId: me?.accountId ?? "",
        seed: wrongSeed,
        candidateSenderX25519Pubs: identity ? [identity.x25519Pub] : [],
      });
      setWrongKey({
        attempted: true,
        threw: false,
        message:
          "FAIL — wrong-key decrypt unexpectedly succeeded. Crypto broken?",
      });
    } catch (err) {
      setWrongKey({
        attempted: true,
        threw: true,
        message: `OK — threw as expected: ${String(err).slice(0, 100)}`,
      });
    }
  }, [identity, lastCipher, me?.accountId]);

  const onSend = useCallback(async () => {
    if (peerTargets.length === 0 || peerTargets[0]?.devices.length === 0) {
      setSendResults((prev) =>
        ["err: no peer devices — lookup peer first", ...prev].slice(0, 20),
      );
      return;
    }
    try {
      const results = await transport.send({
        chatId,
        text,
        targets: peerTargets,
      });
      setSendResults((prev) =>
        [
          `ok ${results.length} cipher(s):`,
          ...results.map(
            (r) =>
              `  → device ${r.recipientDeviceId.slice(0, 8)} · srv ${r.serverMsgId} · ${new Date(r.ts).toLocaleTimeString()}`,
          ),
          ...prev,
        ].slice(0, 20),
      );
    } catch (err) {
      setSendResults((prev) =>
        [`err: ${String(err).slice(0, 120)}`, ...prev].slice(0, 20),
      );
    }
  }, [chatId, peerTargets, text, transport]);

  if (!__DEV__) {
    return (
      <YStack f={1} bg="$background" ai="center" jc="center">
        <Text color="$color">Not available in production.</Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      f={1}
      bg="$background"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      showsVerticalScrollIndicator
    >
      <YStack p="$4" gap="$3">
        <Text color="$color" fontSize="$7" fontWeight="700">
          chat-db debug · M3 acceptance
        </Text>
        <Text color="$color" fontSize="$2">
          ws state: {connState}
        </Text>

        {/* ── Chunk 0/1: chat-mls-core native bridge smoke ───────────── */}
        <MlsPingPanel />

        {/* ── M3: My identity ─────────────────────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$1">
          <Text color="$color" fontSize="$4" fontWeight="600">
            my identity
          </Text>
          {meErr ? (
            <Text color="red" fontSize="$2">
              account.me: {meErr}
            </Text>
          ) : (
            <Text color="$color" fontSize="$2" selectable>
              accountId: {me?.accountId ?? "loading…"}
            </Text>
          )}
          <Text color="$color" fontSize="$2" selectable>
            deviceId: {identity?.deviceId ?? "?"}
          </Text>
          <Text color="$color" fontSize="$2">
            ed25519 fp: {fp(identity?.ed25519Pub)}
          </Text>
          <Text color="$color" fontSize="$2">
            x25519 fp: {fp(identity?.x25519Pub)}
          </Text>
        </YStack>

        {/* ── M3: Peer lookup ─────────────────────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$2">
          <Text color="$color" fontSize="$4" fontWeight="600">
            peer lookup
          </Text>
          <Input
            value={peerInput}
            onChangeText={setPeerInput}
            placeholder="peer accountId (cuid)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <XStack gap="$2">
            <Button size="$2" onPress={onLookupPeer}>
              Lookup peer
            </Button>
          </XStack>
          {peerErr ? (
            <Text color="red" fontSize="$2">
              {peerErr}
            </Text>
          ) : null}
          {peerDevices ? (
            peerDevices.length === 0 ? (
              <Text color="$color" fontSize="$2">
                no devices for that accountId
              </Text>
            ) : (
              <YStack gap="$1">
                {peerDevices.map((d) => (
                  <Text key={d.deviceId} color="$color" fontSize="$2">
                    {d.deviceId.slice(0, 8)} · ed {fp(d.ed25519Pub)} · x{" "}
                    {fp(d.x25519Pub)}
                  </Text>
                ))}
              </YStack>
            )
          ) : null}
        </YStack>

        {/* ── M3: Encrypt preview + wrong-key ─────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$2">
          <Text color="$color" fontSize="$4" fontWeight="600">
            encrypt preview (no send)
          </Text>
          <Input
            value={text}
            onChangeText={setText}
            placeholder="plaintext"
            autoCapitalize="none"
          />
          <XStack gap="$2" flexWrap="wrap">
            <Button
              size="$2"
              onPress={onEncryptPreview}
              disabled={!identity || peerTargets[0]?.devices.length === 0}
            >
              Encrypt preview
            </Button>
            <Button
              size="$2"
              onPress={onWrongKeyDecrypt}
              disabled={!lastCipher}
            >
              Try wrong-key decrypt
            </Button>
          </XStack>
          {lastCipher ? (
            <YStack gap="$1">
              <Text color="$color" fontSize="$2">
                {`last text: "${lastCipher.text}" (${lastCipher.textBytes} chars)`}
              </Text>
              <Text color="$color" fontSize="$2">
                cipher: {hex(lastCipher.envelope.ciphertext, 12)}
              </Text>
              <Text color="$color" fontSize="$2">
                nonce: {hex(lastCipher.envelope.nonce, 8)}
              </Text>
              <Text color="$color" fontSize="$2">
                → {lastCipher.envelope.recipientAccountId.slice(0, 8)} · device{" "}
                {lastCipher.envelope.recipientDeviceId.slice(0, 8)}
              </Text>
            </YStack>
          ) : null}
          {wrongKey.attempted ? (
            <Text
              color={wrongKey.threw ? "green" : "red"}
              fontSize="$2"
              fontWeight="600"
            >
              {wrongKey.message}
            </Text>
          ) : null}
          {identity ? (
            <Text color="$color" fontSize="$1">
              sizes: SEED={SEED_BYTES} · ED_PUB={ED25519_PUBLIC_KEY_BYTES} ·
              X_PUB={X25519_PUBLIC_KEY_BYTES}
            </Text>
          ) : null}
        </YStack>

        {/* ── M3: Send via encrypted transport ────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$2">
          <Text color="$color" fontSize="$4" fontWeight="600">
            send via encrypted transport
          </Text>
          <Input
            value={chatId}
            onChangeText={setChatId}
            placeholder="chatId"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <XStack gap="$2">
            <Button size="$2" onPress={onSend}>
              {`Send "${text.slice(0, 24)}"`}
            </Button>
            <Button size="$2" onPress={() => transport.subscribe([chatId])}>
              Subscribe
            </Button>
          </XStack>
          <YStack gap="$1">
            {sendResults.map((line, i) => (
              <Text key={i} color="$color" fontSize="$2">
                {line}
              </Text>
            ))}
          </YStack>
        </YStack>

        {/* ── M3: Live decrypted inbox ────────────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$2">
          <Text color="$color" fontSize="$4" fontWeight="600">
            live inbox · {inbox.length}
          </Text>
          {inbox.length === 0 ? (
            <Text color="$color" fontSize="$2">
              waiting for inbound messages…
            </Text>
          ) : (
            <YStack gap="$2">
              {inbox.map((m) => (
                <YStack
                  key={m.serverMsgId}
                  bg="$background"
                  p="$2"
                  borderRadius="$2"
                  gap="$1"
                >
                  <Text color="$color" fontSize="$3" fontWeight="600">
                    {m.frame.text}
                  </Text>
                  <Text color="$color" fontSize="$1">
                    from {m.senderId.slice(0, 8)} · chat {m.chatId.slice(0, 8)}{" "}
                    · srv {m.serverMsgId} ·{" "}
                    {new Date(m.ts).toLocaleTimeString()}
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>

        {/* M3.5 panels (signal prekey directory smoke + chat-version
            sticky + v=2 send harness) removed per ADR-015. MLS-equivalent
            panels (KeyPackage pool, current group epoch, ratchet tree hash)
            land in Chunk 6 with the mobile MLS orchestrator. */}

        {/* ── M2: Outbox (existing) ───────────────────────────────────── */}
        <YStack bg="$backgroundHover" p="$3" borderRadius="$3" gap="$2">
          <Text color="$color" fontSize="$4" fontWeight="600">
            outbox (M2)
          </Text>
          <Text color="$color" fontSize="$2">
            keySource: {keySource} · due rows: {rows.length}
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            <Button size="$2" onPress={onEnqueue}>
              Enqueue
            </Button>
            <Button size="$2" onPress={onMarkFirstSent} disabled={!rows[0]}>
              Mark first sent
            </Button>
            <Button size="$2" onPress={refresh}>
              List due
            </Button>
          </XStack>
          {lastError ? (
            <Text color="red" fontSize="$2">
              err: {lastError}
            </Text>
          ) : null}
          {rows.map((r) => (
            <YStack
              key={r.id}
              bg="$background"
              p="$2"
              borderRadius="$2"
              gap="$1"
            >
              <Text color="$color" fontSize="$1">
                {r.id.slice(0, 8)} · idemp {r.idempotency_key.slice(0, 8)} ·
                attempts {r.attempts}
              </Text>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
