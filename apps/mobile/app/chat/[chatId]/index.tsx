// Thread screen — inverted FlashList of messages, Tamagui composer, Telegram-
// ish bubbles. Outgoing right (brand), incoming left (surface). Per-bubble
// timestamp + sender display (groups only). Long-press on a failed own
// bubble opens BubbleActionSheet (retry / delete).

import { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, Spinner, Text, View, XStack, YStack } from "tamagui";

import {
  useChat,
  useDeleteMessage,
  useMessages,
  useRetryMessage,
  useSendMessage,
  type Member,
  type Message,
} from "@repo/chat";

import { useAuthStore } from "@/store/auth";
import { BubbleActionSheet } from "@/lib/chat/components/BubbleActionSheet";
import { MessageBubble } from "@/lib/chat/components/MessageBubble";
import { trpc } from "@/lib/trpc/client";

export default function ChatThreadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId: string }>();
  const chatId = params.chatId ?? "";
  const { chat } = useChat(chatId);
  const { messages } = useMessages(chatId);
  const { send } = useSendMessage();
  const { retry } = useRetryMessage();
  const { delete: deleteMessage } = useDeleteMessage();
  const myAuthUserId = useAuthStore((s) => s.session?.user.id ?? null);
  const [text, setText] = useState("");
  const [sheetTarget, setSheetTarget] = useState<Message | null>(null);

  // Members lookup table for sender display in group chats.
  const memberByAuthUserId = useMemo(() => {
    const map = new Map<string, Member>();
    if (chat) for (const m of chat.members) map.set(m.authUserId, m);
    return map;
  }, [chat]);

  const onSend = useCallback(() => {
    if (!myAuthUserId) return;
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    send({ chatId, text: trimmed, senderAuthUserId: myAuthUserId });
    setText("");
  }, [text, send, chatId, myAuthUserId]);

  // FlashList renders inverted — newest at the visual bottom. Reverse the
  // oldest-first store array so the first rendered row is the newest.
  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  const handleLongPress = useCallback(
    (m: Message) => {
      const isMine = m.senderAuthUserId === myAuthUserId;
      // Own bubbles only open the sheet when failed (retry/delete). Other
      // users' bubbles always open it (report). Avoids a no-op animation
      // for sent/sending own rows that have no actions yet.
      if (isMine && m.status !== "failed") return;
      setSheetTarget(m);
    },
    [myAuthUserId],
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isMine={item.senderAuthUserId === myAuthUserId}
        isGroup={chat?.kind === "group"}
        sender={memberByAuthUserId.get(item.senderAuthUserId) ?? null}
        onLongPress={handleLongPress}
      />
    ),
    [chat?.kind, handleLongPress, memberByAuthUserId, myAuthUserId],
  );

  const title = useMemo(() => {
    if (!chat) return "Chat";
    if (chat.name) return chat.name;
    if (chat.kind === "direct") {
      const peer = chat.members.find((m) => m.authUserId !== myAuthUserId);
      return peer?.handle ?? peer?.displayName ?? "Direct chat";
    }
    const peers = chat.members
      .filter((m) => m.authUserId !== myAuthUserId)
      .map((m) => m.handle ?? m.displayName ?? "?");
    return peers.join(", ") || "Group";
  }, [chat, myAuthUserId]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <YStack flex={1} backgroundColor="$background">
        <XStack
          px="$3"
          py="$3"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <Button size="$2" chromeless onPress={() => router.back()}>
            ‹ Back
          </Button>
          <YStack alignItems="center" flex={1} mx="$2">
            <Text fontSize="$5" fontWeight="700" numberOfLines={1}>
              {title}
            </Text>
            {chat && chat.kind === "group" && (
              <Text fontSize="$1" color="$placeholderColor">
                {chat.members.length} members
              </Text>
            )}
          </YStack>
          <Button
            size="$2"
            chromeless
            disabled={!chat}
            onPress={() => router.push(`/chat/${chatId}/info` as never)}
          >
            Info
          </Button>
        </XStack>

        <View flex={1}>
          {reversed.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              {chat ? (
                <>
                  <Text fontSize="$5" fontWeight="600">
                    No messages yet
                  </Text>
                  <Text color="$placeholderColor" fontSize="$2">
                    Say hello
                  </Text>
                </>
              ) : (
                <Spinner />
              )}
            </YStack>
          ) : (
            <FlashList
              data={reversed}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              inverted
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        <XStack
          px="$3"
          py="$2"
          gap="$2"
          alignItems="center"
          borderTopWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
        >
          <Input
            flex={1}
            value={text}
            onChangeText={setText}
            placeholder="Message"
            autoCapitalize="sentences"
            multiline
            maxHeight={120}
            onSubmitEditing={onSend}
            blurOnSubmit={false}
          />
          <Button
            size="$3"
            disabled={text.trim().length === 0 || !myAuthUserId}
            opacity={text.trim().length === 0 ? 0.4 : 1}
            onPress={onSend}
          >
            Send
          </Button>
        </XStack>
      </YStack>
      <BubbleActionSheet
        message={sheetTarget}
        isMine={
          sheetTarget !== null && sheetTarget.senderAuthUserId === myAuthUserId
        }
        onClose={() => setSheetTarget(null)}
        onRetry={(m) =>
          void retry({ chatId: m.chatId, clientMsgId: m.clientMsgId })
        }
        onDelete={(m) =>
          void deleteMessage({ chatId: m.chatId, clientMsgId: m.clientMsgId })
        }
        onReport={(m, reason) => {
          // Fire-and-forget — UI returns to the thread immediately. The
          // backend already de-dupes identical (reporter, target, reason)
          // so accidental double-fires are safe.
          void trpc.reports.create
            .mutate({
              targetType: "MESSAGE",
              // serverSerial is the authoritative server id; clientMsgId
              // works for pending rows but those shouldn't be reportable.
              targetId: m.serverSerial ?? m.clientMsgId,
              reason,
            })
            .catch((err) => console.warn("[chat] report message failed", err));
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingVertical: 8 },
});
