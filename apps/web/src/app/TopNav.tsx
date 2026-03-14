import { NavLink } from 'react-router';
import { Disc3, Sun, Moon, User, LogOut, LayoutDashboard, Package, DollarSign, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const pillars = [
  { to: '/labels', label: 'Label Studio', color: 'var(--pillar-label)' },
  { to: '/transfer', label: 'Transfer', color: 'var(--pillar-transfer)' },
  { to: '/devices', label: 'Devices', color: 'var(--pillar-device)' },
  { to: '/marketplace', label: 'Marketplace', color: 'var(--pillar-market)' },
];

export function TopNav() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-100 h-16 flex items-center border-b"
      style={{
        background: 'color-mix(in srgb, var(--surface-0) 85%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="w-full max-w-[1280px] mx-auto flex items-center gap-6" style={{ padding: '0 clamp(1.5rem, 1rem + 3vw, 5rem)' }}>
        {/* Left: Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0" aria-label="NetMD Studio home">
          <Disc3 size={20} style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <span className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>NetMD Studio</span>
        </NavLink>

        {/* Center: Pillar nav (desktop) */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
          {pillars.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-nav transition-colors duration-200 ${
                  isActive ? 'font-medium' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--surface-2)' : 'transparent',
              })}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: p.color }}
                aria-hidden="true"
              />
              {p.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Theme toggle + Auth */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  background: userMenuOpen ? 'var(--surface-2)' : 'transparent',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <User size={13} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg py-1"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <p className="px-3 py-1.5 text-tag font-mono uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {user.email}
                  </p>
                  <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                  <NavLink to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-nav transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <LayoutDashboard size={14} /> Dashboard
                  </NavLink>
                  <NavLink to="/dashboard/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-nav transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Package size={14} /> Orders
                  </NavLink>
                  <NavLink to="/dashboard/selling" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-nav transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <DollarSign size={14} /> Selling
                  </NavLink>
                  <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-nav w-full text-left transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/auth/login"
              className="px-4 py-1.5 text-nav font-medium rounded-md transition-colors"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--surface-0)',
              }}
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
