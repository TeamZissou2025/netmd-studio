import { useState, useEffect } from 'react';
import { getConsent, setConsent } from '../lib/cookies';

interface CookieConsentProps {
  variant: 'light' | 'dark';
}

export function CookieConsent({ variant }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    setConsent(choice);
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  const isLight = variant === 'light';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        style={{
          background: isLight ? '#FFFFFF' : 'var(--surface-1, #141417)',
          borderTop: `1px solid ${isLight ? '#E0DDD6' : 'var(--border, #2a2a32)'}`,
        }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-6"
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              color: isLight ? '#1A1A1A' : 'var(--text-secondary, #8888a0)',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            We use a small cookie to remember if you've signed up for launch notifications. No tracking, no ads.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleChoice('accepted')}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: isLight ? '#4AACA0' : 'var(--accent, #00d4ff)',
                color: '#FFFFFF',
              }}
            >
              Accept
            </button>
            <button
              onClick={() => handleChoice('declined')}
              className="text-sm underline transition-opacity hover:opacity-80"
              style={{
                color: isLight ? '#6B6B6B' : 'var(--text-tertiary, #555568)',
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
