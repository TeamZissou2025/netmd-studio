import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Disc3, Radio, Database, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Light-mode landing page colors ───────────────────────────
const C = {
  bg: '#F5F3EE',
  text: '#1A1A1A',
  textMuted: '#5A5A5A',
  textDim: '#6B6B6B',
  accent: '#4AACA0',
  pillBg: '#E8EFED',
  pillDot: '#5BA89D',
  cardBg: '#FFFFFF',
  cardBorder: '#E0DDD6',
  inputBg: '#FFFFFF',
  inputBorder: '#D4D1CA',
  footerBorder: '#E0DDD6',
  success: '#2E8B6E',
  error: '#C53030',
} as const;

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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'in') {
      const isLast = currentIndex === CYCLE_WORDS.length - 1;
      timer = setTimeout(() => setPhase('out'), isLast ? HOLD_LAST_MS : WORD_DISPLAY_MS);
    } else if (phase === 'out') {
      timer = setTimeout(() => {
        setCurrentIndex(currentIndex === CYCLE_WORDS.length - 1 ? 0 : currentIndex + 1);
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
      <span ref={measureRef} className="invisible absolute whitespace-nowrap" style={{ font: 'inherit' }} aria-hidden="true" />
      {CYCLE_WORDS.map((word, i) => {
        const isActive = i === currentIndex;
        let transform = 'translateY(100%)';
        let opacity = 0;
        let transition = 'none';

        if (isActive && phase === 'in') {
          transform = 'translateY(0)'; opacity = 1;
          transition = 'opacity 0.225s cubic-bezier(0.22,1,0.36,1), transform 0.225s cubic-bezier(0.22,1,0.36,1)';
        } else if (isActive && phase === 'hold') {
          transform = 'translateY(0)'; opacity = 1;
        } else if (isActive && phase === 'out') {
          transform = 'translateY(-100%)'; opacity = 0;
          transition = 'opacity 0.175s cubic-bezier(0.55,0,1,0.45), transform 0.175s cubic-bezier(0.55,0,1,0.45)';
        }

        return (
          <span key={`${word}-${i}`} className="absolute left-0 w-full text-left" style={{ color: C.accent, opacity, transform, transition }}>
            {word}<span style={{ color: C.text }}>.</span>
          </span>
        );
      })}
    </span>
  );
}

// ── Fade-in-on-scroll ────────────────────────────────────────
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
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Pillar cards ─────────────────────────────────────────────
const pillars = [
  { icon: Disc3, title: 'Label Studio', desc: 'Design J-cards and spine labels', colorHex: '#4AACA0' },
  { icon: Radio, title: 'Transfer Studio', desc: 'Transfer audio via WebUSB', colorHex: '#D4577A' },
  { icon: Database, title: 'Device Library', desc: 'Community hardware database', colorHex: '#C8923C' },
  { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy and sell MiniDisc gear', colorHex: '#3BA37A' },
];

// ── Email signup form ────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error'); setErrorMsg('Please enter a valid email address'); return;
    }
    if (!consent) {
      setStatus('error'); setErrorMsg('Please agree to the Privacy Policy'); return;
    }
    setStatus('submitting');
    try {
      const { error } = await (supabase as any).from('waitlist').insert({ email: trimmed });
      if (error) {
        if (error.code === '23505') setStatus('success');
        else { setStatus('error'); setErrorMsg('Something went wrong. Please try again.'); }
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error'); setErrorMsg('Something went wrong. Please try again.');
    }
  }, [email]);

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#E6F4EE' }}>
          <Check size={14} style={{ color: C.success }} />
        </div>
        <span className="font-medium" style={{ color: C.success, fontSize: '14px' }}>You're on the list!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 w-full max-w-md mx-auto">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        className="flex-1 h-10 px-4 rounded-lg font-mono outline-none transition-colors"
        style={{
          background: C.inputBg,
          border: `1px solid ${status === 'error' ? C.error : C.inputBorder}`,
          color: C.text,
          fontSize: '13px',
        }}
        onFocus={(e) => { if (status !== 'error') e.currentTarget.style.borderColor = C.accent; }}
        onBlur={(e) => { if (status !== 'error') e.currentTarget.style.borderColor = C.inputBorder; }}
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="h-10 px-6 rounded-lg font-medium transition-opacity whitespace-nowrap"
        style={{
          background: C.accent,
          color: '#FFFFFF',
          fontSize: '13px',
          opacity: status === 'submitting' ? 0.6 : 1,
        }}
      >
        {status === 'submitting' ? 'Joining...' : 'Notify Me'}
      </button>
      <label className="flex items-start gap-2 w-full sm:col-span-2 cursor-pointer select-none" style={{ fontSize: '12px', color: C.textDim }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (status === 'error') setStatus('idle'); }}
          className="mt-0.5 shrink-0"
          style={{ accentColor: C.accent }}
        />
        <span>
          I agree to the{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }} className="underline">Privacy Policy</a>
        </span>
      </label>
      {status === 'error' && (
        <p className="text-xs w-full" style={{ color: C.error }}>{errorMsg}</p>
      )}
    </form>
  );
}

