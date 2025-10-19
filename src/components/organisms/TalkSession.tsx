import { useEffect, useState, useRef } from 'react';
import { useRTCStore } from '@/stores/rtcStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import SessionControls from '@components/molecules/SessionControls';
import TranscriptPanel from '@components/molecules/TranscriptPanel';
import WaveformIndicator from '@components/atoms/WaveformIndicator';
import ConnectionQualityBadge from '@components/atoms/ConnectionQualityBadge';
import ErrorMessage from '@components/molecules/ErrorMessage';
import { getErrorMessage } from '@/constants/errorMessages';
import { sessionStorage } from '@/services/sessionStorage';
import type { TalkSession, TranscriptEntry } from '@/types/session';
import styles from './TalkSession.module.css';

export default function TalkSession() {
  const {
    connectionState,
    isConnecting,
    isConnected,
    transcript,
    audioLevel,
    isSpeaking,
    stopSession,
  } = useRTCStore();

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const { isOnline } = useOnlineStatus();

  // Track session start
  useEffect(() => {
    if (isConnected && !sessionStartTime) {
      setSessionStartTime(new Date());
      sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [isConnected, sessionStartTime]);

  // Save session when disconnected
  useEffect(() => {
    const saveSession = async () => {
      if (!isConnected && sessionStartTime && transcript.length > 0 && sessionIdRef.current) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);

        // Generate topic from transcript
        const topic = generateTopic(transcript);

        const session: TalkSession = {
          id: sessionIdRef.current,
          topic,
          duration,
          transcript: transcript.map((msg) => ({
            role: msg.role,
            text: msg.text,
            timestamp: msg.timestamp,
          })),
          createdAt: sessionStartTime.toISOString(),
          updatedAt: endTime.toISOString(),
        };

        try {
          await sessionStorage.saveSession(session);
        } catch (error) {
          console.error('Failed to save session:', error);
        }

        // Reset for next session
        setSessionStartTime(null);
        sessionIdRef.current = null;
      }
    };

    if (!isConnected) {
      saveSession();
    }
  }, [isConnected, sessionStartTime, transcript]);

  // Keyboard shortcuts (Escape to stop is handled here, others in SessionControls)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Escape: Stop session
      if (event.key === 'Escape' && (isConnected || isConnecting)) {
        event.preventDefault();
        stopSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected, isConnecting, stopSession]);

  // Generate topic from transcript
  const generateTopic = (transcript: Array<{ role: string; text: string }>) => {
    if (transcript.length === 0) return 'Untitled conversation';

    // Get first few exchanges
    const firstExchanges = transcript.slice(0, 4).map((msg) => msg.text).join(' ');

    // Truncate to reasonable length
    const maxLength = 80;
    if (firstExchanges.length > maxLength) {
      return firstExchanges.substring(0, maxLength).trim() + '...';
    }

    return firstExchanges;
  };

  return (
    <div className={styles.container}>
      {/* Offline Banner */}
      {!isOnline && (
        <ErrorMessage
          {...getErrorMessage('OFFLINE')}
          variant="warning"
        />
      )}

      {/* Connection Error */}
      {connectionState.status === 'error' && connectionState.error && (
        <ErrorMessage
          {...getErrorMessage('CONNECTION_FAILED')}
          variant="error"
          onAction={() => window.location.reload()}
        />
      )}

      {/* Poor Connection Warning */}
      {connectionState.quality === 'poor' && isConnected && (
        <ErrorMessage
          {...getErrorMessage('POOR_CONNECTION')}
          variant="warning"
          dismissible
        />
      )}

      {/* Connection Status */}
      <div className={styles.statusBar}>
        <div className={styles.statusIndicator}>
          <span
            className={`${styles.statusDot} ${styles[connectionState.status]}`}
            aria-hidden="true"
          />
          <span className={styles.statusText}>
            {connectionState.status === 'idle' && 'Not connected'}
            {connectionState.status === 'connecting' && 'Connecting...'}
            {connectionState.status === 'connected' && 'Connected'}
            {connectionState.status === 'reconnecting' && 'Reconnecting...'}
            {connectionState.status === 'disconnected' && 'Disconnected'}
            {connectionState.status === 'error' && `Error: ${connectionState.error}`}
          </span>
        </div>

        <ConnectionQualityBadge
          connectionState={connectionState}
          showDetails={true}
        />
      </div>

      {/* Transcript Display */}
      <TranscriptPanel messages={transcript} />

      {/* Audio Visualization */}
      {isConnected && (
        <div className={styles.waveformContainer}>
          <WaveformIndicator
            audioLevel={audioLevel}
            isSpeaking={isSpeaking}
            width={300}
            height={80}
            barCount={24}
          />
        </div>
      )}

      {/* Controls */}
      <SessionControls />
    </div>
  );
}
