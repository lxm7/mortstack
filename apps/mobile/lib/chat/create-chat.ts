// Two-step "new chat" sequence stitching the server chat-row creation and
// the local MLS group provisioning. Used by the New Chat picker screen +
// any future flow that wants a chat row from accountIds.
//
// Sequencing rationale (per M4-1 Q1e): non-atomic. If the MLS group / add
// step fails (e.g. peer has 0 KeyPackages right now), the chat row + member
// rows still exist on the server. UI surfaces the failure; user can retry.

import { getChatDb, mls as mlsStore } from "@repo/chat-db";
import { trpc } from "@/lib/trpc/client";
import { getMlsClient } from "@/lib/chat/mls-auto-publish";
import { clearChatGroupCache } from "./group-resolver";

// GroupId (Uint8Array) → base64 for the linkMlsGroup wire. Mirrors the encoder
// in publish.ts (Hermes provides global btoa); avoids a Buffer polyfill dep.
function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++)
    bin += String.fromCharCode(bytes[i] ?? 0);
  return btoa(bin);
}

export interface CreateNewChatInput {
  kind: "direct" | "group";
  name?: string | null;
  memberAccountIds: string[];
}

export interface CreateNewChatResult {
  chatId: string;
  existing: boolean;
  /** True when the MLS group exists locally + every requested peer has been
   *  added (Welcomes published). False if any peer's KeyPackage fetch
   *  failed — the chat row still exists, retry from the chat list. */
  mlsProvisioned: boolean;
}

export async function createNewChat(
  input: CreateNewChatInput,
): Promise<CreateNewChatResult> {
  const created = await trpc.chat.create.mutate({
    kind: input.kind,
    name: input.name ?? undefined,
    memberAccountIds: input.memberAccountIds,
  });

  console.log("[create-chat] create →", {
    chatId: created.chatId,
    existing: created.existing,
  });

  // Direct-chat idempotency (M4-1 Q1a): the chat + MLS group already exist
  // — skip the provisioning steps and just navigate.
  if (created.existing) {
    return {
      chatId: created.chatId,
      existing: true,
      mlsProvisioned: true,
    };
  }

  const client = getMlsClient();
  if (!client) {
    throw new Error(
      "MLS client not ready — wait for bootstrap before creating a chat",
    );
  }

  // Ensure the local chats row exists BEFORE createGroup so its internal
  // setChatMlsGroupId lands (ADR-016) — otherwise that row is only created by
  // the chat.list sync, which may not have run yet on the creator, and the
  // link silently no-ops (the old M4 gap).
  const { db } = await getChatDb();
  await mlsStore.upsertChat(db, { id: created.chatId, kind: input.kind });

  const { groupId } = await client.createGroup({ chatId: created.chatId });

  // Publish the group↔chat mapping so the other member(s) receive the GroupId
  // on chat.list and converge their local link. Must precede addMembers below,
  // since that publishes the Welcome that wakes the peer's chat.list refresh.
  await trpc.chat.linkMlsGroup.mutate({
    chatId: created.chatId,
    mlsGroupIdB64: bytesToB64(groupId),
  });
  clearChatGroupCache(created.chatId);
  console.log("[create-chat] mls linked", {
    chatId: created.chatId,
    groupIdLen: groupId.length,
  });

  let mlsProvisioned = true;
  if (input.memberAccountIds.length > 0) {
    try {
      await client.addMembersByAccounts({
        groupId,
        accountIds: input.memberAccountIds,
      });
    } catch (err) {
      mlsProvisioned = false;
      console.warn(
        "[create-chat] addMembersByAccounts failed — chat row exists, MLS join is pending",
        err,
      );
    }
  }

  return {
    chatId: created.chatId,
    existing: false,
    mlsProvisioned,
  };
}
