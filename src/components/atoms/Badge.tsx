import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'difficulty' | 'category' | 'status' | 'default';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = 'default',
  difficulty,
  size = 'medium',
  icon,
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[variant],
    styles[size],
    difficulty && styles[difficulty],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
