// Chat thread — Glacier / App-Light "Frozen Light reading room" (chat/DESIGN.md).
// Full-bleed message list with sticky day-dividers, incoming avatars, outgoing
// gradient bubbles, and a pinned Composer. Long-press any bubble → actions menu
// (Copy · Delete/Report · Inspect encryption → crypto inspector).

import { useCallback, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Spinner, XStack, YStack, useTheme } from "tamagui";

import {
  useChat,
  useDeleteMessage,
  useMessages,
  useRetryMessage,
  useSendMessage,
  type Member,
  type Message,
} from "@repo/chat";
import { Avatar } from "@repo/ui/glacier/avatar";
import { ChatBubble, DayDivider } from "@repo/ui/glacier/chat-bubble";
import { Composer } from "@repo/ui/glacier/composer";
import { HeadlineMd, BodyMd, Meta, Title } from "@repo/ui/glacier/typography";

import { useAuthStore } from "@/store/auth";
import { MessageActionsSheet } from "@/lib/chat/components/MessageActionsSheet";
import { trpc } from "@/lib/trpc/client";

function formatTime(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function dayLabel(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  if (sameDay(ms, now.getTime())) return `Today, ${formatTime(ms)}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Row =
  | { type: "divider"; id: string; label: string }
  | {
      type: "message";
      id: string;
      message: Message;
      isMine: boolean;
      isLastInRun: boolean;
      isFirstInRun: boolean;
      sender: Member | null;
    };

export default function ChatThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
  const listRef = useRef<FlashListRef<Row>>(null);

  const isGroup = chat?.kind === "group";
  const memberByAuthUserId = useMemo(() => {
    const map = new Map<string, Member>();
    if (chat) for (const m of chat.members) map.set(m.authUserId, m);
    return map;
  }, [chat]);

  // Flatten messages → rows with day-dividers + same-sender run metadata.
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (let i = 0; i < messages.length; i++) {
      const cur = messages[i]!;
      const prev = messages[i - 1];
      const next = messages[i + 1];
      if (!prev || !sameDay(prev.createdAt, cur.createdAt)) {
        out.push({
          type: "divider",
          id: `d-${cur.id}`,
          label: dayLabel(cur.createdAt),
        });
      }
      const prevRun =
        !!prev &&
        prev.senderAuthUserId === cur.senderAuthUserId &&
        sameDay(prev.createdAt, cur.createdAt);
      const nextRun =
        !!next &&
        next.senderAuthUserId === cur.senderAuthUserId &&
        sameDay(next.createdAt, cur.createdAt);
      out.push({
        type: "message",
        id: cur.id,
        message: cur,
        isMine: cur.senderAuthUserId === myAuthUserId,
        isFirstInRun: !prevRun,
        isLastInRun: !nextRun,
        sender: memberByAuthUserId.get(cur.senderAuthUserId) ?? null,
      });
    }
    return out;
  }, [messages, myAuthUserId, memberByAuthUserId]);

  const onSend = useCallback(() => {
    if (!myAuthUserId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    send({ chatId, text: trimmed, senderAuthUserId: myAuthUserId });
    setText("");
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
  }, [text, send, chatId, myAuthUserId]);

  const onInspect = useCallback(
    (m: Message) => {
      const msgId = m.serverSerial ?? m.clientMsgId;
      router.push(`/chat/${chatId}/inspect/${msgId}` as never);
    },
    [router, chatId],
  );

  const title = useMemo(() => {
    if (!chat) return "Chat";
    if (chat.name) return chat.name;
    if (chat.kind === "direct") {
      const peer = chat.members.find((m) => m.authUserId !== myAuthUserId);
      return peer?.handle ?? peer?.displayName ?? "Direct chat";
    }
    return (
      chat.members
        .filter((m) => m.authUserId !== myAuthUserId)
        .map((m) => m.handle ?? m.displayName ?? "?")
        .join(", ") || "Group"
    );
  }, [chat, myAuthUserId]);

  const ovc = theme.onSurfaceVariant?.val;

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.type === "divider") return <DayDivider label={item.label} />;
      const { message: m, isMine, isLastInRun, isFirstInRun, sender } = item;
      const senderName =
        isGroup && !isMine && isFirstInRun
          ? (sender?.handle ?? sender?.displayName ?? "Unknown")
          : null;
      const receipt =
        isMine && m.status === "sent" ? (
          <Feather name="check" size={13} color={ovc} />
        ) : null;

      const bubble = (
        <ChatBubble
          text={m.text}
          outgoing={isMine}
          timestamp={formatTime(m.createdAt)}
          showTimestamp={isLastInRun}
          sender={senderName}
          status={m.status}
          receipt={receipt}
          onRetryPress={() => setSheetTarget(m)}
        />
      );

      return (
        <Pressable onLongPress={() => setSheetTarget(m)} delayLongPress={300}>
          <YStack paddingHorizontal="$md" paddingTop={isFirstInRun ? "$sm" : 2}>
            {isMine ? (
              bubble
            ) : (
              <XStack gap="$xs" alignItems="flex-end">
                {isLastInRun ? (
                  <Avatar
                    size="sm"
                    name={sender?.handle ?? sender?.displayName ?? "?"}
                    seed={sender?.accountId}
                  />
                ) : (
                  <YStack width={32} />
                )}
                {bubble}
              </XStack>
            )}
          </YStack>
        </Pressable>
      );
    },
    [isGroup, ovc],
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <YStack
          paddingTop={insets.top}
          backgroundColor="$surface"
          borderBottomWidth={0.5}
          borderBottomColor="$outlineVariant"
        >
          <XStack height={56} px="$xs" alignItems="center">
            <IconButton
              label="Back"
              onPress={() => router.back()}
              icon={<Feather name="arrow-left" size={22} color={ovc} />}
            />
            <YStack flex={1} alignItems="center">
              <Title numberOfLines={1}>{title}</Title>
              {/* Presence is a static placeholder — no presence field on the
                  model yet. Group chats show member count instead. */}
              <Meta color="$onSurfaceVariant">
                {isGroup ? `${chat?.members.length ?? 0} members` : "online"}
              </Meta>
            </YStack>
            <IconButton
              label="Call"
              onPress={() => router.push(`/chat/${chatId}/info` as never)}
              icon={<Feather name="phone" size={20} color={ovc} />}
            />
          </XStack>
        </YStack>

        {/* Messages */}
        <YStack flex={1}>
          {rows.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$xs"
            >
              {chat ? (
                <>
                  <HeadlineMd>Say hello</HeadlineMd>
                  <BodyMd color="$onSurfaceVariant">
                    This conversation is end-to-end encrypted.
                  </BodyMd>
                </>
              ) : (
                <Spinner color="$primary" />
              )}
            </YStack>
          ) : (
            <FlashList
              ref={listRef}
              data={rows}
              keyExtractor={(r) => r.id}
              renderItem={renderItem}
              getItemType={(r) => r.type}
              maintainVisibleContentPosition={{
                startRenderingFromBottom: true,
                autoscrollToBottomThreshold: 0.2,
              }}
              contentContainerStyle={styles.listContent}
            />
          )}
        </YStack>

        {/* Composer */}
        <Composer
          value={text}
          onChangeText={setText}
          onSend={onSend}
          disabled={!myAuthUserId}
          bottomInset={insets.bottom}
          emojiIcon={<Feather name="smile" size={20} color={ovc} />}
          renderSendIcon={(active) => (
            <Feather
              name="send"
              size={20}
              color={active ? theme.primary?.val : theme.outlineVariant?.val}
            />
          )}
        />
      </YStack>

      <MessageActionsSheet
        message={sheetTarget}
        isMine={sheetTarget?.senderAuthUserId === myAuthUserId}
        onClose={() => setSheetTarget(null)}
        onRetry={(m) =>
          void retry({ chatId: m.chatId, clientMsgId: m.clientMsgId })
        }
        onDelete={(m) =>
          void deleteMessage({ chatId: m.chatId, clientMsgId: m.clientMsgId })
        }
        onInspect={onInspect}
        onReport={(m, reason) => {
          void trpc.reports.create
            .mutate({
              targetType: "MESSAGE",
              targetId: m.serverSerial ?? m.clientMsgId,
              reason,
            })
            .catch((err) => console.warn("[chat] report message failed", err));
        }}
      />
    </KeyboardAvoidingView>
  );
}

// Borderless 44×44 header icon button (search/back/call). Ghost Button carries a
// border; header chrome in the design is borderless, so this is a bare press.
function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <YStack
      width={44}
      height={44}
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      accessibilityLabel={label}
      pressStyle={{ backgroundColor: "$surfaceContainerLow" }}
      onPress={onPress}
    >
      {icon}
    </YStack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingVertical: 8 },
});
