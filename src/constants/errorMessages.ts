export interface ErrorMessageConfig {
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessageConfig> = {
  MIC_PERMISSION_DENIED: {
    title: 'Microphone access required',
    message:
      'Please allow microphone access to start a conversation. You can change this in your browser settings.',
    action: 'Learn how',
    actionUrl: 'https://support.google.com/chrome/answer/2693767',
  },

  MIC_NOT_FOUND: {
    title: 'No microphone found',
    message: 'Please connect a microphone and try again.',
    action: 'Retry',
  },

  CONNECTION_FAILED: {
    title: 'Connection failed',
    message:
      'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Retry',
  },

  CONNECTION_TIMEOUT: {
    title: 'Connection timeout',
    message: 'The connection took too long to establish. Please try again.',
    action: 'Retry',
  },

  SESSION_ENDED: {
    title: 'Session ended',
    message: 'Your conversation session has ended unexpectedly. You can start a new one.',
    action: 'Start new conversation',
  },

  NETWORK_ERROR: {
    title: 'Network error',
    message: 'A network error occurred. Please check your connection and try again.',
    action: 'Retry',
  },

  POOR_CONNECTION: {
    title: 'Poor connection quality',
    message:
      'Your connection quality is poor. The conversation may be affected. Consider checking your internet connection.',
  },

  BROWSER_NOT_SUPPORTED: {
    title: 'Browser not supported',
    message:
      'Your browser does not support the required features. Please use Chrome, Firefox, Safari, or Edge.',
  },

  OFFLINE: {
    title: 'You are offline',
    message: 'Please check your internet connection and try again.',
  },

  GENERIC_ERROR: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  },
};

/**
 * Get error message configuration by error type
 */
export function getErrorMessage(errorType: string): ErrorMessageConfig {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.GENERIC_ERROR;
}
