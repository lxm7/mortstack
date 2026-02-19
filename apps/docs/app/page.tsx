import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ol>
          <li>
            Get started by editing <code>apps/docs/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}></div>
        <Button appName="docs" className={styles.secondary}>
          Open alert
        </Button>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
