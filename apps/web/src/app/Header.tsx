import { useLocation, NavLink, Link } from 'react-router';
import { User, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SECTION_TITLES: Record<string, string> = {
  labels: 'Label Studio',
  transfer: 'Transfer Studio',
  devices: 'Device Library',
  marketplace: 'Marketplace',
  dashboard: 'Dashboard',
  admin: 'Admin',
  auth: 'Account',
};

const SUBSECTION_TITLES: Record<string, string> = {
  gallery: 'Gallery',
  submit: 'Submit Device',
  sell: 'Sell',
  checkout: 'Checkout',
  orders: 'Orders',
  selling: 'Selling',
  login: 'Sign In',
  signup: 'Sign Up',
  callback: 'Authenticating',
};

function buildBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Home', path: '/' }];

  const crumbs: { label: string; path: string }[] = [];

  const section = parts[0];
  const sectionTitle = SECTION_TITLES[section];
  if (sectionTitle) {
    crumbs.push({ label: sectionTitle, path: `/${section}` });
  }

  if (parts.length >= 2) {
    const sub = parts[1];
    const subTitle = SUBSECTION_TITLES[sub];
    if (subTitle) {
      crumbs.push({ label: subTitle, path: `/${parts.slice(0, 2).join('/')}` });
    }
    // Dynamic segments (UUIDs) — show ellipsis
    if (!subTitle && sub.length > 8) {
      crumbs.push({ label: 'Detail', path: pathname });
    }
  }

  if (parts.length >= 3) {
    const sub2 = parts[2];
    const subTitle2 = SUBSECTION_TITLES[sub2];
    if (subTitle2) {
      crumbs.push({ label: subTitle2, path: `/${parts.slice(0, 3).join('/')}` });
    } else if (sub2.length > 8) {
      crumbs.push({ label: 'Detail', path: pathname });
    }
  }

  return crumbs;
}

export function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const crumbs = buildBreadcrumbs(location.pathname);

  return (
    <header className="h-12 bg-studio-surface border-b border-studio-border flex items-center px-4 gap-2">
      <nav className="flex items-center gap-1 min-w-0 flex-1" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={12} className="text-studio-text-dim flex-shrink-0" />}
            {i < crumbs.length - 1 ? (
              <Link
                to={crumb.path}
                className="text-sm text-studio-text-muted hover:text-studio-text transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-studio-text truncate">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
        {crumbs.length === 0 && (
          <span className="text-md font-semibold text-studio-text">NetMD Studio</span>
        )}
      </nav>
      <div className="md:hidden flex-shrink-0">
        {user ? (
          <NavLink to="/dashboard" className="text-studio-text-muted hover:text-studio-text transition-colors" aria-label="Dashboard">
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
