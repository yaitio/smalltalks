import type { ConnectionState } from '@/types/rtc';
import styles from './ConnectionQualityBadge.module.css';

export interface ConnectionQualityBadgeProps {
  connectionState: ConnectionState;
  showDetails?: boolean;
}

/**
 * Badge showing connection quality with optional latency/packet loss details
 */
export default function ConnectionQualityBadge({
  connectionState,
  showDetails = false,
}: ConnectionQualityBadgeProps) {
  const { quality, latency, packetLoss } = connectionState;

  if (!quality) return null;

  const qualityLabel = quality.charAt(0).toUpperCase() + quality.slice(1);

  return (
    <div className={`${styles.badge} ${styles[quality]}`}>
      <div className={styles.label}>
        <span className={styles.dot} />
        {qualityLabel}
      </div>

      {showDetails && (latency !== null || packetLoss !== null) && (
        <div className={styles.details}>
          {latency !== null && (
            <span className={styles.metric}>
              {latency}ms
            </span>
          )}
          {packetLoss !== null && (
            <span className={styles.metric}>
              {packetLoss.toFixed(1)}% loss
            </span>
          )}
        </div>
      )}
    </div>
  );
}
