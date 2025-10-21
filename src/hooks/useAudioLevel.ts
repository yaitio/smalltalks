import { useEffect, useState } from 'react';
import { rtcClient } from '@/services/rtcClient';

export interface UseAudioLevelReturn {
  audioLevel: number;
  isSpeaking: boolean;
}

/**
 * Hook for monitoring audio level from the RTC client
 * Returns normalized audio level (0-1) and speaking detection
 */
export function useAudioLevel(speakingThreshold = 0.1): UseAudioLevelReturn {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Subscribe to audio level updates from rtcClient
    const unsubscribe = rtcClient.subscribeToAudioLevel((level) => {
      setAudioLevel(level);
      setIsSpeaking(level > speakingThreshold);
    });

    return () => {
      unsubscribe();
    };
  }, [speakingThreshold]);

  return {
    audioLevel,
    isSpeaking,
  };
}
