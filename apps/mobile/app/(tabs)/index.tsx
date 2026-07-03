// Chat List — the conversations index ("Mortstack"). Glacier / App-Light.
// Anatomy (chat-list/DESIGN.md): app-name header + search, "Chats" section row
// + overflow, high-density ListRows, and a sticky full-width New Chat action
// bar in place of a tab bar.
//
// NOTE: ChatRecord/Message carry no unread count, read receipts or presence yet
// (see @repo/chat types), so rows render in the "read" state and show no badge/
// tick until the model grows those fields. Layout/type/token fidelity is full;
// the data-driven states light up automatically once backed.

import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Spinner, XStack, YStack, useTheme } from "tamagui";

import { useChats, useChatStore, type ChatRecord } from "@repo/chat";
import { HeadlineMd, BodyMd } from "@repo/ui/glacier/typography";
import { ListRow } from "@repo/ui/glacier/list-row";
import { Button } from "@repo/ui/glacier/button";

import { getMyAccount } from "@/lib/account/me";

function formatTime(ms: number): string {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function firstName(
  m: { handle: string | null; displayName: string | null } | undefined,
): string {
  const n = m?.handle ?? m?.displayName ?? "?";
  return n.split(/\s+/)[0] ?? n;
}

function chatTitle(chat: ChatRecord, myId: string | null): string {
  if (chat.kind === "group") {
    if (chat.name?.trim()) return chat.name;
    const others = chat.members
      .filter((m) => m.accountId !== myId)
      .map((m) => m.handle ?? m.displayName ?? "?");
    return others.join(", ") || "Group";
  }
  const peer = chat.members.find((m) => m.accountId !== myId);
  return peer?.handle ?? peer?.displayName ?? "Direct chat";
}

function chatSeed(chat: ChatRecord, myId: string | null): string {
  if (chat.kind === "group") return chat.id;
  return chat.members.find((m) => m.accountId !== myId)?.accountId ?? chat.id;
}

interface ChatRowProps {
  chat: ChatRecord;
  myId: string | null;
  onPress: (chatId: string) => void;
}

function ChatRow({ chat, myId, onPress }: ChatRowProps) {
  const title = chatTitle(chat, myId);
  const last = useChatStore((s) => {
    const list = s.messages.get(chat.id);
    return list?.[list.length - 1] ?? null;
  });

  let preview: string;
  if (!last) {
    preview = chat.kind === "group" ? "New group" : "Tap to message";
  } else if (chat.kind === "group") {
    const sender = chat.members.find(
      (m) => m.authUserId === last.senderAuthUserId,
    );
    preview = `${firstName(sender)}: ${last.text}`;
  } else {
    preview = last.text;
  }

  return (
    <ListRow
      name={title}
      preview={preview}
      timestamp={last ? formatTime(last.createdAt) : ""}
      avatar={{ name: title, seed: chatSeed(chat, myId) }}
      onPress={() => onPress(chat.id)}
    />
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { chats, isLoading, error } = useChats();
  const myId = useMyAccountId();

  const ovc = theme.onSurfaceVariant?.val;

  const onOpenChat = useCallback(
    (chatId: string) => router.push(`/chat/${chatId}` as never),
    [router],
  );
  const onNewChat = useCallback(
    () => router.push("/chat/new" as never),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatRecord }) => (
      <ChatRow chat={item} myId={myId} onPress={onOpenChat} />
    ),
    [myId, onOpenChat],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header — app name + search */}
      <YStack
        paddingTop={insets.top}
        backgroundColor="$surface"
        borderBottomWidth={0.5}
        borderBottomColor="$outlineVariant"
      >
        <XStack
          height={64}
          px={20}
          alignItems="center"
          justifyContent="space-between"
        >
          <HeadlineMd>Mortstack</HeadlineMd>
          <Button
            variant="ghost"
            borderWidth={0}
            width={44}
            height={44}
            p={0}
            accessibilityLabel="Search chats"
            icon={<Feather name="search" size={20} color={ovc} />}
          />
        </XStack>
      </YStack>

      {/* Section title */}
      <XStack
        px={20}
        pt="$md"
        pb="$xs"
        alignItems="center"
        justifyContent="space-between"
      >
        <HeadlineMd>Chats</HeadlineMd>
        <Button
          variant="ghost"
          borderWidth={0}
          width={44}
          height={44}
          p={0}
          accessibilityLabel="More options"
          icon={<Feather name="more-horizontal" size={20} color={ovc} />}
        />
      </XStack>

      {/* List / states */}
      <YStack flex={1}>
        {chats.length === 0 ? (
          isLoading ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$sm"
            >
              <Spinner color="$primary" />
              <BodyMd color="$onSurfaceVariant">Loading chats…</BodyMd>
            </YStack>
          ) : error ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$xs"
              px="$md"
            >
              <BodyMd color="$error">Couldn’t load chats</BodyMd>
              <BodyMd color="$onSurfaceVariant" textAlign="center">
                {error}
              </BodyMd>
            </YStack>
          ) : (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$xs"
              px="$md"
            >
              <HeadlineMd>No chats yet</HeadlineMd>
              <BodyMd color="$onSurfaceVariant" textAlign="center">
                Start one to message a peer, end-to-end encrypted.
              </BodyMd>
            </YStack>
          )
        ) : (
          <FlashList
            data={chats}
            keyExtractor={(c) => c.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </YStack>

      {/* Sticky New Chat action bar — replaces the tab bar */}
      <YStack
        backgroundColor="$surface"
        borderTopWidth={0.5}
        borderTopColor="$outlineVariant"
        paddingTop={12}
        paddingBottom={insets.bottom + 12}
        px={20}
      >
        <Button
          variant="primary"
          size="lg"
          br="$full"
          width="100%"
          onPress={onNewChat}
          icon={<Feather name="plus" size={20} color={theme.onPrimary?.val} />}
        >
          New Chat
        </Button>
      </YStack>
    </YStack>
  );
}

// Loads the caller's accountId once (to split "me" from peers in titles).
function useMyAccountId(): string | null {
  const [accountId, setAccountId] = useState<string | null>(null);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    getMyAccount()
      .then((me) => setAccountId(me.accountId))
      .catch(() => {
        /* unauthenticated — leave null */
      });
  }, []);
  return accountId;
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 4, paddingBottom: 12 },
});
