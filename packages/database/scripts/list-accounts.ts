import "dotenv/config";
import { prisma } from "../src";

async function main() {
  const rows = await prisma.account.findMany({
    select: {
      id: true,
      authUserId: true,
      email: true,
      identityTier: true,
      createdAt: true,
      _count: { select: { devices: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  for (const r of rows) {
    console.log({
      accountId: r.id,
      authUserId: r.authUserId,
      email: r.email,
      tier: r.identityTier,
      devices: r._count.devices,
      createdAt: r.createdAt.toISOString(),
    });
  }
  console.log(`\ntotal: ${rows.length}`);
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
