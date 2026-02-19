import { verifyPersonalMessageSignature } from "@mysten/sui/verify";

export interface WalletSignature {
  signature: string; // Base64 encoded signature
  message: string; // Original message that was signed
  address: string; // SUI wallet address
}

/**
 * Verify a SUI wallet signature
 * @param walletSignature - The signature object containing signature, message, and address
 * @returns true if signature is valid, false otherwise
 */
export async function verifySuiWalletSignature(
  walletSignature: WalletSignature,
): Promise<boolean> {
  try {
    const { signature, message, address } = walletSignature;

    // Verify the signature using SUI SDK
    const messageBytes = new TextEncoder().encode(message);

    const publicKey = await verifyPersonalMessageSignature(
      messageBytes,
      signature,
    );

    // Get the address from the public key and compare
    const derivedAddress = publicKey.toSuiAddress();

    return derivedAddress === address;
  } catch (error) {
    console.error("Wallet signature verification failed:", error);
    return false;
  }
}

/**
 * Generate a nonce message for wallet signing
 * Used to prevent replay attacks
 */
export function generateNonceMessage(nonce: string): string {
  const timestamp = new Date().toISOString();
  return `Sign this message to authenticate with the app.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
}

/**
 * Generate a random nonce
 */
export function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
