import { useCallback, useEffect, useState } from "react";
import * as Crypto from "expo-crypto";
import { YStack, XStack, Text, Button, ScrollView } from "tamagui";
import { getChatDb, outbox, type PendingOutboxRow } from "@repo/chat-db";

const CHAT_ID_TEST = "debug-chat";

function encodeUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export default function ChatDbDebug() {
  const [rows, setRows] = useState<PendingOutboxRow[]>([]);
  const [keySource, setKeySource] = useState<string>("?");
  const [lastError, setLastError] = useState<string | null>(null);

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

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  const onEnqueueDuplicate = useCallback(async () => {
    if (!rows[0]) return;
    try {
      const { db } = await getChatDb();
      await outbox.enqueue(db, {
        id: Crypto.randomUUID(),
        chatId: CHAT_ID_TEST,
        payload: encodeUtf8("dup"),
        idempotencyKey: rows[0].idempotency_key,
      });
      await refresh();
    } catch (err) {
      setLastError(String(err));
    }
  }, [rows, refresh]);

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

  if (!__DEV__) {
    return (
      <YStack f={1} bg="$background" ai="center" jc="center">
        <Text color="$color">Not available in production.</Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="$background" p="$4" gap="$3">
      <Text color="$color" fontSize="$7" fontWeight="700">
        chat-db debug
      </Text>
      <Text color="$color" fontSize="$3">
        keySource: {keySource} · due rows: {rows.length}
      </Text>

      <XStack gap="$2" flexWrap="wrap">
        <Button onPress={onEnqueue}>Enqueue</Button>
        <Button onPress={onEnqueueDuplicate} disabled={!rows[0]}>
          Enqueue dup (same idemp)
        </Button>
        <Button onPress={onMarkFirstSent} disabled={!rows[0]}>
          Mark first sent
        </Button>
        <Button onPress={refresh}>List due</Button>
      </XStack>

      {lastError ? (
        <Text color="red" fontSize="$3">
          err: {lastError}
        </Text>
      ) : null}

      <ScrollView f={1}>
        <YStack gap="$2">
          {rows.map((r) => (
            <YStack
              key={r.id}
              bg="$backgroundHover"
              p="$2"
              borderRadius="$2"
              gap="$1"
            >
              <Text color="$color" fontSize="$2">
                id: {r.id}
              </Text>
              <Text color="$color" fontSize="$2">
                idemp: {r.idempotency_key}
              </Text>
              <Text color="$color" fontSize="$2">
                attempts: {r.attempts} · next: {r.next_attempt_at}
              </Text>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
