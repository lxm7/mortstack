# chat-mls-core build scripts

Native build pipeline for the OpenMLS engine via UniFFI. See ADR-015 for the
libsignal → OpenMLS swap rationale and licence audit.

## One-time prerequisites

Common (both platforms):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
```

Android:

```bash
brew install --cask temurin@17
rustup target add aarch64-linux-android armv7-linux-androideabi \
                  x86_64-linux-android i686-linux-android
cargo install cargo-ndk
# NDK install via Android Studio → SDK Manager → set ANDROID_NDK_ROOT
export ANDROID_NDK_ROOT="$HOME/Library/Android/sdk/ndk/<version>"
```

iOS:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
```

## Building

```bash
pnpm --filter @repo/chat-mls-core exec ./scripts/build-mls.sh android
pnpm --filter @repo/chat-mls-core exec ./scripts/build-mls.sh ios
```

Outputs:

- **Android** — `android/src/main/jniLibs/{arm64-v8a,armeabi-v7a,x86_64,x86}/libchat_mls_core.so` + `android/src/main/java/uniffi/chat_mls_core/chat_mls_core.kt`. The Expo Module's gradle build picks both up at AAR assembly time.
- **iOS** — `ios/ChatMlsCore.xcframework` + `ios/Sources/*.swift`. The Expo Module's podspec globs the Swift sources into the ChatMlsCore pod alongside the vendored xcframework.

Both outputs ship with `.sha256` manifests next to them — CI verifies with `shasum -a 256 -c <file>.sha256` or `-c <dir>.sha256`.

## Chunk 0 smoke test

After the iOS or Android build succeeds:

1. The build script's exit status is the first check — non-zero = bindgen or
   cargo failed. Inspect output, fix, rerun.
2. The generated Swift / Kotlin should expose one function: `ping() -> String`.
3. Wiring `ping()` into the Expo Module (`packages/chat-crypto` or a new
   `packages/chat-mls`) and seeing `"ok"` round-trip to JS is the Chunk 0
   exit gate. That happens in a follow-up; this script's job is the artifact
   build only.

## Bump policy

`openmls` + `openmls_traits` + `openmls_rust_crypto` are versioned together;
bump them as a triple in `Cargo.toml` and re-vendor BOTH `.xcframework` and
`jniLibs/` in the same commit. Platforms desynced on the OpenMLS version =
silent decrypt failures (group-state binary layout drift).

`uniffi` bumps independently but the bindgen-side and runtime-side `uniffi`
versions MUST match — bindgen lives in `[build-dependencies]`, runtime lives
in `[dependencies]`, both pinned to the same string in `Cargo.toml`.

## Why no external clone (vs build-libsignal.sh)

The libsignal script clones github.com/signalapp/libsignal at a pinned tag.
chat-mls-core is OUR crate; the OpenMLS dependency is an ordinary Cargo crate
fetched from crates.io. No clone, no checkout, no rust-toolchain.toml dance
— `cargo build` resolves the whole tree from `Cargo.lock`.
