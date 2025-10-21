import Button from '@components/atoms/Button';
import { useState } from 'react';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useRTCStore } from '@/stores/rtcStore';
import styles from './SessionControls.module.css';

export default function SessionControls() {
  const {
    isConnecting,
    isConnected,
    isMicrophoneEnabled,
    connectionState,
    startSession,
    stopSession,
    toggleMicrophone,
  } = useRTCStore();

  const {
    audioInputDevices,
    selectedAudioInput,
    selectAudioInput,
    isLoading: devicesLoading,
    requestPermission,
    hasPermission,
  } = useMediaDevices();

  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const handleMicButtonClick = async () => {
    // Request permission if not granted
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return; // Permission denied, don't proceed
      }
    }

    // Once permission is granted, show device selector
    setShowDeviceSelector(!showDeviceSelector);
  };

  const handleStart = async () => {
    try {
      await startSession();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleStop = async () => {
    await stopSession();
  };

  const handleDeviceChange = (deviceId: string) => {
    selectAudioInput(deviceId);
    setShowDeviceSelector(false);

    // If changing device mid-session, need to reconnect
    if (isConnected) {
      stopSession().then(() => startSession());
    }
  };

  // Get connection status message
  const getConnectionMessage = () => {
    switch (connectionState.status) {
      case 'fetching_token':
        return 'Requesting session token...';
      case 'connecting':
        return 'Establishing connection...';
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'error':
        return connectionState.error || 'Connection error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Connection status indicator */}
      {(isConnecting || isConnected) && (
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${isConnected ? styles.connected : styles.connecting}`}
          />
          <span className={styles.statusText}>{getConnectionMessage()}</span>
        </div>
      )}

      <div className={styles.mainControls}>
        {!isConnected && !isConnecting && (
          <>
            {/* Turn on the mic button */}
            <div className={styles.micButtonWrapper}>
              <Button
                variant="primary"
                size="md"
                onClick={handleMicButtonClick}
                disabled={isConnecting}
                className={styles.micButton}
              >
                <img src="/assets/mic.svg" alt="" className={styles.buttonIcon} />
                Turn on the mic
              </Button>

              {/* Device selector dropdown */}
              {showDeviceSelector && audioInputDevices.length > 0 && (
                <div className={styles.deviceDropdown}>
                  {audioInputDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      type="button"
                      className={`${styles.deviceOption} ${
                        device.deviceId === selectedAudioInput ? styles.selected : ''
                      }`}
                      onClick={() => handleDeviceChange(device.deviceId)}
                    >
                      {device.label}
                      {device.deviceId === selectedAudioInput && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start session button */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleStart}
              disabled={isConnecting || !hasPermission || !selectedAudioInput}
              className={styles.startButton}
            >
              <img src="/assets/user.svg" alt="" className={styles.buttonIcon} />
              Start session
            </Button>
          </>
        )}

        {isConnecting && (
          <Button variant="primary" size="md" disabled isLoading className={styles.primaryButton}>
            Connecting...
          </Button>
        )}

        {isConnected && (
          <>
            {/* Microphone toggle */}
            <Button
              variant={isMicrophoneEnabled ? 'primary' : 'outline'}
              size="md"
              onClick={toggleMicrophone}
              className={styles.muteButton}
              aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicrophoneEnabled ? '🎤 Mute' : '🔇 Unmute'}
            </Button>

            {/* End conversation */}
            <Button variant="secondary" size="md" onClick={handleStop} className={styles.endButton}>
              End Conversation
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
