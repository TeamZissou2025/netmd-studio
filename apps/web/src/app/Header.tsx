import { useLocation, NavLink } from 'react-router';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const titles: Record<string, string> = {
  '/labels': 'Label Studio',
  '/transfer': 'Transfer Studio',
  '/devices': 'Device Library',
  '/marketplace': 'Marketplace',
  '/dashboard': 'Dashboard',
};

export function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const title = titles[location.pathname] || 'NetMD Studio';

  return (
    <header className="h-12 bg-studio-surface border-b border-studio-border flex items-center px-4 gap-4">
      <h1 className="text-md font-semibold text-studio-text">{title}</h1>
      <div className="flex-1" />
      <div className="md:hidden">
        {user ? (
          <NavLink to="/dashboard" className="text-studio-text-muted hover:text-studio-text transition-colors">
            <User size={20} />
          </NavLink>
        ) : (
          <NavLink
            to="/auth/login"
            className="text-xs font-medium text-studio-cyan hover:text-studio-cyan-hover transition-colors"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </header>
  );
}
