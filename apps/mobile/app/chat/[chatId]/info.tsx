// Chat info screen — members list with add/remove/leave actions. Reached
// via the Info button in the thread header. Group operations (add/remove)
// require the chat to be v=2 MLS; legacy v=1 chats show a disabled state.
//
// Authorisation: any member can add/remove/leave (M4-1 Q1c (a) — Telegram
// default). Roles can land in M8 if needed.

import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, Spinner, Text, View, XStack, YStack } from "tamagui";

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
const ERROR_COLOR = "#dc2626";

interface SearchedUser {
  accountId: string;
  handle: string;
  displayName: string;
}

export default function ChatInfoScreen() {
  const router = useRouter();
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
              router.replace("/chats" as never);
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
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Button size="$2" chromeless onPress={() => router.back()}>
          ‹ Back
        </Button>
        <Text fontSize="$5" fontWeight="700">
          Chat info
        </Text>
        <View width={60} />
      </XStack>

      <FlashList
        data={chat.members}
        keyExtractor={(m) => m.accountId}
        ListHeaderComponent={
          <YStack px="$4" py="$3" gap="$2">
            <Text fontSize="$6" fontWeight="700">
              {chat.name ?? (chat.kind === "direct" ? "Direct chat" : "Group")}
            </Text>
            <Text fontSize="$2" color="$placeholderColor">
              {chat.kind === "group"
                ? `Group · ${chat.members.length} members`
                : "Direct chat"}
            </Text>
            {error && (
              <Text fontSize="$2" color={ERROR_COLOR}>
                {error}
              </Text>
            )}
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
                <Text fontSize="$2" color="$placeholderColor">
                  Add members
                </Text>
                <Input
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by handle…"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searching ? (
                  <Spinner />
                ) : query.trim().length >= MIN_QUERY_LEN &&
                  results.length === 0 ? (
                  <Text fontSize="$2" color="$placeholderColor">
                    No matches (already in chat?)
                  </Text>
                ) : null}
                {results.map((u) => (
                  <Pressable
                    key={u.accountId}
                    onPress={() => void onAddMember(u)}
                  >
                    <XStack
                      bg="$backgroundHover"
                      px="$3"
                      py="$2"
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <YStack>
                        <Text fontWeight="600">{u.displayName}</Text>
                        <Text fontSize="$2" color="$placeholderColor">
                          @{u.handle}
                        </Text>
                      </YStack>
                      {pending === `add:${u.accountId}` ? (
                        <Spinner size="small" />
                      ) : (
                        <Text color="$brand">+ Add</Text>
                      )}
                    </XStack>
                  </Pressable>
                ))}
              </YStack>
            )}

            {/* Direct-chat-only T&S actions for the peer. App Store
                Guideline 1.2 — block + report must be one tap from the
                conversation view. */}
            {chat.kind === "direct" && otherMembers[0] && (
              <DirectChatTrustActions
                peer={otherMembers[0]}
                onBlocked={() => router.replace("/chats" as never)}
              />
            )}

            <Button
              size="$3"
              disabled={pending === "leave"}
              onPress={onLeave}
              style={{ backgroundColor: ERROR_COLOR }}
            >
              {pending === "leave" ? (
                <Spinner size="small" />
              ) : (
                <Text color="white" fontWeight="700">
                  Leave chat
                </Text>
              )}
            </Button>

            {otherMembers.length === 0 && chat.kind === "direct" && (
              <Text fontSize="$2" color="$placeholderColor" textAlign="center">
                The other member left.
              </Text>
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
          <Spinner size="small" />
        ) : (
          <Text>Report user</Text>
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
          <Spinner size="small" />
        ) : (
          <Text color={ERROR_COLOR}>Block user</Text>
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
  return (
    <XStack
      px="$4"
      py="$3"
      gap="$3"
      alignItems="center"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <View
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        style={{ backgroundColor: "#3b82f6" }}
      >
        <Text color="white" fontWeight="600">
          {(member.handle ?? member.displayName ?? "?")
            .slice(0, 2)
            .toUpperCase()}
        </Text>
      </View>
      <YStack flex={1}>
        <Text fontSize="$4" fontWeight="600">
          {member.displayName ?? member.handle ?? "Unknown"}
          {isMe ? " (you)" : ""}
        </Text>
        {member.handle && (
          <Text fontSize="$2" color="$placeholderColor">
            @{member.handle}
          </Text>
        )}
      </YStack>
      {canRemove && (
        <Button size="$2" chromeless disabled={isPending} onPress={onRemove}>
          {isPending ? (
            <Spinner size="small" />
          ) : (
            <Text color={ERROR_COLOR}>Remove</Text>
          )}
        </Button>
      )}
    </XStack>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
