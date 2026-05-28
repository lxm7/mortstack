# Sessions FCM data-only handler (Android)

M6 push decryption (ADR-013). Counterpart to the iOS NSE: runs in-process,
receives data-only FCM messages, decrypts the MLS application payload via
the sealed snapshot, and posts a `NotificationCompat` with plaintext.

## Files

- `SessionsFirebaseMessagingService.kt` — extends `FirebaseMessagingService`.
- `MlsAndroidDecryptor.kt` — reads sealed snapshot + identity seed, drives
  the OpenMLS engine ephemerally.

## Manual setup (until config plugin lands)

After `pnpm expo prebuild --clean`, add the following to
`android/app/src/main/AndroidManifest.xml` inside `<application>`:

```xml
<service
  android:name="io.sessions.app.push.SessionsFirebaseMessagingService"
  android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

Copy `google-services.json` from the Firebase console into
`apps/mobile/android/app/google-services.json` (or set via EAS secret).

Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
  implementation platform('com.google.firebase:firebase-bom:33.5.1')
  implementation 'com.google.firebase:firebase-messaging-ktx'
  implementation 'androidx.security:security-crypto:1.1.0-alpha06'
  implementation 'com.goterl:lazysodium-android:5.1.0@aar'
  implementation 'net.java.dev.jna:jna:5.13.0@aar'
  // chat_mls_core AAR — vended by packages/chat-mls-core via UniFFI.
}
```

And in `android/build.gradle` (top-level) `dependencies`:

```gradle
classpath 'com.google.gms:google-services:4.4.2'
```

## Plaintext shape contract

`MlsAndroidDecryptor.parsePlaintext` consumes the chat-transport
plaintext frame:

```json
{ "t": "msg-plaintext-v1", "sender": "Alex", "body": "hi" }
```

Same as iOS NSE. Defined in `packages/chat-transport/src/envelope.ts`.

## Stale-snapshot fallback

Any decrypt failure → `postGeneric()` posts "New message". Tracked in
ADR-015 §M6 as the read-only-snapshot race mitigation.
