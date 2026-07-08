#!/usr/bin/env bash
# Build chat_mls_core native artifacts via UniFFI and vendor them under
# packages/chat-mls-core/. Mirrors the build-libsignal.sh strategy:
#
#   Android → per-ABI .so files + UniFFI-generated Kotlin sources, dropped into
#             packages/chat-mls-core/android/src/main/{jniLibs,java}/
#             (Expo Module's gradle build assembles the AAR from these)
#   iOS    → ChatMlsCore.xcframework (lipo'd device + sim slices) +
#             UniFFI-generated Swift sources under packages/chat-mls-core/ios/
#
# Usage:
#   ./build-mls.sh android
#   ./build-mls.sh ios
#
# Env overrides:
#   CARGO_TOOLCHAIN   rustup toolchain to use (default: stable)
#   IPHONEOS_DEPLOYMENT_TARGET  default 15.1 — match apps/mobile podspec
#
# Prerequisites — common:
#   - rustup + stable toolchain (>=1.78)
#   - git (for repo metadata)
# Android-only:
#   - JDK 17 (`brew install --cask temurin@17`) — only needed by the Expo
#     module gradle build that consumes our jniLibs/java output; not by this
#     script directly. Kept in the check so failures are caught early.
#   - Android NDK r26+ (set ANDROID_NDK_ROOT)
#   - rustup targets: aarch64-linux-android, armv7-linux-androideabi,
#     x86_64-linux-android, i686-linux-android
# iOS-only:
#   - Full Xcode 15+ (`xcode-select -p` must point at Xcode.app, not CLT)
#   - rustup targets: aarch64-apple-ios, aarch64-apple-ios-sim,
#     x86_64-apple-ios

set -euo pipefail

PKG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CARGO_TOOLCHAIN="${CARGO_TOOLCHAIN:-stable}"

# Crate name from Cargo.toml [lib] section — kept in sync by convention.
#
# FRAMEWORK_NAME is the Clang module name that the UniFFI-generated Swift
# code does `import <name>` on. UniFFI hardcodes `<crate>FFI` (no escaping)
# — see the `#if canImport(<crate>FFI)` line emitted at the top of the
# generated Swift file. The xcframework filename, inner .framework name,
# binary name, and modulemap module-name MUST all match this exactly or
# Swift won't resolve the import.
CRATE_NAME="chat_mls_core"
FRAMEWORK_NAME="${CRATE_NAME}FFI"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing prerequisite: $1" >&2
    echo "  install hint: $2" >&2
    exit 2
  }
}

# Same hashing helpers as build-libsignal.sh — CI verifies vendored artifacts
# with `shasum -a 256 -c <file>.sha256` and `shasum -a 256 -c <dir>.sha256`.
hash_file() {
  local f="$1"
  ( cd "$(dirname "$f")" && shasum -a 256 "$(basename "$f")" ) > "$f.sha256"
  echo "→ wrote $f.sha256"
}

hash_dir() {
  local d="$1"
  ( cd "$d" && find . -type f \! -name '.DS_Store' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256 ) > "$d.sha256"
  echo "→ wrote $d.sha256"
}

check_common() {
  need rustup "https://rustup.rs/"
  need cargo "comes with rustup"
  need git "xcode-select --install"
}

check_android() {
  need java "brew install --cask temurin@17"
  : "${ANDROID_NDK_ROOT:?ANDROID_NDK_ROOT not set — point at your NDK r26+ install}"
}

check_ios() {
  need xcodebuild "install full Xcode (not just Command Line Tools) from the App Store"
  need lipo "comes with Xcode"
  local xcode_path
  xcode_path="$(xcode-select -p)"
  case "$xcode_path" in
    *CommandLineTools*)
      echo "xcode-select is pointed at Command Line Tools, not full Xcode:" >&2
      echo "  $xcode_path" >&2
      echo "  run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" >&2
      exit 2 ;;
  esac
}

ensure_targets() {
  for target in "$@"; do
    if ! rustup target list --installed --toolchain "$CARGO_TOOLCHAIN" 2>/dev/null | grep -qx "$target"; then
      echo "  rustup target add $target --toolchain $CARGO_TOOLCHAIN"
      rustup target add "$target" --toolchain "$CARGO_TOOLCHAIN"
    fi
  done
}

# UniFFI bindgen consumes the built cdylib (.dylib/.so) and emits language
# bindings. Building the host-platform cdylib once at the start of each run
# is fast and gives bindgen a stable symbol source — saves us from doing it
# inside every per-arch build loop.
build_bindgen_lib() {
  echo "→ cargo build --release (host cdylib for UniFFI bindgen)"
  ( cd "$PKG_DIR" && cargo +"$CARGO_TOOLCHAIN" build --release )
}

# Locate the host cdylib produced by `build_bindgen_lib`. Used as the
# --library input to `uniffi-bindgen generate` for both Swift and Kotlin.
host_cdylib() {
  case "$(uname -s)" in
    Darwin) echo "$PKG_DIR/target/release/lib${CRATE_NAME}.dylib" ;;
    Linux)  echo "$PKG_DIR/target/release/lib${CRATE_NAME}.so" ;;
    *)      echo "unsupported host OS: $(uname -s)" >&2; exit 3 ;;
  esac
}

