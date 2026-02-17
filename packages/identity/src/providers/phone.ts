import type { IdentityProvider, IdentityCheckInit, IdentityCheckResult } from '../types';

/**
 * Phone OTP provider (Web2)
 *
 * Current implementation: stub returning mock data.
 * Production: replace with Twilio Verify or AWS SNS.
 *
 * Grants: BASIC tier (can post images)
 */
export class PhoneProvider implements IdentityProvider {
  readonly name = 'phone';
  readonly tier = 'BASIC' as const;

  async initiate(userId: string, metadata?: { phoneNumber: string }): Promise<IdentityCheckInit> {
    if (!metadata?.phoneNumber) {
      throw new Error('phoneNumber required');
    }

    // TODO: Replace with Twilio Verify
    // const verification = await twilioClient.verify.v2
    //   .services(process.env.TWILIO_VERIFY_SID!)
    //   .verifications.create({ to: metadata.phoneNumber, channel: 'sms' });

    console.warn('[PhoneProvider] STUB - replace with Twilio in production');
    const externalId = `phone_${userId}_${Date.now()}`;

    return {
      externalId,
      clientToken: externalId, // In prod: Twilio session SID
    };
  }

  async verify(externalId: string, proof: unknown): Promise<IdentityCheckResult> {
    const { code } = proof as { code: string };

    // TODO: Replace with Twilio Verify check
    // const check = await twilioClient.verify.v2
    //   .services(process.env.TWILIO_VERIFY_SID!)
    //   .verificationChecks.create({ to: phoneNumber, code });

    console.warn('[PhoneProvider] STUB - always approves in development');

    return {
      externalId,
      status: 'approved',
      tier: 'BASIC',
    };
  }

  async getStatus(externalId: string): Promise<IdentityCheckResult> {
    return {
      externalId,
      status: 'approved',
      tier: 'BASIC',
    };
  }
}
