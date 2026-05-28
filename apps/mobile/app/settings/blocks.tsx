// Blocked accounts list — shows accounts the user has blocked, with a tap
// to unblock. Hits trpc.blocks.list on mount + after each unblock so the
// list stays consistent without a refetch trigger from the user.

import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Button, Spinner, Text, View, XStack, YStack } from "tamagui";

import { trpc } from "@/lib/trpc/client";

interface BlockedRow {
  accountId: string;
  handle: string | null;
  displayName: string | null;
  blockedAt: string;
}

export default function BlocksScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<BlockedRow[] | null>(null);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const out = await trpc.blocks.list.query();
      setRows(out.blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onUnblock = useCallback(
    (row: BlockedRow) => {
      Alert.alert(
        `Unblock ${row.displayName ?? row.handle ?? "this user"}?`,
        "They'll be able to find you in search and start a chat with you again.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unblock",
            onPress: async () => {
              setUnblocking(row.accountId);
              try {
                await trpc.blocks.remove.mutate({ accountId: row.accountId });
                await load();
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              } finally {
                setUnblocking(null);
              }
            },
          },
        ],
      );
    },
    [load],
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
          Blocked accounts
        </Text>
        <View width={60} />
      </XStack>

      {rows === null ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : rows.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
          <Text fontSize="$4" color="$placeholderColor">
            No blocked accounts
          </Text>
          {error && (
            <Text fontSize="$2" color="#dc2626">
              {error}
            </Text>
          )}
        </YStack>
      ) : (
        <FlashList
          data={rows}
          keyExtractor={(r) => r.accountId}
          renderItem={({ item }) => (
            <BlockedRow
              row={item}
              isPending={unblocking === item.accountId}
              onUnblock={() => onUnblock(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </YStack>
  );
}

function BlockedRow({
  row,
  isPending,
  onUnblock,
}: {
  row: BlockedRow;
  isPending: boolean;
  onUnblock: () => void;
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
      <YStack flex={1}>
        <Text fontSize="$4" fontWeight="600">
          {row.displayName ?? row.handle ?? "Unknown"}
        </Text>
        {row.handle && (
          <Text fontSize="$2" color="$placeholderColor">
            @{row.handle}
          </Text>
        )}
      </YStack>
      <Button size="$2" chromeless disabled={isPending} onPress={onUnblock}>
        {isPending ? <Spinner size="small" /> : <Text>Unblock</Text>}
      </Button>
    </XStack>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
});
