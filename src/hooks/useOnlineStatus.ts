import { useState, useEffect } from 'react';

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect online/offline status
 * Returns current online status and whether the user was previously offline
 *
 * Note: Defaults to true on server to avoid hydration mismatch
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  // Always start with true to avoid hydration mismatch
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);

    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Mark that user was offline and just came back online
      setWasOffline(true);
      // Reset wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    // Only show offline status after client hydration
    isOnline: isClient ? isOnline : true,
    wasOffline,
  };
}
