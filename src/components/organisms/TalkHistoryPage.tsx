import React, { useEffect, useState } from 'react';
import TranscriptPanel from '@components/molecules/TranscriptPanel';
import type { TranscriptMessage } from '@/types/rtc';
import styles from './TalkPage.module.css';

export interface TalkHistoryPageProps {
  className?: string;
  conversationId?: string;
}

export const TalkHistoryPage: React.FC<TalkHistoryPageProps> = ({ className, conversationId: propConversationId }) => {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      // Get conversation ID from URL path or prop
      const pathParts = window.location.pathname.split('/');
      const urlConversationId = pathParts[pathParts.length - 1];
      const conversationId = propConversationId || (urlConversationId !== '_' ? urlConversationId : null);

      if (!conversationId) {
        setError('No conversation ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.yait.io/v1/smalltalks';

        const response = await fetch(`${apiBaseUrl}/conversations/${conversationId}`, {
          method: 'GET',
          credentials: 'include', // Include cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }

        const data = await response.json();

        // Transform API response to TranscriptMessage format
        // Adjust this based on actual API response structure
        const transformedMessages: TranscriptMessage[] = data.messages?.map((msg: any, index: number) => ({
          id: msg.id || `msg-${index}`,
          text: msg.text || msg.content || '',
          role: msg.role || 'user',
          timestamp: msg.timestamp || Date.now(),
        })) || [];

        setMessages(transformedMessages);
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [propConversationId]); // Re-fetch when prop changes

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.emptyState}>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.emptyState}>
          <p style={{ color: '#ea4f43' }}>Error: {error}</p>
          <a href="/talk" style={{ marginTop: '16px', textDecoration: 'underline' }}>
            Back to Talk
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <main className={styles.content}>
        <div className={styles.topBar}>
          <a href="/talk" style={{ textDecoration: 'underline', fontSize: '14px' }}>
            ← Back to Talk
          </a>
        </div>

        <div className={styles.chat}>
          <TranscriptPanel messages={messages} />
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
      </main>
    </div>
  );
};

export default TalkHistoryPage;
