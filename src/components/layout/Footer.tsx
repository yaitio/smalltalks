import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <nav className={styles.nav} aria-label="Footer navigation">
            <a href="/" className={styles.link}>
              About
            </a>
            <a href="mailto:example@example.com" className={styles.link}>
              Support
            </a>
          </nav>

          <a href="/" className={styles.logo} aria-label="Smalltalks Home">
            <img src="/assets/logo.svg" alt="" className={styles.logoIcon} />
          </a>
        </div>
      </div>
    </footer>
  );
}
