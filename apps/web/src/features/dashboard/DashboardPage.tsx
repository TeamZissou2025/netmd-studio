import { useAuth } from '../../hooks/useAuth';
import { Disc3, Usb, Database, ShoppingBag } from 'lucide-react';
import { NavLink, Navigate } from 'react-router';

export function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-studio-text mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/labels', label: 'Label Studio', desc: 'Your label designs', icon: Disc3, color: 'text-pillar-label', borderColor: 'border-pillar-label/20' },
          { to: '/transfer', label: 'Transfer Studio', desc: 'Transfer history', icon: Usb, color: 'text-pillar-transfer', borderColor: 'border-pillar-transfer/20' },
          { to: '/devices', label: 'Device Library', desc: 'Browse devices', icon: Database, color: 'text-pillar-device', borderColor: 'border-pillar-device/20' },
          { to: '/marketplace', label: 'Marketplace', desc: 'Your listings & orders', icon: ShoppingBag, color: 'text-pillar-market', borderColor: 'border-pillar-market/20' },
        ].map(({ to, label, desc, icon: Icon, color, borderColor }) => (
          <NavLink
            key={to}
            to={to}
            className={`bg-studio-surface border ${borderColor} rounded-studio-lg p-4 hover:bg-studio-surface-hover transition-colors`}
          >
            <Icon size={24} className={color} />
            <h3 className="text-md font-semibold text-studio-text mt-3">{label}</h3>
            <p className="text-xs text-studio-text-muted mt-1">{desc}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
