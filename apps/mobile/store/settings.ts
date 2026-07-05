import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

// SecureStore-backed adapter for zustand persist. SecureStore is async (persist
// rehydrates asynchronously — the default below applies until it resolves) and
// keys must be [A-Za-z0-9._-], which the `name` satisfies.
const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

interface SettingsState {
  /** Symmetric read-receipts toggle (M8). When OFF: the client emits no read
   *  receipts AND suppresses rendering peers' receipts (Signal/WhatsApp model).
   *  Defaults ON. */
  readReceipts: boolean;
  setReadReceipts: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readReceipts: true,
      setReadReceipts: (on) => set({ readReceipts: on }),
    }),
    {
      name: "app_settings_v1",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
