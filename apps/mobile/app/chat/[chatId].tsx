// Thread screen — inverted FlashList of messages, Tamagui composer, Telegram-
// ish bubbles. Outgoing right (brand), incoming left (surface). Per-bubble
// timestamp + sender display (groups only). Optimistic send is M4-3's stub;
// M4-6 plugs in the actual MLS encrypt + transport.send + ACK reconciliation.

import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Input,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import {
  useChat,
  useMessages,
  useSendMessage,
  type Member,
  type Message,
} from "@repo/chat";

import { useAuthStore } from "@/store/auth";

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function statusIcon(status: Message["status"]): string {
  if (status === "sending") return "⌛";
  if (status === "failed") return "⚠︎";
  return "✓";
}

export default function ChatThreadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId: string }>();
  const chatId = params.chatId ?? "";
  const { chat } = useChat(chatId);
  const { messages } = useMessages(chatId);
  const { send } = useSendMessage();
  const myAuthUserId = useAuthStore((s) => s.session?.user.id ?? null);
  const [text, setText] = useState("");

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

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isMine={item.senderAuthUserId === myAuthUserId}
        isGroup={chat?.kind === "group"}
        sender={memberByAuthUserId.get(item.senderAuthUserId) ?? null}
      />
    ),
    [chat?.kind, memberByAuthUserId, myAuthUserId],
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
          <View width={60} />
        </XStack>

        <View flex={1}>
          {reversed.length === 0 ? (
            <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
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
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  isMine,
  isGroup,
  sender,
}: {
  message: Message;
  isMine: boolean;
  isGroup: boolean;
  sender: Member | null;
}) {
  return (
    <XStack
      px="$3"
      py="$1"
      justifyContent={isMine ? "flex-end" : "flex-start"}
    >
      <YStack
        maxWidth="80%"
        backgroundColor={isMine ? "$brand" : "$backgroundHover"}
        px="$3"
        py="$2"
        borderRadius="$4"
        gap="$1"
      >
        {!isMine && isGroup && (
          <Text fontSize="$1" color="$placeholderColor" fontWeight="600">
            {sender?.handle ?? sender?.displayName ?? "Unknown"}
          </Text>
        )}
        <Text color={isMine ? "white" : "$color"} fontSize="$4">
          {message.text}
        </Text>
        <XStack justifyContent="flex-end" gap="$1" alignItems="center">
          <Text
            fontSize="$1"
            color={isMine ? "rgba(255,255,255,0.7)" : "$placeholderColor"}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isMine && (
            <Text
              fontSize="$1"
              color={
                message.status === "failed"
                  ? "#ffd1d1"
                  : "rgba(255,255,255,0.85)"
              }
            >
              {statusIcon(message.status)}
            </Text>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingVertical: 8 },
});
