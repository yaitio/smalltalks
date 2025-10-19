/**
 * WebRTC and Realtime API Type Definitions
 * Based on prototype analysis and OpenAI Realtime API spec
 */

// Connection configuration
export interface RTCClientConfig {
  tokenEndpoint: string; // Backend endpoint for ephemeral token
  sessionEndpoint: string; // Backend endpoint for SDP exchange
  reconnectAttempts?: number; // Default: 3
  connectionTimeout?: number; // Default: 30000ms
}

// Connection state
export type ConnectionStatus =
  | 'idle'
  | 'fetching_token'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | null;

export interface ConnectionState {
  status: ConnectionStatus;
  quality: ConnectionQuality;
  latency: number | null;
  packetLoss: number | null;
  error: string | null;
}

// Transcript messages
export interface TranscriptMessage {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: number;
  isStreaming?: boolean; // Indicates if message is still being streamed
}

// Transcript update event (for streaming)
export type TranscriptUpdateType = 'append' | 'set' | 'create';

export interface TranscriptUpdate {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  updateType: TranscriptUpdateType;
  timestamp: number;
}

// Realtime API Event Types (from prototype analysis and script.js)
export type RealtimeEventType =
  | 'session.created'
  | 'session.updated'
  | 'conversation.item.created'
  | 'conversation.item.added'
  | 'conversation.item.updated'
  | 'conversation.item.completed'
  | 'conversation.item.done'
  | 'conversation.item.input_audio_transcription.delta'
  | 'conversation.item.input_audio_transcription.completed'
  | 'response.created'
  | 'response.output_text.delta'
  | 'response.output_text.done'
  | 'response.output_audio_transcription.delta'
  | 'response.output_audio_transcription.completed'
  | 'response.output_item.added'
  | 'response.input_item.added'
  | 'response.done'
  | 'error';

// Realtime API Event structure
export interface RealtimeEvent {
  type: RealtimeEventType;
  event_id?: string;
  response_id?: string;
  item_id?: string;
  output_index?: number;
  content_index?: number;
  delta?: string;
  transcript?: string;
  text?: string;
  item?: ConversationItem;
  id?: string;
  role?: 'user' | 'assistant' | 'system';
  error?: {
    type: string;
    code: string;
    message: string;
  };
}

// Conversation item (user or assistant message)
export interface ConversationItem {
  id: string;
  type: 'message' | 'function_call' | 'function_call_output';
  status: 'in_progress' | 'completed' | 'incomplete';
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'audio' | 'input_text' | 'input_audio';
    text?: string;
    transcript?: string;
    audio?: string; // Base64 encoded
  }>;
}

// Backend response types
export interface TokenResponse {
  value: string; // Ephemeral token
}

export interface SessionResponse {
  answer: {
    type: 'answer';
    sdp: string;
  };
}

// RTCClient interface
export interface RTCClient {
  // Connection management
  startSession(): Promise<void>;
  stopSession(): Promise<void>;
  reconnect(): Promise<void>;

  // State subscriptions
  subscribeToConnectionState(callback: (state: ConnectionState) => void): () => void;
  subscribeToTranscript(callback: (message: TranscriptMessage) => void): () => void;

  // Manual controls
  toggleMicrophone(): void;
  getMicrophoneState(): boolean;

  // Connection info
  getConnectionState(): ConnectionState;
}
