import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BadgeCheck,
  ArrowLeft,
  Heart,
  MessageCircle,
} from "lucide-react-native";
import { api } from "@repo/api";
import { useAuthStore } from "../../store/auth";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState("");

  const utils = api.useUtils();

  const { data: post, isLoading } = api.post.getPost.useQuery(
    { postId: id },
    { enabled: !!id },
  );

  const like = api.post.like.useMutation({
    onSuccess: () => utils.post.getPost.invalidate({ postId: id }),
  });
  const comment = api.post.comment.useMutation({
    onSuccess: () => {
      setCommentText("");
      utils.post.getPost.invalidate({ postId: id });
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F0F0F0" />
      </View>
    );
  }

  if (!post) return null;

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1">
          {/* Nav bar */}
          <View className="flex-row px-4 py-3 items-center gap-3 border-b border-border">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={20} color="#F0F0F0" />
            </TouchableOpacity>
            <Text className="text-foreground font-bold text-base">Post</Text>
          </View>

          <ScrollView>
            <View className="px-4 py-4 gap-4">
              {/* Author */}
              <View className="flex-row items-center gap-3">
                <View
                  className="bg-background-soft items-center justify-center"
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                >
                  <Text className="text-foreground font-bold text-base">
                    {post.user.username[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View className="gap-0.5">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-foreground font-bold text-base">
                      @{post.user.username}
                    </Text>
                    {post.user.isVerified && (
                      <BadgeCheck size={14} color="#60A5FA" />
                    )}
                  </View>
                  <Text className="text-foreground-subtle text-xs">
                    {new Date(post.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text className="text-foreground text-base leading-6">
                {post.content}
              </Text>

              {/* Actions */}
              <View className="flex-row gap-5">
                <TouchableOpacity
                  className="flex-row items-center gap-1.5"
                  onPress={() => like.mutate({ postId: post.id })}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Heart size={20} color="#888888" />
                  <Text className="text-foreground-subtle text-sm">
                    {post.likesCount}
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-1.5">
                  <MessageCircle size={20} color="#888888" />
                  <Text className="text-foreground-subtle text-sm">
                    {post.commentsCount}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-border" />

              {/* Comments */}
              {post.comments.length === 0 ? (
                <Text className="text-foreground-subtle text-sm">
                  No comments yet.
                </Text>
              ) : (
                <View className="gap-4">
                  {post.comments.map((c) => (
                    <View key={c.id} className="flex-row gap-3 items-start">
                      <View
                        className="bg-background-soft items-center justify-center shrink-0"
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                      >
                        <Text className="text-foreground font-bold text-xs">
                          {c.user.username[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </View>
                      <View className="gap-0.5 flex-1">
                        <Text className="text-foreground font-semibold text-sm">
                          @{c.user.username}
                        </Text>
                        <Text className="text-foreground text-sm leading-5">
                          {c.content}
                        </Text>
                        <Text className="text-foreground-subtle text-xs">
                          {new Date(c.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Comment input */}
          {user && (
            <View className="flex-row px-4 py-3 gap-2 items-center border-t border-border">
              <TextInput
                className="flex-1 bg-background-soft border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                placeholder="Add a comment..."
                placeholderTextColor="#555555"
                value={commentText}
                onChangeText={setCommentText}
                maxLength={1000}
              />
              <TouchableOpacity
                className="bg-foreground rounded-lg px-3 py-2"
                style={{
                  opacity: !commentText.trim() || comment.isPending ? 0.4 : 1,
                }}
                disabled={!commentText.trim() || comment.isPending}
                onPress={() =>
                  comment.mutate({
                    postId: post.id,
                    content: commentText.trim(),
                  })
                }
              >
                <Text className="text-background font-bold text-sm">Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