build_android() {
  check_common
  check_android
  ensure_targets \
    aarch64-linux-android armv7-linux-androideabi \
    x86_64-linux-android i686-linux-android

  export ANDROID_NDK_HOME="$ANDROID_NDK_ROOT"

  # cargo-ndk wraps cargo with the correct linker/sysroot per ABI. If the
  # user hasn't installed it yet, point at the install command rather than
  # making them puzzle through linker errors.
  need cargo-ndk "cargo install cargo-ndk"

  build_bindgen_lib

  local DEST_JNI="$PKG_DIR/android/src/main/jniLibs"
  rm -rf "$DEST_JNI"
  mkdir -p "$DEST_JNI"

  echo "→ cargo ndk build per ABI (release)"
  ( cd "$PKG_DIR" && cargo +"$CARGO_TOOLCHAIN" ndk \
      -t arm64-v8a -t armeabi-v7a -t x86_64 -t x86 \
      -o "$DEST_JNI" \
      build --release )

  hash_dir "$DEST_JNI"

  # Regenerate the UniFFI Kotlin bindings from the freshly-built host cdylib.
  # MLS_SKIP_BINDGEN=1 skips this: the CI producer (native-artifacts.yml) only
  # needs to publish the .so — the Kotlin is committed source, regenerated by
  # devs when the Rust API changes. Skipping also sidesteps a Linux-only
  # bindgen quirk in CI, and avoids the destructive rm -rf below deleting the
  # committed bindings if a gen silently produces nothing.
  local DEST_KT="$PKG_DIR/android/src/main/java"
  if [ "${MLS_SKIP_BINDGEN:-0}" = "1" ]; then
    echo "→ MLS_SKIP_BINDGEN=1 — skipping UniFFI Kotlin regen (bindings are committed)"
  else
    rm -rf "$DEST_KT/uniffi"
    mkdir -p "$DEST_KT"
    # --no-format skips the ktlint post-process; ktlint is a JVM tool that's
    # only optional cosmetic formatting on the generated Kotlin.
    echo "→ uniffi-bindgen generate --language kotlin"
    ( cd "$PKG_DIR" && cargo +"$CARGO_TOOLCHAIN" run --release --bin uniffi-bindgen -- \
        generate --library "$(host_cdylib)" \
        --language kotlin \
        --no-format \
        --out-dir "$DEST_KT" )
    hash_dir "$DEST_KT/uniffi"
  fi

  echo
  echo "  vendored:"
  echo "    $DEST_JNI/{arm64-v8a,armeabi-v7a,x86_64,x86}/lib${CRATE_NAME}.so"
  echo "    $DEST_KT/uniffi/<crate>/<crate>.kt"
  echo "  commit: $DEST_JNI/.sha256, $DEST_KT/uniffi/.sha256"
  echo "  next: pnpm rn:rebuild-android   # from repo root"
  echo "        (first run after new generated Kotlin sources — picks up the"
  echo "         new gradle source set; subsequent .so-only rebuilds work"
  echo "         with the faster pnpm rn:android)"
}

