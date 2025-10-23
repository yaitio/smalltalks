/**
 * WebRTC Client for OpenAI Realtime API
 * Based on prototype analysis from rnd.novaiq.ru/eng
 */

import type {
  ConnectionState,
  RealtimeEvent,
  RTCClientConfig,
  SessionResponse,
  TokenResponse,
  TranscriptMessage,
  TranscriptUpdate,
} from '@/types/rtc';

export class RTCClientService {
  private config: Required<RTCClientConfig>;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private microphoneEnabled = true;

  private connectionState: ConnectionState = {
    status: 'idle',
    quality: null,
    latency: null,
    packetLoss: null,
    error: null,
  };

  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private transcriptListeners: Set<(update: TranscriptUpdate) => void> = new Set();

  // Quality monitoring
  private qualityMonitorInterval: number | null = null;
  private lastStatsTimestamp = 0;
  private lastBytesSent = 0;
  private lastBytesReceived = 0;

  // Reconnection logic
  private reconnectAttempt = 0;
  private reconnectTimeout: number | null = null;
  private isReconnecting = false;

  // Audio level monitoring
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioLevelInterval: number | null = null;
  private audioLevelListeners: Set<(level: number) => void> = new Set();

  constructor(config: RTCClientConfig) {
    this.config = {
      tokenEndpoint: config.tokenEndpoint,
      sessionEndpoint: config.sessionEndpoint,
      reconnectAttempts: config.reconnectAttempts ?? 3,
      connectionTimeout: config.connectionTimeout ?? 30000,
    };
  }

