// Chat info screen — members list with add/remove/leave actions. Reached
// via the Info button in the thread header. Group operations (add/remove)
// require the chat to be v=2 MLS; legacy v=1 chats show a disabled state.
//
// Authorisation: any member can add/remove/leave (M4-1 Q1c (a) — Telegram
// default). Roles can land in M8 if needed.

import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Button, Spinner, Text, View, XStack, YStack, useTheme } from "tamagui";
import { TextField } from "@repo/ui/glacier/text-field";
import { ListRow } from "@repo/ui/glacier/list-row";
import { Title, HeadlineMd, BodySm, Label } from "@repo/ui/glacier/typography";

import {
  useChat,
  useChatStore,
  type ChatRecord,
  type Member,
} from "@repo/chat";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/lib/trpc/client";
import { getMlsClient } from "@/lib/chat/mls-auto-publish";
import {
  resolveChatGroupId,
  clearChatGroupCache,
} from "@/lib/chat/group-resolver";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LEN = 2;

interface SearchedUser {
  accountId: string;
  handle: string;
  displayName: string;
}

export default function ChatInfoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const iconColor = theme.onSurfaceVariant.val;
  const params = useLocalSearchParams<{ chatId: string }>();
  const chatId = params.chatId ?? "";
  const { chat } = useChat(chatId);
  const myAuthUserId = useAuthStore((s) => s.session?.user.id ?? null);
  const upsertChat = useChatStore((s) => s.upsertChat);
  const removeChatFromStore = useChatStore((s) => s.removeChat);

  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── add-member picker (group only) ────────────────────────────────────
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!chat || chat.kind !== "group") {
      setResults([]);
      return;
    }
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const out = await trpc.user.search.query({
          query: trimmed,
          limit: 20,
        });
        // Filter out members who are already in the chat.
        const existing = new Set(chat.members.map((m) => m.accountId));
        setResults(out.users.filter((u) => !existing.has(u.accountId)));
      } catch (err) {
        console.warn("[chat-info] search failed", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, chat]);

  // ── refresh chat after a member change so the store reflects truth ────
  const refreshChat = useCallback(async () => {
    if (!chat) return;
    try {
      const updated = await trpc.chat.get.query({ chatId: chat.id });
      upsertChat(updated as ChatRecord);
    } catch (err) {
      console.warn("[chat-info] refreshChat failed", err);
    }
  }, [chat, upsertChat]);

  // ── add member ────────────────────────────────────────────────────────
  const onAddMember = useCallback(
    async (user: SearchedUser) => {
      if (!chat || pending) return;
      setPending(`add:${user.accountId}`);
      setError(null);
      try {
        const groupId = await resolveChatGroupId(chat.id);
        if (!groupId) {
          throw new Error(
            "Chat has no MLS group — members cannot be added on v=1 legacy chats",
          );
        }
        await trpc.chat.addMembers.mutate({
          chatId: chat.id,
          accountIds: [user.accountId],
        });
        const client = getMlsClient();
        if (!client) throw new Error("MLS client not ready");
        await client.addMembersByAccounts({
          groupId,
          accountIds: [user.accountId],
        });
        await refreshChat();
        setQuery("");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setPending(null);
      }
    },
    [chat, pending, refreshChat],
  );

  // ── remove member ─────────────────────────────────────────────────────
  const onRemoveMember = useCallback(
    (member: Member) => {
      if (!chat || pending) return;
      Alert.alert(
        `Remove ${member.handle ?? member.displayName ?? "this member"}?`,
        "They lose access to new messages immediately.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setPending(`remove:${member.accountId}`);
              setError(null);
              try {
                const groupId = await resolveChatGroupId(chat.id);
                if (!groupId) {
                  throw new Error("Chat has no MLS group");
                }
                await trpc.chat.removeMembers.mutate({
                  chatId: chat.id,
                  accountIds: [member.accountId],
                });
                const client = getMlsClient();
                if (!client) throw new Error("MLS client not ready");
                await client.removeMembersByAccounts({
                  groupId,
                  accountIds: [member.accountId],
                });
                await refreshChat();
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              } finally {
                setPending(null);
              }
            },
          },
        ],
      );
    },
    [chat, pending, refreshChat],
  );

  // ── leave chat ────────────────────────────────────────────────────────
  // Server-side: deletes the caller's ChatMember row. Locally: removes the
  // chat from the store + clears the MLS group cache. Self-removal from
  // the MLS group is a follow-up — the local engine still holds the
  // group state, but it's unreachable through the UI.
  const onLeave = useCallback(() => {
    if (!chat || pending) return;
    Alert.alert(
      `Leave ${chat.name ?? "this chat"}?`,
      "You won't receive new messages.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setPending("leave");
            setError(null);
            try {
              await trpc.chat.leave.mutate({ chatId: chat.id });
              removeChatFromStore(chat.id);
              clearChatGroupCache(chat.id);
              router.replace("/(tabs)" as never);
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
              setPending(null);
            }
          },
        },
      ],
    );
  }, [chat, pending, removeChatFromStore, router]);

  if (!chat) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </YStack>
    );
  }

  const otherMembers = chat.members.filter(
    (m) => m.authUserId !== myAuthUserId,
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        px="$3"
        py="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={0.5}
        borderColor="$outlineVariant"
      >
        <Button size="$2" chromeless onPress={() => router.back()}>
          <Text color="$primary" fontFamily="$body">
            ‹ Back
          </Text>
        </Button>
        <Title>Chat info</Title>
        <View width={60} />
      </XStack>

      <FlashList
        data={chat.members}
        keyExtractor={(m) => m.accountId}
        ListHeaderComponent={
          <YStack px="$4" py="$3" gap="$2">
            <HeadlineMd>
              {chat.name ?? (chat.kind === "direct" ? "Direct chat" : "Group")}
            </HeadlineMd>
            <BodySm color="$onSurfaceVariant">
              {chat.kind === "group"
                ? `Group · ${chat.members.length} members`
                : "Direct chat"}
            </BodySm>
            {error && <BodySm color="$error">{error}</BodySm>}
          </YStack>
        }
        renderItem={({ item }) => (
          <MemberRow
            member={item}
            isMe={item.authUserId === myAuthUserId}
            canRemove={
              chat.kind === "group" && item.authUserId !== myAuthUserId
            }
            isPending={pending === `remove:${item.accountId}`}
            onRemove={() => onRemoveMember(item)}
          />
        )}
        ListFooterComponent={
          <YStack px="$4" py="$3" gap="$3">
            {chat.kind === "group" && (
              <YStack gap="$2">
                <Label color="$onSurfaceVariant">Add members</Label>
                <TextField
                  icon={<Feather name="search" size={18} color={iconColor} />}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by handle…"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searching ? (
                  <Spinner color="$primary" />
                ) : query.trim().length >= MIN_QUERY_LEN &&
                  results.length === 0 ? (
                  <BodySm color="$onSurfaceVariant">
                    No matches (already in chat?)
                  </BodySm>
                ) : null}
                {results.map((u) => (
                  <ListRow
                    key={u.accountId}
                    name={u.displayName}
                    preview={`@${u.handle}`}
                    timestamp=""
                    avatar={{ name: u.handle, seed: u.accountId }}
                    receipt={
                      pending === `add:${u.accountId}` ? (
                        <Spinner size="small" color="$primary" />
                      ) : (
                        <Feather
                          name="user-plus"
                          size={18}
                          color={theme.primary.val}
                        />
                      )
                    }
                    onPress={() => void onAddMember(u)}
                  />
                ))}
              </YStack>
            )}

            {/* Direct-chat-only T&S actions for the peer. App Store
                Guideline 1.2 — block + report must be one tap from the
                conversation view. */}
            {chat.kind === "direct" && otherMembers[0] && (
              <DirectChatTrustActions
                peer={otherMembers[0]}
                onBlocked={() => router.replace("/(tabs)" as never)}
              />
            )}

            <Button
              size="$3"
              disabled={pending === "leave"}
              onPress={onLeave}
              backgroundColor="$error"
              pressStyle={{ backgroundColor: "$error", opacity: 0.85 }}
            >
              {pending === "leave" ? (
                <Spinner size="small" color="$onError" />
              ) : (
                <Text color="$onError" fontFamily="$body" fontWeight="700">
                  Leave chat
                </Text>
              )}
            </Button>

            {otherMembers.length === 0 && chat.kind === "direct" && (
              <BodySm color="$onSurfaceVariant" textAlign="center">
                The other member left.
              </BodySm>
            )}
          </YStack>
        }
        contentContainerStyle={styles.listContent}
      />
    </YStack>
  );
}

