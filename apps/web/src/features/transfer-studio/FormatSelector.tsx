import { Badge } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { MD_80_CAPACITY, FORMAT_BITRATES } from '@netmd-studio/types';
import type { TransferFormat } from '@netmd-studio/types';
import { useTransferStore } from './store';

const FORMAT_OPTIONS: Array<{
  value: TransferFormat;
  label: string;
  description: string;
  badge: 'cyan' | 'magenta' | 'amber';
  disabled: boolean;
  disabledReason?: string;
}> = [
  {
    value: 'sp',
    label: 'SP',
    description: `ATRAC1 · ${FORMAT_BITRATES.sp} kbps · ${MD_80_CAPACITY.sp.label}`,
    badge: 'cyan',
    disabled: false,
  },
  {
    value: 'lp2',
    label: 'LP2',
    description: `ATRAC3 · ${FORMAT_BITRATES.lp2} kbps · ${MD_80_CAPACITY.lp2.label}`,
    badge: 'magenta',
    disabled: true,
    disabledReason: 'Coming soon — requires ATRAC WASM encoder',
  },
  {
    value: 'lp4',
    label: 'LP4',
    description: `ATRAC3 · ${FORMAT_BITRATES.lp4} kbps · ${MD_80_CAPACITY.lp4.label}`,
    badge: 'amber',
    disabled: true,
    disabledReason: 'Coming soon — requires ATRAC WASM encoder',
  },
];

export function FormatSelector() {
  const selectedFormat = useTransferStore((s) => s.selectedFormat);
  const setSelectedFormat = useTransferStore((s) => s.setSelectedFormat);
  const tracks = useTransferStore((s) => s.tracks);
  const toc = useTransferStore((s) => s.toc);

  const totalQueuedDuration = tracks
    .filter((t) => t.status !== 'done' && t.status !== 'error')
    .reduce((sum, t) => sum + t.duration, 0);

  const usedSeconds = toc?.usedSeconds ?? 0;

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <h3 className="text-nav font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Transfer Format</h3>
      <div className="space-y-2">
        {FORMAT_OPTIONS.map((opt) => {
          const isSelected = selectedFormat === opt.value;
          const capacity = MD_80_CAPACITY[opt.value].totalSeconds;
          const remaining = capacity - usedSeconds - totalQueuedDuration;

          return (
            <div key={opt.value} className="relative group">
              <button
                onClick={() => !opt.disabled && setSelectedFormat(opt.value)}
                disabled={opt.disabled}
                className="w-full text-left px-3 py-2.5 rounded-md transition-colors"
                style={
                  opt.disabled
                    ? { border: '1px solid var(--border)', background: 'var(--surface-0)', opacity: 0.4, cursor: 'not-allowed' }
                    : isSelected
                      ? { border: '1px solid var(--border-accent)', background: 'var(--accent-dim)' }
                      : { border: '1px solid var(--border)', background: 'var(--surface-0)' }
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={opt.badge}>{opt.label}</Badge>
                  <span
                    className="text-tag font-mono"
                    style={{ color: remaining < 0 ? 'var(--error)' : 'var(--text-tertiary)' }}
                  >
                    {formatDuration(Math.max(0, remaining))} remaining
                  </span>
                </div>
                <p className="text-tag" style={{ color: 'var(--text-tertiary)' }}>{opt.description}</p>
              </button>
              {opt.disabled && opt.disabledReason && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 rounded text-tag whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {opt.disabledReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
