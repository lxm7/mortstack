#!/usr/bin/env bash
# Build libsignal Android AAR from source and vendor under
# packages/chat-crypto/android/libs/. iOS is consumed via Swift Package
# Manager — see apps/mobile/plugins/with-libsignal-spm.ts (P2 decision).
#
# Usage:
#   ./build-libsignal.sh android
#
# Env overrides:
#   LIBSIGNAL_REPO   git clone URL (default: https://github.com/signalapp/libsignal)
#   LIBSIGNAL_REF    git tag/branch/commit to build (default: latest tagged release)
#   LIBSIGNAL_DIR    local checkout dir (default: $TMPDIR/libsignal-build)
#
# Keep LIBSIGNAL_REF in sync with `pinVersion` in the iOS SPM plugin —
# Swift + Kotlin sides must implement the same protocol version.
#
# Prerequisites:
#   - rustup + stable toolchain (>=1.78)
#   - protoc (`brew install protobuf`)
#   - cbindgen (`cargo install cbindgen --version 0.27.0`)
#   - JDK 17 (`brew install --cask temurin@17`)
#   - Android NDK r26+ (set ANDROID_NDK_ROOT)
#   - rustup targets: aarch64-linux-android, armv7-linux-androideabi,
#     x86_64-linux-android

set -euo pipefail

PKG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIBSIGNAL_REPO="${LIBSIGNAL_REPO:-https://github.com/signalapp/libsignal}"
LIBSIGNAL_REF="${LIBSIGNAL_REF:-}"
LIBSIGNAL_DIR="${LIBSIGNAL_DIR:-${TMPDIR:-/tmp}/libsignal-build}"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing prerequisite: $1" >&2
    echo "  install hint: $2" >&2
    exit 2
  }
}

check_common() {
  need rustup "https://rustup.rs/"
  need cargo "comes with rustup"
  need protoc "brew install protobuf"
  need cbindgen "cargo install cbindgen --version 0.27.0"
  need git "xcode-select --install"
}

check_android() {
  need java "brew install --cask temurin@17"
  : "${ANDROID_NDK_ROOT:?ANDROID_NDK_ROOT not set — point at your NDK r26+ install}"
  for target in aarch64-linux-android armv7-linux-androideabi x86_64-linux-android; do
    rustup target list --installed | grep -qx "$target" || {
      echo "rustup target $target not installed — run:" >&2
      echo "  rustup target add $target" >&2
      exit 2
    }
  done
}

fetch_libsignal() {
  if [ ! -d "$LIBSIGNAL_DIR/.git" ]; then
    echo "→ cloning libsignal into $LIBSIGNAL_DIR"
    git clone "$LIBSIGNAL_REPO" "$LIBSIGNAL_DIR"
  fi
  cd "$LIBSIGNAL_DIR"
  git fetch --tags --quiet
  if [ -z "$LIBSIGNAL_REF" ]; then
    LIBSIGNAL_REF=$(git tag --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
    echo "→ no LIBSIGNAL_REF set; using latest tag: $LIBSIGNAL_REF"
  fi
  git checkout --quiet "$LIBSIGNAL_REF"
  echo "→ libsignal checked out at $LIBSIGNAL_REF"
}

build_android() {
  check_common
  check_android
  fetch_libsignal

  # Belt + suspenders for the Android NDK path. Different parts of the Android
  # toolchain look in different places — set all three to the same value so
  # we don't trip on whichever convention libsignal's gradle picks.
  export ANDROID_NDK_HOME="$ANDROID_NDK_ROOT"

  # libsignal's java/android/build.gradle reads ndk.dir from local.properties
  # when the env vars aren't picked up (happens with some gradle/AGP combos).
  # Write a local.properties scoped to the libsignal checkout so we don't
  # touch the user's other Android projects.
  local SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Library/Android/sdk}}"
  cat > "$LIBSIGNAL_DIR/java/android/local.properties" <<EOF
sdk.dir=$SDK_DIR
ndk.dir=$ANDROID_NDK_ROOT
EOF
  echo "→ wrote $LIBSIGNAL_DIR/java/android/local.properties"

  cd "$LIBSIGNAL_DIR/java"
  echo "→ building libsignal AAR for Android (release, all ABIs)"
  ./gradlew :client:assembleRelease
  SRC_AAR=$(find "$LIBSIGNAL_DIR/java/client/build/outputs/aar" -name "*.aar" | head -1)
  if [ -z "$SRC_AAR" ] || [ ! -f "$SRC_AAR" ]; then
    echo "could not locate built AAR under java/client/build/outputs/aar/" >&2
    echo "  inspect $LIBSIGNAL_DIR/java/client/build/ and adjust this script" >&2
    exit 3
  fi
  DEST_LIBS="$PKG_DIR/android/libs"
  DEST_AAR="$DEST_LIBS/libsignal-client.aar"
  mkdir -p "$DEST_LIBS"
  cp "$SRC_AAR" "$DEST_AAR"
  echo "→ vendored $DEST_AAR"
  echo "  (commit to git per C4-a vendoring strategy)"
}

case "${1:-}" in
  android) build_android ;;
  ios)
    echo "iOS is consumed via SPM — see apps/mobile/plugins/with-libsignal-spm.ts" >&2
    echo "Bump pinVersion there to update libsignal on iOS." >&2
    exit 1
    ;;
  *)       echo "usage: $0 android  (iOS is SPM-managed, not vendored)" >&2; exit 1 ;;
esac
