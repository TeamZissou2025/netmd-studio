import { AlertTriangle, Chrome } from 'lucide-react';

export function BrowserCheck() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-studio-xl bg-studio-warning/10 border border-studio-warning/20 flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-studio-warning" />
      </div>
      <h2 className="text-2xl font-semibold text-studio-text mb-2">Browser Not Supported</h2>
      <p className="text-base text-studio-text-muted max-w-md mb-6">
        Transfer Studio requires a Chromium-based browser for USB device access via WebUSB.
      </p>
      <div className="flex flex-col gap-3 max-w-sm w-full">
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-4 bg-studio-surface border border-studio-border rounded-studio-lg font-medium text-sm text-studio-text hover:border-studio-border-bright transition-colors inline-flex items-center justify-center gap-2"
        >
          <Chrome size={16} />
          Download Google Chrome
        </a>
        <p className="text-xs text-studio-text-dim">
          Also supported: Microsoft Edge, Opera, Brave, and other Chromium-based browsers.
        </p>
      </div>
    </div>
  );
}
