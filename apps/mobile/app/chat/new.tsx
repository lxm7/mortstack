// New Chat picker — Direct/Group toggle, handle search, multi-select for
// groups, submit → chat.create + MLS group provisioning → navigate to thread.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import {
  Button,
  Input,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import { trpc } from "@/lib/trpc/client";
import { createNewChat } from "@/lib/chat/create-chat";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LEN = 2;

interface SearchedUser {
  accountId: string;
  handle: string;
  displayName: string;
}

type Mode = "direct" | "group";

export default function NewChatScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("direct");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchedUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── debounced search ───────────────────────────────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const out = await trpc.user.search.query({ query: trimmed, limit: 20 });
        setResults(out.users);
      } catch (err) {
        console.warn("[new-chat] search failed", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // ── selection logic ─────────────────────────────────────────────────────
  const toggleSelect = useCallback(
    (user: SearchedUser) => {
      if (mode === "direct") {
        // Direct mode: tapping a user submits immediately.
        void submit([user]);
        return;
      }
      setSelected((prev) =>
        prev.some((u) => u.accountId === user.accountId)
          ? prev.filter((u) => u.accountId !== user.accountId)
          : [...prev, user],
      );
    },
    // submit added after definition; suppressing for now
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode],
  );

  const removeSelected = useCallback((accountId: string) => {
    setSelected((prev) => prev.filter((u) => u.accountId !== accountId));
  }, []);

  // ── submission ──────────────────────────────────────────────────────────
  const submit = useCallback(
    async (override?: SearchedUser[]) => {
      if (submitting) return;
      const peers = override ?? selected;
      if (peers.length === 0) return;
      setSubmitting(true);
      setError(null);
      try {
        const result = await createNewChat({
          kind: mode,
          name: mode === "group" && groupName.trim() ? groupName.trim() : null,
          memberAccountIds: peers.map((p) => p.accountId),
        });
        router.replace(`/chat/${result.chatId}` as never);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setSubmitting(false);
      }
    },
    [submitting, mode, selected, groupName, router],
  );

  const canSubmit = useMemo(() => {
    if (mode === "direct") return false; // direct submits on tap
    return selected.length > 0 && !submitting;
  }, [mode, selected.length, submitting]);

  const onModeChange = useCallback((next: Mode) => {
    setMode(next);
    setSelected([]);
    setGroupName("");
    setError(null);
  }, []);

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
        <Button size="$2" chromeless onPress={() => router.back()}>
          Cancel
        </Button>
        <Text fontSize="$5" fontWeight="700">
          New Chat
        </Text>
        <Button
          size="$2"
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.4}
          onPress={() => void submit()}
        >
          {submitting ? <Spinner size="small" /> : "Create"}
        </Button>
      </XStack>

      <XStack px="$4" py="$3" gap="$2">
        <ModeTab
          label="Direct"
          active={mode === "direct"}
          onPress={() => onModeChange("direct")}
        />
        <ModeTab
          label="Group"
          active={mode === "group"}
          onPress={() => onModeChange("group")}
        />
      </XStack>

      {mode === "group" && selected.length > 0 && (
        <YStack px="$4" gap="$2" pb="$2">
          <Text fontSize="$2" color="$placeholderColor">
            Selected ({selected.length})
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {selected.map((u) => (
              <Pressable
                key={u.accountId}
                onPress={() => removeSelected(u.accountId)}
              >
                <XStack
                  bg="$backgroundHover"
                  px="$2"
                  py="$1"
                  borderRadius="$3"
                  gap="$1"
                  alignItems="center"
                >
                  <Text fontSize="$3">{u.handle}</Text>
                  <Text fontSize="$3" color="$placeholderColor">
                    ×
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </XStack>
        </YStack>
      )}

      {mode === "group" && selected.length >= 2 && (
        <YStack px="$4" pb="$2">
          <Input
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Group name (optional)"
            maxLength={80}
          />
        </YStack>
      )}

      <YStack px="$4" pb="$2">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search by handle…"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
      </YStack>

      {error && (
        <YStack px="$4" pb="$2">
          <Text color="#dc2626" fontSize="$2">
            {error}
          </Text>
        </YStack>
      )}

      <View flex={1}>
        {searching ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <Spinner />
          </YStack>
        ) : query.trim().length < MIN_QUERY_LEN ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text color="$placeholderColor">
              Type at least {MIN_QUERY_LEN} characters
            </Text>
          </YStack>
        ) : results.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text color="$placeholderColor">No matches</Text>
          </YStack>
        ) : (
          <FlashList
            data={results}
            keyExtractor={(u) => u.accountId}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                isSelected={selected.some(
                  (s) => s.accountId === item.accountId,
                )}
                onPress={() => toggleSelect(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </YStack>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        px="$4"
        py="$2"
        borderRadius="$3"
        backgroundColor={active ? "$brand" : "$backgroundHover"}
      >
        <Text color={active ? "white" : "$color"} fontWeight="600">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function UserRow({
  user,
  isSelected,
  onPress,
}: {
  user: SearchedUser;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <XStack
        px="$4"
        py="$3"
        gap="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderColor="$borderColor"
        backgroundColor={isSelected ? "$backgroundHover" : "$background"}
      >
        <View
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="#3b82f6"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="white" fontWeight="600">
            {user.handle.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <YStack flex={1} gap="$1">
          <Text fontSize="$4" fontWeight="600">
            {user.displayName}
          </Text>
          <Text fontSize="$2" color="$placeholderColor">
            @{user.handle}
          </Text>
        </YStack>
        {isSelected && (
          <Text fontSize="$5" color="$brand">
            ✓
          </Text>
        )}
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
