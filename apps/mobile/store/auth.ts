import { create } from "zustand";
import { setActiveChatDbUser } from "@repo/chat-db";

import { clearChatGroupCache } from "@/lib/chat/group-resolver";
import { forgetMyAccount } from "@/lib/account/me";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  token: string;
  expiresAt?: string;
  user: User;
  // Active profile selected by the user (from their linked Profiles)
  activeProfileId?: string;
};

type AuthState = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setActiveProfile: (profileId: string) => void;
};

// Per-account local state pivots on the signed-in Better Auth user id: the
// chat DB file (chat-<userId>.sqlite), the chatId→groupId resolver cache and
// the account.me singleton all belong to exactly one account. Token refreshes
// for the SAME user must not churn any of them — only an actual user change.
function onUserChange(prev: Session | null, next: Session | null): void {
  const prevUser = prev?.user.id ?? null;
  const nextUser = next?.user.id ?? null;
  if (prevUser === nextUser) return;
  setActiveChatDbUser(nextUser);
  clearChatGroupCache();
  forgetMyAccount();
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,

  setSession: (session) =>
    set((state) => {
      onUserChange(state.session, session);
      return { session };
    }),

  clearSession: () =>
    set((state) => {
      onUserChange(state.session, null);
      return { session: null };
    }),

  setActiveProfile: (profileId) =>
    set((state) =>
      state.session
        ? { session: { ...state.session, activeProfileId: profileId } }
        : state,
    ),
}));
