import type { WriteTransaction } from 'replicache'

// ── Mutators ──────────────────────────────────────────────────────────────────
// All local state changes go through here. Replicache optimistically applies
// them locally, then syncs to the server via the push handler.
//
// Key schema:
//   profile/{id}     → Profile
//   post/{id}        → Post
//   gig/{id}         → Gig
//   follow/{id}      → Follow
//   like/{postId}/{profileId} → Like

export type Profile = {
  id: string
  handle: string
  displayName: string
  bio?: string
  avatar?: string
  type: 'MUSICIAN' | 'VENUE' | 'PROMOTER' | 'VISUAL_ARTIST' | 'BAND'
  isVerified: boolean
  reputation: number
}

export type Post = {
  id: string
  profileId: string
  content: string
  mediaUrls: string[]
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PERFORMANCE'
  createdAt: string
  likesCount: number
  commentsCount: number
}

export type Gig = {
  id: string
  venueProfileId: string
  title: string
  description: string
  date: string
  location: string
  genres: string[]
  fee?: number
  currency?: string
  status: 'OPEN' | 'FILLED' | 'CANCELLED'
  applicantCount: number
  createdAt: string
}

export type Like = {
  postId: string
  profileId: string
  createdAt: string
}

export const mutators = {
  async upsertProfile(tx: WriteTransaction, profile: Profile) {
    await tx.set(`profile/${profile.id}`, profile)
  },

  async createPost(tx: WriteTransaction, post: Post) {
    await tx.set(`post/${post.id}`, post)
  },

  async deletePost(tx: WriteTransaction, postId: string) {
    await tx.del(`post/${postId}`)
  },

  async likePost(tx: WriteTransaction, { postId, profileId }: { postId: string; profileId: string }) {
    const key = `like/${postId}/${profileId}`
    const existing = await tx.get(key)
    if (existing) return

    await tx.set(key, {
      postId,
      profileId,
      createdAt: new Date().toISOString(),
    } satisfies Like)

    // Optimistically increment count
    const post = (await tx.get(`post/${postId}`)) as Post | undefined
    if (post) {
      await tx.set(`post/${postId}`, { ...post, likesCount: post.likesCount + 1 })
    }
  },

  async unlikePost(tx: WriteTransaction, { postId, profileId }: { postId: string; profileId: string }) {
    const key = `like/${postId}/${profileId}`
    const existing = await tx.get(key)
    if (!existing) return

    await tx.del(key)

    const post = (await tx.get(`post/${postId}`)) as Post | undefined
    if (post) {
      await tx.set(`post/${postId}`, { ...post, likesCount: Math.max(0, post.likesCount - 1) })
    }
  },

  async createGig(tx: WriteTransaction, gig: Gig) {
    await tx.set(`gig/${gig.id}`, gig)
  },

  async updateGigStatus(
    tx: WriteTransaction,
    { gigId, status }: { gigId: string; status: Gig['status'] },
  ) {
    const gig = (await tx.get(`gig/${gigId}`)) as Gig | undefined
    if (gig) {
      await tx.set(`gig/${gigId}`, { ...gig, status })
    }
  },
}

export type Mutators = typeof mutators
