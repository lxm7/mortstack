// Type stub so the client plugin gets proper inference.
// Kept separate to avoid importing server-only code on the client.
export type SuiWalletPlugin = {
  id: "sui-wallet";
  endpoints: {
    suiGetNonce: { method: "POST"; path: "/sui/get-nonce" };
    suiVerify: { method: "POST"; path: "/sui/verify" };
  };
};
