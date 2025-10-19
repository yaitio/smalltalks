import { useState } from 'react';
import { authClient } from '@/services/authClient';
import styles from './AuthForm.module.css';

const svgPaths = {
  p2cbf5900: 'M 1.25 3.75 L 5 7.5 L 8.75 3.75',
};

export default function AuthForm() {
  const [formData, setFormData] = useState({
    language: '',
    name: '',
    email: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.language) {
      setError('Please select a language');
      return;
    }
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authClient.requestMagicLink(
        formData.email,
        formData.name,
        formData.language
      );

      if (!result.success) {
        setError(result.message || 'Failed to send magic link');
        setIsLoading(false);
        return;
      }

      // Success - show success message
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if magic link was sent
  if (showSuccess) {
    return (
      <div className={styles.successMessage}>
        Open your favorite email client, where you will find a magic link to start conversations.
      </div>
    );
  }

  return (
    <div className={styles.container} data-name="AuthForm">
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.fieldGroup}>
        <p className={`${styles.label} ${!formData.language ? styles.labelError : ''}`}>
          Select the language you want to practice
        </p>
        <div className={styles.inputWrapper}>
          <div
            aria-hidden="true"
            className={`${styles.inputBorder} ${!formData.language ? styles.inputBorderError : ''}`}
          />
          <div className={styles.inputInner}>
            <select
              className={styles.select}
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="" disabled>
                Select the language
              </option>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="italian">Italian</option>
              <option value="portuguese">Portuguese</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
            </select>
            <div className={styles.selectIcon}>
              <svg
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 10 10"
                width="10"
                height="10"
              >
                <path d={svgPaths.p2cbf5900} fill="black" fillOpacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <p className={styles.label}>Your name</p>
        <div className={styles.inputWrapper}>
          <div aria-hidden="true" className={styles.inputBorder} />
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your name here"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <p className={styles.label}>Your e-mail address</p>
        <div className={styles.inputWrapper}>
          <div aria-hidden="true" className={styles.inputBorder} />
          <input
            type="email"
            className={styles.input}
            placeholder="Your email, which is not for spam"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <button type="button" className={styles.button} onClick={handleSubmit} disabled={isLoading}>
        <div className={styles.buttonInner}>
          <div className={styles.buttonContent}>
            <div className={styles.buttonText}>
              <p>{isLoading ? 'Sending...' : "Let's start"}</p>
            </div>
          </div>
        </div>
      </button>

      <div className={styles.privacy}>
        <div className={styles.privacyText}>
          <p>
            <span>By submitting this form, I acknowledge receipt of the </span>
            <a href="/privacy" className={styles.privacyLink}>
              Smalltalks Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
