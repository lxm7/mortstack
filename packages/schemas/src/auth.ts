import { z } from "zod";
import { IdentityTierSchema } from "./enums.js";
import { MyProfileSchema } from "./profile.js";

// The authenticated account — private fields, only returned to the owner
export const AccountSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  identityTier: IdentityTierSchema,
});

// Returned by signIn, signUp
// Client stores tokens, sets active profile from profiles[]
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  account: AccountSchema,
  profiles: z.array(MyProfileSchema),
});

// Returned by token refresh — tokens only, no account/profile refetch needed
export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Tokens = z.infer<typeof TokensSchema>;
