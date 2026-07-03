// ── Email bodies ──────────────────────────────────────────────────────────────
// Minimal, dependency-free HTML + plaintext. Keep portable: no framework, no
// remote assets. Callers pass a ready-to-click link.

function shell(
  heading: string,
  body: string,
  cta: { href: string; label: string },
): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f6f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 12px;font-size:20px;">${heading}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#444;">${body}</p>
        <a href="${cta.href}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;">${cta.label}</a>
        <p style="margin:24px 0 0;font-size:13px;color:#888;">If you didn't request this, you can safely ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function verificationEmail(url: string) {
  return {
    subject: "Verify your email",
    html: shell(
      "Confirm your email",
      "Tap below to verify your email address and finish setting up your account.",
      { href: url, label: "Verify email" },
    ),
    text: `Confirm your email\n\nVerify your email address: ${url}\n\nIf you didn't request this, ignore this email.`,
  };
}

export function resetPasswordEmail(url: string) {
  return {
    subject: "Reset your password",
    html: shell(
      "Reset your password",
      "Tap below to choose a new password. This link expires shortly.",
      { href: url, label: "Reset password" },
    ),
    text: `Reset your password\n\nChoose a new password: ${url}\n\nIf you didn't request this, ignore this email.`,
  };
}
