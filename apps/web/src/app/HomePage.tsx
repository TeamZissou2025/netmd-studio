import { NavLink } from 'react-router';
import { Disc3, Usb, Database, ShoppingBag, ArrowRight } from 'lucide-react';

const pillars = [
  {
    to: '/labels',
    title: 'Label Studio',
    desc: 'Design J-cards, spine labels, and disc labels with Discogs/MusicBrainz metadata.',
    icon: Disc3,
    color: 'text-pillar-label',
    borderColor: 'border-pillar-label/30',
    bgColor: 'bg-pillar-label/5',
  },
  {
    to: '/transfer',
    title: 'Transfer Studio',
    desc: 'Transfer audio to MiniDisc via WebUSB with SP, LP2, and LP4 ATRAC encoding.',
    icon: Usb,
    color: 'text-pillar-transfer',
    borderColor: 'border-pillar-transfer/30',
    bgColor: 'bg-pillar-transfer/5',
  },
  {
    to: '/devices',
    title: 'Device Library',
    desc: 'Community database of MiniDisc hardware with specs and compatibility reports.',
    icon: Database,
    color: 'text-pillar-device',
    borderColor: 'border-pillar-device/30',
    bgColor: 'bg-pillar-device/5',
  },
  {
    to: '/marketplace',
    title: 'Marketplace',
    desc: 'Buy and sell MiniDisc players, decks, discs, and accessories.',
    icon: ShoppingBag,
    color: 'text-pillar-market',
    borderColor: 'border-pillar-market/30',
    bgColor: 'bg-pillar-market/5',
  },
];

export function HomePage() {
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-studio-text mb-2">NetMD Studio</h1>
        <p className="text-md text-studio-text-muted">The all-in-one MiniDisc platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map(({ to, title, desc, icon: Icon, color, borderColor, bgColor }) => (
          <NavLink
            key={to}
            to={to}
            className={`group ${bgColor} border ${borderColor} rounded-studio-xl p-6 hover:bg-studio-surface-hover transition-colors`}
          >
            <div className="flex items-start gap-4">
              <Icon size={24} className={color} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-studio-text flex items-center gap-2">
                  {title}
                  <ArrowRight size={16} className="text-studio-text-dim group-hover:text-studio-text-muted transition-colors" />
                </h3>
                <p className="text-sm text-studio-text-muted mt-1">{desc}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
