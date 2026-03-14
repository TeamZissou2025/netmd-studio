import { Link } from 'react-router';
import { Usb, Unplug, RefreshCw, Disc3, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { spSecondsToFormat } from '@netmd-studio/types';
import { useDeviceConnection } from './useDeviceConnection';
import { useTransferStore } from './store';

export function DeviceConnectionPanel() {
  const { connectionStatus, deviceInfo, toc, connect, disconnect, refreshTOC } = useDeviceConnection();
  const selectedFormat = useTransferStore((s) => s.selectedFormat);
  const tracks = useTransferStore((s) => s.tracks);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  // Device reports capacity in SP-equivalent seconds.
  // Used time is format-independent (already recorded on disc).
  // Free time converts to selected format (same bytes = more time at lower bitrate).
  const spTotal = toc?.totalSeconds ?? 0;
  const spUsed = toc?.usedSeconds ?? 0;
  const spFree = toc?.freeSeconds ?? 0;

  const freeForFormat = spSecondsToFormat(spFree, selectedFormat);

  // Queued duration: sum of non-done, non-error tracks
  const queuedDuration = tracks
    .filter((t) => t.status !== 'done' && t.status !== 'error')
    .reduce((sum, t) => sum + t.duration, 0);

  // Bar percentages (based on physical byte ratio — format-independent)
  const usedPercent = spTotal > 0 ? (spUsed / spTotal) * 100 : 0;
  // Queued percent: convert queued duration (in real seconds) back to SP-equivalent
  // to get the byte-proportional bar width.
  const spQueuedEquiv = spTotal > 0
    ? queuedDuration / (spSecondsToFormat(spTotal, selectedFormat)) * spTotal
    : 0;
  const queuedPercent = spTotal > 0 ? (spQueuedEquiv / spTotal) * 100 : 0;
  // Clamp so used + queued doesn't exceed 100%
  const clampedQueued = Math.min(queuedPercent, 100 - usedPercent);

  // Remaining free time after queued tracks
  const remainingFree = Math.max(0, freeForFormat - queuedDuration);

  // Free time color: cyan normally, warning < 5 min, error at 0
  const freeColor = remainingFree <= 0
    ? 'var(--error)'
    : remainingFree < 300
      ? 'var(--warning)'
      : 'var(--accent)';

  const freeLabel = remainingFree <= 0
    ? 'Disc full'
    : `${formatDuration(remainingFree)} free`;

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
            className="transition-all duration-300"
            style={{ color: 'var(--text-tertiary)' }}
            title="Refresh disc info"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
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

            {/* 3-segment capacity bar: used (magenta) | queued (cyan 50%) | free (gap) */}
            <div className="space-y-1">
              <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: 'var(--surface-2)' }}>
                {/* Used portion */}
                <div
                  className="h-full transition-[width] duration-300 shrink-0"
                  style={{
                    width: `${Math.min(usedPercent, 100)}%`,
                    background: 'var(--pillar-transfer)',
                    borderRadius: clampedQueued > 0 ? '9999px 0 0 9999px' : '9999px',
                  }}
                />
                {/* Queued portion */}
                {clampedQueued > 0.1 && (
                  <div
                    className="h-full transition-[width] duration-300 shrink-0"
                    style={{
                      width: `${clampedQueued}%`,
                      background: 'var(--accent)',
                      opacity: 0.5,
                      borderRadius: usedPercent > 0 ? '0 9999px 9999px 0' : '9999px',
                    }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDuration(spUsed)} used
                </span>
                <span className="text-tag font-mono" style={{ color: freeColor }}>
                  {freeLabel}
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
