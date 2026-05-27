// Chat list screen — the M4 "Chats" tab. Renders chats from the store
// (populated by chat.list on auth + transport reconnect). Tap row → thread;
// tap + button → New Chat picker.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Button, Spinner, Text, View, YStack, XStack } from "tamagui";

import { useChats, useChatStore, type ChatRecord } from "@repo/chat";

import { getMyAccount } from "@/lib/account/me";

function initials(text: string | null): string {
  if (!text) return "?";
  const trimmed = text.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

// Deterministic background colour for the avatar circle. Hash the
// accountId into a small palette of raw hex values — the project's Tamagui
// config doesn't ship the standard $red/$blue/etc. shade tokens.
const AVATAR_HUES = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#ec4899", // pink
  "#a855f7", // purple
];

const ERROR_COLOR = "#dc2626";

function avatarHue(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[h % AVATAR_HUES.length] ?? "#3b82f6";
}

function chatTitle(chat: ChatRecord, myAccountId: string | null): string {
  if (chat.kind === "group") {
    if (chat.name && chat.name.trim()) return chat.name;
    // Default group name: comma-joined handles of other members.
    const handles = chat.members
      .filter((m) => m.accountId !== myAccountId)
      .map((m) => m.handle ?? m.displayName ?? "?");
    return handles.join(", ") || "Group";
  }
  const peer = chat.members.find((m) => m.accountId !== myAccountId);
  return peer?.handle ?? peer?.displayName ?? "Direct chat";
}

function chatAvatarSeed(chat: ChatRecord, myAccountId: string | null): string {
  if (chat.kind === "group") return chat.id;
  const peer = chat.members.find((m) => m.accountId !== myAccountId);
  return peer?.accountId ?? chat.id;
}

interface ChatRowProps {
  chat: ChatRecord;
  myAccountId: string | null;
  onPress: (chatId: string) => void;
}

function ChatRow({ chat, myAccountId, onPress }: ChatRowProps) {
  const title = chatTitle(chat, myAccountId);
  const hue = avatarHue(chatAvatarSeed(chat, myAccountId));
  const lastMessage = useChatStore((s) => {
    const list = s.messages.get(chat.id);
    return list?.[list.length - 1] ?? null;
  });

  return (
    <Pressable onPress={() => onPress(chat.id)}>
      <XStack
        px="$4"
        py="$3"
        gap="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderColor="$borderColor"
        backgroundColor="$background"
      >
        <View
          width={48}
          height={48}
          borderRadius={24}
          style={{ backgroundColor: hue }}
          alignItems="center"
          justifyContent="center"
        >
          <Text color="white" fontSize="$5" fontWeight="600">
            {initials(title)}
          </Text>
        </View>
        <YStack flex={1} gap="$1">
          <Text fontSize="$5" fontWeight="600" numberOfLines={1}>
            {title}
          </Text>
          <Text fontSize="$3" color="$placeholderColor" numberOfLines={1}>
            {lastMessage?.text ??
              (chat.kind === "group" ? "New group" : "Tap to message")}
          </Text>
        </YStack>
      </XStack>
    </Pressable>
  );
}

export default function ChatsScreen() {
  const router = useRouter();
  const { chats, isLoading, error } = useChats();
  const me = useMyAccountId();

  const onOpenChat = useCallback(
    (chatId: string) => {
      // expo-router typed routes regenerate after first build with the new
      // files; cast until then.
      router.push(`/chat/${chatId}` as never);
    },
    [router],
  );

  const onNewChat = useCallback(() => {
    router.push("/chat/new" as never);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ChatRecord }) => (
      <ChatRow chat={item} myAccountId={me} onPress={onOpenChat} />
    ),
    [me, onOpenChat],
  );

  const empty = useMemo(() => {
    if (isLoading) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
          <Spinner />
          <Text color="$placeholderColor">Loading chats…</Text>
        </YStack>
      );
    }
    if (error) {
      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$2"
          px="$4"
        >
          <Text color={ERROR_COLOR}>Couldn’t load chats</Text>
          <Text color="$placeholderColor" textAlign="center" fontSize="$2">
            {error}
          </Text>
        </YStack>
      );
    }
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Text fontSize="$6" fontWeight="600">
          No chats yet
        </Text>
        <Text color="$placeholderColor">Start one to message a peer.</Text>
        <Button size="$3" onPress={onNewChat} mt="$2">
          New chat
        </Button>
      </YStack>
    );
  }, [isLoading, error, onNewChat]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        px="$4"
        py="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize="$7" fontWeight="700">
          Chats
        </Text>
        <Button size="$3" onPress={onNewChat}>
          + New
        </Button>
      </XStack>
      <View flex={1}>
        {chats.length === 0 ? (
          empty
        ) : (
          <FlashList
            data={chats}
            keyExtractor={(c) => c.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </YStack>
  );
}

// Tiny hook that loads the caller's accountId once and caches it. Used to
// distinguish "me" vs peers when rendering chat titles.
function useMyAccountId(): string | null {
  const [accountId, setAccountId] = useMemoState<string | null>(null);
  // useMemo + a one-shot async load — keeps the hook synchronous-feeling.
  useOnce(async () => {
    try {
      const me = await getMyAccount();
      setAccountId(me.accountId);
    } catch {
      // unauthenticated — leave null
    }
  });
  return accountId;
}

function useMemoState<T>(initial: T) {
  return useState<T>(initial);
}

function useOnce(fn: () => Promise<void>) {
  // Stable ref so the effect can call the latest closure without re-running.
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    void fnRef.current();
  }, []);
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
