import { create } from 'zustand';
import { rtcClient } from '@/services/rtcClient';
import type { ConnectionState, TranscriptMessage, TranscriptUpdate } from '@/types/rtc';

interface RTCState {
  // Connection state
  connectionState: ConnectionState;
  isConnecting: boolean;
  isConnected: boolean;

  // Transcript messages (as array for rendering)
  transcript: TranscriptMessage[];

  // Internal message map for efficient updates
  _messageMap: Map<string, TranscriptMessage>;

  // Microphone state
  isMicrophoneEnabled: boolean;

  // Audio level
  audioLevel: number;
  isSpeaking: boolean;

  // Actions
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  toggleMicrophone: () => void;
  clearTranscript: () => void;
}

export const useRTCStore = create<RTCState>((set, get) => {
  // Subscribe to connection state changes
  rtcClient.subscribeToConnectionState((state) => {
    set({
      connectionState: state,
      isConnecting:
        state.status === 'fetching_token' ||
        state.status === 'connecting' ||
        state.status === 'reconnecting',
      isConnected: state.status === 'connected',
    });
  });

  // Subscribe to transcript updates (streaming)
  rtcClient.subscribeToTranscript((update: TranscriptUpdate) => {
    const state = get();
    const messageMap = new Map(state._messageMap);

    let message = messageMap.get(update.id);

    if (update.updateType === 'append') {
      // Append text to existing message or create new one
      if (message) {
        message = {
          ...message,
          text: message.text + update.text,
          isStreaming: true,
        };
      } else {
        message = {
          id: update.id,
          text: update.text,
          role: update.role,
          timestamp: update.timestamp,
          isStreaming: true,
        };
      }
    } else if (update.updateType === 'set') {
      // Set/replace text completely
      message = {
        id: update.id,
        text: update.text,
        role: update.role,
        timestamp: update.timestamp,
        isStreaming: false,
      };
    } else if (update.updateType === 'create') {
      // Create new message
      message = {
        id: update.id,
        text: update.text,
        role: update.role,
        timestamp: update.timestamp,
        isStreaming: false,
      };
    }

    if (message) {
      messageMap.set(update.id, message);

      // Convert map to array for rendering
      const transcript = Array.from(messageMap.values());

      set({
        _messageMap: messageMap,
        transcript,
      });
    }
  });

  // Subscribe to audio level updates
  rtcClient.subscribeToAudioLevel((level) => {
    set({
      audioLevel: level,
      isSpeaking: level > 0.1, // Threshold for speaking detection
    });
  });

  return {
    // Initial state
    connectionState: rtcClient.getConnectionState(),
    isConnecting: false,
    isConnected: false,
    transcript: [],
    _messageMap: new Map(),
    isMicrophoneEnabled: true,
    audioLevel: 0,
    isSpeaking: false,

    // Start WebRTC session
    startSession: async () => {
      try {
        await rtcClient.startSession();
      } catch (error) {
        console.error('Failed to start RTC session:', error);
        throw error;
      }
    },

    // Stop WebRTC session
    // Note: We DON'T clear the transcript so users can review conversation history
    stopSession: async () => {
      try {
        await rtcClient.stopSession();
      } catch (error) {
        console.error('Failed to stop RTC session:', error);
      }
    },

    // Toggle microphone
    toggleMicrophone: () => {
      rtcClient.toggleMicrophone();
      set({
        isMicrophoneEnabled: rtcClient.getMicrophoneState(),
      });
    },

    // Clear transcript
    clearTranscript: () => {
      set({
        transcript: [],
        _messageMap: new Map(),
      });
    },
  };
});
