import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { LandingPage } from './LandingPage';

/**
 * Shows the landing/coming-soon page for unauthenticated visitors.
 * Authenticated users are redirected to /labels (the app).
 */
export function AuthGatedHome() {
  const { user, loading } = useAuth();

  // While checking auth, show nothing (avoids flash of wrong page)
  if (loading) return null;

  // Authenticated → redirect into the app
  if (user) return <Navigate to="/labels" replace />;

  // Unauthenticated → landing page
  return <LandingPage />;
}
