import { PhoneProvider } from "./providers/phone";
import { WorldIdProvider } from "./providers/world-id";
import type { IdentityProvider } from "./types";

// Central registry of all identity providers
// To add a new provider: implement IdentityProvider, add it here
const providers: Record<string, IdentityProvider> = {
  phone: new PhoneProvider(),
  world_id: new WorldIdProvider(),
};

export function getProvider(name: string): IdentityProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(
      `Unknown identity provider: "${name}". Available: ${Object.keys(providers).join(", ")}`,
    );
  }
  return provider;
}

export function listProviders(): string[] {
  return Object.keys(providers);
}
