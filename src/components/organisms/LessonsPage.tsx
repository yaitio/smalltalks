import React, { useEffect, useState } from 'react';
import { lessonsClient, type Lesson } from '@/services/lessonsClient';
import styles from './LessonsPage.module.css';

export interface LessonsPageProps {
  className?: string;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({ className }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await lessonsClient.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.round(durationInSeconds / 60);
    return `${minutes} min`;
  };

  const handleGetStarted = (lessonId: string) => {
    window.location.href = `/talk/${lessonId}`;
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.empty}>
          <h2>Error loading lessons</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={loadLessons}
            className={styles.startButton}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>My lessons</h1>

        {lessons.length === 0 ? (
          <div className={styles.empty}>
            <h2>No lessons yet</h2>
            <p>Start your first conversation to see it here!</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/talk';
              }}
              className={styles.startButton}
            >
              Start talking
            </button>
          </div>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <span className={styles.headerTopic}>Topic</span>
              <span className={styles.headerDuration}>Duration</span>
              <span className={styles.headerDate}>Date</span>
              <span className={styles.headerAction}>Action</span>
            </div>

            <div className={styles.sessionList}>
              {lessons.map((lesson, index) => (
                <React.Fragment key={lesson.id}>
                  <div className={styles.sessionRow}>
                    <div className={styles.sessionTopic}>{lesson.topic}</div>
                    <div className={styles.sessionDuration}>{formatDuration(lesson.duration)}</div>
                    <div className={styles.sessionDate}>{formatDate(lesson.createdAt)}</div>
                    <div className={styles.sessionAction}>
                      <button
                        type="button"
                        onClick={() => handleGetStarted(lesson.id)}
                        className={styles.getStartedButton}
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                  {index < lessons.length - 1 && <div className={styles.dividerLine} />}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LessonsPage;
