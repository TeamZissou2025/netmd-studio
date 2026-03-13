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

  // Calculate capacity based on format
  const totalCapacity = toc ? getCapacitySeconds(selectedFormat) : 0;
  const usedSeconds = toc?.usedSeconds ?? 0;
  const freeSeconds = totalCapacity - usedSeconds;
  const usedPercent = totalCapacity > 0 ? (usedSeconds / totalCapacity) * 100 : 0;

  return (
    <div className="bg-studio-surface border border-studio-border rounded-studio-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-studio-text flex items-center gap-2">
          <Disc3 size={16} className="text-studio-magenta" />
          Device
        </h3>
        {isConnected && (
          <button
            onClick={refreshTOC}
            className="text-studio-text-dim hover:text-studio-text transition-colors"
            title="Refresh disc info"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-10 h-10 rounded-full bg-studio-surface-hover flex items-center justify-center">
            {isConnecting ? (
              <Loader2 size={20} className="text-studio-magenta animate-spin" />
            ) : (
              <Unplug size={20} className="text-studio-text-dim" />
            )}
          </div>
          <p className="text-xs text-studio-text-muted text-center">
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
            <div className="w-8 h-8 rounded-studio bg-studio-magenta-muted flex items-center justify-center shrink-0">
              <Usb size={16} className="text-studio-magenta" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-studio-text truncate">
                {deviceInfo?.name ?? 'Unknown Device'}
              </p>
              <p className="text-2xs text-studio-text-dim font-mono">
                {deviceInfo?.manufacturer}
                {deviceInfo ? ` · ${deviceInfo.isHiMD ? 'Hi-MD' : 'Net MD'}` : ''}
              </p>
              {deviceInfo?.modelNumber && (
                <Link
                  to={`/devices?search=${encodeURIComponent(deviceInfo.modelNumber)}`}
                  className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors flex items-center gap-0.5 mt-0.5"
                >
                  <ExternalLink size={9} /> View specs
                </Link>
              )}
            </div>
          </div>

          {/* Disc info */}
          <div className="bg-studio-black rounded-studio p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-studio-text-dim">Disc</span>
              <span className="text-2xs font-mono text-studio-text-muted">
                {toc?.trackCount ?? 0} track{(toc?.trackCount ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Capacity bar */}
            <div className="space-y-1">
              <div className="h-1.5 bg-studio-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-studio-magenta rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono text-studio-text-dim">
                  {formatDuration(usedSeconds)} used
                </span>
                <span className="text-2xs font-mono text-studio-success">
                  {formatDuration(Math.max(0, freeSeconds))} free
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={disconnect} className="w-full text-studio-text-dim">
            <Unplug size={14} />
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}

function getCapacitySeconds(format: 'sp' | 'lp2' | 'lp4'): number {
  switch (format) {
    case 'sp': return 4800;
    case 'lp2': return 9600;
    case 'lp4': return 19200;
  }
}
