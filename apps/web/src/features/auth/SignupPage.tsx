import { useState } from 'react';
import { NavLink, Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '@netmd-studio/ui';
import { Disc3, CheckCircle } from 'lucide-react';

export function SignupPage() {
  const { user, loading, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    const { error } = await signUpWithEmail(email, password);
    if (error) setError(error.message);
    else setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-8 max-w-sm w-full text-center">
          <CheckCircle size={32} className="text-[var(--success)] mx-auto mb-4" />
          <h2 className="text-studio-title font-semibold text-[var(--text-primary)] mb-2">Check your email</h2>
          <p className="text-nav text-[var(--text-secondary)]">
            We sent a confirmation link to <span className="text-[var(--text-primary)]">{email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-8 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-6">
          <Disc3 size={24} className="text-[var(--accent)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
          />
          {error && <p className="text-label text-[var(--error)]">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full mt-1">
            Sign Up
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-tag text-[var(--text-tertiary)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <Button variant="secondary" onClick={signInWithGoogle} className="w-full">
          Continue with Google
        </Button>

        <p className="text-label text-[var(--text-secondary)] text-center mt-6">
          Already have an account?{' '}
          <NavLink to="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent)]">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}
