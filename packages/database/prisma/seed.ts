import { PrismaClient } from "../src/generated";
import { faker } from "@faker-js/faker";
import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";

// Fixed seed → same data every run
faker.seed(42);

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function suiAddress(suffix: string) {
  return `0x${suffix.padEnd(64, "0")}`;
}

function audioUrl(slug: string) {
  return `https://cdn.example.com/audio/${slug}.mp3`;
}

function imageUrl(slug: string) {
  return `https://cdn.example.com/images/${slug}.jpg`;
}

function cuid() {
  return crypto.randomUUID();
}

// Create a Better Auth user chain: AuthUser + AuthAccount (credential) + domain Account.
// Better Auth stores passwords on AuthAccount (providerId="credential").
// Hash generated at seed time using Better Auth's own hasher for compatibility.
const SEED_PASSWORD = "password123";
let seedPasswordHash: string;

async function createSeededUser(opts: {
  email: string;
  name: string;
  walletAddress?: string;
  identityTier?: "NONE" | "BASIC" | "CREATOR" | "ARTIST";
  identityVerifiedAt?: Date;
}) {
  const authUserId = cuid();
  const now = new Date();

  // 1. Better Auth AuthUser
  await prisma.authUser.create({
    data: {
      id: authUserId,
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  // 2. Better Auth AuthAccount (email/password credential)
  await prisma.authAccount.create({
    data: {
      id: cuid(),
      accountId: authUserId,
      providerId: "credential",
      userId: authUserId,
      password: seedPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
  });

  // 3. Domain Account
  const account = await prisma.account.create({
    data: {
      authUserId,
      email: opts.email,
      walletAddress: opts.walletAddress,
      identityTier: opts.identityTier ?? "NONE",
      identityVerifiedAt: opts.identityVerifiedAt,
    },
  });

  return account;
}

// ── Wipe ──────────────────────────────────────────────────────────────────────
// Delete in FK-safe order — runs every time so seed is idempotent

async function wipe() {
  await prisma.$transaction([
    prisma.nFT.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.post.deleteMany(),
    prisma.profileMember.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.identityCheck.deleteMany(),
    prisma.account.deleteMany(),
    prisma.authAccount.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.authUser.deleteMany(),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  seedPasswordHash = await hashPassword(SEED_PASSWORD);

  console.log("Wiping existing data...");
  await wipe();

  // ── Accounts ────────────────────────────────────────────────────────────────
  // Real-world identities. Auth lives on AuthUser/AuthAccount (Better Auth).
  // Domain Account links to AuthUser and holds wallet, identity tier, etc.

  const alice = await createSeededUser({
    email: "alice@example.com",
    name: "Alice",
    walletAddress: suiAddress("alice"),
    identityTier: "ARTIST",
    identityVerifiedAt: new Date(),
  });

  const bob = await createSeededUser({
    email: "bob@example.com",
    name: "Bob",
    walletAddress: suiAddress("bob"),
    identityTier: "CREATOR",
    identityVerifiedAt: new Date(),
  });

  const carol = await createSeededUser({
    email: "carol@example.com",
    name: "Carol",
    identityTier: "CREATOR",
    identityVerifiedAt: new Date(),
  });

  const dave = await createSeededUser({
    email: "dave@example.com",
    name: "Dave",
    identityTier: "BASIC",
    identityVerifiedAt: new Date(),
  });

  const eve = await createSeededUser({
    email: "eve@example.com",
    name: "Eve",
    identityTier: "BASIC",
    identityVerifiedAt: new Date(),
  });

  // New user — no profiles yet, unverified
  await createSeededUser({
    email: "frank@example.com",
    name: "Frank",
  });

  console.log("Accounts created");

  // ── Profiles ─────────────────────────────────────────────────────────────────
  // Public personas. One account can own/be a member of many.

  // Alice: musician + visual artist (two profiles, one person)
  const aliceMusic = await prisma.profile.create({
    data: {
      handle: "alice-music",
      displayName: "Alice",
      type: "MUSICIAN",
      bio: "Producer, vocalist, and multi-instrumentalist based in London. Blending electronica with organic textures.",
      avatar: imageUrl("avatar-alice-music"),
      isVerified: true,
      reputation: 1840,
      members: { create: { accountId: alice.id, role: "OWNER" } },
    },
  });

  const aliceStudio = await prisma.profile.create({
    data: {
      handle: "alice-studio",
      displayName: "Alice Studio",
      type: "VISUAL_ARTIST",
      bio: "Generative art and music visualisations. Tools: TouchDesigner, p5.js.",
      avatar: imageUrl("avatar-alice-studio"),
      reputation: 620,
      members: { create: { accountId: alice.id, role: "OWNER" } },
    },
  });

  // Bob: solo musician + co-owner of a band
  const bobBeats = await prisma.profile.create({
    data: {
      handle: "bob-beats",
      displayName: "Bob Beats",
      type: "MUSICIAN",
      bio: "Techno and acid house. Residency at Fabric. SUI maxi.",
      avatar: imageUrl("avatar-bob-beats"),
      reputation: 980,
      members: { create: { accountId: bob.id, role: "OWNER" } },
    },
  });

  // Band profile — Bob (OWNER) + Carol (MEMBER)
  const theCollective = await prisma.profile.create({
    data: {
      handle: "the-collective",
      displayName: "The Collective",
      type: "BAND",
      bio: "Experimental electronic duo. Live AV performances. Debut EP out now.",
      avatar: imageUrl("avatar-the-collective"),
      reputation: 540,
      members: {
        create: [
          { accountId: bob.id, role: "OWNER" },
          { accountId: carol.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Carol: visual artist (also band member above, no extra step needed)
  const carolCreates = await prisma.profile.create({
    data: {
      handle: "carol-creates",
      displayName: "Carol Creates",
      type: "VISUAL_ARTIST",
      bio: "NFT artist. Abstract forms and colour theory. Former architect.",
      avatar: imageUrl("avatar-carol-creates"),
      reputation: 2100,
      members: { create: { accountId: carol.id, role: "OWNER" } },
    },
  });

  // Dave: venue
  const fabricLondon = await prisma.profile.create({
    data: {
      handle: "fabric-london",
      displayName: "Fabric London",
      type: "VENUE",
      bio: "London's underground techno club. Open Fri–Sun. Capacity 1500.",
      avatar: imageUrl("avatar-fabric-london"),
      isVerified: true,
      reputation: 5400,
      members: { create: { accountId: dave.id, role: "OWNER" } },
    },
  });

  // Eve: promoter
  const warehouseEvents = await prisma.profile.create({
    data: {
      handle: "warehouse-events",
      displayName: "Warehouse Events",
      type: "PROMOTER",
      bio: "Underground raves across the UK. Monthly listings on the site.",
      avatar: imageUrl("avatar-warehouse-events"),
      reputation: 1100,
      members: { create: { accountId: eve.id, role: "OWNER" } },
    },
  });

  console.log("Profiles created");

  // ── Posts ─────────────────────────────────────────────────────────────────────

  const posts: Record<string, { id: string }> = {};

  // alice-music — AUDIO and IMAGE (ARTIST tier)
  posts.aliceTrack = await prisma.post.create({
    data: {
      profileId: aliceMusic.id,
      content:
        'New track out now — "Drift" is probably the most personal thing I\'ve made. Mixed it three times before it felt right.',
      mediaUrls: [audioUrl("alice-drift")],
      mediaType: "AUDIO",
      likesCount: 84,
      commentsCount: 11,
    },
  });

  posts.aliceGig = await prisma.post.create({
    data: {
      profileId: aliceMusic.id,
      content: `Playing at ${fabricLondon.displayName} next Friday. Doors at 11. Come through.`,
      mediaUrls: [imageUrl("alice-fabric-flyer")],
      mediaType: "IMAGE",
      likesCount: 217,
      commentsCount: 28,
    },
  });

  posts.aliceThought = await prisma.post.create({
    data: {
      profileId: aliceMusic.id,
      content: faker.lorem.paragraph(3),
      mediaType: "TEXT",
      likesCount: 33,
      commentsCount: 4,
    },
  });

  // alice-studio — visual work
  posts.aliceVisual = await prisma.post.create({
    data: {
      profileId: aliceStudio.id,
      content:
        "Reactive visuals built for the Fabric set. p5.js + Web Audio API reading the live mix. Code is open source.",
      mediaUrls: [
        imageUrl("alice-visuals-preview-1"),
        imageUrl("alice-visuals-preview-2"),
      ],
      mediaType: "IMAGE",
      likesCount: 145,
      commentsCount: 19,
    },
  });

  // bob-beats
  posts.bobMix = await prisma.post.create({
    data: {
      profileId: bobBeats.id,
      content:
        "3 hour acid set recorded live at Tresor last month. No tracklist, figure it out.",
      mediaUrls: [audioUrl("bob-tresor-live")],
      mediaType: "AUDIO",
      likesCount: 310,
      commentsCount: 44,
    },
  });

  posts.bobText = await prisma.post.create({
    data: {
      profileId: bobBeats.id,
      content: faker.lorem.sentences(2),
      mediaType: "TEXT",
      likesCount: 27,
      commentsCount: 3,
    },
  });

  // the-collective — band posts
  posts.collectivePerformance = await prisma.post.create({
    data: {
      profileId: theCollective.id,
      content:
        "Live AV set from Unsound Festival 2025. Full 50 min performance — audio and visuals made in the room.",
      mediaUrls: [
        imageUrl("collective-unsound-1"),
        imageUrl("collective-unsound-2"),
        imageUrl("collective-unsound-3"),
      ],
      mediaType: "PERFORMANCE",
      likesCount: 509,
      commentsCount: 67,
    },
  });

  posts.collectiveAnnounce = await prisma.post.create({
    data: {
      profileId: theCollective.id,
      content:
        'Debut EP "In Stasis" — out 15 March on Bandcamp and SUI. Limited edition NFT bundle for early supporters.',
      mediaUrls: [imageUrl("collective-ep-artwork")],
      mediaType: "IMAGE",
      likesCount: 188,
      commentsCount: 34,
    },
  });

  // carol-creates — visual art + NFT preview
  posts.carolNftPreview = await prisma.post.create({
    data: {
      profileId: carolCreates.id,
      content:
        'Series 3 — "Dissolution" — 12 pieces. Each one took about two weeks. Going live on SUI next week.',
      mediaUrls: [
        imageUrl("carol-dissolution-1"),
        imageUrl("carol-dissolution-2"),
      ],
      mediaType: "IMAGE",
      likesCount: 643,
      commentsCount: 78,
    },
  });

  posts.carolProcess = await prisma.post.create({
    data: {
      profileId: carolCreates.id,
      content: faker.lorem.paragraph(2),
      mediaUrls: [imageUrl("carol-process-sketch")],
      mediaType: "IMAGE",
      likesCount: 92,
      commentsCount: 8,
    },
  });

  posts.carolThought = await prisma.post.create({
    data: {
      profileId: carolCreates.id,
      content: faker.lorem.sentences(3),
      mediaType: "TEXT",
      likesCount: 41,
      commentsCount: 5,
    },
  });

  // fabric-london — venue posts
  posts.fabricLineup = await prisma.post.create({
    data: {
      profileId: fabricLondon.id,
      content:
        "This Friday lineup is confirmed. Doors 11pm. Tickets link in bio.",
      mediaUrls: [imageUrl("fabric-friday-lineup")],
      mediaType: "IMAGE",
      likesCount: 1204,
      commentsCount: 93,
    },
  });

  posts.fabricRecap = await prisma.post.create({
    data: {
      profileId: fabricLondon.id,
      content: faker.lorem.sentences(2),
      mediaType: "TEXT",
      likesCount: 389,
      commentsCount: 22,
    },
  });

  // warehouse-events
  posts.warehouseEvent = await prisma.post.create({
    data: {
      profileId: warehouseEvents.id,
      content:
        "March event — full lineup announced. Presale goes live tomorrow 10am.",
      mediaUrls: [imageUrl("warehouse-march-flyer")],
      mediaType: "IMAGE",
      likesCount: 721,
      commentsCount: 55,
    },
  });

  posts.warehouseText = await prisma.post.create({
    data: {
      profileId: warehouseEvents.id,
      content: faker.lorem.sentences(2),
      mediaType: "TEXT",
      likesCount: 98,
      commentsCount: 7,
    },
  });

  console.log("Posts created");

  // ── Follows (Profile → Profile, cross-type) ───────────────────────────────────

  await prisma.follow.createMany({
    data: [
      // alice-music follows
      { followerId: aliceMusic.id, followingId: bobBeats.id },
      { followerId: aliceMusic.id, followingId: fabricLondon.id },
      { followerId: aliceMusic.id, followingId: warehouseEvents.id },
      { followerId: aliceMusic.id, followingId: theCollective.id },
      // alice-studio follows
      { followerId: aliceStudio.id, followingId: carolCreates.id },
      { followerId: aliceStudio.id, followingId: theCollective.id },
      // bob-beats follows
      { followerId: bobBeats.id, followingId: aliceMusic.id },
      { followerId: bobBeats.id, followingId: fabricLondon.id },
      { followerId: bobBeats.id, followingId: warehouseEvents.id },
      // the-collective follows
      { followerId: theCollective.id, followingId: aliceMusic.id },
      { followerId: theCollective.id, followingId: carolCreates.id },
      { followerId: theCollective.id, followingId: fabricLondon.id },
      // carol-creates follows
      { followerId: carolCreates.id, followingId: aliceStudio.id },
      { followerId: carolCreates.id, followingId: theCollective.id },
      { followerId: carolCreates.id, followingId: warehouseEvents.id },
      // fabric-london follows
      { followerId: fabricLondon.id, followingId: aliceMusic.id },
      { followerId: fabricLondon.id, followingId: bobBeats.id },
      { followerId: fabricLondon.id, followingId: warehouseEvents.id },
      { followerId: fabricLondon.id, followingId: theCollective.id },
      // warehouse-events follows
      { followerId: warehouseEvents.id, followingId: fabricLondon.id },
      { followerId: warehouseEvents.id, followingId: aliceMusic.id },
      { followerId: warehouseEvents.id, followingId: bobBeats.id },
    ],
  });

  console.log("Follows created");

  // ── Comments ──────────────────────────────────────────────────────────────────

  await prisma.comment.createMany({
    data: [
      {
        postId: posts.aliceTrack.id,
        profileId: bobBeats.id,
        content:
          "This is the one. Been waiting for this since you played it at Corsica.",
      },
      {
        postId: posts.aliceTrack.id,
        profileId: fabricLondon.id,
        content: "Getting added to our warm-up playlist immediately.",
      },
      {
        postId: posts.aliceTrack.id,
        profileId: carolCreates.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.aliceGig.id,
        profileId: warehouseEvents.id,
        content: "See you there. Alice always delivers.",
      },
      {
        postId: posts.aliceGig.id,
        profileId: theCollective.id,
        content: "We'll be in the crowd. Can't miss this.",
      },
      {
        postId: posts.aliceGig.id,
        profileId: bobBeats.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.bobMix.id,
        profileId: aliceMusic.id,
        content:
          "Tracked down the 4th track — it's a Jerry Sydenham edit. You're welcome.",
      },
      {
        postId: posts.bobMix.id,
        profileId: fabricLondon.id,
        content: "We want you back for the summer series.",
      },
      {
        postId: posts.bobMix.id,
        profileId: warehouseEvents.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.collectivePerformance.id,
        profileId: aliceMusic.id,
        content:
          "The section at 32 mins where the visuals sync to the kick — that's a whole moment.",
      },
      {
        postId: posts.collectivePerformance.id,
        profileId: carolCreates.id,
        content:
          "The visual system you built for this is genuinely impressive.",
      },
      {
        postId: posts.collectivePerformance.id,
        profileId: fabricLondon.id,
        content: "We need to talk about a date. DMs open.",
      },
      {
        postId: posts.collectivePerformance.id,
        profileId: warehouseEvents.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.carolNftPreview.id,
        profileId: aliceStudio.id,
        content: "The colour progression across the series is immaculate.",
      },
      {
        postId: posts.carolNftPreview.id,
        profileId: theCollective.id,
        content:
          "We'd love one of these as the backdrop for our next live show.",
      },
      {
        postId: posts.carolNftPreview.id,
        profileId: bobBeats.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.fabricLineup.id,
        profileId: aliceMusic.id,
        content: "See everyone Friday.",
      },
      {
        postId: posts.fabricLineup.id,
        profileId: bobBeats.id,
        content: "Presold out already? 😭",
      },
      {
        postId: posts.fabricLineup.id,
        profileId: warehouseEvents.id,
        content: faker.lorem.sentence(),
      },

      {
        postId: posts.warehouseEvent.id,
        profileId: fabricLondon.id,
        content: "Solid lineup as always.",
      },
      {
        postId: posts.warehouseEvent.id,
        profileId: aliceMusic.id,
        content: faker.lorem.sentence(),
      },
    ],
  });

  console.log("Comments created");

  // ── Likes ─────────────────────────────────────────────────────────────────────

  await prisma.like.createMany({
    data: [
      { postId: posts.aliceTrack.id, profileId: bobBeats.id },
      { postId: posts.aliceTrack.id, profileId: fabricLondon.id },
      { postId: posts.aliceTrack.id, profileId: theCollective.id },
      { postId: posts.aliceTrack.id, profileId: carolCreates.id },

      { postId: posts.aliceGig.id, profileId: bobBeats.id },
      { postId: posts.aliceGig.id, profileId: warehouseEvents.id },
      { postId: posts.aliceGig.id, profileId: fabricLondon.id },

      { postId: posts.bobMix.id, profileId: aliceMusic.id },
      { postId: posts.bobMix.id, profileId: theCollective.id },
      { postId: posts.bobMix.id, profileId: warehouseEvents.id },

      { postId: posts.collectivePerformance.id, profileId: aliceMusic.id },
      { postId: posts.collectivePerformance.id, profileId: carolCreates.id },
      { postId: posts.collectivePerformance.id, profileId: fabricLondon.id },
      { postId: posts.collectivePerformance.id, profileId: warehouseEvents.id },

      { postId: posts.carolNftPreview.id, profileId: aliceStudio.id },
      { postId: posts.carolNftPreview.id, profileId: theCollective.id },
      { postId: posts.carolNftPreview.id, profileId: bobBeats.id },

      { postId: posts.aliceVisual.id, profileId: carolCreates.id },
      { postId: posts.aliceVisual.id, profileId: theCollective.id },

      { postId: posts.fabricLineup.id, profileId: aliceMusic.id },
      { postId: posts.fabricLineup.id, profileId: bobBeats.id },
      { postId: posts.fabricLineup.id, profileId: warehouseEvents.id },
      { postId: posts.fabricLineup.id, profileId: theCollective.id },

      { postId: posts.warehouseEvent.id, profileId: fabricLondon.id },
      { postId: posts.warehouseEvent.id, profileId: aliceMusic.id },
      { postId: posts.warehouseEvent.id, profileId: bobBeats.id },

      { postId: posts.collectiveAnnounce.id, profileId: aliceMusic.id },
      { postId: posts.collectiveAnnounce.id, profileId: carolCreates.id },
      { postId: posts.collectiveAnnounce.id, profileId: fabricLondon.id },
    ],
  });

  console.log("Likes created");

  // ── NFTs ──────────────────────────────────────────────────────────────────────
  // Only ARTIST tier accounts can mint. Alice = ARTIST.

  await prisma.nFT.create({
    data: {
      profileId: aliceMusic.id,
      postId: posts.aliceTrack.id,
      objectId: suiAddress("nft-alice-drift"),
      packageId: suiAddress("pkg-music-nft"),
      moduleId: "music_nft",
      type: "MUSIC",
      name: "Drift — Original Master",
      description: "Limited edition master recording. 50 editions.",
      imageUrl: imageUrl("alice-drift-artwork"),
      metadataUri: "https://cdn.example.com/metadata/alice-drift.json",
      isListed: true,
      price: "50000000000", // 50 SUI
    },
  });

  await prisma.nFT.create({
    data: {
      profileId: carolCreates.id,
      postId: posts.carolNftPreview.id,
      objectId: suiAddress("nft-carol-dissolution-1"),
      packageId: suiAddress("pkg-art-nft"),
      moduleId: "art_nft",
      type: "ART",
      name: "Dissolution #01",
      description: "First piece in the Dissolution series. 1 of 1.",
      imageUrl: imageUrl("carol-dissolution-1"),
      metadataUri: "https://cdn.example.com/metadata/carol-dissolution-01.json",
      isListed: true,
      price: "200000000000", // 200 SUI
    },
  });

  console.log("NFTs created");

  // ── Summary ───────────────────────────────────────────────────────────────────

  const counts = await prisma.$transaction([
    prisma.account.count(),
    prisma.profile.count(),
    prisma.post.count(),
    prisma.follow.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.nFT.count(),
  ]);

  console.log(`
Done.
  accounts  ${counts[0]}
  profiles  ${counts[1]}
  posts     ${counts[2]}
  follows   ${counts[3]}
  comments  ${counts[4]}
  likes     ${counts[5]}
  nfts      ${counts[6]}

Test credentials (seed password hash — use Better Auth sign-up in practice):
  alice@example.com   — ARTIST tier, 2 profiles (alice-music, alice-studio)
  bob@example.com     — CREATOR tier, 2 profiles (bob-beats, the-collective as OWNER)
  carol@example.com   — CREATOR tier, 2 profiles (carol-creates, the-collective as MEMBER)
  dave@example.com    — BASIC tier,   1 profile  (fabric-london)
  eve@example.com     — BASIC tier,   1 profile  (warehouse-events)
  frank@example.com   — NONE tier,    0 profiles (new user edge case)
  `);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
