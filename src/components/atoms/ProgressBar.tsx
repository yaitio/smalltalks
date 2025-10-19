import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  size = 'medium',
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const displayLabel = label || `${Math.round(clampedProgress)}%`;

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {showLabel && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>{displayLabel}</span>
        </div>
      )}
      <div className={styles.track} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={styles.fill}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
