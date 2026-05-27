// ── chat-push Lambda secrets ────────────────────────────────────────────────
// APNs and FCM credentials for the M6 push fanout Lambda.
//
// Setup (per stage):
//
//   APNs (Apple Push):
//     sst secret set ApnsTeamId      <YOUR_10_CHAR_TEAM_ID>
//     sst secret set ApnsKeyId       <YOUR_10_CHAR_KEY_ID>
//     sst secret set ApnsAuthKey     "$(cat AuthKey_XXXXXXXXXX.p8)"
//     sst secret set ApnsEnvironment sandbox    # or "production"
//
//   FCM (Firebase Cloud Messaging) — HTTP v1 with a service-account JSON:
//     sst secret set FcmServiceAccount "$(cat service-account.json)"
//
// All five are referenced from services/chat-push via Resource.X.value.

export const apnsTeamId = new sst.Secret("ApnsTeamId");
export const apnsKeyId = new sst.Secret("ApnsKeyId");
export const apnsAuthKey = new sst.Secret("ApnsAuthKey");
// "sandbox" for dev / TestFlight, "production" for App Store builds.
export const apnsEnvironment = new sst.Secret("ApnsEnvironment");
export const fcmServiceAccount = new sst.Secret("FcmServiceAccount");

export const chatPushSecrets = [
  apnsTeamId,
  apnsKeyId,
  apnsAuthKey,
  apnsEnvironment,
  fcmServiceAccount,
];
