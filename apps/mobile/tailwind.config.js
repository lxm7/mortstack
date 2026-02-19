const sharedConfig = require("@repo/tailwind-config");
module.exports = {
  ...sharedConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      ...sharedConfig.theme?.extend,
      fontFamily: {
        sans: ["IBMPlexSans_400Regular"],
        "sans-medium": ["IBMPlexSans_500Medium"],
        "sans-semibold": ["IBMPlexSans_600SemiBold"],
        "sans-bold": ["IBMPlexSans_700Bold"],
      },
    },
  },
};