// ── Main landing page ────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* ── Section 1: Top bar ── */}
      <div className="text-center pt-6 pb-4">
        <span
          className="inline-block font-mono uppercase tracking-widest px-4 py-2 rounded-full"
          style={{ background: C.pillBg, color: C.accent, fontSize: '11px', letterSpacing: '0.12em' }}
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
            style={{ background: C.pillBg }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.pillDot, animation: 'pulse-dot 2s ease-in-out infinite' }}
            />
            <span
              className="font-mono uppercase tracking-widest"
              style={{ color: C.textMuted, fontSize: '11px', letterSpacing: '0.12em' }}
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
              color: C.text,
              whiteSpace: 'nowrap',
            }}
          >
            Everything for <HeroCycler />
          </h1>

          {/* Subtitle */}
          <p className="mt-6 mx-auto max-w-md" style={{ color: C.textMuted, fontSize: '15px', lineHeight: 1.6 }}>
            Design labels. Transfer audio. Explore hardware. Trade gear.
            <br />
            All in one studio built for the community.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: C.accent, color: '#FFFFFF', fontSize: '14px' }}
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
                    className="rounded-xl p-6 transition-all duration-200 h-full"
                    style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = p.colorHex;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${p.colorHex}18`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: `${p.colorHex}14` }}
                    >
                      <Icon size={20} style={{ color: p.colorHex }} />
                    </div>
                    <h3 className="font-semibold mb-1" style={{ color: C.text, fontSize: '14px' }}>
                      {p.title}
                    </h3>
                    <p style={{ color: C.textMuted, fontSize: '13px', lineHeight: 1.5 }}>
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
          <h2 className="font-bold tracking-tight mb-2" style={{ color: C.text, fontSize: '20px' }}>
            Get notified when we launch
          </h2>
          <p className="mb-6" style={{ color: C.textMuted, fontSize: '14px' }}>
            Join the waitlist. No spam, just one email when NetMD Studio goes live.
          </p>
          <WaitlistForm />
        </div>
      </FadeInSection>

      {/* ── Section 5: Footer ── */}
      <footer className="px-6 py-8 text-center space-y-3" style={{ borderTop: `1px solid ${C.footerBorder}` }}>
        <p style={{ color: C.textDim, fontSize: '12px' }}>&copy; 2026 Squircle Labs</p>
        <div className="flex items-center justify-center gap-4" style={{ fontSize: '12px' }}>
          <a href="/privacy" className="transition-colors hover:underline" style={{ color: C.textDim }}>Privacy</a>
          <span style={{ color: '#C0BDB6' }}>&middot;</span>
          <a href="/terms" className="transition-colors hover:underline" style={{ color: C.textDim }}>Terms</a>
        </div>
        <p style={{ color: '#9A9790', fontSize: '11px' }}>
          NetMD Studio is open source &middot;{' '}
          <a
            href="https://github.com/TeamZissou2025/netmd-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: C.textDim }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.textDim; }}
          >
            GitHub
          </a>
        </p>
      </footer>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
