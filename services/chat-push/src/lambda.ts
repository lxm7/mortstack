// chat-push Lambda — APNs / FCM dispatcher for offline chat recipients
// (ADR-013, M6). SQS event source = chatPushQueue. Each SQS record wraps an
// SNS envelope whose Message field is a ChatDeliveredEvent.
//
// Hot path per record:
//   1. parse ChatDeliveredEvent
//   2. resolve recipientIds → PushToken rows, skip rows whose UserDevice is
//      currently attached over WS (event.attachedDeviceIds)
//   3. dispatch in parallel per platform (APNs HTTP/2 + FCM HTTP v1)
//   4. on 410-Gone / NotRegistered, DELETE PushToken to prevent retries
//
// Failure model: a record that fully fails returns its messageId in
// `batchItemFailures` so SQS redrives only the failed records. All other
// errors (per-token APNs 5xx etc.) are swallowed — they'd otherwise force
// a redrive that re-pushes already-delivered messages. The reconciliation
// Worker (ADR-013, deferred) is the long-tail correctness backstop.

import type {
  SQSEvent,
  SQSBatchItemFailure,
  SQSBatchResponse,
} from "aws-lambda";
import { prisma, PushPlatform } from "@repo/database";
import { sendApns, type ApnsResult } from "./apns";
import { sendFcm, type FcmResult } from "./fcm";

interface ChatDeliveredEvent {
  chatId: string;
  serverMsgId: string;
  senderId: string;
  recipientIds: string[];
  attachedDeviceIds: string[];
  ciphertextB64: string;
  nonceB64: string;
  ts: number;
}

interface SnsEnvelope {
  Type?: string;
  Message?: string;
}

function parseRecord(body: string): ChatDeliveredEvent | null {
  try {
    const env = JSON.parse(body) as SnsEnvelope;
    if (env?.Type !== "Notification" || typeof env.Message !== "string") {
      return null;
    }
    return JSON.parse(env.Message) as ChatDeliveredEvent;
  } catch {
    return null;
  }
}

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const failures: SQSBatchItemFailure[] = [];

  await Promise.all(
    event.Records.map(async (rec) => {
      const ev = parseRecord(rec.body);
      if (!ev) {
        // Bad payload — log and ack (no point redriving an unparseable msg).
        console.error("[chat-push] bad record", { messageId: rec.messageId });
        return;
      }
      try {
        await dispatch(ev);
      } catch (err) {
        console.error("[chat-push] dispatch failed", {
          messageId: rec.messageId,
          chatId: ev.chatId,
          serverMsgId: ev.serverMsgId,
          err: (err as Error).message,
        });
        failures.push({ itemIdentifier: rec.messageId });
      }
    }),
  );

  return { batchItemFailures: failures };
};

async function dispatch(ev: ChatDeliveredEvent): Promise<void> {
  if (ev.recipientIds.length === 0) return;

  // Pull every active push token for the recipient set in one query.
  // PushToken → UserDevice → Account → AuthUser. Join goes through
  // UserDevice.account.authUserId since recipientIds are Better Auth user
  // ids (chat-ws routing identity).
  const tokens = await prisma.pushToken.findMany({
    where: {
      disabledAt: null,
      device: {
        account: { authUserId: { in: ev.recipientIds } },
      },
    },
    select: {
      id: true,
      platform: true,
      token: true,
      appBundleId: true,
      device: { select: { deviceId: true } },
    },
  });

  if (tokens.length === 0) return;

  const attached = new Set(ev.attachedDeviceIds);
  const targets = tokens.filter((t) => !attached.has(t.device.deviceId));
  if (targets.length === 0) return;

  const apnsTargets = targets.filter((t) => t.platform === PushPlatform.APNS);
  const fcmTargets = targets.filter((t) => t.platform === PushPlatform.FCM);

  const [apnsResults, fcmResults] = await Promise.all([
    apnsTargets.length > 0
      ? sendApns(apnsTargets, ev)
      : Promise.resolve([] as ApnsResult[]),
    fcmTargets.length > 0
      ? sendFcm(fcmTargets, ev)
      : Promise.resolve([] as FcmResult[]),
  ]);

  // D7 — dead-token cleanup. 410-Gone (APNs) / UNREGISTERED (FCM) means the
  // app is uninstalled or token rotated; the row will never be valid again.
  const dead: string[] = [];
  for (const r of apnsResults) if (r.dead) dead.push(r.tokenId);
  for (const r of fcmResults) if (r.dead) dead.push(r.tokenId);
  if (dead.length > 0) {
    await prisma.pushToken.deleteMany({ where: { id: { in: dead } } });
  }
}
