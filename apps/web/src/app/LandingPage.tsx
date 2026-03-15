import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Disc3, Radio, Database, ShoppingBag, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getConsent, setConsent as setCookieConsent, getWaitlistCookie, setWaitlistCookie } from '../lib/cookies';

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
  magenta: '#ff0066',
} as const;

// ── Hero word cycler ─────────────────────────────────────────
const CYCLE_WORDS = ['MiniDisc', 'Recording', 'Collecting', 'Discovery', 'Creating', 'Listening', 'Designing', 'Trading', 'Dubbing', 'MiniDisc'];
const WORD_DISPLAY_MS = 1100;
const HOLD_LAST_MS = 7000;
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
      style={{ height: '1.25em', paddingBottom: '0.1em', verticalAlign: 'text-bottom' }}
    >
      <span ref={measureRef} className="invisible absolute whitespace-nowrap" style={{ font: 'inherit' }} aria-hidden="true" />
      {CYCLE_WORDS.map((word, i) => {
        const isActive = i === currentIndex;
        const rest = 'translateY(-0.05em)';
        let transform = 'translateY(100%)';
        let opacity = 0;
        let transition = 'none';

        if (isActive && phase === 'in') {
          transform = rest; opacity = 1;
          transition = 'opacity 0.225s cubic-bezier(0.22,1,0.36,1), transform 0.225s cubic-bezier(0.22,1,0.36,1)';
        } else if (isActive && phase === 'hold') {
          transform = rest; opacity = 1;
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
  { icon: Disc3, title: 'Label Studio', desc: 'Design MiniDisc stickers, J-cards and spine labels', colorHex: '#4AACA0', premium: true },
  { icon: Radio, title: 'Transfer Studio', desc: 'Transfer audio via WebUSB', colorHex: '#D4577A', premium: false },
  { icon: Database, title: 'Device Library', desc: 'Community hardware database', colorHex: '#C8923C', premium: false },
  { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy and sell MiniDisc gear', colorHex: '#3BA37A', premium: false },
];

// ── PREMIUM ribbon ───────────────────────────────────────────
function PremiumRibbon() {
  return (
    <div
      className="absolute overflow-hidden pointer-events-none"
      style={{ top: 0, right: 0, width: '80px', height: '80px' }}
    >
      <div
        className="absolute font-mono uppercase text-center font-semibold"
        style={{
          top: '14px',
          right: '-22px',
          width: '110px',
          fontSize: '9px',
          letterSpacing: '0.12em',
          padding: '4px 0',
          background: C.magenta,
          color: '#FFFFFF',
          transform: 'rotate(45deg)',
          boxShadow: '0 2px 6px rgba(255,0,102,0.3)',
        }}
      >
        PREMIUM
      </div>
    </div>
  );
}

// ── Email signup form ────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Check cookie on mount — if already subscribed, show success state
  useEffect(() => {
    if (getWaitlistCookie() === 'subscribed') {
      setStatus('success');
    }
  }, []);

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
        if (error.code === '23505') {
          setWaitlistCookie();
          setStatus('success');
        }
        else { setStatus('error'); setErrorMsg('Something went wrong. Please try again.'); }
      } else {
        setWaitlistCookie();
        setStatus('success');
      }
    } catch {
      setStatus('error'); setErrorMsg('Something went wrong. Please try again.');
    }
  }, [email, consent]);

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#E6F4EE' }}>
          <Check size={14} style={{ color: C.success }} />
        </div>
        <span className="font-medium" style={{ color: C.success, fontSize: '14px' }}>
          {getWaitlistCookie() === 'subscribed'
            ? "You're on the list! We'll email you when NetMD Studio launches."
            : "You're on the list!"}
        </span>
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
        className="flex-1 min-w-0 h-10 px-4 rounded-lg font-mono outline-none transition-colors"
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
      <label className="flex items-start gap-2 w-full cursor-pointer select-none" style={{ fontSize: '12px', color: C.textDim }}>
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

