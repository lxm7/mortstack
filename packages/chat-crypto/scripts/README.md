# chat-crypto build scripts

## libsignal vendoring strategy (P2)

M3.5 wraps libsignal (Signal Foundation's official Rust implementation;
includes PQXDH post-quantum prekeys). libsignal isn't published to public
package registries — Signal builds it in-tree for their own apps.

| Platform | Strategy                                   | Where                                                     |
| -------- | ------------------------------------------ | --------------------------------------------------------- |
| iOS      | **Swift Package Manager** at prebuild time | `apps/mobile/plugins/with-libsignal-spm.ts`               |
| Android  | **Vendored AAR** built locally             | `packages/chat-crypto/scripts/build-libsignal.sh android` |

The asymmetry matches each ecosystem: SPM is libsignal's intended Swift
consumption model, while Android requires a built AAR (no SPM equivalent on
JVM). **Version pinning lives in two places that must agree:**

- iOS: `pinVersion` in `apps/mobile/plugins/with-libsignal-spm.ts`
- Android: `LIBSIGNAL_REF` env or fallback to latest tag in `build-libsignal.sh`

Bumping libsignal = update both in one commit.

---

## `build-libsignal.sh android` — Android AAR build

### Prerequisites (one-time)

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup install stable

# protobuf compiler (libsignal uses .proto internally)
brew install protobuf

# C header generator (pinned to libsignal-tested version)
cargo install cbindgen --version 0.27.0

# JDK 17 (libsignal pins to 17, not 21)
brew install --cask temurin@17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# Android NDK r26 or newer
# Install via Android Studio → SDK Manager → SDK Tools → NDK (Side by side)
export ANDROID_NDK_ROOT="$HOME/Library/Android/sdk/ndk/<version>"

# Rust targets for Android ABIs
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
```

### Running

```bash
pnpm --filter @repo/chat-crypto exec ./scripts/build-libsignal.sh android
```

First run clones libsignal into `$TMPDIR/libsignal-build` (~10 min), then
builds the AAR (~10 min per-ABI Rust compilation). Output:
`packages/chat-crypto/android/libs/libsignal-client.aar` — commit to git.

Override defaults via env:

```bash
LIBSIGNAL_REF=v0.94.1 ./scripts/build-libsignal.sh android
LIBSIGNAL_DIR=$HOME/src/libsignal ./scripts/build-libsignal.sh android
```

### iOS — no script needed

The Expo config plugin handles iOS at `expo prebuild` time. Bumping the iOS
version:

1. Edit `apps/mobile/plugins/with-libsignal-spm.ts` → change `pinVersion`.
2. Re-run `pnpm --filter mobile exec expo prebuild --clean`.
3. Xcode resolves the new SPM version on next `pod install` / `run:ios`.

Mirror the version change in the Android `LIBSIGNAL_REF` env when running
the AAR build.

### CI considerations (future)

For CI builds (post-MVP), prefer fetching prebuilt artifacts from a GitHub
release rather than running this script on every job — saves ~15 min per job.
Migration: tag a release in this repo, attach the AAR as a release asset,
swap the build step for a `curl` + checksum verify in CI.
