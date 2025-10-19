import styles from './FeatureGrid.module.css';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '💬',
    title: 'Real conversations',
    description:
      'Talk about what truly interests you, from travel plans to late-night thoughts, and get natural, human-like responses that keep the dialogue flowing.',
  },
  {
    icon: '🎯',
    title: 'Zero Judgment',
    description:
      'Practice freely without fear of mistakes — your AI partner listens, adapts, and helps you grow with total comfort and confidence.',
  },
  {
    icon: '📅',
    title: 'According to your schedule',
    description:
      'Jump into a conversation anytime, anywhere — your language partner never sleeps and is always ready for a quick chat or a deep dive.',
  },
];

export default function FeatureGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon} aria-hidden="true">
                  {feature.icon}
                </span>
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
