import { useId, useState, type FormEvent } from 'react';

export interface Credentials {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (credentials: Credentials) => Promise<void> | void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onSubmit }: LoginFormProps) {
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onSubmit({ email, password });
    } catch {
      setError('Sign in failed. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form aria-label="Sign in" onSubmit={handleSubmit} noValidate>
      <label htmlFor={emailId}>Email</label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error?.includes('email') ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      <label htmlFor={passwordId}>Password</label>
      <input
        id={passwordId}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
