import { Badge } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { MD_80_CAPACITY, FORMAT_BITRATES, spSecondsToFormat } from '@netmd-studio/types';
import type { TransferFormat } from '@netmd-studio/types';
import { useTransferStore } from './store';

const FORMAT_OPTIONS: Array<{
  value: TransferFormat;
  label: string;
  codec: string;
  badge: 'cyan' | 'magenta' | 'amber';
}> = [
  { value: 'sp', label: 'SP', codec: `ATRAC1 · ${FORMAT_BITRATES.sp} kbps`, badge: 'cyan' },
  { value: 'lp2', label: 'LP2', codec: `ATRAC3 · ${FORMAT_BITRATES.lp2} kbps`, badge: 'magenta' },
  { value: 'lp4', label: 'LP4', codec: `ATRAC3 · ${FORMAT_BITRATES.lp4} kbps`, badge: 'amber' },
];

export function FormatSelector() {
  const selectedFormat = useTransferStore((s) => s.selectedFormat);
  const setSelectedFormat = useTransferStore((s) => s.setSelectedFormat);
  const tracks = useTransferStore((s) => s.tracks);
  const toc = useTransferStore((s) => s.toc);

  const totalQueuedDuration = tracks
    .filter((t) => t.status !== 'done' && t.status !== 'error')
    .reduce((sum, t) => sum + t.duration, 0);

  const discFree = toc?.freeSeconds ?? 0;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <h3 className="text-nav font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Transfer Format</h3>
      <div className="space-y-1.5">
        {FORMAT_OPTIONS.map((opt) => {
          const isSelected = selectedFormat === opt.value;
          const freeForFormat = discFree > 0
            ? spSecondsToFormat(discFree, opt.value)
            : MD_80_CAPACITY[opt.value].totalSeconds;
          const remaining = freeForFormat - totalQueuedDuration;

          const remainingColor = remaining <= 0
            ? 'var(--error)'
            : remaining < 300
              ? 'var(--warning)'
              : isSelected ? 'var(--accent)' : 'var(--text-tertiary)';

          const remainingLabel = remaining <= 0
            ? 'Full'
            : `${formatDuration(remaining)} free`;

          return (
            <button
              key={opt.value}
              onClick={() => setSelectedFormat(opt.value)}
              className="w-full text-left rounded-md transition-all duration-150"
              style={
                isSelected
                  ? {
                      border: '1px solid var(--border-accent)',
                      background: 'var(--accent-dim)',
                      padding: '10px 12px',
                    }
                  : {
                      border: '1px solid transparent',
                      background: 'transparent',
                      padding: '6px 12px',
                      opacity: 0.6,
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={opt.badge}>{opt.label}</Badge>
                  {isSelected && (
                    <span className="text-tag" style={{ color: 'var(--text-tertiary)' }}>{opt.codec}</span>
                  )}
                </div>
                <span
                  className="font-mono"
                  style={{
                    color: remainingColor,
                    fontSize: isSelected ? '12px' : '10px',
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  {remainingLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
