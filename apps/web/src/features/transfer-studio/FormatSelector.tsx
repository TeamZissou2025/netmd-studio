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
}> = [
  {
    value: 'sp',
    label: 'SP',
    description: `ATRAC1 · ${FORMAT_BITRATES.sp} kbps · ${MD_80_CAPACITY.sp.label}`,
    badge: 'cyan',
  },
  {
    value: 'lp2',
    label: 'LP2',
    description: `ATRAC3 · ${FORMAT_BITRATES.lp2} kbps · ${MD_80_CAPACITY.lp2.label}`,
    badge: 'magenta',
  },
  {
    value: 'lp4',
    label: 'LP4',
    description: `ATRAC3 · ${FORMAT_BITRATES.lp4} kbps · ${MD_80_CAPACITY.lp4.label}`,
    badge: 'amber',
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
    <div className="bg-studio-surface border border-studio-border rounded-studio-lg p-4">
      <h3 className="text-sm font-semibold text-studio-text mb-3">Transfer Format</h3>
      <div className="space-y-2">
        {FORMAT_OPTIONS.map((opt) => {
          const isSelected = selectedFormat === opt.value;
          const capacity = MD_80_CAPACITY[opt.value].totalSeconds;
          const remaining = capacity - usedSeconds - totalQueuedDuration;

          return (
            <button
              key={opt.value}
              onClick={() => setSelectedFormat(opt.value)}
              className={`w-full text-left px-3 py-2.5 rounded-studio border transition-colors ${
                isSelected
                  ? 'border-studio-cyan-border bg-studio-cyan-muted'
                  : 'border-studio-border bg-studio-black hover:border-studio-border-bright'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant={opt.badge}>{opt.label}</Badge>
                <span className={`text-2xs font-mono ${remaining < 0 ? 'text-studio-error' : 'text-studio-text-dim'}`}>
                  {formatDuration(Math.max(0, remaining))} remaining
                </span>
              </div>
              <p className="text-2xs text-studio-text-dim">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
