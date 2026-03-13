import { useEffect } from 'react';
import { Usb } from 'lucide-react';
import { NetMDConnection } from '@netmd-studio/netmd';
import { BrowserCheck } from './BrowserCheck';
import { DeviceConnectionPanel } from './DeviceConnectionPanel';
import { DiscTOCPanel } from './DiscTOCPanel';
import { FormatSelector } from './FormatSelector';
import { TransferQueue } from './TransferQueue';
import { SEOHead } from '../../app/SEOHead';
import { useTransferStore } from './store';
import { initConnection, destroyConnection } from './connection';

export function TransferStudioPage() {
  const connectionStatus = useTransferStore((s) => s.connectionStatus);

  // Initialise the singleton connection ONCE when this page mounts.
  // Auto-reconnect is DISABLED — it conflicts with manual connect on some
  // devices (e.g., Sony MZ-NF810) that need a clean user-gesture-initiated
  // connection. Users must click "Connect Device" explicitly.
  useEffect(() => {
    initConnection();
    return () => {
      // Tear down on unmount (only matters for HMR / route away)
      destroyConnection();
    };
  }, []);

  // Check WebUSB support
  if (!NetMDConnection.isSupported()) {
    return <BrowserCheck />;
  }

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="max-w-7xl mx-auto">
      <SEOHead title="Transfer Studio" description="Transfer audio to your MiniDisc player via WebUSB — SP, LP2, and LP4 encoding." />
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-studio-lg bg-studio-magenta-muted border border-studio-magenta/20 flex items-center justify-center">
          <Usb size={20} className="text-studio-magenta" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-studio-text">Transfer Studio</h1>
          <p className="text-xs text-studio-text-muted">
            Transfer audio to your MiniDisc player via WebUSB
          </p>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Left sidebar — always rendered, stable height */}
        <div className="space-y-4">
          <DeviceConnectionPanel />
          {/* Stable container for connected-only panels to prevent layout shift.
              Uses opacity + overflow-hidden instead of conditional mount/unmount
              so FormatSelector and DiscTOCPanel do NOT re-mount (and thus do NOT
              re-trigger any hooks) when the connection status toggles. */}
          <div
            className={`space-y-4 ${
              isConnected ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'
            }`}
          >
            <FormatSelector />
            <DiscTOCPanel />
          </div>
        </div>

        {/* Main content — transfer queue or empty state */}
        <div className="min-h-[400px]">
          {isConnected ? (
            <TransferQueue />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-studio-xl bg-studio-surface border border-studio-border flex items-center justify-center mb-4">
        <Usb size={28} className="text-studio-text-dim" />
      </div>
      <h2 className="text-lg font-semibold text-studio-text mb-2">Connect a Device</h2>
      <p className="text-sm text-studio-text-muted max-w-sm">
        Connect your Net MD or Hi-MD player via USB to start transferring audio.
        Use the panel on the left to pair your device.
      </p>
      <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm">
        {[
          { label: 'SP', desc: '80 min · Best quality' },
          { label: 'LP2', desc: '160 min · Good quality' },
          { label: 'LP4', desc: '320 min · Acceptable' },
        ].map((fmt) => (
          <div
            key={fmt.label}
            className="p-3 bg-studio-surface border border-studio-border rounded-studio text-center"
          >
            <span className="text-xs font-mono font-semibold text-studio-magenta">{fmt.label}</span>
            <p className="text-2xs text-studio-text-dim mt-1">{fmt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