// ── Inline cookie notice (in-flow, not fixed) ───────────────
function LandingCookieNotice() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    setCookieConsent(choice);
    setFadingOut(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className="flex justify-center px-6"
      style={{
        paddingTop: '120px',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        className="rounded-xl p-4 max-w-[480px] w-full text-center"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ color: '#888', fontSize: '11px', lineHeight: 1.5, marginBottom: '6px' }}>
          We use a small cookie to remember your signup. No tracking.
        </p>
        <span className="inline-flex items-center gap-3" style={{ fontSize: '11px' }}>
          <button
            onClick={() => handleChoice('accepted')}
            className="font-medium hover:underline"
            style={{ color: C.accent }}
          >
            Accept
          </button>
          <button
            onClick={() => handleChoice('declined')}
            className="hover:underline"
            style={{ color: '#999' }}
          >
            Decline
          </button>
        </span>
      </div>
    </div>
  );
}

// ── Main landing page ────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* ── Header with auth buttons ── */}
      <header className="flex items-center justify-between px-6 pt-4 pb-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Disc3 size={20} style={{ color: C.accent }} />
          <span className="font-semibold" style={{ color: C.text, fontSize: '15px' }}>NetMD Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/auth/login"
            className="px-4 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ color: C.text, fontSize: '13px' }}
          >
            Sign In
          </a>
          <a
            href="/auth/signup"
            className="px-4 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ background: C.accent, color: '#FFFFFF', fontSize: '13px' }}
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1">
        {/* ── SPRING 2026 date stamp ── */}
        <div className="text-center pt-8">
          <span
            className="font-bold uppercase"
            style={{ color: C.accent, fontSize: '22px', letterSpacing: '0.08em' }}
          >
            Spring 2026
          </span>
        </div>

        {/* ── Hero + Signup ── */}
        <FadeInSection className="text-center px-6" delay={0}>
          <div style={{ paddingTop: 'clamp(2rem, 1.5rem + 3vw, 4rem)', paddingBottom: 'clamp(2.5rem, 2rem + 2vw, 4rem)' }}>
            {/* Tagline pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6"
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
            <p className="mt-5 mx-auto max-w-md" style={{ color: C.textMuted, fontSize: '15px', lineHeight: 1.6 }}>
              Design labels. Transfer audio. Explore hardware. Trade gear.
              <br />
              All in one studio built for the community.
            </p>

            {/* Email signup */}
            <div className="mt-8 max-w-md mx-auto">
              <p className="mb-3 font-medium" style={{ color: C.text, fontSize: '14px' }}>
                Get notified when we launch
              </p>
              <WaitlistForm />
            </div>
          </div>
        </FadeInSection>

        {/* ── Four Pillars ── */}
        <FadeInSection className="px-6 pb-12 mt-[75px]" delay={100}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <FadeInSection key={p.title} delay={i * 80}>
                    <div
                      className="relative rounded-xl p-6 transition-all duration-200 h-full overflow-hidden"
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
                      {p.premium && <PremiumRibbon />}
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
      </div>

      {/* ── Inline cookie notice ── */}
      <LandingCookieNotice />

      {/* ── Footer (mt-auto pins to bottom) ── */}
      <footer className="mt-auto px-6 py-6 text-center space-y-2" style={{ borderTop: `1px solid ${C.footerBorder}` }}>
        <p style={{ color: C.textDim, fontSize: '12px' }}>&copy; 2026 Squircle Labs</p>
        <div className="flex items-center justify-center gap-4" style={{ fontSize: '12px' }}>
          <a href="/privacy" className="transition-colors hover:underline" style={{ color: C.textDim }}>Privacy</a>
          <span style={{ color: '#C0BDB6' }}>&middot;</span>
          <a href="/terms" className="transition-colors hover:underline" style={{ color: C.textDim }}>Terms</a>
          <span style={{ color: '#C0BDB6' }}>&middot;</span>
          <a href="/privacy#cookies" className="transition-colors hover:underline" style={{ color: C.textDim }}>Cookies</a>
        </div>
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
