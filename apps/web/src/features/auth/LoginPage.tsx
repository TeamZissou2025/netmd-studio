import { useState } from 'react';
import { NavLink, Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@netmd-studio/ui';
import { Input } from '@netmd-studio/ui';
import { Disc3, Mail } from 'lucide-react';

export function LoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'magic') {
      const { error } = await signInWithMagicLink(email);
      if (error) setError(error.message);
      else setMagicLinkSent(true);
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error.message);
    }
    setSubmitting(false);
  };

  if (magicLinkSent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-8 max-w-sm w-full text-center">
          <Mail size={32} className="text-[var(--accent)] mx-auto mb-4" />
          <h2 className="text-studio-title font-semibold text-[var(--text-primary)] mb-2">Check your email</h2>
          <p className="text-nav text-[var(--text-secondary)]">
            We sent a magic link to <span className="text-[var(--text-primary)]">{email}</span>
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
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Sign In</h2>
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
          {mode === 'password' && (
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          )}
          {error && <p className="text-label text-[var(--error)]">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full mt-1">
            {mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-tag text-[var(--text-tertiary)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={signInWithGoogle} className="w-full">
            Continue with Google
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
            className="text-label text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
          </button>
        </div>

        <p className="text-label text-[var(--text-secondary)] text-center mt-6">
          Don't have an account?{' '}
          <NavLink to="/auth/signup" className="text-[var(--accent)] hover:text-[var(--accent)]">
            Sign up
          </NavLink>
        </p>
      </div>
    </div>
  );
}
