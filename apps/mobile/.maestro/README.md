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

## Follow-ups (tracked, not built)

1. **2-client journey (rig).** Drive user A in Maestro while a second actor
   (user B) produces real traffic, then assert A's UI reflects it:
   B sends → A shows the message + typing pulse; A reacts → pill; B reads →
   A's tick flips to the primary double-check. Requires B to be a real MLS
   group member (so its frames decrypt on A). See the cost note in the PR/plan.

2. **MLS out-of-order regression** (binary-gated). Lives in `chat-mls-core`
   (needs `node/index.node` via `pnpm run build:node`; the suite auto-skips
   when the binary is absent). Fire an interleaved same-sender
   message+reaction and assert both decrypt — guards the OpenMLS default
   `SenderRatchetConfiguration` out-of-order tolerance (=5) that
   `reactions-ride-send` relies on (`chat-mls-core/src/engine.rs:165` & `:267`
   leave it unset). A future config change lowering it must fail this test.
