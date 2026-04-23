import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import config from "@/tamagui.config";
import { queryClient } from "@/lib/query/client";

export function Providers({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider
        config={config}
        defaultTheme={colorScheme === "dark" ? "dark" : "light"}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
