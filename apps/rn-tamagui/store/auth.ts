import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: string
  updatedAt: string
}

type Session = {
  token: string
  expiresAt: string
  user: User
  // Active profile selected by the user (from their linked Profiles)
  activeProfileId?: string
}

type AuthState = {
  session: Session | null
  setSession: (session: Session | null) => void
  clearSession: () => void
  setActiveProfile: (profileId: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,

  setSession: (session) => set({ session }),

  clearSession: () => set({ session: null }),

  setActiveProfile: (profileId) =>
    set((state) =>
      state.session ? { session: { ...state.session, activeProfileId: profileId } } : state,
    ),
}))