# Per-slice .framework dir packaging — mirrors build-libsignal.sh's
# assemble_signalffi_framework but consumes the UniFFI-generated FFI header
# instead of cbindgen's signal_ffi.h.
assemble_mls_framework() {
  local FW="$1"
  local STATIC_LIB="$2"
  local HEADER_DIR="$3"

  rm -rf "$FW"
  mkdir -p "$FW/Headers" "$FW/Modules"

  cp "$STATIC_LIB" "$FW/${FRAMEWORK_NAME}"
  cp "$HEADER_DIR"/*.h "$FW/Headers/"
  [ -f "$FW/Headers/${FRAMEWORK_NAME}.h" ] || {
    echo "missing UniFFI header at $FW/Headers/${FRAMEWORK_NAME}.h" >&2
    echo "  generated headers in $HEADER_DIR:" >&2
    ls -1 "$HEADER_DIR" >&2
    exit 3
  }

  # NOT copied from the UniFFI-emitted modulemap — that file declares a plain
  # `module ${FRAMEWORK_NAME}` directive intended for direct -fmodule-map-file
  # consumption. Inside an .xcframework, the modulemap MUST be in framework
  # form (`framework module …`) or Swift's import-resolver can't see the
  # module through the framework binding. Synthesise it ourselves so the
  # contract is explicit + version-stable.
  cat > "$FW/Modules/module.modulemap" <<EOF
framework module ${FRAMEWORK_NAME} {
  umbrella header "${FRAMEWORK_NAME}.h"
  export *
}
EOF

  cat > "$FW/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>io.sessions.${FRAMEWORK_NAME}</string>
  <key>CFBundleName</key><string>${FRAMEWORK_NAME}</string>
  <key>CFBundleExecutable</key><string>${FRAMEWORK_NAME}</string>
  <key>CFBundlePackageType</key><string>FMWK</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>MinimumOSVersion</key><string>15.1</string>
</dict></plist>
EOF
}

build_ios() {
  check_common
  check_ios
  ensure_targets \
    aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

  # Must match apps/mobile podspec s.platforms[:ios]. If you bump the floor,
  # update both places in the same commit.
  export IPHONEOS_DEPLOYMENT_TARGET="${IPHONEOS_DEPLOYMENT_TARGET:-15.1}"

  build_bindgen_lib

  echo "→ cargo build per iOS arch (release)"
  for triple in aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios; do
    echo "  cargo build --release --target $triple"
    ( cd "$PKG_DIR" && cargo +"$CARGO_TOOLCHAIN" build --release --target "$triple" )
  done

  local STATIC_ARM64_DEVICE="$PKG_DIR/target/aarch64-apple-ios/release/lib${CRATE_NAME}.a"
  local STATIC_ARM64_SIM="$PKG_DIR/target/aarch64-apple-ios-sim/release/lib${CRATE_NAME}.a"
  local STATIC_X86_64_SIM="$PKG_DIR/target/x86_64-apple-ios/release/lib${CRATE_NAME}.a"
  for f in "$STATIC_ARM64_DEVICE" "$STATIC_ARM64_SIM" "$STATIC_X86_64_SIM"; do
    [ -f "$f" ] || { echo "missing static lib: $f" >&2; exit 3; }
  done

  # Generate the FFI header (and Swift sources, in the same invocation —
  # they go to different dirs but it's one bindgen run).
  local HEADER_OUT="$PKG_DIR/.framework-build/headers"
  rm -rf "$HEADER_OUT" && mkdir -p "$HEADER_OUT"
  echo "→ uniffi-bindgen generate --language swift (header + Swift bindings)"
  ( cd "$PKG_DIR" && cargo +"$CARGO_TOOLCHAIN" run --release --bin uniffi-bindgen -- \
      generate --library "$(host_cdylib)" \
      --language swift \
      --out-dir "$HEADER_OUT" )

  local BUILD_OUT="$PKG_DIR/.framework-build"
  local STATIC_SIM_FAT="$BUILD_OUT/lib${CRATE_NAME}_sim_fat.a"
  echo "→ lipo arm64-sim + x86_64-sim → fat sim static lib"
  lipo -create "$STATIC_ARM64_SIM" "$STATIC_X86_64_SIM" -output "$STATIC_SIM_FAT"

  echo "→ assembling per-slice ${FRAMEWORK_NAME}.framework directories"
  assemble_mls_framework "$BUILD_OUT/device/${FRAMEWORK_NAME}.framework" \
    "$STATIC_ARM64_DEVICE" "$HEADER_OUT"
  assemble_mls_framework "$BUILD_OUT/sim/${FRAMEWORK_NAME}.framework" \
    "$STATIC_SIM_FAT" "$HEADER_OUT"

  local DEST_XCF="$PKG_DIR/ios/${FRAMEWORK_NAME}.xcframework"
  rm -rf "$DEST_XCF"
  # Belt + braces: any stale xcframework left over from a pre-rename build
  # (FRAMEWORK_NAME=ChatMlsCore) would still satisfy the podspec but link
  # the wrong module. Sweep before re-packaging.
  rm -rf "$PKG_DIR/ios/ChatMlsCore.xcframework" "$PKG_DIR/ios/ChatMlsCore.xcframework.sha256"
  echo "→ packaging ${FRAMEWORK_NAME}.xcframework (device + sim slices)"
  xcodebuild -create-xcframework \
    -framework "$BUILD_OUT/device/${FRAMEWORK_NAME}.framework" \
    -framework "$BUILD_OUT/sim/${FRAMEWORK_NAME}.framework" \
    -output "$DEST_XCF"
  echo "→ vendored $DEST_XCF"

  # Swift sources land alongside the xcframework. The Expo Module's podspec
  # globs them into the ChatMlsCore Swift module (same model as the libsignal
  # vendored wrappers in chat-crypto, but without the LibSignalClient->ChatCrypto
  # rewrite — UniFFI-generated sources have no module-qualified symbols).
  local DEST_SWIFT="$PKG_DIR/ios/Sources"
  rm -rf "$DEST_SWIFT" && mkdir -p "$DEST_SWIFT"
  cp "$HEADER_OUT"/*.swift "$DEST_SWIFT/"
  echo "→ vendored Swift bindings to $DEST_SWIFT"

  hash_dir "$DEST_XCF"
  hash_dir "$DEST_SWIFT"

  echo
  echo "  vendored:"
  echo "    $DEST_XCF/  + $DEST_XCF.sha256"
  echo "    $DEST_SWIFT/ + $DEST_SWIFT.sha256"
  echo "  next: pnpm rn:rebuild-ios   # from repo root"
}

case "${1:-}" in
  android) build_android ;;
  ios)     build_ios ;;
  *)       echo "usage: $0 (android|ios)" >&2; exit 1 ;;
esac
