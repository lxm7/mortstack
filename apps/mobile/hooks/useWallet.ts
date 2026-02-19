import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const WALLET_KEY = "sui.wallet.privateKey";

/**
 * Manages the user's in-app SUI wallet.
 *
 * Private key is stored in iOS Keychain / Android Keystore via expo-secure-store.
 * Never leaves the device unencrypted.
 *
 * Future: Support external wallet apps (Sui Wallet, Suiet) via deep-link.
 */
export function useWallet() {
  const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const privateKeyB64 = await SecureStore.getItemAsync(WALLET_KEY);
      if (privateKeyB64) {
        const kp = Ed25519Keypair.fromSecretKey(privateKeyB64);
        setKeypair(kp);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function createWallet(): Promise<string> {
    const kp = new Ed25519Keypair();
    const privateKeyB64 = kp.getSecretKey();
    await SecureStore.setItemAsync(WALLET_KEY, privateKeyB64, {
      // Require biometric auth to access key on supported devices
      requireAuthentication: true,
      authenticationPrompt: "Authenticate to access your wallet",
    });
    setKeypair(kp);
    return kp.getPublicKey().toSuiAddress();
  }

  async function sign(message: string): Promise<string> {
    if (!keypair) throw new Error("No wallet found. Please create one first.");
    const messageBytes = new TextEncoder().encode(message);
    const { signature } = await keypair.signPersonalMessage(messageBytes);
    return signature;
  }

  async function deleteWallet() {
    await SecureStore.deleteItemAsync(WALLET_KEY);
    setKeypair(null);
  }

  return {
    address: keypair?.getPublicKey().toSuiAddress() ?? null,
    keypair,
    isLoading,
    createWallet,
    sign,
    deleteWallet,
  };
}
