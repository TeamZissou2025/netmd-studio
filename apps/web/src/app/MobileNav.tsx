import { NavLink } from 'react-router';
import { Disc3, Usb, Database, ShoppingBag, Home } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home, color: 'var(--accent)' },
  { to: '/labels', label: 'Label', icon: Disc3, color: 'var(--pillar-label)' },
  { to: '/transfer', label: 'Transfer', icon: Usb, color: 'var(--pillar-transfer)' },
  { to: '/devices', label: 'Devices', icon: Database, color: 'var(--pillar-device)' },
  { to: '/marketplace', label: 'Market', icon: ShoppingBag, color: 'var(--pillar-market)' },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'color-mix(in srgb, var(--surface-1) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex" role="tablist">
        {items.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-tag font-mono uppercase tracking-wider transition-colors"
            style={({ isActive }) => ({
              color: isActive ? color : 'var(--text-tertiary)',
            })}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
