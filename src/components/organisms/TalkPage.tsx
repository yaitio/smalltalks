import SessionControls from '@components/molecules/SessionControls';
import TranscriptPanel from '@components/molecules/TranscriptPanel';
import type React from 'react';
import { useRTCStore } from '@/stores/rtcStore';
import styles from './TalkPage.module.css';

export interface TalkPageProps {
  className?: string;
}

export const TalkPage: React.FC<TalkPageProps> = ({ className }) => {
  const { transcript = [] } = useRTCStore();

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <main className={styles.content}>
        <div className={styles.topBar}>
          <SessionControls />
        </div>

        <div className={styles.chat}>
          <TranscriptPanel messages={transcript} />
        </div>

        <div
          style={{
            margin: '0 auto',
            maxWidth: '360px',
            width: '100%',
            height: '14px',
            background: '#111111',
            boxShadow:
              '0px 36px 89px rgba(0, 0, 0, 0.04), 0px 23.3333px 52.1227px rgba(0, 0, 0, 0.03), 0px 13.8667px 28.3481px rgba(0, 0, 0, 0.024), 0px 7.2px 14.4625px rgba(0, 0, 0, 0.02), 0px 2.93333px 7.25185px rgba(0, 0, 0, 0.016), 0px 0.666667px 3.50231px rgba(0, 0, 0, 0.008)',
            borderRadius: '5px',
          }}
        />

        <div className={styles.emptyState}>
          <div className={styles.homework}>
            <div className={styles.homeworkContent}>
              <h2 className={styles.homeworkTitle}>Do your homework</h2>
              <img
                src="/assets/homework.png"
                alt="Homework preview illustration"
                className={styles.homeworkImage}
                loading="lazy"
              />
            </div>
            <div className={styles.homeworkText}>
              <p>
                We’ve heard Notion described many ways. It can be as simple as a blank piece of
                paper, making writing feel light and delightful. It can be as complex as a
                relational database that stores huge amounts of data. We sometimes compare it to a
                set of Legos (if Legos were designed by The New York Times). But at its core, Notion
                is a toolbox of software building blocks that let you manage your life and work
                however you find most useful.
              </p>
              <p>
                Early computing pioneers envisioned a future where machines on our desks could
                amplify our imagination, extend our intellect, and help us model information in ways
                never before seen. This is the type of tool we want to build together at Notion —
                one that gives you the software you can mold and shape like clay to solve your
                problems your way.
              </p>
              <p>
                We’ve heard Notion described many ways. It can be as simple as a blank piece of
                paper, making writing feel light and delightful. It can be as complex as a
                relational database that stores huge amounts of data. We sometimes compare it to a
                set of Legos (if Legos were designed by The New York Times). But at its core, Notion
                is a toolbox of software building blocks that let you manage your life and work
                however you find most useful.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalkPage;
