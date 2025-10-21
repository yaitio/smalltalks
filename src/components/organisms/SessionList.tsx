import { useEffect, useState } from 'react';
import Button from '@/components/atoms/Button';
import { sessionStorage } from '@/services/sessionStorage';
import type { TalkSession } from '@/types/session';
import styles from './SessionList.module.css';

export default function SessionList() {
  const [sessions, setSessions] = useState<TalkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      await sessionStorage.init();
      const allSessions = await sessionStorage.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleGetStarted = (sessionId: string) => {
    // Navigate to talk page (for now just start new session)
    window.location.href = '/talk';
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading your lessons...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No lessons yet</h2>
        <p>Start your first conversation to see it here!</p>
        <Button onClick={() => (window.location.href = '/talk')} variant="primary">
          Start talking
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My lessons</h1>
      </div>

      {/* Desktop table view */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.topicHeader}>Topic</th>
              <th className={styles.durationHeader}>Duration</th>
              <th className={styles.dateHeader}>Date</th>
              <th className={styles.actionHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className={styles.row}>
                <td className={styles.topicCell}>
                  <div className={styles.topic}>{session.topic}</div>
                </td>
                <td className={styles.durationCell}>{formatDuration(session.duration)}</td>
                <td className={styles.dateCell}>{formatDate(session.createdAt)}</td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleGetStarted(session.id)}
                  >
                    Get started
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className={styles.mobileCards}>
        {sessions.map((session) => (
          <div key={session.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.cardTopic}>{session.topic}</div>
              <div className={styles.cardDate}>{formatDate(session.createdAt)}</div>
            </div>
            <button className={styles.cardButton} onClick={() => handleGetStarted(session.id)}>
              Get started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
