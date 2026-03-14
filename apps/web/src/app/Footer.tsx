import { Disc3 } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="hidden md:flex items-center justify-between py-6"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '1.5rem clamp(1.5rem, 1rem + 3vw, 5rem)',
      }}
    >
      <div className="flex items-center gap-2 text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
        <Disc3 size={12} aria-hidden="true" />
        <span>&middot;</span>
        <span>The all-in-one MiniDisc platform</span>
      </div>
      <div className="flex items-center gap-4 text-tag font-mono">
        <a
          href="https://github.com/TeamZissou2025/netmd-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
