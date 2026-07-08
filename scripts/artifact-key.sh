#!/usr/bin/env bash
# Deterministic content key for a package's native artifact.
#
# The key is a fingerprint of the Rust SOURCE inputs that determine the built
# binary — NOT the binary itself (the compiled xcframework is non-reproducible:
# embedded timestamps + build paths, see .gitignore). Producer and consumer both
# derive the key from the same committed source, so they agree on which asset to
# publish / fetch without trusting any binary hash.
#
# Usage:  scripts/artifact-key.sh <package-dir> <target>
#         scripts/artifact-key.sh packages/chat-mls-core ios
#
# No git dependency (runs on the EAS builder, which unpacks a tarball, not a
# repo) — resolves the repo root relative to this script.
set -euo pipefail

PKG="${1:?usage: artifact-key.sh <package-dir> <ios|android>}"
TARGET="${2:?usage: artifact-key.sh <package-dir> <ios|android>}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

[ -d "$PKG" ] || { echo "artifact-key: no such package dir: $PKG" >&2; exit 2; }

# Source set that feeds the native build. The `node/` subtree is a separate
# napi crate (not linked into the iOS xcframework), so it's excluded.
list_inputs() {
  printf '%s\n' \
    "$PKG/Cargo.toml" \
    "$PKG/Cargo.lock" \
    "$PKG/scripts/build-mls.sh"
  find "$PKG/src" -type f -name '*.rs' 2>/dev/null
}

# Hash each input's contents, then hash the sorted list of (hash, path) pairs.
# LC_ALL=C keeps sort order stable across machines. Target is folded in so
# ios/android keys differ even for identical source.
KEY="$(
  {
    printf 'target=%s\n' "$TARGET"
    list_inputs | LC_ALL=C sort -u | while IFS= read -r f; do
      [ -f "$f" ] && shasum -a 256 "$f"
    done
  } | shasum -a 256 | awk '{print $1}'
)"

# 16 hex chars — collision-safe for this scale, filename-friendly.
echo "${KEY:0:16}"
