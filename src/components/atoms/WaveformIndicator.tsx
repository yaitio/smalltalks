import { useEffect, useRef } from 'react';
import styles from './WaveformIndicator.module.css';

export interface WaveformIndicatorProps {
  audioLevel: number;
  isSpeaking: boolean;
  width?: number;
  height?: number;
  barCount?: number;
  color?: string;
}

/**
 * Animated waveform indicator that visualizes audio level
 */
export default function WaveformIndicator({
  audioLevel,
  isSpeaking,
  width = 200,
  height = 60,
  barCount = 20,
  color = 'var(--color-primary)',
}: WaveformIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bar dimensions
    const barWidth = width / barCount;
    const gap = 2;
    const maxBarHeight = height;

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;

      // Create wave effect with randomness based on audio level
      const baseHeight = isSpeaking
        ? (audioLevel * maxBarHeight * 0.8) + (Math.random() * audioLevel * maxBarHeight * 0.2)
        : Math.random() * maxBarHeight * 0.1;

      // Smooth wave pattern
      const waveOffset = Math.sin((i / barCount) * Math.PI * 2) * 0.3;
      const barHeight = Math.max(4, baseHeight * (1 + waveOffset));

      // Center bars vertically
      const y = (maxBarHeight - barHeight) / 2;

      // Opacity based on position (fades at edges)
      const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
      const opacity = 1 - (centerDistance * 0.3);

      // Draw bar
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
    }

    ctx.globalAlpha = 1;
  }, [audioLevel, isSpeaking, width, height, barCount, color]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Audio waveform visualization"
        role="img"
      />
      {!isSpeaking && (
        <div className={styles.idleText}>
          Waiting for audio...
        </div>
      )}
    </div>
  );
}
