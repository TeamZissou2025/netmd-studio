import { NavLink } from 'react-router';
import { ArrowRight } from 'lucide-react';

const pillars = [
  {
    num: '01',
    title: 'Label Studio',
    desc: 'Design J-cards, spine labels, and disc labels. Search Discogs and MusicBrainz for album metadata and cover art, then customize on a pixel-perfect canvas.',
    tags: ['FABRIC.JS', 'PDF EXPORT', 'DISCOGS API'],
    to: '/labels',
    color: 'var(--pillar-label)',
    visual: 'label',
  },
  {
    num: '02',
    title: 'Transfer Studio',
    desc: 'Transfer audio to MiniDisc via WebUSB. Drag and drop MP3, FLAC, or WAV files and write directly to your device in SP, LP2, or LP4 format.',
    tags: ['WEBUSB', 'ATRAC', 'NETMD-JS'],
    to: '/transfer',
    color: 'var(--pillar-transfer)',
    visual: 'waveform',
  },
  {
    num: '03',
    title: 'Device Library',
    desc: 'Community-maintained database of every MiniDisc device ever made. Specs, compatibility reports, and WebUSB support status.',
    tags: ['39+ DEVICES', 'COMMUNITY', 'COMPATIBILITY'],
    to: '/devices',
    color: 'var(--pillar-device)',
    visual: 'device',
  },
  {
    num: '04',
    title: 'Marketplace',
    desc: 'Buy and sell MiniDisc players, decks, blank discs, and accessories. Peer-to-peer transactions powered by Stripe Connect.',
    tags: ['STRIPE CONNECT', 'P2P', 'SECURE'],
    to: '/marketplace',
    color: 'var(--pillar-market)',
    visual: 'market',
  },
];

const stats = [
  { value: '39', label: 'Devices cataloged' },
  { value: '5', label: 'Template types' },
  { value: '3', label: 'Transfer formats' },
  { value: '\u221E', label: 'Labels to design' },
];

function WaveformVisual({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5 h-full">
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="waveform-bar w-[3px] rounded-full"
          style={{
            background: color,
            opacity: 0.6,
            height: '60%',
            animationDelay: `${i * 0.04}s`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}

function PillarVisual({ type, color }: { type: string; color: string }) {
  if (type === 'waveform') return <WaveformVisual color={color} />;

  // Placeholder visual for other pillar types
  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="w-24 h-24 rounded-xl opacity-20"
        style={{ background: color }}
      />
    </div>
  );
}

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center" style={{ paddingTop: 'clamp(7rem, 5rem + 6vw, 12rem)', paddingBottom: 'clamp(4rem, 3rem + 3vw, 6rem)' }}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="font-mono text-tag uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            The all-in-one MiniDisc platform
          </span>
        </div>

        {/* Title */}
        <h1 className="text-hero font-extrabold tracking-tighter mb-6" style={{ color: 'var(--text-primary)' }}>
          <span className="word-reveal"><span style={{ animationDelay: '0ms' }}>Everything</span></span>{' '}
          <span className="word-reveal"><span style={{ animationDelay: '120ms' }}>for</span></span>{' '}
          <span className="word-reveal"><span style={{ animationDelay: '240ms', color: 'var(--accent)' }}>MiniDisc.</span></span>
        </h1>

        {/* Subtitle */}
        <div className="max-w-xl mx-auto space-y-1 text-body" style={{ color: 'var(--text-secondary)' }}>
          <p>Design labels. Transfer audio. Explore hardware. Trade gear.</p>
          <p>All in one studio built for the community.</p>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <NavLink
            to="/labels"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-body font-medium transition-all duration-200 hover:opacity-90"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--surface-0)',
            }}
          >
            Get Started
            <ArrowRight size={16} />
          </NavLink>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="py-6 text-center">
            <div className="text-section-title font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </div>
            <div className="text-nav mt-1" style={{ color: 'var(--text-secondary)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Pillar Cards */}
      <section style={{ padding: 'clamp(4rem, 3rem + 4vw, 8rem) 0' }}>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="flex flex-col gap-px">
            {pillars.map((p) => (
              <NavLink
                key={p.to}
                to={p.to}
                className="group grid grid-cols-1 md:grid-cols-2 min-h-[320px] transition-colors duration-[400ms]"
                style={{ background: 'var(--surface-1)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)'; }}
              >
                {/* Left: Info */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="font-mono text-tag uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      {p.num}
                    </span>
                  </div>
                  <h3 className="text-card-title font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                    {p.title}
                  </h3>
                  <p className="text-body mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {p.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 font-mono text-micro uppercase tracking-wider rounded"
                        style={{
                          background: 'var(--surface-2)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-nav font-medium transition-transform duration-300 group-hover:translate-x-1.5" style={{ color: 'var(--text-primary)' }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="hidden md:block p-8" style={{ background: 'var(--surface-2)' }}>
                  <div className="h-full rounded-lg overflow-hidden transition-transform duration-[600ms] group-hover:scale-[1.02]" style={{ background: 'var(--surface-2)' }}>
                    <PillarVisual type={p.visual} color={p.color} />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
