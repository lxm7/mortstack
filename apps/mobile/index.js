// Native module setup MUST come before expo-router/entry.
// Order matters — teleport (Sheet/Dialog/Popover) first, then gesture handler.
import "@tamagui/native/setup-teleport";
import "@tamagui/native/setup-gesture-handler";

import "expo-router/entry";
