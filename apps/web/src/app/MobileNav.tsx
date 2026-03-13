import { NavLink } from 'react-router';
import { Disc3, Usb, Database, ShoppingBag } from 'lucide-react';

const items = [
  { to: '/labels', label: 'Labels', icon: Disc3, color: 'text-pillar-label' },
  { to: '/transfer', label: 'Transfer', icon: Usb, color: 'text-pillar-transfer' },
  { to: '/devices', label: 'Devices', icon: Database, color: 'text-pillar-device' },
  { to: '/marketplace', label: 'Market', icon: ShoppingBag, color: 'text-pillar-market' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-studio-surface border-t border-studio-border z-50" aria-label="Mobile navigation">
      <div className="flex" role="tablist">
        {items.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-2xs font-medium transition-colors ${
                isActive ? color : 'text-studio-text-dim'
              }`
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
