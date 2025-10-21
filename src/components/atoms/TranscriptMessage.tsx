import { useAuthStore } from '@/stores/authStore';
import styles from './TranscriptMessage.module.css';

export interface TranscriptMessageProps {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: number;
  isStreaming?: boolean;
}

/**
 * Individual transcript message with role indicator, text, and timestamp
 * Shows streaming indicator when message is being received in real-time
 */
export default function TranscriptMessage({
  text,
  role,
  timestamp,
  isStreaming,
}: TranscriptMessageProps) {
  const { user } = useAuthStore();

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayName = role === 'user' ? user?.name || 'You' : 'Mentor';

  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.content}>
        <div className={styles.header} data-is-user={role === 'user'}>
          <div className={styles.role}>{displayName}</div>
          {isStreaming && (
            <div className={styles.streamingIndicator} aria-label="Streaming">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          )}
        </div>
        <p className={styles.text}>
          {text}
          {isStreaming && <span className={styles.cursor}>▊</span>}
        </p>
      </div>
    </div>
  );
}
