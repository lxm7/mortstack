#!/usr/bin/env bash
# Restore a package's gitignored native binary from R2 and verify it against the
# committed checksum manifest. Runs as the EAS `eas-build-pre-install` hook (on
# Expo's builder, before `pod install`) and anywhere else the xcframework binary
# is needed but not in git.
#
# Contract (see docs/adr — non-reproducible binaries → CI is the sole builder):
#   * The Mach-O binary inside chat_mls_coreFFI.xcframework is gitignored (too
#     large + non-reproducible). Headers/plist/modulemap + the .sha256 manifest
#     + .artifact-key ARE committed.
#   * The producer workflow (native-artifacts.yml) builds the xcframework,
#     uploads it to R2 keyed by the source fingerprint, and commits the
#     refreshed manifest + .artifact-key. That published asset is what this
#     script fetches, so asset ↔ manifest always match.
#
# Usage:  scripts/fetch-native-artifacts.sh <ios|android>
#
# Env:
#   R2_PUBLIC_BASE_URL   (required) public-read base, e.g.
#                        https://native.example.com/mortstack — asset is
#                        fetched from "$R2_PUBLIC_BASE_URL/<asset>".
#   ALLOW_BUILD=1        (optional) on cache-miss, compile from source instead
#                        of failing. For local dev only — the EAS builder has no
#                        Rust toolchain, so it must hit the fast fetch path.
set -euo pipefail

TARGET="${1:?usage: fetch-native-artifacts.sh <ios|android>}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Artifact registry ─────────────────────────────────────────────────────────
# Extend with new rows as android AAR / chat-crypto SignalFfi come online.
case "$TARGET" in
  ios)
    PKG="packages/chat-mls-core"
    DEST_DIR="$PKG/ios"
    XCF="chat_mls_coreFFI.xcframework"
    MANIFEST="$XCF.sha256"                 # relative to $DEST_DIR
    ASSET_PREFIX="chat_mls_coreFFI-ios"
    BUILD_SCRIPT_TARGET="ios"
    ;;
  android)
    # TODO: android jniLibs (*.so) are gitignored too — same trap, not yet
    # published to R2. Soft no-op so android EAS builds aren't blocked by this
    # hook until the AAR pipeline is wired. Wire it here when ready.
    echo "native(android): AAR pipeline not yet published via R2 — skipping"
    exit 0
    ;;
  *)
    echo "fetch-native-artifacts: unsupported target '$TARGET'" >&2
    exit 2
    ;;
esac

# Verify the extracted tree against the committed manifest. hash_dir wrote paths
# relative to the xcframework dir, so we cd into it and point at ../<manifest>.
verify() {
  ( cd "$DEST_DIR/$XCF" && shasum -a 256 -c "../$MANIFEST" ) >/dev/null 2>&1
}

# Already present and valid (warm builder / re-run)? Nothing to do.
if [ -f "$DEST_DIR/$XCF/Info.plist" ] && verify; then
  echo "native($TARGET): $XCF present + verified — skip"
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
if [ -f "$DEST_DIR/$XCF/Info.plist" ] && ! verify; then
  echo "native($TARGET): CHECKSUM MISMATCH — $ASSET does not match committed $MANIFEST" >&2
fi

# ── Fallback ──────────────────────────────────────────────────────────────────
if [ "${ALLOW_BUILD:-0}" = "1" ]; then
  echo "native($TARGET): asset missing/invalid — building from source (ALLOW_BUILD=1)"
  pnpm --filter @repo/chat-mls-core "build:${BUILD_SCRIPT_TARGET}"
  verify && { echo "native($TARGET): built + verified"; exit 0; }
  echo "native($TARGET): local build produced a tree that fails $MANIFEST" >&2
  exit 1
fi

cat >&2 <<EOF
native($TARGET): artifact not available.
  asset : $ASSET
  key   : $KEY   (source fingerprint of $PKG)
  base  : ${R2_PUBLIC_BASE_URL:-<unset>}

The prebuilt xcframework for this source revision has not been published.
  → Run the 'Native artifacts' workflow (Actions ▸ workflow_dispatch), or
  → re-run locally with ALLOW_BUILD=1 to compile from source (needs Rust + Xcode).
EOF
exit 1
