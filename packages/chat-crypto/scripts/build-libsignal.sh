#!/usr/bin/env bash
# Build libsignal native artifacts and vendor them under packages/chat-crypto/.
# Symmetric strategy across platforms (decided in M3.5 chunk 1A rework — the
# original SPM-on-iOS plan failed because CocoaPods pods under static linking
# cannot consume Swift Package Manager products attached to the app target):
#
#   Android → AAR at packages/chat-crypto/android/libs/libsignal-client.aar
#   iOS    → SignalFfi.xcframework + LibSignalClient/ Swift sources, both
#            under packages/chat-crypto/ios/
#
# For iOS we vendor the Rust FFI as a static xcframework (mirroring
# Clibsodium.xcframework) and copy libsignal's upstream Swift wrappers
# directly into the ChatCrypto pod's source tree, where they compile alongside
# ChatCryptoModule.swift inside the same Swift module. No SPM. No
# use_frameworks!. Same single-bump mental model as Android.
#
# Usage:
#   ./build-libsignal.sh android
#   ./build-libsignal.sh ios
#
# Env overrides (apply to both platforms):
#   LIBSIGNAL_REPO   git clone URL (default: https://github.com/signalapp/libsignal)
#   LIBSIGNAL_REF    git tag/branch/commit to build (default: latest tagged release)
#   LIBSIGNAL_DIR    local checkout dir (default: $TMPDIR/libsignal-build)
#
# Prerequisites — common:
#   - rustup + stable toolchain (>=1.78)
#   - protoc (`brew install protobuf`)
#   - cbindgen (`cargo install cbindgen --version 0.27.0`)
#   - git
# Android-only:
#   - JDK 17 (`brew install --cask temurin@17`)
#   - Android NDK r26+ (set ANDROID_NDK_ROOT)
#   - rustup targets: aarch64-linux-android, armv7-linux-androideabi,
#     x86_64-linux-android
# iOS-only:
#   - Full Xcode 15+ (`xcode-select -p` must point at Xcode.app, not CLT)
#   - rustup targets: aarch64-apple-ios, aarch64-apple-ios-sim,
#     x86_64-apple-ios

set -euo pipefail

PKG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIBSIGNAL_REPO="${LIBSIGNAL_REPO:-https://github.com/signalapp/libsignal}"
# Pin to a known-good libsignal tag. Bumping requires rebuilding AAR +
# xcframework and re-committing both. Keep Android and iOS on the SAME ref —
# they implement the same wire protocol and a mismatch breaks message decrypt
# silently. Override at the command line if intentionally building a different
# version: `LIBSIGNAL_REF=v0.95.0 ./scripts/build-libsignal.sh android`.
LIBSIGNAL_REF="${LIBSIGNAL_REF:-v0.94.1}"
LIBSIGNAL_DIR="${LIBSIGNAL_DIR:-${TMPDIR:-/tmp}/libsignal-build}"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing prerequisite: $1" >&2
    echo "  install hint: $2" >&2
    exit 2
  }
}

# Write SHA-256 of a single file to <file>.sha256 in `shasum -a 256` format
# (HEX  FILENAME). CI verifies with `shasum -a 256 -c file.sha256`.
hash_file() {
  local f="$1"
  ( cd "$(dirname "$f")" && shasum -a 256 "$(basename "$f")" ) > "$f.sha256"
  echo "→ wrote $f.sha256"
}

# Write a sorted manifest of SHA-256s covering every regular file under a
# directory. Output path: <dir>.sha256. Sorted by relative path so the file is
# stable across machines (find ordering is FS-dependent otherwise).
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
  need protoc "brew install protobuf"
  need cbindgen "cargo install cbindgen --version 0.27.0"
  need git "xcode-select --install"
}

check_android() {
  need java "brew install --cask temurin@17"
  : "${ANDROID_NDK_ROOT:?ANDROID_NDK_ROOT not set — point at your NDK r26+ install}"
  # Rustup target check moved to ensure_targets_for_pinned (called from
  # build_android after fetch_libsignal) for the same reason as iOS —
  # libsignal pins its own rust toolchain and cargo inside the checkout
  # ignores the user's default. See note on check_ios.
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
  # Rustup target check intentionally moved to ensure_targets_for_pinned()
  # which runs AFTER fetch_libsignal — libsignal pins its own toolchain via
  # rust-toolchain.toml, and cargo inside the checkout uses THAT toolchain,
  # not the user's default. Installing targets for the default toolchain
  # silently does the wrong thing (cargo errors with E0463 "can't find crate
  # for `core`" despite a successful `rustup target add`).
}

