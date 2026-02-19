import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface User {
  id: string;
  username: string;
  avatar: string | null;
  walletAddress: string | null;
  identityTier: "NONE" | "BASIC" | "CREATOR" | "ARTIST";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const KEYS = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
  user: "auth.user",
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    // Store tokens in Keychain (iOS) / Keystore (Android)
    await SecureStore.setItemAsync(KEYS.accessToken, accessToken);
    await SecureStore.setItemAsync(KEYS.refreshToken, refreshToken);
    await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
    set({ user, accessToken, refreshToken });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(KEYS.accessToken);
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
    await SecureStore.deleteItemAsync(KEYS.user);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  loadFromStorage: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStore.getItemAsync(KEYS.accessToken),
        SecureStore.getItemAsync(KEYS.refreshToken),
        SecureStore.getItemAsync(KEYS.user),
      ]);

      const user = userJson ? (JSON.parse(userJson) as User) : null;
      set({ user, accessToken, refreshToken, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
