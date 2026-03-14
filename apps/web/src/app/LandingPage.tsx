import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Disc3, Radio, Database, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Hero word cycler ─────────────────────────────────────────
const CYCLE_WORDS = ['MiniDisc', 'Recording', 'Collecting', 'Discovery', 'MiniDisc'];
const WORD_DISPLAY_MS = 1100;
const HOLD_LAST_MS = 15000;
const TRANSITION_OUT_MS = 175;

function HeroCycler() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Measure max word width once
  useEffect(() => {
    if (!wrapperRef.current || !measureRef.current) return;
    let maxW = 0;
    const measurer = measureRef.current;
    for (const word of CYCLE_WORDS) {
      measurer.textContent = word + '.';
      const w = measurer.offsetWidth;
      if (w > maxW) maxW = w;
    }
    wrapperRef.current.style.minWidth = maxW + 'px';
  }, []);

  // Cycle state machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'in') {
      const isLast = currentIndex === CYCLE_WORDS.length - 1;
      const holdTime = isLast ? HOLD_LAST_MS : WORD_DISPLAY_MS;
      timer = setTimeout(() => setPhase('out'), holdTime);
    } else if (phase === 'out') {
      timer = setTimeout(() => {
        const isLast = currentIndex === CYCLE_WORDS.length - 1;
        setCurrentIndex(isLast ? 0 : currentIndex + 1);
        setPhase('in');
      }, TRANSITION_OUT_MS + 50);
    }

    return () => clearTimeout(timer);
  }, [currentIndex, phase]);

  return (
    <span
      ref={wrapperRef}
      className="inline-block relative overflow-hidden"
      style={{ height: '1.1em', verticalAlign: 'bottom' }}
    >
      {/* Hidden measurer */}
      <span
        ref={measureRef}
        className="invisible absolute whitespace-nowrap"
        style={{ font: 'inherit' }}
        aria-hidden="true"
      />

      {CYCLE_WORDS.map((word, i) => {
        const isActive = i === currentIndex;
        let transform = 'translateY(100%)';
        let opacity = 0;
        let transition = 'none';

        if (isActive && phase === 'in') {
          transform = 'translateY(0)';
          opacity = 1;
          transition = 'opacity 0.225s cubic-bezier(0.22, 1, 0.36, 1), transform 0.225s cubic-bezier(0.22, 1, 0.36, 1)';
        } else if (isActive && phase === 'hold') {
          transform = 'translateY(0)';
          opacity = 1;
        } else if (isActive && phase === 'out') {
          transform = 'translateY(-100%)';
          opacity = 0;
          transition = 'opacity 0.175s cubic-bezier(0.55, 0, 1, 0.45), transform 0.175s cubic-bezier(0.55, 0, 1, 0.45)';
        }

        return (
          <span
            key={`${word}-${i}`}
            className="absolute left-0 w-full text-left"
            style={{
              color: 'var(--accent)',
              opacity,
              transform,
              transition,
            }}
          >
            {word}
            <span style={{ color: 'var(--text-primary)' }}>.</span>
          </span>
        );
      })}
    </span>
  );
}

// ── Fade-in-on-scroll wrapper ────────────────────────────────
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Pillar cards data ────────────────────────────────────────
const pillars = [
  {
    icon: Disc3,
    title: 'Label Studio',
    desc: 'Design J-cards and spine labels',
    color: 'var(--pillar-label)',
    colorHex: '#00d4ff',
  },
  {
    icon: Radio,
    title: 'Transfer Studio',
    desc: 'Transfer audio via WebUSB',
    color: 'var(--pillar-transfer)',
    colorHex: '#ff0066',
  },
  {
    icon: Database,
    title: 'Device Library',
    desc: 'Community hardware database',
    color: 'var(--pillar-device)',
    colorHex: '#ffaa00',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    desc: 'Buy and sell MiniDisc gear',
    color: 'var(--pillar-market)',
    colorHex: '#00cc88',
  },
];

