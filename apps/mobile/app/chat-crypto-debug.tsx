import { useCallback, useState } from "react";
import { YStack, XStack, Text, Button, ScrollView } from "tamagui";
import { ChatCrypto } from "@repo/chat-crypto";

function hex(bytes: Uint8Array, max = 16): string {
  let s = "";
  const n = Math.min(bytes.length, max);
  for (let i = 0; i < n; i++) {
    s += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return bytes.length > max
    ? `${s}…(${bytes.length}B)`
    : `${s} (${bytes.length}B)`;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface RunOutcome {
  step: string;
  ok: boolean;
  detail: string;
}

export default function ChatCryptoDebug() {
  const [results, setResults] = useState<RunOutcome[]>([]);
  const [aliceFp, setAliceFp] = useState("?");
  const [bobFp, setBobFp] = useState("?");
  const [lastCipher, setLastCipher] = useState("?");

  const log = (step: string, ok: boolean, detail: string) => {
    setResults((prev) => [...prev, { step, ok, detail }]);
  };

  const runRoundTrip = useCallback(() => {
    setResults([]);
    setAliceFp("?");
    setBobFp("?");
    setLastCipher("?");

    try {
      // 1. Two identities.
      const aliceSeed = ChatCrypto.generateIdentitySeed();
      const bobSeed = ChatCrypto.generateIdentitySeed();
      const alice = ChatCrypto.derivePublicKeys(aliceSeed);
      const bob = ChatCrypto.derivePublicKeys(bobSeed);
      setAliceFp(hex(alice.ed25519Pub, 6));
      setBobFp(hex(bob.ed25519Pub, 6));
      log(
        "identity gen",
        true,
        `alice ed=${hex(alice.ed25519Pub, 4)} bob ed=${hex(bob.ed25519Pub, 4)}`,
      );

      // 2. Alice → Bob box.
      const plaintext = encoder.encode("hello bob, this is alice");
      const sealed = ChatCrypto.box(plaintext, bob.x25519Pub, aliceSeed);
      setLastCipher(hex(sealed.ciphertext, 12));
      log(
        "box (alice → bob)",
        sealed.nonce.length === 24 &&
          sealed.ciphertext.length === plaintext.length + 16,
        `nonce=${hex(sealed.nonce, 4)} cipher=${hex(sealed.ciphertext, 6)}`,
      );

      // 3. Bob decrypts.
      const opened = ChatCrypto.boxOpen(
        sealed.ciphertext,
        sealed.nonce,
        alice.x25519Pub,
        bobSeed,
      );
      const openedText = decoder.decode(opened);
      log(
        "boxOpen by bob",
        openedText === "hello bob, this is alice",
        `got: "${openedText}"`,
      );

      // 4. Charlie can't decrypt.
      const charlieSeed = ChatCrypto.generateIdentitySeed();
      try {
        ChatCrypto.boxOpen(
          sealed.ciphertext,
          sealed.nonce,
          alice.x25519Pub,
          charlieSeed,
        );
        log(
          "boxOpen by charlie (wrong key)",
          false,
          "EXPECTED THROW, GOT SUCCESS",
        );
      } catch (err) {
        log(
          "boxOpen by charlie (wrong key)",
          true,
          `threw as expected: ${String(err).slice(0, 80)}`,
        );
      }

      // 5. Tampered ciphertext fails.
      const tampered = new Uint8Array(sealed.ciphertext);
      tampered[0] = (tampered[0] ?? 0) ^ 0xff;
      try {
        ChatCrypto.boxOpen(tampered, sealed.nonce, alice.x25519Pub, bobSeed);
        log("boxOpen of tampered cipher", false, "EXPECTED THROW, GOT SUCCESS");
      } catch (err) {
        log(
          "boxOpen of tampered cipher",
          true,
          `threw as expected: ${String(err).slice(0, 80)}`,
        );
      }

      // 6. Sign + verify (Alice signs, Bob verifies w/ Alice's Ed25519 pub).
      const msg = encoder.encode("alice key bundle v1");
      const sig = ChatCrypto.signDetached(msg, aliceSeed);
      const verified = ChatCrypto.verifyDetached(msg, sig, alice.ed25519Pub);
      log("sign+verify (good)", verified, `sig=${hex(sig, 6)}`);

      // 7. Verify with wrong pub fails.
      const badVerify = ChatCrypto.verifyDetached(msg, sig, bob.ed25519Pub);
      log(
        "verify with wrong pub",
        !badVerify,
        badVerify ? "WRONGLY VERIFIED" : "rejected as expected",
      );

      // 8. Determinism: same seed → same public keys.
      const aliceAgain = ChatCrypto.derivePublicKeys(aliceSeed);
      const sameEd = Buffer.from(aliceAgain.ed25519Pub).equals(
        Buffer.from(alice.ed25519Pub),
      );
      const sameX = Buffer.from(aliceAgain.x25519Pub).equals(
        Buffer.from(alice.x25519Pub),
      );
      log(
        "derivePublicKeys is deterministic",
        sameEd && sameX,
        `ed match=${sameEd}, x match=${sameX}`,
      );
    } catch (err) {
      log("FATAL", false, String(err));
    }
  }, []);

  if (!__DEV__) {
    return (
      <YStack f={1} bg="$background" ai="center" jc="center">
        <Text color="$color">Not available in production.</Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="$background" p="$4" gap="$3">
      <Text color="$color" fontSize="$7" fontWeight="700">
        chat-crypto debug
      </Text>
      <Text color="$color" fontSize="$3">
        alice ed25519 fp: {aliceFp}
      </Text>
      <Text color="$color" fontSize="$3">
        bob ed25519 fp: {bobFp}
      </Text>
      <Text color="$color" fontSize="$3">
        last cipher: {lastCipher}
      </Text>

      <XStack gap="$2">
        <Button onPress={runRoundTrip}>Run round-trip suite</Button>
      </XStack>

      <ScrollView f={1}>
        <YStack gap="$2">
          {results.map((r, i) => (
            <YStack
              key={i}
              bg="$backgroundHover"
              p="$2"
              borderRadius="$2"
              gap="$1"
            >
              <Text
                color={r.ok ? "green" : "red"}
                fontSize="$3"
                fontWeight="600"
              >
                {r.ok ? "PASS" : "FAIL"} · {r.step}
              </Text>
              <Text color="$color" fontSize="$2">
                {r.detail}
              </Text>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
