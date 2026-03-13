import { NavLink } from 'react-router';
import { Disc3, Usb, Database, ShoppingBag, LayoutDashboard, LogOut, User, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const pillars = [
  { to: '/labels', label: 'Label Studio', icon: Disc3, color: 'border-pillar-label', textColor: 'text-pillar-label' },
  { to: '/transfer', label: 'Transfer Studio', icon: Usb, color: 'border-pillar-transfer', textColor: 'text-pillar-transfer' },
  { to: '/devices', label: 'Device Library', icon: Database, color: 'border-pillar-device', textColor: 'text-pillar-device' },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'border-pillar-market', textColor: 'text-pillar-market' },
];

function SideNavLink({ to, icon: Icon, label, color, textColor }: {
  to: string;
  icon: typeof Disc3;
  label: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-studio text-sm font-medium transition-colors border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-cyan focus-visible:ring-offset-1 focus-visible:ring-offset-studio-black ${
          isActive
            ? `${color || 'border-studio-cyan'} ${textColor || 'text-studio-cyan'} bg-studio-surface-hover`
            : 'border-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
          {isActive && <span className="sr-only">(current page)</span>}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-studio-black border-r border-studio-border h-screen fixed left-0 top-0" aria-label="Main navigation">
      <div className="h-12 flex items-center px-4 border-b border-studio-border">
        <NavLink to="/" className="flex items-center gap-2" aria-label="NetMD Studio home">
          <Disc3 size={20} className="text-studio-cyan" aria-hidden="true" />
          <span className="text-md font-semibold text-studio-text tracking-tight">NetMD Studio</span>
        </NavLink>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        <div className="px-3 py-2">
          <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">Pillars</span>
        </div>
        {pillars.map((p) => (
          <SideNavLink key={p.to} {...p} />
        ))}

        {user && (
          <>
            <div className="px-3 py-2 mt-4">
              <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">Account</span>
            </div>
            <SideNavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SideNavLink to="/dashboard/orders" icon={Package} label="Orders" />
            <SideNavLink to="/dashboard/selling" icon={DollarSign} label="Selling" />
          </>
        )}
      </nav>

      <div className="border-t border-studio-border p-3">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-studio-surface-active flex items-center justify-center">
              <User size={14} className="text-studio-text-muted" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-studio-text truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-studio-text-dim hover:text-studio-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-cyan rounded"
              aria-label="Sign out"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth/login"
            className="flex items-center justify-center gap-1.5 w-full h-8 px-3 text-sm font-medium rounded-studio bg-studio-cyan text-studio-black hover:bg-studio-cyan-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-cyan-hover"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
