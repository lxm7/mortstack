import type { IdentityProvider, IdentityCheckInit, IdentityCheckResult } from '../types';

/**
 * SUI Stake-based identity provider (Web3)
 *
 * Users lock a SUI stake to unlock CREATOR permissions.
 * Stake is slashed (partially burned) if content is repeatedly flagged.
 * Stake withdrawal removes CREATOR status.
 *
 * This creates economic skin-in-the-game without storing personal data.
 * Completely aligned with the platform's trust/transparency ethos.
 *
 * Current implementation: STUB
 * Production:
 *   1. Define a Move smart contract that:
 *      - Accepts SUI stake
 *      - Emits StakeDeposited event with walletAddress
 *      - Allows slashing by platform moderator key
 *      - Allows voluntary withdrawal (removes CREATOR tier)
 *   2. SUI Indexer listens for StakeDeposited events
 *   3. This provider queries the SUI indexer to confirm stake
 *
 * Grants: CREATOR tier
 * Required stake: configurable (e.g. 10 SUI)
 */
export class SuiStakeProvider implements IdentityProvider {
  readonly name = 'sui_stake';
  readonly tier = 'CREATOR' as const;

  private readonly requiredStake = BigInt(10_000_000_000); // 10 SUI in MIST

  async initiate(userId: string, metadata?: { walletAddress: string }): Promise<IdentityCheckInit> {
    if (!metadata?.walletAddress) {
      throw new Error('walletAddress required for stake-based verification');
    }

    // TODO: Return the contract address + required amount for the client to stake
    // Client will call the Move contract directly from their wallet

    console.warn('[SuiStakeProvider] STUB - Move contract not deployed');
    const externalId = `sui_stake_${metadata.walletAddress}_${Date.now()}`;

    return {
      externalId,
      // In prod: deep-link to wallet with pre-filled transaction
      redirectUrl: `sui://stake?contract=0xTODO&amount=${this.requiredStake}&ref=${externalId}`,
    };
  }

  async verify(externalId: string, proof: unknown): Promise<IdentityCheckResult> {
    const { txDigest } = proof as { txDigest: string };

    // TODO: Verify stake transaction on SUI
    // 1. Fetch transaction by digest from SUI RPC
    // 2. Confirm it calls the staking contract
    // 3. Confirm stake amount >= requiredStake
    // 4. Confirm staker address matches user's walletAddress

    console.warn('[SuiStakeProvider] STUB - not verifying on-chain');

    return {
      externalId,
      status: 'approved',
      tier: 'CREATOR',
      // Stake-based checks don't expire on a schedule, but expire if withdrawn
    };
  }

  async getStatus(externalId: string): Promise<IdentityCheckResult> {
    // TODO: Check if stake is still active (not withdrawn/slashed)
    return {
      externalId,
      status: 'pending',
      tier: 'CREATOR',
    };
  }
}
