import { NavLink } from 'react-router';
import { Disc3, Usb, Database, ShoppingBag, LayoutDashboard, LogOut, User, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const pillars = [
  { to: '/labels', label: 'Label Studio', icon: Disc3, color: 'border-pillar-label', textColor: 'text-pillar-label' },
  { to: '/transfer', label: 'Transfer Studio', icon: Usb, color: 'border-pillar-transfer', textColor: 'text-pillar-transfer' },
  { to: '/devices', label: 'Device Library', icon: Database, color: 'border-pillar-device', textColor: 'text-pillar-device' },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'border-pillar-market', textColor: 'text-pillar-market' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-studio-black border-r border-studio-border h-screen fixed left-0 top-0">
      <div className="h-12 flex items-center px-4 border-b border-studio-border">
        <NavLink to="/" className="flex items-center gap-2">
          <Disc3 size={20} className="text-studio-cyan" />
          <span className="text-md font-semibold text-studio-text tracking-tight">NetMD Studio</span>
        </NavLink>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        <div className="px-3 py-2">
          <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">Pillars</span>
        </div>
        {pillars.map(({ to, label, icon: Icon, color, textColor }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-studio text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? `${color} ${textColor} bg-studio-surface-hover`
                  : 'border-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {user && (
          <>
            <div className="px-3 py-2 mt-4">
              <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">Account</span>
            </div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-studio text-sm font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'border-studio-cyan text-studio-cyan bg-studio-surface-hover'
                    : 'border-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover'
                }`
              }
            >
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/orders"
              className={({ isActive }) =>
                `flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-studio text-sm font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'border-studio-cyan text-studio-cyan bg-studio-surface-hover'
                    : 'border-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover'
                }`
              }
            >
              <Package size={16} />
              Orders
            </NavLink>
            <NavLink
              to="/dashboard/selling"
              className={({ isActive }) =>
                `flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-studio text-sm font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'border-studio-cyan text-studio-cyan bg-studio-surface-hover'
                    : 'border-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover'
                }`
              }
            >
              <DollarSign size={16} />
              Selling
            </NavLink>
          </>
        )}
      </nav>

      <div className="border-t border-studio-border p-3">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-studio-surface-active flex items-center justify-center">
              <User size={14} className="text-studio-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-studio-text truncate">{user.email}</p>
            </div>
            <button onClick={signOut} className="text-studio-text-dim hover:text-studio-text transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth/login"
            className="flex items-center justify-center gap-1.5 w-full h-8 px-3 text-sm font-medium rounded-studio bg-studio-cyan text-studio-black hover:bg-studio-cyan-hover transition-colors"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