# Detect the toolchain libsignal pins (rust-toolchain.toml at repo root or
# subdirs) and ensure the requested rustup targets are installed for it.
# Auto-installs missing targets — preferable to failing on a target we'd
# need to install anyway.
#
# Args:
#   $@ — list of rustup target triples to ensure
ensure_targets_for_pinned() {
  local PINNED=""
  # libsignal historically used a bare `rust-toolchain` file; newer versions
  # use `rust-toolchain.toml`. Check both, root + common subdirs.
  for candidate in \
    "$LIBSIGNAL_DIR/rust-toolchain" \
    "$LIBSIGNAL_DIR/rust-toolchain.toml" \
    "$LIBSIGNAL_DIR/rust/rust-toolchain" \
    "$LIBSIGNAL_DIR/rust/rust-toolchain.toml"
  do
    [ -f "$candidate" ] || continue
    case "$candidate" in
      *.toml)
        PINNED=$(grep -E '^[[:space:]]*channel[[:space:]]*=' "$candidate" \
          | head -1 | sed -E 's/^[^"]*"([^"]*)".*$/\1/')
        ;;
      *)
        PINNED=$(tr -d '[:space:]' < "$candidate")
        ;;
    esac
    [ -n "$PINNED" ] && break
  done

  if [ -z "$PINNED" ]; then
    PINNED=$(rustup show active-toolchain 2>/dev/null | awk '{print $1}')
    echo "→ no rust-toolchain pin found in libsignal; using active toolchain: $PINNED"
  else
    echo "→ libsignal pins rust toolchain: $PINNED"
  fi

  for target in "$@"; do
    if ! rustup target list --installed --toolchain "$PINNED" 2>/dev/null | grep -qx "$target"; then
      echo "  rustup target add $target --toolchain $PINNED"
      rustup target add "$target" --toolchain "$PINNED"
    fi
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
  ensure_targets_for_pinned \
    aarch64-linux-android armv7-linux-androideabi \
    x86_64-linux-android i686-linux-android

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
  ./gradlew :android:assembleRelease
  SRC_AAR=$(find "$LIBSIGNAL_DIR/java/android/build/outputs/aar" -name "*.aar" | head -1)
  if [ -z "$SRC_AAR" ] || [ ! -f "$SRC_AAR" ]; then
    echo "could not locate built AAR under java/android/build/outputs/aar/" >&2
    echo "  inspect $LIBSIGNAL_DIR/java/android/build/ and adjust this script" >&2
    exit 3
  fi
  DEST_LIBS="$PKG_DIR/android/libs"
  DEST_AAR="$DEST_LIBS/libsignal-client.aar"
  mkdir -p "$DEST_LIBS"
  cp "$SRC_AAR" "$DEST_AAR"
  echo "→ vendored $DEST_AAR"
  hash_file "$DEST_AAR"
  echo
  echo "  commit:"
  echo "    $DEST_AAR"
  echo "    $DEST_AAR.sha256"
  echo "    (built from libsignal $LIBSIGNAL_REF)"
}