// ── Email signup form ────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setStatus('submitting');
    try {
      const { error } = await (supabase as any).from('waitlist').insert({ email: trimmed });
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation — already signed up
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg('Something went wrong. Please try again.');
        }
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }, [email]);

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,204,136,0.15)' }}
        >
          <Check size={14} style={{ color: 'var(--success)' }} />
        </div>
        <span className="font-medium" style={{ color: 'var(--success)', fontSize: '14px' }}>
          You're on the list!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        className="flex-1 h-10 px-4 rounded-lg font-mono outline-none transition-colors"
        style={{
          background: 'var(--surface-1)',
          border: status === 'error' ? '1px solid var(--error)' : '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: '13px',
        }}
        onFocus={(e) => { if (status !== 'error') e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { if (status !== 'error') e.currentTarget.style.borderColor = 'var(--border)'; }}
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="h-10 px-6 rounded-lg font-medium transition-opacity whitespace-nowrap"
        style={{
          background: 'var(--accent)',
          color: '#0a0a0b',
          fontSize: '13px',
          opacity: status === 'submitting' ? 0.6 : 1,
        }}
      >
        {status === 'submitting' ? 'Joining...' : 'Notify Me'}
      </button>
      {status === 'error' && (
        <p className="text-xs sm:absolute sm:mt-12" style={{ color: 'var(--error)' }}>{errorMsg}</p>
      )}
    </form>
  );
}

// ── Main landing page ────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0b' }}>
      {/* ── Section 1: Top bar ── */}
      <div className="text-center pt-6 pb-4">
        <span
          className="inline-block font-mono uppercase tracking-widest px-4 py-2 rounded-full"
          style={{
            background: 'var(--surface-1)',
            color: 'var(--accent)',
            fontSize: '11px',
            letterSpacing: '0.12em',
          }}
        >
          Spring 2026
        </span>
      </div>

      {/* ── Section 2: Hero ── */}
      <FadeInSection className="flex-1 flex flex-col items-center justify-center text-center px-6" delay={0}>
        <div style={{ paddingTop: 'clamp(4rem, 3rem + 6vw, 10rem)', paddingBottom: 'clamp(4rem, 3rem + 4vw, 8rem)' }}>
          {/* Pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.12)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--accent)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span
              className="font-mono uppercase tracking-widest"
              style={{ color: 'var(--accent)', fontSize: '11px', letterSpacing: '0.12em' }}
            >
              The all-in-one MiniDisc platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tighter"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            Everything for <HeroCycler />
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 mx-auto max-w-md"
            style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}
          >
            Design labels. Transfer audio. Explore hardware. Trade gear.
            <br />
            All in one studio built for the community.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--accent)',
                color: '#0a0a0b',
                fontSize: '14px',
              }}
            >
              Get Early Access
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </FadeInSection>

      {/* ── Section 3: Four Pillars ── */}
      <FadeInSection className="px-6 pb-20" delay={100}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeInSection key={p.title} delay={i * 80}>
                  <div
                    className="rounded-xl p-6 transition-colors duration-200 h-full"
                    style={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = `${p.colorHex}33`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: `${p.colorHex}12` }}
                    >
                      <Icon size={20} style={{ color: p.color }} />
                    </div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: 'var(--text-primary)', fontSize: '14px' }}
                    >
                      {p.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </FadeInSection>

      {/* ── Section 4: Email Signup ── */}
      <FadeInSection className="px-6 pb-24">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)', fontSize: '20px' }}
          >
            Get notified when we launch
          </h2>
          <p
            className="mb-6"
            style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
          >
            Join the waitlist. No spam, just one email when NetMD Studio goes live.
          </p>
          <WaitlistForm />
        </div>
      </FadeInSection>

      {/* ── Section 5: Footer ── */}
      <footer
        className="px-6 py-8 text-center space-y-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
          &copy; 2026 Squircle Labs
        </p>
        <div className="flex items-center justify-center gap-4" style={{ fontSize: '12px' }}>
          <a href="#" className="transition-colors" style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
          >Privacy</a>
          <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
          <a href="#" className="transition-colors" style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
          >Terms</a>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
          NetMD Studio is open source &middot;{' '}
          <a
            href="https://github.com/TeamZissou2025/netmd-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
          >
            GitHub
          </a>
        </p>
      </footer>

      {/* Pulse-dot animation (used by the pill) */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
