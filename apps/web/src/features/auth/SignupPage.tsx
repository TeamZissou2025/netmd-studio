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
        <div className="bg-studio-surface border border-studio-border rounded-studio-xl p-8 max-w-sm w-full text-center">
          <CheckCircle size={32} className="text-studio-success mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-studio-text mb-2">Check your email</h2>
          <p className="text-sm text-studio-text-muted">
            We sent a confirmation link to <span className="text-studio-text">{email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-studio-surface border border-studio-border rounded-studio-xl p-8 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-6">
          <Disc3 size={24} className="text-studio-cyan" />
          <h2 className="text-xl font-semibold text-studio-text">Create Account</h2>
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
          {error && <p className="text-xs text-studio-error">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full mt-1">
            Sign Up
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-studio-border" />
          <span className="text-2xs text-studio-text-dim">or</span>
          <div className="flex-1 h-px bg-studio-border" />
        </div>

        <Button variant="secondary" onClick={signInWithGoogle} className="w-full">
          Continue with Google
        </Button>

        <p className="text-xs text-studio-text-muted text-center mt-6">
          Already have an account?{' '}
          <NavLink to="/auth/login" className="text-studio-cyan hover:text-studio-cyan-hover">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}
