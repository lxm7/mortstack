# chat-crypto build scripts

## libsignal vendoring strategy

M3.5 wraps libsignal (Signal Foundation's official Rust implementation;
includes PQXDH post-quantum prekeys). libsignal isn't published to public
package registries — Signal builds it in-tree for their own apps.

Symmetric build-and-vendor strategy across both platforms:

| Platform | Artifact                                            | Where                                |
| -------- | --------------------------------------------------- | ------------------------------------ |
| iOS      | `SignalFfi.xcframework` + `LibSignalClient/*.swift` | `packages/chat-crypto/ios/`          |
| Android  | `libsignal-client.aar`                              | `packages/chat-crypto/android/libs/` |

Both built locally by `build-libsignal.sh <platform>`. Both committed to git
(committing prebuilt artifacts keeps fresh checkouts fast and avoids forcing
every contributor through a 20-30 min libsignal build).

### Why this iOS shape (not SPM)

The original chunk 1A plan was Swift Package Manager via an Expo config
plugin. That works for app-target code but **does not** work for code inside
a CocoaPods pod under static linking — and the chat-crypto Swift sources sit
inside the `ChatCrypto` pod, which the app's Podfile builds statically by
default (`use_frameworks!` is off). Pods cannot consume SPM products attached
to the app target in that configuration.

So iOS mirrors Android: vendor a locally-built artifact. The Rust FFI lands
as an `.xcframework` (same pattern as the existing `Clibsodium.xcframework`),
and the upstream Swift wrappers (`libsignal/swift/Sources/LibSignalClient/`)
are copied into the pod source tree where they compile as part of the same
Swift module as `ChatCryptoModule.swift`. No SPM, no `use_frameworks!`, no
app-target wiring.

### Version pinning

Single bump point: `LIBSIGNAL_REF` env (defaults to the latest tagged release
when unset). Bumping libsignal = re-run `build-libsignal.sh android` and
`build-libsignal.sh ios` at the same ref, then commit the regenerated
artifacts.

---

## Prerequisites (one-time)

### Common to both platforms

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup install stable

# protobuf compiler (libsignal uses .proto internally)
brew install protobuf

# C header generator (pinned to libsignal-tested version)
cargo install cbindgen --version 0.27.0
```

### Android-only

```bash
# JDK 17 (libsignal pins to 17, not 21)
brew install --cask temurin@17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# Android NDK r26 or newer — install via Android Studio → SDK Manager →
# SDK Tools → NDK (Side by side), then:
export ANDROID_NDK_ROOT="$HOME/Library/Android/sdk/ndk/<version>"

# Rust targets for Android ABIs
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
```

### iOS-only

```bash
# Full Xcode 15+ (not just Command Line Tools)
# After installing Xcode.app from the App Store:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Rust targets for iOS device + simulator slices
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
```

---

## Running

```bash
# Android — produces packages/chat-crypto/android/libs/libsignal-client.aar
pnpm --filter @repo/chat-crypto exec ./scripts/build-libsignal.sh android

# iOS — produces packages/chat-crypto/ios/SignalFfi.xcframework
#       and    packages/chat-crypto/ios/LibSignalClient/*.swift
pnpm --filter @repo/chat-crypto exec ./scripts/build-libsignal.sh ios
```

First run on either platform clones libsignal into `$TMPDIR/libsignal-build`
(~10 min) and then builds (~10-20 min per-arch Rust compilation).

Override defaults via env:

```bash
LIBSIGNAL_REF=v0.94.1 ./scripts/build-libsignal.sh ios
LIBSIGNAL_DIR=$HOME/src/libsignal ./scripts/build-libsignal.sh android
```

After the iOS build, regenerate the iOS native project so the new
xcframework is picked up by CocoaPods. Both of these are equivalent — pick
based on cwd:

```bash
pnpm rn:rebuild-ios            # from repo root (turbo-routed to mobile)
pnpm --filter mobile rebuild-ios   # from anywhere
cd apps/mobile && pnpm rebuild-ios # from apps/mobile/
```

Each runs `expo prebuild --clean` then `expo run:ios`.

---

## CI considerations (future)

For CI builds (post-MVP), prefer fetching prebuilt artifacts from a GitHub
release rather than running this script on every job — saves ~30 min per job.
Migration: tag a release in this repo, attach the AAR + xcframework + Swift
wrappers tarball as release assets, swap the build step for a `curl` +
checksum verify in CI.
