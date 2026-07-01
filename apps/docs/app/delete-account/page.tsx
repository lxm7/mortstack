import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Delete your Mortstack Chat account",
  description:
    "How to delete your Mortstack Chat account — in-app for installed users, email-based request for users without the app.",
};

const SUPPORT_EMAIL = "support@sessions.app";
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Delete account request",
)}&body=${encodeURIComponent(
  "Please delete the Mortstack Chat account associated with this email address.\n\nI understand this is permanent and cannot be undone.",
)}`;

export default function DeleteAccountPage() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <h1>Delete your Mortstack Chat account</h1>

        <section>
          <h2>If you have the app installed</h2>
          <p>
            Open <strong>Settings → Delete account</strong>, type{" "}
            <code>DELETE</code> to confirm, and tap{" "}
            <strong>Delete my account</strong>. Deletion is immediate and
            irreversible.
          </p>
        </section>

        <section>
          <h2>If you no longer have the app</h2>
          <p>
            Email{" "}
            <a href={MAILTO} className={styles.mailto}>
              {SUPPORT_EMAIL}
            </a>{" "}
            from the address tied to your account with the subject{" "}
            <strong>&ldquo;Delete account request&rdquo;</strong>. We
            acknowledge requests within 7 days and complete deletion within 30
            days.
          </p>
        </section>

        <section>
          <h2>What we delete immediately</h2>
          <ul>
            <li>Your profile, posts, comments, likes, and follows</li>
            <li>Your chat membership (other members see you leave)</li>
            <li>Your devices, push tokens, and encryption keys</li>
            <li>Your block list and any reports you filed</li>
          </ul>
        </section>

        <section>
          <h2>What stays</h2>
          <ul>
            <li>
              Messages you sent in group chats — they remain encrypted on
              recipients&rsquo; devices; the server cannot read them and they
              will appear as &ldquo;Unknown sender&rdquo; once your account is
              gone.
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
