import type { ReactNode } from "react";
import { TamaguiProvider } from "tamagui";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import config from "@/tamagui.config";
import { queryClient } from "@/lib/query/client";
import { ChatTransportProvider } from "@/lib/chat/transport";
import { MobileChatStoreProvider } from "@/lib/chat/store-provider";

export function Providers({ children }: { children: ReactNode }) {
  // Glacier is light-only (THEME §1). The crypto inspector — the one surface
  // that used to be dark — moved to App (Light) in its DESIGN.md 2.1.0, so we
  // pin `light` rather than following the OS colour scheme.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <ChatTransportProvider>
            <MobileChatStoreProvider>{children}</MobileChatStoreProvider>
          </ChatTransportProvider>
        </QueryClientProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
