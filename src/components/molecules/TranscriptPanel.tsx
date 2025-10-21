import TranscriptMessage from '@components/atoms/TranscriptMessage';
import { useEffect, useRef, useState } from 'react';
import type { TranscriptMessage as TranscriptMessageType } from '@/types/rtc';
import styles from './TranscriptPanel.module.css';

export interface TranscriptPanelProps {
  messages: TranscriptMessageType[];
}

/**
 * Scrollable transcript panel with auto-scroll behavior
 * Auto-scrolls to bottom on new messages unless user has manually scrolled up
 */
export default function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastMessageCountRef = useRef(messages.length);

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    // Enable auto-scroll when user scrolls to bottom
    if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    }
    // Disable auto-scroll when user scrolls up
    else if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current || !autoScroll) return;

    // Only scroll if there are new messages
    if (messages.length > lastMessageCountRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, autoScroll]);

  return (
    <div className={styles.container}>
      <div
        ref={scrollRef}
        className={styles.messageList}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-label="Conversation transcript"
      >
        {messages.map((message) => (
          <TranscriptMessage
            key={message.id}
            id={message.id}
            text={message.text}
            role={message.role}
            timestamp={message.timestamp}
            isStreaming={message.isStreaming}
          />
        ))}

        {/* Scroll indicator when not at bottom */}
        {!autoScroll && messages.length > 0 && (
          <button
            type="button"
            className={styles.scrollButton}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                setAutoScroll(true);
              }
            }}
            aria-label="Scroll to latest message"
          >
            ↓ New messages
          </button>
        )}
      </div>
    </div>
  );
}
