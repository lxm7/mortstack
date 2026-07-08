#!/usr/bin/env bash
# Restore a package's gitignored native binaries from R2 and verify them against
# the committed checksum manifest. Runs as the EAS `eas-build-pre-install` hook
# (on Expo's builder, before pod install / gradle) and anywhere else the
# binaries are needed but not in git.
#
# Contract (non-reproducible binaries → CI is the sole builder):
#   * The compiled binaries are gitignored (large + non-reproducible). Their
#     containing dir's headers/metadata + the .sha256 manifest ARE committed.
#     iOS  → chat_mls_coreFFI.xcframework/**/chat_mls_coreFFI (the Mach-O)
#     Android → android/src/main/jniLibs/*/libchat_mls_core.so
#   * The producer workflow (native-artifacts.yml) builds them, uploads to R2
#     keyed by the source fingerprint, and commits the refreshed manifest. So
#     the published asset always matches the committed manifest verified here.
#
# Usage:  scripts/fetch-native-artifacts.sh <ios|android>
#
# Env:
#   R2_PUBLIC_BASE_URL   (required on cache-miss) public-read base, e.g.
#                        https://pub-xxxx.r2.dev — asset fetched from
#                        "$R2_PUBLIC_BASE_URL/<asset>".
#   ALLOW_BUILD=1        (optional) on cache-miss, compile from source instead
#                        of failing. Local dev only — the EAS builder has no
#                        Rust/NDK toolchain, so it must hit the fetch path.
set -euo pipefail

TARGET="${1:?usage: fetch-native-artifacts.sh <ios|android>}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Artifact registry ─────────────────────────────────────────────────────────
# Each row: a directory of gitignored binaries ($ART_DIR) under $DEST_DIR,
# verified against a committed $MANIFEST sitting next to it, published to R2 as
# <ASSET_PREFIX>-<source-key>.tar.gz (tar rooted at $DEST_DIR so it unpacks
# straight back into place).
case "$TARGET" in
  ios)
    PKG="packages/chat-mls-core"
    DEST_DIR="$PKG/ios"
    ART_DIR="chat_mls_coreFFI.xcframework"
    MANIFEST="chat_mls_coreFFI.xcframework.sha256"
    ASSET_PREFIX="chat_mls_coreFFI-ios"
    ;;
  android)
    PKG="packages/chat-mls-core"
    DEST_DIR="$PKG/android/src/main"
    ART_DIR="jniLibs"
    MANIFEST="jniLibs.sha256"
    ASSET_PREFIX="chat_mls_core-android"
    ;;
  *)
    echo "fetch-native-artifacts: unsupported target '$TARGET'" >&2
    exit 2
    ;;
esac

# hash_dir wrote manifest paths relative to $ART_DIR, so verify from inside it
# against ../<manifest>. cd-fail (dir absent) → non-zero → treated as "absent".
verify() {
  ( cd "$DEST_DIR/$ART_DIR" 2>/dev/null && shasum -a 256 -c "../$MANIFEST" ) >/dev/null 2>&1
}

# Already present + valid (warm builder / re-run)? Nothing to do.
if verify; then
  echo "native($TARGET): $ART_DIR present + verified — skip"
  exit 0
fi

KEY="$(bash scripts/artifact-key.sh "$PKG" "$TARGET")"
ASSET="${ASSET_PREFIX}-${KEY}.tar.gz"

fetch() {
  local base="${R2_PUBLIC_BASE_URL:?set R2_PUBLIC_BASE_URL (public R2 base URL)}"
  local url="${base%/}/$ASSET"
  local tmp; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' RETURN
  echo "native($TARGET): fetching $url"
  curl -fSL --retry 3 --retry-delay 2 -o "$tmp/a.tgz" "$url" || return 1
  tar xzf "$tmp/a.tgz" -C "$DEST_DIR"
}

if fetch && verify; then
  echo "native($TARGET): fetched + verified ($ASSET)"
  exit 0
fi

# Extracted but checksum failed = corruption/tamper or stale asset ≠ manifest.
if [ -d "$DEST_DIR/$ART_DIR" ] && ! verify; then
  echo "native($TARGET): CHECKSUM MISMATCH — $ASSET does not match committed $MANIFEST" >&2
fi

# ── Fallback ──────────────────────────────────────────────────────────────────
if [ "${ALLOW_BUILD:-0}" = "1" ]; then
  echo "native($TARGET): asset missing/invalid — building from source (ALLOW_BUILD=1)"
  pnpm --filter @repo/chat-mls-core "build:${TARGET}"
  verify && { echo "native($TARGET): built + verified"; exit 0; }
  echo "native($TARGET): local build produced a tree that fails $MANIFEST" >&2
  exit 1
fi

cat >&2 <<EOF
native($TARGET): artifact not available.
  asset : $ASSET
  key   : $KEY   (source fingerprint of $PKG)
  base  : ${R2_PUBLIC_BASE_URL:-<unset>}

The prebuilt native artifact for this source revision has not been published.
  → Run the 'Native artifacts' workflow (Actions ▸ workflow_dispatch), or
  → re-run locally with ALLOW_BUILD=1 to compile from source (needs Rust; Android also NDK).
EOF
exit 1