function DirectChatTrustActions({
  peer,
  onBlocked,
}: {
  peer: Member;
  onBlocked: () => void;
}) {
  const [busy, setBusy] = useState<"block" | "report" | null>(null);

  const onBlock = useCallback(() => {
    Alert.alert(
      `Block ${peer.displayName ?? peer.handle ?? "this user"}?`,
      "They won't be able to message you or find you in search. You'll need to unblock from Settings to reverse this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setBusy("block");
            try {
              await trpc.blocks.add.mutate({ accountId: peer.accountId });
              onBlocked();
            } catch (err) {
              console.warn("[chat-info] block failed", err);
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  }, [onBlocked, peer]);

  const onReport = useCallback(() => {
    // Simple reason prompt — single tap to file. The action sheet UX with
    // reason selection lives in BubbleActionSheet for message reports; for
    // a user-level report a default of HARASSMENT covers the common case
    // and the operator-side queue still gets the row.
    Alert.alert(
      `Report ${peer.displayName ?? peer.handle ?? "this user"}?`,
      "We'll review within 24 hours. Choose a reason:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Spam",
          onPress: () => void submitReport("SPAM"),
        },
        {
          text: "Harassment",
          onPress: () => void submitReport("HARASSMENT"),
        },
        {
          text: "Other",
          onPress: () => void submitReport("OTHER"),
        },
      ],
    );

    async function submitReport(reason: "SPAM" | "HARASSMENT" | "OTHER") {
      setBusy("report");
      try {
        await trpc.reports.create.mutate({
          targetType: "USER",
          targetId: peer.accountId,
          reason,
        });
        Alert.alert("Report received", "We'll review within 24 hours.");
      } catch (err) {
        console.warn("[chat-info] report failed", err);
      } finally {
        setBusy(null);
      }
    }
  }, [peer]);

  return (
    <XStack gap="$2">
      <Button
        flex={1}
        size="$3"
        chromeless
        disabled={busy !== null}
        onPress={onReport}
      >
        {busy === "report" ? (
          <Spinner size="small" color="$primary" />
        ) : (
          <Text color="$onSurface" fontFamily="$body">
            Report user
          </Text>
        )}
      </Button>
      <Button
        flex={1}
        size="$3"
        chromeless
        disabled={busy !== null}
        onPress={onBlock}
      >
        {busy === "block" ? (
          <Spinner size="small" color="$error" />
        ) : (
          <Text color="$error" fontFamily="$body">
            Block user
          </Text>
        )}
      </Button>
    </XStack>
  );
}

function MemberRow({
  member,
  isMe,
  canRemove,
  isPending,
  onRemove,
}: {
  member: Member;
  isMe: boolean;
  canRemove: boolean;
  isPending: boolean;
  onRemove: () => void;
}) {
  const name = member.displayName ?? member.handle ?? "Unknown";
  return (
    <ListRow
      name={`${name}${isMe ? " (you)" : ""}`}
      preview={member.handle ? `@${member.handle}` : ""}
      timestamp=""
      avatar={{
        name: member.handle ?? member.displayName ?? "?",
        seed: member.accountId,
      }}
      receipt={
        canRemove ? (
          isPending ? (
            <Spinner size="small" color="$error" />
          ) : (
            <Button size="$2" chromeless onPress={onRemove}>
              <Text color="$error" fontFamily="$body">
                Remove
              </Text>
            </Button>
          )
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
