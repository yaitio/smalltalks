import Button from '@components/atoms/Button';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            Big confidence starts
            <br />
            with small talks
          </h1>
          <p className={styles.subheadline}>
            Speak freely, learn naturally. No judgment. No pressure. Just real talk that helps you
            sound like you.
          </p>
        </div>

        <div className={styles.illustration}>
          {/* Placeholder for robot/person illustration */}
          <div className={styles.illustrationPlaceholder}>
            <div className={styles.robot}>🤖</div>
            <div className={styles.person}>🧑</div>
          </div>
        </div>
      </div>
    </section>
  );
}
