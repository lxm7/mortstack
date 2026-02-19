import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { api } from "@repo/api";
import { PostCard } from "../../components/feed/PostCard";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    api.post.search.useInfiniteQuery(
      { query: debouncedQuery, limit: 20 },
      {
        enabled: debouncedQuery.length > 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
      <View className="flex-1">
        <View className="flex-row px-4 py-3 items-center gap-2 border-b border-border">
          <Search size={18} color="#555555" />
          <TextInput
            className="flex-1 text-foreground text-base"
            placeholder="Search posts or people..."
            placeholderTextColor="#555555"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {isLoading && debouncedQuery.length > 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#F0F0F0" />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View className="p-6 items-center">
                <Text className="text-foreground-subtle">
                  {debouncedQuery.length === 0
                    ? "Start typing to search."
                    : "No results found."}
                </Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color="#888888" />
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
    </View>
  );
}
