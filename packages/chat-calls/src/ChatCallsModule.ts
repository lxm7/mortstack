import { NativeModule, requireNativeModule } from "expo";

declare class ChatCallsModule extends NativeModule<Record<string, never>> {
  hello(): string;
}

export default requireNativeModule<ChatCallsModule>("ChatCalls");
