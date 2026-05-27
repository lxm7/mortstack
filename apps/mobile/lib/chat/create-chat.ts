// Two-step "new chat" sequence stitching the server chat-row creation and
// the local MLS group provisioning. Used by the New Chat picker screen +
// any future flow that wants a chat row from accountIds.
//
// Sequencing rationale (per M4-1 Q1e): non-atomic. If the MLS group / add
// step fails (e.g. peer has 0 KeyPackages right now), the chat row + member
// rows still exist on the server. UI surfaces the failure; user can retry.

import { trpc } from "@/lib/trpc/client";
import { getMlsClient } from "@/lib/chat/mls-auto-publish";

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

  const { groupId } = await client.createGroup({ chatId: created.chatId });

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
