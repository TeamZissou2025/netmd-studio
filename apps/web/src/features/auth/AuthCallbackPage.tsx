import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const returnTo = sessionStorage.getItem('auth_returnTo') || '/dashboard';
        sessionStorage.removeItem('auth_returnTo');
        navigate(returnTo, { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--border-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-nav text-[var(--text-secondary)]">Signing you in...</p>
      </div>
    </div>
  );
}
