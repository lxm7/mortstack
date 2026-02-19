import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@repo/api";
import { PostCard } from "../../components/feed/PostCard";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = api.post.getFeed.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F0F0F0" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F0F0F0"
          />
        }
        ListEmptyComponent={
          <View className="p-6 items-center">
            <Text className="text-foreground-subtle">Nothing here yet.</Text>
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
    </View>
  );
}
