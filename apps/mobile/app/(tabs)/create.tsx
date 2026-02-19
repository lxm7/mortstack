import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { api } from "@repo/api";
import { useAuthStore } from "../../store/auth";

type MediaType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";

const MEDIA_OPTIONS: { label: string; value: MediaType; minTier: string }[] = [
  { label: "Text", value: "TEXT", minTier: "NONE" },
  { label: "Image", value: "IMAGE", minTier: "BASIC" },
  { label: "Audio", value: "AUDIO", minTier: "CREATOR" },
  { label: "Video", value: "VIDEO", minTier: "CREATOR" },
];

const TIER_ORDER = ["NONE", "BASIC", "CREATOR", "ARTIST"];

function tierAllows(userTier: string, minTier: string) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(minTier);
}

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("TEXT");

  const create = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setMediaType("TEXT");
      router.replace("/(tabs)/feed");
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const handlePost = () => {
    if (!content.trim()) return;
    create.mutate({ content: content.trim(), mediaType });
  };

  const userTier = user?.identityTier ?? "NONE";

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-4 py-4 gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground font-bold text-lg">New Post</Text>
            <TouchableOpacity
              className="bg-foreground rounded-lg px-4 py-2"
              style={{ opacity: !content.trim() || create.isPending ? 0.4 : 1 }}
              disabled={!content.trim() || create.isPending}
              onPress={handlePost}
            >
              <Text className="text-background font-bold text-sm">
                {create.isPending ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="h-px bg-border" />

          {/* Media type selector */}
          <View className="flex-row flex-wrap gap-2">
            {MEDIA_OPTIONS.map((opt) => {
              const allowed = tierAllows(userTier, opt.minTier);
              const selected = mediaType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  className={`rounded-lg px-3 py-1.5 border ${selected ? "bg-foreground border-foreground" : "bg-transparent border-border"}`}
                  style={{ opacity: allowed ? 1 : 0.4 }}
                  disabled={!allowed}
                  onPress={() => allowed && setMediaType(opt.value)}
                >
                  <Text
                    className={`text-sm ${selected ? "text-background font-bold" : allowed ? "text-foreground" : "text-foreground-subtle"}`}
                  >
                    {opt.label}
                    {!allowed && ` (${opt.minTier}+)`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {userTier === "NONE" && (
            <Text className="text-foreground-subtle text-xs">
              Verify your account in Profile to unlock image and audio/video
              posts.
            </Text>
          )}

          {/* Content input */}
          <TextInput
            className="flex-1 text-foreground text-base"
            placeholder="What's on your mind?"
            placeholderTextColor="#555555"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />

          <Text className="text-foreground-subtle text-xs text-right">
            {content.length}/5000
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
