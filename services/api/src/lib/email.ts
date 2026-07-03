import { Resend } from "resend";

// ── Transactional email ───────────────────────────────────────────────────────
// Single seam over the email provider. Swap Resend for SES/Postmark/etc by
// rewriting only sendEmail() — callers (auth.ts) never see the provider.
//
// Env:
//   RESEND_API_KEY — provider key
//   EMAIL_FROM     — verified sender, e.g. "Mortstack <noreply@yourdomain>"
//   APP_SCHEME     — deep-link scheme for links back into the app
//                    (defaults to the Expo scheme in app.json)

const APP_SCHEME = process.env.APP_SCHEME ?? "mortstack-chatapp";

// Deep link the mobile app handles (see app/(auth)/reset-password.tsx). The
// token rides as a query param; the app calls authClient.resetPassword with it.
export function resetPasswordLink(token: string): string {
  return `${APP_SCHEME}://reset-password?token=${encodeURIComponent(token)}`;
}

let client: Resend | null = null;
function resend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(key);
  }
  return client;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set");

  const { error } = await resend().emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
  if (error) {
    // Surface for the caller's try/catch; auth flows swallow to avoid user
    // enumeration but log server-side.
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