  /**
   * Start WebRTC session
   * Flow: Fetch token → Create peer connection → Get user media → Exchange SDP
   */
  async startSession(): Promise<void> {
    try {
      // Step 1: Fetch ephemeral token from backend
      this.updateState({ status: 'fetching_token' });
      const token = await this.fetchToken();

      // Step 2: Now connecting with WebRTC
      this.updateState({ status: 'connecting' });

      // Step 2: Create RTCPeerConnection
      this.createPeerConnection();

      // Step 3: Set up data channel for events
      this.setupDataChannel();

      // Step 4: Get user microphone
      await this.getUserMedia();

      // Step 5: Create and send SDP offer
      await this.exchangeSDP(token);

      this.updateState({ status: 'connected' });

      // Step 6: Start quality monitoring
      this.startQualityMonitoring();
    } catch (error) {
      console.error('Failed to start session:', error);
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start session',
      });
      throw error;
    }
  }

  /**
   * Stop WebRTC session and clean up resources
   */
  async stopSession(): Promise<void> {
    try {
      // Cancel any pending reconnection
      this.cancelReconnection();

      // Stop quality monitoring
      this.stopQualityMonitoring();

      // Stop audio level monitoring
      this.stopAudioLevelMonitoring();

      // Close data channel
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Stop local media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.updateState({ status: 'disconnected' });
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  }

  /**
   * Fetch ephemeral token from backend
   */
  private async fetchToken(): Promise<string> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      // headers: {
      // 'Content-Type': 'application/json',
      // },
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    return data.value;
  }

  /**
   * Create RTCPeerConnection with event handlers
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection();

    // Handle incoming audio stream from assistant
    this.peerConnection.ontrack = ({ streams }) => {
      const [stream] = streams;
      const audioElement = new Audio();
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;

      const state = this.peerConnection.connectionState;
      console.log('Connection state changed:', state);

      if (state === 'failed') {
        this.handleConnectionFailure();
      } else if (state === 'disconnected') {
        this.handleConnectionFailure();
      } else if (state === 'connected') {
        // Reset reconnection attempt counter on successful connection
        this.reconnectAttempt = 0;
        this.isReconnecting = false;
      }
    };

    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;

      const state = this.peerConnection.iceConnectionState;
      console.log('ICE connection state:', state);
    };
  }

  /**
   * Set up data channel for Realtime API events
   */
  private setupDataChannel(): void {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    // Create data channel named "oai-events" (required by OpenAI Realtime API)
    this.dataChannel = this.peerConnection.createDataChannel('oai-events');

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onmessage = (event) => {
      this.handleRealtimeEvent(event.data);
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
  }

  /**
   * Get user microphone stream
   */
  private async getUserMedia(): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 24000,
        channelCount: 1,
      },
    });

    // Add local audio track to peer connection
    this.localStream.getTracks().forEach((track) => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Set up audio level monitoring
    this.setupAudioLevelMonitoring();
  }

  /**
   * Exchange SDP offer/answer with backend
   * Based on reference implementation from script.js
   */
  private async exchangeSDP(token: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    // Create SDP offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Send offer to backend and get answer
    // Backend expects: Authorization header with Bearer token, SDP as body
    const response = await fetch(this.config.sessionEndpoint, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/sdp',
      },
      body: offer.sdp, // Send raw SDP string, not JSON
    });

    if (!response.ok) {
      throw new Error(`Session request failed: ${response.status}`);
    }

    // Backend returns raw SDP answer as text
    const answerSdp = await response.text();

    // Set remote description (answer from backend)
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp,
    });
  }

  /**
   * Handle incoming Realtime API events
   * Based on reference implementation from script.js
   */
  private handleRealtimeEvent(data: string): void {
    try {
      const event: RealtimeEvent = JSON.parse(data);
      console.log('Realtime event:', event);

      const { type } = event;

      // Handle delta events (streaming text)
      if (type === 'response.output_text.delta') {
        const id =
          event.response_id || event.item_id || event.event_id || `assistant-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: 'assistant',
          text: event.delta || event.text || '',
          updateType: 'append',
          timestamp: Date.now(),
        });
        return;
      }

      if (type === 'conversation.item.input_audio_transcription.delta') {
        const id = event.item_id || `user-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: 'user',
          text: event.delta || event.text || '',
          updateType: 'append',
          timestamp: Date.now(),
        });
        return;
      }

      if (type === 'response.output_audio_transcription.delta') {
        const id = event.response_id || event.item_id || `assistant-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: 'assistant',
          text: event.delta || event.text || '',
          updateType: 'append',
          timestamp: Date.now(),
        });
        return;
      }

      // Handle completed events (final text)
      if (type === 'conversation.item.input_audio_transcription.completed') {
        const id = event.item_id || `user-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: 'user',
          text: event.transcript || event.text || '',
          updateType: 'set',
          timestamp: Date.now(),
        });
        return;
      }

      if (type === 'response.output_audio_transcription.completed') {
        const id = event.response_id || event.item_id || `assistant-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: 'assistant',
          text: event.transcript || event.text || '',
          updateType: 'set',
          timestamp: Date.now(),
        });
        return;
      }

      if (type === 'response.output_text.done') {
        // Text streaming completed
        return;
      }

      // Handle conversation item events (based on script.js lines 172-188)
      if (
        type === 'conversation.item.created' ||
        type === 'conversation.item.added' ||
        type === 'conversation.item.updated' ||
        type === 'conversation.item.completed' ||
        type === 'conversation.item.done'
      ) {
        if (event.item) {
          this.handleConversationItem(event.item);
        }
        return;
      }

      // Handle response output item events (from script.js)
      if (type === 'response.output_item.added' && event.item) {
        this.handleConversationItem(event.item, 'assistant');
        return;
      }

      if (type === 'response.input_item.added' && event.item) {
        this.handleConversationItem(event.item, 'user');
        return;
      }

      // Fallback: if event has text property, display it (from script.js line 210)
      if (typeof event.text === 'string' && event.text.trim()) {
        const role = event.role || 'assistant';
        const id = event.id || `${role}-${Date.now()}`;
        this.emitTranscriptUpdate({
          id,
          role: role === 'user' ? 'user' : 'assistant',
          text: event.text,
          updateType: 'append',
          timestamp: Date.now(),
        });
        return;
      }
    } catch (error) {
      console.error('Failed to parse realtime event:', error);
    }
  }

  /**
   * Handle conversation item from event
   */
  private handleConversationItem(item: any, fallbackRole?: 'user' | 'assistant'): void {
    if (!item || !item.content) return;

    const itemId = item.id || `item-${Date.now()}`;
    const role = item.role === 'user' ? 'user' : fallbackRole || 'assistant';

    // Collect text from content array
    const textSegments: string[] = [];

    for (const piece of item.content) {
      if (!piece) continue;

      if (typeof piece.text === 'string' && piece.text.trim()) {
        textSegments.push(piece.text.trim());
      }

      if (typeof piece.transcript === 'string' && piece.transcript.trim()) {
        textSegments.push(piece.transcript.trim());
      }
    }

    if (textSegments.length > 0) {
      this.emitTranscriptUpdate({
        id: itemId,
        role,
        text: textSegments.join(' '),
        updateType: 'set',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Toggle microphone on/off
   */
  toggleMicrophone(): void {
    if (!this.localStream) return;

    this.microphoneEnabled = !this.microphoneEnabled;

    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = this.microphoneEnabled;
    });
  }

  getMicrophoneState(): boolean {
    return this.microphoneEnabled;
  }

  /**
   * Subscribe to connection state changes
   */
  subscribeToConnectionState(callback: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.connectionState); // Immediately emit current state

    return () => {
      this.stateListeners.delete(callback);
    };
  }

  /**
   * Subscribe to transcript updates (streaming)
   */
  subscribeToTranscript(callback: (update: TranscriptUpdate) => void): () => void {
    this.transcriptListeners.add(callback);

    return () => {
      this.transcriptListeners.delete(callback);
    };
  }

  /**
   * Subscribe to audio level updates
   */
  subscribeToAudioLevel(callback: (level: number) => void): () => void {
    this.audioLevelListeners.add(callback);

    return () => {
      this.audioLevelListeners.delete(callback);
    };
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Update connection state and notify listeners
   */
  private updateState(updates: Partial<ConnectionState>): void {
    this.connectionState = {
      ...this.connectionState,
      ...updates,
    };

    this.stateListeners.forEach((listener) => {
      listener(this.connectionState);
    });
  }

  /**
   * Emit transcript update to listeners
   */
  private emitTranscriptUpdate(update: TranscriptUpdate): void {
    this.transcriptListeners.forEach((listener) => {
      listener(update);
    });
  }

  /**
   * Start monitoring connection quality
   */
  private startQualityMonitoring(): void {
    if (this.qualityMonitorInterval !== null) {
      return; // Already monitoring
    }

    this.qualityMonitorInterval = window.setInterval(async () => {
      await this.updateConnectionQuality();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Stop monitoring connection quality
   */
  private stopQualityMonitoring(): void {
    if (this.qualityMonitorInterval !== null) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
  }

  /**
   * Update connection quality metrics using WebRTC stats
   */
  private async updateConnectionQuality(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const stats = await this.peerConnection.getStats();
      let latency: number | null = null;
      let packetLoss: number | null = null;

      stats.forEach((report) => {
        // Calculate RTT (Round Trip Time) for latency
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime
            ? Math.round(report.currentRoundTripTime * 1000)
            : null;
        }

        // Calculate packet loss from inbound RTP stream
        if (report.type === 'inbound-rtp' && report.kind === 'audio') {
          const packetsLost = report.packetsLost || 0;
          const packetsReceived = report.packetsReceived || 0;
          const totalPackets = packetsLost + packetsReceived;

          if (totalPackets > 0) {
            packetLoss = Number(((packetsLost / totalPackets) * 100).toFixed(2));
          }
        }
      });

      // Determine quality based on latency and packet loss
      let quality: 'excellent' | 'good' | 'poor' = 'excellent';

      if (latency !== null && latency > 300) {
        quality = 'poor';
      } else if (latency !== null && latency > 150) {
        quality = 'good';
      }

      if (packetLoss !== null && packetLoss > 5) {
        quality = 'poor';
      } else if (packetLoss !== null && packetLoss > 2) {
        quality = quality === 'poor' ? 'poor' : 'good';
      }

      // Update state with quality metrics
      this.updateState({
        quality,
        latency,
        packetLoss,
      });
    } catch (error) {
      console.error('Failed to get connection stats:', error);
    }
  }

  /**
   * Handle connection failure and attempt reconnection
   */
  private handleConnectionFailure(): void {
    // Don't reconnect if already reconnecting or exceeded max attempts
    if (this.isReconnecting || this.reconnectAttempt >= this.config.reconnectAttempts) {
      this.updateState({
        status: 'error',
        error: 'Connection failed. Maximum reconnection attempts reached.',
      });
      return;
    }

    this.reconnectAttempt++;
    this.isReconnecting = true;

    // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, etc.
    const delay = Math.min(1000 * 2 ** (this.reconnectAttempt - 1), 10000);

    console.log(
      `Connection failed. Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt}/${this.config.reconnectAttempts})`
    );

    this.updateState({
      status: 'reconnecting',
      error: `Reconnecting... (attempt ${this.reconnectAttempt}/${this.config.reconnectAttempts})`,
    });

    this.reconnectTimeout = window.setTimeout(async () => {
      try {
        console.log('Attempting to reconnect...');
        await this.cleanup();
        await this.startSession();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.handleConnectionFailure(); // Try again if possible
      }
    }, delay);
  }

  /**
   * Cancel pending reconnection attempt
   */
  private cancelReconnection(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
    this.reconnectAttempt = 0;
  }

  /**
   * Clean up connection resources without updating state
   */
  private async cleanup(): Promise<void> {
    this.stopQualityMonitoring();
    this.stopAudioLevelMonitoring();

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  /**
   * Set up audio level monitoring using Web Audio API
   */
  private setupAudioLevelMonitoring(): void {
    if (!this.localStream) return;

    try {
      // Create audio context
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.localStream);

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect source to analyser
      source.connect(this.analyser);

      // Start monitoring audio levels (throttled to ~60fps)
      this.audioLevelInterval = window.setInterval(() => {
        const level = this.getAudioLevel();
        this.emitAudioLevel(level);
      }, 16); // ~60fps
    } catch (error) {
      console.error('Failed to set up audio level monitoring:', error);
    }
  }

  /**
   * Stop audio level monitoring
   */
  private stopAudioLevelMonitoring(): void {
    if (this.audioLevelInterval !== null) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  /**
   * Get current audio level (0-1)
   */
  private getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;

    // Normalize to 0-1 range
    return Math.min(average / 255, 1);
  }

  /**
   * Emit audio level to listeners
   */
  private emitAudioLevel(level: number): void {
    this.audioLevelListeners.forEach((listener) => {
      listener(level);
    });
  }
}

// Export singleton instance
const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.smalltalks.io/v1/smalltalks';

export const rtcClient = new RTCClientService({
  tokenEndpoint: `${apiBaseUrl}/agent/token`,
  sessionEndpoint: `${apiBaseUrl}/agent/session`,
});
