import { NativeModule, requireNativeModule } from "expo";

import type { ChatCryptoModuleEvents } from "./ChatCrypto.types";

declare class ChatCryptoModule extends NativeModule<ChatCryptoModuleEvents> {
  hello(): string;
}

export default requireNativeModule<ChatCryptoModule>("ChatCrypto");
