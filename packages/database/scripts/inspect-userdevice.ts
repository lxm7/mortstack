import "dotenv/config";
import { prisma } from "../src";

async function main() {
  const rows = await prisma.userDevice.findMany({
    select: {
      id: true,
      accountId: true,
      deviceId: true,
      ed25519Pub: true,
      x25519Pub: true,
      bundleSignature: true,
      createdAt: true,
      updatedAt: true,
      account: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const r of rows) {
    console.log({
      id: r.id,
      accountEmail: r.account.email,
      accountId: r.accountId,
      deviceId: r.deviceId,
      ed25519PubLen: r.ed25519Pub.length,
      ed25519PubB64: Buffer.from(r.ed25519Pub).toString("base64"),
      x25519PubLen: r.x25519Pub.length,
      x25519PubB64: Buffer.from(r.x25519Pub).toString("base64"),
      sigLen: r.bundleSignature.length,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    });
  }
  console.log(`\ntotal rows: ${rows.length}`);
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
