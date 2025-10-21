import type { ReactNode } from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  onDismiss?: () => void;
}

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Alert({ variant = 'info', children, onDismiss }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert">
      <span className={styles.icon} aria-hidden="true">
        {icons[variant]}
      </span>
      <div className={styles.message}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
