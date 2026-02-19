import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Heart, MessageCircle, BadgeCheck } from "lucide-react-native";
import { api } from "@repo/api";
import type { AppRouter } from "@repo/api";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Post = RouterOutputs["post"]["getFeed"]["posts"][number];

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  const like = api.post.like.useMutation();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.9}
    >
      <View className="border-b border-border px-4 py-4 gap-3">
        {/* Author */}
        <View className="flex-row items-center gap-3">
          {post.user.avatar ? (
            <Image
              source={{ uri: post.user.avatar }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View
              className="bg-background-soft items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 20 }}
            >
              <Text className="text-foreground font-bold text-base">
                {post.user.username[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}

          <View className="gap-0.5">
            <View className="flex-row items-center gap-1">
              <Text className="text-foreground font-bold text-base">
                @{post.user.username}
              </Text>
              {post.user.isVerified && <BadgeCheck size={14} color="#60A5FA" />}
            </View>
            <Text className="text-foreground-subtle text-xs">
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-foreground text-base leading-6">
          {post.content}
        </Text>

        {/* Media badge */}
        {post.mediaType !== "TEXT" && (
          <View className="bg-background-soft rounded px-2 py-1 self-start">
            <Text className="text-foreground-subtle text-xs uppercase">
              {post.mediaType}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-5 mt-1">
          <TouchableOpacity
            onPress={() => like.mutate({ postId: post.id })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="flex-row items-center gap-1.5">
              <Heart size={18} color="#888888" />
              <Text className="text-foreground-subtle text-sm">
                {post.likesCount}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5">
            <MessageCircle size={18} color="#888888" />
            <Text className="text-foreground-subtle text-sm">
              {post.commentsCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
