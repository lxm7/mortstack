export interface AuthOpts {
  apiUrl: string;
  email: string;
  password: string;
  name: string;
}

// Obtain a Better Auth bearer for an account. Mirrors the mobile auth client
// (apps/mobile/lib/auth/client.ts): the token rides back in the `set-auth-token`
// response header (bearer plugin), and Origin must be set so Better Auth's CSRF
// origin-check passes for a non-browser client.
//
// First run signs up (requireEmailVerification is false server-side, so the
// account is immediately usable); subsequent runs sign in. Idempotent from the
// caller's view — always returns a usable token or throws.
export async function authenticate(opts: AuthOpts): Promise<string> {
  const signIn = await postAuth(opts, "/auth/sign-in/email", {
    email: opts.email,
    password: opts.password,
  });
  if (signIn.token) return signIn.token;

  // Sign-in failed (most likely account doesn't exist yet) → sign up.
  const signUp = await postAuth(opts, "/auth/sign-up/email", {
    email: opts.email,
    password: opts.password,
    name: opts.name,
  });
  if (signUp.token) return signUp.token;

  throw new Error(
    `[demo-bot/auth] could not obtain a session for ${opts.email}. ` +
      `sign-in: ${signIn.status} ${signIn.body} | sign-up: ${signUp.status} ${signUp.body}`,
  );
}

async function postAuth(
  opts: AuthOpts,
  path: string,
  body: Record<string, string>,
): Promise<{ token: string | null; status: number; body: string }> {
  const res = await fetch(`${opts.apiUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // RN doesn't send Origin either; set it so the CSRF origin-check passes.
      origin: opts.apiUrl,
    },
    body: JSON.stringify(body),
  });
  const token = res.headers.get("set-auth-token");
  const text = await res.text().catch(() => "");
  return {
    token: res.ok ? token : null,
    status: res.status,
    body: text.slice(0, 200),
  };
}
