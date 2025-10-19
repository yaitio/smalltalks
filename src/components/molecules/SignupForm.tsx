import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/services/authClient';
import Button from '@components/atoms/Button';
import Input from '@components/atoms/Input';
import Alert from '@components/atoms/Alert';
import styles from './SignupForm.module.css';

const signupSchema = z.object({
  language: z.string().min(1, 'Please select a language'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type SignupFormData = z.infer<typeof signupSchema>;

// Character avatars from Figma
const characters = ['👩', '👨', '👴', '👵', '🧑', '👩‍🦱', '🧔', '👨‍🦲'];

export default function SignupForm() {
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      language: '',
      name: '',
      email: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);

    try {
      const result = await authClient.requestMagicLink(data.email, data.name);

      if (result.success) {
        console.log('Magic link sent:', {
          ...data,
          character: selectedCharacter,
          message: result.message,
        });
        setIsSubmitted(true);
      } else {
        setError(result.message || 'Failed to send magic link');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Signup error:', err);
    }
  };

  if (isSubmitted) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Check your email!</h2>
            <p className={styles.successText}>
              We've sent you a magic link. Click it to start your conversation.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Let's talk</h2>

        {/* Character selector */}
        <div className={styles.characters}>
          {characters.map((char, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.character} ${selectedCharacter === index ? styles.characterActive : ''}`}
              onClick={() => setSelectedCharacter(index)}
              aria-label={`Select character ${index + 1}`}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="language" className={styles.label}>
              Select the language you want to practice
            </label>
            <select
              id="language"
              className={styles.select}
              {...register('language')}
              aria-invalid={!!errors.language}
            >
              <option value="">Select the language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
            {errors.language && (
              <p className={styles.error} role="alert">
                {errors.language.message}
              </p>
            )}
          </div>

          <Input
            label="Your name"
            placeholder="Enter your name here"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            type="email"
            label="Your e-mail address"
            placeholder="Your email, which is not for spam"
            error={errors.email?.message}
            helperText="By submitting this form, I acknowledge receipt of the Smalltalks Privacy Policy"
            {...register('email')}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
            Let's start
          </Button>
        </form>
      </div>
    </section>
  );
}
