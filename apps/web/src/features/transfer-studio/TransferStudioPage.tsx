import { Usb } from 'lucide-react';
import { NetMDConnection } from '@netmd-studio/netmd';
import { BrowserCheck } from './BrowserCheck';
import { DeviceConnectionPanel } from './DeviceConnectionPanel';
import { DiscTOCPanel } from './DiscTOCPanel';
import { FormatSelector } from './FormatSelector';
import { TransferQueue } from './TransferQueue';
import { SEOHead } from '../../app/SEOHead';
import { useTransferStore } from './store';

export function TransferStudioPage() {
  const connectionStatus = useTransferStore((s) => s.connectionStatus);

  // NO useEffect here. Zero automatic connection attempts on page load.
  // The singleton connection is lazily initialized when the user clicks
  // "Connect Device" — connectDevice() calls initConnection() internally.

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
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(196,64,106,0.1)', border: '1px solid rgba(196,64,106,0.2)' }}
        >
          <Usb size={20} style={{ color: 'var(--pillar-transfer)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Transfer Studio</h1>
          <p className="text-label" style={{ color: 'var(--text-secondary)' }}>
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
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <Usb size={28} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h2 className="text-studio-title font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Connect a Device</h2>
      <p className="text-nav max-w-sm" style={{ color: 'var(--text-secondary)' }}>
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
            className="p-3 rounded-md text-center"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <span className="text-label font-mono font-semibold" style={{ color: 'var(--pillar-transfer)' }}>{fmt.label}</span>
            <p className="text-tag mt-1" style={{ color: 'var(--text-tertiary)' }}>{fmt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