# Assemble a static-framework directory containing libsignal_ffi.a renamed as
# the framework binary, the cbindgen-generated C header, and a module map
# that exposes module "SignalFfi" so the upstream Swift wrapper sources (which
# `import SignalFfi`) compile against it.
#
# Args:
#   $1 — output framework path (e.g. .../device/SignalFfi.framework)
#   $2 — input static lib (libsignal_ffi.a) for this slice
#   $3 — directory containing signal_ffi.h (cbindgen output)
assemble_signalffi_framework() {
  local FW="$1"
  local STATIC_LIB="$2"
  local HEADER_DIR="$3"

  rm -rf "$FW"
  mkdir -p "$FW/Headers" "$FW/Modules"

  # Framework binary is the static lib renamed to match the framework name.
  cp "$STATIC_LIB" "$FW/SignalFfi"

  # Copy generated + companion headers. We expect at minimum signal_ffi.h.
  cp "$HEADER_DIR"/*.h "$FW/Headers/" 2>/dev/null || true
  [ -f "$FW/Headers/signal_ffi.h" ] || {
    echo "no signal_ffi.h found in header source dir: $HEADER_DIR" >&2
    exit 3
  }

  # Mirror the upstream module map (declares BOTH signal_ffi.h and
  # signal_ffi_testing.h as siblings — the "testing" header carries some
  # SignalCPromise* / async-pointer types that production wrappers like
  # AsyncUtils.swift transitively reference, despite the name. A framework
  # modulemap can't use the bare `module SignalFfi { ... }` form from upstream
  # (CocoaPods/Swift wants `framework module`) so we rewrite, keeping the
  # multi-header declaration.
  cat > "$FW/Modules/module.modulemap" <<EOF
framework module SignalFfi {
  header "signal_ffi.h"
  header "signal_ffi_testing.h"
  export *
}
EOF

  cat > "$FW/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>io.sessions.SignalFfi</string>
  <key>CFBundleName</key><string>SignalFfi</string>
  <key>CFBundleExecutable</key><string>SignalFfi</string>
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
  fetch_libsignal
  ensure_targets_for_pinned \
    aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

  cd "$LIBSIGNAL_DIR"

  # iOS deployment target must match Sessions' minimum (see ChatCrypto.podspec
  # `s.platforms[:ios]`). Cargo passes this through to the Rust toolchain via
  # the env var.
  export IPHONEOS_DEPLOYMENT_TARGET=15.1

  # Locate the FFI Cargo manifest. Path stable across recent libsignal
  # versions; if upstream renames the crate the script fails fast with a
  # clear pointer rather than silently building nothing.
  local FFI_MANIFEST="$LIBSIGNAL_DIR/rust/bridge/ffi/Cargo.toml"
  [ -f "$FFI_MANIFEST" ] || {
    echo "FFI Cargo.toml not found at $FFI_MANIFEST" >&2
    echo "  libsignal layout may have changed at $LIBSIGNAL_REF — inspect repo" >&2
    exit 3
  }

  echo "→ building libsignal_ffi.a per iOS arch (release)"
  for triple in aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios; do
    echo "  cargo build --release --target $triple"
    cargo build --release \
      --manifest-path "$FFI_MANIFEST" \
      --target "$triple"
  done

  local FFI_ARM64_DEVICE="$LIBSIGNAL_DIR/target/aarch64-apple-ios/release/libsignal_ffi.a"
  local FFI_ARM64_SIM="$LIBSIGNAL_DIR/target/aarch64-apple-ios-sim/release/libsignal_ffi.a"
  local FFI_X86_64_SIM="$LIBSIGNAL_DIR/target/x86_64-apple-ios/release/libsignal_ffi.a"
  for f in "$FFI_ARM64_DEVICE" "$FFI_ARM64_SIM" "$FFI_X86_64_SIM"; do
    [ -f "$f" ] || { echo "missing FFI artifact: $f" >&2; exit 3; }
  done

  # The cbindgen-generated header is checked into libsignal's swift bindings
  # source tree as `swift/Sources/SignalFfi/signal_ffi.h`. If upstream layout
  # ever changes, surface a clear failure rather than producing a half-broken
  # xcframework.
  local FFI_HEADER_DIR="$LIBSIGNAL_DIR/swift/Sources/SignalFfi"
  [ -f "$FFI_HEADER_DIR/signal_ffi.h" ] || {
    echo "missing generated C header at $FFI_HEADER_DIR/signal_ffi.h" >&2
    echo "  search alternatives:" >&2
    find "$LIBSIGNAL_DIR" -name 'signal_ffi.h' 2>/dev/null | sed 's/^/    /' >&2
    exit 3
  }

  # Lipo the simulator slices (arm64-sim + x86_64) into one fat static lib so
  # the sim half of the xcframework supports both Apple-Silicon and Intel Macs.
  local BUILD_OUT="$LIBSIGNAL_DIR/.framework-build"
  rm -rf "$BUILD_OUT"
  mkdir -p "$BUILD_OUT"
  local FFI_SIM_FAT="$BUILD_OUT/libsignal_ffi_sim_fat.a"
  echo "→ lipo arm64-sim + x86_64-sim → fat sim static lib"
  lipo -create "$FFI_ARM64_SIM" "$FFI_X86_64_SIM" -output "$FFI_SIM_FAT"

  echo "→ assembling per-slice SignalFfi.framework directories"
  assemble_signalffi_framework "$BUILD_OUT/device/SignalFfi.framework" \
    "$FFI_ARM64_DEVICE" "$FFI_HEADER_DIR"
  assemble_signalffi_framework "$BUILD_OUT/sim/SignalFfi.framework" \
    "$FFI_SIM_FAT" "$FFI_HEADER_DIR"

  local DEST_XCF="$PKG_DIR/ios/SignalFfi.xcframework"
  rm -rf "$DEST_XCF"
  echo "→ packaging SignalFfi.xcframework (device + sim slices)"
  xcodebuild -create-xcframework \
    -framework "$BUILD_OUT/device/SignalFfi.framework" \
    -framework "$BUILD_OUT/sim/SignalFfi.framework" \
    -output "$DEST_XCF"
  echo "→ vendored $DEST_XCF"

  # Copy upstream Swift wrappers into the pod source tree. They compile as
  # part of the ChatCrypto pod's Swift module — see ChatCrypto.podspec's
  # `LibSignalClient/**/*.swift` glob. The wrappers `import SignalFfi`,
  # resolved by the vendored xcframework above.
  local SRC_SWIFT="$LIBSIGNAL_DIR/swift/Sources/LibSignalClient"
  local DEST_SWIFT="$PKG_DIR/ios/LibSignalClient"
  [ -d "$SRC_SWIFT" ] || {
    echo "upstream Swift wrappers not found at $SRC_SWIFT" >&2
    exit 3
  }
  rm -rf "$DEST_SWIFT"
  cp -R "$SRC_SWIFT" "$DEST_SWIFT"

  # Rewrite self-qualifying `LibSignalClient.` prefix to `ChatCrypto.`.
  # Upstream qualifies a few internal calls (e.g. invokeAsyncFunction in
  # TokioAsyncContext.swift) with the module name to skip past a shadowing
  # instance method of the same name on `self`. Inside our pod the
  # vendored wrappers compile AS the ChatCrypto module — the qualified form
  # `LibSignalClient.x` is a "cannot find 'LibSignalClient' in scope" error,
  # but `ChatCrypto.x` resolves correctly (internal symbols are reachable
  # via module-qualified syntax within the same module). Naively stripping
  # the prefix triggers "use of X refers to instance method rather than
  # global function" inside any class that defines its own method of the
  # same name — module qualification is required to escape the shadow.
  # Single sed pass over the vendored tree; reapplied on every rebuild.
  # NB: if the pod is ever renamed away from "ChatCrypto", update the
  # substitution target here too.
  find "$DEST_SWIFT" -name '*.swift' -type f -print0 \
    | xargs -0 sed -i '' 's/\bLibSignalClient\./ChatCrypto./g'
  echo "→ vendored Swift wrappers to $DEST_SWIFT (LibSignalClient. → ChatCrypto.)"

  # Cull wrapper files we don't use for chunk 1C (PQXDH bundle, sessions,
  # encrypt/decrypt). Keeping them in causes link-time errors — features
  # like MessageBackup pull undefined symbols (signal_comparable_backup_*)
  # and Media/Net pull SwiftUI/CoreAudio auto-links the host app can't
  # satisfy. Whitelist would be cleaner long-term but the upstream file set
  # churns version-to-version; denylist is easier to keep current.
  #
  # NB: Error.swift references types defined in some of these files
  # (RegistrationError, MessageBackupValidationError, LoggerBridge). One-
  # time hand patches to Error.swift live in the vendored copy under
  # packages/chat-crypto/ios/LibSignalClient/Error.swift — if you bump
  # libsignal and the patches drop out, surgery is: remove the
  # SignalErrorCodeBackupValidation + SignalErrorCodeRegistration* cases
  # (they fall through to `default:`), and replace the LoggerBridge guard
  # in failOnError() with a direct fatalError. See git history for context.
  echo "→ culling unused wrapper files (chunk 1C scope)"
  (
    cd "$DEST_SWIFT"
    rm -f \
      AccountKeys.swift \
      Aes256Ctr.swift Aes256Gcm.swift Aes256GcmSiv.swift \
      Cds2.swift CdsTypes.swift \
      "ChatConnection+Fake.swift" ChatConnection.swift ChatListener.swift ChatServiceTypes.swift \
      ComparableBackup.swift MessageBackup.swift \
      DataStoreInMemory.swift \
      DeviceId.swift DeviceTransfer.swift \
      Fingerprint.swift \
      HsmEnclave.swift \
      IncrementalMac.swift \
      KeyTransparency.swift \
      Logging.swift \
      Media.swift \
      Net.swift \
      ProvisioningConnection.swift RegistrationService.swift RegistrationServiceTypes.swift \
      SealedSender.swift SealedSenderCertificates.swift \
      SecureValueRecoveryBackup.swift Svr2.swift \
      Sgx.swift \
      SignedPublicPreKey.swift \
      TokioAsyncContext.swift \
      UploadForm.swift \
      Username.swift
    # Within zkgroup/ we keep only ByteArray.swift + Randomness.swift —
    # both are referenced by BorrowUtils.swift / Utils.swift (kept) and have
    # zero dependencies on the rest of zkgroup. Delete the rest.
    find zkgroup -mindepth 1 -maxdepth 1 \
      ! -name 'ByteArray.swift' ! -name 'Randomness.swift' \
      -exec rm -rf {} +
    rm -rf chat
  )

  hash_dir "$DEST_XCF"
  hash_dir "$DEST_SWIFT"

  echo
  echo "  commit:"
  echo "    $DEST_XCF/  + $DEST_XCF.sha256"
  echo "    $DEST_SWIFT/ + $DEST_SWIFT.sha256"
  echo "    (built from libsignal $LIBSIGNAL_REF)"
  echo "  next: pnpm rn:rebuild-ios   # from repo root"
  echo "        (or  pnpm rebuild-ios  from apps/mobile)"
}

case "${1:-}" in
  android) build_android ;;
  ios)     build_ios ;;
  *)       echo "usage: $0 (android|ios)" >&2; exit 1 ;;
esac
