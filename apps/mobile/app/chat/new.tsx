// New Chat picker — Direct/Group toggle, handle search, multi-select for
// groups, submit → chat.create + MLS group provisioning → navigate to thread.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Button, Spinner, Text, View, XStack, YStack, useTheme } from "tamagui";
import { TextField } from "@repo/ui/glacier/text-field";
import { ListRow } from "@repo/ui/glacier/list-row";
import { Title, Label, BodyMd, BodySm } from "@repo/ui/glacier/typography";

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
  const theme = useTheme();
  const iconColor = theme.onSurfaceVariant.val;
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
        borderBottomWidth={0.5}
        borderColor="$outlineVariant"
      >
        <Button size="$2" chromeless onPress={() => router.back()}>
          <Text color="$onSurfaceVariant" fontFamily="$body">
            Cancel
          </Text>
        </Button>
        <Title>New Chat</Title>
        <Button
          size="$2"
          chromeless
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.4}
          onPress={() => void submit()}
        >
          {submitting ? (
            <Spinner size="small" color="$primary" />
          ) : (
            <Text color="$primary" fontFamily="$body" fontWeight="600">
              Create
            </Text>
          )}
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
          <Label color="$onSurfaceVariant">Selected ({selected.length})</Label>
          <XStack gap="$2" flexWrap="wrap">
            {selected.map((u) => (
              <Pressable
                key={u.accountId}
                onPress={() => removeSelected(u.accountId)}
              >
                <XStack
                  bg="$surfaceContainerLow"
                  px="$2"
                  py="$1"
                  borderRadius="$full"
                  gap="$1"
                  alignItems="center"
                >
                  <BodySm color="$onSurface">{u.handle}</BodySm>
                  <BodySm color="$onSurfaceVariant">×</BodySm>
                </XStack>
              </Pressable>
            ))}
          </XStack>
        </YStack>
      )}

      {mode === "group" && selected.length >= 2 && (
        <YStack px="$4" pb="$2">
          <TextField
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Group name (optional)"
            maxLength={80}
          />
        </YStack>
      )}

      <YStack px="$4" pb="$2">
        <TextField
          icon={<Feather name="search" size={18} color={iconColor} />}
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
          <BodySm color="$error">{error}</BodySm>
        </YStack>
      )}

      <View flex={1}>
        {searching ? (
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
            <Spinner />
          </YStack>
        ) : query.trim().length < MIN_QUERY_LEN ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <BodyMd color="$onSurfaceVariant">
              Type at least {MIN_QUERY_LEN} characters
            </BodyMd>
          </YStack>
        ) : results.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <BodyMd color="$onSurfaceVariant">No matches</BodyMd>
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
        borderRadius="$full"
        backgroundColor={active ? "$primary" : "$surfaceContainerLow"}
      >
        <Text
          fontFamily="$body"
          fontWeight="600"
          color={active ? "$onPrimary" : "$onSurface"}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// Search result row — same Glacier ListRow the chat list uses, so the picker
// reads as one surface. Name is the display name, handle sits in the preview
// line, and group multi-select uses the trailing receipt slot for the tick.
function UserRow({
  user,
  isSelected,
  onPress,
}: {
  user: SearchedUser;
  isSelected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <ListRow
      name={user.displayName}
      preview={`@${user.handle}`}
      timestamp=""
      avatar={{ name: user.handle, seed: user.accountId }}
      receipt={
        isSelected ? (
          <Feather name="check" size={18} color={theme.primary.val} />
        ) : null
      }
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
