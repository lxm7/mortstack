import { NativeModule, requireNativeModule } from "expo";

declare class ChatDbModule extends NativeModule<Record<string, never>> {
  hello(): string;
}

export default requireNativeModule<ChatDbModule>("ChatDb");
