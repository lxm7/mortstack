import { PrismaClient } from '../src/generated';
import { hashPassword } from '@repo/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: await hashPassword('password123'),
      bio: 'Music producer and artist 🎵',
      avatar: 'https://i.pravatar.cc/150?u=alice',
      isVerified: true,
      reputation: 1250,
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      bio: 'Blockchain enthusiast and performer 🎭',
      avatar: 'https://i.pravatar.cc/150?u=bob',
      isVerified: true,
      reputation: 850,
    },
  });

  const carol = await prisma.user.upsert({
    where: { username: 'carol' },
    update: {},
    create: {
      username: 'carol',
      email: 'carol@example.com',
      passwordHash: await hashPassword('password123'),
      bio: 'Digital artist and NFT creator 🎨',
      avatar: 'https://i.pravatar.cc/150?u=carol',
      reputation: 500,
    },
  });

  console.log('✅ Created users:', { alice: alice.id, bob: bob.id, carol: carol.id });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      userId: alice.id,
      content: 'Just dropped my new track! What do you think? 🎵🔥',
      mediaUrls: ['https://example.com/audio/track1.mp3'],
      mediaType: 'AUDIO',
      likesCount: 24,
      commentsCount: 5,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: bob.id,
      content: 'Amazing performance last night! Thanks everyone who came out! 🎭✨',
      mediaUrls: [
        'https://example.com/images/performance1.jpg',
        'https://example.com/images/performance2.jpg',
      ],
      mediaType: 'PERFORMANCE',
      likesCount: 89,
      commentsCount: 12,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: carol.id,
      content: 'New NFT collection coming soon! Sneak peek 👀',
      mediaUrls: ['https://example.com/images/nft-preview.jpg'],
      mediaType: 'IMAGE',
      likesCount: 156,
      commentsCount: 23,
    },
  });

  console.log('✅ Created posts:', { post1: post1.id, post2: post2.id, post3: post3.id });

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        userId: bob.id,
        content: 'Fire! 🔥 Love the beat on this one!',
      },
      {
        postId: post1.id,
        userId: carol.id,
        content: 'This is amazing! Where can I buy it?',
      },
      {
        postId: post2.id,
        userId: alice.id,
        content: 'Wish I could have been there! Next time for sure 🙌',
      },
      {
        postId: post3.id,
        userId: alice.id,
        content: 'Can\'t wait! Your art is incredible 🎨',
      },
      {
        postId: post3.id,
        userId: bob.id,
        content: 'Already got my wallet ready! 💰',
      },
    ],
  });

  console.log('✅ Created comments');

  // Create likes
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: bob.id },
      { postId: post1.id, userId: carol.id },
      { postId: post2.id, userId: alice.id },
      { postId: post2.id, userId: carol.id },
      { postId: post3.id, userId: alice.id },
      { postId: post3.id, userId: bob.id },
    ],
  });

  console.log('✅ Created likes');

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: alice.id, followingId: carol.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: bob.id, followingId: carol.id },
      { followerId: carol.id, followingId: alice.id },
    ],
  });

  console.log('✅ Created follows');

  // Create NFT
  await prisma.nFT.create({
    data: {
      userId: carol.id,
      postId: post3.id,
      objectId: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234',
      packageId: '0xnft_package_id',
      moduleId: 'art_nft',
      type: 'ART',
      name: 'Digital Sunset #001',
      description: 'First piece in the Digital Sunset collection',
      imageUrl: 'https://example.com/images/nft-preview.jpg',
      metadataUri: 'https://example.com/metadata/nft001.json',
      isListed: true,
      price: '100000000000', // 100 SUI
    },
  });

  console.log('✅ Created NFT');

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
