import { loadSessionToken } from "@/lib/auth/session";
import { useAuthStore } from "@/store/auth";
import { publishMyChatDevice } from "./publish";

// Tracks the AuthUser.id we last successfully published device keys for.
// Used so that:
//   - We don't re-publish on transient store updates (profile switch, etc.)
//     for the same user.
//   - We DO re-publish if the signed-in user actually changes (sign-out then
//     sign-in as someone else on the same install).
// Reset to null on publish failure so the next state change retries.
let publishedForUserId: string | null = null;

async function maybePublish(reason: string): Promise<void> {
  const session = useAuthStore.getState().session;
  if (!session?.user.id) return;
  if (publishedForUserId === session.user.id) return;

  // Defensive: SecureStore should already have the bearer (auth client's
  // onResponse writes it before sign-in/sign-up calls setSession). Skip when
  // missing — the next state change will retry.
  const token = await loadSessionToken();
  if (!token) return;

  publishedForUserId = session.user.id;
  try {
    const result = await publishMyChatDevice();
    console.log(`[chat-mvp/M3] device keys published (${reason})`, result);
  } catch (err) {
    publishedForUserId = null;
    console.error(`[chat-mvp/M3] device keys publish failed (${reason})`, err);
  }
}

// Fire once at module init in case the session is already present at boot
// (rehydration from disk, hot reload, sign-in that landed before this module
// loaded). The idempotency guard makes this safe alongside the subscriber.
void maybePublish("boot");

// Re-fire on every store update; maybePublish filters by user id.
useAuthStore.subscribe(() => {
  void maybePublish("auth-change");
});
