import { Link } from 'react-router';
import { Usb, Unplug, RefreshCw, Disc3, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { useDeviceConnection } from './useDeviceConnection';
import { useTransferStore } from './store';

export function DeviceConnectionPanel() {
  const { connectionStatus, deviceInfo, toc, connect, disconnect, refreshTOC } = useDeviceConnection();
  const selectedFormat = useTransferStore((s) => s.selectedFormat);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  // Use actual disc capacity from TOC (in SP-equivalent seconds),
  // then scale for the selected format using WMD's conversion formula.
  const spTotal = toc?.totalSeconds ?? 0;
  const spUsed = toc?.usedSeconds ?? 0;
  const formatMultiplier = selectedFormat === 'lp2' ? 2 : selectedFormat === 'lp4' ? 4 : 1;
  const totalCapacity = spTotal * formatMultiplier;
  const usedSeconds = spUsed; // used time is the same regardless of format
  const freeSeconds = Math.max(0, totalCapacity - usedSeconds);
  const usedPercent = totalCapacity > 0 ? (usedSeconds / totalCapacity) * 100 : 0;

  return (
    <div
      className="rounded-lg p-4 min-h-[160px]"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-nav font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Disc3 size={16} style={{ color: 'var(--pillar-transfer)' }} />
          Device
        </h3>
        {isConnected && (
          <button
            onClick={refreshTOC}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title="Refresh disc info"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
            {isConnecting ? (
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--pillar-transfer)' }} />
            ) : (
              <Unplug size={20} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </div>
          <p className="text-label text-center" style={{ color: 'var(--text-secondary)' }}>
            {isConnecting ? 'Connecting...' : 'No device connected'}
          </p>
          <Button
            variant="secondary"
            onClick={connect}
            disabled={isConnecting}
            className="w-full"
          >
            <Usb size={16} />
            {isConnecting ? 'Connecting...' : 'Connect Device'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Device info */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(196,64,106,0.1)' }}
            >
              <Usb size={16} style={{ color: 'var(--pillar-transfer)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-nav font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {deviceInfo?.name ?? 'Unknown Device'}
              </p>
              <p className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {deviceInfo?.manufacturer}
                {deviceInfo ? ` · ${deviceInfo.isHiMD ? 'Hi-MD' : 'Net MD'}` : ''}
              </p>
              {deviceInfo?.modelNumber && (
                <Link
                  to={`/devices?search=${encodeURIComponent(deviceInfo.modelNumber)}`}
                  className="text-tag flex items-center gap-0.5 mt-0.5 transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  <ExternalLink size={9} /> View specs
                </Link>
              )}
            </div>
          </div>

          {/* Disc info */}
          <div className="rounded-md p-3 space-y-2" style={{ background: 'var(--surface-0)' }}>
            <div className="flex items-center justify-between">
              <span className="text-tag" style={{ color: 'var(--text-tertiary)' }}>Disc</span>
              <span className="text-tag font-mono" style={{ color: 'var(--text-secondary)' }}>
                {toc?.trackCount ?? 0} track{(toc?.trackCount ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Capacity bar */}
            <div className="space-y-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(usedPercent, 100)}%`, background: 'var(--pillar-transfer)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDuration(usedSeconds)} used
                </span>
                <span className="text-tag font-mono" style={{ color: 'var(--success)' }}>
                  {formatDuration(Math.max(0, freeSeconds))} free
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={disconnect} className="w-full" style={{ color: 'var(--text-tertiary)' }}>
            <Unplug size={14} />
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}

