# Sessions Notification Service Extension (iOS NSE)

M6 push decryption (ADR-013). Runs out-of-process to decrypt MLS-encrypted
chat push payloads before iOS shows the notification.

## Files

- `NotificationService.swift` — UNNotificationServiceExtension entry point.
- `MlsNseDecryptor.swift` — loads sealed snapshot + identity seed, drives
  the OpenMLS engine ephemerally to decrypt one application message.
- `Info.plist` — NSExtension declaration (`com.apple.usernotifications.service`).
- `NotificationService.entitlements` — App Group + Keychain group access.

## Manual setup (until config plugin lands)

Run `pnpm expo prebuild --clean` first to regenerate the iOS project, then
in Xcode (`apps/mobile/ios/Sessions.xcworkspace`):

1. **Add new target** → iOS → Notification Service Extension. Name it
   `SessionsNotificationService`, language Swift, embed in the main app
   `Sessions` target.
2. **Replace generated files** with the four checked-in here. Drag them
   into the new target group; ensure target membership is the NSE only
   (NOT the main `Sessions` target).
3. **Build phases → Link Binary With Libraries**:
   - Add `Sodium.framework` (libsodium Swift wrapper — same one used by
     `@repo/chat-crypto`).
   - Add the OpenMLS UniFFI XCFramework that `packages/chat-mls-core`
     ships (`chat_mls_core.xcframework`).
4. **Capabilities** (on the NSE target):
   - App Groups → `group.io.sessions.shared` (also enable on main app).
   - Keychain Sharing → `io.sessions.chat`.
5. **Deployment target** ≥ iOS 16 (matches main app).
6. **Provisioning**: dev profile must include the NSE app id
   `io.sessions.app.NotificationService` and the App Group.

After Xcode edits, **do not** re-run `expo prebuild --clean` without
first migrating these manual additions into a config plugin — prebuild
overwrites the Xcode project. Tracked as a follow-up.

## Engine API contract

`MlsNseDecryptor` calls `ChatMlsCore.engineForNse(snapshot:)` and
`engine.processNseApplication(ciphertext:nonce:)`. Both methods are
expected to:

- Build an ephemeral OpenMLS engine from the snapshot bytes.
- Drive `process_message` for an application message only — REJECT
  commits, welcomes, and proposals (the main app is the single writer).
- Return the application plaintext as `Data`.
- Never persist or mutate state — the engine is discarded on return.

Implementation lives in `packages/chat-mls-core/src/engine.rs` under the
`#[cfg(feature = "nse")]` cfg gate, exposed via UniFFI.

## Stale-snapshot fallback

`NotificationService.swift` swallows ALL decrypt errors and presents
"New message — Open the app to view". This is the ADR-015 §M6
read-only-snapshot race mitigation: a push arriving on an epoch the
snapshot doesn't have falls through cleanly with zero plaintext leak.
