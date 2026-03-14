import { AlertTriangle, Chrome } from 'lucide-react';

export function BrowserCheck() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(var(--warning-rgb, 255,170,0), 0.1)', border: '1px solid rgba(var(--warning-rgb, 255,170,0), 0.2)' }}
      >
        <AlertTriangle size={32} style={{ color: 'var(--warning)' }} />
      </div>
      <h2 className="text-card-title font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Browser Not Supported</h2>
      <p className="text-body max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
        Transfer Studio requires a Chromium-based browser for USB device access via WebUSB.
      </p>
      <div className="flex flex-col gap-3 max-w-sm w-full">
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-4 rounded-lg font-medium text-nav inline-flex items-center justify-center gap-2 transition-colors"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <Chrome size={16} />
          Download Google Chrome
        </a>
        <p className="text-label" style={{ color: 'var(--text-tertiary)' }}>
          Also supported: Microsoft Edge, Opera, Brave, and other Chromium-based browsers.
        </p>
      </div>
    </div>
  );
}
