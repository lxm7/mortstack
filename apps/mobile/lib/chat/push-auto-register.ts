import { loadSessionToken } from "@/lib/auth/session";
import { useAuthStore } from "@/store/auth";
import { registerPushTokenForThisDevice } from "./push-register";

// Mirrors auto-publish.ts: idempotent per signed-in AuthUser. M6 push token
// registration depends on the UserDevice row already existing — auto-publish
// creates that row, this module piggybacks on the same auth-state edges.
let registeredForUserId: string | null = null;

async function maybeRegister(reason: string): Promise<void> {
  const session = useAuthStore.getState().session;
  if (!session?.user.id) return;
  if (registeredForUserId === session.user.id) return;
  const bearer = await loadSessionToken();
  if (!bearer) return;
  registeredForUserId = session.user.id;
  try {
    const r = await registerPushTokenForThisDevice();
    console.log(`[chat-mvp/M6] push token register (${reason})`, r);
  } catch (err) {
    registeredForUserId = null;
    console.error(`[chat-mvp/M6] push token register failed (${reason})`, err);
  }
}

void maybeRegister("boot");
useAuthStore.subscribe(() => {
  void maybeRegister("auth-change");
});
