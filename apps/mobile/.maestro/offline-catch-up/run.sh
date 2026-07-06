#!/usr/bin/env bash
# Two-simulator orchestrator for the offline message-backfill acceptance
# (docs/message-backfill.md). Maestro drives ONE app instance per invocation, so
# a genuine "peer sends while I'm offline" scenario needs two sims and three
# sequenced sub-runs — this script is that sequencer:
#
#   1. BOB   → bob-go-offline.yaml      (sign in, open chat, kill app = offline)
#   2. ALICE → alice-send.yaml          (send N, wait until persisted to Neon)
#   3. BOB   → bob-relaunch-assert.yaml (relaunch, assert all N caught up)
#
# Because the WS is dead for step 1's whole duration, Alice's step-2 messages are
# persisted but their live fanout to Bob is dropped — so step 3 passing is proof
# the backfill path (not local hydration) delivered them.
#
# Usage:
#   export MAESTRO_APP_ID=io.sessions.app       # app.json → ios/android id
#   export BOB_SIM=<bob-sim-udid>               # `xcrun simctl list devices`
#   export ALICE_SIM=<alice-sim-udid>
#   ./run.sh
#
# Precondition: a direct alice↔bob chat already exists as the top row on BOTH
# devices (see README → "One-time chat establishment"). E2EE chats can't be
# seeded; the MLS group is provisioned on-device at chat-create time.
set -euo pipefail

: "${MAESTRO_APP_ID:?set MAESTRO_APP_ID (matches app.json ios/android identifier)}"
: "${BOB_SIM:?set BOB_SIM to the Bob simulator UDID}"
: "${ALICE_SIM:?set ALICE_SIM to the Alice simulator UDID}"

if ! command -v maestro >/dev/null 2>&1; then
  echo "maestro not found — install from https://maestro.mobile.dev" >&2
  exit 127
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

banner() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

banner "Phase 1/3 — Bob goes offline (device $BOB_SIM)"
maestro --device "$BOB_SIM" test "$HERE/bob-go-offline.yaml"

banner "Phase 2/3 — Alice sends while Bob is offline (device $ALICE_SIM)"
maestro --device "$ALICE_SIM" test "$HERE/alice-send.yaml"

banner "Phase 3/3 — Bob relaunches and catches up (device $BOB_SIM)"
maestro --device "$BOB_SIM" test "$HERE/bob-relaunch-assert.yaml"

banner "✅ offline catch-up verified: all messages sent while Bob was offline rendered after relaunch"
