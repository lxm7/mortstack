# Maestro E2E — chat "alive" features (M8)

Flows for the typing-indicator / read-receipt / reaction work.

## What runs today

`chat-smoke.yaml` — a **single-client** smoke. One device can only observe the
**optimistic / local** surface of these features:

| Asserted (single client)                             | Not assertable (needs a 2nd actor)               |
| ---------------------------------------------------- | ------------------------------------------------ |
| Sending a message renders my bubble                  | A peer's **typing** indicator (self is excluded) |
| Long-press → quick-react tray → my **reaction pill** | **Read** double-tick (needs a peer to read)      |
| Composer input drives the typing emitter             | Reaction **fan-in** from another user            |

The cross-user half is deliberately out of scope here — it needs the 2-client
rig below. The deterministic core of all three features is already covered by
the vitest units in `packages/chat/src/*.test.ts`.

## Running

```sh
# install: https://maestro.mobile.dev
export MAESTRO_APP_ID=c   # match app.json → ios/android identifier
maestro test apps/mobile/.maestro/chat-smoke.yaml
```

Preconditions: a **built app** on a booted simulator/emulator, a **signed-in**
session, and **≥1 chat** on the conversations list (seed via
`packages/database/prisma/seed.ts`). The flow does not sign in — add sign-in
steps (or seed an authenticated session) for a cold-start CI run.

## E2E anchors added for these flows

- `chat-row` — Glacier `ListRow` (conversations list)
- `composer-input`, `composer-send` — Glacier `Composer`

Message text and reaction emoji are asserted by their visible text.

## Offline message backfill (2-simulator)

`offline-catch-up/` is the 2-client rig for the message-backfill acceptance
(`docs/message-backfill.md`): **kill Bob → Alice sends N → relaunch Bob → all N
render**. It exists because that scenario is impossible to fake on one device —
the whole point is messages Bob's socket never received live, so local hydration
can't stand in for them.

Maestro drives one app instance per run, so the flow is three sequenced
sub-runs across two sims, wired by `offline-catch-up/run.sh`:

| Phase | Sim   | Flow                       | What it proves                                                             |
| ----- | ----- | -------------------------- | -------------------------------------------------------------------------- |
| 1     | Bob   | `bob-go-offline.yaml`      | sign in, open chat, `stopApp` — dead process = dead WS = offline           |
| 2     | Alice | `alice-send.yaml`          | send N, wait until `latest-sent-message` confirms (= persisted to Neon)    |
| 3     | Bob   | `bob-relaunch-assert.yaml` | relaunch, assert all N visible — they can _only_ have arrived via backfill |

Phase 1's kill holds for phase 2's whole duration, so Alice's fanout to Bob's
`UserInbox` finds zero sockets and is dropped — phase 3 passing is proof the
`bf`/`bfd` path delivered them, not the live path.

**Strict ordering** of the merged thread is asserted by the vitest units
(`packages/chat/src/store.test.ts` → `ingestBackfill … sorted by serverSerial`);
the Maestro layer asserts **delivery**. That split keeps the flaky UI layer off
the deterministic invariants (dedupe / serial-order / cursor-monotonicity /
membership-gate are all unit-covered across `packages/{chat,chat-db,db-edge}`).

### Running

```sh
export MAESTRO_APP_ID=io.sessions.app          # app.json ios/android identifier
export BOB_SIM=<udid>   ALICE_SIM=<udid>        # xcrun simctl list devices
apps/mobile/.maestro/offline-catch-up/run.sh
```

### One-time chat establishment (precondition — cannot be seeded)

The flows assume a **direct alice↔bob chat is the top row on both devices**.
Unlike `chat-smoke`, this can't come from `packages/database/prisma/seed.ts`:
that seed builds only the social graph, and an **E2EE chat is not seedable** —
the device key private halves live in each sim's secure store and the MLS group
is provisioned on-device when the chat is created. Establish it once through the
apps (order matters — Bob must publish keys before Alice can add him):

1. **Bob sim:** launch, sign in as `bob@example.com` → device keys + MLS
   KeyPackages auto-publish to the server (`lib/chat/mls-auto-publish.ts`).
2. **Alice sim:** launch, sign in as `alice@example.com` → **New Chat** →
   Direct → search `bob` → tap the result. `createNewChat` provisions the MLS
   group (adds Bob via his KeyPackage) and opens the thread.
3. **Bob sim:** open the new chat once (consumes the MLS Welcome) so both sides
   are live members. Now `run.sh` is repeatable.

### Why not a headless peer script

A Node "Alice" that re-implements the libsodium/MLS seal to inject
Bob-decryptable ciphertext was rejected: it duplicates the crypto pipe, needs
out-of-band key coordination, and demonstrates none of the real
device-lifecycle path. Letting the two real apps encrypt is both less fragile
and the honest end-to-end exercise.

## Follow-ups (tracked, not built)

1. **2-client journey (rig).** Drive user A in Maestro while a second actor
   (user B) produces real traffic, then assert A's UI reflects it:
   B sends → A shows the message + typing pulse; A reacts → pill; B reads →
   A's tick flips to the primary double-check. Requires B to be a real MLS
   group member (so its frames decrypt on A). See the cost note in the PR/plan.
   (The `offline-catch-up/` rig above is the first instance of this pattern.)

2. **MLS out-of-order regression** (binary-gated). Lives in `chat-mls-core`
   (needs `node/index.node` via `pnpm run build:node`; the suite auto-skips
   when the binary is absent). Fire an interleaved same-sender
   message+reaction and assert both decrypt — guards the OpenMLS default
   `SenderRatchetConfiguration` out-of-order tolerance (=5) that
   `reactions-ride-send` relies on (`chat-mls-core/src/engine.rs:165` & `:267`
   leave it unset). A future config change lowering it must fail this test.
