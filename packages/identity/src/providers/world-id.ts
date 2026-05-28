import type {
  IdentityProvider,
  IdentityCheckInit,
  IdentityCheckResult,
} from "../types";

/**
 * World ID provider (Web3 - Worldcoin)
 * https://docs.worldcoin.org/
 *
 * Proof of personhood via iris scan → ZK proof.
 * No personal data is stored. Cryptographically unique per person.
 *
 * Current implementation: STUB - not wired up.
 * Production:
 *   1. Integrate World ID widget in mobile app
 *   2. Widget returns a ZK proof
 *   3. This provider verifies the proof against Worldcoin's API
 *
 * Grants: CREATOR tier (can upload audio/video)
 */
export class WorldIdProvider implements IdentityProvider {
  readonly name = "world_id";
  readonly tier = "CREATOR" as const;

  async initiate(userId: string): Promise<IdentityCheckInit> {
    // TODO: Generate World ID verification request
    // const appId = process.env.WORLD_ID_APP_ID;
    // const action = 'verify-creator';
    // Return the app_id + action for the client to pass to World ID widget

    console.warn("[WorldIdProvider] STUB - not implemented");
    const externalId = `worldid_${userId}_${Date.now()}`;

    return {
      externalId,
      // In prod: redirect/deep-link to World ID verification
      redirectUrl: `https://worldcoin.org/verify?action=verify-creator&signal=${userId}`,
    };
  }

  async verify(
    externalId: string,
    // proof: unknown,
  ): Promise<IdentityCheckResult> {
    // TODO: Verify ZK proof via Worldcoin Developer Portal API
    // POST https://developer.worldcoin.org/api/v2/verify/{app_id}
    // Body: { nullifier_hash, merkle_root, proof, verification_level, action, signal }

    console.warn("[WorldIdProvider] STUB - always approves in development");

    return {
      externalId,
      status: "approved",
      tier: "CREATOR",
    };
  }

  async getStatus(externalId: string): Promise<IdentityCheckResult> {
    return {
      externalId,
      status: "pending",
      tier: "CREATOR",
    };
  }
}
