import { type FC, useEffect, useState } from 'react';
import { authClient, type User } from '@/services/authClient';
import styles from './HomePage.module.css';
import AuthForm from './AuthForm';

export interface HomePageProps {
  className?: string;
}

const FeatureIcon = () => {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.74014 12.931C5.91114 12.903 6.08314 12.881 6.25514 12.867C6.60823 12.825 6.96505 12.825 7.31814 12.867C7.49814 12.881 7.67614 12.903 7.85514 12.931V3.87502C7.85514 3.38102 7.98514 2.99802 8.24214 2.72602C8.50014 2.45402 8.89014 2.31802 9.41314 2.31802H13.9891V8.20502C13.9891 8.97102 14.1751 9.54402 14.5481 9.92302C14.9281 10.303 15.5001 10.493 16.2671 10.493H22.0571V19.817C22.0571 20.311 21.9271 20.691 21.6701 20.956C21.4121 21.221 21.0221 21.353 20.4991 21.353H13.6461C13.5811 21.733 13.4811 22.098 13.3451 22.449C13.2169 22.8055 13.0514 23.1474 12.8511 23.469H20.6711C21.8241 23.469 22.6941 23.169 23.2811 22.567C23.8691 21.972 24.1621 21.099 24.1621 19.946V10.203C24.1621 9.70102 24.1341 9.27902 24.0761 8.93502C24.024 8.59881 23.9111 8.27488 23.7431 7.97902C23.5522 7.64199 23.3134 7.33445 23.0341 7.06602L17.4051 1.34002C17.1051 1.03202 16.8111 0.800016 16.5251 0.642016C16.2357 0.47661 15.9191 0.364181 15.5901 0.310016C15.2 0.240879 14.8043 0.208404 14.4081 0.213016H9.23014C8.07714 0.213016 7.20714 0.514016 6.62014 1.11602C6.03314 1.71002 5.74014 2.58402 5.74014 3.73602V12.932V12.931ZM15.8481 8.00102V2.60702L21.7671 8.63302H16.4701C16.2481 8.63302 16.0871 8.58302 15.9861 8.48302C15.8931 8.38301 15.8461 8.22102 15.8461 7.99902L15.8481 8.00102ZM6.80314 25.434C7.54814 25.434 8.25314 25.287 8.91914 24.994C9.58138 24.7146 10.1832 24.3095 10.6911 23.801C11.2071 23.293 11.6081 22.702 11.8951 22.029C12.1881 21.363 12.3351 20.654 12.3351 19.902C12.3351 19.142 12.1881 18.43 11.8951 17.764C11.3308 16.4309 10.2716 15.3684 8.94014 14.8C8.26454 14.5115 7.53677 14.3651 6.80214 14.37C6.04214 14.37 5.33014 14.514 4.66414 14.8C4.00402 15.0823 3.40546 15.491 2.90214 16.003C2.39576 16.5087 1.99111 17.1068 1.71014 17.765C1.41502 18.4389 1.2651 19.1674 1.27014 19.903C1.27014 20.662 1.41614 21.375 1.71014 22.041C1.9912 22.6988 2.39585 23.2966 2.90214 23.802C3.40544 24.314 4.004 24.7227 4.66414 25.005C5.33014 25.292 6.04314 25.435 6.80214 25.435L6.80314 25.434ZM6.80314 23.404C6.70446 23.4083 6.60594 23.3925 6.51361 23.3574C6.42127 23.3223 6.33707 23.2688 6.26614 23.2C6.13418 23.057 6.0644 22.8675 6.07214 22.673V20.633H4.03214C3.93496 20.6366 3.83806 20.6203 3.74742 20.5851C3.65678 20.5498 3.57433 20.4964 3.50514 20.428C3.36914 20.299 3.30114 20.124 3.30114 19.902C3.30114 19.68 3.36914 19.504 3.50514 19.376C3.57421 19.3078 3.6565 19.2544 3.74696 19.2192C3.83741 19.1839 3.93412 19.1675 4.03114 19.171H6.07214V17.131C6.07214 16.915 6.13714 16.74 6.26614 16.604C6.33707 16.5353 6.42127 16.4817 6.51361 16.4466C6.60594 16.4116 6.70446 16.3957 6.80314 16.4C7.02514 16.4 7.20014 16.468 7.32914 16.604C7.39719 16.6732 7.45038 16.7555 7.48546 16.8459C7.52054 16.9364 7.53677 17.0331 7.53314 17.13V19.171H9.57414C9.78914 19.171 9.96414 19.239 10.1011 19.375C10.2371 19.505 10.3051 19.68 10.3051 19.902C10.3051 20.124 10.2371 20.299 10.1011 20.428C10.0319 20.4962 9.94938 20.5495 9.85875 20.5845C9.76811 20.6196 9.67126 20.6358 9.57414 20.632H7.53414V22.673C7.53414 22.888 7.46514 23.063 7.32914 23.2C7.20014 23.336 7.02514 23.404 6.80314 23.404Z"
        fill="#EA4E43"
      />
    </svg>
  );
};

export const HomePage: FC<HomePageProps> = ({ className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authClient.isAuthenticated();
        if (isAuth) {
          const userData = await authClient.getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Big confidence starts with small talks</h1>
          <p className={styles.heroSubtitle}>
            Speak freely, learn naturally. No judgment. No pressure. Just real talk that helps you
            sound like you.
          </p>
        </div>
        <div className={styles.heroImage}>
          <img
            src="/assets/landing.png"
            alt="Illustration of a learner talking on Smalltalks"
            className={styles.heroIllustration}
            loading="lazy"
          />
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <FeatureIcon />
          <h3 className={styles.featureTitle}>Real conversations</h3>
          <p className={styles.featureDescription}>
            Talk about what truly interests you, from travel plans to late-night thoughts, and get
            natural, human-like responses that keep the dialogue flowing.
          </p>
        </div>

        <div className={styles.featureCard}>
          <FeatureIcon />
          <h3 className={styles.featureTitle}>Zero Judgment</h3>
          <p className={styles.featureDescription}>
            Practice freely without fear of mistakes — your AI partner listens, adapts, and helps
            you grow with total comfort and confidence.
          </p>
        </div>

        <div className={styles.featureCard}>
          <FeatureIcon />
          <h3 className={styles.featureTitle}>According to your schedule</h3>
          <p className={styles.featureDescription}>
            Jump into a conversation anytime, anywhere — your language partner never sleeps and is
            always ready for a quick chat or a deep dive.
          </p>
        </div>
      </section>

      <section className={styles.talkSection}>
        <p className={styles.title}>Let's talk</p>
        <img src="/assets/faces.png" alt="faces" />
      </section>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : user ? (
        <div className={styles.welcomeBack}>
          <h2 className={styles.welcomeTitle}>Hey, {user?.user_name}, welcome back 🎉</h2>
          <a href="/talk" className={styles.talkButton}>
            Start conversation
          </a>
        </div>
      ) : (
        <AuthForm />
      )}
      <hr />
    </div>
  );
};

export default HomePage;
