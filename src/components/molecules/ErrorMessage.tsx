import Button from '@components/atoms/Button';
import type { ErrorMessageConfig } from '@/constants/errorMessages';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps extends ErrorMessageConfig {
  onAction?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
}

/**
 * Error message component with icon, title, message, and action button
 */
export default function ErrorMessage({
  title,
  message,
  action,
  actionUrl,
  onAction,
  onDismiss,
  variant = 'error',
  dismissible = false,
}: ErrorMessageProps) {
  const handleAction = () => {
    if (actionUrl) {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    } else if (onAction) {
      onAction();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`${styles.container} ${styles[variant]}`} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.text}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>
      </div>

      <div className={styles.actions}>
        {action && (
          <Button
            variant={variant === 'error' ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleAction}
          >
            {action}
          </Button>
        )}
        {dismissible && onDismiss && (
          <button
            type="button"
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label="Dismiss message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
