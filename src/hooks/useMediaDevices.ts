import { useEffect, useState } from 'react';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface UseMediaDevicesReturn {
  audioInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  selectedAudioInput: string | null;
  selectedAudioOutput: string | null;
  isLoading: boolean;
  error: string | null;
  selectAudioInput: (deviceId: string) => void;
  selectAudioOutput: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook for managing audio input/output devices
 */
export function useMediaDevices(): UseMediaDevicesReturn {
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string | null>(null);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Request microphone permission
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we only need permission
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to get microphone permission:', err);
      setError('Microphone permission denied');
      setHasPermission(false);
      return false;
    }
  };

  /**
   * Load available audio devices
   */
  const loadDevices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const devices = await navigator.mediaDevices.enumerateDevices();

      const inputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          kind: device.kind,
        }));

      const outputs = devices
        .filter((device) => device.kind === 'audiooutput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 5)}`,
          kind: device.kind,
        }));

      setAudioInputDevices(inputs);
      setAudioOutputDevices(outputs);

      // Auto-select default device if not already selected
      if (!selectedAudioInput && inputs.length > 0) {
        setSelectedAudioInput(inputs[0].deviceId);
      }

      if (!selectedAudioOutput && outputs.length > 0) {
        setSelectedAudioOutput(outputs[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      setError('Failed to load audio devices');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh device list
   */
  const refreshDevices = async (): Promise<void> => {
    await loadDevices();
  };

  /**
   * Select audio input device
   */
  const selectAudioInput = (deviceId: string): void => {
    setSelectedAudioInput(deviceId);
    // Store in localStorage for persistence
    localStorage.setItem('preferred-audio-input', deviceId);
  };

  /**
   * Select audio output device
   */
  const selectAudioOutput = (deviceId: string): void => {
    setSelectedAudioOutput(deviceId);
    // Store in localStorage for persistence
    localStorage.setItem('preferred-audio-output', deviceId);
  };

  // Load devices on mount
  useEffect(() => {
    // Load preferred devices from localStorage
    const preferredInput = localStorage.getItem('preferred-audio-input');
    const preferredOutput = localStorage.getItem('preferred-audio-output');

    if (preferredInput) {
      setSelectedAudioInput(preferredInput);
    }
    if (preferredOutput) {
      setSelectedAudioOutput(preferredOutput);
    }

    loadDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      console.log('Audio devices changed, refreshing...');
      loadDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return {
    audioInputDevices,
    audioOutputDevices,
    selectedAudioInput,
    selectedAudioOutput,
    isLoading,
    error,
    selectAudioInput,
    selectAudioOutput,
    refreshDevices,
    hasPermission,
    requestPermission,
  };
}
